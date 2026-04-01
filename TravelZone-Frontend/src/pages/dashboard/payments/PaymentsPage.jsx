import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { useAuth } from "../../../auth/AuthContext";
import {
  CreditCard, CheckCircle, AlertCircle, DollarSign,
  Plus, X, ChevronDown, Loader2
} from "lucide-react";

const STATUS_STYLE = {
  COMPLETED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Completed" },
  PENDING:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   label: "Pending" },
  FAILED:    { bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200",     label: "Failed" },
  REFUNDED:  { bg: "bg-slate-100",  text: "text-slate-600",   border: "border-slate-200",   label: "Refunded" },
};

const METHODS = ["CREDIT_CARD", "DEBIT_CARD", "PAYPAL", "CASH", "BANK_TRANSFER"];

export default function PaymentsPage() {
  const { user } = useAuth();
  const isTourist = user?.role === "TOURIST";
  const isGuide   = user?.role === "GUIDE";

  const [payments, setPayments]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);

  // ── Auto-suggest state ──────────────────────────────────────────────────────
  const [guideBookings, setGuideBookings]       = useState([]);
  const [reservations, setReservations]         = useState([]);
  const [loadingBookings, setLoadingBookings]   = useState(false);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [selectedBooking, setSelectedBooking]   = useState(null);   // full object
  const [selectedReservation, setSelectedReservation] = useState(null); // full object

  const [form, setForm] = useState({
    paymentType: "GUIDE_BOOKING",
    referenceId: "",
    amount: "",
    paymentMethod: "CREDIT_CARD",
    transactionNote: "",
  });

  // ── Fetch the tourist's confirmed guide bookings ────────────────────────────
  const fetchGuideBookings = async () => {
    setLoadingBookings(true);
    try {
      // Returns tourist's own bookings — filter CONFIRMED in frontend
      const res = await api.get("/api/guide-bookings/my-bookings");
      const confirmed = (res.data || []).filter(
        (b) => b.status === "CONFIRMED"
      );
      setGuideBookings(confirmed);
    } catch {
      setGuideBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  // ── Fetch the tourist's confirmed hotel reservations ───────────────────────
  const fetchReservations = async () => {
    setLoadingReservations(true);
    try {
      // Returns tourist's own reservations — filter CONFIRMED in frontend
      const res = await api.get("/api/reservations/my-reservations");
      const confirmed = (res.data || []).filter(
        (r) => r.status === "CONFIRMED"
      );
      setReservations(confirmed);
    } catch {
      setReservations([]);
    } finally {
      setLoadingReservations(false);
    }
  };

  const endpoint = isTourist
    ? "/api/payments/my-payments"
    : isGuide
    ? "/api/payments/guide-payments"
    : "/api/payments/hotel-payments";

  const fetchPayments = () => {
    setLoading(true);
    api.get(endpoint)
      .then((res) => setPayments(res.data))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, []);

  // When the form opens as tourist, pre-load both lists
  useEffect(() => {
    if (showForm && isTourist) {
      fetchGuideBookings();
      fetchReservations();
    }
  }, [showForm]);

  // When payment type changes, reset selection
  const handleTypeChange = (type) => {
    setForm((p) => ({ ...p, paymentType: type, referenceId: "", amount: "" }));
    setSelectedBooking(null);
    setSelectedReservation(null);
  };

  // Select a guide booking — auto-fill amount from booking price
  const selectGuideBooking = (booking) => {
    setSelectedBooking(booking);
    setForm((p) => ({
      ...p,
      referenceId: booking.bookingId ?? booking.id,
      // Pre-fill amount if the booking has a totalPrice field
      amount: booking.totalPrice ? String(booking.totalPrice) : p.amount,
    }));
  };

  // Select a hotel reservation — auto-fill amount from totalPrice
  const selectReservation = (reservation) => {
    setSelectedReservation(reservation);
    setForm((p) => ({
      ...p,
      referenceId: reservation.reservationId ?? reservation.id,
      amount: reservation.totalPrice ? String(reservation.totalPrice) : p.amount,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setSubmitting(true);
    try {
      await api.post("/api/payments", {
        paymentType: form.paymentType,
        referenceId: Number(form.referenceId),
        amount: parseFloat(form.amount),
        paymentMethod: form.paymentMethod,
        transactionNote: form.transactionNote,
      });
      setSuccess("Payment submitted successfully!");
      setShowForm(false);
      setSelectedBooking(null);
      setSelectedReservation(null);
      setForm({
        paymentType: "GUIDE_BOOKING", referenceId: "",
        amount: "", paymentMethod: "CREDIT_CARD", transactionNote: "",
      });
      fetchPayments();
    } catch (err) {
      setError(err?.response?.data?.message || "Payment failed.");
    } finally {
      setSubmitting(false); }
  };

  const total = payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            {isTourist ? "My Payments" : isGuide ? "Payments Received" : "Hotel Payments"}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {isTourist
              ? "All payments you have made for bookings and reservations"
              : "Payments tourists made for your services"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 text-center">
            <p className="text-xs text-slate-400">Total</p>
            <p className="text-xl font-black text-emerald-600">LKR{total.toFixed(2)}</p>
          </div>
          {isTourist && (
            <button
              onClick={() => {
                setShowForm((s) => !s);
                setError(""); setSuccess("");
                setSelectedBooking(null); setSelectedReservation(null);
                setForm({ paymentType: "GUIDE_BOOKING", referenceId: "", amount: "", paymentMethod: "CREDIT_CARD", transactionNote: "" });
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              {showForm ? <X size={16} /> : <Plus size={16} />}
              {showForm ? "Cancel" : "Make Payment"}
            </button>
          )}
        </div>
      </div>

      {/* ── Alerts ──────────────────────────────────────────────────────────── */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
          <CheckCircle size={15} />{success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
          <AlertCircle size={15} />{error}
        </div>
      )}

      {/* ── Payment Form ─────────────────────────────────────────────────────── */}
      {showForm && isTourist && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 mb-5">New Payment</h2>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Payment type selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "GUIDE_BOOKING",     label: "Guide Booking",     icon: "🧭" },
                  { value: "HOTEL_RESERVATION", label: "Hotel Reservation", icon: "🏨" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleTypeChange(opt.value)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition ${
                      form.paymentType === opt.value
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    <span>{opt.icon}</span> {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Guide Booking selector ─────────────────────────────────── */}
            {form.paymentType === "GUIDE_BOOKING" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Guide Booking
                  <span className="text-slate-400 font-normal ml-1">(CONFIRMED only)</span>
                </label>

                {loadingBookings ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm py-3">
                    <Loader2 size={15} className="animate-spin" /> Loading your bookings...
                  </div>
                ) : guideBookings.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm">
                    No confirmed guide bookings found. A booking must be CONFIRMED before payment.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {guideBookings.map((b) => {
                      const id = b.bookingId ?? b.id;
                      const isSelected = selectedBooking && (selectedBooking.bookingId ?? selectedBooking.id) === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => selectGuideBooking(b)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition ${
                            isSelected
                              ? "bg-blue-50 border-blue-400 shadow-sm"
                              : "bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">
                              Booking #{id}
                            </p>
                            <p className="text-slate-400 text-xs mt-0.5">
                              Guide: {b.guideName || b.guideUserName || "—"} ·{" "}
                              {b.tourDate || b.startDate || b.bookingDate || ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {b.totalPrice && (
                              <span className="text-emerald-600 font-bold text-sm">
                                LKR{parseFloat(b.totalPrice).toFixed(2)}
                              </span>
                            )}
                            {isSelected && (
                              <CheckCircle size={16} className="text-blue-500" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Selected booking summary */}
                {selectedBooking && (
                  <div className="mt-2 flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl text-xs text-blue-700 font-medium">
                    <CheckCircle size={13} />
                    Booking #{selectedBooking.bookingId ?? selectedBooking.id} selected
                    <button
                      type="button"
                      onClick={() => { setSelectedBooking(null); setForm((p) => ({ ...p, referenceId: "", amount: "" })); }}
                      className="ml-auto text-blue-400 hover:text-blue-600"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Hotel Reservation selector ─────────────────────────────── */}
            {form.paymentType === "HOTEL_RESERVATION" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Hotel Reservation
                  <span className="text-slate-400 font-normal ml-1">(CONFIRMED only)</span>
                </label>

                {loadingReservations ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm py-3">
                    <Loader2 size={15} className="animate-spin" /> Loading your reservations...
                  </div>
                ) : reservations.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm">
                    No confirmed hotel reservations found. A reservation must be CONFIRMED before payment.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {reservations.map((r) => {
                      const id = r.reservationId ?? r.id;
                      const isSelected = selectedReservation && (selectedReservation.reservationId ?? selectedReservation.id) === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => selectReservation(r)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition ${
                            isSelected
                              ? "bg-blue-50 border-blue-400 shadow-sm"
                              : "bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">
                              {r.hotelName || "Hotel"} — #{id}
                            </p>
                            <p className="text-slate-400 text-xs mt-0.5">
                              {r.roomType && `${r.roomType} · `}
                              {r.checkIn} → {r.checkOut}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {r.totalPrice && (
                              <span className="text-emerald-600 font-bold text-sm">
                                LKR{parseFloat(r.totalPrice).toFixed(2)}
                              </span>
                            )}
                            {isSelected && (
                              <CheckCircle size={16} className="text-blue-500" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Selected reservation summary */}
                {selectedReservation && (
                  <div className="mt-2 flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl text-xs text-blue-700 font-medium">
                    <CheckCircle size={13} />
                    Reservation #{selectedReservation.reservationId ?? selectedReservation.id} selected
                    <button
                      type="button"
                      onClick={() => { setSelectedReservation(null); setForm((p) => ({ ...p, referenceId: "", amount: "" })); }}
                      className="ml-auto text-blue-400 hover:text-blue-600"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Amount + Payment method row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Amount (LKR)
                </label>
                <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">LKR</span>
  <input
    type="number"
    step="0.01"
    min="0.01"
    value={form.amount}
    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
    required
    placeholder="0.00"
    className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-2.5 outline-none focus:border-blue-400 text-sm"
  />
</div>  
                {(selectedBooking || selectedReservation) && form.amount && (
                  <p className="text-xs text-emerald-600 mt-1 font-medium">
                    ✓ Auto-filled from booking total
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Payment Method
                </label>
                <div className="relative">
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm((p) => ({ ...p, paymentMethod: e.target.value }))}
                    className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 text-sm pr-9"
                  >
                    {METHODS.map((m) => (
                      <option key={m} value={m}>{m.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                </div>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Note <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={form.transactionNote}
                onChange={(e) => setForm((p) => ({ ...p, transactionNote: e.target.value }))}
                placeholder="Any note about this payment"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 text-sm"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !form.referenceId || !form.amount}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              {submitting
                ? <><Loader2 size={15} className="animate-spin" /> Processing...</>
                : "Confirm Payment"}
            </button>

            {!form.referenceId && (
              <p className="text-xs text-slate-400 text-center">
                Select a booking or reservation above to enable payment
              </p>
            )}
          </form>
        </div>
      )}

      {/* ── Payment list ────────────────────────────────────────────────────── */}
      {payments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
          <CreditCard size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600 font-semibold">No payments found</p>
          <p className="text-slate-400 text-sm mt-1">
            {isTourist
              ? "Select a confirmed booking above to make your first payment."
              : "Tourist payments will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => {
            const s = STATUS_STYLE[p.status] || STATUS_STYLE.PENDING;
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <CreditCard size={20} className="text-indigo-500" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        {p.paymentType === "GUIDE_BOOKING" ? "Guide Booking" : "Hotel Reservation"} #{p.referenceId}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {p.touristName} · {p.paymentMethod?.replace(/_/g, " ")} · ID #{p.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-black text-xl text-slate-800">LKR{parseFloat(p.amount).toFixed(2)}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${s.bg} ${s.text} ${s.border}`}>
                      {s.label}
                    </span>
                  </div>
                </div>
                {p.transactionNote && (
                  <p className="text-slate-500 text-xs mt-3 pt-3 border-t border-slate-100">
                    {p.transactionNote}
                  </p>
                )}
                <p className="text-slate-400 text-xs mt-2">
                  {new Date(p.createdAt).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}