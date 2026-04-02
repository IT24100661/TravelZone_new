import { useEffect, useState } from "react";
import api from "../../../api/axios";
import {
  CalendarDays, X, CheckCircle, Clock,
  XCircle, Building2, User, BadgeCheck
} from "lucide-react";

const STATUS_STYLES = {
  PENDING:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: Clock,       label: "Pending" },
  CONFIRMED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle, label: "Confirmed" },
  REJECTED:  { bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200",     icon: XCircle,     label: "Rejected" },
  CANCELLED: { bg: "bg-slate-50",   text: "text-slate-500",   border: "border-slate-200",   icon: XCircle,     label: "Cancelled" },
  COMPLETED: { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    icon: BadgeCheck,  label: "Completed" },
};

// ─── Group individual day-bookings into range groups ─────────────────────────
// Two bookings belong to the same group if they share:
//   • same guideProfileId
//   • same status
//   • consecutive booking dates (no gap)
//   • were created within 10 seconds of each other (same request batch)
function groupGuideBookings(bookings) {
  if (!bookings || bookings.length === 0) return [];

  // Sort by createdAt desc, then bookingDate asc within same createdAt batch
  const sorted = [...bookings].sort((a, b) => {
    const ca = new Date(a.createdAt).getTime();
    const cb = new Date(b.createdAt).getTime();
    if (Math.abs(ca - cb) < 10000) {
      // Same batch — sort by bookingDate ascending
      return new Date(a.bookingDate) - new Date(b.bookingDate);
    }
    return cb - ca; // newer batch first
  });

  const groups = [];
  let i = 0;

  while (i < sorted.length) {
    const current = sorted[i];
    const group = [current];
    let j = i + 1;

    while (j < sorted.length) {
      const next = sorted[j];
      const lastInGroup = group[group.length - 1];

      const sameGuide  = next.guideProfileId === current.guideProfileId;
      const sameStatus = next.status === current.status;
      const sameBatch  = Math.abs(
        new Date(next.createdAt).getTime() - new Date(current.createdAt).getTime()
      ) < 10000;

      // Check consecutive date
      const lastDate = new Date(lastInGroup.bookingDate);
      const nextDate = new Date(next.bookingDate);
      const diffDays = Math.round((nextDate - lastDate) / 86400000);
      const isConsecutive = diffDays === 1;

      if (sameGuide && sameStatus && sameBatch && isConsecutive) {
        group.push(next);
        j++;
      } else {
        break;
      }
    }

    groups.push(group);
    i = j;
  }

  return groups;
}

