import { useEffect, useRef, useState } from "react";
import api from "../../../api/axios";
import { useAuth } from "../../../auth/AuthContext";
import {
  CreditCard, CheckCircle, AlertCircle,
  Plus, X, ChevronDown, Loader2,
  Upload, FileText, Image as ImageIcon, Trash2, Lock,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements, CardElement, useStripe, useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_test_51TOXiCCzjKtPt3YwjL3fCYAqYRm14na9IMTgL9WwgoeL8vVmNHpSQgLW6wFDhXASJxKyqbDMvYPo0G7PoGyjICuS00c7O89SJF");

const STATUS_STYLE = {
  COMPLETED: { bg: "rgba(16,185,129,0.1)",  text: "#10b981", border: "rgba(16,185,129,0.25)",  dot: "#10b981", label: "Completed" },
  PENDING:   { bg: "rgba(245,158,11,0.1)",  text: "#f59e0b", border: "rgba(245,158,11,0.25)",  dot: "#f59e0b", label: "Pending"   },
  FAILED:    { bg: "rgba(239,68,68,0.1)",   text: "#ef4444", border: "rgba(239,68,68,0.25)",   dot: "#ef4444", label: "Failed"    },
  REFUNDED:  { bg: "rgba(100,116,139,0.1)", text: "#64748b", border: "rgba(100,116,139,0.25)", dot: "#64748b", label: "Refunded"  },
};

/* Payment method display labels */
const METHODS = [
  { value: "CREDIT_CARD",    label: "Credit Card"    },
  { value: "DEBIT_CARD",     label: "Debit Card"     },
  { value: "PAYPAL",         label: "PayPal"         },
  { value: "CASH",           label: "Cash"           },
  { value: "BANK_TRANSFER",  label: "Bank Transfer"  },
];

function FileIcon({ type }) {
  if (type?.startsWith("image/")) return <ImageIcon size={20} style={{ color: "#3b82f6" }} />;
  return <FileText size={20} style={{ color: "#f97316" }} />;
}

/* ═══════════════════════════════════════════════════════
   RED BUTTON — fully inline, immune to dark-mode override
═══════════════════════════════════════════════════════ */
function RedButton({ onClick, disabled, icon: Icon, children, style: extra = {} }) {
  const [hovered, setHovered] = useState(false);
  const [active,  setActive]  = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.35rem",
        fontWeight: 700,
        fontSize: "0.82rem",
        letterSpacing: "0.02em",
        color: "#fff",
        border: "none",
        borderRadius: "0.75rem",
        cursor: disabled ? "not-allowed" : "pointer",
        outline: "none",
        fontFamily: "inherit",
        WebkitFontSmoothing: "antialiased",
        background: "linear-gradient(175deg, #7f1d1d 0%, #991b1b 35%, #b91c1c 70%, #dc2626 100%)",
        transform: active
          ? "translateY(1px)"
          : hovered ? "translateY(-3px)" : "translateY(-2px)",
        boxShadow: active
          ? "0 2px 0px #450a0a, 0 4px 10px rgba(185,28,28,0.3)"
          : hovered
          ? "0 6px 0px #450a0a, 0 12px 24px rgba(185,28,28,0.55), 0 4px 8px rgba(0,0,0,0.3)"
          : "0 4px 0px #450a0a, 0 8px 18px rgba(185,28,28,0.45), 0 2px 6px rgba(0,0,0,0.3)",
        opacity: disabled ? 0.55 : 1,
        transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.15s ease",
        ...extra,
      }}
    >
      <span style={{
        position: "absolute", top: "3px", left: "14%", width: "72%", height: "38%",
        borderRadius: "999px", pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 100%)",
      }} />
      <span style={{
        position: "absolute", bottom: 0, left: 0, width: "100%", height: "40%",
        borderRadius: "0 0 0.75rem 0.75rem", pointerEvents: "none",
        background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.28) 100%)",
      }} />
      {Icon && (
        <Icon size={13} style={{ position: "relative", zIndex: 2, color: "#fff", flexShrink: 0 }} />
      )}
      <span style={{ position: "relative", zIndex: 2, color: "#fff" }}>
        {children}
      </span>
    </button>
  );
}

