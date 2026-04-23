// NotificationPanel.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, CheckCheck, X, CreditCard, Calendar, Hotel, Info } from "lucide-react";
import api from "../../api/axios";

// ─── Notification type → icon / colour ───────────────────────────────────────
const TYPE_CONFIG = {
  PAYMENT:     { icon: CreditCard, color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.2)"  },
  BOOKING:     { icon: Calendar,   color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.2)"  },
  RESERVATION: { icon: Hotel,      color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.2)"  },
  REVIEW:      { icon: Info,       color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)"  },
  SYSTEM:      { icon: Info,       color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)"  },
};

// ─── Route resolver — returns { path, tab? } or null ─────────────────────────
function resolveRoute(group, userRole) {
  const title   = (group.title   || "").toLowerCase();
  const message = (group.message || "").toLowerCase();
  const type    = (group.type    || "").toUpperCase();
  const role    = (userRole      || "").toUpperCase();

  // ── 1. PAYMENT ────────────────────────────────────────────────────────────
  if (
    type === "PAYMENT"                   ||
    title.includes("payment")            ||
    message.includes("payment")          ||
    title.includes("lkr")                ||
    message.includes("lkr")              ||
    title.includes("payment successful") ||
    title.includes("payment failed")
  ) {
    if (role === "GUIDE")       return { path: "/dashboard/guide-payments" };
    if (role === "HOTEL_OWNER") return { path: "/dashboard/hotel-payments" };
    return { path: "/dashboard/payments" };
  }

  // ── 2. TOURIST ────────────────────────────────────────────────────────────
  if (role === "TOURIST") {
    if (
      title.includes("stay completed")   ||
      message.includes("leave a review") ||
      title.includes("leave a review")   ||
      type === "REVIEW"
    ) return { path: "/dashboard/my-reviews" };

    if (
      title.includes("reservation request sent") ||
      title.includes("reservation confirmed")    ||
      title.includes("reservation cancelled")    ||
      message.includes("reservation at")         ||
      (type === "RESERVATION" && !title.includes("payment"))
    ) return { path: "/dashboard/bookings", tab: "hotels" };

    if (
      title.includes("booking request sent")  ||
      title.includes("booking confirmed")     ||
      title.includes("booking rejected")      ||
      title.includes("booking cancelled")     ||
      message.includes("booking request")     ||
      message.includes("booking for")         ||
      (type === "BOOKING" && !title.includes("payment"))
    ) return { path: "/dashboard/bookings", tab: "guides" };

    if (title.includes("confirmed") || title.includes("rejected")) {
      return { path: "/dashboard/bookings", tab: "guides" };
    }
  }

  // ── 3. GUIDE ──────────────────────────────────────────────────────────────
  if (role === "GUIDE") {
    if (
      title.includes("new review") ||
      title.includes("review")     ||
      type === "REVIEW"
    ) return { path: "/dashboard/guide-reviews" };

    if (
      title.includes("new booking request") ||
      title.includes("booking request")     ||
      title.includes("booking confirmed")   ||
      title.includes("booking cancelled")   ||
      title.includes("booking")             ||
      type === "BOOKING"
    ) return { path: "/dashboard/guide-bookings" };
  }

  // ── 4. HOTEL_OWNER ────────────────────────────────────────────────────────
  if (role === "HOTEL_OWNER") {
    if (
      title.includes("new review") ||
      title.includes("review")     ||
      type === "REVIEW"
    ) return { path: "/dashboard/hotel-reviews" };

    if (
      title.includes("new reservation request") ||
      title.includes("reservation request")     ||
      title.includes("reservation confirmed")   ||
      title.includes("reservation cancelled")   ||
      title.includes("reservation")             ||
      type === "RESERVATION"
    ) return { path: "/dashboard/hotel-reservations" };
  }

  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function buildGroupedMessage(group) {
  const datePattern = /(\d{4}-\d{2}-\d{2})/g;
  const lastMessage = group.message || "";
  const dates = [...lastMessage.matchAll(datePattern)].map((m) => m[1]);
  if (dates.length >= 2) return lastMessage;
  if (dates.length === 1 && group.count > 1) {
    return lastMessage.replace(dates[0], `${group.count} days including ${dates[0]}`);
  }
  return `${group.message} (${group.count} notifications grouped)`;
}

function groupNotifications(notifications) {
  if (!notifications.length) return [];
  const sorted = [...notifications].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );
  const stem = (title) => (title || "").toLowerCase().trim();
  const groups = [];
  let current = null;

  for (const n of sorted) {
    const ts = new Date(n.createdAt).getTime();
    const withinWindow =
      current &&
      current.type        === n.type &&
      stem(current.title) === stem(n.title) &&
      Math.abs(ts - current.lastTs) < 15_000;

    if (withinWindow) {
      current.ids.push(n.id);
      current.lastTs    = ts;
      if (!n.read) current.read = false;
      current.count    += 1;
      current.message   = n.message;
      current.createdAt = n.createdAt;
    } else {
      if (current) groups.push(current);
      current = {
        id:        n.id,
        ids:       [n.id],
        type:      n.type,
        title:     n.title,
        message:   n.message,
        createdAt: n.createdAt,
        read:      n.read,
        lastTs:    ts,
        count:     1,
      };
    }
  }
  if (current) groups.push(current);
  return groups.reverse();
}

