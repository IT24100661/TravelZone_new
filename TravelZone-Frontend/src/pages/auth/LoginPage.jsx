import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import PageTransition from "../../components/PageTransition";
import heroBg from "../../assets/images/hero-2.jpg";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading }              = useAuth();
  const [formData, setFormData]         = useState({ email: "", password: "" });
  const [error, setError]               = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    const result = await login(formData);
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

          .btn-submit-3d {
            position: relative; width: 100%; overflow: hidden;
            display: flex; align-items: center; justify-content: center; gap: 0.5rem;
            padding: 0.8rem 1.5rem; margin-top: 0.5rem;
            font-weight: 700; font-size: 0.95rem; letter-spacing: 0.02em;
            color: #fff; border: none; border-radius: 0.875rem; cursor: pointer; outline: none;
            -webkit-font-smoothing: antialiased;
            background: linear-gradient(175deg, #1d4ed8 0%, #2563eb 40%, #3b82f6 70%, #60a5fa 100%);
            transform: translateY(-2px);
            transition: transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.15s cubic-bezier(0.22,1,0.36,1), filter 0.15s ease;
            box-shadow: 0 5px 0px 0px #1e3a8a, 0 8px 20px 2px rgba(59,130,246,0.5), 0 2px 6px 0px rgba(0,0,0,0.4);
          }
          .btn-submit-3d::before {
            content: ""; position: absolute; top: 5px; left: 15%; width: 70%; height: 38%;
            border-radius: 999px; pointer-events: none; z-index: 1;
            background: linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.0) 100%);
            transition: opacity 0.15s ease;
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

          /* Dark/light theme toggle button in card */
          .theme-pill {
            display: inline-flex; align-items: center; gap: 0.375rem;
            padding: 0.35rem 0.875rem; border-radius: 999px;
            background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
            color: rgba(255,255,255,0.7); font-size: 0.7rem; font-weight: 600;
            cursor: pointer; transition: background 0.2s ease;
          }
          .theme-pill:hover { background: rgba(255,255,255,0.18); }
        `}</style>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />

        {/* Ambient orbs */}
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-blue-500 opacity-15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-indigo-500 opacity-15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">

          {/* Brand header */}
          <div className="text-center mb-8">
            <Link to="/" className="text-3xl font-extrabold text-white tracking-tight">
              Travel<span className="text-orange-400">Zone</span>
            </Link>
            <p className="text-slate-400 mt-2 text-sm">Sign in to your account</p>
          </div>

          {/* Card */}
          <div
            className="rounded-3xl p-8"
            style={{
              background:  "rgba(255,255,255,0.08)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border:      "1px solid rgba(255,255,255,0.15)",
              boxShadow:   "0 8px 0px rgba(0,0,0,0.25), 0 24px 64px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
            }}
          >
            {/* Theme toggle pill inside card */}
            <div className="flex justify-end mb-4">
              <button
                data-theme-toggle
                className="theme-pill"
                aria-label="Toggle theme"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                <span>Theme</span>
              </button>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-1.5">
                  Email Address
                </label>
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
                <label className="block text-slate-300 text-sm font-semibold mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={17} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password" value={formData.password}
                    onChange={handleChange} required placeholder="Enter your password"
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

              {/* Submit */}
              <button type="submit" disabled={loading} className="btn-submit-3d">
                <span>
                  <LogIn size={17} />
                  {loading ? "Signing in..." : "Sign In"}
                </span>
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-400 font-semibold hover:text-blue-300 transition">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}