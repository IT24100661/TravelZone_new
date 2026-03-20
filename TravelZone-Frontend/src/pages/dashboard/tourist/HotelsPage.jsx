import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { Search, Star, MapPin, DollarSign, Building2 } from "lucide-react";

function HotelsPage() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ location: "", price: "" });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchHotels = async (p = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, size: 9 });
      if (filters.location) params.append("location", filters.location);
      if (filters.price) params.append("price", filters.price);
      const res = await api.get(`/api/hotels?${params}`);
      setHotels(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setPage(p);
    } catch {
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHotels(); }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Browse Hotels</h1>
        <p className="text-slate-500 text-sm mt-0.5">Find and book your perfect stay</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); fetchHotels(0); }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs text-slate-500 mb-1 font-medium">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              value={filters.location}
              onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-sm outline-none focus:border-blue-400 transition"
              placeholder="e.g. Kandy"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs text-slate-500 mb-1 font-medium">Max Price / Night</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="number"
              value={filters.price}
              onChange={(e) => setFilters((p) => ({ ...p, price: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-sm outline-none focus:border-blue-400 transition"
              placeholder="e.g. 200"
            />
          </div>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-semibold transition shadow-md shadow-blue-200"
        >
          <Search size={15} /> Search
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : hotels.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
          <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-slate-600 font-semibold">No hotels found</h3>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your search filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {hotels.map((hotel) => (
              <div
                key={hotel.hotelId}
                onClick={() => navigate(`/dashboard/hotels/${hotel.hotelId}`)}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group overflow-hidden"
              >
                <div className="h-36 bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center overflow-hidden">
                  {hotel.thumbnailImage ? (
                    <img src={hotel.thumbnailImage} alt={hotel.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={48} className="text-purple-300" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition">{hotel.name}</h3>
                  <p className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                    <MapPin size={12} /> {hotel.location}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="flex items-center gap-1 text-amber-500 text-sm font-semibold">
                      <Star size={14} fill="currentColor" />
                      {hotel.rating?.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-emerald-600 text-sm font-bold">
                      ${parseFloat(hotel.minPrice || 0).toFixed(0)}/night
                    </span>
                  </div>
                  <button className="mt-3 w-full bg-purple-50 group-hover:bg-blue-600 group-hover:text-white text-purple-600 text-sm py-2 rounded-xl font-semibold transition">
                    View Hotel
                  </button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => fetchHotels(i)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition ${
                    i === page ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-blue-400"
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

export default HotelsPage;
