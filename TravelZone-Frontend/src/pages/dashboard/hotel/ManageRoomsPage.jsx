import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { BedDouble, Save, AlertCircle, CheckCircle, Building2 } from "lucide-react";

function ManageRoomsPage() {
  const [hotels, setHotels]               = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [rooms, setRooms]                 = useState([]);
  const [editingRoom, setEditingRoom]     = useState(null);
  const [saving, setSaving]               = useState(false);
  const [success, setSuccess]             = useState("");
  const [error, setError]                 = useState("");

  useEffect(() => {
    api.get("/api/hotels/my-hotels")
      .then((res) => setHotels(res.data || []))
      .catch(() => setHotels([]));
  }, []);

  const loadRooms = async (hotelId) => {
    const hotel = hotels.find((h) => h.hotelId === hotelId);
    setSelectedHotel(hotel); setEditingRoom(null); setSuccess(""); setError("");
    try {
      const res = await api.get(`/api/hotels/${hotelId}`);
      setRooms(res.data.rooms || []);
    } catch { setRooms([]); }
  };

  const saveRoom = async () => {
    setError(""); setSuccess(""); setSaving(true);
    try {
      await api.put(`/api/rooms/${editingRoom.roomId}/availability`, {
        available:      editingRoom.available,
        roomCount:      parseInt(editingRoom.roomCount),
        availableCount: parseInt(editingRoom.availableCount),
        pricePerNight:  parseFloat(editingRoom.pricePerNight),
      });
      setSuccess(`Room "${editingRoom.roomType}" updated successfully!`);
      setEditingRoom(null);
      loadRooms(selectedHotel.hotelId);
    } catch (err) {
      setError(err?.response?.data?.message || "Update failed");
    } finally { setSaving(false); }
  };

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
        :root .tz-input::placeholder,
        [data-theme="light"] .tz-input::placeholder {
          color: #94a3b8;
          opacity: 1;
        }
        [data-theme="dark"] .tz-input::placeholder {
          color: #475569;
          opacity: 1;
        }
        .tz-input.pl-9  { padding-left: 2.25rem; }
        .tz-input.pl-10 { padding-left: 2.5rem; }
        .tz-input.pl-11 { padding-left: 2.75rem; }
        .tz-input.appearance-none { -webkit-appearance: none; appearance: none; }
        .tz-input:disabled {
          cursor: not-allowed;
        }
      `}</style>

      <div>
        {/* ── Header ── */}
        <h1 className="text-2xl font-black text-[var(--tz-text)] mb-1">Manage Rooms</h1>
        <p className="text-[var(--tz-text-muted)] text-sm mb-6">
          Update room availability and pricing
        </p>

        {/* ── Hotel selector ── */}
        <div
          className="rounded-2xl border p-5 mb-6"
          style={{
            background:  "var(--tz-card-bg)",
            borderColor: "var(--tz-card-border)",
            boxShadow:   "0 3px 0px rgba(0,0,0,0.08), 0 6px 18px rgba(0,0,0,0.07)",
          }}
        >
          <label className="block text-sm font-semibold text-[var(--tz-text)] mb-2">
            Select Your Hotel
          </label>
          <div className="relative">
            <Building2
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              size={16}
              style={{ color: "var(--tz-text-faint)" }}
            />
            <select
              defaultValue=""
              onChange={(e) => e.target.value && loadRooms(parseInt(e.target.value))}
              className="tz-input pl-9 appearance-none"
            >
              <option value="" disabled>— Choose a hotel —</option>
              {hotels.map((h) => (
                <option key={h.hotelId} value={h.hotelId}>
                  {h.name} — {h.location}
                </option>
              ))}
            </select>
          </div>
          {hotels.length === 0 && (
            <p className="text-[var(--tz-text-faint)] text-xs mt-2">
              No hotels found. Create a hotel in "My Hotels" first.
            </p>
          )}
        </div>

        {/* ── Alerts ── */}
        {success && (
          <div
            className="mb-4 rounded-xl px-4 py-3 text-sm flex items-center gap-2 font-medium"
            style={{
              background: "rgba(16,185,129,0.08)",
              color:      "#10b981",
              border:     "1px solid rgba(16,185,129,0.2)",
              boxShadow:  "0 2px 0px rgba(16,185,129,0.1)",
            }}
          >
            <CheckCircle size={15} /> {success}
          </div>
        )}
        {error && (
          <div
            className="mb-4 rounded-xl px-4 py-3 text-sm flex items-center gap-2 font-medium"
            style={{
              background: "rgba(239,68,68,0.08)",
              color:      "#ef4444",
              border:     "1px solid rgba(239,68,68,0.2)",
              boxShadow:  "0 2px 0px rgba(239,68,68,0.1)",
            }}
          >
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* ── Empty state ── */}
        {rooms.length === 0 && selectedHotel && (
          <div
            className="rounded-3xl border p-16 text-center"
            style={{
              background:  "var(--tz-card-bg)",
              borderColor: "var(--tz-card-border)",
              boxShadow:   "0 3px 0px rgba(0,0,0,0.06)",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-200 flex items-center justify-center mx-auto mb-4 icon-3d"
              style={{ boxShadow: "0 3px 0px rgba(109,40,217,0.15)" }}
            >
              <BedDouble size={28} className="text-violet-400" />
            </div>
            <p className="text-[var(--tz-text)] font-bold">
              No rooms found for {selectedHotel.name}
            </p>
            <p className="text-[var(--tz-text-muted)] text-sm mt-1">
              Add rooms from the "My Hotels" page
            </p>
          </div>
        )}

        {/* ── Room cards ── */}
        <div className="space-y-4">
          {rooms.map((room) => {
            const editing = editingRoom?.roomId === room.roomId;
            const data    = editing ? editingRoom : room;

            return (
              <div
                key={room.roomId}
                className="rounded-2xl border p-5 transition-all duration-200"
                style={{
                  background:  "var(--tz-card-bg)",
                  borderColor: editing ? "rgba(59,130,246,0.4)" : "var(--tz-card-border)",
                  boxShadow:   editing
                    ? "0 4px 0px rgba(59,130,246,0.15), 0 8px 24px rgba(59,130,246,0.1)"
                    : "0 3px 0px rgba(0,0,0,0.08), 0 6px 18px rgba(0,0,0,0.07)",
                }}
              >
                {/* Card header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center icon-3d flex-shrink-0"
                      style={{
                        boxShadow: "0 3px 0px #5b21b6, 0 6px 14px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
                      }}
                    >
                      <BedDouble size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-[var(--tz-text)]">{room.roomType}</p>
                      <p className="text-[var(--tz-text-faint)] text-xs">Room ID: {room.roomId}</p>
                    </div>
                  </div>

                  <span
                    className="px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{
                      background: room.available ? "rgba(16,185,129,0.1)"  : "rgba(239,68,68,0.1)",
                      color:      room.available ? "#10b981"               : "#ef4444",
                      border:     room.available
                        ? "1px solid rgba(16,185,129,0.25)"
                        : "1px solid rgba(239,68,68,0.25)",
                      boxShadow: room.available
                        ? "0 2px 0px rgba(16,185,129,0.12)"
                        : "0 2px 0px rgba(239,68,68,0.12)",
                    }}
                  >
                    {room.available ? "Available" : "Unavailable"}
                  </span>
                </div>

                {/* Fields grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {/* Room Count */}
                  <div>
                    <label
                      className="block text-xs font-medium mb-1"
                      style={{ color: "var(--tz-text-muted)" }}
                    >
                      Room Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={data.roomCount}
                      disabled={!editing}
                      onChange={(e) => setEditingRoom((p) => ({ ...p, roomCount: e.target.value }))}
                      className="tz-input"
                      style={{
                        background:  editing ? "var(--tz-input-bg)" : "var(--tz-surface-2)",
                        borderColor: editing ? "#3b82f6" : "var(--tz-border-soft)",
                        color:       editing ? "var(--tz-text)" : "var(--tz-text-faint)",
                        boxShadow:   editing
                          ? "inset 0 2px 6px rgba(0,0,0,0.12), 0 0 0 3px rgba(59,130,246,0.12)"
                          : "inset 0 2px 4px rgba(0,0,0,0.06)",
                      }}
                    />
                  </div>

                  {/* Available Count */}
                  <div>
                    <label
                      className="block text-xs font-medium mb-1"
                      style={{ color: "var(--tz-text-muted)" }}
                    >
                      Available Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={data.availableCount}
                      disabled={!editing}
                      onChange={(e) => setEditingRoom((p) => ({ ...p, availableCount: e.target.value }))}
                      className="tz-input"
                      style={{
                        background:  editing ? "var(--tz-input-bg)" : "var(--tz-surface-2)",
                        borderColor: editing ? "#3b82f6" : "var(--tz-border-soft)",
                        color:       editing ? "var(--tz-text)" : "var(--tz-text-faint)",
                        boxShadow:   editing
                          ? "inset 0 2px 6px rgba(0,0,0,0.12), 0 0 0 3px rgba(59,130,246,0.12)"
                          : "inset 0 2px 4px rgba(0,0,0,0.06)",
                      }}
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label
                      className="block text-xs font-medium mb-1"
                      style={{ color: "var(--tz-text-muted)" }}
                    >
                      Price / Night
                    </label>
                    <div className="relative">
                      <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold pointer-events-none select-none"
                        style={{ color: editing ? "var(--tz-text-muted)" : "var(--tz-text-faint)" }}
                      >
                        LKR
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.pricePerNight}
                        disabled={!editing}
                        onChange={(e) => setEditingRoom((p) => ({ ...p, pricePerNight: e.target.value }))}
                        className="tz-input pl-11"
                        style={{
                          background:  editing ? "var(--tz-input-bg)" : "var(--tz-surface-2)",
                          borderColor: editing ? "#3b82f6" : "var(--tz-border-soft)",
                          color:       editing ? "var(--tz-text)" : "var(--tz-text-faint)",
                          boxShadow:   editing
                            ? "inset 0 2px 6px rgba(0,0,0,0.12), 0 0 0 3px rgba(59,130,246,0.12)"
                            : "inset 0 2px 4px rgba(0,0,0,0.06)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Available toggle */}
                  <div>
                    <label
                      className="block text-xs font-medium mb-1"
                      style={{ color: "var(--tz-text-muted)" }}
                    >
                      Available
                    </label>
                    <select
                      value={String(data.available)}
                      disabled={!editing}
                      onChange={(e) => setEditingRoom((p) => ({ ...p, available: e.target.value === "true" }))}
                      className="tz-input appearance-none"
                      style={{
                        background:  editing ? "var(--tz-input-bg)" : "var(--tz-surface-2)",
                        borderColor: editing ? "#3b82f6" : "var(--tz-border-soft)",
                        color:       editing ? "var(--tz-text)" : "var(--tz-text-faint)",
                        boxShadow:   editing
                          ? "inset 0 2px 6px rgba(0,0,0,0.12), 0 0 0 3px rgba(59,130,246,0.12)"
                          : "inset 0 2px 4px rgba(0,0,0,0.06)",
                      }}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>

                {/* Price badge row (view mode) */}
                {!editing && (
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{
                        background: "rgba(16,185,129,0.1)",
                        color:      "#10b981",
                        border:     "1px solid rgba(16,185,129,0.2)",
                        boxShadow:  "0 2px 0px rgba(16,185,129,0.1)",
                      }}
                    >
                      LKR {parseFloat(room.pricePerNight).toLocaleString("en-LK", {
                        minimumFractionDigits: 2,
                      })} / night
                    </span>
                    <span className="text-[var(--tz-text-faint)] text-xs">
                      {room.availableCount}/{room.roomCount} rooms available
                    </span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 flex-wrap">
                  {!editing ? (
                    <button
                      onClick={() => setEditingRoom({ ...room })}
                      className="btn-3d-slate"
                      style={{ padding: "0.5rem 1.25rem" }}
                    >
                      <span className="text-xs font-bold">Edit Room</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={saveRoom}
                        disabled={saving}
                        className="btn-3d-blue"
                        style={{ padding: "0.5rem 1.25rem", opacity: saving ? 0.6 : 1 }}
                      >
                        <Save size={14} />
                        <span className="text-xs font-bold">
                          {saving ? "Saving..." : "Save Changes"}
                        </span>
                      </button>
                      <button
                        onClick={() => setEditingRoom(null)}
                        className="btn-3d-slate"
                        style={{ padding: "0.5rem 1rem" }}
                      >
                        <span className="text-xs font-bold">Cancel</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default ManageRoomsPage;