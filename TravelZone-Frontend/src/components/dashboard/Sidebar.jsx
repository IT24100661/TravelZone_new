import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, User, MapPinned, Building2,
  CalendarCheck, LogOut, Compass, ClipboardList,
  ChevronRight, CreditCard, Star, Users, MapPin,
  BedDouble, ShieldCheck
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

const roleTheme = {
  TOURIST: {
    gradient: "from-emerald-400 to-teal-500",
    shadow:   "rgba(5,150,105,0.35)",
    floor:    "#065f46",
    active:   "rgba(16,185,129,0.1)",
    color:    "#10b981",
    border:   "rgba(16,185,129,0.25)",
    dot:      "#10b981",
    badge:    { bg: "rgba(16,185,129,0.12)", color: "#10b981", border: "rgba(16,185,129,0.2)" },
  },
  GUIDE: {
    gradient: "from-blue-400 to-sky-500",
    shadow:   "rgba(37,99,235,0.35)",
    floor:    "#1e3a8a",
    active:   "rgba(59,130,246,0.1)",
    color:    "#3b82f6",
    border:   "rgba(59,130,246,0.25)",
    dot:      "#3b82f6",
    badge:    { bg: "rgba(59,130,246,0.12)", color: "#3b82f6", border: "rgba(59,130,246,0.2)" },
  },
  HOTEL_OWNER: {
    gradient: "from-violet-400 to-purple-500",
    shadow:   "rgba(109,40,217,0.35)",
    floor:    "#4c1d95",
    active:   "rgba(139,92,246,0.1)",
    color:    "#8b5cf6",
    border:   "rgba(139,92,246,0.25)",
    dot:      "#8b5cf6",
    badge:    { bg: "rgba(139,92,246,0.12)", color: "#8b5cf6", border: "rgba(139,92,246,0.2)" },
  },
  ADMIN: {
    gradient: "from-rose-400 to-pink-500",
    shadow:   "rgba(225,29,72,0.35)",
    floor:    "#881337",
    active:   "rgba(244,63,94,0.1)",
    color:    "#f43f5e",
    border:   "rgba(244,63,94,0.25)",
    dot:      "#f43f5e",
    badge:    { bg: "rgba(244,63,94,0.12)", color: "#f43f5e", border: "rgba(244,63,94,0.2)" },
  },
};

