import { useEffect, useState } from "react";
import api from "../../../api/axios";
import {
  CalendarDays, Building2,
  Clock, CheckCircle, XCircle, Inbox, Check, X, Flag
} from "lucide-react";

const STATUS_STYLES = {
  PENDING:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: Clock,        label: "Pending" },
  CONFIRMED: { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    icon: CheckCircle,  label: "Confirmed" },
  COMPLETED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle,  label: "Completed" },
  REJECTED:  { bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200",     icon: XCircle,      label: "Rejected" },
  CANCELLED: { bg: "bg-slate-50",   text: "text-slate-500",   border: "border-slate-200",   icon: XCircle,      label: "Cancelled" },
};

function HotelReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [error, setError] = useState("");

  const fetchReservations = () => {
    setLoading(true);
    api.get("/api/reservations/my-hotel-reservations")
      .then((res) => setReservations(res.data || []))
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReservations(); }, []);

  const updateStatus = async (reservationId, status) => {
    setUpdating(reservationId + status);
    setError("");
    try {
      await api.put(`/api/reservations/${reservationId}/status`, { status });
      fetchReservations();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filterStatus === "ALL"
    ? reservations
    : reservations.filter((r) => r.status === filterStatus);

  const counts = {
    ALL:       reservations.length,
    PENDING:   reservations.filter((r) => r.status === "PENDING").length,
    CONFIRMED: reservations.filter((r) => r.status === "CONFIRMED").length,
    COMPLETED: reservations.filter((r) => r.status === "COMPLETED").length,
    REJECTED:  reservations.filter((r) => r.status === "REJECTED").length,
    CANCELLED: reservations.filter((r) => r.status === "CANCELLED").length,
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hotel Reservations</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage tourist reservations across all your hotels</p>
        </div>
        <div className="flex items-center gap-2">
          {counts.PENDING > 0 && (
            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-sm px-4 py-1.5 rounded-full font-semibold animate-pulse">
              {counts.PENDING} pending
            </span>
          )}
          <span className="bg-blue-50 text-blue-600 border border-blue-200 text-sm px-4 py-1.5 rounded-full font-semibold">
            {counts.ALL} total
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "REJECTED", "CANCELLED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
              filterStatus === s
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
            }`}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
          <Inbox size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600 font-semibold">No reservations found</p>
          <p className="text-slate-400 text-sm mt-1">
            {filterStatus === "ALL"
              ? "Tourists will appear here once they book your hotels"
              : `No ${filterStatus.toLowerCase()} reservations`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => {
            const s = STATUS_STYLES[r.status] || STATUS_STYLES.PENDING;
            const StatusIcon = s.icon;
            const nights = Math.round(
              (new Date(r.checkOut) - new Date(r.checkIn)) / 86400000
            );
            const canAct = r.status === "PENDING" || r.status === "CONFIRMED";

            return (
              <div key={r.reservationId} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

                {/* Header row */}
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg flex-shrink-0">
                      {r.touristName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{r.touristName}</p>
                      <p className="text-slate-400 text-xs flex items-center gap-1">
                        <Building2 size={11} /> {r.hotelName} · {r.roomType}
                      </p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
                    <StatusIcon size={12} /> {s.label}
                  </span>
                </div>

                {/* Dates + Price */}
                <div className="flex items-center flex-wrap gap-5 text-sm text-slate-500 mb-4">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={14} className="text-blue-400" />
                    {r.checkIn} → {r.checkOut}
                    <span className="text-slate-400 text-xs ml-1">
                      ({nights} night{nights !== 1 ? "s" : ""})
                    </span>
                  </span>
                  {/* ✅ Changed from $ to LKR */}
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-emerald-600">LKR</span>
                    <span className="font-bold text-slate-800">
                      {parseFloat(r.totalPrice).toLocaleString("en-LK", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </span>
                </div>

                {/* Reservation ID tag */}
                <div className="mb-3">
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg font-mono">
                    Reservation #{r.reservationId}
                  </span>
                </div>

                {/* Action buttons */}
                {canAct && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                    {r.status === "PENDING" && (
                      <button
                        onClick={() => updateStatus(r.reservationId, "CONFIRMED")}
                        disabled={!!updating}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm"
                      >
                        <Check size={14} />
                        {updating === r.reservationId + "CONFIRMED" ? "Confirming..." : "Confirm"}
                      </button>
                    )}
                    {r.status === "CONFIRMED" && (
                      <button
                        onClick={() => updateStatus(r.reservationId, "COMPLETED")}
                        disabled={!!updating}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm"
                      >
                        <Flag size={14} />
                        {updating === r.reservationId + "COMPLETED" ? "Completing..." : "Mark Complete"}
                      </button>
                    )}
                    <button
                      onClick={() => updateStatus(r.reservationId, "REJECTED")}
                      disabled={!!updating}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-60 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-semibold transition"
                    >
                      <X size={14} />
                      {updating === r.reservationId + "REJECTED" ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default HotelReservationsPage;