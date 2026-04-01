import { useEffect, useState } from "react";
import api from "../../../api/axios";
import {
  CalendarDays, DollarSign, X, CheckCircle, Clock,
  XCircle, Building2, User, BadgeCheck
} from "lucide-react";

// ✅ FIX: Added COMPLETED status (was missing — caused COMPLETED to show as "Pending")
const STATUS_STYLES = {
  PENDING:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: Clock,        label: "Pending" },
  CONFIRMED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle,  label: "Confirmed" },
  REJECTED:  { bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200",     icon: XCircle,      label: "Rejected" },
  CANCELLED: { bg: "bg-slate-50",   text: "text-slate-500",   border: "border-slate-200",   icon: XCircle,      label: "Cancelled" },
  COMPLETED: { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    icon: BadgeCheck,   label: "Completed" },
};

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

  const cancelGuideBooking = async (bookingId) => {
    if (!window.confirm("Cancel this guide booking?")) return;
    setCancelling(bookingId);
    setError("");
    try {
      await api.delete(`/api/guide-bookings/${bookingId}`);
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
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>
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
          <span className={`text-xs px-2 py-0.5 rounded-full ${tab === "guides" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
            {guideBookings.length}
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
          <span className={`text-xs px-2 py-0.5 rounded-full ${tab === "hotels" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
            {hotelReservations.length}
          </span>
        </button>
      </div>

      {/* Guide Bookings Tab */}
      {tab === "guides" && (
        guideBookings.length === 0 ? (
          <EmptyState icon={User} message="No guide bookings yet" sub="Browse guides and book your first tour" />
        ) : (
          <div className="space-y-4">
            {guideBookings.map((booking) => {
              // ✅ FIX: STATUS_STYLES now includes COMPLETED so this fallback never hits PENDING incorrectly
              const s = STATUS_STYLES[booking.status] || STATUS_STYLES.PENDING;
              const StatusIcon = s.icon;
              return (
                <div key={booking.bookingId} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                  {booking.guidePhoto ? (
                    <img src={booking.guidePhoto} alt={booking.guideName}
                      className="w-14 h-14 rounded-xl object-cover border-2 border-slate-100 flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 text-xl font-bold flex-shrink-0">
                      {booking.guideName?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 truncate">{booking.guideName}</h3>
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                        <StatusIcon size={11} /> {s.label}
                      </span>
                    </div>
                    <div className="flex items-center flex-wrap gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5"><CalendarDays size={13} /> {booking.bookingDate}</span>
                      <span className="flex items-center gap-1.5"><DollarSign size={13} /> ${parseFloat(booking.totalPrice).toFixed(2)}</span>
                    </div>
                  </div>
                  {/* ✅ FIX: Only show Cancel on PENDING or CONFIRMED — not on COMPLETED/REJECTED/CANCELLED */}
                  {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                    <button
                      onClick={() => cancelGuideBooking(booking.bookingId)}
                      disabled={cancelling === booking.bookingId}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-60 flex-shrink-0"
                    >
                      <X size={14} />
                      {cancelling === booking.bookingId ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Hotel Reservations Tab */}
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
                      <span className="text-slate-400 text-xs">({nights} night{nights !== 1 ? "s" : ""})</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <DollarSign size={13} />
                      <span className="font-bold text-slate-800">${parseFloat(res.totalPrice).toFixed(2)}</span>
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