import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { CalendarCheck, Clock, CheckCircle, XCircle, Trash2 } from "lucide-react";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
  COMPLETED: "bg-blue-100 text-blue-700 border-blue-200",
};

function MyBookingsPage() {
  const [guideBookings, setGuideBookings] = useState([]);
  const [hotelReservations, setHotelReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("guides");
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [gb, hr] = await Promise.all([
        api.get("/api/guide-bookings/my-bookings").catch(() => ({ data: [] })),
        api.get("/api/reservations/my-reservations").catch(() => ({ data: [] })),
      ]);
      setGuideBookings(gb.data);
      setHotelReservations(hr.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const cancelGuideBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    setActionLoading(id);
    try {
      await api.delete(`/api/guide-bookings/${id}`);
      fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Cancel failed");
    } finally {
      setActionLoading(null);
    }
  };

  const cancelReservation = async (id) => {
    if (!window.confirm("Cancel this reservation?")) return;
    setActionLoading(id);
    try {
      await api.delete(`/api/reservations/${id}`);
      fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Cancel failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Bookings</h1>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {["guides", "hotels"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
              tab === t ? "bg-blue-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
            }`}>
            {t === "guides" ? `Guide Bookings (${guideBookings.length})` : `Hotel Reservations (${hotelReservations.length})`}
          </button>
        ))}
      </div>

      {tab === "guides" && (
        guideBookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
            <CalendarCheck size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-semibold">No guide bookings yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {guideBookings.map((b) => (
              <div key={b.bookingId} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-bold text-slate-800">Guide Booking #{b.bookingId}</p>
                    <p className="text-slate-500 text-sm">Date: {b.bookingDate} &nbsp;·&nbsp; ${parseFloat(b.totalPrice).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[b.status]}`}>
                      {b.status}
                    </span>
                    {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                      <button onClick={() => cancelGuideBooking(b.bookingId)} disabled={!!actionLoading}
                        className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs px-3 py-1.5 rounded-xl transition disabled:opacity-60">
                        <Trash2 size={12} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "hotels" && (
        hotelReservations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
            <CalendarCheck size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-semibold">No hotel reservations yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hotelReservations.map((r) => (
              <div key={r.reservationId} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-bold text-slate-800">Reservation #{r.reservationId}</p>
                    <p className="text-slate-500 text-sm">{r.checkIn} → {r.checkOut} &nbsp;·&nbsp; ${parseFloat(r.totalPrice).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[r.status]}`}>
                      {r.status}
                    </span>
                    {r.status === "PENDING" && (
                      <button onClick={() => cancelReservation(r.reservationId)} disabled={!!actionLoading}
                        className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs px-3 py-1.5 rounded-xl transition disabled:opacity-60">
                        <Trash2 size={12} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default MyBookingsPage;
