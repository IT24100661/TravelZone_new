import { useEffect, useRef, useState } from "react";
import api from "../../../api/axios";
import { useAuth } from "../../../auth/AuthContext";
import {
  CreditCard, CheckCircle, AlertCircle,
  Plus, X, ChevronDown, Loader2,
  Upload, FileText, Image, Trash2, Lock, Eye, EyeOff
} from "lucide-react";

const STATUS_STYLE = {
  COMPLETED: { bg: "rgba(16,185,129,0.1)",  text: "#10b981", border: "rgba(16,185,129,0.25)",  dot: "#10b981", label: "Completed" },
  PENDING:   { bg: "rgba(245,158,11,0.1)",  text: "#f59e0b", border: "rgba(245,158,11,0.25)",  dot: "#f59e0b", label: "Pending"   },
  FAILED:    { bg: "rgba(239,68,68,0.1)",   text: "#ef4444", border: "rgba(239,68,68,0.25)",   dot: "#ef4444", label: "Failed"    },
  REFUNDED:  { bg: "rgba(100,116,139,0.1)", text: "#64748b", border: "rgba(100,116,139,0.25)", dot: "#64748b", label: "Refunded"  },
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
  if (type?.startsWith("image/")) return <Image size={20} style={{ color: "#3b82f6" }} />;
  return <FileText size={20} style={{ color: "#f97316" }} />;
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
  const [showCvv, setShowCvv]     = useState(false);
  const [cardErrors, setCardErrors] = useState({});
  const [slipFile, setSlipFile]   = useState(null);
  const [slipError, setSlipError] = useState("");

  const [form, setForm] = useState({
    paymentType: "GUIDE_BOOKING", referenceId: "",
    amount: "", paymentMethod: "CREDIT_CARD", transactionNote: "",
  });

  const isCardMethod   = ["CREDIT_CARD", "DEBIT_CARD"].includes(form.paymentMethod);
  const isBankTransfer = form.paymentMethod === "BANK_TRANSFER";

  const fetchGuideBookings = async () => {
    setLoadingBookings(true);
    try {
      const [bookingsRes, paymentsRes] = await Promise.all([
        api.get("/api/guide-bookings/my-bookings"),
        api.get("/api/payments/my-payments"),
      ]);
      const paidBookingIds = new Set(
        (paymentsRes.data || [])
          .filter((p) => p.paymentType === "GUIDE_BOOKING")
          .map((p) => Number(p.referenceId))
      );
      const confirmed = (bookingsRes.data || []).filter(
        (b) => b.status === "CONFIRMED" && !paidBookingIds.has(Number(b.bookingId ?? b.id))
      );
      const sorted = [...confirmed].sort((a, b) => {
        const timeDiff = new Date(a.createdAt) - new Date(b.createdAt);
        if (timeDiff !== 0) return timeDiff;
        return a.bookingDate < b.bookingDate ? -1 : 1;
      });
      const groups = [];
      let current = null;
      for (const booking of sorted) {
        const created   = new Date(booking.createdAt).getTime();
        const guideName = booking.guideName || booking.guideUserName || "—";
        const withinWindow =
          current && current.guideName === guideName &&
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
    } catch { setGuideBookings([]); }
    finally { setLoadingBookings(false); }
  };

  const fetchReservations = async () => {
    setLoadingReservations(true);
    try {
      const [reservationsRes, paymentsRes] = await Promise.all([
        api.get("/api/reservations/my-reservations"),
        api.get("/api/payments/my-payments"),
      ]);
      const paidReservationIds = new Set(
        (paymentsRes.data || [])
          .filter((p) => p.paymentType === "HOTEL_RESERVATION")
          .map((p) => Number(p.referenceId))
      );
      const confirmed = (reservationsRes.data || []).filter(
        (r) => r.status === "CONFIRMED" && !paidReservationIds.has(Number(r.reservationId ?? r.id))
      );
      setReservations(confirmed);
    } catch { setReservations([]); }
    finally { setLoadingReservations(false); }
  };

  const endpoint = isTourist ? "/api/payments/my-payments"
    : isGuide ? "/api/payments/guide-payments"
    : "/api/payments/hotel-payments";

  const fetchPayments = () => {
    setLoading(true);
    api.get(endpoint)
      .then((res) => setPayments(res.data))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, []);
  useEffect(() => {
    if (showForm && isTourist) { fetchGuideBookings(); fetchReservations(); }
  }, [showForm]);

  const resetPaymentMethodFields = () => {
    setCardDetails({ cardholderName: "", cardNumber: "", expiry: "", cvv: "" });
    setCardErrors({}); setSlipFile(null); setSlipError("");
  };

  const handleTypeChange   = (type) => {
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
  const selectReservation  = (r) => {
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
      if (new Date(2000 + parseInt(yy), parseInt(mm) - 1) < new Date()) errs.expiry = "Card has expired";
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
    reader.onload = (ev) => setSlipFile({ name: file.name, type: file.type, size: file.size, base64: ev.target.result });
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
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
  const lkr   = (amount) =>
    `LKR ${parseFloat(amount).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  /* ─────────────────────────── shared field style ─────────────────────── */
  const fieldBase = {
    background:  "var(--tz-input-bg)",
    border:      "1px solid var(--tz-border)",
    color:       "var(--tz-text)",
    boxShadow:   "inset 0 2px 6px rgba(0,0,0,0.06)",
    borderRadius: "0.75rem",
    outline:     "none",
    width:       "100%",
    padding:     "0.625rem 1rem",
    fontSize:    "0.875rem",
    transition:  "border-color 0.2s, box-shadow 0.2s",
  };
  const fieldFocusStyle = (hasErr) => hasErr
    ? { ...fieldBase, borderColor: "#ef4444", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.06), 0 0 0 3px rgba(239,68,68,0.12)" }
    : fieldBase;

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--tz-text)" }}>
            {isTourist ? "My Payments" : isGuide ? "Payments Received" : "Hotel Payments"}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--tz-text-muted)" }}>
            {isTourist
              ? "All payments you have made for bookings and reservations"
              : "Payments tourists made for your services"}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Total badge */}
          <div
            className="rounded-2xl px-5 py-3 text-center"
            style={{
              background:  "rgba(16,185,129,0.08)",
              border:      "1px solid rgba(16,185,129,0.2)",
              boxShadow:   "0 3px 0px rgba(16,185,129,0.1)",
            }}
          >
            <p className="text-xs font-medium" style={{ color: "var(--tz-text-faint)" }}>Total</p>
            <p className="text-xl font-black" style={{ color: "#10b981" }}>{lkr(total)}</p>
          </div>

          {/* Make Payment button */}
          {isTourist && (
            <button
              onClick={() => {
                setShowForm((s) => !s);
                setError(""); setSuccess("");
                setSelectedBooking(null); setSelectedReservation(null);
                resetPaymentMethodFields();
                setForm({ paymentType: "GUIDE_BOOKING", referenceId: "", amount: "", paymentMethod: "CREDIT_CARD", transactionNote: "" });
              }}
              className={showForm ? "btn-3d-red" : "btn-3d-blue"}
              style={{ padding: "0.6rem 1.25rem" }}
            >
              {showForm ? <X size={15} /> : <Plus size={15} />}
              <span className="text-sm font-bold">{showForm ? "Cancel" : "Make Payment"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Alerts ── */}
      {success && (
        <div className="rounded-2xl px-4 py-3 text-sm flex items-center gap-2 font-medium"
          style={{ background: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)", boxShadow: "0 2px 0px rgba(16,185,129,0.08)" }}
        >
          <CheckCircle size={15} /> {success}
        </div>
      )}
      {error && (
        <div className="rounded-2xl px-4 py-3 text-sm flex items-center gap-2 font-medium"
          style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", boxShadow: "0 2px 0px rgba(239,68,68,0.08)" }}
        >
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* ── Payment Form ── */}
      {showForm && isTourist && (
        <div
          className="rounded-3xl border p-6"
          style={{
            background:  "var(--tz-card-bg)",
            borderColor: "var(--tz-card-border)",
            boxShadow:   "0 4px 0px rgba(0,0,0,0.08), 0 10px 28px rgba(0,0,0,0.07)",
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center icon-3d flex-shrink-0"
              style={{ boxShadow: "0 3px 0px #1e3a8a, 0 6px 14px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.25)" }}
            >
              <CreditCard size={17} className="text-white" />
            </div>
            <h2 className="font-black text-lg" style={{ color: "var(--tz-text)" }}>New Payment</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Payment type toggle */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--tz-text)" }}>
                Payment Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "GUIDE_BOOKING",     label: "Guide Booking",     icon: "🧭" },
                  { value: "HOTEL_RESERVATION", label: "Hotel Reservation", icon: "🏨" },
                ].map((opt) => {
                  const active = form.paymentType === opt.value;
                  return (
                    <button
                      key={opt.value} type="button"
                      onClick={() => handleTypeChange(opt.value)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all"
                      style={active ? {
                        background:  "linear-gradient(145deg, #1d4ed8, #3b82f6)",
                        color:       "#fff",
                        border:      "1px solid #1d4ed8",
                        boxShadow:   "0 3px 0px #1e3a8a, 0 6px 16px rgba(59,130,246,0.35)",
                        transform:   "translateY(-1px)",
                      } : {
                        background:  "var(--tz-surface-2)",
                        color:       "var(--tz-text-muted)",
                        border:      "1px solid var(--tz-border)",
                        boxShadow:   "0 2px 0px rgba(0,0,0,0.06)",
                      }}
                    >
                      <span>{opt.icon}</span> {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Guide Booking selector ── */}
            {form.paymentType === "GUIDE_BOOKING" && (
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "var(--tz-text)" }}>
                  Select Guide Booking{" "}
                  <span className="font-normal" style={{ color: "var(--tz-text-faint)" }}>(CONFIRMED · unpaid only)</span>
                </label>
                {loadingBookings ? (
                  <div className="flex items-center gap-2 text-sm py-3" style={{ color: "var(--tz-text-muted)" }}>
                    <Loader2 size={15} className="animate-spin" /> Loading your bookings...
                  </div>
                ) : guideBookings.length === 0 ? (
                  <div className="rounded-xl px-4 py-3 text-sm font-medium"
                    style={{ background: "rgba(245,158,11,0.08)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}
                  >
                    No unpaid confirmed guide bookings found.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {guideBookings.map((group) => {
                      const id         = group.primaryBookingId;
                      const isSelected = selectedBooking?.primaryBookingId === id;
                      const isMultiDay = group.startDate !== group.endDate;
                      const dateLabel  = isMultiDay ? `${group.startDate} → ${group.endDate}` : group.startDate;
                      const dayCount   = group.bookings.length;
                      const pricePerDay = group.bookings[0]?.totalPrice ? parseFloat(group.bookings[0].totalPrice) : null;
                      return (
                        <button
                          key={id} type="button"
                          onClick={() => selectGuideBooking(group)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all"
                          style={isSelected ? {
                            background: "rgba(59,130,246,0.08)",
                            border:     "1px solid rgba(59,130,246,0.3)",
                            boxShadow:  "0 2px 0px rgba(59,130,246,0.1)",
                          } : {
                            background: "var(--tz-surface-2)",
                            border:     "1px solid var(--tz-border-soft)",
                            boxShadow:  "0 2px 0px rgba(0,0,0,0.04)",
                          }}
                        >
                          <div>
                            <p className="font-bold text-sm flex items-center gap-2" style={{ color: "var(--tz-text)" }}>
                              Booking #{id}
                              {isMultiDay && (
                                <span className="px-1.5 py-0.5 rounded-md text-xs font-bold"
                                  style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)" }}
                                >
                                  {dayCount} days
                                </span>
                              )}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: "var(--tz-text-faint)" }}>
                              Guide: {group.guideName} · {dateLabel}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                            <span className="font-bold text-sm" style={{ color: "#10b981" }}>{lkr(group.totalPrice)}</span>
                            {isMultiDay && pricePerDay && (
                              <span className="text-xs" style={{ color: "var(--tz-text-faint)" }}>
                                {dayCount} × {lkr(pricePerDay)}
                              </span>
                            )}
                            {isSelected && <CheckCircle size={14} style={{ color: "#3b82f6" }} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {selectedBooking && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: "rgba(59,130,246,0.08)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}
                  >
                    <CheckCircle size={13} />
                    Booking #{selectedBooking.primaryBookingId} selected
                    {selectedBooking.bookings?.length > 1 && (
                      <span style={{ color: "rgba(59,130,246,0.7)" }}>· {selectedBooking.bookings.length} days</span>
                    )}
                    <button type="button"
                      onClick={() => { setSelectedBooking(null); setForm((p) => ({ ...p, referenceId: "", amount: "" })); }}
                      className="ml-auto transition" style={{ color: "rgba(59,130,246,0.6)" }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Hotel Reservation selector ── */}
            {form.paymentType === "HOTEL_RESERVATION" && (
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "var(--tz-text)" }}>
                  Select Hotel Reservation{" "}
                  <span className="font-normal" style={{ color: "var(--tz-text-faint)" }}>(CONFIRMED · unpaid only)</span>
                </label>
                {loadingReservations ? (
                  <div className="flex items-center gap-2 text-sm py-3" style={{ color: "var(--tz-text-muted)" }}>
                    <Loader2 size={15} className="animate-spin" /> Loading your reservations...
                  </div>
                ) : reservations.length === 0 ? (
                  <div className="rounded-xl px-4 py-3 text-sm font-medium"
                    style={{ background: "rgba(245,158,11,0.08)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}
                  >
                    No unpaid confirmed hotel reservations found.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {reservations.map((r) => {
                      const id         = r.reservationId ?? r.id;
                      const isSelected = selectedReservation &&
                        (selectedReservation.reservationId ?? selectedReservation.id) === id;
                      return (
                        <button
                          key={id} type="button"
                          onClick={() => selectReservation(r)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all"
                          style={isSelected ? {
                            background: "rgba(59,130,246,0.08)",
                            border:     "1px solid rgba(59,130,246,0.3)",
                            boxShadow:  "0 2px 0px rgba(59,130,246,0.1)",
                          } : {
                            background: "var(--tz-surface-2)",
                            border:     "1px solid var(--tz-border-soft)",
                            boxShadow:  "0 2px 0px rgba(0,0,0,0.04)",
                          }}
                        >
                          <div>
                            <p className="font-bold text-sm" style={{ color: "var(--tz-text)" }}>
                              {r.hotelName || "Hotel"} — #{id}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: "var(--tz-text-faint)" }}>
                              {r.roomType && `${r.roomType} · `}{r.checkIn} → {r.checkOut}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {r.totalPrice && (
                              <span className="font-bold text-sm" style={{ color: "#10b981" }}>{lkr(r.totalPrice)}</span>
                            )}
                            {isSelected && <CheckCircle size={16} style={{ color: "#3b82f6" }} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {selectedReservation && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: "rgba(59,130,246,0.08)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}
                  >
                    <CheckCircle size={13} />
                    Reservation #{selectedReservation.reservationId ?? selectedReservation.id} selected
                    <button type="button"
                      onClick={() => { setSelectedReservation(null); setForm((p) => ({ ...p, referenceId: "", amount: "" })); }}
                      className="ml-auto transition" style={{ color: "rgba(59,130,246,0.6)" }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Amount + Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--tz-text)" }}>
                  Amount (LKR)
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold pointer-events-none select-none"
                    style={{ color: "var(--tz-text-muted)" }}
                  >
                    LKR
                  </span>
                  <input
                    type="number" step="0.01" min="0.01" value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                    required placeholder="0.00"
                    className="tz-input pl-12"
                  />
                </div>
                {(selectedBooking || selectedReservation) && form.amount && (
                  <p className="text-xs font-semibold mt-1" style={{ color: "#10b981" }}>
                    ✓ Auto-filled from booking total
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--tz-text)" }}>
                  Payment Method
                </label>
                <div className="relative">
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => handleMethodChange(e.target.value)}
                    className="tz-input appearance-none pr-9"
                  >
                    {METHODS.map((m) => <option key={m} value={m}>{m.replace(/_/g, " ")}</option>)}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" size={15}
                    style={{ color: "var(--tz-text-faint)" }}
                  />
                </div>
              </div>
            </div>

            {/* ── Card details ── */}
            {isCardMethod && (
              <div
                className="rounded-2xl p-5 space-y-4"
                style={{
                  background:  "var(--tz-surface-2)",
                  border:      "1px solid rgba(59,130,246,0.2)",
                  boxShadow:   "0 3px 0px rgba(59,130,246,0.06), inset 0 2px 8px rgba(59,130,246,0.04)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center icon-3d"
                    style={{ background: "linear-gradient(145deg,#3b82f6,#6366f1)", boxShadow: "0 2px 0px #1e3a8a, 0 4px 10px rgba(59,130,246,0.35)" }}
                  >
                    <CreditCard size={13} className="text-white" />
                  </div>
                  <span className="text-sm font-bold" style={{ color: "var(--tz-text)" }}>Card Details</span>
                  <span className="flex items-center gap-1 ml-auto text-xs" style={{ color: "var(--tz-text-faint)" }}>
                    <Lock size={11} /> Secure entry
                  </span>
                </div>

                {/* Card preview */}
                <div
                  className="rounded-2xl p-5 text-white"
                  style={{
                    background: "linear-gradient(135deg, #1d4ed8 0%, #4f46e5 50%, #6d28d9 100%)",
                    boxShadow:  "0 5px 0px rgba(29,78,216,0.4), 0 12px 28px rgba(79,70,229,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                >
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
                      <p className="text-sm font-bold truncate max-w-[140px]">
                        {cardDetails.cardholderName || "YOUR NAME"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-60 uppercase tracking-wide mb-0.5">Expires</p>
                      <p className="text-sm font-bold">{cardDetails.expiry || "MM/YY"}</p>
                    </div>
                  </div>
                </div>

                {/* Cardholder name */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--tz-text-muted)" }}>
                    Cardholder Name *
                  </label>
                  <input
                    type="text" value={cardDetails.cardholderName}
                    onChange={(e) => setCardDetails((p) => ({ ...p, cardholderName: e.target.value.toUpperCase() }))}
                    placeholder="AS ON CARD"
                    className="tz-input"
                    style={cardErrors.cardholderName ? {
                      borderColor: "#ef4444",
                      boxShadow:   "inset 0 2px 6px rgba(0,0,0,0.06), 0 0 0 3px rgba(239,68,68,0.1)",
                    } : {}}
                  />
                  {cardErrors.cardholderName && (
                    <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{cardErrors.cardholderName}</p>
                  )}
                </div>

                {/* Card number */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--tz-text-muted)" }}>
                    Card Number *
                  </label>
                  <input
                    type="text" inputMode="numeric" value={cardDetails.cardNumber}
                    onChange={(e) => setCardDetails((p) => ({ ...p, cardNumber: formatCardNumber(e.target.value) }))}
                    placeholder="1234 5678 9012 3456" maxLength={19}
                    className="tz-input font-mono"
                    style={cardErrors.cardNumber ? {
                      borderColor: "#ef4444",
                      boxShadow:   "inset 0 2px 6px rgba(0,0,0,0.06), 0 0 0 3px rgba(239,68,68,0.1)",
                    } : {}}
                  />
                  {cardErrors.cardNumber && (
                    <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{cardErrors.cardNumber}</p>
                  )}
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--tz-text-muted)" }}>
                      Expiry Date *
                    </label>
                    <input
                      type="text" inputMode="numeric" value={cardDetails.expiry}
                      onChange={(e) => setCardDetails((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                      placeholder="MM/YY" maxLength={5}
                      className="tz-input"
                      style={cardErrors.expiry ? {
                        borderColor: "#ef4444",
                        boxShadow:   "inset 0 2px 6px rgba(0,0,0,0.06), 0 0 0 3px rgba(239,68,68,0.1)",
                      } : {}}
                    />
                    {cardErrors.expiry && (
                      <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{cardErrors.expiry}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--tz-text-muted)" }}>
                      CVV *
                    </label>
                    <div className="relative">
                      <input
                        type={showCvv ? "text" : "password"} inputMode="numeric"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                        placeholder="•••"
                        className="tz-input pr-10"
                        style={cardErrors.cvv ? {
                          borderColor: "#ef4444",
                          boxShadow:   "inset 0 2px 6px rgba(0,0,0,0.06), 0 0 0 3px rgba(239,68,68,0.1)",
                        } : {}}
                      />
                      <button
                        type="button" tabIndex={-1}
                        onClick={() => setShowCvv((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition"
                        style={{ color: "var(--tz-text-faint)" }}
                      >
                        {showCvv ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {cardErrors.cvv && (
                      <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{cardErrors.cvv}</p>
                    )}
                  </div>
                </div>

                <p className="flex items-center gap-1.5 text-xs pt-1" style={{ color: "var(--tz-text-faint)" }}>
                  <Lock size={11} /> Your card details are only used for this transaction and are not stored.
                </p>
              </div>
            )}

            {/* ── Bank transfer slip ── */}
            {isBankTransfer && (
              <div
                className="rounded-2xl p-5 space-y-3"
                style={{
                  background:  "var(--tz-surface-2)",
                  border:      "1px solid var(--tz-border)",
                  boxShadow:   "0 3px 0px rgba(0,0,0,0.05)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center icon-3d"
                    style={{ background: "linear-gradient(145deg,#475569,#64748b)", boxShadow: "0 2px 0px rgba(30,41,59,0.4)" }}
                  >
                    <Upload size={13} className="text-white" />
                  </div>
                  <span className="text-sm font-bold" style={{ color: "var(--tz-text)" }}>
                    Upload Bank Transfer Slip
                  </span>
                  <span className="ml-auto text-xs" style={{ color: "var(--tz-text-faint)" }}>
                    JPG, PNG, PDF · max 5 MB
                  </span>
                </div>

                {/* Bank details */}
                <div
                  className="rounded-xl px-4 py-3 text-xs space-y-0.5"
                  style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", color: "#3b82f6" }}
                >
                  <p className="font-bold mb-1" style={{ color: "#3b82f6" }}>Transfer to:</p>
                  <p style={{ color: "var(--tz-text-muted)" }}>Bank: Commercial Bank of Ceylon</p>
                  <p style={{ color: "var(--tz-text-muted)" }}>Account: TravelZone (Pvt) Ltd — 1234567890</p>
                  <p style={{ color: "var(--tz-text-muted)" }}>Branch: Colombo 03</p>
                  <p style={{ color: "var(--tz-text-muted)" }}>Reference: Your name + Booking ID</p>
                </div>

                {!slipFile ? (
                  <div
                    onClick={() => slipInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        const dt = new DataTransfer(); dt.items.add(file);
                        slipInputRef.current.files = dt.files;
                        handleSlipChange({ target: { files: dt.files } });
                      }
                    }}
                    className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
                    style={{
                      borderColor: "var(--tz-border)",
                      background:  "var(--tz-card-bg)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)";
                      e.currentTarget.style.background  = "rgba(59,130,246,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--tz-border)";
                      e.currentTarget.style.background  = "var(--tz-card-bg)";
                    }}
                  >
                    <Upload size={28} className="mx-auto mb-3" style={{ color: "var(--tz-text-faint)" }} />
                    <p className="font-semibold text-sm" style={{ color: "var(--tz-text)" }}>Click or drag file here</p>
                    <p className="text-xs mt-1" style={{ color: "var(--tz-text-faint)" }}>JPG, PNG, GIF, WEBP or PDF · Max 5 MB</p>
                  </div>
                ) : (
                  <div
                    className="rounded-xl px-4 py-3 flex items-center gap-3"
                    style={{ background: "var(--tz-card-bg)", border: "1px solid var(--tz-border-soft)", boxShadow: "0 2px 0px rgba(0,0,0,0.04)" }}
                  >
                    <FileIcon type={slipFile.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: "var(--tz-text)" }}>{slipFile.name}</p>
                      <p className="text-xs" style={{ color: "var(--tz-text-faint)" }}>{(slipFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    {slipFile.type.startsWith("image/") && (
                      <img src={slipFile.base64} alt="Slip preview"
                        className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                        style={{ border: "1px solid var(--tz-border-soft)", boxShadow: "0 2px 0px rgba(0,0,0,0.06)" }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => { setSlipFile(null); if (slipInputRef.current) slipInputRef.current.value = ""; }}
                      className="flex-shrink-0 p-1.5 rounded-lg transition"
                      style={{ color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}

                <input ref={slipInputRef} type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,image/*,application/pdf"
                  onChange={handleSlipChange} className="hidden"
                />
                {slipError && (
                  <p className="text-xs flex items-center gap-1" style={{ color: "#ef4444" }}>
                    <AlertCircle size={12} /> {slipError}
                  </p>
                )}
              </div>
            )}

            {/* Note (non-card, non-bank) */}
            {!isCardMethod && !isBankTransfer && (
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--tz-text)" }}>
                  Note <span className="font-normal" style={{ color: "var(--tz-text-faint)" }}>(optional)</span>
                </label>
                <input
                  type="text" value={form.transactionNote}
                  onChange={(e) => setForm((p) => ({ ...p, transactionNote: e.target.value }))}
                  placeholder="Any note about this payment"
                  className="tz-input"
                />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !form.referenceId || !form.amount}
              className="btn-3d-blue"
              style={{
                width:   "100%",
                padding: "0.75rem 1.5rem",
                opacity: (submitting || !form.referenceId || !form.amount) ? 0.5 : 1,
                cursor:  (submitting || !form.referenceId || !form.amount) ? "not-allowed" : "pointer",
                justifyContent: "center",
              }}
            >
              {submitting
                ? <><Loader2 size={15} className="animate-spin" /><span className="text-sm font-bold">Processing...</span></>
                : isCardMethod
                  ? <><Lock size={14} /><span className="text-sm font-bold">Pay Securely</span></>
                  : isBankTransfer
                    ? <><Upload size={14} /><span className="text-sm font-bold">Submit Slip & Confirm</span></>
                    : <><CheckCircle size={14} /><span className="text-sm font-bold">Confirm Payment</span></>
              }
            </button>

            {!form.referenceId && (
              <p className="text-xs text-center" style={{ color: "var(--tz-text-faint)" }}>
                Select a booking or reservation above to enable payment
              </p>
            )}
          </form>
        </div>
      )}

      {/* ── Payment list ── */}
      {payments.length === 0 ? (
        <div
          className="rounded-3xl border p-16 text-center"
          style={{ background: "var(--tz-card-bg)", borderColor: "var(--tz-card-border)", boxShadow: "0 3px 0px rgba(0,0,0,0.06)" }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 icon-3d"
            style={{
              background: "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15))",
              border:     "1px solid rgba(99,102,241,0.2)",
              boxShadow:  "0 3px 0px rgba(99,102,241,0.1)",
            }}
          >
            <CreditCard size={28} style={{ color: "var(--tz-text-faint)" }} />
          </div>
          <p className="font-bold text-lg" style={{ color: "var(--tz-text)" }}>No payments found</p>
          <p className="text-sm mt-1" style={{ color: "var(--tz-text-muted)" }}>
            {isTourist
              ? "Select a confirmed booking above to make your first payment."
              : "Tourist payments will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => {
            const s          = STATUS_STYLE[p.status] || STATUS_STYLE.PENDING;
            const hasSlip    = p.transactionNote?.startsWith("BANK_SLIP::");
            const isCardNote = p.transactionNote?.startsWith("Card:");
            return (
              <div
                key={p.id}
                className="rounded-2xl border p-5 transition-all duration-200"
                style={{
                  background:  "var(--tz-card-bg)",
                  borderColor: "var(--tz-card-border)",
                  boxShadow:   "0 3px 0px rgba(0,0,0,0.08), 0 6px 18px rgba(0,0,0,0.07)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 5px 0px rgba(0,0,0,0.1), 0 10px 24px rgba(0,0,0,0.10)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 3px 0px rgba(0,0,0,0.08), 0 6px 18px rgba(0,0,0,0.07)";
                }}
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center icon-3d flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15))",
                        border:     "1px solid rgba(99,102,241,0.2)",
                        boxShadow:  "0 3px 0px rgba(99,102,241,0.1)",
                      }}
                    >
                      <CreditCard size={18} style={{ color: "#6366f1" }} />
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: "var(--tz-text)" }}>
                        {p.paymentType === "GUIDE_BOOKING" ? "Guide Booking" : "Hotel Reservation"} #{p.referenceId}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--tz-text-faint)" }}>
                        {p.touristName} · {p.paymentMethod?.replace(/_/g, " ")} · ID #{p.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="font-black text-xl" style={{ color: "var(--tz-text)" }}>{lkr(p.amount)}</p>
                    <span
                      className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
                      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}`, boxShadow: `0 2px 0px ${s.border}` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                      {s.label}
                    </span>
                  </div>
                </div>

                {/* Transaction note */}
                {isCardNote && (
                  <p className="text-xs mt-3 pt-3 flex items-center gap-1.5"
                    style={{ color: "var(--tz-text-faint)", borderTop: "1px solid var(--tz-border-soft)" }}
                  >
                    <Lock size={11} /> {p.transactionNote}
                  </p>
                )}
                {hasSlip && (
                  <div className="mt-3 pt-3 flex items-center gap-2 text-xs font-semibold"
                    style={{ color: "#10b981", borderTop: "1px solid var(--tz-border-soft)" }}
                  >
                    <FileText size={13} />
                    Bank slip uploaded: <span>{p.transactionNote.split("::")[1]}</span>
                  </div>
                )}
                {p.transactionNote && !hasSlip && !isCardNote && (
                  <p className="text-xs mt-3 pt-3" style={{ color: "var(--tz-text-muted)", borderTop: "1px solid var(--tz-border-soft)" }}>
                    {p.transactionNote}
                  </p>
                )}

                <p className="text-xs mt-2" style={{ color: "var(--tz-text-faint)" }}>
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