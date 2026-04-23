import { useEffect, useState } from "react";
import api from "../../../api/axios";
import {
  CalendarDays, Building2,
  Clock, CheckCircle, XCircle, Inbox, Check, X, Flag, BadgeCheck
} from "lucide-react";

const STATUS_STYLES = {
  PENDING:   { bg: "rgba(245,158,11,0.1)",  text: "#f59e0b", border: "rgba(245,158,11,0.25)",  icon: Clock,       dot: "#f59e0b", label: "Pending"   },
  CONFIRMED: { bg: "rgba(59,130,246,0.1)",  text: "#3b82f6", border: "rgba(59,130,246,0.25)",  icon: CheckCircle, dot: "#3b82f6", label: "Confirmed" },
  COMPLETED: { bg: "rgba(16,185,129,0.1)",  text: "#10b981", border: "rgba(16,185,129,0.25)",  icon: BadgeCheck,  dot: "#10b981", label: "Completed" },
  REJECTED:  { bg: "rgba(239,68,68,0.1)",   text: "#ef4444", border: "rgba(239,68,68,0.25)",   icon: XCircle,     dot: "#ef4444", label: "Rejected"  },
  CANCELLED: { bg: "rgba(100,116,139,0.1)", text: "#64748b", border: "rgba(100,116,139,0.25)", icon: XCircle,     dot: "#64748b", label: "Cancelled" },
};

const FILTER_TABS = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "REJECTED", "CANCELLED"];

/* ═══════════════════════════════════════════════════════
   RED BUTTON — fully inline, immune to dark-mode override
═══════════════════════════════════════════════════════ */
function RedButton({ onClick, disabled, icon: Icon, children, style: extra = {} }) {
  const [hovered, setHovered] = useState(false);
  const [active,  setActive]  = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.35rem",
        fontWeight: 700,
        fontSize: "0.82rem",
        letterSpacing: "0.02em",
        color: "#fff",
        border: "none",
        borderRadius: "0.75rem",
        cursor: disabled ? "not-allowed" : "pointer",
        outline: "none",
        fontFamily: "inherit",
        WebkitFontSmoothing: "antialiased",
        background: "linear-gradient(175deg, #7f1d1d 0%, #991b1b 35%, #b91c1c 70%, #dc2626 100%)",
        transform: active
          ? "translateY(1px)"
          : hovered ? "translateY(-3px)" : "translateY(-2px)",
        boxShadow: active
          ? "0 2px 0px #450a0a, 0 4px 10px rgba(185,28,28,0.3)"
          : hovered
          ? "0 6px 0px #450a0a, 0 12px 24px rgba(185,28,28,0.55), 0 4px 8px rgba(0,0,0,0.3)"
          : "0 4px 0px #450a0a, 0 8px 18px rgba(185,28,28,0.45), 0 2px 6px rgba(0,0,0,0.3)",
        opacity: disabled ? 0.55 : 1,
        transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.15s ease",
        ...extra,
      }}
    >
      <span style={{
        position: "absolute", top: "3px", left: "14%", width: "72%", height: "38%",
        borderRadius: "999px", pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 100%)",
      }} />
      <span style={{
        position: "absolute", bottom: 0, left: 0, width: "100%", height: "40%",
        borderRadius: "0 0 0.75rem 0.75rem", pointerEvents: "none",
        background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.28) 100%)",
      }} />
      {Icon && (
        <Icon size={12} style={{ position: "relative", zIndex: 2, color: "#fff", flexShrink: 0 }} />
      )}
      <span style={{ position: "relative", zIndex: 2, color: "#fff" }}>
        {children}
      </span>
    </button>
  );
}

function HotelReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [updating, setUpdating]         = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [error, setError]               = useState("");

  const fetchReservations = () => {
    setLoading(true);
    api.get("/api/reservations/my-hotel-reservations")
      .then((res) => setReservations(res.data || []))
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReservations(); }, []);

  const updateStatus = async (reservationId, status) => {
    setUpdating(reservationId + status); setError("");
    try {
      await api.put(`/api/reservations/${reservationId}/status`, { status });
      fetchReservations();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update status");
    } finally { setUpdating(null); }
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
    <>
      {/* ── Scoped styles: tz-input shape + placeholder fix ── */}
      <style>{`
        .tz-input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          font-family: inherit;
          border-radius: 0.75rem;
          border: 1.5px solid var(--tz-input-border);
          background: var(--tz-input-bg);
          color: var(--tz-text);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.06);
          -webkit-font-smoothing: antialiased;
        }
        .tz-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.18), inset 0 1px 3px rgba(0,0,0,0.06);
        }
        :root .tz-input::placeholder,
        [data-theme="light"] .tz-input::placeholder {
          color: #94a3b8;
          opacity: 1;
        }
        [data-theme="dark"] .tz-input::placeholder {
          color: #475569;
          opacity: 1;
        }
        .tz-input.pl-9  { padding-left: 2.25rem; }
        .tz-input.pl-10 { padding-left: 2.5rem; }
        .tz-input.pl-11 { padding-left: 2.75rem; }
        .tz-input.resize-none { resize: none; }
      `}</style>

      <div>
        {/* ── Header ── */}
        <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-black text-[var(--tz-text)]">Hotel Reservations</h1>
            <p className="text-[var(--tz-text-muted)] text-sm mt-0.5">
              Manage tourist reservations across all your hotels
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {counts.PENDING > 0 && (
              <span
                className="text-sm px-4 py-1.5 rounded-full font-bold animate-pulse"
                style={{
                  background: "rgba(245,158,11,0.12)",
                  color:      "#f59e0b",
                  border:     "1px solid rgba(245,158,11,0.25)",
                  boxShadow:  "0 2px 0px rgba(245,158,11,0.15)",
                }}
              >
                {counts.PENDING} pending
              </span>
            )}
            <span
              className="text-sm px-4 py-1.5 rounded-full font-bold"
              style={{
                background: "rgba(59,130,246,0.1)",
                color:      "#3b82f6",
                border:     "1px solid rgba(59,130,246,0.2)",
                boxShadow:  "0 2px 0px rgba(59,130,246,0.12)",
              }}
            >
              {counts.ALL} total
            </span>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div
            className="mb-4 rounded-xl px-4 py-3 text-sm flex items-center gap-2"
            style={{
              background: "rgba(239,68,68,0.08)",
              color:      "#ef4444",
              border:     "1px solid rgba(239,68,68,0.2)",
            }}
          >
            {error}
          </div>
        )}

        {/* ── Filter tabs ── */}
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTER_TABS.map((s) => {
            const active = filterStatus === s;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: active ? "var(--tz-text)" : "var(--tz-surface-2)",
                  color:      active ? "var(--tz-bg)"   : "var(--tz-text-muted)",
                  border:     active ? "1px solid var(--tz-text)" : "1px solid var(--tz-border)",
                  boxShadow:  active
                    ? "0 3px 0px rgba(0,0,0,0.2), 0 6px 12px rgba(0,0,0,0.12)"
                    : "0 2px 0px rgba(0,0,0,0.06)",
                  transform: active ? "translateY(-1px)" : "none",
                }}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                <span
                  className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                  style={{
                    background: active ? "rgba(255,255,255,0.2)" : "var(--tz-surface-offset)",
                    color:      active ? "inherit" : "var(--tz-text-faint)",
                  }}
                >
                  {counts[s]}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Empty state ── */}
        {filtered.length === 0 ? (
          <div
            className="rounded-3xl border p-16 text-center"
            style={{
              background:  "var(--tz-card-bg)",
              borderColor: "var(--tz-card-border)",
              boxShadow:   "0 3px 0px rgba(0,0,0,0.06)",
            }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4 icon-3d">
              <Inbox size={28} className="text-[var(--tz-text-faint)]" />
            </div>
            <p className="text-[var(--tz-text)] font-bold text-lg">No reservations found</p>
            <p className="text-[var(--tz-text-muted)] text-sm mt-1">
              {filterStatus === "ALL"
                ? "Tourists will appear here once they book your hotels"
                : `No ${filterStatus.toLowerCase()} reservations`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((r) => {
              const s          = STATUS_STYLES[r.status] || STATUS_STYLES.PENDING;
              const StatusIcon = s.icon;
              const nights     = Math.round((new Date(r.checkOut) - new Date(r.checkIn)) / 86400000);
              const canAct     = r.status === "PENDING" || r.status === "CONFIRMED";

              return (
                <div
                  key={r.reservationId}
                  className="rounded-2xl border p-5 transition-all duration-200"
                  style={{
                    background:  "var(--tz-card-bg)",
                    borderColor: "var(--tz-card-border)",
                    boxShadow:   "0 3px 0px rgba(0,0,0,0.08), 0 6px 18px rgba(0,0,0,0.07)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 5px 0px rgba(0,0,0,0.1), 0 10px 24px rgba(0,0,0,0.10)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 3px 0px rgba(0,0,0,0.08), 0 6px 18px rgba(0,0,0,0.07)";
                  }}
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-black text-lg flex-shrink-0 icon-3d"
                        style={{
                          boxShadow: "0 3px 0px #3730a3, 0 6px 14px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
                        }}
                      >
                        {r.touristName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-[var(--tz-text)]">{r.touristName}</p>
                        <p className="flex items-center gap-1 text-xs" style={{ color: "var(--tz-text-muted)" }}>
                          <Building2 size={11} /> {r.hotelName} · {r.roomType}
                        </p>
                      </div>
                    </div>

                    <span
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                      style={{
                        background: s.bg,
                        color:      s.text,
                        border:     `1px solid ${s.border}`,
                        boxShadow:  `0 2px 0px ${s.border}`,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                      {s.label}
                    </span>
                  </div>

                  {/* Dates + price */}
                  <div className="flex items-center flex-wrap gap-5 text-sm mb-4">
                    <span className="flex items-center gap-1.5" style={{ color: "var(--tz-text-muted)" }}>
                      <div
                        className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center icon-3d"
                        style={{ boxShadow: "0 2px 0px #1e3a8a", minWidth: "1.5rem" }}
                      >
                        <CalendarDays size={11} className="text-white" />
                      </div>
                      <span className="font-semibold text-[var(--tz-text)]">
                        {r.checkIn} → {r.checkOut}
                      </span>
                      <span className="text-xs" style={{ color: "var(--tz-text-faint)" }}>
                        ({nights} night{nights !== 1 ? "s" : ""})
                      </span>
                    </span>

                    <span className="flex items-center gap-1.5">
                      <div
                        className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center icon-3d"
                        style={{ boxShadow: "0 2px 0px rgba(4,120,87,0.3)", minWidth: "1.5rem" }}
                      >
                        <span className="text-white text-[9px] font-black">LK</span>
                      </div>
                      <span className="font-bold text-[var(--tz-text)]">
                        LKR {parseFloat(r.totalPrice).toLocaleString("en-LK", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </span>
                  </div>

                  {/* Reservation ID */}
                  <div className="mb-4">
                    <span
                      className="text-xs font-mono px-2.5 py-1 rounded-lg"
                      style={{
                        background: "var(--tz-surface-2)",
                        color:      "var(--tz-text-faint)",
                        border:     "1px solid var(--tz-border-soft)",
                      }}
                    >
                      Reservation #{r.reservationId}
                    </span>
                  </div>

                  {/* Actions */}
                  {canAct && (
                    <div
                      className="flex flex-wrap gap-2 pt-4"
                      style={{ borderTop: "1px solid var(--tz-border-soft)" }}
                    >
                      {r.status === "PENDING" && (
                        <button
                          onClick={() => updateStatus(r.reservationId, "CONFIRMED")}
                          disabled={!!updating}
                          className="btn-3d-blue"
                          style={{ padding: "0.5rem 1.25rem", opacity: updating ? 0.6 : 1 }}
                        >
                          <Check size={14} />
                          <span className="text-xs font-bold">
                            {updating === r.reservationId + "CONFIRMED" ? "Confirming..." : "Confirm"}
                          </span>
                        </button>
                      )}
                      {r.status === "CONFIRMED" && (
                        <button
                          onClick={() => updateStatus(r.reservationId, "COMPLETED")}
                          disabled={!!updating}
                          className="btn-3d-blue"
                          style={{
                            padding: "0.5rem 1.25rem",
                            opacity: updating ? 0.6 : 1,
                            "--btn-3d-from":   "#065f46",
                            "--btn-3d-mid":    "#059669",
                            "--btn-3d-to":     "#34d399",
                            "--btn-3d-shadow": "#064e3b",
                            "--btn-3d-glow":   "rgba(16,185,129,0.45)",
                          }}
                        >
                          <Flag size={14} />
                          <span className="text-xs font-bold">
                            {updating === r.reservationId + "COMPLETED" ? "Completing..." : "Mark Complete"}
                          </span>
                        </button>
                      )}

                      {/* ← RedButton replaces btn-3d-red for Reject */}
                      <RedButton
                        onClick={() => updateStatus(r.reservationId, "REJECTED")}
                        disabled={!!updating}
                        icon={X}
                        style={{ padding: "0.5rem 1rem", opacity: updating ? 0.6 : 1 }}
                      >
                        <span className="text-xs font-bold">
                          {updating === r.reservationId + "REJECTED" ? "Rejecting..." : "Reject"}
                        </span>
                      </RedButton>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default HotelReservationsPage;