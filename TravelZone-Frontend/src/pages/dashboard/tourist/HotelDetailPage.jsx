import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import {
  ArrowLeft, MapPin, Star, Wifi, BedDouble,
  ChevronLeft, ChevronRight, X, Maximize2, CheckCircle
} from "lucide-react";

function HotelDetailPage() {
  const { hotelId } = useParams();
  const navigate    = useNavigate();
  const [hotel, setHotel]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkIn, setCheckIn]           = useState("");
  const [checkOut, setCheckOut]         = useState("");
  const [booking, setBooking]           = useState(false);
  const [success, setSuccess]           = useState("");
  const [error, setError]               = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen]           = useState(false);
  const [lightboxIndex, setLightboxIndex]         = useState(0);

  useEffect(() => {
    api.get(`/api/hotels/${hotelId}`)
      .then((res) => { setHotel(res.data); setCurrentImageIndex(0); })
      .catch(() => navigate("/dashboard/hotels"))
      .finally(() => setLoading(false));
  }, [hotelId]);

  const handleKeyDown = useCallback((e) => {
    if (!lightboxOpen) return;
    if (e.key === "Escape")      setLightboxOpen(false);
    if (e.key === "ArrowRight")  setLightboxIndex((i) => (i === (hotel?.images?.length ?? 1) - 1 ? 0 : i + 1));
    if (e.key === "ArrowLeft")   setLightboxIndex((i) => (i === 0 ? (hotel?.images?.length ?? 1) - 1 : i - 1));
  }, [lightboxOpen, hotel]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  const openLightbox = (index) => { setLightboxIndex(index); setLightboxOpen(true); };

  const nights = checkIn && checkOut
    ? Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 0;

  const totalPrice = selectedRoom && nights > 0
    ? (parseFloat(selectedRoom.pricePerNight) * nights).toFixed(2)
    : null;

  const handleReserve = async () => {
    if (!selectedRoom)           { setError("Select a room"); return; }
    if (!checkIn || !checkOut)   { setError("Select check-in and check-out dates"); return; }
    if (nights <= 0)             { setError("Check-out must be after check-in"); return; }
    setError(""); setBooking(true);
    try {
      await api.post("/api/reservations", {
        hotelId: parseInt(hotelId),
        roomId: selectedRoom.roomId,
        checkIn, checkOut,
      });
      setSuccess(`Reservation confirmed for ${nights} night(s) — Total: LKR ${parseFloat(totalPrice).toLocaleString()}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Reservation failed");
    } finally { setBooking(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const images      = hotel.images || [];
  const hasMultiple = images.length > 1;

  const prevImage = (e) => { e.stopPropagation(); setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1)); };
  const nextImage = (e) => { e.stopPropagation(); setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1)); };
  const prevLightbox = (e) => { e.stopPropagation(); setLightboxIndex((i) => (i === 0 ? images.length - 1 : i - 1)); };
  const nextLightbox = (e) => { e.stopPropagation(); setLightboxIndex((i) => (i === images.length - 1 ? 0 : i + 1)); };

  return (
    <>
      {/* ── Lightbox ── */}
      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition z-10"
          >
            <X size={20} />
          </button>

          {hasMultiple && (
            <span className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm font-semibold px-3 py-1 rounded-full">
              {lightboxIndex + 1} / {images.length}
            </span>
          )}
          {hasMultiple && (
            <button onClick={prevLightbox}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition z-10"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <img
            src={images[lightboxIndex].imageUrl}
            alt={`${hotel.name} — photo ${lightboxIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl select-none"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />

          {hasMultiple && (
            <button onClick={nextLightbox}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition z-10"
            >
              <ChevronRight size={24} />
            </button>
          )}
          {hasMultiple && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[80vw] px-2">
              {images.map((img, idx) => (
                <button key={idx}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                  className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition ${
                    idx === lightboxIndex ? "border-white scale-110" : "border-white/30 opacity-50 hover:opacity-90"
                  }`}
                >
                  <img src={img.imageUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" draggable={false} />
                </button>
              ))}
            </div>
          )}
          <p className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white/30 text-xs select-none pointer-events-none">
            ← → to navigate · Esc to close
          </p>
        </div>
      )}

      {/* ── Page ── */}
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <button onClick={() => navigate("/dashboard/hotels")} className="btn-3d-slate mb-5" style={{ padding: "0.5rem 1rem" }}>
          <ArrowLeft size={15} />
          <span>Back to Hotels</span>
        </button>

        {/* ── Image Gallery ── */}
        {images.length > 0 && (
          <div
            className="relative rounded-3xl overflow-hidden h-64 mb-4 group cursor-zoom-in"
            style={{ boxShadow: "0 6px 0px rgba(0,0,0,0.15), 0 12px 32px rgba(0,0,0,0.2)" }}
            onClick={() => openLightbox(currentImageIndex)}
          >
            <img
              src={images[currentImageIndex].imageUrl}
              alt={`${hotel.name} — photo ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            {/* Gloss */}
            <div className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)" }}
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Maximize2 size={13} /> Click to view fullscreen
              </div>
            </div>

            {hasMultiple && (
              <>
                <button onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
                  style={{ boxShadow: "0 2px 0px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3)" }}
                >
                  <ChevronLeft size={18} />
                </button>
                <button onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
                  style={{ boxShadow: "0 2px 0px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3)" }}
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {hasMultiple && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, idx) => (
                  <button key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                    className={`rounded-full transition-all ${idx === currentImageIndex ? "w-4 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/75"}`}
                  />
                ))}
              </div>
            )}

            {hasMultiple && (
              <span className="absolute top-3 right-3 bg-black/50 text-white text-xs font-semibold px-2.5 py-1 rounded-full z-10">
                {currentImageIndex + 1} / {images.length}
              </span>
            )}
          </div>
        )}

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button key={idx}
                onClick={() => { setCurrentImageIndex(idx); openLightbox(idx); }}
                className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition cursor-zoom-in`}
                style={{
                  borderColor: idx === currentImageIndex ? "#3b82f6" : "transparent",
                  opacity:     idx === currentImageIndex ? 1 : 0.55,
                  transform:   idx === currentImageIndex ? "scale(1.05)" : "scale(1)",
                  boxShadow:   idx === currentImageIndex ? "0 3px 0px #1e3a8a, 0 6px 14px rgba(59,130,246,0.35)" : "none",
                }}
              >
                <img src={img.imageUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* ── Hotel Info ── */}
        <div
          className="rounded-2xl border p-6 mb-5"
          style={{
            background:  "var(--tz-card-bg)",
            borderColor: "var(--tz-card-border)",
            boxShadow:   "0 3px 0px rgba(0,0,0,0.08), 0 6px 18px rgba(0,0,0,0.07)",
          }}
        >
          <h1 className="text-2xl font-bold text-[var(--tz-text)]">{hotel.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-[var(--tz-text-muted)] text-sm">
              <MapPin size={14} /> {hotel.location}
            </span>
            <span className="flex items-center gap-1 text-amber-500 text-sm font-semibold">
              <Star size={14} fill="currentColor" /> {hotel.rating?.toFixed(1) || "0.0"}
            </span>
          </div>
          <p className="text-[var(--tz-text-muted)] text-sm mt-3 leading-relaxed">{hotel.description}</p>

          {hotel.facilities?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {hotel.facilities.map((f) => (
                <span
                  key={f}
                  className="flex items-center gap-1.5 text-blue-500 text-xs px-3 py-1.5 rounded-full font-semibold border"
                  style={{
                    background:  "rgba(59,130,246,0.08)",
                    borderColor: "rgba(59,130,246,0.2)",
                    boxShadow:   "0 2px 0px rgba(59,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.2)",
                  }}
                >
                  <Wifi size={11} /> {f}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Rooms + Booking ── */}
        <div
          className="rounded-2xl border p-6"
          style={{
            background:  "var(--tz-card-bg)",
            borderColor: "var(--tz-card-border)",
            boxShadow:   "0 3px 0px rgba(0,0,0,0.08), 0 6px 18px rgba(0,0,0,0.07)",
          }}
        >
          <h3 className="font-bold text-[var(--tz-text)] mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center icon-3d">
              <BedDouble size={16} className="text-white" />
            </div>
            Select a Room
          </h3>

          {hotel.rooms?.length > 0 ? (
            <div className="space-y-3 mb-5">
              {hotel.rooms.map((room) => (
                <div
                  key={room.roomId}
                  onClick={() => room.available && setSelectedRoom(room)}
                  className="flex items-center justify-between p-4 rounded-xl border transition-all"
                  style={{
                    background:  selectedRoom?.roomId === room.roomId
                      ? "rgba(59,130,246,0.08)"
                      : room.available ? "var(--tz-surface-2)" : "var(--tz-surface-2)",
                    borderColor: selectedRoom?.roomId === room.roomId ? "#3b82f6"
                      : room.available ? "var(--tz-border)" : "var(--tz-border-soft)",
                    cursor:     room.available ? "pointer" : "not-allowed",
                    opacity:    room.available ? 1 : 0.5,
                    transform:  selectedRoom?.roomId === room.roomId ? "translateY(-1px)" : "none",
                    boxShadow:  selectedRoom?.roomId === room.roomId
                      ? "0 3px 0px rgba(59,130,246,0.2), 0 6px 14px rgba(59,130,246,0.12)"
                      : "none",
                  }}
                >
                  <div>
                    <p className="font-semibold text-[var(--tz-text)] text-sm">{room.roomType}</p>
                    <p className="text-[var(--tz-text-muted)] text-xs mt-0.5">
                      {room.availableCount} of {room.roomCount} available
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-500 font-bold text-sm">
                      LKR {parseFloat(room.pricePerNight).toLocaleString()}/night
                    </p>
                    <span className={`text-xs font-semibold ${room.available ? "text-emerald-500" : "text-red-400"}`}>
                      {room.available ? "Available" : "Full"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--tz-text-muted)] text-sm mb-5">No rooms listed.</p>
          )}

          {success ? (
            <div
              className="rounded-2xl p-5 text-center"
              style={{
                background:  "rgba(16,185,129,0.08)",
                border:      "1px solid rgba(16,185,129,0.25)",
                boxShadow:   "0 3px 0px rgba(16,185,129,0.15)",
              }}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-3 icon-3d">
                <CheckCircle size={24} className="text-white" />
              </div>
              <p className="text-emerald-500 font-bold">{success}</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-xl px-4 py-3 text-sm text-red-500 border flex items-center gap-2"
                  style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)" }}
                >
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--tz-text-muted)] mb-1">Check-In</label>
                  <input type="date" value={checkIn}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition border"
                    style={{ background: "var(--tz-input-bg)", borderColor: "var(--tz-input-border)", color: "var(--tz-text)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--tz-text-muted)] mb-1">Check-Out</label>
                  <input type="date" value={checkOut}
                    min={checkIn || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition border"
                    style={{ background: "var(--tz-input-bg)", borderColor: "var(--tz-input-border)", color: "var(--tz-text)" }}
                  />
                </div>
              </div>

              {totalPrice && (
                <div
                  className="flex justify-between rounded-xl px-4 py-3 mb-4"
                  style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}
                >
                  <span className="text-[var(--tz-text-muted)] text-sm">{nights} night(s)</span>
                  <span className="text-blue-500 font-bold text-lg">
                    LKR {parseFloat(totalPrice).toLocaleString()}
                  </span>
                </div>
              )}

              <button
                onClick={handleReserve}
                disabled={booking}
                className="btn-3d-blue btn-3d-wide"
                style={{ paddingTop: "0.75rem", paddingBottom: "0.75rem" }}
              >
                <span>{booking ? "Reserving..." : "Make Reservation"}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default HotelDetailPage;