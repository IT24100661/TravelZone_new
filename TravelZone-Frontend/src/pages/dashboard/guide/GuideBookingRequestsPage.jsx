import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { CalendarCheck, CheckCircle, XCircle, Clock } from "lucide-react";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
  COMPLETED: "bg-blue-100 text-blue-700 border-blue-200",
};

const statusIcons = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  REJECTED: XCircle,
  CANCELLED: XCircle,
  COMPLETED: CheckCircle,
};

function GuideBookingRequestsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

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

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (bookingId, status) => {
    setActionLoading(bookingId + status);
    try {
      await api.put(`/api/guide-bookings/${bookingId}/status`, { status });
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
    try {
      await api.delete(`/api/guide-bookings/${bookingId}`);
      fetchBookings();
    } catch (err) {
      setError(err?.response?.data?.message || "Cancel failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Booking Requests</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage tourist booking requests for your guide services</p>
        </div>
        <span className="bg-blue-50 text-blue-600 border border-blue-200 text-sm px-4 py-1.5 rounded-full font-semibold">
          {bookings.length} total
        </span>
      </div>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-16 text-center">
          <CalendarCheck size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-slate-600 font-semibold text-lg">No booking requests yet</h3>
          <p className="text-slate-400 text-sm mt-1">Tourists will appear here once they book you.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const StatusIcon = statusIcons[booking.status] || Clock;
            return (
              <div
                key={booking.bookingId}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <CalendarCheck size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Booking #{booking.bookingId}</p>
                      <p className="text-slate-500 text-sm">
                        Tourist ID: {booking.touristId} &nbsp;·&nbsp; Date: {booking.bookingDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[booking.status]}`}
                    >
                      <StatusIcon size={12} />
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <p className="text-slate-700 font-bold text-lg">
                    ${parseFloat(booking.totalPrice).toFixed(2)}
                  </p>

                  {booking.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(booking.bookingId, "CONFIRMED")}
                        disabled={!!actionLoading}
                        className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-60"
                      >
                        <CheckCircle size={15} />
                        Confirm
                      </button>
                      <button
                        onClick={() => updateStatus(booking.bookingId, "REJECTED")}
                        disabled={!!actionLoading}
                        className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-60"
                      >
                        <XCircle size={15} />
                        Reject
                      </button>
                    </div>
                  )}

                  {(booking.status === "CONFIRMED" || booking.status === "PENDING") && (
                    <button
                      onClick={() => cancelBooking(booking.bookingId)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-60 ml-2"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default GuideBookingRequestsPage;
