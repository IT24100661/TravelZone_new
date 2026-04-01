import { useEffect, useState } from "react";
import api from "../../../api/axios";
import {
  MapPin, DollarSign, BookOpen, Plus, X,
  CheckCircle, Upload, Pencil, Trash2, Save, AlertCircle
} from "lucide-react";
import ImageUpload from "../../../components/ui/ImageUpload";

function GuideProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("view");         // "view" | "edit" | "create"
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [langInput, setLangInput] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);

  const emptyForm = {
    experienceYears: "", languages: [], pricePerDay: "",
    location: "", bio: "", profilePhoto: "",
  };
  const [form, setForm] = useState(emptyForm);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/guides/me");
      setProfile(res.data);
      setMode("view");
    } catch (err) {
      if (err?.response?.status === 404) {
        setProfile(null);
        setMode("create");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const startEdit = () => {
    setForm({
      experienceYears: profile.experienceYears?.toString() || "",
      languages: [...(profile.languages || [])],
      pricePerDay: profile.pricePerDay?.toString() || "",
      location: profile.location || "",
      bio: profile.bio || "",
      profilePhoto: profile.profilePhoto || "",
    });
    setPhotoPreview(profile.profilePhoto || null);
    setSuccess(""); setError("");
    setMode("edit");
  };

  const cancelEdit = () => {
    setMode("view");
    setSuccess(""); setError("");
  };

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const addLanguage = () => {
    const lang = langInput.trim();
    if (lang && !form.languages.includes(lang)) {
      setForm((p) => ({ ...p, languages: [...p.languages, lang] }));
    }
    setLangInput("");
  };

  const removeLanguage = (lang) =>
    setForm((p) => ({ ...p, languages: p.languages.filter((l) => l !== lang) }));

  // ✅ Create new profile
  const handleCreate = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (form.languages.length === 0) { setError("Add at least one language"); return; }
    if (!form.profilePhoto) { setError("Please select a profile photo"); return; }
    setSubmitting(true);
    try {
      await api.post("/api/guides", {
        ...form,
        experienceYears: parseInt(form.experienceYears),
        pricePerDay: parseFloat(form.pricePerDay),
      });
      setSuccess("Guide profile created!");
      fetchProfile();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create profile");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Update existing profile
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (form.languages.length === 0) { setError("Add at least one language"); return; }
    setSubmitting(true);
    try {
      await api.put("/api/guides/me", {
        ...form,
        experienceYears: parseInt(form.experienceYears),
        pricePerDay: parseFloat(form.pricePerDay),
      });
      setSuccess("Profile updated successfully!");
      fetchProfile();
    } catch (err) {
      setError(err?.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Delete profile
  const handleDelete = async () => {
    if (!window.confirm("Delete your guide profile? This cannot be undone.")) return;
    setDeleting(true);
    setError("");
    try {
      await api.delete("/api/guides/me");
      setProfile(null);
      setForm(emptyForm);
      setPhotoPreview(null);
      setMode("create");
    } catch (err) {
      setError(err?.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ─── View existing profile ─────────────────────────────────────────────────
  if (mode === "view" && profile) return (
    <div className="max-w-2xl mx-auto">
      {/* Header card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 mb-6 flex items-center gap-5 shadow-lg">
        {profile.profilePhoto ? (
          <img src={profile.profilePhoto} alt="Profile"
            className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30 shadow" />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-3xl font-bold">
            {profile.name?.charAt(0)}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={18} className="text-emerald-300" />
            <span className="text-emerald-200 text-sm font-medium">Profile Active</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
          <p className="text-blue-200 text-sm flex items-center gap-1 mt-0.5">
            <MapPin size={13} /> {profile.location}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={startEdit}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 px-4 py-2 rounded-xl text-sm font-semibold transition"
          >
            <Pencil size={14} /> Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-white border border-red-400/30 px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-60"
          >
            <Trash2 size={14} /> {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Details */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        {[
          { label: "Experience",      value: `${profile.experienceYears} years` },
          { label: "Price / Day",     value: `$${parseFloat(profile.pricePerDay).toFixed(2)}` },
          { label: "Languages",       value: profile.languages?.join(", ") || "—" },
          { label: "Rating",          value: `${profile.rating?.toFixed(1)} ⭐` },
          { label: "Available Dates", value: `${profile.availableDates?.length || 0} days available` },
        ].map((item) => (
          <div key={item.label} className="flex justify-between border-b border-slate-100 pb-3 last:border-0">
            <span className="text-slate-400 text-sm">{item.label}</span>
            <span className="text-slate-800 font-semibold text-sm">{item.value}</span>
          </div>
        ))}
        <p className="text-slate-600 text-sm leading-relaxed pt-1">{profile.bio}</p>
      </div>
    </div>
  );

  // ─── Create / Edit form ────────────────────────────────────────────────────
  const isEdit = mode === "edit";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isEdit ? "Edit Guide Profile" : "Create Guide Profile"}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isEdit
              ? "Update your profile information below."
              : "Set up your profile so tourists can find and book you."}
          </p>
        </div>
        {isEdit && (
          <button
            onClick={cancelEdit}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-sm transition"
          >
            <X size={14} /> Cancel
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mt-5">
        {success && (
          <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle size={15} /> {success}
          </div>
        )}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={isEdit ? handleUpdate : handleCreate} className="space-y-5">
          {/* Experience + Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Experience (years) *</label>
              <input name="experienceYears" type="number" min="0"
                value={form.experienceYears} onChange={handleChange} required
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm"
                placeholder="e.g. 5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Price per Day (LKR) *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input name="pricePerDay" type="number" min="0.01" step="0.01"
                  value={form.pricePerDay} onChange={handleChange} required
                  className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm"
                  placeholder="e.g. 75.00" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Location *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input name="location" value={form.location} onChange={handleChange} required
                className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm"
                placeholder="e.g. Colombo, Sri Lanka" />
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Languages Spoken *</label>
            <div className="flex gap-2 mb-2">
              <input value={langInput} onChange={(e) => setLangInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm"
                placeholder="Type a language and press Enter" />
              <button type="button" onClick={addLanguage}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl transition">
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.languages.map((lang) => (
                <span key={lang} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-medium">
                  {lang}
                  <button type="button" onClick={() => removeLanguage(lang)}><X size={12} /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio *</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-3 text-slate-400" size={16} />
              <textarea name="bio" value={form.bio} onChange={handleChange} required rows={3}
                className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm resize-none"
                placeholder="Describe your guiding experience, specialties..." />
            </div>
          </div>

          {/* Photo */}
          <ImageUpload
            label={isEdit ? "Profile Photo (leave empty to keep current)" : "Profile Photo *"}
            preview={photoPreview}
            onChange={(base64) => {
              setPhotoPreview(base64);
              setForm((p) => ({ ...p, profilePhoto: base64 }));
            }}
            onClear={() => {
              setPhotoPreview(null);
              setForm((p) => ({ ...p, profilePhoto: isEdit ? profile.profilePhoto : "" }));
            }}
            setError={setError}
            maxMB={2}
          />

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition shadow-lg shadow-blue-200"
          >
            {isEdit ? <Save size={16} /> : <Upload size={16} />}
            {submitting
              ? (isEdit ? "Saving..." : "Creating...")
              : (isEdit ? "Save Changes" : "Create Guide Profile")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default GuideProfilePage;
