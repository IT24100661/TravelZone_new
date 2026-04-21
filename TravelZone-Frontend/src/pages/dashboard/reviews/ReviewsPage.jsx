import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { useAuth } from "../../../auth/AuthContext";
import {
  Star, Pencil, Trash2, Plus, X, CheckCircle, AlertCircle,
  MapPin, Calendar, User as UserIcon, Building2
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   LIQUID 3D HELPERS
───────────────────────────────────────────────────────── */
function Btn3D({ color = "blue", className = "", disabled, onClick, type = "button", children }) {
  const base =
    "relative overflow-hidden inline-flex items-center justify-center gap-2 " +
    "font-bold text-sm tracking-wide rounded-2xl cursor-pointer outline-none " +
    "select-none transition-all duration-150 px-5 py-2.5";

  const variants = {
    blue:   "btn-3d-blue",
    slate:  "btn-3d-slate",
    amber:  "btn-3d-amber",
    red:    "btn-3d-red",
    green:  "btn-3d-green",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[color] || variants.blue} ${className}`}
    >
      {children}
    </button>
  );
}

function Icon3D({ color = "blue", size = "md", children }) {
  const sizes = { sm: "w-8 h-8", md: "w-11 h-11", lg: "w-14 h-14" };
  const colors = {
    blue:   "from-blue-400 to-blue-600",
    teal:   "from-teal-400 to-teal-600",
    amber:  "from-amber-400 to-amber-600",
    indigo: "from-indigo-400 to-indigo-600",
    green:  "from-emerald-400 to-emerald-600",
    red:    "from-red-400 to-red-600",
    slate:  "from-slate-400 to-slate-600",
  };
  return (
    <div
      className={`icon-3d bg-gradient-to-br ${colors[color] || colors.blue} ${sizes[size]}`}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STAR RATING
───────────────────────────────────────────────────────── */
function StarRating({ value, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => !readOnly && onChange?.(n)}
          onMouseEnter={() => !readOnly && setHovered(n)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`transition-transform ${readOnly ? "cursor-default" : "hover:scale-125 active:scale-95"}`}
          style={
            !readOnly
              ? {
                  filter:
                    n <= (hovered || value)
                      ? "drop-shadow(0 2px 4px rgba(245,158,11,0.6))"
                      : "none",
                  transition: "filter 0.15s ease, transform 0.15s ease",
                }
              : {}
          }
        >
          <Star
            size={readOnly ? 16 : 22}
            className={
              n <= (hovered || value)
                ? "text-amber-400 fill-amber-400"
                : "text-slate-300 dark:text-slate-600"
            }
          />
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   GROUP BOOKINGS
───────────────────────────────────────────────────────── */
function groupBookings(bookings) {
  if (!bookings || bookings.length === 0) return [];
  const sorted = [...bookings].sort((a, b) => {
    const timeDiff = new Date(a.createdAt) - new Date(b.createdAt);
    if (timeDiff !== 0) return timeDiff;
    return a.bookingDate < b.bookingDate ? -1 : 1;
  });
  const groups = [];
  let current = null;
  for (const booking of sorted) {
    const created = new Date(booking.createdAt).getTime();
    const guideName = booking.guideName || "—";
    const withinWindow =
      current &&
      current.guideName === guideName &&
      Math.abs(created - current.firstCreatedAt) < 15000;
    if (withinWindow) {
      current.bookings.push(booking);
      if (booking.bookingDate < current.startDate) current.startDate = booking.bookingDate;
      if (booking.bookingDate > current.endDate)   current.endDate   = booking.bookingDate;
    } else {
      if (current) groups.push(current);
      current = {
        primaryBookingId: booking.guideBookingId,
        guideName,
        guideLocation:    booking.guideLocation || "",
        startDate:        booking.bookingDate,
        endDate:          booking.bookingDate,
        firstCreatedAt:   created,
        bookings:         [booking],
        alreadyReviewed:  booking.alreadyReviewed || false,
        bookingDate:      booking.bookingDate,
      };
    }
  }
  if (current) groups.push(current);
  return groups;
}

/* ─────────────────────────────────────────────────────────
   GUIDE BOOKING OPTION CARD
───────────────────────────────────────────────────────── */
function GuideBookingOption({ group, selected, onSelect }) {
  const isMultiDay = group.startDate !== group.endDate;
  const dayCount   = group.bookings.length;

  return (
    <button
      type="button"
      onClick={() => onSelect(group)}
      disabled={group.alreadyReviewed && !selected}
      className={`w-full text-left p-3 rounded-2xl border-2 transition-all duration-150 ${
        selected
          ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 shadow-md"
          : group.alreadyReviewed
          ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
          : "border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Icon3D color="teal" size="sm">
            <UserIcon size={14} className="text-white" />
          </Icon3D>
          <div>
            <p className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              {group.guideName}
              {isMultiDay && (
                <span className="bg-indigo-50 text-indigo-600 border border-indigo-200 px-1.5 py-0.5 rounded-md text-xs font-semibold">
                  {dayCount} days
                </span>
              )}
            </p>
            {group.guideLocation && (
              <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                <MapPin size={10} /> <span>{group.guideLocation}</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          {group.alreadyReviewed ? (
            <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
              Reviewed ✓
            </span>
          ) : (
            <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">
              Completed
            </span>
          )}
          <div className="flex items-center gap-1 text-slate-400 text-xs mt-1 justify-end">
            <Calendar size={10} />
            <span>
              {isMultiDay ? `${group.startDate} → ${group.endDate}` : group.startDate}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   RESERVATION OPTION CARD
───────────────────────────────────────────────────────── */
function ReservationOption({ reservation, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(reservation)}
      disabled={reservation.alreadyReviewed && !selected}
      className={`w-full text-left p-3 rounded-2xl border-2 transition-all duration-150 ${
        selected
          ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 shadow-md"
          : reservation.alreadyReviewed
          ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
          : "border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Icon3D color="blue" size="sm">
            <Building2 size={14} className="text-white" />
          </Icon3D>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{reservation.hotelName}</p>
            {reservation.hotelLocation && (
              <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                <MapPin size={10} /> <span>{reservation.hotelLocation}</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          {reservation.alreadyReviewed ? (
            <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
              Reviewed ✓
            </span>
          ) : (
            <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">
              Completed
            </span>
          )}
          {reservation.checkInDate && (
            <div className="flex items-center gap-1 text-slate-400 text-xs mt-1 justify-end">
              <Calendar size={10} />
              <span>
                {new Date(reservation.checkInDate).toLocaleDateString()} –{" "}
                {new Date(reservation.checkOutDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
export default function ReviewsPage() {
  const { user } = useAuth();
  const isTourist = user?.role === "TOURIST";
  const isGuide   = user?.role === "GUIDE";

  const [reviews, setReviews]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [deleting, setDeleting]       = useState(null);
  const [submitting, setSubmitting]   = useState(false);

  const [groupedBookings, setGroupedBookings] = useState([]);
  const [reviewableResv, setReviewableResv]   = useState([]);
  const [loadingOptions, setLoadingOptions]   = useState(false);

  const [form, setForm] = useState({
    type: "GUIDE_BOOKING",
    selectedGroup: null,
    selectedReservation: null,
    rating: 5,
    comment: "",
  });

  const endpoint = isTourist
    ? "/api/reviews/my-reviews"
    : isGuide
    ? "/api/reviews/guide-reviews"
    : "/api/reviews/hotel-reviews";

  const fetchReviews = () => {
    setLoading(true);
    api.get(endpoint)
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  const fetchOptions = () => {
    if (!isTourist) return;
    setLoadingOptions(true);
    Promise.all([
      api.get("/api/reviews/reviewable-guide-bookings"),
      api.get("/api/reviews/reviewable-reservations"),
    ])
      .then(([b, r]) => {
        const groups = groupBookings(b.data || []);
        const markedGroups = groups.map((g) => ({
          ...g,
          alreadyReviewed: g.bookings[0]?.alreadyReviewed || false,
        }));
        setGroupedBookings(markedGroups);
        setReviewableResv(r.data || []);
      })
      .catch(() => {})
      .finally(() => setLoadingOptions(false));
  };

  useEffect(() => { fetchReviews(); }, []);

  const resetForm = () => {
    setForm({ type: "GUIDE_BOOKING", selectedGroup: null, selectedReservation: null, rating: 5, comment: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const openForm = () => {
    resetForm();
    setShowForm(true);
    fetchOptions();
    setError(""); setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setSubmitting(true);
    if (!editingId) {
      if (form.type === "GUIDE_BOOKING" && !form.selectedGroup) {
        setError("Please select a guide booking to review.");
        setSubmitting(false); return;
      }
      if (form.type === "HOTEL_RESERVATION" && !form.selectedReservation) {
        setError("Please select a hotel reservation to review.");
        setSubmitting(false); return;
      }
    }
    try {
      if (editingId) {
        await api.put(`/api/reviews/${editingId}`, { rating: form.rating, comment: form.comment });
        setSuccess("Review updated!");
      } else {
        await api.post("/api/reviews", {
          rating:        form.rating,
          comment:       form.comment,
          guideBookingId: form.type === "GUIDE_BOOKING" ? form.selectedGroup.primaryBookingId : null,
          reservationId:  form.type === "HOTEL_RESERVATION" ? form.selectedReservation.reservationId : null,
        });
        setSuccess("Review submitted!");
      }
      resetForm();
      fetchReviews();
      fetchOptions();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit review.");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    setDeleting(id); setError(""); setSuccess("");
    try {
      await api.delete(`/api/reviews/${id}`);
      setSuccess("Review deleted.");
      fetchReviews();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete review.");
    } finally { setDeleting(null); }
  };

  const handleEdit = (review) => {
    setEditingId(review.id);
    setForm((p) => ({ ...p, rating: review.rating, comment: review.comment || "" }));
    setShowForm(true);
    setError(""); setSuccess("");
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  const pendingCount =
    groupedBookings.filter((g) => !g.alreadyReviewed).length +
    reviewableResv.filter((r) => !r.alreadyReviewed).length;

  /* ── Loading ── */
  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-full border-4 border-amber-100" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
        </div>
      </div>
    );

  /* ══════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6">

      {/* ── Inline styles for 3D elements ─────────────────── */}
      <style>{`
        /* ── AMBER 3D button ── */
        .btn-3d-amber {
          position: relative; overflow: hidden;
          color: #fff;
          background: linear-gradient(175deg, #b45309 0%, #d97706 40%, #f59e0b 75%, #fbbf24 100%);
          border: none; border-radius: 0.875rem;
          transform: translateY(-2px);
          box-shadow: 0 5px 0px #92400e, 0 8px 20px rgba(245,158,11,0.45), 0 2px 6px rgba(0,0,0,0.3);
          transition: transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.15s ease, filter 0.15s ease;
        }
        .btn-3d-amber::before {
          content:""; position:absolute; top:4px; left:15%; width:70%; height:38%;
          border-radius:999px;
          background:linear-gradient(180deg,rgba(255,255,255,0.45) 0%,transparent 100%);
          pointer-events:none; z-index:1;
        }
        .btn-3d-amber > *, .btn-3d-amber > svg { position:relative; z-index:2; }
        .btn-3d-amber:hover {
          transform:translateY(-4px); filter:brightness(1.08);
          box-shadow:0 7px 0px #92400e,0 14px 28px rgba(245,158,11,0.55),0 4px 8px rgba(0,0,0,0.3);
        }
        .btn-3d-amber:active {
          transform:translateY(1px);
          box-shadow:0 2px 0px #92400e,0 4px 10px rgba(245,158,11,0.3),0 1px 3px rgba(0,0,0,0.3);
        }
        .btn-3d-amber:disabled { opacity:0.55; cursor:not-allowed; transform:translateY(-2px); }

        /* ── RED 3D button ── */
        .btn-3d-red {
          position:relative; overflow:hidden;
          color:#fff;
          background:linear-gradient(175deg,#b91c1c 0%,#dc2626 45%,#ef4444 75%,#f87171 100%);
          border:none; border-radius:0.875rem;
          transform:translateY(-2px);
          box-shadow:0 5px 0px #7f1d1d,0 8px 20px rgba(239,68,68,0.4),0 2px 6px rgba(0,0,0,0.3);
          transition:transform 0.15s cubic-bezier(0.22,1,0.36,1),box-shadow 0.15s ease,filter 0.15s ease;
        }
        .btn-3d-red::before {
          content:""; position:absolute; top:4px; left:15%; width:70%; height:38%;
          border-radius:999px;
          background:linear-gradient(180deg,rgba(255,255,255,0.4) 0%,transparent 100%);
          pointer-events:none; z-index:1;
        }
        .btn-3d-red > *, .btn-3d-red > svg { position:relative; z-index:2; }
        .btn-3d-red:hover {
          transform:translateY(-4px); filter:brightness(1.08);
          box-shadow:0 7px 0px #7f1d1d,0 14px 28px rgba(239,68,68,0.5),0 4px 8px rgba(0,0,0,0.3);
        }
        .btn-3d-red:active {
          transform:translateY(1px);
          box-shadow:0 2px 0px #7f1d1d,0 4px 10px rgba(239,68,68,0.25),0 1px 3px rgba(0,0,0,0.3);
        }
        .btn-3d-red:disabled { opacity:0.55; cursor:not-allowed; }

        /* ── SLATE 3D button ── */
        .btn-3d-slate {
          position:relative; overflow:hidden;
          color:#475569;
          background:linear-gradient(175deg,#f8fafc 0%,#f1f5f9 50%,#e2e8f0 100%);
          border:1px solid #e2e8f0; border-radius:0.875rem;
          transform:translateY(-2px);
          box-shadow:0 4px 0px #cbd5e1,0 6px 16px rgba(0,0,0,0.08),0 2px 4px rgba(0,0,0,0.06);
          transition:transform 0.15s cubic-bezier(0.22,1,0.36,1),box-shadow 0.15s ease;
        }
        .btn-3d-slate::before {
          content:""; position:absolute; top:3px; left:15%; width:70%; height:38%;
          border-radius:999px;
          background:linear-gradient(180deg,rgba(255,255,255,0.8) 0%,transparent 100%);
          pointer-events:none; z-index:1;
        }
        .btn-3d-slate > *, .btn-3d-slate > svg { position:relative; z-index:2; }
        .btn-3d-slate:hover {
          transform:translateY(-4px); color:#1e293b;
          box-shadow:0 6px 0px #cbd5e1,0 12px 24px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.06);
        }
        .btn-3d-slate:active {
          transform:translateY(1px);
          box-shadow:0 1px 0px #cbd5e1,0 2px 6px rgba(0,0,0,0.06);
        }

        /* ── DARK MODE overrides ── */
        .dark .btn-3d-slate {
          color:#94a3b8;
          background:linear-gradient(175deg,#1e293b 0%,#273344 50%,#1e293b 100%);
          border-color:#334155;
          box-shadow:0 4px 0px #0f172a,0 6px 16px rgba(0,0,0,0.4);
        }
        .dark .btn-3d-slate:hover { color:#e2e8f0; border-color:#475569; }

        /* ── ICON-3D ── */
        .icon-3d {
          position:relative; border-radius:0.875rem;
          display:flex; align-items:center; justify-content:center;
          flex-shrink:0; overflow:hidden;
          box-shadow:0 4px 0px rgba(0,0,0,0.22),0 6px 16px rgba(0,0,0,0.15),
                     inset 0 1px 0px rgba(255,255,255,0.35);
          transform:translateY(-1px);
          transition:transform 0.15s ease,box-shadow 0.15s ease;
        }
        .icon-3d::before {
          content:""; position:absolute; top:3px; left:10%; width:80%; height:40%;
          border-radius:999px;
          background:linear-gradient(180deg,rgba(255,255,255,0.4) 0%,transparent 100%);
          pointer-events:none; z-index:1;
        }
        .icon-3d svg { position:relative; z-index:2; }

        /* ── Avatar 3D ── */
        .avatar-3d {
          position:relative; overflow:hidden;
          display:flex; align-items:center; justify-content:center;
          border-radius:0.875rem; flex-shrink:0;
          box-shadow:0 4px 0px rgba(0,0,0,0.2),0 6px 14px rgba(0,0,0,0.12),
                     inset 0 1px 0px rgba(255,255,255,0.4);
          transform:translateY(-1px);
        }
        .avatar-3d::before {
          content:""; position:absolute; top:2px; left:10%; width:80%; height:35%;
          border-radius:999px;
          background:linear-gradient(180deg,rgba(255,255,255,0.45) 0%,transparent 100%);
          pointer-events:none; z-index:1;
        }
        .avatar-3d > * { position:relative; z-index:2; }

        /* ── STAR glow ── */
        .star-active { filter:drop-shadow(0 2px 4px rgba(245,158,11,0.7)); }

        /* ── CARD lift on hover ── */
        .review-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .review-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }

        /* ── Stat badge 3D ── */
        .stat-3d {
          background: linear-gradient(145deg, #fffbeb 0%, #fef3c7 60%, #fde68a 100%);
          border: 1px solid #fcd34d;
          box-shadow: 0 4px 0px #d97706, 0 6px 16px rgba(245,158,11,0.25);
          transform: translateY(-2px);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .stat-3d:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 0px #d97706, 0 10px 24px rgba(245,158,11,0.3);
        }
        .dark .stat-3d {
          background:linear-gradient(145deg,#292108 0%,#3b2a09 60%,#4a3510 100%);
          border-color:#92400e;
          box-shadow:0 4px 0px #451a03,0 6px 16px rgba(245,158,11,0.2);
        }

        /* ── Form card ── */
        .form-card {
          background: var(--tz-surface, #fff);
          border: 1px solid var(--tz-border, #e2e8f0);
          border-radius: 1.5rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04);
        }

        /* ── Textarea focus ── */
        .tz-textarea {
          background: var(--tz-input-bg, #fff);
          border: 1.5px solid var(--tz-input-border, #e2e8f0);
          color: var(--tz-text, #1e293b);
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .tz-textarea:focus {
          outline: none;
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.15);
        }

        /* ── Type toggle ── */
        .type-btn-active {
          background: linear-gradient(175deg, #b45309 0%, #d97706 45%, #f59e0b 100%);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 0px #92400e, 0 6px 16px rgba(245,158,11,0.4);
          transform: translateY(-2px);
        }
        .type-btn-inactive {
          background: var(--tz-surface, #fff);
          color: var(--tz-text-muted, #64748b);
          border-color: var(--tz-border, #e2e8f0);
        }
        .type-btn-inactive:hover {
          border-color: #fcd34d;
          background: #fffbeb;
          transform: translateY(-1px);
        }
      `}</style>

      {/* ── PAGE HEADER ────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--tz-text)" }}>
            {isTourist ? "My Reviews" : isGuide ? "Reviews Received" : "Hotel Reviews"}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--tz-text-muted)" }}>
            {isTourist
              ? "Reviews you left for guides and hotels"
              : isGuide
              ? "Feedback tourists left after their tours"
              : "Feedback tourists left about your hotels"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Avg rating badge */}
          {reviews.length > 0 && (
            <div className="stat-3d rounded-2xl px-5 py-3 text-center cursor-default">
              <p className="text-xs font-medium" style={{ color: "var(--tz-text-muted)" }}>
                Avg Rating
              </p>
              <p className="text-xl font-black text-amber-500 flex items-center justify-center gap-1">
                {avgRating}
                <Star size={16} className="text-amber-400 fill-amber-400 star-active" />
              </p>
            </div>
          )}

          {/* Add Review button */}
          {isTourist && (
            <div className="relative">
              <Btn3D
                color={showForm && !editingId ? "slate" : "amber"}
                onClick={showForm ? resetForm : openForm}
              >
                {showForm && !editingId ? <X size={15} /> : <Plus size={15} />}
                {showForm && !editingId ? "Cancel" : "Add Review"}
              </Btn3D>
              {!showForm && pendingCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs
                             rounded-full flex items-center justify-center font-black
                             shadow-lg shadow-red-300 ring-2 ring-white"
                >
                  {pendingCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── ALERTS ─────────────────────────────────────────────────── */}
      {success && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium
                        bg-emerald-50 border border-emerald-200 text-emerald-700
                        shadow-sm shadow-emerald-100">
          <Icon3D color="green" size="sm">
            <CheckCircle size={14} className="text-white" />
          </Icon3D>
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium
                        bg-red-50 border border-red-200 text-red-600
                        shadow-sm shadow-red-100">
          <Icon3D color="red" size="sm">
            <AlertCircle size={14} className="text-white" />
          </Icon3D>
          {error}
        </div>
      )}

      {/* ── REVIEW FORM ────────────────────────────────────────────── */}
      {showForm && isTourist && (
        <div className="form-card p-6">
          <h2 className="font-black text-lg mb-5 flex items-center gap-2"
              style={{ color: "var(--tz-text)" }}>
            <Icon3D color="amber" size="sm">
              <Star size={14} className="text-white" />
            </Icon3D>
            {editingId ? "Edit Review" : "New Review"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Type selector */}
            {!editingId && (
              <div>
                <label className="block text-sm font-semibold mb-2"
                       style={{ color: "var(--tz-text)" }}>
                  Review For
                </label>
                <div className="flex gap-2">
                  {["GUIDE_BOOKING", "HOTEL_RESERVATION"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p, type: t,
                          selectedGroup: null,
                          selectedReservation: null,
                        }))
                      }
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2
                                  text-sm font-semibold transition-all duration-150
                                  ${form.type === t ? "type-btn-active" : "type-btn-inactive"}`}
                    >
                      {t === "GUIDE_BOOKING"
                        ? <UserIcon size={14} />
                        : <Building2 size={14} />}
                      {t === "GUIDE_BOOKING" ? "Guide" : "Hotel"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Item selector */}
            {!editingId && (
              <div>
                <label className="block text-sm font-semibold mb-2"
                       style={{ color: "var(--tz-text)" }}>
                  {form.type === "GUIDE_BOOKING"
                    ? `Select a Guide (${groupedBookings.length} completed trip${groupedBookings.length !== 1 ? "s" : ""})`
                    : `Select a Hotel (${reviewableResv.length} completed stay${reviewableResv.length !== 1 ? "s" : ""})`}
                </label>

                {loadingOptions ? (
                  <div className="flex items-center gap-2 text-sm py-4"
                       style={{ color: "var(--tz-text-muted)" }}>
                    <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                    Loading your completed {form.type === "GUIDE_BOOKING" ? "tours" : "stays"}...
                  </div>
                ) : form.type === "GUIDE_BOOKING" ? (
                  groupedBookings.length === 0 ? (
                    <div className="text-center py-8 rounded-2xl border-2 border-dashed border-slate-200">
                      <Icon3D color="slate" size="md" className="mx-auto mb-3">
                        <UserIcon size={18} className="text-white" />
                      </Icon3D>
                      <p className="text-sm mt-3" style={{ color: "var(--tz-text-muted)" }}>
                        No completed guide tours to review yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {groupedBookings.map((group) => (
                        <GuideBookingOption
                          key={group.primaryBookingId}
                          group={group}
                          selected={form.selectedGroup?.primaryBookingId === group.primaryBookingId}
                          onSelect={(sel) =>
                            !sel.alreadyReviewed && setForm((p) => ({ ...p, selectedGroup: sel }))
                          }
                        />
                      ))}
                    </div>
                  )
                ) : reviewableResv.length === 0 ? (
                  <div className="text-center py-8 rounded-2xl border-2 border-dashed border-slate-200">
                    <Icon3D color="blue" size="md" className="mx-auto mb-3">
                      <Building2 size={18} className="text-white" />
                    </Icon3D>
                    <p className="text-sm mt-3" style={{ color: "var(--tz-text-muted)" }}>
                      No completed hotel stays to review yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {reviewableResv.map((r) => (
                      <ReservationOption
                        key={r.reservationId}
                        reservation={r}
                        selected={form.selectedReservation?.reservationId === r.reservationId}
                        onSelect={(sel) =>
                          !sel.alreadyReviewed && setForm((p) => ({ ...p, selectedReservation: sel }))
                        }
                      />
                    ))}
                  </div>
                )}

                {/* Selection chip */}
                {(form.selectedGroup || form.selectedReservation) && (
                  <div className="mt-3 flex items-center gap-2 text-sm font-semibold
                                  text-emerald-700 bg-emerald-50 border border-emerald-200
                                  px-3 py-2 rounded-xl shadow-sm">
                    <CheckCircle size={14} className="flex-shrink-0" />
                    Reviewing:{" "}
                    <span>
                      {form.selectedGroup?.guideName || form.selectedReservation?.hotelName}
                    </span>
                    {form.selectedGroup?.bookings?.length > 1 && (
                      <span className="text-emerald-500 font-normal text-xs">
                        · {form.selectedGroup.bookings.length}-day trip
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setForm((p) => ({ ...p, selectedGroup: null, selectedReservation: null }))
                      }
                      className="ml-auto text-emerald-400 hover:text-emerald-600 transition"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold mb-2"
                     style={{ color: "var(--tz-text)" }}>
                Your Rating
              </label>
              <div className="flex items-center gap-3">
                <StarRating value={form.rating} onChange={(v) => setForm((p) => ({ ...p, rating: v }))} />
                <span className="text-sm font-semibold" style={{ color: "var(--tz-text-muted)" }}>
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][form.rating]}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold mb-1.5"
                     style={{ color: "var(--tz-text)" }}>
                Comment{" "}
                <span className="font-normal" style={{ color: "var(--tz-text-faint)" }}>
                  (optional)
                </span>
              </label>
              <textarea
                rows={3}
                value={form.comment}
                onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
                placeholder="Share your experience..."
                className="tz-textarea w-full rounded-xl px-4 py-2.5 text-sm resize-none"
              />
            </div>

            {/* Submit row */}
            <div className="flex gap-3 pt-1">
              <Btn3D type="submit" color="amber" disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Saving...
                  </>
                ) : editingId ? (
                  "Update Review"
                ) : (
                  "Submit Review"
                )}
              </Btn3D>
              {editingId && (
                <Btn3D type="button" color="slate" onClick={resetForm}>
                  Cancel
                </Btn3D>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ── REVIEW LIST ────────────────────────────────────────────── */}
      {reviews.length === 0 ? (
        <div className="form-card p-16 text-center">
          <div className="flex justify-center mb-4">
            <Icon3D color="amber" size="lg">
              <Star size={28} className="text-white" />
            </Icon3D>
          </div>
          <p className="font-bold text-lg" style={{ color: "var(--tz-text)" }}>
            No reviews yet
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--tz-text-muted)" }}>
            {isTourist
              ? "Complete a tour or stay and leave your first review."
              : "Tourist feedback will appear here after completed bookings."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="review-card form-card p-5"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left — avatar + info */}
                <div className="flex items-center gap-3">
                  <div
                    className="avatar-3d w-11 h-11 font-black text-amber-600 text-base"
                    style={{
                      background: "linear-gradient(145deg,#fef3c7 0%,#fde68a 60%,#fcd34d 100%)",
                    }}
                  >
                    {r.touristName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: "var(--tz-text)" }}>
                      {r.touristName}
                    </p>
                    <p className="text-xs" style={{ color: "var(--tz-text-faint)" }}>
                      {r.guideBookingId
                        ? `Guide Booking #${r.guideBookingId}`
                        : `Hotel Reservation #${r.reservationId}`}
                    </p>
                  </div>
                </div>

                {/* Right — stars + actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StarRating value={r.rating} readOnly />
                  {isTourist && (
                    <>
                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(r)}
                        className="btn-3d-blue p-2 rounded-xl"
                        style={{
                          background: "linear-gradient(175deg,#1d4ed8,#3b82f6)",
                          boxShadow: "0 3px 0px #1e3a8a,0 4px 10px rgba(59,130,246,0.35)",
                          transform: "translateY(-1px)",
                          transition: "all 0.15s ease",
                          border: "none",
                          cursor: "pointer",
                          position: "relative",
                          overflow: "hidden",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-3px)";
                          e.currentTarget.style.boxShadow = "0 5px 0px #1e3a8a,0 8px 18px rgba(59,130,246,0.45)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(-1px)";
                          e.currentTarget.style.boxShadow = "0 3px 0px #1e3a8a,0 4px 10px rgba(59,130,246,0.35)";
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.transform = "translateY(1px)";
                          e.currentTarget.style.boxShadow = "0 1px 0px #1e3a8a,0 2px 5px rgba(59,130,246,0.25)";
                        }}
                      >
                        <Pencil size={14} className="text-white" style={{ position: "relative", zIndex: 2 }} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deleting === r.id}
                        style={{
                          background: "linear-gradient(175deg,#b91c1c,#ef4444)",
                          boxShadow: "0 3px 0px #7f1d1d,0 4px 10px rgba(239,68,68,0.35)",
                          transform: "translateY(-1px)",
                          transition: "all 0.15s ease",
                          border: "none",
                          cursor: deleting === r.id ? "not-allowed" : "pointer",
                          opacity: deleting === r.id ? 0.55 : 1,
                          position: "relative",
                          overflow: "hidden",
                          padding: "0.5rem",
                          borderRadius: "0.75rem",
                        }}
                        onMouseEnter={(e) => {
                          if (deleting !== r.id) {
                            e.currentTarget.style.transform = "translateY(-3px)";
                            e.currentTarget.style.boxShadow = "0 5px 0px #7f1d1d,0 8px 18px rgba(239,68,68,0.45)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(-1px)";
                          e.currentTarget.style.boxShadow = "0 3px 0px #7f1d1d,0 4px 10px rgba(239,68,68,0.35)";
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.transform = "translateY(1px)";
                          e.currentTarget.style.boxShadow = "0 1px 0px #7f1d1d,0 2px 5px rgba(239,68,68,0.25)";
                        }}
                      >
                        {deleting === r.id ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        ) : (
                          <Trash2 size={14} className="text-white" style={{ position: "relative", zIndex: 2 }} />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Comment */}
              {r.comment && (
                <p
                  className="text-sm mt-3 pt-3 leading-relaxed"
                  style={{
                    color: "var(--tz-text-muted)",
                    borderTop: "1px solid var(--tz-border-soft)",
                  }}
                >
                  "{r.comment}"
                </p>
              )}

              {/* Timestamp */}
              <p className="text-xs mt-2" style={{ color: "var(--tz-text-faint)" }}>
                {new Date(r.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}