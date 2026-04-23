import { useEffect, useState } from "react";
import api from "../../../api/axios";
import {
  CalendarDays, X, CheckCircle, Clock,
  XCircle, Building2, User, BadgeCheck
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────────────────────── */
const STATUS_STYLES = {
  PENDING:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: Clock,       label: "Pending"   },
  CONFIRMED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle, label: "Confirmed" },
  REJECTED:  { bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200",     icon: XCircle,     label: "Rejected"  },
  CANCELLED: { bg: "bg-slate-50",   text: "text-slate-500",   border: "border-slate-200",   icon: XCircle,     label: "Cancelled" },
  COMPLETED: { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    icon: BadgeCheck,  label: "Completed" },
};

/* ─────────────────────────────────────────────────────────
   STATUS BADGE — scoped inline, immune to nuclear override
───────────────────────────────────────────────────────── */
const STATUS_INLINE = {
  PENDING:   { bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.35)",  color: "#d97706" },
  CONFIRMED: { bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.35)", color: "#059669" },
  REJECTED:  { bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.35)",  color: "#dc2626" },
  CANCELLED: { bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.3)", color: "#64748b" },
  COMPLETED: { bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.35)", color: "#2563eb" },
};

/* ─────────────────────────────────────────────────────────
   CANCEL BUTTON — 3D red, fully inline
───────────────────────────────────────────────────────── */
function CancelButton({ onClick, disabled, label = "Cancel" }) {
  const [hovered, setHovered] = useState(false);
  const [active, setActive]   = useState(false);

  const base = {
    position: "relative",
    overflow: "hidden",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    padding: "0.5rem 1rem",
    fontWeight: 700,
    fontSize: "0.82rem",
    letterSpacing: "0.02em",
    color: "#fff",
    border: "none",
    borderRadius: "0.75rem",
    cursor: disabled ? "not-allowed" : "pointer",
    outline: "none",
    flexShrink: 0,
    fontFamily: "inherit",
    WebkitFontSmoothing: "antialiased",
    background: "linear-gradient(175deg, #7f1d1d 0%, #991b1b 35%, #b91c1c 70%, #dc2626 100%)",
    transform: active ? "translateY(1px)" : hovered ? "translateY(-3px)" : "translateY(-2px)",
    boxShadow: active
      ? "0 2px 0px #450a0a, 0 4px 10px rgba(185,28,28,0.3)"
      : hovered
      ? "0 6px 0px #450a0a, 0 12px 24px rgba(185,28,28,0.55), 0 4px 8px rgba(0,0,0,0.3)"
      : "0 4px 0px #450a0a, 0 8px 18px rgba(185,28,28,0.45), 0 2px 6px rgba(0,0,0,0.3)",
    opacity: disabled ? 0.55 : 1,
    transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.15s ease",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={base}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
    >
      {/* gloss */}
      <span style={{
        position: "absolute", top: "3px", left: "14%", width: "72%", height: "38%",
        borderRadius: "999px", pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)",
      }} />
      {/* shadow bottom */}
      <span style={{
        position: "absolute", bottom: 0, left: 0, width: "100%", height: "40%",
        borderRadius: "0 0 0.75rem 0.75rem", pointerEvents: "none",
        background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.28) 100%)",
      }} />
      <X size={13} style={{ position: "relative", zIndex: 2, color: "#fff" }} />
      <span style={{ position: "relative", zIndex: 2, color: "#fff" }}>{label}</span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   GROUP GUIDE BOOKINGS
