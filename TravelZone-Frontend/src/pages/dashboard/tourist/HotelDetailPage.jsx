import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import {
  ArrowLeft, MapPin, Star, Wifi, BedDouble,
  ChevronLeft, ChevronRight, X, Maximize2
} from "lucide-react";

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

  // Carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    api.get(`/api/hotels/${hotelId}`)
      .then((res) => {
        setHotel(res.data);
        setCurrentImageIndex(0);
      })
      .catch(() => navigate("/dashboard/hotels"))
      .finally(() => setLoading(false));
  }, [hotelId]);

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback(
    (e) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight")
        setLightboxIndex((i) => (i === (hotel?.images?.length ?? 1) - 1 ? 0 : i + 1));
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) => (i === 0 ? (hotel?.images?.length ?? 1) - 1 : i - 1));
    },
    [lightboxOpen, hotel]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent background scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  // Open lightbox at a specific index
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
      : 0;

  const totalPrice =
    selectedRoom && nights > 0
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
      setSuccess(`Reservation confirmed for ${nights} night(s) — Total: LKR ${totalPrice}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Reservation failed");
    } finally {
      setBooking(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  const images = hotel.images || [];
  const hasMultiple = images.length > 1;

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };
  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  const prevLightbox = (e) => {
    e.stopPropagation();
    setLightboxIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };
  const nextLightbox = (e) => {
    e.stopPropagation();
    setLightboxIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  return (
    <>
      {/* ── Lightbox Overlay ──────────────────────────────────────────────── */}
      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition z-10"
            aria-label="Close fullscreen"
          >
            <X size={20} />
          </button>

          {/* Counter badge */}
          {hasMultiple && (
            <span className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm font-semibold px-3 py-1 rounded-full">
              {lightboxIndex + 1} / {images.length}
            </span>
          )}

          {/* Prev arrow */}
          {hasMultiple && (
            <button
              onClick={prevLightbox}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition z-10"
              aria-label="Previous photo"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Main fullscreen image */}
          <img
            src={images[lightboxIndex].imageUrl}
            alt={`${hotel.name} — photo ${lightboxIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl select-none"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />

          {/* Next arrow */}
          {hasMultiple && (
            <button
              onClick={nextLightbox}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition z-10"
              aria-label="Next photo"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Thumbnail strip in lightbox */}
          {hasMultiple && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[80vw] px-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                  className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition ${
                    idx === lightboxIndex
                      ? "border-white scale-110"
                      : "border-white/30 opacity-50 hover:opacity-90"
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Keyboard hint */}
          <p className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white/30 text-xs select-none pointer-events-none">
            ← → to navigate · Esc to close
          </p>
        </div>
      )}

      {/* ── Page content ────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/dashboard/hotels")}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-5 text-sm font-medium transition"
        >
          <ArrowLeft size={16} /> Back to Hotels
        </button>

        {/* ── Image Gallery ──────────────────────────────────────────────── */}
        {images.length > 0 && (
          <div
            className="relative rounded-3xl overflow-hidden h-64 mb-6 bg-gradient-to-br from-purple-100 to-indigo-100 group cursor-zoom-in"
            onClick={() => openLightbox(currentImageIndex)}
          >
            {/* Main image */}
            <img
              src={images[currentImageIndex].imageUrl}
              alt={`${hotel.name} — photo ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
            />

            {/* Fullscreen hint overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Maximize2 size={13} /> Click to view fullscreen
              </div>
            </div>

            {/* Prev / Next */}
            {hasMultiple && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label="Next photo"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Dot indicators */}
            {hasMultiple && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex
                        ? "bg-white scale-125"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`Go to photo ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Photo counter badge */}
            {hasMultiple && (
              <span className="absolute top-3 right-3 bg-black/40 text-white text-xs font-semibold px-2.5 py-1 rounded-full z-10">
                {currentImageIndex + 1} / {images.length}
              </span>
            )}
          </div>
        )}

        {/* ── Thumbnail strip ─────────────────────────────────────────────── */}
        {images.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentImageIndex(idx);
                  openLightbox(idx);
                }}
                className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition cursor-zoom-in ${
                  idx === currentImageIndex
                    ? "border-blue-500 scale-105"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img.imageUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* ── Hotel Info ─────────────────────────────────────────────────── */}
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
                <span
                  key={f}
                  className="flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 text-xs px-3 py-1 rounded-full"
                >
                  <Wifi size={11} /> {f}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Rooms + Booking ────────────────────────────────────────────── */}
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
                    <p className="text-slate-400 text-xs">
                      {room.availableCount} of {room.roomCount} available
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-600 font-bold text-sm">
                      LKR {parseFloat(room.pricePerNight).toLocaleString()}/night
                    </p>
                    <span
                      className={`text-xs font-semibold ${
                        room.available ? "text-emerald-500" : "text-red-400"
                      }`}
                    >
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
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Check-In</label>
                  <input
                    type="date"
                    value={checkIn}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Check-Out</label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition"
                  />
                </div>
              </div>
              {totalPrice && (
                <div className="flex justify-between bg-blue-50 rounded-xl px-4 py-3 mb-4">
                  <span className="text-slate-600 text-sm">{nights} night(s)</span>
                  <span className="text-blue-700 font-bold text-lg">
                    LKR {parseFloat(totalPrice).toLocaleString()}
                  </span>
                </div>
              )}
              <button
                onClick={handleReserve}
                disabled={booking}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition shadow-lg shadow-blue-200"
              >
                {booking ? "Reserving..." : "Make Reservation"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default HotelDetailPage;