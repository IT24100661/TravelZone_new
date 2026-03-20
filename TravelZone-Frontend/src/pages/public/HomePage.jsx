import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 flex items-center justify-center">
      {/* Background blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-blue-500 opacity-10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-indigo-500 opacity-10 rounded-full blur-3xl" />

      <div className="relative z-10 text-center px-6 max-w-2xl w-full">
        {/* Logo badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          Platform is live — Start exploring
        </div>

        <h1 className="text-6xl font-extrabold text-white mb-4 leading-tight tracking-tight">
          Travel<span className="text-blue-400">Zone</span>
        </h1>
        <p className="text-slate-300 text-xl mb-10 font-light">
          Book tour guides and hotels for your perfect journey across Sri Lanka.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            to="/login"
            className="px-8 py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-400/40 hover:-translate-y-0.5 duration-200"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all backdrop-blur-sm hover:-translate-y-0.5 duration-200"
          >
            Create Account
          </Link>
        </div>

        {/* Feature pills */}
        <div className="mt-16 flex justify-center gap-4 flex-wrap">
          {["Tour Guides", "Hotel Bookings", "Instant Confirmation", "Secure Payments"].map((tag) => (
            <span
              key={tag}
              className="px-4 py-1.5 bg-white/5 text-slate-300 text-sm rounded-full border border-white/10"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
