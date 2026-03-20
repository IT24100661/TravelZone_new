import { Link, useLocation } from "react-router-dom";
import {
  Home, User, MapPinned, Building2,
  CalendarCheck, LogOut, Compass
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const commonItems = [
    { label: "Dashboard", to: "/dashboard", icon: Home },
    { label: "My Profile", to: "/dashboard/profile", icon: User },
  ];

  const roleItems = {
    TOURIST: [
      { label: "Browse Guides", to: "/dashboard/guides", icon: Compass },
      { label: "Browse Hotels", to: "/dashboard/hotels", icon: Building2 },
      { label: "My Bookings", to: "/dashboard/bookings", icon: CalendarCheck },
    ],
    GUIDE: [
      { label: "Guide Profile", to: "/dashboard/guide-profile", icon: MapPinned },
      { label: "Booking Requests", to: "/dashboard/guide-bookings", icon: CalendarCheck },
    ],
    HOTEL_OWNER: [
      { label: "My Hotels", to: "/dashboard/my-hotels", icon: Building2 },
      { label: "Manage Rooms", to: "/dashboard/rooms", icon: CalendarCheck },
    ],
    ADMIN: [],
  };

  const items = [...commonItems, ...(roleItems[user?.role] || [])];

  const roleColors = {
    TOURIST: "bg-emerald-500",
    GUIDE: "bg-blue-500",
    HOTEL_OWNER: "bg-purple-500",
    ADMIN: "bg-red-500",
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col border-r border-white/5 shadow-xl">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/10">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Travel<span className="text-blue-400">Zone</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">Dashboard</p>
      </div>

      {/* User badge */}
      <div className="mx-4 my-4 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
        <div className={`w-9 h-9 ${roleColors[user?.role] || "bg-slate-600"} rounded-xl flex items-center justify-center text-white font-bold text-sm`}>
          {initial}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
          <p className="text-xs text-slate-400 truncate">{user?.role}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        <p className="text-xs text-slate-500 uppercase tracking-widest px-3 py-2 font-semibold">
          Navigation
        </p>
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon
                size={18}
                className={active ? "text-white" : "text-slate-500 group-hover:text-white transition"}
              />
              <span className="text-sm font-medium">{item.label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-400/30 transition-all duration-200 text-sm font-medium"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
