import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { BedDouble, DollarSign, Save, AlertCircle, CheckCircle } from "lucide-react";

function ManageRoomsPage() {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ✅ Fixed: load ONLY owner's hotels, not all hotels
  useEffect(() => {
    api.get("/api/hotels/my-hotels")
      .then((res) => setHotels(res.data || []))
      .catch(() => setHotels([]));
  }, []);

  const loadRooms = async (hotelId) => {
    const hotel = hotels.find((h) => h.hotelId === hotelId);
    setSelectedHotel(hotel);
    setEditingRoom(null);
    setSuccess(""); setError("");
    try {
      const res = await api.get(`/api/hotels/${hotelId}`);
      setRooms(res.data.rooms || []);
    } catch {
      setRooms([]);
    }
  };

  const saveRoom = async () => {
    setError(""); setSuccess(""); setSaving(true);
    try {
      await api.put(`/api/rooms/${editingRoom.roomId}/availability`, {
        available: editingRoom.available,
        roomCount: parseInt(editingRoom.roomCount),
        availableCount: parseInt(editingRoom.availableCount),
        pricePerNight: parseFloat(editingRoom.pricePerNight),
      });
      setSuccess(`Room "${editingRoom.roomType}" updated successfully!`);
      setEditingRoom(null);
      loadRooms(selectedHotel.hotelId);
    } catch (err) {
      setError(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Manage Rooms</h1>
      <p className="text-slate-500 text-sm mb-6">Update room availability and pricing</p>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Select Your Hotel</label>
        <select
          defaultValue=""
          onChange={(e) => e.target.value && loadRooms(parseInt(e.target.value))}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"
        >
          <option value="" disabled>-- Choose a hotel --</option>
          {hotels.map((h) => (
            <option key={h.hotelId} value={h.hotelId}>{h.name} — {h.location}</option>
          ))}
        </select>
        {hotels.length === 0 && (
          <p className="text-slate-400 text-xs mt-2">No hotels found. Create a hotel in "My Hotels" first.</p>
        )}
      </div>

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

      {rooms.length === 0 && selectedHotel && (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
          <BedDouble size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-semibold">No rooms found for {selectedHotel.name}</p>
          <p className="text-slate-400 text-sm mt-1">Add rooms from the "My Hotels" page</p>
        </div>
      )}

      <div className="space-y-4">
        {rooms.map((room) => {
          const editing = editingRoom?.roomId === room.roomId;
          const data = editing ? editingRoom : room;

          return (
            <div key={room.roomId} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <BedDouble size={18} className="text-purple-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{room.roomType}</p>
                    <p className="text-slate-400 text-xs">Room ID: {room.roomId}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${room.available ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                  {room.available ? "Available" : "Unavailable"}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Room Count</label>
                  <input type="number" min="0"
                    value={data.roomCount}
                    disabled={!editing}
                    onChange={(e) => setEditingRoom((p) => ({ ...p, roomCount: e.target.value }))}
                    className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition ${editing ? "border-blue-400 focus:ring-2 focus:ring-blue-100" : "border-slate-200 bg-slate-50 text-slate-400"}`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Available Count</label>
                  <input type="number" min="0"
                    value={data.availableCount}
                    disabled={!editing}
                    onChange={(e) => setEditingRoom((p) => ({ ...p, availableCount: e.target.value }))}
                    className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition ${editing ? "border-blue-400 focus:ring-2 focus:ring-blue-100" : "border-slate-200 bg-slate-50 text-slate-400"}`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Price / Night</label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <input type="number" min="0" step="0.01"
                      value={data.pricePerNight}
                      disabled={!editing}
                      onChange={(e) => setEditingRoom((p) => ({ ...p, pricePerNight: e.target.value }))}
                      className={`w-full border rounded-xl pl-7 pr-3 py-2 text-sm outline-none transition ${editing ? "border-blue-400 focus:ring-2 focus:ring-blue-100" : "border-slate-200 bg-slate-50 text-slate-400"}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Available</label>
                  <select
                    value={String(data.available)}
                    disabled={!editing}
                    onChange={(e) => setEditingRoom((p) => ({ ...p, available: e.target.value === "true" }))}
                    className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition ${editing ? "border-blue-400 focus:ring-2 focus:ring-blue-100" : "border-slate-200 bg-slate-50 text-slate-400"}`}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                {!editing ? (
                  <button onClick={() => setEditingRoom({ ...room })}
                    className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-4 py-2 rounded-xl text-sm font-semibold transition">
                    Edit Room
                  </button>
                ) : (
                  <>
                    <button onClick={saveRoom} disabled={saving}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-md disabled:opacity-60">
                      <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button onClick={() => setEditingRoom(null)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold transition">
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ManageRoomsPage;
