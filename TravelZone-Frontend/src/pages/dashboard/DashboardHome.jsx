import { useAuth } from "../../auth/AuthContext";
import { Compass, Building2, CalendarCheck, MapPinned, ClipboardList, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const touristStats = [
  { label: "Browse Guides",  desc: "Find local experts",   icon: Compass,       color: "from-sky-400 to-blue-500",     link: "/dashboard/guides" },
  { label: "Browse Hotels",  desc: "Book your stay",       icon: Building2,     color: "from-violet-400 to-purple-600", link: "/dashboard/hotels" },
  { label: "My Bookings",    desc: "View all reservations",icon: CalendarCheck, color: "from-emerald-400 to-teal-500", link: "/dashboard/bookings" },
];

const guideStats = [
  { label: "Guide Profile",    desc: "Update your listing",   icon: MapPinned,     color: "from-sky-400 to-blue-500",    link: "/dashboard/guide-profile" },
  { label: "Booking Requests", desc: "Respond to tourists",   icon: CalendarCheck, color: "from-emerald-400 to-teal-500", link: "/dashboard/guide-bookings" },
];

const ownerStats = [
  { label: "My Hotels",    desc: "Manage listings",      icon: Building2,     color: "from-violet-400 to-purple-600", link: "/dashboard/my-hotels" },
  { label: "Manage Rooms", desc: "Update availability",  icon: CalendarCheck, color: "from-sky-400 to-blue-500",     link: "/dashboard/rooms" },
  { label: "Reservations", desc: "Review bookings",      icon: ClipboardList, color: "from-amber-400 to-orange-500", link: "/dashboard/hotel-reservations" },
];

const roleStats = {
  TOURIST:     touristStats,
  GUIDE:       guideStats,
  HOTEL_OWNER: ownerStats,
  ADMIN:       [],
};

const roleHeroTheme = {
  TOURIST:     { from: "from-emerald-500", via: "via-teal-500",   to: "to-cyan-600" },
  GUIDE:       { from: "from-blue-500",    via: "via-indigo-500", to: "to-violet-600" },
  HOTEL_OWNER: { from: "from-violet-500",  via: "via-purple-500", to: "to-fuchsia-600" },
  ADMIN:       { from: "from-rose-500",    via: "via-red-500",    to: "to-orange-500" },
};

function DashboardHome() {
  const { user } = useAuth();
  const stats = roleStats[user?.role] || [];
  const hero  = roleHeroTheme[user?.role] || roleHeroTheme.TOURIST;

  return (
    <div className="space-y-8">

      {/* ── Hero ── */}
      <div className={`bg-gradient-to-r ${hero.from} ${hero.via} ${hero.to} rounded-3xl p-7 relative overflow-hidden shadow-lg`}>
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/5 rounded-full blur-xl" />

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/70 text-sm font-medium">Welcome back</p>
            <h1 className="text-3xl font-black text-white mt-0.5 tracking-tight">{user?.name}</h1>
            <p className="text-white/60 text-sm mt-1">{user?.email}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs px-4 py-2 rounded-full font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              {user?.role?.replace("_", " ")} · Active
            </div>
            <p className="text-white/50 text-xs">Member #{user?.id || "—"}</p>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-700 font-bold text-base">Quick Actions</h2>
          <span className="text-slate-400 text-xs">{stats.length} shortcuts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                to={stat.link}
                className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="text-white" size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition">{stat.label}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{stat.desc}</p>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Account Info ── */}
      <div>
        <h2 className="text-slate-700 font-bold text-base mb-4">Account Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Account Status", value: "Active",        sub: "All features available",    dot: "bg-emerald-400" },
            { label: "Member ID",      value: `#${user?.id || "—"}`, sub: "Your unique identifier" },
            { label: "Platform",       value: "TravelZone",    sub: "Version 1.0" },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-2">{item.label}</p>
              <p className="text-slate-800 font-bold text-lg flex items-center gap-2">
                {item.dot && <span className={`w-2.5 h-2.5 ${item.dot} rounded-full`} />}
                {item.value}
              </p>
              <p className="text-slate-400 text-xs mt-1">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default DashboardHome;
