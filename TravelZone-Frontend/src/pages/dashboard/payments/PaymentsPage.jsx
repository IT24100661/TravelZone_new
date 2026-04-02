import { useEffect, useRef, useState } from "react";
import api from "../../../api/axios";
import { useAuth } from "../../../auth/AuthContext";
import {
  CreditCard, CheckCircle, AlertCircle,
  Plus, X, ChevronDown, Loader2,
  Upload, FileText, Image, Trash2, Lock, Eye, EyeOff
} from "lucide-react";

const STATUS_STYLE = {
  COMPLETED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Completed" },
  PENDING:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   label: "Pending" },
  FAILED:    { bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200",     label: "Failed" },
  REFUNDED:  { bg: "bg-slate-100",  text: "text-slate-600",   border: "border-slate-200",   label: "Refunded" },
};

const METHODS = ["CREDIT_CARD", "DEBIT_CARD", "PAYPAL", "CASH", "BANK_TRANSFER"];

function formatCardNumber(val) {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(val) {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

function FileIcon({ type }) {
  if (type?.startsWith("image/")) return <Image size={20} className="text-blue-500" />;
  return <FileText size={20} className="text-orange-500" />;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const isTourist = user?.role === "TOURIST";
  const isGuide   = user?.role === "GUIDE";
  const slipInputRef = useRef(null);

  const [payments, setPayments]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [guideBookings, setGuideBookings]             = useState([]);
  const [reservations, setReservations]               = useState([]);
  const [loadingBookings, setLoadingBookings]         = useState(false);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [selectedBooking, setSelectedBooking]         = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const [cardDetails, setCardDetails] = useState({
    cardholderName: "", cardNumber: "", expiry: "", cvv: "",
  });
  const [showCvv, setShowCvv] = useState(false);
  const [cardErrors, setCardErrors] = useState({});

  const [slipFile, setSlipFile]   = useState(null);
  const [slipError, setSlipError] = useState("");

  const [form, setForm] = useState({
    paymentType: "GUIDE_BOOKING",
    referenceId: "",
    amount: "",
    paymentMethod: "CREDIT_CARD",
    transactionNote: "",
  });

  const isCardMethod   = ["CREDIT_CARD", "DEBIT_CARD"].includes(form.paymentMethod);
  const isBankTransfer = form.paymentMethod === "BANK_TRANSFER";

  // ── ✅ UPDATED: fetchGuideBookings — excludes already-paid bookings ─────────
  const fetchGuideBookings = async () => {
    setLoadingBookings(true);
    try {
      const [bookingsRes, paymentsRes] = await Promise.all([
        api.get("/api/guide-bookings/my-bookings"),
        api.get("/api/payments/my-payments"),
      ]);

      // Build set of booking IDs that already have a payment
      const paidBookingIds = new Set(
        (paymentsRes.data || [])
          .filter((p) => p.paymentType === "GUIDE_BOOKING")
          .map((p) => Number(p.referenceId))
      );

      const confirmed = (bookingsRes.data || []).filter(
        (b) =>
          b.status === "CONFIRMED" &&
          !paidBookingIds.has(Number(b.bookingId ?? b.id))
      );

      const sorted = [...confirmed].sort((a, b) => {
        const timeDiff = new Date(a.createdAt) - new Date(b.createdAt);
        if (timeDiff !== 0) return timeDiff;
        return a.bookingDate < b.bookingDate ? -1 : 1;
      });

      const groups = [];
      let current = null;
      for (const booking of sorted) {
        const created = new Date(booking.createdAt).getTime();
        const guideName = booking.guideName || booking.guideUserName || "—";
        const withinWindow =
          current &&
          current.guideName === guideName &&
          Math.abs(created - current.firstCreatedAt) < 15000;
        if (withinWindow) {
          current.bookings.push(booking);
          current.totalPrice = parseFloat(current.totalPrice) + parseFloat(booking.totalPrice);
          if (booking.bookingDate < current.startDate) current.startDate = booking.bookingDate;
          if (booking.bookingDate > current.endDate)   current.endDate   = booking.bookingDate;
        } else {
          if (current) groups.push(current);
          current = {
            groupId: booking.bookingId, primaryBookingId: booking.bookingId,
            guideName, startDate: booking.bookingDate, endDate: booking.bookingDate,
            totalPrice: parseFloat(booking.totalPrice), firstCreatedAt: created,
            bookings: [booking], status: booking.status,
          };
        }
      }
      if (current) groups.push(current);
      setGuideBookings(groups);
    } catch {
      setGuideBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  // ── ✅ UPDATED: fetchReservations — excludes already-paid reservations ──────
  const fetchReservations = async () => {
    setLoadingReservations(true);
    try {
      const [reservationsRes, paymentsRes] = await Promise.all([
        api.get("/api/reservations/my-reservations"),
        api.get("/api/payments/my-payments"),
      ]);

      // Build set of reservation IDs that already have a payment
      const paidReservationIds = new Set(
        (paymentsRes.data || [])
          .filter((p) => p.paymentType === "HOTEL_RESERVATION")
          .map((p) => Number(p.referenceId))
      );

      const confirmed = (reservationsRes.data || []).filter(
        (r) =>
          r.status === "CONFIRMED" &&
          !paidReservationIds.has(Number(r.reservationId ?? r.id))
      );

      setReservations(confirmed);
    } catch {
      setReservations([]);
    } finally {
      setLoadingReservations(false);
    }
  };

  const endpoint = isTourist ? "/api/payments/my-payments"
    : isGuide ? "/api/payments/guide-payments"
    : "/api/payments/hotel-payments";

  const fetchPayments = () => {
    setLoading(true);
    api.get(endpoint).then((res) => setPayments(res.data))
      .catch(() => setPayments([])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, []);
  useEffect(() => {
    if (showForm && isTourist) {
      fetchGuideBookings();
      fetchReservations();
    }
  }, [showForm]);

  const resetPaymentMethodFields = () => {
    setCardDetails({ cardholderName: "", cardNumber: "", expiry: "", cvv: "" });
    setCardErrors({});
    setSlipFile(null);
    setSlipError("");
  };

  const handleTypeChange = (type) => {
    setForm((p) => ({ ...p, paymentType: type, referenceId: "", amount: "" }));
    setSelectedBooking(null); setSelectedReservation(null);
  };

  const handleMethodChange = (method) => {
    setForm((p) => ({ ...p, paymentMethod: method }));
    resetPaymentMethodFields();
  };

  const selectGuideBooking = (group) => {
    setSelectedBooking(group);
    setForm((p) => ({ ...p, referenceId: group.primaryBookingId, amount: group.totalPrice.toFixed(2) }));
  };

  const selectReservation = (r) => {
    setSelectedReservation(r);
    setForm((p) => ({
      ...p,
      referenceId: r.reservationId ?? r.id,
      amount: r.totalPrice ? String(r.totalPrice) : p.amount,
    }));
  };

  const validateCard = () => {
    const errs = {};
    if (!cardDetails.cardholderName.trim()) errs.cardholderName = "Cardholder name is required";
    const digits = cardDetails.cardNumber.replace(/\s/g, "");
    if (digits.length !== 16) errs.cardNumber = "Card number must be 16 digits";
    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
      errs.expiry = "Expiry must be MM/YY";
    } else {
      const [mm, yy] = cardDetails.expiry.split("/");
      const exp = new Date(2000 + parseInt(yy), parseInt(mm) - 1);
      if (exp < new Date()) errs.expiry = "Card has expired";
    }
    if (!/^\d{3,4}$/.test(cardDetails.cvv)) errs.cvv = "CVV must be 3–4 digits";
    setCardErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSlipChange = (e) => {
    setSlipError("");
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) { setSlipError("Only JPG, PNG, GIF, WEBP, or PDF files are allowed"); return; }
    if (file.size > 5 * 1024 * 1024) { setSlipError("File must be under 5 MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSlipFile({ name: file.name, type: file.type, size: file.size, base64: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (isCardMethod && !validateCard()) return;
    if (isBankTransfer && !slipFile) { setSlipError("Please upload the bank transfer slip"); return; }

    let transactionNote = form.transactionNote || "";
    if (isCardMethod) {
      const masked = "**** **** **** " + cardDetails.cardNumber.replace(/\s/g, "").slice(-4);
      transactionNote = `Card: ${masked} | Holder: ${cardDetails.cardholderName} | Exp: ${cardDetails.expiry}`;
    } else if (isBankTransfer) {
      transactionNote = `BANK_SLIP::${slipFile.name}::${slipFile.base64}`;
    }

    setSubmitting(true);
    try {
      await api.post("/api/payments", {
        paymentType:     form.paymentType,
        referenceId:     Number(form.referenceId),
        amount:          parseFloat(form.amount),
        paymentMethod:   form.paymentMethod,
        transactionNote,
      });
      setSuccess("Payment submitted successfully!");
      setShowForm(false);
      setSelectedBooking(null); setSelectedReservation(null);
      resetPaymentMethodFields();
      setForm({ paymentType: "GUIDE_BOOKING", referenceId: "", amount: "", paymentMethod: "CREDIT_CARD", transactionNote: "" });
      fetchPayments();
    } catch (err) {
      setError(err?.response?.data?.message || "Payment failed.");
    } finally { setSubmitting(false); }
  };

  const total = payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const lkr = (amount) =>
    `LKR ${parseFloat(amount).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            {isTourist ? "My Payments" : isGuide ? "Payments Received" : "Hotel Payments"}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {isTourist ? "All payments you have made for bookings and reservations"
              : "Payments tourists made for your services"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 text-center">
            <p className="text-xs text-slate-400">Total</p>
            <p className="text-xl font-black text-emerald-600">{lkr(total)}</p>
          </div>
          {isTourist && (
            <button
              onClick={() => {
                setShowForm((s) => !s);
                setError(""); setSuccess("");
                setSelectedBooking(null); setSelectedReservation(null);
                resetPaymentMethodFields();
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

      {/* ── Alerts ──────────────────────────────────────────────────────── */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
          <CheckCircle size={15} /> {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* ── Payment Form ──────────────────────────────────────────────────── */}
      {showForm && isTourist && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 mb-5">New Payment</h2>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Payment type toggle */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Payment Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "GUIDE_BOOKING",     label: "Guide Booking",     icon: "🧭" },
                  { value: "HOTEL_RESERVATION", label: "Hotel Reservation", icon: "🏨" },
                ].map((opt) => (
                  <button key={opt.value} type="button" onClick={() => handleTypeChange(opt.value)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition ${
                      form.paymentType === opt.value
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300"
                    }`}>
                    <span>{opt.icon}</span> {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Guide Booking selector ────────────────────────────────── */}
            {form.paymentType === "GUIDE_BOOKING" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Guide Booking <span className="text-slate-400 font-normal">(CONFIRMED · unpaid only)</span>
                </label>
                {loadingBookings ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm py-3">
                    <Loader2 size={15} className="animate-spin" /> Loading your bookings...
                  </div>
                ) : guideBookings.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm">
                    No unpaid confirmed guide bookings found.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {guideBookings.map((group) => {
                      const id = group.primaryBookingId;
                      const isSelected = selectedBooking?.primaryBookingId === id;
                      const isMultiDay = group.startDate !== group.endDate;
                      const dateLabel = isMultiDay ? `${group.startDate} → ${group.endDate}` : group.startDate;
                      const dayCount = group.bookings.length;
                      const pricePerDay = group.bookings[0]?.totalPrice ? parseFloat(group.bookings[0].totalPrice) : null;
                      return (
                        <button key={id} type="button" onClick={() => selectGuideBooking(group)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition ${
                            isSelected ? "bg-blue-50 border-blue-400 shadow-sm"
                              : "bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                          }`}>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                              Booking #{id}
                              {isMultiDay && (
                                <span className="bg-indigo-50 text-indigo-600 border border-indigo-200 px-1.5 py-0.5 rounded-md text-xs font-semibold">
                                  {dayCount} days
                                </span>
                              )}
                            </p>
                            <p className="text-slate-400 text-xs mt-0.5">Guide: {group.guideName} · {dateLabel}</p>
                          </div>
                          <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                            <span className="text-emerald-600 font-bold text-sm">{lkr(group.totalPrice)}</span>
                            {isMultiDay && pricePerDay && (
                              <span className="text-slate-400 text-xs">{dayCount} × {lkr(pricePerDay)}</span>
                            )}
                            {isSelected && <CheckCircle size={14} className="text-blue-500 mt-0.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {selectedBooking && (
                  <div className="mt-2 flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl text-xs text-blue-700 font-medium">
                    <CheckCircle size={13} />
                    Booking #{selectedBooking.primaryBookingId} selected
                    {selectedBooking.bookings?.length > 1 && <span className="text-blue-500">· {selectedBooking.bookings.length} days</span>}
                    <button type="button"
                      onClick={() => { setSelectedBooking(null); setForm((p) => ({ ...p, referenceId: "", amount: "" })); }}
                      className="ml-auto text-blue-400 hover:text-blue-600">
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Hotel Reservation selector ────────────────────────────── */}
            {form.paymentType === "HOTEL_RESERVATION" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Hotel Reservation <span className="text-slate-400 font-normal">(CONFIRMED · unpaid only)</span>
                </label>
                {loadingReservations ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm py-3">
                    <Loader2 size={15} className="animate-spin" /> Loading your reservations...
                  </div>
                ) : reservations.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm">
                    No unpaid confirmed hotel reservations found.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {reservations.map((r) => {
                      const id = r.reservationId ?? r.id;
                      const isSelected = selectedReservation &&
                        (selectedReservation.reservationId ?? selectedReservation.id) === id;
                      return (
                        <button key={id} type="button" onClick={() => selectReservation(r)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition ${
                            isSelected ? "bg-blue-50 border-blue-400 shadow-sm"
                              : "bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                          }`}>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{r.hotelName || "Hotel"} — #{id}</p>
                            <p className="text-slate-400 text-xs mt-0.5">{r.roomType && `${r.roomType} · `}{r.checkIn} → {r.checkOut}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {r.totalPrice && <span className="text-emerald-600 font-bold text-sm">{lkr(r.totalPrice)}</span>}
                            {isSelected && <CheckCircle size={16} className="text-blue-500" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {selectedReservation && (
                  <div className="mt-2 flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl text-xs text-blue-700 font-medium">
                    <CheckCircle size={13} />
                    Reservation #{selectedReservation.reservationId ?? selectedReservation.id} selected
                    <button type="button"
                      onClick={() => { setSelectedReservation(null); setForm((p) => ({ ...p, referenceId: "", amount: "" })); }}
                      className="ml-auto text-blue-400 hover:text-blue-600">
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Amount + Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (LKR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium select-none">LKR</span>
                  <input type="number" step="0.01" min="0.01" value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                    required placeholder="0.00"
                    className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-2.5 outline-none focus:border-blue-400 text-sm" />
                </div>
                {(selectedBooking || selectedReservation) && form.amount && (
                  <p className="text-xs text-emerald-600 mt-1 font-medium">✓ Auto-filled from booking total</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method</label>
                <div className="relative">
                  <select value={form.paymentMethod} onChange={(e) => handleMethodChange(e.target.value)}
                    className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 text-sm pr-9">
                    {METHODS.map((m) => <option key={m} value={m}>{m.replace(/_/g, " ")}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                </div>
              </div>
            </div>

            {/* ── Card details ─────────────────────────────────────────── */}
            {isCardMethod && (
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-100 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard size={16} className="text-blue-500" />
                  <span className="text-sm font-bold text-slate-700">Card Details</span>
                  <span className="flex items-center gap-1 ml-auto text-xs text-slate-400">
                    <Lock size={11} /> Secure entry
                  </span>
                </div>

                {/* Visual card preview */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-200 mb-2">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-semibold opacity-70 uppercase tracking-widest">
                      {form.paymentMethod === "CREDIT_CARD" ? "Credit Card" : "Debit Card"}
                    </span>
                    <div className="flex gap-1">
                      <div className="w-7 h-5 rounded-full bg-yellow-400 opacity-90" />
                      <div className="w-7 h-5 rounded-full bg-orange-500 opacity-70 -ml-3" />
                    </div>
                  </div>
                  <p className="font-mono text-lg tracking-widest mb-4">
                    {cardDetails.cardNumber || "**** **** **** ****"}
                  </p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs opacity-60 uppercase tracking-wide mb-0.5">Cardholder</p>
                      <p className="text-sm font-semibold truncate max-w-[140px]">
                        {cardDetails.cardholderName || "YOUR NAME"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-60 uppercase tracking-wide mb-0.5">Expires</p>
                      <p className="text-sm font-semibold">{cardDetails.expiry || "MM/YY"}</p>
                    </div>
                  </div>
                </div>

                {/* Cardholder name */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Cardholder Name *</label>
                  <input type="text" value={cardDetails.cardholderName}
                    onChange={(e) => setCardDetails((p) => ({ ...p, cardholderName: e.target.value.toUpperCase() }))}
                    placeholder="AS ON CARD"
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${
                      cardErrors.cardholderName ? "border-red-400 bg-red-50" : "border-slate-200 focus:border-blue-400"
                    }`} />
                  {cardErrors.cardholderName && <p className="text-red-500 text-xs mt-1">{cardErrors.cardholderName}</p>}
                </div>

                {/* Card number */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Card Number *</label>
                  <input type="text" inputMode="numeric" value={cardDetails.cardNumber}
                    onChange={(e) => setCardDetails((p) => ({ ...p, cardNumber: formatCardNumber(e.target.value) }))}
                    placeholder="1234 5678 9012 3456" maxLength={19}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono outline-none transition ${
                      cardErrors.cardNumber ? "border-red-400 bg-red-50" : "border-slate-200 focus:border-blue-400"
                    }`} />
                  {cardErrors.cardNumber && <p className="text-red-500 text-xs mt-1">{cardErrors.cardNumber}</p>}
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Expiry Date *</label>
                    <input type="text" inputMode="numeric" value={cardDetails.expiry}
                      onChange={(e) => setCardDetails((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                      placeholder="MM/YY" maxLength={5}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${
                        cardErrors.expiry ? "border-red-400 bg-red-50" : "border-slate-200 focus:border-blue-400"
                      }`} />
                    {cardErrors.expiry && <p className="text-red-500 text-xs mt-1">{cardErrors.expiry}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">CVV *</label>
                    <div className="relative">
                      <input type={showCvv ? "text" : "password"} inputMode="numeric"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                        placeholder="•••"
                        className={`w-full border rounded-xl px-4 py-2.5 pr-10 text-sm outline-none transition ${
                          cardErrors.cvv ? "border-red-400 bg-red-50" : "border-slate-200 focus:border-blue-400"
                        }`} />
                      <button type="button" tabIndex={-1} onClick={() => setShowCvv((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showCvv ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {cardErrors.cvv && <p className="text-red-500 text-xs mt-1">{cardErrors.cvv}</p>}
                  </div>
                </div>

                <p className="text-xs text-slate-400 flex items-center gap-1 pt-1">
                  <Lock size={11} /> Your card details are only used for this transaction and are not stored.
                </p>
              </div>
            )}

            {/* ── Bank transfer slip ────────────────────────────────────── */}
            {isBankTransfer && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Upload size={16} className="text-slate-500" />
                  <span className="text-sm font-bold text-slate-700">Upload Bank Transfer Slip</span>
                  <span className="ml-auto text-xs text-slate-400">JPG, PNG, PDF · max 5 MB</span>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700 space-y-1">
                  <p className="font-semibold">Transfer to:</p>
                  <p>Bank: Commercial Bank of Ceylon</p>
                  <p>Account: TravelZone (Pvt) Ltd — 1234567890</p>
                  <p>Branch: Colombo 03</p>
                  <p>Reference: Your name + Booking ID</p>
                </div>

                {!slipFile ? (
                  <div
                    onClick={() => slipInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        const dt = new DataTransfer();
                        dt.items.add(file);
                        slipInputRef.current.files = dt.files;
                        handleSlipChange({ target: { files: dt.files } });
                      }
                    }}
                    className="border-2 border-dashed border-slate-300 bg-white rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition group"
                  >
                    <Upload size={28} className="mx-auto text-slate-300 group-hover:text-blue-400 mb-3 transition" />
                    <p className="text-slate-600 font-semibold text-sm">Click or drag file here</p>
                    <p className="text-slate-400 text-xs mt-1">JPG, PNG, GIF, WEBP or PDF · Max 5 MB</p>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <FileIcon type={slipFile.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{slipFile.name}</p>
                      <p className="text-xs text-slate-400">{(slipFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    {slipFile.type.startsWith("image/") && (
                      <img src={slipFile.base64} alt="Slip preview"
                        className="w-14 h-14 object-cover rounded-lg border border-slate-200 flex-shrink-0" />
                    )}
                    <button type="button"
                      onClick={() => { setSlipFile(null); if (slipInputRef.current) slipInputRef.current.value = ""; }}
                      className="flex-shrink-0 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}

                <input ref={slipInputRef} type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,image/*,application/pdf"
                  onChange={handleSlipChange} className="hidden" />

                {slipError && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle size={12} /> {slipError}
                  </p>
                )}
              </div>
            )}

            {/* Note — only for non-card, non-bank methods */}
            {!isCardMethod && !isBankTransfer && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Note <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input type="text" value={form.transactionNote}
                  onChange={(e) => setForm((p) => ({ ...p, transactionNote: e.target.value }))}
                  placeholder="Any note about this payment"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 text-sm" />
              </div>
            )}

            {/* Submit */}
            <button type="submit"
              disabled={submitting || !form.referenceId || !form.amount}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2">
              {submitting
                ? <><Loader2 size={15} className="animate-spin" /> Processing...</>
                : isCardMethod ? "Pay Securely"
                : isBankTransfer ? "Submit Slip & Confirm"
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

      {/* ── Payment list ─────────────────────────────────────────────────── */}
      {payments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
          <CreditCard size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600 font-semibold">No payments found</p>
          <p className="text-slate-400 text-sm mt-1">
            {isTourist ? "Select a confirmed booking above to make your first payment."
              : "Tourist payments will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => {
            const s = STATUS_STYLE[p.status] || STATUS_STYLE.PENDING;
            const hasSlip   = p.transactionNote?.startsWith("BANK_SLIP::");
            const isCardNote = p.transactionNote?.startsWith("Card:");
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
                    <p className="font-black text-xl text-slate-800">{lkr(p.amount)}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${s.bg} ${s.text} ${s.border}`}>
                      {s.label}
                    </span>
                  </div>
                </div>

                {isCardNote && (
                  <p className="text-slate-500 text-xs mt-3 pt-3 border-t border-slate-100 flex items-center gap-1">
                    <Lock size={11} /> {p.transactionNote}
                  </p>
                )}
                {hasSlip && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-700">
                    <FileText size={13} className="text-emerald-500" />
                    Bank slip uploaded: <span className="font-semibold">{p.transactionNote.split("::")[1]}</span>
                  </div>
                )}
                {p.transactionNote && !hasSlip && !isCardNote && (
                  <p className="text-slate-500 text-xs mt-3 pt-3 border-t border-slate-100">{p.transactionNote}</p>
                )}

                <p className="text-slate-400 text-xs mt-2">{new Date(p.createdAt).toLocaleString()}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}