/* ── Stripe card form ──────────────────────────────────────────────────────── */
function StripeCardForm({ form, onSuccess, onError }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [cardReady, setCardReady]   = useState(false);

  const lkr = (amount) =>
    `LKR ${parseFloat(amount).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !form.referenceId || !form.amount) return;
    setSubmitting(true);
    onError("");
    try {
      const { data } = await api.post("/api/payments/create-intent", {
        paymentType:     form.paymentType,
        referenceId:     Number(form.referenceId),
        amount:          parseFloat(form.amount),
        transactionNote: form.transactionNote || "",
      });
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (result.error) { onError(result.error.message); return; }
      if (result.paymentIntent.status === "succeeded") {
        await api.post("/api/payments/confirm", {
          paymentIntentId: result.paymentIntent.id,
          paymentType:     form.paymentType,
          referenceId:     Number(form.referenceId),
          amount:          parseFloat(form.amount),
          transactionNote: form.transactionNote || "",
        });
        onSuccess("Payment successful! ✅");
      }
    } catch (err) {
      onError(err?.response?.data?.message || "Payment failed.");
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handlePay}>
      <div
        className="rounded-2xl p-5 space-y-4 mb-4"
        style={{
          background: "var(--tz-surface-2)",
          border:     "1px solid rgba(59,130,246,0.2)",
          boxShadow:  "0 3px 0px rgba(59,130,246,0.06), inset 0 2px 8px rgba(59,130,246,0.04)",
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
            <Lock size={11} /> Secured by Stripe
          </span>
        </div>

        <div
          className="rounded-xl px-4 py-3"
          style={{
            background: "var(--tz-card-bg)",
            border:     "1px solid var(--tz-border)",
            boxShadow:  "inset 0 2px 6px rgba(0,0,0,0.06)",
          }}
        >
          <CardElement
            onChange={(e) => setCardReady(e.complete)}
            options={{
              style: {
                base: {
                  fontSize: "15px", color: "#1e293b",
                  fontFamily: "Inter, sans-serif",
                  "::placeholder": { color: "#94a3b8" },
                },
                invalid: { color: "#ef4444" },
              },
              hidePostalCode: true,
            }}
          />
        </div>

        <p className="text-xs px-1" style={{ color: "var(--tz-text-faint)" }}>
          🧪 Test card: <span className="font-mono">4242 4242 4242 4242</span> · any future date · any 3-digit CVV
        </p>
        <p className="flex items-center gap-1.5 text-xs" style={{ color: "var(--tz-text-faint)" }}>
          <Lock size={11} /> Card data goes directly to Stripe — never stored on our servers.
        </p>
      </div>

      {form.amount && (
        <div
          className="flex justify-between items-center rounded-xl px-4 py-3 mb-4"
          style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}
        >
          <span className="text-sm font-semibold" style={{ color: "var(--tz-text-muted)" }}>Amount to pay</span>
          <span className="text-lg font-black" style={{ color: "#10b981" }}>{lkr(form.amount)}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !cardReady || !form.referenceId || !form.amount}
        className="btn-3d-blue"
        style={{
          width: "100%", padding: "0.75rem 1.5rem", justifyContent: "center",
          opacity: (submitting || !cardReady || !form.referenceId || !form.amount) ? 0.5 : 1,
          cursor:  (submitting || !cardReady || !form.referenceId || !form.amount) ? "not-allowed" : "pointer",
        }}
      >
        {submitting
          ? <><Loader2 size={15} className="animate-spin" /><span className="text-sm font-bold">Processing...</span></>
          : <><Lock size={14} /><span className="text-sm font-bold">Pay Securely with Stripe</span></>
        }
      </button>
    </form>
  );
}

/* ── Main PaymentsPage ───────────────────────────────────────────────────────*/
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

  const [slipFile, setSlipFile]   = useState(null);
  const [slipError, setSlipError] = useState("");

  const [form, setForm] = useState({
    paymentType: "GUIDE_BOOKING", referenceId: "",
    amount: "", paymentMethod: "CREDIT_CARD", transactionNote: "",
  });

  const isCardMethod   = ["CREDIT_CARD", "DEBIT_CARD"].includes(form.paymentMethod);
  const isBankTransfer = form.paymentMethod === "BANK_TRANSFER";

  const lkr = (amount) =>
    `LKR ${parseFloat(amount).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  /* ── Fetchers ── */
  const fetchGuideBookings = async () => {
    setLoadingBookings(true);
    try {
      const [bookingsRes, paymentsRes] = await Promise.all([
        api.get("/api/guide-bookings/my-bookings"),
        api.get("/api/payments/my-payments"),
      ]);
      const paidIds = new Set(
        (paymentsRes.data || [])
          .filter((p) => p.paymentType === "GUIDE_BOOKING")
          .map((p) => Number(p.referenceId))
      );
      const confirmed = (bookingsRes.data || []).filter(
        (b) => b.status === "CONFIRMED" && !paidIds.has(Number(b.bookingId ?? b.id))
      );
      const sorted = [...confirmed].sort((a, b) => {
        const d = new Date(a.createdAt) - new Date(b.createdAt);
        return d !== 0 ? d : a.bookingDate < b.bookingDate ? -1 : 1;
      });
      const groups = []; let current = null;
      for (const booking of sorted) {
        const created   = new Date(booking.createdAt).getTime();
        const guideName = booking.guideName || booking.guideUserName || "—";
        const withinWindow = current && current.guideName === guideName &&
          Math.abs(created - current.firstCreatedAt) < 15000;
        if (withinWindow) {
          current.bookings.push(booking);
          current.totalPrice += parseFloat(booking.totalPrice);
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
      const [resRes, payRes] = await Promise.all([
        api.get("/api/reservations/my-reservations"),
        api.get("/api/payments/my-payments"),
      ]);
      const paidIds = new Set(
        (payRes.data || [])
          .filter((p) => p.paymentType === "HOTEL_RESERVATION")
          .map((p) => Number(p.referenceId))
      );
      setReservations(
        (resRes.data || []).filter(
          (r) => r.status === "CONFIRMED" && !paidIds.has(Number(r.reservationId ?? r.id))
        )
      );
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

  const resetForm = () => {
    setSlipFile(null); setSlipError("");
    setSelectedBooking(null); setSelectedReservation(null);
    setForm({ paymentType: "GUIDE_BOOKING", referenceId: "", amount: "", paymentMethod: "CREDIT_CARD", transactionNote: "" });
    setError(""); setSuccess("");
  };

  const handleTypeChange = (type) => {
    setForm((p) => ({ ...p, paymentType: type, referenceId: "", amount: "" }));
    setSelectedBooking(null); setSelectedReservation(null);
  };
  const handleMethodChange = (method) => {
    setForm((p) => ({ ...p, paymentMethod: method }));
    setSlipFile(null); setSlipError("");
  };
  const selectGuideBooking = (group) => {
    setSelectedBooking(group);
    setForm((p) => ({ ...p, referenceId: group.primaryBookingId, amount: group.totalPrice.toFixed(2) }));
  };
  const selectReservation = (r) => {
    setSelectedReservation(r);
    setForm((p) => ({ ...p, referenceId: r.reservationId ?? r.id, amount: r.totalPrice ? String(r.totalPrice) : p.amount }));
  };

  const handleLegacySubmit = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (isBankTransfer && !slipFile) { setSlipError("Please upload the bank transfer slip"); return; }
    let note = form.transactionNote || "";
    if (isBankTransfer) note = `BANK_SLIP::${slipFile.name}::${slipFile.base64}`;
    setSubmitting(true);
    try {
      await api.post("/api/payments", {
        paymentType:     form.paymentType,
        referenceId:     Number(form.referenceId),
        amount:          parseFloat(form.amount),
        paymentMethod:   form.paymentMethod,
        transactionNote: note,
      });
      setSuccess("Payment submitted successfully!");
      setShowForm(false); resetForm(); fetchPayments();
    } catch (err) {
      setError(err?.response?.data?.message || "Payment failed.");
    } finally { setSubmitting(false); }
  };

  const handleSlipChange = (e) => {
    setSlipError("");
    const file = e.target.files?.[0]; if (!file) return;
    const allowed = ["image/jpeg","image/png","image/gif","image/webp","application/pdf"];
    if (!allowed.includes(file.type)) { setSlipError("Only JPG, PNG, GIF, WEBP, or PDF allowed"); return; }
    if (file.size > 5 * 1024 * 1024) { setSlipError("File must be under 5 MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setSlipFile({ name: file.name, type: file.type, size: file.size, base64: ev.target.result });
    reader.readAsDataURL(file);
  };

  const total = payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

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
          <div
            className="rounded-2xl px-5 py-3 text-center"
            style={{
              background: "rgba(16,185,129,0.08)",
              border:     "1px solid rgba(16,185,129,0.2)",
              boxShadow:  "0 3px 0px rgba(16,185,129,0.1)",
            }}
          >
            <p className="text-xs font-medium" style={{ color: "var(--tz-text-faint)" }}>Total</p>
            <p className="text-xl font-black" style={{ color: "#10b981" }}>{lkr(total)}</p>
          </div>

          {/* ← Cancel uses RedButton; Make Payment keeps btn-3d-blue */}
          {isTourist && (
            showForm ? (
              <RedButton
                onClick={() => { setShowForm(false); resetForm(); }}
                icon={X}
                style={{ padding: "0.6rem 1.25rem" }}
              >
                <span className="text-sm font-bold">Cancel</span>
              </RedButton>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="btn-3d-blue"
                style={{ padding: "0.6rem 1.25rem" }}
              >
                <Plus size={15} />
                <span className="text-sm font-bold">Make Payment</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* ── Alerts ── */}
      {success && (
        <div
          className="rounded-2xl px-4 py-3 text-sm flex items-center gap-2 font-medium"
          style={{ background: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
        >
          <CheckCircle size={15} /> {success}
        </div>
      )}
      {error && (
        <div
          className="rounded-2xl px-4 py-3 text-sm flex items-center gap-2 font-medium"
          style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* ── Payment form ── */}
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

          <div className="space-y-5">

            {/* ── Payment type ── */}
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
                      key={opt.value}
                      type="button"
                      onClick={() => handleTypeChange(opt.value)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all"
                      style={active ? {
                        background: "linear-gradient(145deg, #1d4ed8, #3b82f6)", color: "#fff",
                        border: "1px solid #1d4ed8",
                        boxShadow: "0 3px 0px #1e3a8a, 0 6px 16px rgba(59,130,246,0.35)",
                        transform: "translateY(-1px)",
                      } : {
                        background: "var(--tz-surface-2)", color: "var(--tz-text-muted)",
                        border: "1px solid var(--tz-border)", boxShadow: "0 2px 0px rgba(0,0,0,0.06)",
                      }}
                    >
                      <span>{opt.icon}</span> {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Guide booking selector ── */}
            {form.paymentType === "GUIDE_BOOKING" && (
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "var(--tz-text)" }}>
                  Select Guide Booking{" "}
                  <span className="font-normal" style={{ color: "var(--tz-text-faint)" }}>
                    (CONFIRMED · unpaid only)
                  </span>
                </label>
                {loadingBookings ? (
                  <div className="flex items-center gap-2 text-sm py-3" style={{ color: "var(--tz-text-muted)" }}>
                    <Loader2 size={15} className="animate-spin" /> Loading your bookings...
                  </div>
                ) : guideBookings.length === 0 ? (
                  <div
                    className="rounded-xl px-4 py-3 text-sm font-medium"
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
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => selectGuideBooking(group)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all"
                          style={isSelected ? {
                            background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.3)",
                            boxShadow: "0 2px 0px rgba(59,130,246,0.1)",
                          } : {
                            background: "var(--tz-surface-2)", border: "1px solid var(--tz-border-soft)",
                            boxShadow: "0 2px 0px rgba(0,0,0,0.04)",
                          }}
                        >
                          <div>
                            <p className="font-bold text-sm flex items-center gap-2" style={{ color: "var(--tz-text)" }}>
                              Booking #{id}
                              {isMultiDay && (
                                <span
                                  className="px-1.5 py-0.5 rounded-md text-xs font-bold"
                                  style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)" }}
                                >
                                  {group.bookings.length} days
                                </span>
                              )}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: "var(--tz-text-faint)" }}>
                              Guide: {group.guideName} · {dateLabel}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                            <span className="font-bold text-sm" style={{ color: "#10b981" }}>{lkr(group.totalPrice)}</span>
                            {isSelected && <CheckCircle size={14} style={{ color: "#3b82f6" }} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {selectedBooking && (
                  <div
                    className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: "rgba(59,130,246,0.08)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}
                  >
                    <CheckCircle size={13} /> Booking #{selectedBooking.primaryBookingId} selected
                    <button
                      type="button"
                      onClick={() => { setSelectedBooking(null); setForm((p) => ({ ...p, referenceId: "", amount: "" })); }}
                      className="ml-auto"
                      style={{ color: "rgba(59,130,246,0.6)" }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Hotel reservation selector ── */}
            {form.paymentType === "HOTEL_RESERVATION" && (
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "var(--tz-text)" }}>
                  Select Hotel Reservation{" "}
                  <span className="font-normal" style={{ color: "var(--tz-text-faint)" }}>
                    (CONFIRMED · unpaid only)
                  </span>
                </label>
                {loadingReservations ? (
                  <div className="flex items-center gap-2 text-sm py-3" style={{ color: "var(--tz-text-muted)" }}>
                    <Loader2 size={15} className="animate-spin" /> Loading your reservations...
                  </div>
                ) : reservations.length === 0 ? (
                  <div
                    className="rounded-xl px-4 py-3 text-sm font-medium"
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
                          key={id}
                          type="button"
                          onClick={() => selectReservation(r)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all"
                          style={isSelected ? {
                            background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.3)",
                          } : {
                            background: "var(--tz-surface-2)", border: "1px solid var(--tz-border-soft)",
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
                              <span className="font-bold text-sm" style={{ color: "#10b981" }}>
                                {lkr(r.totalPrice)}
                              </span>
                            )}
                            {isSelected && <CheckCircle size={16} style={{ color: "#3b82f6" }} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {selectedReservation && (
                  <div
                    className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: "rgba(59,130,246,0.08)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}
                  >
                    <CheckCircle size={13} /> Reservation #{selectedReservation.reservationId ?? selectedReservation.id} selected
                    <button
                      type="button"
                      onClick={() => { setSelectedReservation(null); setForm((p) => ({ ...p, referenceId: "", amount: "" })); }}
                      className="ml-auto"
                      style={{ color: "rgba(59,130,246,0.6)" }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Amount + Payment Method ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--tz-text)" }}>
                  Amount (LKR)
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold pointer-events-none"
                    style={{ color: "var(--tz-text-muted)" }}
                  >
                    LKR
                  </span>
                  <input
                    type="number" step="0.01" min="0.01"
                    value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                    required
                    placeholder="0.00"
                    className="tz-input pl-12"
                  />
                </div>
                {(selectedBooking || selectedReservation) && form.amount && (
                  <p className="text-xs font-semibold mt-1" style={{ color: "#10b981" }}>
                    ✓ Auto-filled from booking total
                  </p>
                )}
              </div>

              {/* ── Payment Method — button group replacing the broken select ── */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--tz-text)" }}>
                  Payment Method
                </label>
                <div
                  className="rounded-xl p-1 flex flex-wrap gap-1"
                  style={{
                    background:  "var(--tz-surface-2)",
                    border:      "1px solid var(--tz-border)",
                    boxShadow:   "inset 0 1px 3px rgba(0,0,0,0.06)",
                  }}
                >
                  {METHODS.map((m) => {
                    const active = form.paymentMethod === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => handleMethodChange(m.value)}
                        style={{
                          flex:         "1 1 auto",
                          padding:      "0.35rem 0.6rem",
                          borderRadius: "0.5rem",
                          fontSize:     "0.7rem",
                          fontWeight:   700,
                          border:       "none",
                          cursor:       "pointer",
                          whiteSpace:   "nowrap",
                          transition:   "all 0.15s ease",
                          background:   active
                            ? "linear-gradient(145deg, #1d4ed8, #3b82f6)"
                            : "transparent",
                          color:  active ? "#fff" : "var(--tz-text-muted)",
                          boxShadow: active
                            ? "0 2px 0px #1e3a8a, 0 4px 10px rgba(59,130,246,0.3)"
                            : "none",
                        }}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Stripe card form ── */}
            {isCardMethod && (
              <Elements stripe={stripePromise}>
                <StripeCardForm
                  form={form}
                  onSuccess={(msg) => {
                    setSuccess(msg);
                    setShowForm(false);
                    resetForm();
                    fetchPayments();
                  }}
                  onError={setError}
                />
              </Elements>
            )}

            {/* ── Bank transfer slip ── */}
            {isBankTransfer && (
              <form onSubmit={handleLegacySubmit}>
                <div
                  className="rounded-2xl p-5 space-y-3 mb-4"
                  style={{ background: "var(--tz-surface-2)", border: "1px solid var(--tz-border)", boxShadow: "0 3px 0px rgba(0,0,0,0.05)" }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center icon-3d"
                      style={{ background: "linear-gradient(145deg,#475569,#64748b)", boxShadow: "0 2px 0px rgba(30,41,59,0.4)" }}
                    >
                      <Upload size={13} className="text-white" />
                    </div>
                    <span className="text-sm font-bold" style={{ color: "var(--tz-text)" }}>Upload Bank Transfer Slip</span>
                    <span className="ml-auto text-xs" style={{ color: "var(--tz-text-faint)" }}>JPG, PNG, PDF · max 5 MB</span>
                  </div>

                  <div
                    className="rounded-xl px-4 py-3 text-xs space-y-0.5"
                    style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", color: "#3b82f6" }}
                  >
                    <p className="font-bold mb-1">Transfer to:</p>
                    <p style={{ color: "var(--tz-text-muted)" }}>Bank: Bank of Ceylon</p>
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
                      style={{ borderColor: "var(--tz-border)", background: "var(--tz-card-bg)" }}
                    >
                      <Upload size={28} className="mx-auto mb-3" style={{ color: "var(--tz-text-faint)" }} />
                      <p className="font-semibold text-sm" style={{ color: "var(--tz-text)" }}>Click or drag file here</p>
                      <p className="text-xs mt-1" style={{ color: "var(--tz-text-faint)" }}>JPG, PNG, GIF, WEBP or PDF · Max 5 MB</p>
                    </div>
                  ) : (
                    <div
                      className="rounded-xl px-4 py-3 flex items-center gap-3"
                      style={{ background: "var(--tz-card-bg)", border: "1px solid var(--tz-border-soft)" }}
                    >
                      <FileIcon type={slipFile.type} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: "var(--tz-text)" }}>{slipFile.name}</p>
                        <p className="text-xs" style={{ color: "var(--tz-text-faint)" }}>{(slipFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                      {slipFile.type.startsWith("image/") && (
                        <img src={slipFile.base64} alt="Slip preview" className="w-14 h-14 object-cover rounded-xl flex-shrink-0" />
                      )}
                      <button
                        type="button"
                        onClick={() => { setSlipFile(null); if (slipInputRef.current) slipInputRef.current.value = ""; }}
                        className="flex-shrink-0 p-1.5 rounded-lg"
                        style={{ color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}

                  <input
                    ref={slipInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,image/*,application/pdf"
                    onChange={handleSlipChange}
                    className="hidden"
                  />
                  {slipError && (
                    <p className="text-xs flex items-center gap-1" style={{ color: "#ef4444" }}>
                      <AlertCircle size={12} /> {slipError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting || !form.referenceId || !form.amount}
                  className="btn-3d-blue"
                  style={{
                    width: "100%", padding: "0.75rem 1.5rem", justifyContent: "center",
                    opacity: (submitting || !form.referenceId || !form.amount) ? 0.5 : 1,
                  }}
                >
                  {submitting
                    ? <><Loader2 size={15} className="animate-spin" /><span className="text-sm font-bold">Processing...</span></>
                    : <><Upload size={14} /><span className="text-sm font-bold">Submit Slip & Confirm</span></>
                  }
                </button>
              </form>
            )}

            {/* ── Cash / PayPal / other ── */}
            {!isCardMethod && !isBankTransfer && (
              <form onSubmit={handleLegacySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--tz-text)" }}>
                    Note{" "}
                    <span className="font-normal" style={{ color: "var(--tz-text-faint)" }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.transactionNote}
                    onChange={(e) => setForm((p) => ({ ...p, transactionNote: e.target.value }))}
                    placeholder="Any note about this payment"
                    className="tz-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !form.referenceId || !form.amount}
                  className="btn-3d-blue"
                  style={{
                    width: "100%", padding: "0.75rem 1.5rem", justifyContent: "center",
                    opacity: (submitting || !form.referenceId || !form.amount) ? 0.5 : 1,
                  }}
                >
                  {submitting
                    ? <><Loader2 size={15} className="animate-spin" /><span className="text-sm font-bold">Processing...</span></>
                    : <><CheckCircle size={14} /><span className="text-sm font-bold">Confirm Payment</span></>
                  }
                </button>
              </form>
            )}

            {!form.referenceId && (
              <p className="text-xs text-center" style={{ color: "var(--tz-text-faint)" }}>
                Select a booking or reservation above to enable payment
              </p>
            )}
          </div>
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
            const s        = STATUS_STYLE[p.status] || STATUS_STYLE.PENDING;
            const hasSlip  = p.transactionNote?.startsWith("BANK_SLIP::");
            const isStripe = p.transactionNote?.startsWith("Stripe PaymentIntent:");
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
                  e.currentTarget.style.boxShadow = "0 5px 0px rgba(0,0,0,0.1), 0 10px 24px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 3px 0px rgba(0,0,0,0.08), 0 6px 18px rgba(0,0,0,0.07)";
                }}
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
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

                {isStripe && (
                  <p
                    className="text-xs mt-3 pt-3 flex items-center gap-1.5"
                    style={{ color: "var(--tz-text-faint)", borderTop: "1px solid var(--tz-border-soft)" }}
                  >
                    <Lock size={11} /> Paid via Stripe · {p.transactionNote.split(" | ")[0]}
                  </p>
                )}
                {hasSlip && (
                  <div
                    className="mt-3 pt-3 flex items-center gap-2 text-xs font-semibold"
                    style={{ color: "#10b981", borderTop: "1px solid var(--tz-border-soft)" }}
                  >
                    <FileText size={13} /> Bank slip: {p.transactionNote.split("::")[1]}
                  </div>
                )}
                {p.transactionNote && !hasSlip && !isStripe && (
                  <p
                    className="text-xs mt-3 pt-3"
                    style={{ color: "var(--tz-text-muted)", borderTop: "1px solid var(--tz-border-soft)" }}
                  >
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