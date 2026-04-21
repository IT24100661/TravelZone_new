import { useEffect, useState } from "react";
import api from "../../../api/axios";
import {
  MapPin, BookOpen, Plus, X,
  CheckCircle, Upload, Pencil, Trash2, Save, AlertCircle
} from "lucide-react";
import ImageUpload from "../../../components/ui/ImageUpload";

/* ─────────────────────────────────────────────────────────
   RED BUTTON — fully inline, immune to dark-mode nuclear
   override (.dark div/.dark span/.dark .bg-red-50 etc.)
───────────────────────────────────────────────────────── */
function RedButton({ onClick, disabled, icon: Icon, children, style: extraStyle = {} }) {
  const [hovered, setHovered] = useState(false);
  const [active,  setActive]  = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.4rem",
        padding: "0.5rem 1rem",
        fontWeight: 700,
        fontSize: "0.88rem",
        letterSpacing: "0.02em",
        color: "#fff",
        border: "none",
        borderRadius: "0.875rem",
        cursor: disabled ? "not-allowed" : "pointer",
        outline: "none",
        fontFamily: "inherit",
        WebkitFontSmoothing: "antialiased",
        background: "linear-gradient(175deg, #7f1d1d 0%, #991b1b 35%, #b91c1c 70%, #dc2626 100%)",
        transform: active
          ? "translateY(1px)"
          : hovered
          ? "translateY(-3px)"
          : "translateY(-2px)",
        boxShadow: active
          ? "0 2px 0px #450a0a, 0 4px 10px rgba(185,28,28,0.3), 0 1px 3px rgba(0,0,0,0.3)"
          : hovered
          ? "0 6px 0px #450a0a, 0 12px 24px rgba(185,28,28,0.55), 0 4px 8px rgba(0,0,0,0.3)"
          : "0 4px 0px #450a0a, 0 8px 18px rgba(185,28,28,0.45), 0 2px 6px rgba(0,0,0,0.3)",
        opacity: disabled ? 0.55 : 1,
        transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.15s ease",
        ...extraStyle,
      }}
    >
      {/* Gloss highlight */}
      <span style={{
        position: "absolute", top: "3px", left: "14%", width: "72%", height: "38%",
        borderRadius: "999px", pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 100%)",
      }} />
      {/* Bottom shadow vignette */}
      <span style={{
        position: "absolute", bottom: 0, left: 0, width: "100%", height: "40%",
        borderRadius: "0 0 0.875rem 0.875rem", pointerEvents: "none",
        background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.28) 100%)",
      }} />
      {Icon && (
        <Icon size={14} style={{ position: "relative", zIndex: 2, color: "#fff", flexShrink: 0 }} />
      )}
      <span style={{ position: "relative", zIndex: 2, color: "#fff" }}>
        {children}
      </span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