function Sidebar() {
  const { pathname }     = useLocation();
  const { user, logout } = useAuth();
  const theme = roleTheme[user?.role] || roleTheme.TOURIST;

  const commonItems = [
    { label: "Dashboard",  to: "/dashboard",         icon: LayoutDashboard },
    { label: "My Profile", to: "/dashboard/profile", icon: User },
  ];

  const roleItems = {
    TOURIST: [
      { label: "Browse Guides", to: "/dashboard/guides",      icon: Compass },
      { label: "Browse Hotels", to: "/dashboard/hotels",      icon: Building2 },
      { label: "My Bookings",   to: "/dashboard/bookings",    icon: CalendarCheck },
      { label: "Payments",      to: "/dashboard/payments",    icon: CreditCard },
      { label: "My Reviews",    to: "/dashboard/my-reviews",  icon: Star },
    ],
    GUIDE: [
      { label: "Guide Profile",    to: "/dashboard/guide-profile",  icon: MapPinned },
      { label: "Booking Requests", to: "/dashboard/guide-bookings", icon: CalendarCheck },
      { label: "Payments",         to: "/dashboard/guide-payments", icon: CreditCard },
      { label: "Reviews",          to: "/dashboard/guide-reviews",  icon: Star },
    ],
    HOTEL_OWNER: [
      { label: "My Hotels",    to: "/dashboard/my-hotels",          icon: Building2 },
      { label: "Manage Rooms", to: "/dashboard/rooms",              icon: CalendarCheck },
      { label: "Reservations", to: "/dashboard/hotel-reservations", icon: ClipboardList },
      { label: "Payments",     to: "/dashboard/hotel-payments",     icon: CreditCard },
      { label: "Reviews",      to: "/dashboard/hotel-reviews",      icon: Star },
    ],
    ADMIN: [
      { label: "Overview",     to: "/dashboard/admin",              icon: ShieldCheck },
      { label: "Users",        to: "/dashboard/admin/users",        icon: Users },
      { label: "Guides",       to: "/dashboard/admin/guides",       icon: MapPin },
      { label: "Hotels",       to: "/dashboard/admin/hotels",       icon: Building2 },
      { label: "Bookings",     to: "/dashboard/admin/bookings",     icon: CalendarCheck },
      { label: "Reservations", to: "/dashboard/admin/reservations", icon: BedDouble },
      { label: "Payments",     to: "/dashboard/admin/payments",     icon: CreditCard },
      { label: "Reviews",      to: "/dashboard/admin/reviews",      icon: Star },
    ],
  };

  // ADMIN gets only admin items (no common items clutter)
  const items = user?.role === "ADMIN"
    ? roleItems.ADMIN
    : [...commonItems, ...(roleItems[user?.role] || [])];

  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      <style>{`
        .sidebar-root {
          background: var(--tz-sidebar-bg, #ffffff);
          border-right: 1px solid var(--tz-card-border, #e2e8f0);
          box-shadow: 2px 0 12px rgba(0,0,0,0.06);
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        .sidebar-brand-divider {
          border-bottom: 1px solid var(--tz-border-soft, #f1f5f9);
        }
        .sidebar-section-label {
          color: var(--tz-text-faint, #94a3b8);
        }
        .sidebar-nav-idle {
          color: var(--tz-text-muted, #64748b);
        }
        .sidebar-nav-idle:hover {
          color: var(--tz-text, #1e293b);
          background: var(--tz-surface-2, #f8fafc);
        }
        .sidebar-logout {
          background: var(--tz-surface-2, #f8fafc);
          border: 1px solid var(--tz-border, #e2e8f0);
          color: var(--tz-text-muted, #64748b);
          transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
        }
        .sidebar-logout:hover {
          background: rgba(239,68,68,0.06);
          border-color: rgba(239,68,68,0.2);
          color: #ef4444;
        }
        .sidebar-logout:hover .logout-icon { transform: rotate(12deg); }
        .logout-icon { transition: transform 0.2s ease; }
        .tz-brand-logo {
          background: linear-gradient(145deg, #3b82f6, #6366f1);
          box-shadow: 0 3px 0px #1e3a8a, 0 6px 14px rgba(59,130,246,0.4),
                      inset 0 1px 0 rgba(255,255,255,0.25);
        }
        .sidebar-bottom-divider {
          border-top: 1px solid var(--tz-border-soft, #f1f5f9);
        }
      `}</style>

      <aside className="sidebar-root w-64 min-h-screen flex flex-col">

        {/* ── Brand ── */}
        <div className="px-5 py-4 sidebar-brand-divider">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 tz-brand-logo rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-sm tracking-tight">TZ</span>
            </div>
            <div>
              <h1 className="text-base font-extrabold leading-none" style={{ color: "var(--tz-text)" }}>
                TravelZone
              </h1>
              <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: "var(--tz-text-faint)" }}>
                {user?.role === "ADMIN" ? "Admin Panel" : "Platform"}
              </p>
            </div>
          </div>
        </div>

        {/* ── User card ── */}
        <div className="mx-3 mt-4 mb-2">
          <div
            className="rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{
              background: theme.active,
              border:     `1px solid ${theme.border}`,
              boxShadow:  `0 3px 0px ${theme.shadow.replace("0.35","0.12")}, 0 6px 16px ${theme.shadow.replace("0.35","0.08")}`,
            }}
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-content-center text-white font-black text-sm flex-shrink-0`}
              style={{
                boxShadow: `0 3px 0px ${theme.floor}, 0 6px 12px ${theme.shadow},
                            inset 0 1px 0 rgba(255,255,255,0.25)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {initial}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold truncate" style={{ color: "var(--tz-text)" }}>
                {user?.name}
              </p>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: theme.badge.bg,
                  color:      theme.badge.color,
                  border:     `1px solid ${theme.badge.border}`,
                }}
              >
                {user?.role?.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        {/* ── Nav items ── */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          <p className="text-[10px] uppercase tracking-widest px-3 py-2 font-bold sidebar-section-label">
            {user?.role === "ADMIN" ? "Admin Menu" : "Menu"}
          </p>

          {items.map((item) => {
            const Icon   = item.icon;
            const active = item.to === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative text-sm ${
                  active ? "font-semibold" : "sidebar-nav-idle font-medium"
                }`}
                style={active ? {
                  background: theme.active,
                  color:      theme.color,
                  boxShadow:  `0 2px 0px ${theme.shadow.replace("0.35","0.08")}`,
                } : {}}
              >
                {/* Active left bar */}
                {active && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                    style={{ background: theme.dot }}
                  />
                )}

                {/* Icon */}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                  style={active ? {
                    background: theme.active,
                    border:     `1px solid ${theme.border}`,
                    boxShadow:  `0 2px 0px ${theme.shadow.replace("0.35","0.12")}`,
                  } : {
                    background: "var(--tz-surface-2)",
                    border:     "1px solid var(--tz-border-soft)",
                  }}
                >
                  <Icon
                    size={15}
                    style={{ color: active ? theme.color : "var(--tz-text-faint)" }}
                    className={active ? "" : "group-hover:text-slate-600 transition"}
                  />
                </div>

                <span className="flex-1">{item.label}</span>

                {active && (
                  <ChevronRight size={13} style={{ color: theme.color, opacity: 0.6 }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Sign out ── */}
        <div className="p-3 sidebar-bottom-divider">
          <button
            onClick={logout}
            className="sidebar-logout flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
            >
              <LogOut size={14} className="logout-icon text-red-400" />
            </div>
            Sign Out
          </button>
        </div>

      </aside>
    </>
  );
}

export default Sidebar;