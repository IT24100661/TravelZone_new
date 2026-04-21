import { useEffect, useState } from "react";
import api from "../../../api/axios";
import {
  Building2, MapPin, Plus, X, Star, BedDouble,
  ChevronDown, ChevronUp, CheckCircle,
  AlertCircle, Pencil, Trash2, Save
} from "lucide-react";
import ImageUpload from "../../../components/ui/ImageUpload";

/* ═══════════════════════════════════════════════════════
   RED BUTTON — fully inline, immune to dark-mode nuclear
   override (.dark div / .dark span / .dark .bg-red-50)
═══════════════════════════════════════════════════════ */
function RedButton({ onClick, disabled, icon: Icon, children, style: extra = {} }) {
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
        gap: "0.35rem",
        fontWeight: 700,
        fontSize: "0.82rem",
        letterSpacing: "0.02em",
        color: "#fff",
        border: "none",
        borderRadius: "0.75rem",
        cursor: disabled ? "not-allowed" : "pointer",
        outline: "none",
        fontFamily: "inherit",
        WebkitFontSmoothing: "antialiased",
        background: "linear-gradient(175deg, #7f1d1d 0%, #991b1b 35%, #b91c1c 70%, #dc2626 100%)",
        transform: active
          ? "translateY(1px)"
          : hovered ? "translateY(-3px)" : "translateY(-2px)",
        boxShadow: active
          ? "0 2px 0px #450a0a, 0 4px 10px rgba(185,28,28,0.3)"
          : hovered
          ? "0 6px 0px #450a0a, 0 12px 24px rgba(185,28,28,0.55), 0 4px 8px rgba(0,0,0,0.3)"
          : "0 4px 0px #450a0a, 0 8px 18px rgba(185,28,28,0.45), 0 2px 6px rgba(0,0,0,0.3)",
        opacity: disabled ? 0.55 : 1,
        transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.15s ease",
        ...extra,
      }}
    >
      {/* Gloss */}
      <span style={{
        position: "absolute", top: "3px", left: "14%", width: "72%", height: "38%",
        borderRadius: "999px", pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 100%)",
      }} />
      {/* Bottom vignette */}
      <span style={{
        position: "absolute", bottom: 0, left: 0, width: "100%", height: "40%",
        borderRadius: "0 0 0.75rem 0.75rem", pointerEvents: "none",
        background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.28) 100%)",
      }} />
      {Icon && (
        <Icon
          size={12}
          style={{ position: "relative", zIndex: 2, color: "#fff", flexShrink: 0 }}
        />
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
function MyHotelsPage() {
  const [hotels, setHotels]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [success, setSuccess]           = useState("");
  const [error, setError]               = useState("");
  const [facilityInput, setFacilityInput]   = useState("");
  const [imagePreviews, setImagePreviews]   = useState([]);
  const [expandedHotel, setExpandedHotel]   = useState(null);
  const [hotelRooms, setHotelRooms]         = useState({});

  const [addingRoomFor, setAddingRoomFor]   = useState(null);
  const [roomForm, setRoomForm]             = useState({ roomType: "", roomCount: "", pricePerNight: "" });
  const [roomSuccess, setRoomSuccess]       = useState("");
  const [roomError, setRoomError]           = useState("");
  const [savingRoom, setSavingRoom]         = useState(false);
  const [deletingRoom, setDeletingRoom]     = useState(null);

  const [editingHotel, setEditingHotel]         = useState(null);
  const [editForm, setEditForm]                 = useState({ name: "", location: "", description: "", facilities: [], images: [] });
  const [editFacilityInput, setEditFacilityInput] = useState("");
  const [editImagePreviews, setEditImagePreviews] = useState([]);
  const [editSubmitting, setEditSubmitting]     = useState(false);
  const [editError, setEditError]               = useState("");
  const [editSuccess, setEditSuccess]           = useState("");
  const [deletingHotel, setDeletingHotel]       = useState(null);

  const [form, setForm] = useState({ name: "", location: "", description: "", facilities: [], images: [] });

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/hotels/my-hotels");
      setHotels(res.data || []);
    } catch { setHotels([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHotels(); }, []);

  const loadRooms = async (hotelId) => {
    try {
      const res = await api.get(`/api/hotels/${hotelId}`);
      setHotelRooms((prev) => ({ ...prev, [hotelId]: res.data.rooms || [] }));
    } catch {
      setHotelRooms((prev) => ({ ...prev, [hotelId]: [] }));
    }
  };

  const toggleExpand = (hotelId) => {
    if (expandedHotel === hotelId) { setExpandedHotel(null); }
    else { setExpandedHotel(hotelId); if (!hotelRooms[hotelId]) loadRooms(hotelId); }
    setAddingRoomFor(null); setRoomSuccess(""); setRoomError("");
  };

  /* ── Create hotel helpers ── */
  const addFacility       = () => { const v = facilityInput.trim(); if (v && !form.facilities.includes(v)) setForm((p) => ({ ...p, facilities: [...p.facilities, v] })); setFacilityInput(""); };
  const removeFacility    = (v) => setForm((p) => ({ ...p, facilities: p.facilities.filter((f) => f !== v) }));
  const addImageSlot      = () => setImagePreviews((p) => [...p, null]);
  const handleImageChange = (i, b64) => { const u = [...imagePreviews]; u[i] = b64; setImagePreviews(u); setForm((p) => ({ ...p, images: u.filter(Boolean) })); };
  const removeImage       = (i) => { const u = imagePreviews.filter((_, j) => j !== i); setImagePreviews(u); setForm((p) => ({ ...p, images: u.filter(Boolean) })); };
  const resetForm         = () => { setForm({ name: "", location: "", description: "", facilities: [], images: [] }); setImagePreviews([]); setFacilityInput(""); setError(""); setSuccess(""); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (form.images.length === 0)     { setError("Add at least one hotel photo"); return; }
    if (form.facilities.length === 0) { setError("Add at least one facility"); return; }
    setSubmitting(true);
    try {
      await api.post("/api/hotels", form);
      setSuccess("Hotel listed successfully!"); resetForm(); setShowForm(false); fetchHotels();
    } catch (err) { setError(err?.response?.data?.message || "Failed to create hotel"); }
    finally { setSubmitting(false); }
  };

  /* ── Edit hotel helpers ── */
  const openEdit = async (hotel) => {
    setEditError(""); setEditSuccess("");
    try {
      const res = await api.get(`/api/hotels/${hotel.hotelId}`);
      const d = res.data;
      setEditingHotel(hotel);
      setEditForm({ name: d.name, location: d.location, description: d.description, facilities: d.facilities || [], images: [] });
      setEditImagePreviews([]); setEditFacilityInput("");
    } catch { setError("Failed to load hotel details"); }
  };
  const addEditFacility       = () => { const v = editFacilityInput.trim(); if (v && !editForm.facilities.includes(v)) setEditForm((p) => ({ ...p, facilities: [...p.facilities, v] })); setEditFacilityInput(""); };
  const removeEditFacility    = (v) => setEditForm((p) => ({ ...p, facilities: p.facilities.filter((f) => f !== v) }));
  const addEditImageSlot      = () => setEditImagePreviews((p) => [...p, null]);
  const handleEditImageChange = (i, b64) => { const u = [...editImagePreviews]; u[i] = b64; setEditImagePreviews(u); setEditForm((p) => ({ ...p, images: u.filter(Boolean) })); };
  const removeEditImage       = (i) => { const u = editImagePreviews.filter((_, j) => j !== i); setEditImagePreviews(u); setEditForm((p) => ({ ...p, images: u.filter(Boolean) })); };

  const handleEditSubmit = async (e) => {
    e.preventDefault(); setEditError(""); setEditSuccess("");
    if (editForm.facilities.length === 0) { setEditError("Add at least one facility"); return; }
    setEditSubmitting(true);
    try {
      await api.put(`/api/hotels/${editingHotel.hotelId}`, editForm);
      setEditSuccess("Hotel updated successfully!"); fetchHotels();
      setTimeout(() => { setEditingHotel(null); setEditSuccess(""); }, 1200);
    } catch (err) { setEditError(err?.response?.data?.message || "Failed to update hotel"); }
    finally { setEditSubmitting(false); }
  };

  /* ── Delete hotel ── */
  const handleDeleteHotel = async (hotelId) => {
    if (!window.confirm("Delete this hotel? This action cannot be undone.")) return;
    setDeletingHotel(hotelId);
    try {
      await api.delete(`/api/hotels/${hotelId}`);
      fetchHotels(); if (expandedHotel === hotelId) setExpandedHotel(null);
    } catch (err) { setError(err?.response?.data?.message || "Failed to delete hotel"); }
    finally { setDeletingHotel(null); }
  };

  /* ── Room helpers ── */
  const handleAddRoom = async (hotelId) => {
    setRoomError(""); setRoomSuccess("");
    if (!roomForm.roomType.trim())                               { setRoomError("Room type is required"); return; }
    if (!roomForm.roomCount || parseInt(roomForm.roomCount) < 1) { setRoomError("Room count must be at least 1"); return; }
    if (!roomForm.pricePerNight || parseFloat(roomForm.pricePerNight) <= 0) { setRoomError("Valid price is required"); return; }
    setSavingRoom(true);
    try {
      await api.post(`/api/hotels/${hotelId}/rooms`, {
        roomType:      roomForm.roomType,
        roomCount:     parseInt(roomForm.roomCount),
        pricePerNight: parseFloat(roomForm.pricePerNight),
      });
      setRoomSuccess("Room added successfully!");
      setRoomForm({ roomType: "", roomCount: "", pricePerNight: "" });
      setAddingRoomFor(null); loadRooms(hotelId); fetchHotels();
    } catch (err) { setRoomError(err?.response?.data?.message || "Failed to add room"); }
    finally { setSavingRoom(false); }
  };

  const handleDeleteRoom = async (hotelId, roomId) => {
    if (!window.confirm("Delete this room?")) return;
    setDeletingRoom(roomId); setRoomError("");
    try {
      await api.delete(`/api/hotels/${hotelId}/rooms/${roomId}`);
      setRoomSuccess("Room deleted!"); loadRooms(hotelId); fetchHotels();
    } catch (err) { setRoomError(err?.response?.data?.message || "Failed to delete room"); }
    finally { setDeletingRoom(null); }
  };

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <>
      {/* ── Scoped styles: tz-input shape + placeholder fix ── */}
      <style>{`
        .tz-input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          font-family: inherit;
          border-radius: 0.75rem;
          border: 1.5px solid var(--tz-input-border);
          background: var(--tz-input-bg);
          color: var(--tz-text);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.06);
          -webkit-font-smoothing: antialiased;
        }
        .tz-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.18), inset 0 1px 3px rgba(0,0,0,0.06);
        }

        /* Light theme placeholder */
        :root .tz-input::placeholder,
        [data-theme="light"] .tz-input::placeholder {
          color: #94a3b8;
          opacity: 1;
        }

        /* Dark theme placeholder */
        [data-theme="dark"] .tz-input::placeholder {
          color: #475569;
          opacity: 1;
        }

        /* Extra padding helpers used inline via className */
        .tz-input.pl-9  { padding-left: 2.25rem; }
        .tz-input.pl-10 { padding-left: 2.5rem; }
        .tz-input.resize-none { resize: none; }
      `}</style>

      <div>

        {/* ── Edit Hotel Modal ── */}
        {editingHotel && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
          >
            <div
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl"
              style={{
                background: "var(--tz-card-bg)",
                border:     "1px solid var(--tz-card-border)",
                boxShadow:  "0 8px 0px rgba(0,0,0,0.2), 0 24px 64px rgba(0,0,0,0.4)",
              }}
            >
              {/* Modal header */}
              <div
                className="flex items-center justify-between p-6"
                style={{ borderBottom: "1px solid var(--tz-border-soft)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center icon-3d"
                    style={{ boxShadow: "0 3px 0px #1e3a8a, 0 6px 14px rgba(59,130,246,0.4)" }}
                  >
                    <Pencil size={15} className="text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-[var(--tz-text)]">Edit Hotel</h2>
                </div>
                <button
                  onClick={() => setEditingHotel(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl transition"
                  style={{ background: "var(--tz-surface-2)", color: "var(--tz-text-muted)" }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal body */}
              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                {editSuccess && <Alert type="success" msg={editSuccess} />}
                {editError   && <Alert type="error"   msg={editError}   />}

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Hotel Name *">
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                      required
                      className="tz-input"
                      placeholder="e.g. Ocean View Resort"
                    />
                  </FormField>
                  <FormField label="Location *">
                    <div className="relative">
                      <MapPin
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tz-text-faint)]"
                        size={15}
                      />
                      <input
                        value={editForm.location}
                        onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))}
                        required
                        className="tz-input pl-9"
                        placeholder="e.g. Galle, Sri Lanka"
                      />
                    </div>
                  </FormField>
                </div>

                <FormField label="Description *">
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                    required
                    rows={3}
                    className="tz-input resize-none"
                  />
                </FormField>

                <FacilityField
                  label="Facilities *"
                  value={editFacilityInput}
                  onChange={setEditFacilityInput}
                  onAdd={addEditFacility}
                  tags={editForm.facilities}
                  onRemove={removeEditFacility}
                />

                {/* Photo replace */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-[var(--tz-text)]">
                      Replace Photos{" "}
                      <span className="text-[var(--tz-text-faint)] font-normal">(optional)</span>
                    </label>
                    <button
                      type="button"
                      onClick={addEditImageSlot}
                      className="flex items-center gap-1.5 text-blue-500 text-xs font-semibold"
                    >
                      <Plus size={14} /> Add Photo
                    </button>
                  </div>
                  <div className="space-y-3">
                    {editImagePreviews.map((preview, i) => (
                      <ImageUpload
                        key={i}
                        label={`Photo ${i + 1}`}
                        preview={preview}
                        onChange={(b64) => handleEditImageChange(i, b64)}
                        onClear={() => removeEditImage(i)}
                        setError={setEditError}
                        maxMB={2}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="btn-3d-blue btn-3d-wide flex-1"
                    style={{ paddingTop: "0.75rem", paddingBottom: "0.75rem" }}
                  >
                    <Save size={15} />
                    <span>{editSubmitting ? "Saving..." : "Save Changes"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingHotel(null)}
                    className="btn-3d-slate px-6"
                    style={{ paddingTop: "0.75rem", paddingBottom: "0.75rem" }}
                  >
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Page header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-[var(--tz-text)]">My Hotels</h1>
            <p className="text-[var(--tz-text-muted)] text-sm mt-0.5">
              Manage your hotel listings and rooms
            </p>
          </div>
          <button
            onClick={() => { setShowForm((p) => !p); resetForm(); }}
            className="btn-3d-blue"
            style={{ padding: "0.625rem 1.25rem" }}
          >
            <Plus size={16} />
            <span>{showForm ? "Cancel" : "Add Hotel"}</span>
          </button>
        </div>

        {error && (
          <div className="mb-4">
            <Alert type="error" msg={error} onDismiss={() => setError("")} />
          </div>
        )}

        {/* ── Create Hotel Form ── */}
        {showForm && (
          <div
            className="rounded-3xl border p-8 mb-6"
            style={{
              background:  "var(--tz-card-bg)",
              borderColor: "var(--tz-card-border)",
              boxShadow:   "0 4px 0px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.08)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center icon-3d"
                style={{ boxShadow: "0 3px 0px #5b21b6, 0 6px 14px rgba(139,92,246,0.4)" }}
              >
                <Building2 size={16} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-[var(--tz-text)]">New Hotel Listing</h2>
            </div>

            {success && <div className="mb-4"><Alert type="success" msg={success} /></div>}
            {error   && <div className="mb-4"><Alert type="error"   msg={error}   /></div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Hotel Name *">
                  <input
                    name="name"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                    className="tz-input"
                    placeholder="e.g. Ocean View Resort"
                  />
                </FormField>
                <FormField label="Location *">
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tz-text-faint)]"
                      size={15}
                    />
                    <input
                      name="location"
                      value={form.location}
                      onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                      required
                      className="tz-input pl-9"
                      placeholder="e.g. Galle, Sri Lanka"
                    />
                  </div>
                </FormField>
              </div>

              <FormField label="Description *">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  required
                  rows={3}
                  className="tz-input resize-none"
                  placeholder="Describe your hotel..."
                />
              </FormField>

              <FacilityField
                label="Facilities *"
                value={facilityInput}
                onChange={setFacilityInput}
                onAdd={addFacility}
                tags={form.facilities}
                onRemove={removeFacility}
              />

              {/* Photos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[var(--tz-text)]">
                    Hotel Photos *{" "}
                    <span className="text-[var(--tz-text-faint)] font-normal">
                      ({imagePreviews.filter(Boolean).length} selected)
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={addImageSlot}
                    className="flex items-center gap-1.5 text-blue-500 text-xs font-semibold"
                  >
                    <Plus size={14} /> Add Photo
                  </button>
                </div>
                {imagePreviews.length === 0 ? (
                  <div
                    onClick={addImageSlot}
                    className="rounded-2xl p-8 text-center cursor-pointer transition-all"
                    style={{
                      border:     "2px dashed var(--tz-border)",
                      background: "var(--tz-surface-2)",
                      color:      "var(--tz-text-muted)",
                    }}
                  >
                    <Plus size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-sm">Click to add hotel photos</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {imagePreviews.map((preview, i) => (
                      <ImageUpload
                        key={i}
                        label={`Photo ${i + 1}`}
                        preview={preview}
                        onChange={(b64) => handleImageChange(i, b64)}
                        onClear={() => removeImage(i)}
                        setError={setError}
                        maxMB={2}
                      />
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-3d-blue btn-3d-wide w-full"
                style={{ paddingTop: "0.75rem", paddingBottom: "0.75rem" }}
              >
                <span>{submitting ? "Creating..." : "Create Hotel Listing"}</span>
              </button>
            </form>
          </div>
        )}

        {/* ── Hotel List ── */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : hotels.length === 0 ? (
          <div
            className="rounded-3xl border p-16 text-center"
            style={{
              background:  "var(--tz-card-bg)",
              borderColor: "var(--tz-card-border)",
              boxShadow:   "0 3px 0px rgba(0,0,0,0.06)",
            }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4 icon-3d">
              <Building2 size={28} className="text-[var(--tz-text-faint)]" />
            </div>
            <p className="text-[var(--tz-text)] font-bold text-lg">No hotels listed yet</p>
            <p className="text-[var(--tz-text-muted)] text-sm mt-1">
              Click "Add Hotel" to create your first listing
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {hotels.map((hotel) => (
              <div
                key={hotel.hotelId}
                className="rounded-2xl border overflow-hidden transition-all duration-200"
                style={{
                  background:  "var(--tz-card-bg)",
                  borderColor: "var(--tz-card-border)",
                  boxShadow:   "0 3px 0px rgba(0,0,0,0.08), 0 6px 18px rgba(0,0,0,0.07)",
                }}
              >
                {/* Hotel summary row */}
                <div className="flex items-center gap-4 p-5">
                  {/* Thumbnail */}
                  <div
                    className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(99,102,241,0.18) 100%)",
                      boxShadow:  "0 3px 0px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.15)",
                    }}
                  >
                    {hotel.thumbnailImage
                      ? <img src={hotel.thumbnailImage} alt={hotel.name} className="w-full h-full object-cover" />
                      : <Building2 size={26} className="text-violet-400" />
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[var(--tz-text)]">{hotel.name}</h3>
                    <p className="flex items-center gap-1 text-[var(--tz-text-muted)] text-xs mt-0.5">
                      <MapPin size={11} /> {hotel.location}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                        <Star size={11} fill="currentColor" /> {hotel.rating?.toFixed(1) || "0.0"}
                      </span>
                      <span className="text-emerald-500 text-xs font-bold">
                        From LKR {parseFloat(hotel.minPrice || 0).toFixed(0)}/night
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEdit(hotel)}
                      className="btn-3d-slate"
                      style={{ padding: "0.45rem 0.875rem" }}
                    >
                      <Pencil size={13} />
                      <span className="text-xs font-semibold">Edit</span>
                    </button>

                    {/* ← RedButton replaces btn-3d-red */}
                    <RedButton
                      onClick={() => handleDeleteHotel(hotel.hotelId)}
                      disabled={deletingHotel === hotel.hotelId}
                      icon={Trash2}
                      style={{ padding: "0.45rem 0.875rem" }}
                    >
                      <span className="text-xs font-semibold">
                        {deletingHotel === hotel.hotelId ? "Deleting..." : "Delete"}
                      </span>
                    </RedButton>

                    <button
                      onClick={() => toggleExpand(hotel.hotelId)}
                      className="btn-3d-slate"
                      style={{ padding: "0.45rem 0.875rem" }}
                    >
                      {expandedHotel === hotel.hotelId
                        ? <ChevronUp size={14} />
                        : <ChevronDown size={14} />
                      }
                      <span className="text-xs font-semibold">Rooms</span>
                    </button>
                  </div>
                </div>

                {/* ── Expanded Rooms Panel ── */}
                {expandedHotel === hotel.hotelId && (
                  <div
                    className="p-5"
                    style={{
                      borderTop:  "1px solid var(--tz-border-soft)",
                      background: "var(--tz-surface-2)",
                    }}
                  >
                    {roomSuccess && <div className="mb-4"><Alert type="success" msg={roomSuccess} /></div>}
                    {roomError   && <div className="mb-4"><Alert type="error"   msg={roomError}   /></div>}

                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-[var(--tz-text)] text-sm flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center icon-3d"
                          style={{ boxShadow: "0 2px 0px #5b21b6" }}
                        >
                          <BedDouble size={12} className="text-white" />
                        </div>
                        Rooms
                      </h4>
                      <button
                        onClick={() => {
                          setAddingRoomFor(addingRoomFor === hotel.hotelId ? null : hotel.hotelId);
                          setRoomForm({ roomType: "", roomCount: "", pricePerNight: "" });
                          setRoomError(""); setRoomSuccess("");
                        }}
                        className="btn-3d-blue"
                        style={{ padding: "0.4rem 0.875rem" }}
                      >
                        <Plus size={13} />
                        <span className="text-xs font-semibold">Add Room</span>
                      </button>
                    </div>

                    {/* Add room form */}
                    {addingRoomFor === hotel.hotelId && (
                      <div
                        className="rounded-2xl border p-4 mb-4"
                        style={{
                          background:  "var(--tz-card-bg)",
                          borderColor: "var(--tz-card-border)",
                          boxShadow:   "0 2px 0px rgba(0,0,0,0.06)",
                        }}
                      >
                        <h5 className="font-bold text-[var(--tz-text)] text-sm mb-3">New Room Type</h5>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <FormField label="Room Type *">
                            <input
                              value={roomForm.roomType}
                              onChange={(e) => setRoomForm((p) => ({ ...p, roomType: e.target.value }))}
                              className="tz-input"
                              placeholder="e.g. Deluxe"
                            />
                          </FormField>
                          <FormField label="Room Count *">
                            <input
                              type="number" min="1"
                              value={roomForm.roomCount}
                              onChange={(e) => setRoomForm((p) => ({ ...p, roomCount: e.target.value }))}
                              className="tz-input"
                              placeholder="e.g. 10"
                            />
                          </FormField>
                          <FormField label="Price / Night *">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tz-text-faint)] text-xs font-semibold pointer-events-none">
                                LKR
                              </span>
                              <input
                                type="number" min="0.01" step="0.01"
                                value={roomForm.pricePerNight}
                                onChange={(e) => setRoomForm((p) => ({ ...p, pricePerNight: e.target.value }))}
                                className="tz-input pl-10"
                                placeholder="e.g. 15000"
                              />
                            </div>
                          </FormField>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddRoom(hotel.hotelId)}
                            disabled={savingRoom}
                            className="btn-3d-blue"
                            style={{ padding: "0.5rem 1rem", opacity: savingRoom ? 0.6 : 1 }}
                          >
                            <span className="text-xs font-bold">{savingRoom ? "Adding..." : "Add Room"}</span>
                          </button>
                          <button
                            onClick={() => { setAddingRoomFor(null); setRoomError(""); }}
                            className="btn-3d-slate"
                            style={{ padding: "0.5rem 1rem" }}
                          >
                            <span className="text-xs font-bold">Cancel</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Room list */}
                    {(hotelRooms[hotel.hotelId] || []).length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-3 icon-3d">
                          <BedDouble size={20} className="text-[var(--tz-text-faint)]" />
                        </div>
                        <p className="text-[var(--tz-text-muted)] text-sm">
                          No rooms yet. Click "Add Room" to get started.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(hotelRooms[hotel.hotelId] || []).map((room) => (
                          <div
                            key={room.roomId}
                            className="rounded-xl border px-4 py-3 flex items-center justify-between transition-all"
                            style={{
                              background:  "var(--tz-card-bg)",
                              borderColor: "var(--tz-card-border)",
                              boxShadow:   "0 2px 0px rgba(0,0,0,0.06)",
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center icon-3d"
                                style={{ boxShadow: "0 2px 0px #5b21b6" }}
                              >
                                <BedDouble size={14} className="text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-[var(--tz-text)] text-sm">{room.roomType}</p>
                                <p className="text-[var(--tz-text-muted)] text-xs">
                                  {room.availableCount}/{room.roomCount} available
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-emerald-500 font-bold text-sm">
                                LKR {parseFloat(room.pricePerNight).toFixed(0)}/night
                              </span>
                              <span
                                className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                                style={{
                                  background: room.available ? "rgba(16,185,129,0.1)"  : "rgba(239,68,68,0.1)",
                                  color:      room.available ? "#10b981"               : "#ef4444",
                                  border:     room.available
                                    ? "1px solid rgba(16,185,129,0.2)"
                                    : "1px solid rgba(239,68,68,0.2)",
                                }}
                              >
                                {room.available ? "Available" : "Full"}
                              </span>

                              {/* ← RedButton replaces btn-3d-red for room delete */}
                              <RedButton
                                onClick={() => handleDeleteRoom(hotel.hotelId, room.roomId)}
                                disabled={deletingRoom === room.roomId}
                                icon={Trash2}
                                style={{ padding: "0.35rem 0.7rem" }}
                              >
                                <span className="text-xs font-bold">
                                  {deletingRoom === room.roomId ? "..." : "Delete"}
                                </span>
                              </RedButton>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ── Shared small components ── */

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--tz-text)] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function FacilityField({ label, value, onChange, onAdd, tags, onRemove }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--tz-text)] mb-1.5">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAdd())}
          className="tz-input flex-1"
          placeholder="e.g. WiFi, Pool — press Enter"
        />
        <button type="button" onClick={onAdd} className="btn-3d-blue" style={{ padding: "0.5rem 1rem" }}>
          <Plus size={16} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((f) => (
          <span
            key={f}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
            style={{
              background: "rgba(59,130,246,0.1)",
              color:      "#60a5fa",
              border:     "1px solid rgba(59,130,246,0.2)",
              boxShadow:  "0 2px 0px rgba(59,130,246,0.12)",
            }}
          >
            {f}
            <button type="button" onClick={() => onRemove(f)} className="hover:opacity-70 transition">
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function Alert({ type, msg, onDismiss }) {
  const isSuccess = type === "success";
  const color     = isSuccess ? "16,185,129" : "239,68,68";
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm flex items-center gap-2 font-medium"
      style={{
        background: `rgba(${color},0.08)`,
        color:       isSuccess ? "#10b981" : "#ef4444",
        border:      `1px solid rgba(${color},0.2)`,
        boxShadow:   `0 2px 0px rgba(${color},0.1)`,
      }}
    >
      {isSuccess ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      <span className="flex-1">{msg}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="hover:opacity-70 transition ml-auto">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export default MyHotelsPage;