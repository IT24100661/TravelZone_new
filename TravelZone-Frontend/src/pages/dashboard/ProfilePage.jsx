import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import api from "../../api/axios";
import { User, Mail, Phone, FileText, Save, Trash2 } from "lucide-react";
import ImageUpload from "../../components/ui/ImageUpload";

function ProfilePage() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", bio: "", profilePicture: "" });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    api.get(`/api/users/${user.id}`).then((res) => {
      setForm({
        name: res.data.name || "",
        phone: res.data.phone || "",
        bio: res.data.bio || "",
        profilePicture: res.data.profilePicture || "",
      });
      // If there's an existing photo (Base64 or URL), show it as preview
      if (res.data.profilePicture) {
        setPhotoPreview(res.data.profilePicture);
      }
    });
  }, [user?.id]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      await api.put(`/api/users/${user.id}`, form);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;
    try {
      await api.delete(`/api/users/${user.id}`);
      logout();
    } catch (err) {
      setError(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Profile</h1>

      {/* Avatar card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 mb-6 flex items-center gap-5 shadow-lg">
        {photoPreview ? (
          <img
            src={photoPreview}
            alt="Profile"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30 shadow"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-3xl font-bold">
            {form.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}
        <div>
          <h2 className="text-white text-xl font-bold">{form.name}</h2>
          <p className="text-blue-200 text-sm">{user?.email}</p>
          <span className="inline-block mt-1 bg-white/15 border border-white/20 text-white text-xs px-3 py-0.5 rounded-full">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        {success && (
          <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm"
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                value={user?.email}
                disabled
                className="w-full border border-slate-100 bg-slate-50 rounded-xl pl-10 pr-4 py-2.5 text-slate-400 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm"
                placeholder="+94 77 000 0000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={3}
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm resize-none"
                placeholder="Tell something about yourself..."
              />
            </div>
          </div>

          {/* ✅ File picker replaces URL input */}
          <ImageUpload
            label="Profile Picture"
            preview={photoPreview}
            onChange={(base64) => {
              setPhotoPreview(base64);
              setForm((p) => ({ ...p, profilePicture: base64 }));
            }}
            onClear={() => {
              setPhotoPreview(null);
              setForm((p) => ({ ...p, profilePicture: "" }));
            }}
            setError={setError}
            maxMB={2}
          />

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition shadow-md shadow-blue-200 disabled:opacity-60"
            >
              <Save size={16} />
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-6 py-2.5 rounded-xl font-semibold text-sm transition"
            >
              <Trash2 size={16} />
              Delete Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