function GuideProfilePage() {
  const [profile, setProfile]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [mode, setMode]                 = useState("view");
  const [submitting, setSubmitting]     = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [success, setSuccess]           = useState("");
  const [error, setError]               = useState("");
  const [langInput, setLangInput]       = useState("");
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
      setProfile(res.data); setMode("view");
    } catch (err) {
      if (err?.response?.status === 404) { setProfile(null); setMode("create"); }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const startEdit = () => {
    setForm({
      experienceYears: profile.experienceYears?.toString() || "",
      languages:       [...(profile.languages || [])],
      pricePerDay:     profile.pricePerDay?.toString() || "",
      location:        profile.location || "",
      bio:             profile.bio || "",
      profilePhoto:    profile.profilePhoto || "",
    });
    setPhotoPreview(profile.profilePhoto || null);
    setSuccess(""); setError(""); setMode("edit");
  };

  const cancelEdit = () => { setMode("view"); setSuccess(""); setError(""); };
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const addLanguage = () => {
    const lang = langInput.trim();
    if (lang && !form.languages.includes(lang))
      setForm((p) => ({ ...p, languages: [...p.languages, lang] }));
    setLangInput("");
  };

  const removeLanguage = (lang) =>
    setForm((p) => ({ ...p, languages: p.languages.filter((l) => l !== lang) }));

  const handleCreate = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (form.languages.length === 0) { setError("Add at least one language"); return; }
    if (!form.profilePhoto)          { setError("Please select a profile photo"); return; }
    setSubmitting(true);
    try {
      await api.post("/api/guides", {
        ...form,
        experienceYears: parseInt(form.experienceYears),
        pricePerDay:     parseFloat(form.pricePerDay),
      });
      setSuccess("Guide profile created!"); fetchProfile();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create profile");
    } finally { setSubmitting(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (form.languages.length === 0) { setError("Add at least one language"); return; }
    setSubmitting(true);
    try {
      await api.put("/api/guides/me", {
        ...form,
        experienceYears: parseInt(form.experienceYears),
        pricePerDay:     parseFloat(form.pricePerDay),
      });
      setSuccess("Profile updated successfully!"); fetchProfile();
    } catch (err) {
      setError(err?.response?.data?.message || "Update failed");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your guide profile? This cannot be undone.")) return;
    setDeleting(true); setError("");
    try {
      await api.delete("/api/guides/me");
      setProfile(null); setForm(emptyForm); setPhotoPreview(null); setMode("create");
    } catch (err) {
      setError(err?.response?.data?.message || "Delete failed");
    } finally { setDeleting(false); }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  /* ══════════════════════════════════════════════════════
     VIEW MODE
  ══════════════════════════════════════════════════════ */
  if (mode === "view" && profile) return (
    <div className="max-w-2xl mx-auto">

      {/* Hero card */}
      <div
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 mb-6 flex items-center gap-5 relative overflow-hidden"
        style={{
          boxShadow: "0 8px 0px #1e3a8a, 0 16px 40px rgba(59,130,246,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        {/* Gloss */}
        <div
          className="absolute top-0 left-0 right-0 h-1/2 rounded-t-3xl pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)" }}
        />
        <div className="absolute -top-6 -right-6 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        {/* Photo */}
        {profile.profilePhoto ? (
          <img
            src={profile.profilePhoto} alt="Profile"
            className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30 shadow-lg flex-shrink-0 relative z-10"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 relative z-10 icon-3d">
            {profile.name?.charAt(0)}
          </div>
        )}

        {/* Name / location */}
        <div className="flex-1 relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center icon-3d"
              style={{ boxShadow: "0 2px 0px rgba(4,120,87,0.4)" }}
            >
              <CheckCircle size={12} className="text-white" />
            </div>
            <span className="text-emerald-200 text-sm font-medium">Profile Active</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
          <p className="text-blue-200 text-sm flex items-center gap-1 mt-0.5">
            <MapPin size={13} /> {profile.location}
          </p>
        </div>

        {/* Action buttons — Edit uses existing class, Delete uses RedButton */}
        <div className="flex flex-col gap-2 relative z-10">
          <button
            onClick={startEdit}
            className="btn-3d-slate"
            style={{ padding: "0.5rem 1rem" }}
          >
            <Pencil size={14} />
            <span>Edit</span>
          </button>

          {/* ← RedButton replaces btn-3d-red to fix dark mode visibility */}
          <RedButton
            onClick={handleDelete}
            disabled={deleting}
            icon={Trash2}
          >
            {deleting ? "Deleting..." : "Delete"}
          </RedButton>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="mb-5 rounded-xl px-4 py-3 text-sm border flex items-center gap-2"
          style={{
            background:   "rgba(239,68,68,0.08)",
            borderColor:  "rgba(239,68,68,0.2)",
            color:        "#ef4444",
          }}
        >
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Details card */}
      <div
        className="rounded-3xl border p-6 space-y-4"
        style={{
          background:  "var(--tz-card-bg)",
          borderColor: "var(--tz-card-border)",
          boxShadow:   "0 3px 0px rgba(0,0,0,0.08), 0 6px 18px rgba(0,0,0,0.07)",
        }}
      >
        {[
          { label: "Experience",      value: `${profile.experienceYears} years` },
          {
            label: "Price / Day",
            value: `LKR ${parseFloat(profile.pricePerDay).toLocaleString("en-LK", {
              minimumFractionDigits: 2, maximumFractionDigits: 2,
            })}`,
          },
          { label: "Languages",       value: profile.languages?.join(", ") || "—" },
          { label: "Rating",          value: `${profile.rating?.toFixed(1)} ⭐` },
          { label: "Available Dates", value: `${profile.availableDates?.length || 0} days available` },
        ].map((item) => (
          <div
            key={item.label}
            className="flex justify-between pb-3 border-b last:border-0 last:pb-0"
            style={{ borderColor: "var(--tz-border-soft)" }}
          >
            <span className="text-[var(--tz-text-muted)] text-sm">{item.label}</span>
            <span className="text-[var(--tz-text)] font-semibold text-sm">{item.value}</span>
          </div>
        ))}
        <p className="text-[var(--tz-text-muted)] text-sm leading-relaxed pt-1">{profile.bio}</p>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════
     CREATE / EDIT FORM
  ══════════════════════════════════════════════════════ */
  const isEdit = mode === "edit";

  return (
    <div className="max-w-2xl mx-auto">

      {/* Form header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-[var(--tz-text)]">
            {isEdit ? "Edit Guide Profile" : "Create Guide Profile"}
          </h1>
          <p className="text-[var(--tz-text-muted)] text-sm mt-0.5">
            {isEdit
              ? "Update your profile information below."
              : "Set up your profile so tourists can find and book you."}
          </p>
        </div>
        {isEdit && (
          <button onClick={cancelEdit} className="btn-3d-slate" style={{ padding: "0.5rem 1rem" }}>
            <X size={14} />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Form card */}
      <div
        className="rounded-3xl border p-8 mt-5"
        style={{
          background:  "var(--tz-card-bg)",
          borderColor: "var(--tz-card-border)",
          boxShadow:   "0 4px 0px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* Success / error banners */}
        {success && (
          <div
            className="mb-5 rounded-xl px-4 py-3 text-sm border flex items-center gap-2"
            style={{
              background:  "rgba(16,185,129,0.08)",
              borderColor: "rgba(16,185,129,0.2)",
              color:       "#10b981",
            }}
          >
            <CheckCircle size={15} /> {success}
          </div>
        )}
        {error && (
          <div
            className="mb-5 rounded-xl px-4 py-3 text-sm border flex items-center gap-2"
            style={{
              background:  "rgba(239,68,68,0.08)",
              borderColor: "rgba(239,68,68,0.2)",
              color:       "#ef4444",
            }}
          >
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={isEdit ? handleUpdate : handleCreate} className="space-y-5">

          {/* Experience + Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--tz-text)] mb-1.5">
                Experience (years) *
              </label>
              <input
                name="experienceYears" type="number" min="0"
                value={form.experienceYears} onChange={handleChange} required
                className="w-full rounded-xl px-4 py-2.5 outline-none text-sm transition border"
                style={{
                  background:   "var(--tz-input-bg)",
                  borderColor:  "var(--tz-input-border)",
                  color:        "var(--tz-text)",
                }}
                placeholder="e.g. 5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--tz-text)] mb-1.5">
                Price per Day (LKR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tz-text-faint)] text-xs font-semibold pointer-events-none select-none">
                  LKR
                </span>
                <input
                  name="pricePerDay" type="number" min="0.01" step="0.01"
                  value={form.pricePerDay} onChange={handleChange} required
                  className="w-full rounded-xl pl-11 pr-4 py-2.5 outline-none text-sm transition border"
                  style={{
                    background:  "var(--tz-input-bg)",
                    borderColor: "var(--tz-input-border)",
                    color:       "var(--tz-text)",
                  }}
                  placeholder="e.g. 7500.00"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-[var(--tz-text)] mb-1.5">
              Location *
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tz-text-faint)]"
                size={16}
              />
              <input
                name="location" value={form.location} onChange={handleChange} required
                className="w-full rounded-xl pl-9 pr-4 py-2.5 outline-none text-sm transition border"
                style={{
                  background:  "var(--tz-input-bg)",
                  borderColor: "var(--tz-input-border)",
                  color:       "var(--tz-text)",
                }}
                placeholder="e.g. Colombo, Sri Lanka"
              />
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-medium text-[var(--tz-text)] mb-1.5">
              Languages Spoken *
            </label>
            <div className="flex gap-2 mb-2">
              <input
                value={langInput}
                onChange={(e) => setLangInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
                className="flex-1 rounded-xl px-4 py-2.5 outline-none text-sm transition border"
                style={{
                  background:  "var(--tz-input-bg)",
                  borderColor: "var(--tz-input-border)",
                  color:       "var(--tz-text)",
                }}
                placeholder="Type a language and press Enter"
              />
              <button
                type="button" onClick={addLanguage}
                className="btn-3d-blue" style={{ padding: "0.6rem 1rem" }}
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.languages.map((lang) => (
                <span
                  key={lang}
                  className="flex items-center gap-1.5 text-blue-500 text-xs px-3 py-1.5 rounded-full font-semibold border"
                  style={{
                    background:  "rgba(59,130,246,0.08)",
                    borderColor: "rgba(59,130,246,0.2)",
                    boxShadow:   "0 2px 0px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}
                >
                  {lang}
                  <button
                    type="button"
                    onClick={() => removeLanguage(lang)}
                    className="hover:text-red-400 transition"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-[var(--tz-text)] mb-1.5">
              Bio *
            </label>
            <div className="relative">
              <BookOpen
                className="absolute left-3 top-3 text-[var(--tz-text-faint)]"
                size={16}
              />
              <textarea
                name="bio" value={form.bio} onChange={handleChange} required rows={3}
                className="w-full rounded-xl pl-9 pr-4 py-2.5 outline-none text-sm resize-none transition border"
                style={{
                  background:  "var(--tz-input-bg)",
                  borderColor: "var(--tz-input-border)",
                  color:       "var(--tz-text)",
                }}
                placeholder="Describe your guiding experience, specialties..."
              />
            </div>
          </div>

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

          <button
            type="submit"
            disabled={submitting}
            className="btn-3d-blue btn-3d-wide"
            style={{ paddingTop: "0.75rem", paddingBottom: "0.75rem" }}
          >
            {isEdit ? <Save size={16} /> : <Upload size={16} />}
            <span>
              {submitting
                ? (isEdit ? "Saving..." : "Creating...")
                : (isEdit ? "Save Changes" : "Create Guide Profile")}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default GuideProfilePage;