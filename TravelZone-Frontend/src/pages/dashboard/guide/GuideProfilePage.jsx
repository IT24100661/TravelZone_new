import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { MapPin, DollarSign, BookOpen, Plus, X, CheckCircle, Upload } from "lucide-react";
import ImageUpload from "../../../components/ui/ImageUpload";

function GuideProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [langInput, setLangInput] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);

  const [form, setForm] = useState({
    experienceYears: "",
    languages: [],
    pricePerDay: "",
    location: "",
    bio: "",
    profilePhoto: "",
  });

  useEffect(() => {
    api.get("/api/guides/me").catch(() => {}).finally(() => setLoading(false));
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (form.languages.length === 0) { setError("Add at least one language"); return; }
    if (!form.profilePhoto) { setError("Please select a profile photo"); return; }
    setSubmitting(true);
    try {
      const res = await api.post("/api/guides", {
        ...form,
        experienceYears: parseInt(form.experienceYears),
        pricePerDay: parseFloat(form.pricePerDay),
      });
      setProfile(res.data);
      setSuccess("Guide profile created successfully!");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (profile) return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-lg mb-6">
        <CheckCircle size={40} className="mb-3 text-blue-200" />
        <h1 className="text-2xl font-bold">Guide Profile Active</h1>
        <p className="text-blue-200 mt-1">Your guide profile is live and visible to tourists.</p>
      </div>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        {profile.profilePhoto && (
          <div className="flex justify-center mb-2">
            <img src={profile.profilePhoto} alt="Profile"
              className="w-24 h-24 rounded-2xl object-cover border-4 border-blue-100 shadow" />
          </div>
        )}
        {[
          { label: "Location", value: profile.location },
          { label: "Experience", value: `${profile.experienceYears} years` },
          { label: "Price / Day", value: `$${profile.pricePerDay}` },
          { label: "Languages", value: profile.languages?.join(", ") },
          { label: "Rating", value: `${profile.rating} ⭐` },
        ].map((item) => (
          <div key={item.label} className="flex justify-between border-b border-slate-100 pb-3 last:border-0">
            <span className="text-slate-400 text-sm">{item.label}</span>
            <span className="text-slate-800 font-semibold text-sm">{item.value}</span>
          </div>
        ))}
        <p className="text-slate-600 text-sm pt-2">{profile.bio}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Create Guide Profile</h1>
      <p className="text-slate-500 text-sm mb-6">Set up your profile so tourists can find and book you.</p>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        {success && <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">{success}</div>}
        {error && <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Experience (years) *</label>
              <input name="experienceYears" type="number" min="0"
                value={form.experienceYears} onChange={handleChange} required
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm"
                placeholder="e.g. 5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Price per Day ($) *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input name="pricePerDay" type="number" min="0.01" step="0.01"
                  value={form.pricePerDay} onChange={handleChange} required
                  className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm"
                  placeholder="e.g. 75.00" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Location *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input name="location" value={form.location} onChange={handleChange} required
                className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm"
                placeholder="e.g. Colombo, Sri Lanka" />
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio *</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-3 text-slate-400" size={16} />
              <textarea name="bio" value={form.bio} onChange={handleChange} required rows={3}
                className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm resize-none"
                placeholder="Describe your guiding experience, specialties..." />
            </div>
          </div>

          {/* ✅ Reusable file picker */}
          <ImageUpload
            label="Profile Photo *"
            preview={photoPreview}
            onChange={(base64) => {
              setPhotoPreview(base64);
              setForm((p) => ({ ...p, profilePhoto: base64 }));
            }}
            onClear={() => {
              setPhotoPreview(null);
              setForm((p) => ({ ...p, profilePhoto: "" }));
            }}
            setError={setError}
            maxMB={2}
          />

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition shadow-lg shadow-blue-200"
          >
            <Upload size={16} />
            {submitting ? "Creating Profile..." : "Create Guide Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default GuideProfilePage;