function MyBookingsPage() {
  const [tab, setTab] = useState("guides");
  const [guideBookings, setGuideBookings] = useState([]);
  const [hotelReservations, setHotelReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [guideRes, hotelRes] = await Promise.all([
        api.get("/api/guide-bookings/my-bookings").catch(() => ({ data: [] })),
        api.get("/api/reservations/my-reservations").catch(() => ({ data: [] })),
      ]);
      setGuideBookings(guideRes.data || []);
      setHotelReservations(hotelRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Cancel every booking in a group
  const cancelGuideGroup = async (group) => {
    const label = group.length > 1
      ? `Cancel all ${group.length} days in this booking range?`
      : "Cancel this guide booking?";
    if (!window.confirm(label)) return;

    const firstId = group[0].bookingId;
    setCancelling(firstId);
    setError("");
    try {
      await Promise.all(group.map((b) => api.delete(`/api/guide-bookings/${b.bookingId}`)));
      fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Cancellation failed");
    } finally {
      setCancelling(null);
    }
  };

  const cancelReservation = async (reservationId) => {
    if (!window.confirm("Cancel this hotel reservation?")) return;
    setCancelling(reservationId);
    setError("");
    try {
      await api.delete(`/api/reservations/${reservationId}`);
      fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Cancellation failed");
    } finally {
      setCancelling(null);
    }
  };

  const groupedGuideBookings = groupGuideBookings(guideBookings);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Bookings</h1>
        <p className="text-slate-500 text-sm mt-0.5">All your travel bookings in one place</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("guides")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition border ${
            tab === "guides"
              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
              : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"
          }`}
        >
          <User size={15} /> Guide Bookings
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            tab === "guides" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
          }`}>
            {/* Show grouped count, not raw day count */}
            {groupedGuideBookings.length}
          </span>
        </button>
        <button
          onClick={() => setTab("hotels")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition border ${
            tab === "hotels"
              ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200"
              : "bg-white text-slate-600 border-slate-200 hover:border-purple-400"
          }`}
        >
          <Building2 size={15} /> Hotel Reservations
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            tab === "hotels" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
          }`}>
            {hotelReservations.length}
          </span>
        </button>
      </div>

      {/* ── Guide Bookings Tab ────────────────────────────────────────────────── */}
      {tab === "guides" && (
        groupedGuideBookings.length === 0 ? (
          <EmptyState icon={User} message="No guide bookings yet" sub="Browse guides and book your first tour" />
        ) : (
          <div className="space-y-4">
            {groupedGuideBookings.map((group) => {
              const first = group[0];
              const last  = group[group.length - 1];
              const isMultiDay = group.length > 1;

              const s = STATUS_STYLES[first.status] || STATUS_STYLES.PENDING;
              const StatusIcon = s.icon;

              // Total price = sum of all days in group
              const groupTotal = group.reduce(
                (sum, b) => sum + parseFloat(b.totalPrice), 0
              );

              const dateLabel = isMultiDay
                ? `${first.bookingDate} → ${last.bookingDate}`
                : first.bookingDate;

              const isCancelling = cancelling === first.bookingId;
              const canCancel = first.status === "PENDING" || first.status === "CONFIRMED";

              return (
                <div
                  key={`group-${first.bookingId}`}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4"
                >
                  {/* Guide avatar */}
                  {first.guideProfilePhoto ? (
                    <img
                      src={first.guideProfilePhoto}
                      alt={first.guideName}
                      className="w-14 h-14 rounded-xl object-cover border-2 border-slate-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 text-xl font-bold flex-shrink-0">
                      {first.guideName?.charAt(0)}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-slate-800 truncate">{first.guideName}</h3>
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                        <StatusIcon size={11} /> {s.label}
                      </span>
                      {isMultiDay && (
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                          {group.length} days
                        </span>
                      )}
                    </div>

                    <div className="flex items-center flex-wrap gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={13} />
                        {dateLabel}
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                        LKR {groupTotal.toLocaleString("en-LK", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Cancel button */}
                  {canCancel && (
                    <button
                      onClick={() => cancelGuideGroup(group)}
                      disabled={isCancelling}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-60 flex-shrink-0"
                    >
                      <X size={14} />
                      {isCancelling ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── Hotel Reservations Tab ────────────────────────────────────────────── */}
      {tab === "hotels" && (
        hotelReservations.length === 0 ? (
          <EmptyState icon={Building2} message="No hotel reservations yet" sub="Browse hotels and make your first reservation" />
        ) : (
          <div className="space-y-4">
            {hotelReservations.map((res) => {
              const s = STATUS_STYLES[res.status] || STATUS_STYLES.PENDING;
              const StatusIcon = s.icon;
              const nights = Math.round(
                (new Date(res.checkOut) - new Date(res.checkIn)) / 86400000
              );
              return (
                <div key={res.reservationId} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                        <Building2 size={22} className="text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{res.hotelName}</h3>
                        <p className="text-slate-400 text-xs">{res.hotelLocation} · {res.roomType}</p>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
                      <StatusIcon size={11} /> {s.label}
                    </span>
                  </div>

                  <div className="flex items-center flex-wrap gap-5 mt-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={13} />
                      {res.checkIn} → {res.checkOut}
                      <span className="text-slate-400 text-xs">
                        ({nights} night{nights !== 1 ? "s" : ""})
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-slate-800">
                      LKR {parseFloat(res.totalPrice).toLocaleString("en-LK", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  {(res.status === "PENDING" || res.status === "CONFIRMED") && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => cancelReservation(res.reservationId)}
                        disabled={cancelling === res.reservationId}
                        className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-60"
                      >
                        <X size={14} />
                        {cancelling === res.reservationId ? "Cancelling..." : "Cancel Reservation"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, message, sub }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
      <Icon size={48} className="mx-auto text-slate-300 mb-4" />
      <p className="text-slate-600 font-semibold">{message}</p>
      <p className="text-slate-400 text-sm mt-1">{sub}</p>
    </div>
  );
}

export default MyBookingsPage;