import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { Search, Star, MapPin, Banknote, Building2 } from "lucide-react";

function HotelsPage() {
  const navigate = useNavigate();
  const [hotels, setHotels]           = useState([]);
  const [loading, setLoading]         = useState(false);
  const [filters, setFilters]         = useState({ location: "", price: "" });
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);

  const fetchHotels = async (p = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, size: 9 });
      if (filters.location) params.append("location", filters.location);
      if (filters.price)    params.append("price",    filters.price);
      const res = await api.get(`/api/hotels?${params}`);
      setHotels(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setPage(p);
    } catch { setHotels([]); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchHotels(); }, []);

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--tz-text)]">Browse Hotels</h1>
        <p className="text-[var(--tz-text-muted)] text-sm mt-0.5">Find and book your perfect stay</p>
      </div>

      {/* ── Filter bar ── */}
      <form
        onSubmit={(e) => { e.preventDefault(); fetchHotels(0); }}
        className="rounded-2xl border p-4 mb-6 flex flex-wrap gap-3 items-end"
        style={{
          background:  "var(--tz-card-bg)",
          borderColor: "var(--tz-card-border)",
          boxShadow:   "0 3px 0px rgba(0,0,0,0.08), 0 6px 16px rgba(0,0,0,0.06)",
        }}
      >
        {/* Location */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs text-[var(--tz-text-muted)] mb-1 font-medium">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tz-text-faint)]" size={15} />
            <input
              value={filters.location}
              onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))}
              className="w-full rounded-xl pl-8 pr-3 py-2 text-sm outline-none transition border"
              style={{ background: "var(--tz-input-bg)", borderColor: "var(--tz-input-border)", color: "var(--tz-text)" }}
              placeholder="e.g. Kandy"
            />
          </div>
        </div>

        {/* Max Price */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs text-[var(--tz-text-muted)] mb-1 font-medium">Max Price / Night (LKR)</label>
          <div className="relative">
            <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tz-text-faint)]" size={15} />
            <input
              type="number"
              value={filters.price}
              onChange={(e) => setFilters((p) => ({ ...p, price: e.target.value }))}
              className="w-full rounded-xl pl-8 pr-3 py-2 text-sm outline-none transition border"
              style={{ background: "var(--tz-input-bg)", borderColor: "var(--tz-input-border)", color: "var(--tz-text)" }}
              placeholder="e.g. 20000"
            />
          </div>
        </div>

        <button type="submit" className="btn-3d-blue">
          <Search size={15} />
          <span>Search</span>
        </button>
      </form>

      {/* ── Results ── */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : hotels.length === 0 ? (
        <EmptyState icon={Building2} message="No hotels found" sub="Try adjusting your search filters" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.hotelId}
                hotel={hotel}
                onClick={() => navigate(`/dashboard/hotels/${hotel.hotelId}`)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8 flex-wrap">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => fetchHotels(i)}
                  className={i === page ? "btn-3d-blue" : "btn-3d-slate"}
                  style={{ padding: "0.45rem 0.9rem", minWidth: "2.25rem" }}
                >
                  <span>{i + 1}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Hotel Card ── */
function HotelCard({ hotel, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200"
      style={{
        background:  "var(--tz-card-bg)",
        borderColor: "var(--tz-card-border)",
        boxShadow:   "0 4px 0px rgba(0,0,0,0.10), 0 6px 18px rgba(0,0,0,0.08)",
        transform:   "translateY(-2px)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 8px 0px rgba(0,0,0,0.14), 0 16px 32px rgba(0,0,0,0.14)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 0px rgba(0,0,0,0.10), 0 6px 18px rgba(0,0,0,0.08)";
      }}
    >
      {/* Thumbnail */}
      <div className="h-36 bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center overflow-hidden relative">
        {/* Gloss */}
        <div className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, transparent 100%)" }}
        />
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />

        {hotel.thumbnailImage ? (
          <img src={hotel.thumbnailImage} alt={hotel.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center relative z-10 icon-3d">
            <Building2 size={32} className="text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-[var(--tz-text)] group-hover:text-blue-500 transition truncate">
          {hotel.name}
        </h3>
        <p className="flex items-center gap-1 text-[var(--tz-text-muted)] text-xs mt-1">
          <MapPin size={12} /> {hotel.location}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="flex items-center gap-1 text-amber-500 text-sm font-semibold">
            <Star size={14} fill="currentColor" />
            {hotel.rating?.toFixed(1) || "0.0"}
          </span>
          <span className="text-emerald-500 text-sm font-bold">
            LKR {parseFloat(hotel.minPrice || 0).toLocaleString()}/night
          </span>
        </div>

        {/* 3D View button — purple theme for hotels */}
        <button
          className="mt-3 w-full relative overflow-hidden flex items-center justify-center gap-2 rounded-xl font-bold text-sm text-white border-none cursor-pointer outline-none"
          style={{
            padding:    "0.55rem 1rem",
            background: "linear-gradient(175deg, #5b21b6 0%, #7c3aed 45%, #8b5cf6 75%, #a78bfa 100%)",
            transform:  "translateY(-2px)",
            boxShadow:  "0 4px 0px #3b0764, 0 6px 16px rgba(124,58,237,0.4), 0 2px 6px rgba(0,0,0,0.3)",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 6px 0px #3b0764, 0 10px 24px rgba(124,58,237,0.55)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 0px #3b0764, 0 6px 16px rgba(124,58,237,0.4)";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "translateY(1px)";
            e.currentTarget.style.boxShadow = "0 1px 0px #3b0764, 0 2px 8px rgba(124,58,237,0.25)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 0px #3b0764, 0 6px 16px rgba(124,58,237,0.4)";
          }}
        >
          {/* Gloss */}
          <span className="absolute top-1 left-[15%] w-[70%] h-[38%] pointer-events-none rounded-full"
            style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.38) 0%, transparent 100%)" }}
          />
          <span className="relative z-10">View Hotel</span>
        </button>
      </div>
    </div>
  );
}

/* ── Empty State ── */
function EmptyState({ icon: Icon, message, sub }) {
  return (
    <div
      className="rounded-3xl border p-16 text-center"
      style={{ background: "var(--tz-card-bg)", borderColor: "var(--tz-card-border)" }}
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4 icon-3d">
        <Icon size={32} className="text-[var(--tz-text-faint)]" />
      </div>
      <p className="text-[var(--tz-text)] font-semibold">{message}</p>
      <p className="text-[var(--tz-text-muted)] text-sm mt-1">{sub}</p>
    </div>
  );
}

export default HotelsPage;