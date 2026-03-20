import { useEffect, useRef, useState } from "react";
import api from "../../../api/axios";
import { Building2, MapPin, Plus, X, Star, ImageIcon } from "lucide-react";
import ImageUpload from "../../../components/ui/ImageUpload";

function MyHotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [facilityInput, setFacilityInput] = useState("");

  // Each image is { preview: base64, base64: base64 }
  const [imagePreviews, setImagePreviews] = useState([]);

  const [form, setForm] = useState({
    name: "", location: "", description: "", facilities: [], images: [],
  });

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/hotels/my-hotels");
      setHotels(res.data.content || res.data || []);
    } catch {
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHotels(); }, []);

  const addFacility = () => {
    const val = facilityInput.trim();
    if (val && !form.facilities.includes(val)) {
      setForm((p) => ({ ...p, facilities: [...p.facilities, val] }));
    }
    setFacilityInput("");
  };

  const removeFacility = (val) =>
    setForm((p) => ({ ...p, facilities: p.facilities.filter((f) => f !== val) }));

  // Add a new image slot
  const addImageSlot = () => {
    setImagePreviews((p) => [...p, null]);
  };

  const handleImageChange = (index, base64) => {
    const updated = [...imagePreviews];
    updated[index] = base64;
    setImagePreviews(updated);
    setForm((p) => ({ ...p, images: updated.filter(Boolean) }));
  };

  const removeImage = (index) => {
    const updated = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(updated);
    setForm((p) => ({ ...p, images: updated.filter(Boolean) }));
  };

  const resetForm = () => {
    setForm({ name: "", location: "", description: "", facilities: [], images: [] });
    setImagePreviews([]);
    setFacilityInput("");
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (form.images.length === 0) { setError("Add at least one hotel photo"); return; }
    if (form.facilities.length === 0) { setError("Add at least one facility"); return; }
    setSubmitting(true);
    try {
      await api.post("/api/hotels", form);
      setSuccess("Hotel listed successfully!");
      resetForm();
      setShowForm(false);
      fetchHotels();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create hotel");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Hotels</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your hotel listings</p>
        </div>
        <button
          onClick={() => { setShowForm((p) => !p); resetForm(); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-md shadow-blue-200"
        >
          <Plus size={16} />
          {showForm ? "Cancel" : "Add Hotel"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5">New Hotel Listing</h2>

          {success && <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">{success}</div>}
          {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Hotel Name *</label>
                <input
                  name="name" value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"
                  placeholder="e.g. Ocean View Resort"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    name="location" value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    required
                    className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"
                    placeholder="e.g. Galle, Sri Lanka"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
              <textarea
                name="description" value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                required rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition resize-none"
                placeholder="Describe your hotel..."
              />
            </div>

            {/* Facilities */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Facilities *</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={facilityInput}
                  onChange={(e) => setFacilityInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFacility())}
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"
                  placeholder="e.g. WiFi, Pool, AC — press Enter to add"
                />
                <button type="button" onClick={addFacility}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-xl transition">
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.facilities.map((f) => (
                  <span key={f} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-medium">
                    {f}
                    <button type="button" onClick={() => removeFacility(f)}><X size={11} /></button>
                  </span>
                ))}
              </div>
            </div>

            {/* ✅ Hotel Images — File pickers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Hotel Photos * ({imagePreviews.filter(Boolean).length} selected)
                </label>
                <button
                  type="button"
                  onClick={addImageSlot}
                  className="flex items-center gap-1.5 text-blue-600 hover:text-blue-500 text-xs font-semibold transition"
                >
                  <Plus size={14} /> Add Photo
                </button>
              </div>

              {imagePreviews.length === 0 && (
                <div
                  onClick={addImageSlot}
                  className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                >
                  <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <ImageIcon size={22} className="text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-medium text-sm">Click to add hotel photos</p>
                  <p className="text-slate-400 text-xs mt-0.5">You can add multiple photos</p>
                </div>
              )}

              <div className="space-y-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <ImageUpload
                      label={`Photo ${index + 1}`}
                      preview={preview}
                      onChange={(base64) => handleImageChange(index, base64)}
                      onClear={() => removeImage(index)}
                      setError={setError}
                      maxMB={2}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit" disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition shadow-lg shadow-blue-200"
            >
              {submitting ? "Creating..." : "Create Hotel Listing"}
            </button>
          </form>
        </div>
      )}

      {/* Hotel list */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : hotels.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
          <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600 font-semibold">No hotels listed yet</p>
          <p className="text-slate-400 text-sm mt-1">Click "Add Hotel" to create your first listing</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {hotels.map((hotel) => (
            <div key={hotel.hotelId} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden">
              <div className="h-36 bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center overflow-hidden">
                {hotel.thumbnailImage
                  ? <img src={hotel.thumbnailImage} alt={hotel.name} className="w-full h-full object-cover" />
                  : <Building2 size={40} className="text-purple-300" />
                }
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-800">{hotel.name}</h3>
                <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                  <MapPin size={11} /> {hotel.location}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                    <Star size={12} fill="currentColor" /> {hotel.rating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-emerald-600 text-xs font-bold">
                    ${parseFloat(hotel.minPrice || 0).toFixed(0)}/night
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyHotelsPage;
