import { useEffect, useState } from "react";
import api from "../../../api/axios";
import {
  CalendarCheck, CheckCircle, XCircle, Clock,
  Inbox, BadgeCheck, Banknote, CalendarRange
} from "lucide-react";

const STATUS_CONFIG = {
  PENDING:   { bg: "rgba(245,158,11,0.1)",  text: "#f59e0b", border: "rgba(245,158,11,0.25)",  icon: Clock,       dot: "#f59e0b", label: "Pending"   },
  CONFIRMED: { bg: "rgba(16,185,129,0.1)",  text: "#10b981", border: "rgba(16,185,129,0.25)",  icon: CheckCircle, dot: "#10b981", label: "Confirmed" },
  REJECTED:  { bg: "rgba(239,68,68,0.1)",   text: "#ef4444", border: "rgba(239,68,68,0.25)",   icon: XCircle,     dot: "#ef4444", label: "Rejected"  },
  CANCELLED: { bg: "rgba(100,116,139,0.1)", text: "#64748b", border: "rgba(100,116,139,0.25)", icon: XCircle,     dot: "#64748b", label: "Cancelled" },
  COMPLETED: { bg: "rgba(59,130,246,0.1)",  text: "#3b82f6", border: "rgba(59,130,246,0.25)",  icon: BadgeCheck,  dot: "#3b82f6", label: "Completed" },
};

