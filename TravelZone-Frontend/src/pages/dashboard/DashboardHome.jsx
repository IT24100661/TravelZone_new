import { useAuth } from "../../auth/AuthContext";
import { Compass, Building2, CalendarCheck, MapPinned } from "lucide-react";
import { Link } from "react-router-dom";

const touristStats = [
  { label: "Browse Guides", value: "Find Guides", icon: Compass, color: "from-blue-500 to-blue-600", link: "/dashboard/guides" },
  { label: "Browse Hotels", value: "Find Hotels", icon: Building2, color: "from-purple-500 to-purple-600", link: "/dashboard/hotels" },
  { label: "My Bookings", value: "View All", icon: CalendarCheck, color: "from-emerald-500 to-emerald-600", link: "/dashboard/bookings" },
];

const guideStats = [
  { label: "Guide Profile", value: "Manage Profile", icon: MapPinned, color: "from-blue-500 to-blue-600", link: "/dashboard/guide-profile" },
  { label: "Booking Requests", value: "View Requests", icon: CalendarCheck, color: "from-emerald-500 to-emerald-600", link: "/dashboard/guide-bookings" },
];

const ownerStats = [
  { label: "My Hotels", value: "Manage Hotels", icon: Building2, color: "from-purple-500 to-purple-600", link: "/dashboard/my-hotels" },
  { label: "Manage Rooms", value: "View Rooms", icon: CalendarCheck, color: "from-blue-500 to-blue-600", link: "/dashboard/rooms" },
];

const roleStats = {
  TOURIST: touristStats,
  GUIDE: guideStats,
  HOTEL_OWNER: ownerStats,
  ADMIN: [],
};

function DashboardHome() {
  const { user } = useAuth();
  const stats = roleStats[user?.role] || [];

  return (
    <div>
      {/* Hero card */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-3xl p-8 mb-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white opacity-5 rounded-full" />
        <div className="absolute bottom-[-50px] right-[100px] w-40 h-40 bg-white opacity-5 rounded-full" />
        <div className="relative z-10">
          <p className="text-blue-200 text-sm font-medium mb-1">Good to see you</p>
          <h1 className="text-3xl font-extrabold text-white mb-1">{user?.name}</h1>
          <p className="text-blue-100 text-sm">
            Signed in as <span className="font-semibold">{user?.email}</span>
          </p>
          <div className="inline-flex items-center mt-4 gap-2 bg-white/10 border border-white/20 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            {user?.role} Account Active
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <h2 className="text-slate-700 font-bold text-lg mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.link}
              className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="text-white" size={22} />
              </div>
              <h3 className="text-slate-500 text-sm">{stat.label}</h3>
              <p className="text-slate-800 font-bold text-lg mt-0.5 group-hover:text-blue-600 transition">
                {stat.value} →
              </p>
            </Link>
          );
        })}
      </div>

      {/* Info row */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: "Account Status", value: "Active", dot: "bg-emerald-400" },
          { label: "Member ID", value: `#${user?.id || "—"}` },
          { label: "Platform", value: "TravelZone" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-1">
              {item.label}
            </p>
            <p className="text-slate-800 font-bold text-lg flex items-center gap-2">
              {item.dot && (
                <span className={`w-2 h-2 ${item.dot} rounded-full inline-block`} />
              )}
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardHome;
