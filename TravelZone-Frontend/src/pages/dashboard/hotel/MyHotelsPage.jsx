import { useEffect, useState } from "react";
import api from "../../../api/axios";
import {
  Building2, MapPin, Plus, X, Star, BedDouble,
  DollarSign, ChevronDown, ChevronUp, CheckCircle,
  AlertCircle, Pencil, Trash2, Save
} from "lucide-react";
import ImageUpload from "../../../components/ui/ImageUpload";

function MyHotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [facilityInput, setFacilityInput] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);
  const [expandedHotel, setExpandedHotel] = useState(null);
  const [hotelRooms, setHotelRooms] = useState({});

  // Room add state
  const [addingRoomFor, setAddingRoomFor] = useState(null);
  const [roomForm, setRoomForm] = useState({ roomType: "", roomCount: "", pricePerNight: "" });
  const [roomSuccess, setRoomSuccess] = useState("");
  const [roomError, setRoomError] = useState("");
  const [savingRoom, setSavingRoom] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState(null);

  // Edit hotel state
  const [editingHotel, setEditingHotel] = useState(null);  // holds hotel object being edited
  const [editForm, setEditForm] = useState({ name: "", location: "", description: "", facilities: [], images: [] });
  const [editFacilityInput, setEditFacilityInput] = useState("");
  const [editImagePreviews, setEditImagePreviews] = useState([]);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Delete hotel state
  const [deletingHotel, setDeletingHotel] = useState(null);

  const [form, setForm] = useState({
    name: "", location: "", description: "", facilities: [], images: [],
  });

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/hotels/my-hotels");
      setHotels(res.data || []);
    } catch {
      setHotels([]);
    } finally {
      setLoading(false);
    }
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
    if (expandedHotel === hotelId) {
      setExpandedHotel(null);
    } else {
      setExpandedHotel(hotelId);
      if (!hotelRooms[hotelId]) loadRooms(hotelId);
    }
    setAddingRoomFor(null);
    setRoomSuccess(""); setRoomError("");
  };

  // ─── Create hotel ───────────────────────────────────────────────────────────
  const addFacility = () => {
    const val = facilityInput.trim();
    if (val && !form.facilities.includes(val)) setForm((p) => ({ ...p, facilities: [...p.facilities, val] }));
    setFacilityInput("");
  };
  const removeFacility = (val) => setForm((p) => ({ ...p, facilities: p.facilities.filter((f) => f !== val) }));
  const addImageSlot = () => setImagePreviews((p) => [...p, null]);
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
    setError(""); setSuccess("");
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

  // ─── Edit hotel ─────────────────────────────────────────────────────────────
  const openEdit = async (hotel) => {
    setEditError(""); setEditSuccess("");
    try {
      const res = await api.get(`/api/hotels/${hotel.hotelId}`);
      const detail = res.data;
      setEditingHotel(hotel);
      setEditForm({
        name: detail.name,
        location: detail.location,
        description: detail.description,
        facilities: detail.facilities || [],
        images: [],
      });
      setEditImagePreviews([]);
      setEditFacilityInput("");
    } catch {
      setError("Failed to load hotel details");
    }
  };
  const addEditFacility = () => {
    const val = editFacilityInput.trim();
    if (val && !editForm.facilities.includes(val)) setEditForm((p) => ({ ...p, facilities: [...p.facilities, val] }));
    setEditFacilityInput("");
  };
  const removeEditFacility = (val) => setEditForm((p) => ({ ...p, facilities: p.facilities.filter((f) => f !== val) }));
  const addEditImageSlot = () => setEditImagePreviews((p) => [...p, null]);
  const handleEditImageChange = (index, base64) => {
    const updated = [...editImagePreviews];
    updated[index] = base64;
    setEditImagePreviews(updated);
    setEditForm((p) => ({ ...p, images: updated.filter(Boolean) }));
  };
  const removeEditImage = (index) => {
    const updated = editImagePreviews.filter((_, i) => i !== index);
    setEditImagePreviews(updated);
    setEditForm((p) => ({ ...p, images: updated.filter(Boolean) }));
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError(""); setEditSuccess("");
    if (editForm.facilities.length === 0) { setEditError("Add at least one facility"); return; }
    setEditSubmitting(true);
    try {
      await api.put(`/api/hotels/${editingHotel.hotelId}`, editForm);
      setEditSuccess("Hotel updated successfully!");
      fetchHotels();
      setTimeout(() => { setEditingHotel(null); setEditSuccess(""); }, 1200);
    } catch (err) {
      setEditError(err?.response?.data?.message || "Failed to update hotel");
    } finally {
      setEditSubmitting(false);
    }
  };

  // ─── Delete hotel ───────────────────────────────────────────────────────────
  const handleDeleteHotel = async (hotelId) => {
    if (!window.confirm("Delete this hotel? This action cannot be undone.")) return;
    setDeletingHotel(hotelId);
    try {
      await api.delete(`/api/hotels/${hotelId}`);
      fetchHotels();
      if (expandedHotel === hotelId) setExpandedHotel(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete hotel");
    } finally {
      setDeletingHotel(null);
    }
  };

  // ─── Add room ────────────────────────────────────────────────────────────────
  const handleAddRoom = async (hotelId) => {
    setRoomError(""); setRoomSuccess("");
    if (!roomForm.roomType.trim()) { setRoomError("Room type is required"); return; }
    if (!roomForm.roomCount || parseInt(roomForm.roomCount) < 1) { setRoomError("Room count must be at least 1"); return; }
    if (!roomForm.pricePerNight || parseFloat(roomForm.pricePerNight) <= 0) { setRoomError("Valid price is required"); return; }
    setSavingRoom(true);
    try {
      await api.post(`/api/hotels/${hotelId}/rooms`, {
        roomType: roomForm.roomType,
        roomCount: parseInt(roomForm.roomCount),
        pricePerNight: parseFloat(roomForm.pricePerNight),
      });
      setRoomSuccess("Room added successfully!");
      setRoomForm({ roomType: "", roomCount: "", pricePerNight: "" });
      setAddingRoomFor(null);
      loadRooms(hotelId);
      fetchHotels();
    } catch (err) {
      setRoomError(err?.response?.data?.message || "Failed to add room");
    } finally {
      setSavingRoom(false);
    }
  };

  // ─── Delete room ─────────────────────────────────────────────────────────────
  const handleDeleteRoom = async (hotelId, roomId) => {
    if (!window.confirm("Delete this room?")) return;
    setDeletingRoom(roomId);
    setRoomError("");
    try {
      await api.delete(`/api/hotels/${hotelId}/rooms/${roomId}`);
      setRoomSuccess("Room deleted successfully!");
      loadRooms(hotelId);
      fetchHotels();
    } catch (err) {
      setRoomError(err?.response?.data?.message || "Failed to delete room");
    } finally {
      setDeletingRoom(null);
    }
  };

  return (
    <div>
      {/* Edit Hotel Modal */}
      {editingHotel && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Edit Hotel</h2>
              <button onClick={() => setEditingHotel(null)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <CheckCircle size={15} /> {editSuccess}
                </div>
              )}
              {editError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle size={15} /> {editError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Hotel Name *</label>
                  <input value={editForm.name}
                    onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                    required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input value={editForm.location}
                      onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))}
                      required className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm outline-none focus:border-blue-400 transition" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
                <textarea value={editForm.description}
                  onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                  required rows={3}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Facilities *</label>
                <div className="flex gap-2 mb-2">
                  <input value={editFacilityInput}
                    onChange={(e) => setEditFacilityInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEditFacility())}
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"
                    placeholder="Add facility — press Enter" />
                  <button type="button" onClick={addEditFacility}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-xl transition">
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editForm.facilities.map((f) => (
                    <span key={f} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-medium">
                      {f}
                      <button type="button" onClick={() => removeEditFacility(f)}><X size={11} /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Replace Photos <span className="text-slate-400 font-normal">(optional — leave empty to keep existing)</span>
                  </label>
                  <button type="button" onClick={addEditImageSlot}
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-500 text-xs font-semibold transition">
                    <Plus size={14} /> Add Photo
                  </button>
                </div>
                <div className="space-y-3">
                  {editImagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <ImageUpload
                        label={`Photo ${index + 1}`}
                        preview={preview}
                        onChange={(base64) => handleEditImageChange(index, base64)}
                        onClear={() => removeEditImage(index)}
                        setError={setEditError}
                        maxMB={2}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={editSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition">
                  <Save size={15} /> {editSubmitting ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={() => setEditingHotel(null)}
                  className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold text-sm transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Hotels</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your hotel listings and rooms</p>
        </div>
        <button
          onClick={() => { setShowForm((p) => !p); resetForm(); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-md shadow-blue-200"
        >
          <Plus size={16} />
          {showForm ? "Cancel" : "Add Hotel"}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={15} /> {error}
          <button onClick={() => setError("")} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Create Hotel Form */}
      {showForm && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5">New Hotel Listing</h2>
          {success && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle size={15} /> {success}
            </div>
          )}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={15} /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Hotel Name *</label>
                <input name="name" value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"
                  placeholder="e.g. Ocean View Resort" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input name="location" value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    required className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"
                    placeholder="e.g. Galle, Sri Lanka" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
              <textarea name="description" value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                required rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition resize-none"
                placeholder="Describe your hotel..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Facilities *</label>
              <div className="flex gap-2 mb-2">
                <input value={facilityInput}
                  onChange={(e) => setFacilityInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFacility())}
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"
                  placeholder="e.g. WiFi, Pool — press Enter" />
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
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Hotel Photos * ({imagePreviews.filter(Boolean).length} selected)
                </label>
                <button type="button" onClick={addImageSlot}
                  className="flex items-center gap-1.5 text-blue-600 hover:text-blue-500 text-xs font-semibold transition">
                  <Plus size={14} /> Add Photo
                </button>
              </div>
              {imagePreviews.length === 0 ? (
                <div onClick={addImageSlot}
                  className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                  <p className="text-slate-600 font-medium text-sm">Click to add hotel photos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <ImageUpload label={`Photo ${index + 1}`} preview={preview}
                        onChange={(base64) => handleImageChange(index, base64)}
                        onClear={() => removeImage(index)}
                        setError={setError} maxMB={2} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition shadow-lg shadow-blue-200">
              {submitting ? "Creating..." : "Create Hotel Listing"}
            </button>
          </form>
        </div>
      )}

      {/* Hotel List */}
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
        <div className="space-y-4">
          {hotels.map((hotel) => (
            <div key={hotel.hotelId} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Hotel summary row */}
              <div className="flex items-center gap-4 p-5">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-100 flex-shrink-0 flex items-center justify-center">
                  {hotel.thumbnailImage
                    ? <img src={hotel.thumbnailImage} alt={hotel.name} className="w-full h-full object-cover" />
                    : <Building2 size={28} className="text-purple-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800">{hotel.name}</h3>
                  <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                    <MapPin size={11} /> {hotel.location}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                      <Star size={11} fill="currentColor" /> {hotel.rating?.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-emerald-600 text-xs font-bold">
                      From LKR{parseFloat(hotel.minPrice || 0).toFixed(0)}/night
                    </span>
                  </div>
                </div>
                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(hotel)}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 px-3 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteHotel(hotel.hotelId)}
                    disabled={deletingHotel === hotel.hotelId}
                    className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-60"
                  >
                    <Trash2 size={13} />
                    {deletingHotel === hotel.hotelId ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    onClick={() => toggleExpand(hotel.hotelId)}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    {expandedHotel === hotel.hotelId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    Rooms
                  </button>
                </div>
              </div>

              {/* Expanded room section */}
              {expandedHotel === hotel.hotelId && (
                <div className="border-t border-slate-100 p-5 bg-slate-50">
                  {roomSuccess && (
                    <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                      <CheckCircle size={14} /> {roomSuccess}
                    </div>
                  )}
                  {roomError && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                      <AlertCircle size={14} /> {roomError}
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-700 text-sm">Rooms</h4>
                    <button
                      onClick={() => {
                        setAddingRoomFor(addingRoomFor === hotel.hotelId ? null : hotel.hotelId);
                        setRoomForm({ roomType: "", roomCount: "", pricePerNight: "" });
                        setRoomError(""); setRoomSuccess("");
                      }}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                    >
                      <Plus size={13} /> Add Room
                    </button>
                  </div>

                  {/* Add room form */}
                  {addingRoomFor === hotel.hotelId && (
                    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
                      <h5 className="font-semibold text-slate-700 text-sm mb-3">New Room Type</h5>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Room Type *</label>
                          <input value={roomForm.roomType}
                            onChange={(e) => setRoomForm((p) => ({ ...p, roomType: e.target.value }))}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition"
                            placeholder="e.g. Deluxe" />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Room Count *</label>
                          <input type="number" min="1" value={roomForm.roomCount}
                            onChange={(e) => setRoomForm((p) => ({ ...p, roomCount: e.target.value }))}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition"
                            placeholder="e.g. 10" />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Price / Night *</label>
                          <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">LKR</span>
  <input type="number" min="0.01" step="0.01" value={roomForm.pricePerNight}
    onChange={(e) => setRoomForm((p) => ({ ...p, pricePerNight: e.target.value }))}
    className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-sm outline-none focus:border-blue-400 transition"
    placeholder="e.g. 15000" />
</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleAddRoom(hotel.hotelId)} disabled={savingRoom}
                          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
                          {savingRoom ? "Adding..." : "Add Room"}
                        </button>
                        <button onClick={() => { setAddingRoomFor(null); setRoomError(""); }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold transition">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Room list */}
                  {(hotelRooms[hotel.hotelId] || []).length === 0 ? (
                    <div className="text-center py-6">
                      <BedDouble size={32} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-slate-400 text-sm">No rooms yet. Click "Add Room" to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(hotelRooms[hotel.hotelId] || []).map((room) => (
                        <div key={room.roomId} className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <BedDouble size={16} className="text-purple-500" />
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">{room.roomType}</p>
                              <p className="text-slate-400 text-xs">{room.availableCount}/{room.roomCount} available</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-emerald-600 font-bold text-sm">LKR{parseFloat(room.pricePerNight).toFixed(0)}/night</span>
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${room.available ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                              {room.available ? "Available" : "Full"}
                            </span>
                            <button
                              onClick={() => handleDeleteRoom(hotel.hotelId, room.roomId)}
                              disabled={deletingRoom === room.roomId}
                              className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-60"
                            >
                              <Trash2 size={12} />
                              {deletingRoom === room.roomId ? "..." : "Delete"}
                            </button>
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
  );
}

export default MyHotelsPage;