function groupBookings(bookings) {
  if (!bookings.length) return [];
  const sorted = [...bookings].sort((a, b) => {
    if (a.touristId !== b.touristId) return a.touristId - b.touristId;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
  const groups = [];
  let current = null;
  for (const booking of sorted) {
    const bookingCreated = new Date(booking.createdAt).getTime();
    const withinWindow = current
      && current.touristId      === booking.touristId
      && current.status         === booking.status
      && Math.abs(bookingCreated - current.firstCreatedAt) < 15000;
    if (withinWindow) {
      current.bookings.push(booking);
      current.totalPrice = (parseFloat(current.totalPrice) + parseFloat(booking.totalPrice)).toFixed(2);
      if (booking.bookingDate < current.startDate) current.startDate = booking.bookingDate;
      if (booking.bookingDate > current.endDate)   current.endDate   = booking.bookingDate;
    } else {
      if (current) groups.push(current);
      current = {
        groupId: booking.bookingId,
        primaryBookingId: booking.bookingId,
        touristId: booking.touristId,
        touristName: booking.touristName,
        status: booking.status,
        startDate: booking.bookingDate,
        endDate: booking.bookingDate,
        totalPrice: String(booking.totalPrice),
        firstCreatedAt: bookingCreated,
        createdAt: booking.createdAt,
        bookings: [booking],
      };
    }
  }
  if (current) groups.push(current);
  return groups;
}

function GuideBookingRequestsPage() {
  const [bookings, setBookings]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError]                 = useState("");
  const [success, setSuccess]             = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/guide-bookings/my-requests");
      setBookings(res.data);
    } catch { setBookings([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateGroupStatus = async (group, status) => {
    setActionLoading(group.groupId + status);
    setError(""); setSuccess("");
    try {
      for (const b of group.bookings)
        await api.put(`/api/guide-bookings/${b.bookingId}/status`, { status });
      const label = status === "CONFIRMED" ? "confirmed" : status === "REJECTED" ? "rejected" : "marked as completed";
      setSuccess(`Booking ${label} successfully`);
      fetchBookings();
    } catch (err) {
      setError(err?.response?.data?.message || "Action failed");
    } finally { setActionLoading(null); }
  };

  const cancelGroup = async (group) => {
    if (!window.confirm(
      group.bookings.length > 1
        ? `Cancel all ${group.bookings.length} days of this booking?`
        : "Cancel this booking?"
    )) return;
    setActionLoading(group.groupId + "CANCEL");
    setError(""); setSuccess("");
    try {
      for (const b of group.bookings)
        await api.delete(`/api/guide-bookings/${b.bookingId}`);
      setSuccess("Booking cancelled successfully");
      fetchBookings();
    } catch (err) {
      setError(err?.response?.data?.message || "Cancel failed");
    } finally { setActionLoading(null); }
  };

  const groups    = groupBookings(bookings);
  const pending   = groups.filter((g) => g.status === "PENDING");
  const confirmed = groups.filter((g) => g.status === "CONFIRMED");
  const others    = groups.filter((g) => g.status !== "PENDING" && g.status !== "CONFIRMED");

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-[var(--tz-text)]">Booking Requests</h1>
          <p className="text-[var(--tz-text-muted)] text-sm mt-0.5">Manage tourist requests for your guide services</p>
        </div>

        {/* Summary badges */}
        <div className="flex gap-2 flex-wrap">
          {pending.length > 0 && (
            <span
              className="text-xs px-3 py-1.5 rounded-full font-bold animate-pulse"
              style={{
                background:  "rgba(245,158,11,0.12)",
                color:       "#f59e0b",
                border:      "1px solid rgba(245,158,11,0.25)",
                boxShadow:   "0 2px 0px rgba(245,158,11,0.15)",
              }}
            >
              {pending.length} pending
            </span>
          )}
          {confirmed.length > 0 && (
            <span
              className="text-xs px-3 py-1.5 rounded-full font-bold"
              style={{
                background: "rgba(16,185,129,0.1)",
                color:      "#10b981",
                border:     "1px solid rgba(16,185,129,0.2)",
                boxShadow:  "0 2px 0px rgba(16,185,129,0.12)",
              }}
            >
              {confirmed.length} confirmed
            </span>
          )}
          <span
            className="text-xs px-3 py-1.5 rounded-full font-bold"
            style={{
              background:  "var(--tz-surface-2)",
              color:       "var(--tz-text-muted)",
              border:      "1px solid var(--tz-border)",
              boxShadow:   "0 2px 0px rgba(0,0,0,0.06)",
            }}
          >
            {groups.length} total
          </span>
        </div>
      </div>

      {/* ── Alerts ── */}
      {success && (
        <div
          className="rounded-2xl px-4 py-3 text-sm flex items-center gap-2 font-medium"
          style={{
            background:  "rgba(16,185,129,0.08)",
            color:       "#10b981",
            border:      "1px solid rgba(16,185,129,0.2)",
            boxShadow:   "0 2px 0px rgba(16,185,129,0.1)",
          }}
        >
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center icon-3d flex-shrink-0"
            style={{ boxShadow: "0 2px 0px rgba(4,120,87,0.3)" }}
          >
            <CheckCircle size={11} className="text-white" />
          </div>
          {success}
        </div>
      )}
      {error && (
        <div
          className="rounded-2xl px-4 py-3 text-sm flex items-center gap-2 font-medium"
          style={{
            background: "rgba(239,68,68,0.08)",
            color:      "#ef4444",
            border:     "1px solid rgba(239,68,68,0.2)",
            boxShadow:  "0 2px 0px rgba(239,68,68,0.1)",
          }}
        >
          <XCircle size={15} /> {error}
        </div>
      )}

      {/* ── Empty state ── */}
      {groups.length === 0 ? (
        <div
          className="rounded-3xl border p-16 text-center"
          style={{
            background:  "var(--tz-card-bg)",
            borderColor: "var(--tz-card-border)",
            boxShadow:   "0 3px 0px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.06)",
          }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4 icon-3d">
            <Inbox size={28} className="text-[var(--tz-text-faint)]" />
          </div>
          <h3 className="text-[var(--tz-text)] font-bold text-lg">No requests yet</h3>
          <p className="text-[var(--tz-text-muted)] text-sm mt-1">Tourists will appear here once they book you</p>
        </div>
      ) : (
        <div className="space-y-8">

          {/* ── Pending section ── */}
          {pending.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <p className="text-xs font-bold text-[var(--tz-text-faint)] uppercase tracking-widest">Awaiting Response</p>
              </div>
              <div className="space-y-3">
                {pending.map((group) => (
                  <BookingGroupCard
                    key={group.groupId}
                    group={group}
                    actionLoading={actionLoading}
                    onConfirm={() => updateGroupStatus(group, "CONFIRMED")}
                    onReject={() => updateGroupStatus(group, "REJECTED")}
                    onCancel={() => cancelGroup(group)}
                    showPendingActions
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Confirmed section ── */}
          {confirmed.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                <p className="text-xs font-bold text-[var(--tz-text-faint)] uppercase tracking-widest">Confirmed — Mark as Completed</p>
              </div>
              <div className="space-y-3">
                {confirmed.map((group) => (
                  <BookingGroupCard
                    key={group.groupId}
                    group={group}
                    actionLoading={actionLoading}
                    onComplete={() => updateGroupStatus(group, "COMPLETED")}
                    onCancel={() => cancelGroup(group)}
                    showConfirmedActions
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Past section ── */}
          {others.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--tz-text-faint)" }} />
                <p className="text-xs font-bold text-[var(--tz-text-faint)] uppercase tracking-widest">Past Requests</p>
              </div>
              <div className="space-y-3">
                {others.map((group) => (
                  <BookingGroupCard
                    key={group.groupId}
                    group={group}
                    actionLoading={actionLoading}
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

/* ── Booking Group Card ── */
function BookingGroupCard({
  group,
  actionLoading,
  onConfirm, onReject, onComplete, onCancel,
  showPendingActions   = false,
  showConfirmedActions = false,
}) {
  const cfg        = STATUS_CONFIG[group.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = cfg.icon;
  const isProcessing = !!actionLoading;
  const isMultiDay   = group.startDate !== group.endDate;
  const dayCount     = group.bookings.length;
  const dateLabel    = isMultiDay
    ? `${group.startDate} → ${group.endDate}`
    : group.startDate;

  return (
    <div
      className="rounded-2xl border p-5 transition-all duration-200"
      style={{
        background:  "var(--tz-card-bg)",
        borderColor: "var(--tz-card-border)",
        boxShadow:   "0 3px 0px rgba(0,0,0,0.08), 0 6px 18px rgba(0,0,0,0.07)",
        transform:   "translateY(-1px)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform  = "translateY(-3px)";
        e.currentTarget.style.boxShadow  = "0 5px 0px rgba(0,0,0,0.1), 0 10px 24px rgba(0,0,0,0.10)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform  = "translateY(-1px)";
        e.currentTarget.style.boxShadow  = "0 3px 0px rgba(0,0,0,0.08), 0 6px 18px rgba(0,0,0,0.07)";
      }}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">

        {/* Tourist avatar + info */}
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-black text-lg flex-shrink-0 icon-3d"
            style={{ boxShadow: "0 3px 0px #3730a3, 0 6px 14px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.25)" }}
          >
            {group.touristName?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-[var(--tz-text)]">{group.touristName}</p>
            <p className="text-[var(--tz-text-muted)] text-xs flex items-center gap-1.5">
              Booking #{group.primaryBookingId}
              {isMultiDay && (
                <span
                  className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                  style={{
                    background:  "rgba(99,102,241,0.1)",
                    color:       "#818cf8",
                    border:      "1px solid rgba(99,102,241,0.2)",
                  }}
                >
                  {dayCount} days
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <span
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{
            background:  cfg.bg,
            color:       cfg.text,
            border:      `1px solid ${cfg.border}`,
            boxShadow:   `0 2px 0px ${cfg.border}`,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
          {cfg.label}
        </span>
      </div>

      {/* Meta info */}
      <div className="flex items-center flex-wrap gap-5 mt-4 text-sm">
        <span className="flex items-center gap-1.5 text-[var(--tz-text-muted)]">
          {isMultiDay
            ? <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center icon-3d"
                style={{ boxShadow: "0 2px 0px #1e3a8a", minWidth: "1.5rem" }}>
                <CalendarRange size={11} className="text-white" />
              </div>
            : <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center icon-3d"
                style={{ boxShadow: "0 2px 0px #1e3a8a", minWidth: "1.5rem" }}>
                <CalendarCheck size={11} className="text-white" />
              </div>
          }
          <span className="text-[var(--tz-text)] font-semibold">{dateLabel}</span>
        </span>

        <span className="flex items-center gap-1.5 text-[var(--tz-text-muted)]">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center icon-3d"
            style={{ boxShadow: "0 2px 0px rgba(4,120,87,0.3)", minWidth: "1.5rem" }}>
            <Banknote size={11} className="text-white" />
          </div>
          <span className="font-bold text-[var(--tz-text)]">
            LKR {parseFloat(group.totalPrice).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {isMultiDay && (
            <span className="text-[var(--tz-text-faint)] text-xs">
              ({dayCount} × LKR {parseFloat(group.bookings[0].totalPrice).toLocaleString("en-LK", { minimumFractionDigits: 2 })})
            </span>
          )}
        </span>
      </div>

      {/* ── Pending actions ── */}
      {showPendingActions && (
        <div
          className="flex items-center gap-2 mt-4 pt-4 flex-wrap"
          style={{ borderTop: "1px solid var(--tz-border-soft)" }}
        >
          {/* Confirm — green 3D */}
          <Btn3D
            color="emerald"
            disabled={isProcessing}
            onClick={onConfirm}
            icon={<CheckCircle size={14} />}
            label={actionLoading === group.groupId + "CONFIRMED" ? "Confirming..." : "Confirm"}
          />

          {/* Reject — red 3D */}
          <button
            onClick={onReject}
            disabled={isProcessing}
            className="btn-3d-red"
            style={{ padding: "0.5rem 1rem", opacity: isProcessing ? 0.5 : 1 }}
          >
            <XCircle size={14} />
            <span className="text-xs font-bold">
              {actionLoading === group.groupId + "REJECTED" ? "Rejecting..." : "Reject"}
            </span>
          </button>

          {/* Cancel — slate 3D */}
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="btn-3d-slate ml-auto"
            style={{ padding: "0.5rem 1rem", opacity: isProcessing ? 0.5 : 1 }}
          >
            <span className="text-xs font-bold">
              {actionLoading === group.groupId + "CANCEL" ? "Cancelling..." : "Cancel"}
            </span>
          </button>
        </div>
      )}

      {/* ── Confirmed actions ── */}
      {showConfirmedActions && (
        <div
          className="flex items-center gap-2 mt-4 pt-4 flex-wrap"
          style={{ borderTop: "1px solid var(--tz-border-soft)" }}
        >
          {/* Mark as completed — blue 3D */}
          <button
            onClick={onComplete}
            disabled={isProcessing}
            className="btn-3d-blue"
            style={{ padding: "0.5rem 1.25rem", opacity: isProcessing ? 0.5 : 1 }}
          >
            <BadgeCheck size={14} />
            <span className="text-xs font-bold">
              {actionLoading === group.groupId + "COMPLETED" ? "Saving..." : "Mark as Completed"}
            </span>
          </button>

          {/* Cancel — slate 3D */}
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="btn-3d-slate ml-auto"
            style={{ padding: "0.5rem 1rem", opacity: isProcessing ? 0.5 : 1 }}
          >
            <span className="text-xs font-bold">
              {actionLoading === group.groupId + "CANCEL" ? "Cancelling..." : "Cancel"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Reusable inline 3D button (for Confirm/emerald) ── */
function Btn3D({ color, onClick, disabled, icon, label }) {
  const palette = {
    emerald: {
      bg:     "linear-gradient(175deg, #065f46 0%, #059669 45%, #10b981 75%, #34d399 100%)",
      shadow: "0 4px 0px #064e3b, 0 6px 16px rgba(16,185,129,0.4), 0 2px 6px rgba(0,0,0,0.25)",
      hoverS: "0 6px 0px #064e3b, 0 10px 24px rgba(16,185,129,0.5)",
      activeS:"0 1px 0px #064e3b, 0 2px 6px rgba(16,185,129,0.2)",
    },
  };
  const p = palette[color];
  const [style, setStyle] = useState({
    background: p.bg, color: "#fff", border: "none",
    borderRadius: "0.875rem", padding: "0.5rem 1rem",
    display: "inline-flex", alignItems: "center", gap: "0.375rem",
    fontWeight: 700, fontSize: "0.75rem", cursor: disabled ? "not-allowed" : "pointer",
    position: "relative", overflow: "hidden",
    transform: "translateY(-2px)", boxShadow: p.shadow,
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    opacity: disabled ? 0.5 : 1,
  });

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={style}
      onMouseEnter={() => !disabled && setStyle((s) => ({ ...s, transform: "translateY(-4px)", boxShadow: p.hoverS }))}
      onMouseLeave={() => !disabled && setStyle((s) => ({ ...s, transform: "translateY(-2px)", boxShadow: p.shadow }))}
      onMouseDown={() => !disabled && setStyle((s) => ({ ...s, transform: "translateY(1px)", boxShadow: p.activeS }))}
      onMouseUp={() => !disabled && setStyle((s) => ({ ...s, transform: "translateY(-2px)", boxShadow: p.shadow }))}
    >
      {/* Gloss */}
      <span style={{
        position: "absolute", top: 4, left: "12%", width: "76%", height: "38%",
        borderRadius: "999px", pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 100%)",
      }} />
      <span style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: "0.375rem" }}>
        {icon}{label}
      </span>
    </button>
  );
}

export default GuideBookingRequestsPage;