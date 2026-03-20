import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { Search, Star, MapPin, DollarSign, User } from "lucide-react";

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
      if (filters.rating) params.append("rating", filters.rating);
      const res = await api.get(`/api/guides?${params}`);
      setGuides(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setPage(p);
    } catch {
      setGuides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGuides(); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchGuides(0); };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Browse Guides</h1>
        <p className="text-slate-500 text-sm mt-0.5">Find the perfect local guide for your journey</p>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs text-slate-500 mb-1 font-medium">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              value={filters.location}
              onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-sm outline-none focus:border-blue-400 transition"
              placeholder="e.g. Colombo"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs text-slate-500 mb-1 font-medium">Language</label>
          <input
            value={filters.language}
            onChange={(e) => setFilters((p) => ({ ...p, language: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition"
            placeholder="e.g. English"
          />
        </div>
        <div className="flex-1 min-w-[130px]">
          <label className="block text-xs text-slate-500 mb-1 font-medium">Min Rating</label>
          <div className="relative">
            <Star className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={filters.rating}
              onChange={(e) => setFilters((p) => ({ ...p, rating: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-sm outline-none focus:border-blue-400 transition"
              placeholder="0 – 5"
            />
          </div>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-semibold transition shadow-md shadow-blue-200"
        >
          <Search size={15} />
          Search
        </button>
      </form>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : guides.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
          <User size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-slate-600 font-semibold">No guides found</h3>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your search filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {guides.map((guide) => (
              <div
                key={guide.guideId}
                onClick={() => navigate(`/dashboard/guides/${guide.guideId}`)}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group overflow-hidden"
              >
                <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  {guide.profilePhoto ? (
                    <img src={guide.profilePhoto} alt={guide.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold text-2xl">
                      {guide.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition">{guide.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="flex items-center gap-1 text-amber-500 text-sm font-semibold">
                      <Star size={14} fill="currentColor" />
                      {guide.rating?.toFixed(1) || "0.0"}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
                      <DollarSign size={14} />
                      {parseFloat(guide.pricePerDay).toFixed(0)}/day
                    </span>
                  </div>
                  <button className="mt-3 w-full bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 text-sm py-2 rounded-xl font-semibold transition">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => fetchGuides(i)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition ${
                    i === page
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-blue-400"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default GuidesPage;

