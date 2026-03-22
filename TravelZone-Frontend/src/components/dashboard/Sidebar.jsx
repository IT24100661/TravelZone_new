import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, User, MapPinned, Building2,
  CalendarCheck, LogOut, Compass, ClipboardList, ChevronRight
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

const roleTheme = {
  TOURIST:     { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-500", dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
  GUIDE:       { color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-500",    dot: "bg-blue-500",    badge: "bg-blue-100 text-blue-700" },
  HOTEL_OWNER: { color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-500",  dot: "bg-violet-500",  badge: "bg-violet-100 text-violet-700" },
  ADMIN:       { color: "text-rose-600",    bg: "bg-rose-50",    border: "border-rose-500",    dot: "bg-rose-500",    badge: "bg-rose-100 text-rose-700" },
};

function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const theme = roleTheme[user?.role] || roleTheme.TOURIST;

  const commonItems = [
    { label: "Dashboard",  to: "/dashboard",         icon: LayoutDashboard },
    { label: "My Profile", to: "/dashboard/profile",  icon: User },
  ];

  const roleItems = {
    TOURIST: [
      { label: "Browse Guides", to: "/dashboard/guides",   icon: Compass },
      { label: "Browse Hotels", to: "/dashboard/hotels",   icon: Building2 },
      { label: "My Bookings",   to: "/dashboard/bookings", icon: CalendarCheck },
    ],
    GUIDE: [
      { label: "Guide Profile",    to: "/dashboard/guide-profile",   icon: MapPinned },
      { label: "Booking Requests", to: "/dashboard/guide-bookings",  icon: CalendarCheck },
    ],
    HOTEL_OWNER: [
      { label: "My Hotels",    to: "/dashboard/my-hotels",          icon: Building2 },
      { label: "Manage Rooms", to: "/dashboard/rooms",              icon: CalendarCheck },
      { label: "Reservations", to: "/dashboard/hotel-reservations", icon: ClipboardList },
    ],
    ADMIN: [],
  };

  const items = [...commonItems, ...(roleItems[user?.role] || [])];
  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col shadow-sm">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow">
            <span className="text-white font-black text-sm">TZ</span>
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-800 leading-none">TravelZone</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Platform</p>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="mx-3 mt-4 mb-2">
        <div className={`${theme.bg} rounded-2xl px-4 py-3 flex items-center gap-3 border ${theme.border} border-opacity-30`}>
          <div className={`w-9 h-9 rounded-xl ${theme.dot} flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0`}>
            {initial}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${theme.badge}`}>
              {user?.role?.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest px-3 py-2 font-bold">
          Menu
        </p>
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.to === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative ${
                active
                  ? `${theme.bg} ${theme.color} font-semibold`
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {active && (
                <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 ${theme.dot} rounded-r-full`} />
              )}
              <Icon
                size={17}
                className={active ? theme.color : "text-slate-400 group-hover:text-slate-600 transition"}
              />
              <span className="text-sm flex-1">{item.label}</span>
              {active && <ChevronRight size={14} className={`${theme.color} opacity-60`} />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-500 border border-slate-200 hover:border-red-200 transition-all duration-150 text-sm font-medium group"
        >
          <LogOut size={16} className="group-hover:rotate-12 transition-transform duration-200" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
