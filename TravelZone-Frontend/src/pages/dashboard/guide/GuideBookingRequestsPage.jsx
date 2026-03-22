import { useEffect, useState } from "react";
import api from "../../../api/axios";
import {
  CalendarCheck, CheckCircle, XCircle, Clock,
  DollarSign, Inbox, ChevronRight
} from "lucide-react";

const STATUS_CONFIG = {
  PENDING:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: Clock,        dot: "bg-amber-400",   label: "Pending" },
  CONFIRMED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle,  dot: "bg-emerald-400", label: "Confirmed" },
  REJECTED:  { bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200",     icon: XCircle,      dot: "bg-red-400",     label: "Rejected" },
  CANCELLED: { bg: "bg-slate-100",  text: "text-slate-500",   border: "border-slate-200",   icon: XCircle,      dot: "bg-slate-400",   label: "Cancelled" },
  COMPLETED: { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    icon: CheckCircle,  dot: "bg-blue-400",    label: "Completed" },
};

function GuideBookingRequestsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/guide-bookings/my-requests");
      setBookings(res.data);
    } catch { setBookings([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (bookingId, status) => {
    setActionLoading(bookingId + status);
    setError(""); setSuccess("");
    try {
      await api.put(`/api/guide-bookings/${bookingId}/status`, { status });
      setSuccess(`Booking ${status === "CONFIRMED" ? "confirmed" : "rejected"} successfully`);
      fetchBookings();
    } catch (err) {
      setError(err?.response?.data?.message || "Action failed");
    } finally { setActionLoading(null); }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;
    setActionLoading(bookingId + "CANCEL");
    setError(""); setSuccess("");
    try {
      await api.delete(`/api/guide-bookings/${bookingId}`);
      setSuccess("Booking cancelled successfully");
      fetchBookings();
    } catch (err) {
      setError(err?.response?.data?.message || "Cancel failed");
    } finally { setActionLoading(null); }
  };

  const pending = bookings.filter((b) => b.status === "PENDING");
  const others  = bookings.filter((b) => b.status !== "PENDING");

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Booking Requests</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage tourist requests for your guide services</p>
        </div>
        <div className="flex gap-2">
          {pending.length > 0 && (
            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-3 py-1.5 rounded-full font-bold animate-pulse">
              {pending.length} pending
            </span>
          )}
          <span className="bg-slate-100 text-slate-600 border border-slate-200 text-xs px-3 py-1.5 rounded-full font-bold">
            {bookings.length} total
          </span>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
          <CheckCircle size={15} /> {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
          <XCircle size={15} /> {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox size={28} className="text-slate-300" />
          </div>
          <h3 className="text-slate-700 font-bold text-lg">No requests yet</h3>
          <p className="text-slate-400 text-sm mt-1">Tourists will appear here once they book you</p>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Pending */}
          {pending.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awaiting Response</p>
              </div>
              <div className="space-y-3">
                {pending.map((booking) => (
                  <BookingCard
                    key={booking.bookingId}
                    booking={booking}
                    actionLoading={actionLoading}
                    onConfirm={() => updateStatus(booking.bookingId, "CONFIRMED")}
                    onReject={() => updateStatus(booking.bookingId, "REJECTED")}
                    onCancel={() => cancelBooking(booking.bookingId)}
                    showActions
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {others.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-slate-300 rounded-full" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Past Requests</p>
              </div>
              <div className="space-y-3">
                {others.map((booking) => (
                  <BookingCard
                    key={booking.bookingId}
                    booking={booking}
                    actionLoading={actionLoading}
                    showActions={false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking, actionLoading, onConfirm, onReject, onCancel, showActions }) {
  const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = cfg.icon;
  const isProcessing = !!actionLoading;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Tourist info */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg flex-shrink-0">
            {booking.touristName?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-800">{booking.touristName}</p>
            <p className="text-slate-400 text-xs">Booking #{booking.bookingId}</p>
          </div>
        </div>

        {/* Status badge */}
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-5 mt-4 text-sm text-slate-500">
        <span className="flex items-center gap-1.5">
          <CalendarCheck size={14} className="text-blue-400" />
          {booking.bookingDate}
        </span>
        <span className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-emerald-400" />
          <span className="font-bold text-slate-700">${parseFloat(booking.totalPrice).toFixed(2)}</span>
        </span>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <CheckCircle size={14} />
            {actionLoading === booking.bookingId + "CONFIRMED" ? "Confirming..." : "Confirm"}
          </button>
          <button
            onClick={onReject}
            disabled={isProcessing}
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold transition"
          >
            <XCircle size={14} />
            {actionLoading === booking.bookingId + "REJECTED" ? "Rejecting..." : "Reject"}
          </button>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="ml-auto bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-500 px-4 py-2 rounded-xl text-xs font-bold transition"
          >
            {actionLoading === booking.bookingId + "CANCEL" ? "Cancelling..." : "Cancel"}
          </button>
        </div>
      )}
    </div>
  );
}

export default GuideBookingRequestsPage;
