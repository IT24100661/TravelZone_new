import { useAuth } from "../../auth/AuthContext";
import ThemeToggle from "../ui/ThemeToggle";
import NotificationPanel from "../ui/NotificationPanel";

const roleTheme = {
  TOURIST:     { bg: "#d1fae5", text: "#065f46", shadow: "#6ee7b7" },
  GUIDE:       { bg: "#dbeafe", text: "#1e40af", shadow: "#93c5fd" },
  HOTEL_OWNER: { bg: "#ede9fe", text: "#5b21b6", shadow: "#c4b5fd" },
  ADMIN:       { bg: "#ffe4e6", text: "#9f1239", shadow: "#fda4af" },
};

const roleAvatarGradient = {
  TOURIST:     { from: "#34d399", to: "#0d9488", shadow: "rgba(52,211,153,0.5)" },
  GUIDE:       { from: "#60a5fa", to: "#4f46e5", shadow: "rgba(96,165,250,0.5)" },
  HOTEL_OWNER: { from: "#a78bfa", to: "#7c3aed", shadow: "rgba(167,139,250,0.5)" },
  ADMIN:       { from: "#f87171", to: "#dc2626", shadow: "rgba(248,113,113,0.5)" },
};

function Topbar() {
  const { user } = useAuth();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  const role    = user?.role || "TOURIST";
  const theme   = roleTheme[role]          || roleTheme.GUIDE;
  const avatar  = roleAvatarGradient[role] || roleAvatarGradient.GUIDE;
  const initial   = user?.name?.charAt(0)?.toUpperCase() || "?";
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <>
      <style>{`
        .topbar {
          position: sticky; top: 0; z-index: 40;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.75rem 1.5rem;
          background: var(--tz-surface);
          border-bottom: 1px solid var(--tz-border);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: background 0.3s ease, border-color 0.3s ease;
          box-shadow: 0 1px 0px var(--tz-border), 0 4px 16px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03);
        }
        .role-badge {
          position: relative; overflow: hidden;
          display: inline-flex; align-items: center;
          padding: 0.3rem 0.9rem;
          border-radius: 999px;
          font-size: 0.72rem; font-weight: 800;
          letter-spacing: 0.06em; text-transform: uppercase;
          user-select: none;
          transform: translateY(-1px);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .role-badge::before {
          content: "";
          position: absolute; top: 2px; left: 12%; width: 76%; height: 45%;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%);
          pointer-events: none;
        }
        .role-badge:hover { transform: translateY(-2px); }
        .topbar-avatar {
          position: relative; overflow: hidden;
          width: 2.4rem; height: 2.4rem;
          border-radius: 0.875rem;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.95rem; font-weight: 900;
          color: #fff;
          transform: translateY(-1px);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          cursor: default; user-select: none;
        }
        .topbar-avatar::before {
          content: "";
          position: absolute; top: 3px; left: 10%; width: 80%; height: 42%;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%);
          pointer-events: none; z-index: 1;
        }
        .topbar-avatar::after {
          content: "";
          position: absolute; bottom: 0; left: 0; width: 100%; height: 38%;
          border-radius: 0 0 0.875rem 0.875rem;
          background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.25) 100%);
          pointer-events: none; z-index: 0;
        }
        .topbar-avatar span { position: relative; z-index: 2; text-shadow: 0 1px 3px rgba(0,0,0,0.3); }
        .topbar-avatar:hover { transform: translateY(-3px); }
        .topbar-greeting-date { font-size: 0.72rem; font-weight: 500; color: var(--tz-text-muted); letter-spacing: 0.01em; }
        .topbar-greeting-name { font-size: 1rem; font-weight: 800; color: var(--tz-text); line-height: 1.3; margin-top: 0.05rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <header className="topbar">

        {/* LEFT: Greeting */}
        <div>
          <p className="topbar-greeting-date">{today}</p>
          <h2 className="topbar-greeting-name">Hey, {firstName} 👋</h2>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-2.5">

          {/* Role badge */}
          <span
            className="role-badge hidden sm:inline-flex"
            style={{
              backgroundColor: theme.bg,
              color: theme.text,
              boxShadow: `0 3px 0px ${theme.shadow}55, 0 4px 10px ${theme.shadow}33`,
            }}
          >
            {role.replace("_", " ")}
          </span>

          {/* Theme toggle */}
          <ThemeToggle variant="icon" />

          {/* ── Notification panel (replaces old static bell button) ── */}
          <NotificationPanel />

          {/* Avatar */}
          <div
            className="topbar-avatar"
            title={user?.name}
            style={{
              background: `linear-gradient(145deg, ${avatar.from} 0%, ${avatar.to} 100%)`,
              boxShadow: `0 4px 0px ${avatar.to}99, 0 6px 16px ${avatar.shadow}, inset 0 1px 0px rgba(255,255,255,0.3)`,
            }}
          >
            <span>{initial}</span>
          </div>

        </div>
      </header>
    </>
  );
}

export default Topbar;