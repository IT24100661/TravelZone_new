import { useAuth } from "../../auth/AuthContext";
import { Bell, Search } from "lucide-react";

const roleTheme = {
  TOURIST:     "bg-emerald-100 text-emerald-700",
  GUIDE:       "bg-blue-100 text-blue-700",
  HOTEL_OWNER: "bg-violet-100 text-violet-700",
  ADMIN:       "bg-rose-100 text-rose-700",
};

const roleAvatarGradient = {
  TOURIST:     "from-emerald-400 to-teal-500",
  GUIDE:       "from-blue-400 to-indigo-500",
  HOTEL_OWNER: "from-violet-400 to-purple-600",
  ADMIN:       "from-rose-400 to-red-500",
};

function Topbar() {
  const { user } = useAuth();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      {/* Left — greeting */}
      <div>
        <p className="text-xs text-slate-400 font-medium">{today}</p>
        <h2 className="text-base font-bold text-slate-800 leading-tight">
          Hey, {user?.name?.split(" ")[0]} 👋
        </h2>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">
        {/* Role badge */}
        <span className={`hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-bold ${roleTheme[user?.role] || "bg-slate-100 text-slate-700"}`}>
          {user?.role?.replace("_", " ")}
        </span>

        {/* Notification bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white" />
        </button>

        {/* Avatar */}
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleAvatarGradient[user?.role] || "from-blue-400 to-indigo-500"} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