───────────────────────────────────────────────────────── */
function groupGuideBookings(bookings) {
  if (!bookings || bookings.length === 0) return [];
  const sorted = [...bookings].sort((a, b) => {
    const ca = new Date(a.createdAt).getTime();
    const cb = new Date(b.createdAt).getTime();
    if (Math.abs(ca - cb) < 10000) return new Date(a.bookingDate) - new Date(b.bookingDate);
    return cb - ca;
  });
  const groups = [];
  let i = 0;
  while (i < sorted.length) {
    const current = sorted[i];
    const group = [current];
    let j = i + 1;
    while (j < sorted.length) {
      const next        = sorted[j];
      const lastInGroup = group[group.length - 1];
      const sameGuide   = next.guideProfileId === current.guideProfileId;
      const sameStatus  = next.status === current.status;
      const sameBatch   = Math.abs(new Date(next.createdAt).getTime() - new Date(current.createdAt).getTime()) < 10000;
      const diffDays    = Math.round((new Date(next.bookingDate) - new Date(lastInGroup.bookingDate)) / 86400000);
      if (sameGuide && sameStatus && sameBatch && diffDays === 1) { group.push(next); j++; } else break;
    }
    groups.push(group);
    i = j;
  }
  return groups;
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
function MyBookingsPage() {
  const [tab, setTab]                       = useState("guides");
  const [guideBookings, setGuideBookings]   = useState([]);
  const [hotelReservations, setHotelReservations] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [cancelling, setCancelling]         = useState(null);
  const [error, setError]                   = useState("");

  const fetchAll = async () => {
    setLoading(true); setError("");
    try {
      const [guideRes, hotelRes] = await Promise.all([
        api.get("/api/guide-bookings/my-bookings").catch(() => ({ data: [] })),
        api.get("/api/reservations/my-reservations").catch(() => ({ data: [] })),
      ]);
      setGuideBookings(guideRes.data || []);
      setHotelReservations(hotelRes.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const cancelGuideGroup = async (group) => {
    const label = group.length > 1
      ? `Cancel all ${group.length} days in this booking range?`
      : "Cancel this guide booking?";
    if (!window.confirm(label)) return;
    const firstId = group[0].bookingId;
    setCancelling(firstId); setError("");
    try {
      await Promise.all(group.map((b) => api.delete(`/api/guide-bookings/${b.bookingId}`)));
      fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Cancellation failed");
    } finally { setCancelling(null); }
  };

  const cancelReservation = async (reservationId) => {
    if (!window.confirm("Cancel this hotel reservation?")) return;
    setCancelling(reservationId); setError("");
    try {
      await api.delete(`/api/reservations/${reservationId}`);
      fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Cancellation failed");
    } finally { setCancelling(null); }
  };

  const groupedGuideBookings = groupGuideBookings(guideBookings);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <style>{`
        /* ── Tab: Purple (Hotels) ── */
        .tab-purple {
          position: relative; overflow: hidden;
          display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.7rem 1.5rem;
          font-weight: 700; font-size: 0.88rem; letter-spacing: 0.02em;
          color: #fff; border: none; border-radius: 0.875rem;
          cursor: pointer; outline: none; font-family: inherit;
          background: linear-gradient(175deg, #5b21b6 0%, #7c3aed 45%, #8b5cf6 75%, #a78bfa 100%);
          transform: translateY(-2px);
          transition: transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.15s ease, filter 0.15s ease;
          box-shadow: 0 5px 0px #3b0764, 0 8px 20px rgba(124,58,237,0.45), 0 2px 6px rgba(0,0,0,0.35);
        }
        .tab-purple::before {
          content: ""; position: absolute; top: 4px; left: 15%; width: 70%; height: 38%;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(255,255,255,0.38) 0%, transparent 100%);
          pointer-events: none; z-index: 1;
        }
        .tab-purple::after {
          content: ""; position: absolute; bottom: 0; left: 0; width: 100%; height: 40%;
          border-radius: 0 0 0.875rem 0.875rem;
          background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.25) 100%);
          pointer-events: none; z-index: 0;
        }
        .tab-purple > * { position: relative; z-index: 2; color: #fff !important; }
        .tab-purple:hover {
          transform: translateY(-4px); filter: brightness(1.08);
          box-shadow: 0 7px 0px #3b0764, 0 14px 28px rgba(124,58,237,0.55), 0 4px 8px rgba(0,0,0,0.35);
        }
        .tab-purple:active { transform: translateY(1px); }

        /* ── Card ── */
        .booking-card {
          border-radius: 1rem;
          border: 1px solid var(--tz-card-border);
          padding: 1.25rem;
          background: var(--tz-card-bg);
          box-shadow: 0 2px 0px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.07);
          margin-bottom: 1rem;
        }

        /* ── Avatar initials ── */
        .guide-avatar-init {
          width: 3.5rem; height: 3.5rem; border-radius: 0.75rem; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.35rem; font-weight: 800; color: #fff;
          background: linear-gradient(135deg, #60a5fa 0%, #4f46e5 100%);
          box-shadow: 0 3px 0px rgba(30,58,138,0.4), 0 5px 14px rgba(59,130,246,0.35),
                      inset 0 1px 0 rgba(255,255,255,0.3);
          position: relative; overflow: hidden;
        }
        .guide-avatar-init::before {
          content: ""; position: absolute; top: 2px; left: 10%; width: 80%; height: 40%;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(255,255,255,0.38) 0%, transparent 100%);
          pointer-events: none;
        }
        .hotel-avatar-init {
          width: 3rem; height: 3rem; border-radius: 0.75rem; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
          box-shadow: 0 3px 0px rgba(59,7,100,0.4), 0 5px 14px rgba(124,58,237,0.35),
                      inset 0 1px 0 rgba(255,255,255,0.3);
          position: relative; overflow: hidden;
        }
        .hotel-avatar-init::before {
          content: ""; position: absolute; top: 2px; left: 10%; width: 80%; height: 40%;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 100%);
          pointer-events: none;
        }

        /* ── Multi-day badge ── */
        .multiday-badge {
          display: inline-flex; align-items: center;
          font-size: 0.72rem; font-weight: 700;
          padding: 0.2rem 0.6rem; border-radius: 999px;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.3);
          color: #6366f1;
        }

        /* ── Empty state ── */
        .empty-state {
          border-radius: 1.5rem; padding: 4rem 2rem; text-align: center;
          background: var(--tz-card-bg);
          border: 1px solid var(--tz-card-border);
        }
        .empty-icon-wrap {
          width: 4rem; height: 4rem; border-radius: 1rem; margin: 0 auto 1rem;
          display: flex; align-items: center; justify-content: center;
          background: var(--tz-surface-2);
          box-shadow: 0 3px 0px rgba(0,0,0,0.1), 0 5px 14px rgba(0,0,0,0.08),
                      inset 0 1px 0 rgba(255,255,255,0.2);
        }
      `}</style>

      <div>
        {/* ── Page header ── */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--tz-text)", margin: 0 }}>
            My Bookings
          </h1>
          <p style={{ color: "var(--tz-text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            All your travel bookings in one place
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: "1rem", background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)", color: "#dc2626",
            padding: "0.75rem 1rem", borderRadius: "0.75rem", fontSize: "0.875rem",
          }}>
            {error}
          </div>
        )}

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setTab("guides")}
            className={tab === "guides" ? "btn-3d-blue" : "btn-3d-slate"}
            style={{ borderRadius: "0.875rem" }}
          >
            <User size={15} />
            <span>Guide Bookings</span>
            <span style={{
              fontSize: "0.72rem", padding: "0.15rem 0.5rem", borderRadius: "999px",
              background: tab === "guides" ? "rgba(255,255,255,0.22)" : "var(--tz-surface-2)",
              color: tab === "guides" ? "#fff" : "var(--tz-text-muted)",
            }}>
              {groupedGuideBookings.length}
            </span>
          </button>

          <button
            onClick={() => setTab("hotels")}
            className={tab !== "hotels" ? "btn-3d-slate" : "tab-purple"}
            style={{ borderRadius: "0.875rem" }}
          >
            <Building2 size={15} />
            <span>Hotel Reservations</span>
            <span style={{
              fontSize: "0.72rem", padding: "0.15rem 0.5rem", borderRadius: "999px",
              background: tab === "hotels" ? "rgba(255,255,255,0.22)" : "var(--tz-surface-2)",
              color: tab === "hotels" ? "#fff" : "var(--tz-text-muted)",
            }}>
              {hotelReservations.length}
            </span>
          </button>
        </div>

        {/* ══════════════════════════════════════════
            GUIDE BOOKINGS TAB
        ══════════════════════════════════════════ */}
        {tab === "guides" && (
          groupedGuideBookings.length === 0
            ? (
              <div className="empty-state">
                <div className="empty-icon-wrap">
                  <User size={30} style={{ color: "var(--tz-text-faint)" }} />
                </div>
                <p style={{ color: "var(--tz-text)", fontWeight: 600, margin: "0 0 0.25rem" }}>
                  No guide bookings yet
                </p>
                <p style={{ color: "var(--tz-text-muted)", fontSize: "0.875rem", margin: 0 }}>
                  Browse guides and book your first tour
                </p>
              </div>
            ) : (
              <div>
                {groupedGuideBookings.map((group) => {
                  const first      = group[0];
                  const last       = group[group.length - 1];
                  const isMultiDay = group.length > 1;
                  const si         = STATUS_INLINE[first.status] || STATUS_INLINE.PENDING;
                  const s          = STATUS_STYLES[first.status] || STATUS_STYLES.PENDING;
                  const StatusIcon = s.icon;
                  const groupTotal = group.reduce((sum, b) => sum + parseFloat(b.totalPrice), 0);
                  const dateLabel  = isMultiDay
                    ? `${first.bookingDate} → ${last.bookingDate}`
                    : first.bookingDate;
                  const isCancelling = cancelling === first.bookingId;
                  const canCancel    = first.status === "PENDING" || first.status === "CONFIRMED";

                  return (
                    <div key={`group-${first.bookingId}`} className="booking-card">
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>

                        {/* Avatar */}
                        {first.guideProfilePhoto ? (
                          <img
                            src={first.guideProfilePhoto}
                            alt={first.guideName}
                            style={{
                              width: "3.5rem", height: "3.5rem", borderRadius: "0.75rem",
                              objectFit: "cover", flexShrink: 0,
                              border: "2px solid var(--tz-border)",
                            }}
                          />
                        ) : (
                          <div className="guide-avatar-init">
                            <span style={{ position: "relative", zIndex: 2 }}>
                              {first.guideName?.charAt(0)}
                            </span>
                          </div>
                        )}

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Name + badges */}
                          <div style={{
                            display: "flex", alignItems: "center", gap: "0.5rem",
                            flexWrap: "wrap", marginBottom: "0.35rem",
                          }}>
                            <span style={{
                              fontWeight: 700, fontSize: "0.95rem",
                              color: "var(--tz-text)", whiteSpace: "nowrap",
                            }}>
                              {first.guideName}
                            </span>

                            {/* Status badge */}
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: "0.3rem",
                              fontSize: "0.72rem", fontWeight: 700,
                              padding: "0.2rem 0.6rem", borderRadius: "999px",
                              background: si.bg, border: `1px solid ${si.border}`, color: si.color,
                            }}>
                              <StatusIcon size={10} style={{ color: si.color }} />
                              {s.label}
                            </span>

                            {isMultiDay && (
                              <span className="multiday-badge">{group.length} days</span>
                            )}
                          </div>

                          {/* Date + total */}
                          <div style={{
                            display: "flex", alignItems: "center", gap: "1.25rem",
                            flexWrap: "wrap", fontSize: "0.825rem",
                            color: "var(--tz-text-muted)",
                          }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                              <CalendarDays size={13} style={{ color: "var(--tz-text-faint)" }} />
                              {dateLabel}
                            </span>
                            <span style={{
                              fontWeight: 700, color: "var(--tz-text)",
                            }}>
                              LKR {groupTotal.toLocaleString("en-LK", {
                                minimumFractionDigits: 2, maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Cancel button */}
                        {canCancel && (
                          <CancelButton
                            onClick={() => cancelGuideGroup(group)}
                            disabled={isCancelling}
                            label={isCancelling ? "Cancelling…" : "Cancel"}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
        )}

        {/* ══════════════════════════════════════════
            HOTEL RESERVATIONS TAB
        ══════════════════════════════════════════ */}
        {tab === "hotels" && (
          hotelReservations.length === 0
            ? (
              <div className="empty-state">
                <div className="empty-icon-wrap">
                  <Building2 size={30} style={{ color: "var(--tz-text-faint)" }} />
                </div>
                <p style={{ color: "var(--tz-text)", fontWeight: 600, margin: "0 0 0.25rem" }}>
                  No hotel reservations yet
                </p>
                <p style={{ color: "var(--tz-text-muted)", fontSize: "0.875rem", margin: 0 }}>
                  Browse hotels and make your first reservation
                </p>
              </div>
            ) : (
              <div>
                {hotelReservations.map((res) => {
                  const si         = STATUS_INLINE[res.status] || STATUS_INLINE.PENDING;
                  const s          = STATUS_STYLES[res.status]  || STATUS_STYLES.PENDING;
                  const StatusIcon = s.icon;
                  const nights     = Math.round(
                    (new Date(res.checkOut) - new Date(res.checkIn)) / 86400000
                  );
                  const canCancel    = res.status === "PENDING" || res.status === "CONFIRMED";
                  const isCancelling = cancelling === res.reservationId;

                  return (
                    <div key={res.reservationId} className="booking-card">
                      {/* Top row */}
                      <div style={{
                        display: "flex", alignItems: "flex-start",
                        justifyContent: "space-between", gap: "1rem", flexWrap: "wrap",
                        marginBottom: "0.875rem",
                      }}>
                        {/* Hotel info */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                          <div className="hotel-avatar-init">
                            <Building2
                              size={20}
                              style={{ position: "relative", zIndex: 2, color: "#fff" }}
                            />
                          </div>
                          <div>
                            <p style={{
                              fontWeight: 700, fontSize: "0.95rem",
                              color: "var(--tz-text)", margin: "0 0 0.15rem",
                            }}>
                              {res.hotelName}
                            </p>
                            <p style={{
                              color: "var(--tz-text-muted)", fontSize: "0.78rem", margin: 0,
                            }}>
                              {res.hotelLocation} · {res.roomType}
                            </p>
                          </div>
                        </div>

                        {/* Status badge */}
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "0.35rem",
                          fontSize: "0.78rem", fontWeight: 700,
                          padding: "0.3rem 0.75rem", borderRadius: "999px",
                          background: si.bg, border: `1px solid ${si.border}`, color: si.color,
                          flexShrink: 0,
                        }}>
                          <StatusIcon size={11} style={{ color: si.color }} />
                          {s.label}
                        </span>
                      </div>

                      {/* Dates + total */}
                      <div style={{
                        display: "flex", alignItems: "center", gap: "1.5rem",
                        flexWrap: "wrap", fontSize: "0.825rem",
                        color: "var(--tz-text-muted)",
                      }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <CalendarDays size={13} style={{ color: "var(--tz-text-faint)" }} />
                          {res.checkIn} → {res.checkOut}
                          <span style={{ color: "var(--tz-text-faint)", fontSize: "0.72rem" }}>
                            ({nights} night{nights !== 1 ? "s" : ""})
                          </span>
                        </span>
                        <span style={{ fontWeight: 700, color: "var(--tz-text)" }}>
                          LKR {parseFloat(res.totalPrice).toLocaleString("en-LK", {
                            minimumFractionDigits: 2, maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>

                      {/* Cancel button */}
                      {canCancel && (
                        <div style={{
                          marginTop: "0.875rem", paddingTop: "0.875rem",
                          borderTop: "1px solid var(--tz-border-soft)",
                        }}>
                          <CancelButton
                            onClick={() => cancelReservation(res.reservationId)}
                            disabled={isCancelling}
                            label={isCancelling ? "Cancelling…" : "Cancel Reservation"}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
        )}
      </div>
    </>
  );
}

export default MyBookingsPage;