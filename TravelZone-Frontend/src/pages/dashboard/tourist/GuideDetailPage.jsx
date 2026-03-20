import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { MapPin, Star, DollarSign, Globe, BookOpen, CalendarDays, ArrowLeft } from "lucide-react";

function GuideDetailPage() {
  const { guideId } = useParams();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState("");
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/api/guides/${guideId}`)
      .then((res) => setGuide(res.data))
      .catch(() => navigate("/dashboard/guides"))
      .finally(() => setLoading(false));
  }, [guideId]);

  const handleBooking = async () => {
    if (!bookingDate) { setError("Please select a date"); return; }
    setError(""); setBooking(true);
    try {
      await api.post("/api/guide-bookings", {
        guideId: parseInt(guideId),
        bookingDate,
        totalPrice: guide.pricePerDay,
      });
      setSuccess(`Booking requested for ${bookingDate}! Awaiting guide confirmation.`);
    } catch (err) {
      setError(err?.response?.data?.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!guide) return null;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate("/dashboard/guides")}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-5 text-sm font-medium transition"
      >
        <ArrowLeft size={16} /> Back to Guides
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 mb-6 flex items-center gap-5 shadow-lg">
        {guide.profilePhoto ? (
          <img src={guide.profilePhoto} alt={guide.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30 shadow" />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-white text-3xl font-bold">
            {guide.name?.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white">{guide.name}</h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-blue-200 text-sm">
              <MapPin size={14} /> {guide.location}
            </span>
            <span className="flex items-center gap-1 text-amber-300 text-sm font-semibold">
              <Star size={14} fill="currentColor" /> {guide.rating?.toFixed(1) || "0.0"}
            </span>
            <span className="flex items-center gap-1 text-emerald-300 text-sm font-semibold">
              <DollarSign size={14} /> ${parseFloat(guide.pricePerDay).toFixed(0)}/day
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <BookOpen size={18} className="text-blue-500" />
          </div>
          <div>
            <p className="text-slate-400 text-xs">Experience</p>
            <p className="text-slate-800 font-bold">{guide.experienceYears} years</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Globe size={18} className="text-purple-500" />
          </div>
          <div>
            <p className="text-slate-400 text-xs">Languages</p>
            <p className="text-slate-800 font-bold text-sm">{guide.languages?.join(", ")}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <DollarSign size={18} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-slate-400 text-xs">Price / Day</p>
            <p className="text-slate-800 font-bold">${parseFloat(guide.pricePerDay).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-5">
        <h3 className="font-bold text-slate-800 mb-2">About</h3>
        <p className="text-slate-600 text-sm leading-relaxed">{guide.bio}</p>
      </div>

      {/* Booking */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CalendarDays size={18} className="text-blue-500" /> Book This Guide
        </h3>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-4 rounded-xl text-sm font-medium">
            ✅ {success}
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>
            )}

            <div className="mb-3">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Available Date</label>
              {guide.availableDates?.length > 0 ? (
                <select
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm"
                >
                  <option value="">-- Select a date --</option>
                  {guide.availableDates.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              ) : (
                <p className="text-slate-400 text-sm">No available dates at the moment.</p>
              )}
            </div>

            <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3 mb-4">
              <span className="text-slate-600 text-sm">Total Price</span>
              <span className="text-blue-700 font-bold text-lg">${parseFloat(guide.pricePerDay).toFixed(2)}</span>
            </div>

            <button
              onClick={handleBooking}
              disabled={booking || !guide.availableDates?.length}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition shadow-lg shadow-blue-200"
            >
              {booking ? "Submitting..." : "Request Booking"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default GuideDetailPage;
