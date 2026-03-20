import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { ArrowLeft, MapPin, Star, Wifi, BedDouble } from "lucide-react";

function HotelDetailPage() {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/api/hotels/${hotelId}`)
      .then((res) => setHotel(res.data))
      .catch(() => navigate("/dashboard/hotels"))
      .finally(() => setLoading(false));
  }, [hotelId]);

  const nights = checkIn && checkOut
    ? Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 0;

  const totalPrice = selectedRoom && nights > 0
    ? (parseFloat(selectedRoom.pricePerNight) * nights).toFixed(2)
    : null;

  const handleReserve = async () => {
    if (!selectedRoom) { setError("Select a room"); return; }
    if (!checkIn || !checkOut) { setError("Select check-in and check-out dates"); return; }
    if (nights <= 0) { setError("Check-out must be after check-in"); return; }
    setError(""); setBooking(true);
    try {
      await api.post("/api/reservations", {
        hotelId: parseInt(hotelId),
        roomId: selectedRoom.roomId,
        checkIn,
        checkOut,
      });
      setSuccess(`Reservation confirmed for ${nights} night(s) — Total: $${totalPrice}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Reservation failed");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate("/dashboard/hotels")}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-5 text-sm font-medium transition">
        <ArrowLeft size={16} /> Back to Hotels
      </button>

      {hotel.images?.length > 0 && (
        <div className="rounded-3xl overflow-hidden h-56 mb-6 bg-gradient-to-br from-purple-100 to-indigo-100">
          <img src={hotel.images[0].imageUrl} alt={hotel.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-5">
        <h1 className="text-2xl font-bold text-slate-800">{hotel.name}</h1>
        <p className="flex items-center gap-1 text-slate-400 text-sm mt-1">
          <MapPin size={14} /> {hotel.location}
        </p>
        <p className="flex items-center gap-1 text-amber-500 text-sm mt-1 font-semibold">
          <Star size={14} fill="currentColor" /> {hotel.rating?.toFixed(1) || "0.0"}
        </p>
        <p className="text-slate-600 text-sm mt-3">{hotel.description}</p>
        {hotel.facilities?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {hotel.facilities.map((f) => (
              <span key={f} className="flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 text-xs px-3 py-1 rounded-full">
                <Wifi size={11} /> {f}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Rooms + Booking */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BedDouble size={18} className="text-purple-500" /> Select a Room
        </h3>
        {hotel.rooms?.length > 0 ? (
          <div className="space-y-3 mb-5">
            {hotel.rooms.map((room) => (
              <div
                key={room.roomId}
                onClick={() => room.available && setSelectedRoom(room)}
                className={`flex items-center justify-between p-4 rounded-xl border transition cursor-pointer ${
                  selectedRoom?.roomId === room.roomId
                    ? "border-blue-400 bg-blue-50"
                    : room.available
                    ? "border-slate-200 hover:border-blue-300"
                    : "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                }`}
              >
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{room.roomType}</p>
                  <p className="text-slate-400 text-xs">{room.availableCount} of {room.roomCount} available</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-600 font-bold text-sm">${parseFloat(room.pricePerNight).toFixed(0)}/night</p>
                  <span className={`text-xs font-semibold ${room.available ? "text-emerald-500" : "text-red-400"}`}>
                    {room.available ? "Available" : "Full"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm mb-5">No rooms listed.</p>
        )}

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-4 rounded-xl text-sm font-medium">
            ✅ {success}
          </div>
        ) : (
          <>
            {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Check-In</label>
                <input type="date" value={checkIn} min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Check-Out</label>
                <input type="date" value={checkOut} min={checkIn || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition" />
              </div>
            </div>
            {totalPrice && (
              <div className="flex justify-between bg-blue-50 rounded-xl px-4 py-3 mb-4">
                <span className="text-slate-600 text-sm">{nights} night(s)</span>
                <span className="text-blue-700 font-bold text-lg">${totalPrice}</span>
              </div>
            )}
            <button onClick={handleReserve} disabled={booking}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition shadow-lg shadow-blue-200">
              {booking ? "Reserving..." : "Make Reservation"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default HotelDetailPage;
