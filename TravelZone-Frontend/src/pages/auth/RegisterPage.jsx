import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Mail, Lock, User, Shield, Eye, EyeOff, UserPlus } from "lucide-react";
import PageTransition from "../../components/PageTransition";
import heroBg from "../../assets/images/hero-1.jpg";

const ROLES = [
  { value: "TOURIST",     label: "Tourist",     desc: "Browse and book guides & hotels" },
  { value: "GUIDE",       label: "Tour Guide",  desc: "Create your guide profile"       },
  { value: "HOTEL_OWNER", label: "Hotel Owner", desc: "List and manage your hotels"     },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [formData, setFormData]         = useState({ name: "", email: "", password: "", role: "TOURIST" });
  const [error, setError]               = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password.length < 3) { setError("Password must be at least 3 characters"); return; }
    const result = await register(formData);
    if (!result.success) { setError(result.message); return; }
    navigate("/dashboard");
  };

  return (
    <PageTransition>
      {/* ✅ FIX 1: items-start + overflow-y-auto allows page to scroll */}
      <div
        className="min-h-screen flex items-start justify-center p-4 relative overflow-y-auto"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <style>{`
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

          .role-card {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            border-radius: 0.875rem;
            border: 1px solid rgba(255,255,255,0.10);
            background: rgba(2,6,23,0.45);
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow:
              inset 0 2px 6px rgba(0,0,0,0.4),
              0 1px 0px rgba(255,255,255,0.05);
          }
          .role-card:hover {
            border-color: rgba(255,255,255,0.25);
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

          .btn-submit-3d {
            position: relative;
            width: 100%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.8rem 1.5rem;
            margin-top: 0.5rem;
            font-weight: 700;
            font-size: 0.95rem;
            letter-spacing: 0.02em;
            color: #fff;
            border: none;
            border-radius: 0.875rem;
            cursor: pointer;
            outline: none;
            -webkit-font-smoothing: antialiased;
            background: linear-gradient(175deg,
              #1d4ed8 0%, #2563eb 40%, #3b82f6 70%, #60a5fa 100%
            );
            transform: translateY(-2px);
            transition: transform 0.15s cubic-bezier(0.22,1,0.36,1),
                        box-shadow 0.15s cubic-bezier(0.22,1,0.36,1),
                        filter 0.15s ease;
            box-shadow:
              0  5px 0px 0px #1e3a8a,
              0  8px 20px 2px rgba(59,130,246,0.5),
              0  2px 6px  0px rgba(0,0,0,0.4);
          }
          .btn-submit-3d::before {
            content: "";
            position: absolute;
            top: 5px; left: 15%;
            width: 70%; height: 38%;
            border-radius: 999px;
            background: linear-gradient(180deg,
              rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.0) 100%
            );
            pointer-events: none;
            z-index: 1;
          }
          .btn-submit-3d::after {
            content: "";
            position: absolute;
            bottom: 0; left: 0;
            width: 100%; height: 40%;
            border-radius: 0 0 0.875rem 0.875rem;
            background: linear-gradient(180deg,
              rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.3) 100%
            );
            pointer-events: none;
            z-index: 0;
          }
          .btn-submit-3d span { position: relative; z-index: 2; display: flex; align-items: center; gap: 0.5rem; }
          .btn-submit-3d:hover {
            transform: translateY(-4px);
            filter: brightness(1.08);
            box-shadow:
              0  7px 0px 0px #1e3a8a,
              0 14px 28px 4px rgba(59,130,246,0.6),
              0  4px 8px  0px rgba(0,0,0,0.4);
          }
          .btn-submit-3d:active {
            transform: translateY(1px);
            box-shadow:
              0  2px 0px 0px #1e3a8a,
              0  4px 10px 0px rgba(59,130,246,0.35),
              0  1px 3px  0px rgba(0,0,0,0.4);
          }
          .btn-submit-3d:disabled {
            opacity: 0.55;
            cursor: not-allowed;
            transform: translateY(-2px);
          }
        `}</style>

        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-blue-500 opacity-15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-indigo-500 opacity-15 rounded-full blur-3xl pointer-events-none" />

        {/* ✅ FIX 2: py-8 ensures top/bottom breathing room when scrolling */}
        <div className="relative z-10 w-full max-w-lg py-8">

          <div className="text-center mb-6">
            <Link to="/" className="text-3xl font-extrabold text-white">
              Travel<span className="text-orange-400">Zone</span>
            </Link>
            <p className="text-slate-400 mt-2">Create your account</p>
          </div>

          {/* ✅ FIX 3: p-6 instead of p-8 to reduce card height */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
            {error && (
              <div className="mb-4 bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* ✅ FIX 4: space-y-4 instead of space-y-5 to tighten form spacing */}
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={17} />
                  <input
                    type="text" name="name"
                    value={formData.name} onChange={handleChange}
                    required placeholder="John Doe"
                    className="input-3d"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={17} />
                  <input
                    type="email" name="email"
                    value={formData.email} onChange={handleChange}
                    required placeholder="you@example.com"
                    className="input-3d"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={17} />
                  <input
                    type={showPassword ? "text" : "password"} name="password"
                    value={formData.password} onChange={handleChange}
                    required placeholder="Min. 8 characters"
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

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  <Shield className="inline mr-1" size={15} />
                  Select Role
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {ROLES.map((r) => (
                    <label
                      key={r.value}
                      className={`role-card ${formData.role === r.value ? "role-card-active" : ""}`}
                    >
                      <input
                        type="radio" name="role" value={r.value}
                        checked={formData.role === r.value}
                        onChange={handleChange}
                        className="mt-0.5 accent-indigo-400"
                      />
                      <div>
                        <p className="text-white text-sm font-semibold">{r.label}</p>
                        <p className="text-slate-400 text-xs">{r.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-submit-3d">
                <span>
                  <UserPlus size={17} />
                  {loading ? "Creating account..." : "Create Account"}
                </span>
              </button>

            </form>

            {/* ✅ This will now always be visible */}
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