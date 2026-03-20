import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Mail, Lock, User, Shield, Eye, EyeOff, UserPlus } from "lucide-react";

const ROLES = [
  { value: "TOURIST", label: "Tourist", desc: "Browse and book guides & hotels" },
  { value: "GUIDE", label: "Tour Guide", desc: "Create your guide profile" },
  { value: "HOTEL_OWNER", label: "Hotel Owner", desc: "List and manage your hotels" },
];

function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "TOURIST",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    const result = await register(formData);
    if (!result.success) {
      setError(result.message);
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-blue-500 opacity-10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-indigo-500 opacity-10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-extrabold text-white">
            Travel<span className="text-blue-400">Zone</span>
          </Link>
          <p className="text-slate-400 mt-2">Create your account</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-5 bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Min. 8 characters"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl pl-10 pr-12 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                <Shield className="inline mr-1" size={16} />
                Select Role
              </label>
              <div className="grid grid-cols-1 gap-2">
                {ROLES.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      formData.role === r.value
                        ? "border-blue-400 bg-blue-500/20"
                        : "border-white/15 bg-white/5 hover:border-white/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={formData.role === r.value}
                      onChange={handleChange}
                      className="mt-0.5 accent-blue-400"
                    />
                    <div>
                      <p className="text-white text-sm font-semibold">{r.label}</p>
                      <p className="text-slate-400 text-xs">{r.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 duration-200 mt-2"
            >
              <UserPlus size={18} />
              {loading ? "Creating account..." : "Create Account"}
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
  );
}

export default RegisterPage;
