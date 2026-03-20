import { useAuth } from "../../auth/AuthContext";
import { Bell } from "lucide-react";

const roleBadgeColors = {
  TOURIST: "bg-emerald-100 text-emerald-700",
  GUIDE: "bg-blue-100 text-blue-700",
  HOTEL_OWNER: "bg-purple-100 text-purple-700",
  ADMIN: "bg-red-100 text-red-700",
};

function Topbar() {
  const { user } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <p className="text-slate-500 text-sm">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h2 className="text-lg font-bold text-slate-800 leading-tight">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            roleBadgeColors[user?.role] || "bg-slate-100 text-slate-700"
          }`}
        >
          {user?.role}
        </span>
        <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition relative">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