function countUnread(notifList) {
  return notifList.filter((n) => !n.read).length;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function NotificationPanel({ userRole }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen]             = useState(false);
  const [notifications, setNotifs]  = useState([]);
  const [unread, setUnread]         = useState(0);
  const [loading, setLoading]       = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const panelRef                    = useRef(null);

  // ── Fetch unread count (skips when panel is open) ─────────────────────────
  const fetchCount = useCallback(async () => {
    if (open) return;
    try {
      const { data } = await api.get("/api/notifications/unread-count");
      setUnread(data.count ?? 0);
    } catch { /* silently fail */ }
  }, [open]);

  useEffect(() => {
    fetchCount();
    const id = setInterval(fetchCount, 30_000);
    return () => clearInterval(id);
  }, [fetchCount]);

  // ── Fetch full list when panel opens ──────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api.get("/api/notifications")
      .then(({ data }) => {
        setNotifs(data);
        setUnread(countUnread(data));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ── Mark ALL read ─────────────────────────────────────────────────────────
  const markAllRead = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (markingAll || unread === 0) return;
    setMarkingAll(true);

    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);

    try {
      await api.patch("/api/notifications/mark-all-read");
      const { data } = await api.get("/api/notifications");
      setNotifs(data);
      setUnread(countUnread(data));
    } catch (err) {
      console.error("Failed to mark all read", err);
      try {
        const { data } = await api.get("/api/notifications");
        setNotifs(data);
        setUnread(countUnread(data));
      } catch { /* silently fail */ }
    } finally {
      setMarkingAll(false);
    }
  };

  // ── Mark one group read then navigate ─────────────────────────────────────
  const handleGroupClick = async (group) => {
    if (!group.read) {
      const idSet = new Set(group.ids);
      setNotifs((prev) => {
        const updated = prev.map((n) => (idSet.has(n.id) ? { ...n, read: true } : n));
        setUnread(countUnread(updated));
        return updated;
      });
      Promise.all(
        group.ids.map((id) => api.patch(`/api/notifications/${id}/read`))
      ).catch((err) => console.error("Failed to mark notification read", err));
    }

    const resolved = resolveRoute(group, userRole);
    if (resolved) {
      setOpen(false);
      const navState = {
        tab:     resolved.tab ?? null,
        refresh: Date.now(),
      };
      if (location.pathname === resolved.path) {
        navigate(resolved.path, { replace: true, state: navState });
      } else {
        navigate(resolved.path, { state: navState });
      }
    }
  };

  const grouped = groupNotifications(notifications);

  return (
    <>
      <style>{`
        .notif-bell-btn {
          position: relative; width: 2.4rem; height: 2.4rem;
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer; border-radius: 0.875rem;
          background: linear-gradient(175deg, var(--tz-surface-2, #f1f5f9) 0%, var(--tz-border, #e2e8f0) 100%);
          color: var(--tz-text-muted); transform: translateY(-1px);
          box-shadow: 0 3px 0px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.07), inset 0 1px 0px rgba(255,255,255,0.6);
          transition: transform 0.15s ease, box-shadow 0.15s ease, color 0.15s ease; overflow: hidden;
        }
        .notif-bell-btn::before {
          content: ""; position: absolute; top: 3px; left: 15%; width: 70%; height: 38%;
          border-radius: 999px; background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%);
          pointer-events: none;
        }
        .notif-bell-btn svg { position: relative; z-index: 2; }
        .notif-bell-btn:hover {
          transform: translateY(-3px); color: var(--tz-text);
          box-shadow: 0 5px 0px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.10), inset 0 1px 0px rgba(255,255,255,0.6);
        }
        .notif-bell-btn:active {
          transform: translateY(1px);
          box-shadow: 0 1px 0px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.07), inset 0 1px 0px rgba(255,255,255,0.4);
        }
        [data-theme="dark"] .notif-bell-btn {
          background: linear-gradient(175deg, #1e293b 0%, #273344 50%, #1e293b 100%);
          box-shadow: 0 3px 0px #0f172a, 0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0px rgba(255,255,255,0.07);
        }
        [data-theme="dark"] .notif-bell-btn:hover {
          box-shadow: 0 5px 0px #0f172a, 0 8px 20px rgba(0,0,0,0.45), inset 0 1px 0px rgba(255,255,255,0.07);
        }
        .notif-badge {
          position: absolute; top: 4px; right: 4px; min-width: 16px; height: 16px; padding: 0 3px;
          background: #ef4444; border-radius: 999px; border: 2px solid var(--tz-surface);
          font-size: 0.6rem; font-weight: 900; color: #fff;
          display: flex; align-items: center; justify-content: center; z-index: 3;
          animation: badge-pop 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes badge-pop { from { transform: scale(0); } to { transform: scale(1); } }
        .notif-dot {
          position: absolute; top: 6px; right: 6px; width: 8px; height: 8px;
          background: #3b82f6; border-radius: 999px; border: 2px solid var(--tz-surface);
          box-shadow: 0 0 0 2px rgba(59,130,246,0.35); z-index: 3;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 2px rgba(59,130,246,0.35); }
          50%       { box-shadow: 0 0 0 4px rgba(59,130,246,0.15); }
        }
        .notif-panel {
          position: absolute; top: calc(100% + 12px); right: 0; width: 360px; max-height: 520px;
          border-radius: 1.25rem; background: var(--tz-card-bg, #fff); border: 1px solid var(--tz-card-border, #e2e8f0);
          box-shadow: 0 8px 0px rgba(0,0,0,0.08), 0 20px 48px rgba(0,0,0,0.14);
          display: flex; flex-direction: column; overflow: hidden; z-index: 9999;
          animation: panel-drop 0.22s cubic-bezier(0.34,1.3,0.64,1); transform-origin: top right;
        }
        @keyframes panel-drop {
          from { opacity: 0; transform: scale(0.9) translateY(-8px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }
        .notif-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 1.25rem 0.75rem; border-bottom: 1px solid var(--tz-border, #e2e8f0); flex-shrink: 0;
        }
        .notif-scroll { overflow-y: auto; flex: 1; }
        .notif-scroll::-webkit-scrollbar { width: 4px; }
        .notif-scroll::-webkit-scrollbar-track { background: transparent; }
        .notif-scroll::-webkit-scrollbar-thumb { background: var(--tz-border); border-radius: 99px; }
        .notif-item {
          display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.875rem 1.25rem;
          border-bottom: 1px solid var(--tz-border-soft, #f1f5f9); cursor: pointer;
          transition: background 0.15s ease; position: relative;
        }
        .notif-item:hover { background: var(--tz-surface-2, #f8fafc); }
        .notif-item:last-child { border-bottom: none; }
        .notif-item.unread { background: rgba(59,130,246,0.03); }
        .notif-item.unread:hover { background: rgba(59,130,246,0.06); }
        .notif-item.clickable:hover .notif-title { color: #3b82f6; }
        .notif-unread-bar {
          position: absolute; left: 0; top: 50%; transform: translateY(-50%);
          width: 3px; height: 60%; background: #3b82f6; border-radius: 0 2px 2px 0;
        }
        .notif-count-chip {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px;
          font-size: 0.6rem; font-weight: 900; background: rgba(59,130,246,0.15);
          color: #3b82f6; border: 1px solid rgba(59,130,246,0.25); margin-left: 0.35rem; flex-shrink: 0;
        }
        /* ── View badge — shown on ALL routable notifications ── */
        .notif-view-badge {
          display: inline-flex; align-items: center; gap: 0.25rem;
          font-size: 0.7rem; font-weight: 700;
          padding: 0.18rem 0.55rem; border-radius: 0.4rem;
          background: rgba(59,130,246,0.10);
          border: 1px solid rgba(59,130,246,0.22);
          color: #3b82f6; pointer-events: none; flex-shrink: 0;
          transition: background 0.15s ease;
        }
        .notif-item.clickable:hover .notif-view-badge {
          background: rgba(59,130,246,0.18);
          border-color: rgba(59,130,246,0.35);
        }
        .mark-all-btn {
          display: flex; align-items: center; gap: 0.3rem;
          font-size: 0.72rem; font-weight: 700; color: #3b82f6;
          background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2);
          border-radius: 0.5rem; padding: 0.3rem 0.65rem;
          cursor: pointer; transition: opacity 0.15s, background 0.15s;
        }
        .mark-all-btn:hover:not(:disabled) { background: rgba(59,130,246,0.15); }
        .mark-all-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ position: "relative" }} ref={panelRef}>

        {/* ── Bell trigger ── */}
        <button
          className="notif-bell-btn"
          aria-label="Notifications"
          onClick={() => setOpen((o) => !o)}
        >
          <Bell size={15} />
          {unread > 0
            ? <span className="notif-badge">{unread > 99 ? "99+" : unread}</span>
            : <span className="notif-dot" />}
        </button>

        {/* ── Dropdown ── */}
        {open && (
          <div className="notif-panel">

            {/* Header */}
            <div className="notif-header">
              <div>
                <h3 style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--tz-text)" }}>
                  Notifications
                </h3>
                {unread > 0 && (
                  <p style={{ fontSize: "0.72rem", color: "var(--tz-text-muted)", marginTop: "0.1rem" }}>
                    {unread} unread
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                {unread > 0 && (
                  <button
                    type="button"
                    className="mark-all-btn"
                    onClick={markAllRead}
                    disabled={markingAll}
                    title="Mark all as read"
                  >
                    {markingAll
                      ? <div style={{ width: 12, height: 12, border: "2px solid #3b82f6", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      : <CheckCheck size={12} />}
                    {markingAll ? "Marking…" : "Mark all read"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    width: "1.75rem", height: "1.75rem", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    background: "var(--tz-surface-2)", border: "1px solid var(--tz-border)",
                    borderRadius: "0.5rem", cursor: "pointer", color: "var(--tz-text-muted)",
                  }}
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="notif-scroll">
              {loading ? (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "2rem", gap: "0.5rem", color: "var(--tz-text-muted)", fontSize: "0.85rem",
                }}>
                  <div style={{
                    width: 18, height: 18, border: "2.5px solid #3b82f6",
                    borderTopColor: "transparent", borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  Loading...
                </div>
              ) : grouped.length === 0 ? (
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "2.5rem 1rem", color: "var(--tz-text-faint)",
                }}>
                  <Bell size={32} style={{ marginBottom: "0.75rem", opacity: 0.4 }} />
                  <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--tz-text-muted)" }}>
                    All caught up!
                  </p>
                  <p style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>No notifications yet.</p>
                </div>
              ) : (
                grouped.map((g) => {
                  const cfg      = TYPE_CONFIG[g.type] || TYPE_CONFIG.SYSTEM;
                  const Icon     = cfg.icon;
                  const resolved = resolveRoute(g, userRole);
                  const hasRoute = Boolean(resolved);

                  return (
                    <div
                      key={g.id}
                      className={`notif-item${!g.read ? " unread" : ""}${hasRoute ? " clickable" : ""}`}
                      onClick={() => handleGroupClick(g)}
                      title={hasRoute ? "Click to view" : undefined}
                    >
                      {!g.read && <span className="notif-unread-bar" />}

                      {/* Type icon */}
                      <div style={{
                        width: 36, height: 36, borderRadius: "0.75rem", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: cfg.bg, border: `1px solid ${cfg.border}`,
                      }}>
                        <Icon size={16} style={{ color: cfg.color }} />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>

                        {/* Title row */}
                        <div style={{
                          display: "flex", alignItems: "center",
                          justifyContent: "space-between", gap: "0.5rem",
                        }}>
                          <p
                            className="notif-title"
                            style={{
                              fontWeight: g.read ? 600 : 800,
                              fontSize: "0.82rem",
                              color: "var(--tz-text)",
                              lineHeight: 1.3,
                              display: "flex", alignItems: "center", flexWrap: "wrap",
                              transition: "color 0.15s",
                              margin: 0,
                            }}
                          >
                            {g.title}
                            {g.count > 1 && (
                              <span className="notif-count-chip">{g.count}×</span>
                            )}
                          </p>
                          {!g.read && (
                            <span style={{
                              width: 7, height: 7, borderRadius: "50%",
                              background: "#3b82f6", flexShrink: 0,
                            }} />
                          )}
                        </div>

                        {/* Message */}
                        <p style={{
                          fontSize: "0.75rem", color: "var(--tz-text-muted)",
                          lineHeight: 1.45, margin: "0.2rem 0 0",
                        }}>
                          {g.count > 1 ? buildGroupedMessage(g) : g.message}
                        </p>

                        {/* ── Bottom row: timestamp + View badge ── */}
                        <div style={{
                          display: "flex", alignItems: "center",
                          justifyContent: "space-between", marginTop: "0.35rem",
                        }}>
                          <p style={{ fontSize: "0.68rem", color: "var(--tz-text-faint)", margin: 0 }}>
                            {timeAgo(g.createdAt)}
                          </p>

                          {/* View badge — shown for ALL routable notifications */}
                          {hasRoute && (
                            <span className="notif-view-badge">
                              View
                              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                                <path
                                  d="M1.5 7.5L7.5 1.5M7.5 1.5H3M7.5 1.5V6"
                                  stroke="#3b82f6" strokeWidth="1.5"
                                  strokeLinecap="round" strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {grouped.length > 0 && (
              <div style={{
                padding: "0.75rem 1.25rem",
                borderTop: "1px solid var(--tz-border)",
                flexShrink: 0, textAlign: "center",
              }}>
                <p style={{ fontSize: "0.72rem", color: "var(--tz-text-faint)", margin: 0 }}>
                  Showing last {grouped.length} notification{grouped.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}