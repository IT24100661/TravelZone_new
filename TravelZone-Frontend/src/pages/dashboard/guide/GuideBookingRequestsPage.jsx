import { useEffect, useState } from "react";
import api from "../../../api/axios";
import {
  CalendarCheck, CheckCircle, XCircle, Clock,
  DollarSign, User, Inbox
} from "lucide-react";

const STATUS_CONFIG = {
  PENDING:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: Clock,       label: "Pending" },
  CONFIRMED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle, label: "Confirmed" },
  REJECTED:  { bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200",     icon: XCircle,     label: "Rejected" },
  CANCELLED: { bg: "bg-slate-50",   text: "text-slate-500",   border: "border-slate-200",   icon: XCircle,     label: "Cancelled" },
  COMPLETED: { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    icon: CheckCircle, label: "Completed" },
};

function GuideBookingRequestsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/guide-bookings/my-requests");
      setBookings(res.data);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
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
    } finally {
      setActionLoading(null);
    }
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
    } finally {
      setActionLoading(null);
    }
  };

  const pending = bookings.filter((b) => b.status === "PENDING");
  const others  = bookings.filter((b) => b.status !== "PENDING");

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Booking Requests</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage tourist booking requests for your guide services</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-sm px-4 py-1.5 rounded-full font-semibold">
            {pending.length} pending
          </span>
          <span className="bg-blue-50 text-blue-600 border border-blue-200 text-sm px-4 py-1.5 rounded-full font-semibold">
            {bookings.length} total
          </span>
        </div>
      </div>

      {success && (
        <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-16 text-center">
          <Inbox size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-slate-600 font-semibold text-lg">No booking requests yet</h3>
          <p className="text-slate-400 text-sm mt-1">Tourists will appear here once they book you</p>
        </div>
      ) : (
        <div className="space-y-8">

          {/* ── Pending section ── */}
          {pending.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Awaiting Response
              </h2>
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

          {/* ── Past requests ── */}
          {others.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Past Requests
              </h2>
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">

        {/* Tourist info */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-lg flex-shrink-0">
            {booking.touristName?.charAt(0)?.toUpperCase() || <User size={18} />}
          </div>
          <div>
            <p className="font-bold text-slate-800">{booking.touristName}</p>
            <p className="text-slate-400 text-xs">Booking #{booking.bookingId}</p>
          </div>
        </div>

        {/* Status badge */}
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
          <StatusIcon size={12} /> {cfg.label}
        </span>
      </div>

      {/* Details row */}
      <div className="flex items-center gap-6 mt-4 text-sm text-slate-500">
        <span className="flex items-center gap-1.5">
          <CalendarCheck size={14} className="text-blue-400" />
          {booking.bookingDate}
        </span>
        <span className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-emerald-500" />
          <span className="font-bold text-slate-800">${parseFloat(booking.totalPrice).toFixed(2)}</span>
        </span>
      </div>

      {/* Action buttons */}
      {showActions && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-5 py-2 rounded-xl text-sm font-semibold transition shadow-sm shadow-emerald-200"
          >
            <CheckCircle size={15} />
            {actionLoading === booking.bookingId + "CONFIRMED" ? "Confirming..." : "Confirm"}
          </button>
          <button
            onClick={onReject}
            disabled={isProcessing}
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-60 text-red-600 border border-red-200 px-5 py-2 rounded-xl text-sm font-semibold transition"
          >
            <XCircle size={15} />
            {actionLoading === booking.bookingId + "REJECTED" ? "Rejecting..." : "Reject"}
          </button>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="ml-auto flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold transition"
          >
            {actionLoading === booking.bookingId + "CANCEL" ? "Cancelling..." : "Cancel"}
          </button>
        </div>
      )}
    </div>
  );
}

export default GuideBookingRequestsPage;
