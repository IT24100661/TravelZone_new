import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Mail, Lock, User, Shield, Eye, EyeOff, UserPlus } from "lucide-react";
import PageTransition from "../../components/PageTransition";
import heroBg from "../../assets/images/hero-1.jpg";

const ROLES = [
  { value: "TOURIST",     label: "Tourist",     desc: "Browse and book guides & hotels", icon: "🧭" },
  { value: "GUIDE",       label: "Tour Guide",  desc: "Create your guide profile",       icon: "🗺️" },
  { value: "HOTEL_OWNER", label: "Hotel Owner", desc: "List and manage your hotels",     icon: "🏨" },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading }           = useAuth();
  const [formData, setFormData]         = useState({ name: "", email: "", password: "", role: "TOURIST" });
  const [error, setError]               = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (formData.password.length < 3) { setError("Password must be at least 3 characters"); return; }
    const result = await register(formData);
    if (!result.success) { setError(result.message); return; }
    navigate("/dashboard");
  };

  return (
    <PageTransition>
      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <style>{`
          /* ── 3D Inset Input ── */
          .input-3d {
            width: 100%;
            background: rgba(2, 6, 23, 0.55);
            border: 1px solid rgba(255,255,255,0.10);
            color: #f1f5f9;
            border-radius: 0.875rem;
            padding: 0.75rem 1rem 0.75rem 2.75rem;
            font-size: 0.92rem;
            outline: none;
            transition: box-shadow 0.25s ease, border-color 0.25s ease;
            box-shadow:
              inset 0 3px 8px rgba(0,0,0,0.55),
              inset 0 1px 3px rgba(0,0,0,0.4),
              0 1px 0px rgba(255,255,255,0.06);
          }
          .input-3d::placeholder { color: #475569; }
          .input-3d:focus {
            border-color: rgba(99,102,241,0.6);
            box-shadow:
              inset 0 3px 8px rgba(0,0,0,0.55),
              inset 0 1px 3px rgba(0,0,0,0.4),
              0 1px 0px rgba(255,255,255,0.06),
              0 0 0 3px rgba(99,102,241,0.18),
              0 0 16px rgba(99,102,241,0.15);
          }
          .input-3d-right { padding-right: 3rem; }

          /* ── Role card ── */
          .role-card {
            display: flex; align-items: center; gap: 0.875rem;
            padding: 0.875rem 1rem; border-radius: 0.875rem;
            border: 1px solid rgba(255,255,255,0.10);
            background: rgba(2,6,23,0.45); cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: inset 0 2px 6px rgba(0,0,0,0.4), 0 1px 0px rgba(255,255,255,0.05);
          }
          .role-card:hover {
            border-color: rgba(255,255,255,0.22);
            background: rgba(15,23,42,0.55);
          }
          .role-card-active {
            border-color: rgba(99,102,241,0.7) !important;
            background: rgba(99,102,241,0.15) !important;
            box-shadow:
              inset 0 2px 6px rgba(0,0,0,0.4),
              0 0 0 3px rgba(99,102,241,0.15),
              0 0 16px rgba(99,102,241,0.12);
          }

          /* ── 3D Submit Button ── */
          .btn-submit-3d {
            position: relative; width: 100%; overflow: hidden;
            display: flex; align-items: center; justify-content: center; gap: 0.5rem;
            padding: 0.8rem 1.5rem; margin-top: 0.5rem;
            font-weight: 700; font-size: 0.95rem; letter-spacing: 0.02em;
            color: #fff; border: none; border-radius: 0.875rem;
            cursor: pointer; outline: none; -webkit-font-smoothing: antialiased;
            background: linear-gradient(175deg, #1d4ed8 0%, #2563eb 40%, #3b82f6 70%, #60a5fa 100%);
            transform: translateY(-2px);
            transition: transform 0.15s cubic-bezier(0.22,1,0.36,1),
                        box-shadow 0.15s cubic-bezier(0.22,1,0.36,1),
                        filter 0.15s ease;
            box-shadow: 0 5px 0px 0px #1e3a8a, 0 8px 20px 2px rgba(59,130,246,0.5), 0 2px 6px 0px rgba(0,0,0,0.4);
          }
          .btn-submit-3d::before {
            content: ""; position: absolute; top: 5px; left: 15%; width: 70%; height: 38%;
            border-radius: 999px; pointer-events: none; z-index: 1;
            background: linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.0) 100%);
          }
          .btn-submit-3d::after {
            content: ""; position: absolute; bottom: 0; left: 0; width: 100%; height: 40%;
            border-radius: 0 0 0.875rem 0.875rem; pointer-events: none; z-index: 0;
            background: linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.3) 100%);
          }
          .btn-submit-3d span { position: relative; z-index: 2; display: flex; align-items: center; gap: 0.5rem; }
          .btn-submit-3d:hover {
            transform: translateY(-4px); filter: brightness(1.08);
            box-shadow: 0 7px 0px 0px #1e3a8a, 0 14px 28px 4px rgba(59,130,246,0.6), 0 4px 8px 0px rgba(0,0,0,0.4);
          }
          .btn-submit-3d:active {
            transform: translateY(1px);
            box-shadow: 0 2px 0px 0px #1e3a8a, 0 4px 10px 0px rgba(59,130,246,0.35), 0 1px 3px 0px rgba(0,0,0,0.4);
          }
          .btn-submit-3d:disabled { opacity: 0.55; cursor: not-allowed; transform: translateY(-2px); }

          /* ── Role icon bubble ── */
          .role-icon-bubble {
            width: 2.25rem; height: 2.25rem; border-radius: 0.625rem; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            background: rgba(255,255,255,0.08); font-size: 1.1rem;
            border: 1px solid rgba(255,255,255,0.12);
            box-shadow: 0 2px 0px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.12);
            transition: all 0.2s ease;
          }
          .role-card-active .role-icon-bubble {
            background: rgba(99,102,241,0.25);
            border-color: rgba(99,102,241,0.4);
            box-shadow: 0 2px 0px rgba(79,70,229,0.3), 0 0 10px rgba(99,102,241,0.2);
          }

          /* ── Radio dot ── */
          .role-radio {
            width: 1rem; height: 1rem; border-radius: 50%; flex-shrink: 0;
            border: 2px solid rgba(255,255,255,0.25);
            background: rgba(0,0,0,0.3); transition: all 0.2s ease;
            position: relative;
          }
          .role-radio-active {
            border-color: #818cf8;
            background: rgba(99,102,241,0.2);
            box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
          }
          .role-radio-active::after {
            content: ""; position: absolute; top: 50%; left: 50%;
            transform: translate(-50%,-50%);
            width: 6px; height: 6px; border-radius: 50%;
            background: #818cf8;
          }
        `}</style>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />

        {/* Ambient orbs */}
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-blue-500 opacity-15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-indigo-500 opacity-15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg py-8">

          {/* Brand header */}
          <div className="text-center mb-8">
            <Link to="/" className="text-3xl font-extrabold text-white tracking-tight">
              Travel<span className="text-orange-400">Zone</span>
            </Link>
            <p className="text-slate-400 mt-2 text-sm">Create your account</p>
          </div>

          {/* Card */}
          <div
            className="rounded-3xl p-8"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 8px 0px rgba(0,0,0,0.25), 0 24px 64px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
            }}
          >
            {error && (
              <div
                className="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
                style={{
                  background: "rgba(239,68,68,0.18)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#fca5a5",
                  boxShadow: "0 2px 0px rgba(239,68,68,0.15)",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Full Name */}
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={17} />
                  <input
                    type="text" name="name" value={formData.name}
                    onChange={handleChange} required placeholder="John Doe"
                    className="input-3d"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={17} />
                  <input
                    type="email" name="email" value={formData.email}
                    onChange={handleChange} required placeholder="you@example.com"
                    className="input-3d"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={17} />
                  <input
                    type={showPassword ? "text" : "password"} name="password"
                    value={formData.password} onChange={handleChange}
                    required placeholder="Min. 3 characters"
                    className="input-3d input-3d-right"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Role selector */}
              <div>
                <label className="flex items-center gap-1.5 text-slate-300 text-sm font-semibold mb-2.5">
                  <Shield size={15} className="text-slate-400" />
                  Select Your Role
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {ROLES.map((r) => {
                    const active = formData.role === r.value;
                    return (
                      <label key={r.value} className={`role-card ${active ? "role-card-active" : ""}`}>
                        <input
                          type="radio" name="role" value={r.value}
                          checked={active} onChange={handleChange}
                          className="sr-only"
                        />
                        {/* Custom radio */}
                        <div className={`role-radio ${active ? "role-radio-active" : ""}`} />
                        {/* Icon */}
                        <div className="role-icon-bubble">{r.icon}</div>
                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-bold leading-none mb-0.5">{r.label}</p>
                          <p className="text-slate-400 text-xs leading-snug">{r.desc}</p>
                        </div>
                        {/* Active check */}
                        {active && (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              background: "rgba(99,102,241,0.3)",
                              border: "1px solid rgba(99,102,241,0.5)",
                            }}
                          >
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5l2 2 4-4" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="btn-submit-3d">
                <span>
                  <UserPlus size={17} />
                  {loading ? "Creating account..." : "Create Account"}
                </span>
              </button>

            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}