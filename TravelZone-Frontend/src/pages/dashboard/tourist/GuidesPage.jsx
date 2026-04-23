import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { Search, Star, MapPin, User } from "lucide-react";

function GuidesPage() {
  const navigate = useNavigate();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ location: "", language: "", rating: "" });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchGuides = async (p = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, size: 9 });
      if (filters.location) params.append("location", filters.location);
      if (filters.language) params.append("language", filters.language);
      if (filters.rating)   params.append("rating",   filters.rating);
      const res = await api.get(`/api/guides?${params}`);
      setGuides(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setPage(p);
    } catch { setGuides([]); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchGuides(); }, []);

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--tz-text)]">Browse Guides</h1>
        <p className="text-[var(--tz-text-muted)] text-sm mt-0.5">Find the perfect local guide for your journey</p>
      </div>

      {/* ── Filter bar ── */}
      <form
        onSubmit={(e) => { e.preventDefault(); fetchGuides(0); }}
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
              placeholder="e.g. Colombo"
            />
          </div>
        </div>

        {/* Language */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs text-[var(--tz-text-muted)] mb-1 font-medium">Language</label>
          <input
            value={filters.language}
            onChange={(e) => setFilters((p) => ({ ...p, language: e.target.value }))}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none transition border"
            style={{ background: "var(--tz-input-bg)", borderColor: "var(--tz-input-border)", color: "var(--tz-text)" }}
            placeholder="e.g. English"
          />
        </div>

        {/* Min Rating */}
        <div className="flex-1 min-w-[130px]">
          <label className="block text-xs text-[var(--tz-text-muted)] mb-1 font-medium">Min Rating</label>
          <div className="relative">
            <Star className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tz-text-faint)]" size={15} />
            <input
              type="number" min="0" max="5" step="0.1"
              value={filters.rating}
              onChange={(e) => setFilters((p) => ({ ...p, rating: e.target.value }))}
              className="w-full rounded-xl pl-8 pr-3 py-2 text-sm outline-none transition border"
              style={{ background: "var(--tz-input-bg)", borderColor: "var(--tz-input-border)", color: "var(--tz-text)" }}
              placeholder="0 – 5"
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
      ) : guides.length === 0 ? (
        <EmptyState icon={User} message="No guides found" sub="Try adjusting your search filters" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {guides.map((guide) => (
              <GuideCard key={guide.guideId} guide={guide} onClick={() => navigate(`/dashboard/guides/${guide.guideId}`)} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8 flex-wrap">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => fetchGuides(i)}
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

/* ── Guide Card ── */
function GuideCard({ guide, onClick }) {
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
        e.currentTarget.style.transform  = "translateY(-6px)";
        e.currentTarget.style.boxShadow  = "0 8px 0px rgba(0,0,0,0.14), 0 16px 32px rgba(0,0,0,0.14)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform  = "translateY(-2px)";
        e.currentTarget.style.boxShadow  = "0 4px 0px rgba(0,0,0,0.10), 0 6px 18px rgba(0,0,0,0.08)";
      }}
    >
      {/* Banner */}
      <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center relative overflow-hidden">
        {/* Gloss */}
        <div className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)" }}
        />
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />

        {guide.profilePhoto ? (
          <img src={guide.profilePhoto} alt={guide.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-white/40 shadow-lg relative z-10"
          />
        ) : (
          <div
            className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-3xl font-bold relative z-10 icon-3d"
          >
            {guide.name?.charAt(0)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-[var(--tz-text)] group-hover:text-blue-500 transition truncate">
          {guide.name}
        </h3>

        {guide.location && (
          <p className="flex items-center gap-1 text-[var(--tz-text-muted)] text-xs mt-1">
            <MapPin size={12} /> {guide.location}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="flex items-center gap-1 text-amber-500 text-sm font-semibold">
            <Star size={14} fill="currentColor" />
            {guide.rating?.toFixed(1) || "0.0"}
          </span>
          <span className="text-emerald-500 text-sm font-bold">
            LKR {parseFloat(guide.pricePerDay).toLocaleString()}/day
          </span>
        </div>

        {/* 3D View button */}
        <button
          className="btn-3d-blue mt-3 btn-3d-wide"
          style={{ padding: "0.55rem 1rem" }}
        >
          <span>View Profile</span>
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

export default GuidesPage;