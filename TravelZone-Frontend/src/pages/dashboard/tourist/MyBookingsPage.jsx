import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { CalendarDays, DollarSign, User, X, CheckCircle, Clock, XCircle } from "lucide-react";

const STATUS_STYLES = {
  PENDING:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: Clock,        label: "Pending" },
  CONFIRMED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle,  label: "Confirmed" },
  REJECTED:  { bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200",     icon: XCircle,      label: "Rejected" },
  CANCELLED: { bg: "bg-slate-50",   text: "text-slate-500",   border: "border-slate-200",   icon: XCircle,      label: "Cancelled" },
};

function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [error, setError] = useState("");

  const fetchBookings = () => {
    setLoading(true);
    api.get("/api/guide-bookings/my-bookings")
      .then((res) => setBookings(res.data))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;
    setCancelling(bookingId);
    setError("");
    try {
      await api.delete(`/api/guide-bookings/${bookingId}`);
      fetchBookings();
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
        <p className="text-slate-500 text-sm mt-0.5">Your guide booking requests</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
          <CalendarDays size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600 font-semibold">No bookings yet</p>
          <p className="text-slate-400 text-sm mt-1">Browse guides and book your first tour</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const s = STATUS_STYLES[booking.status] || STATUS_STYLES.PENDING;
            const StatusIcon = s.icon;
            const canCancel = booking.status === "PENDING" || booking.status === "CONFIRMED";

            return (
              <div key={booking.bookingId} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                {/* Guide photo */}
                {booking.guidePhoto ? (
                  <img src={booking.guidePhoto} alt={booking.guideName}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-slate-100 flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 text-xl font-bold flex-shrink-0">
                    {booking.guideName?.charAt(0)}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 truncate">{booking.guideName}</h3>
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                      <StatusIcon size={11} /> {s.label}
                    </span>
                  </div>
                  <div className="flex items-center flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={13} /> {booking.bookingDate}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <DollarSign size={13} /> ${parseFloat(booking.totalPrice).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Cancel button */}
                {canCancel && (
                  <button
                    onClick={() => handleCancel(booking.bookingId)}
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
      )}
    </div>
  );
}

export default MyBookingsPage;
