import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import api from "../../../api/axios";
import {
  MapPin, Star, DollarSign, Globe, CalendarDays,
  ArrowLeft, Clock, CheckCircle, AlertCircle, XCircle
} from "lucide-react";

function GuideDetailPage() {
  const { guideId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");   // ✅ show error, don't navigate away
  const [bookingDate, setBookingDate] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingError, setBookingError] = useState("");

  const isTourist = user?.role === "TOURIST";

  useEffect(() => {
    setLoading(true);
    setFetchError("");
    api.get(`/api/guides/${guideId}`)
      .then((res) => setGuide(res.data))
      .catch(() => setFetchError("Failed to load guide profile. Please try again.")) // ✅ don't navigate away
      .finally(() => setLoading(false));
  }, [guideId]);

  const handleBooking = async () => {
    if (!bookingDate) { setBookingError("Please select a booking date"); return; }
    if (bookingDate && !guide.availableDates?.includes(bookingDate)) {
      setBookingError("Selected date is not available. Please choose from the available dates above.");
      return;
    }
    setBookingError("");
    setBooking(true);
    try {
      await api.post("/api/guide-bookings", {
        guideId: guide.guideId,
        bookingDate,
        totalPrice: guide.pricePerDay,
      });
      setBookingSuccess(`Booking requested for ${bookingDate}! Awaiting guide confirmation.`);
      setBookingDate("");
      // ✅ Refresh guide to update available dates
      const res = await api.get(`/api/guides/${guideId}`);
      setGuide(res.data);
    } catch (err) {
      setBookingError(err?.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ✅ Show error inline instead of navigating away
  if (fetchError) return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-5 text-sm font-medium transition"
      >
        <ArrowLeft size={16} /> Back to Guides
      </button>
      <div className="bg-red-50 border border-red-200 rounded-2xl p-10 text-center">
        <XCircle size={40} className="mx-auto text-red-400 mb-3" />
        <p className="text-red-600 font-semibold">{fetchError}</p>
        <button
          onClick={() => { setLoading(true); setFetchError(""); api.get(`/api/guides/${guideId}`).then(r => setGuide(r.data)).catch(() => setFetchError("Failed to load guide profile.")).finally(() => setLoading(false)); }}
          className="mt-4 text-sm text-blue-600 underline"
        >
          Retry
        </button>
      </div>
    </div>
  );

  if (!guide) return null;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-5 text-sm font-medium transition"
      >
        <ArrowLeft size={16} /> Back to Guides
      </button>

      {/* Hero card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 mb-6 flex items-center gap-5 shadow-lg">
        {guide.profilePhoto ? (
          <img
            src={guide.profilePhoto}
            alt={guide.name}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-white/30 shadow flex-shrink-0"
          />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
            {guide.name?.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white truncate">{guide.name}</h1>
          <div className="flex items-center flex-wrap gap-3 mt-1">
            <span className="flex items-center gap-1 text-blue-200 text-sm">
              <MapPin size={14} /> {guide.location}
            </span>
            <span className="flex items-center gap-1 text-amber-300 text-sm font-semibold">
              <Star size={14} fill="currentColor" />
              {guide.rating?.toFixed(1) || "0.0"} rating
            </span>
            <span className="flex items-center gap-1 text-emerald-300 text-sm font-semibold">
              <DollarSign size={14} />
              ${parseFloat(guide.pricePerDay).toFixed(2)} / day
            </span>
          </div>
        </div>
      </div>

      <div className={`grid gap-5 ${isTourist ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"}`}>

        {/* Left — details */}
        <div className={`space-y-5 ${isTourist ? "md:col-span-2" : ""}`}>

          {/* About */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-bold text-slate-800 mb-3">About</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{guide.bio}</p>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-bold text-slate-800 mb-4">Details</h2>
            <div className="space-y-3">
              {[
                { icon: Clock,        label: "Experience", value: `${guide.experienceYears} years` },
                { icon: Globe,        label: "Languages",  value: guide.languages?.join(", ") || "—" },
                { icon: CalendarDays, label: "Available",  value: `${guide.availableDates?.length || 0} days open` },
                { icon: DollarSign,   label: "Rate",       value: `$${parseFloat(guide.pricePerDay).toFixed(2)} per day` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                  <span className="flex items-center gap-2 text-slate-500 text-sm">
                    <Icon size={15} className="text-blue-400" /> {label}
                  </span>
                  <span className="text-slate-800 font-semibold text-sm">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Available dates */}
          {guide.availableDates?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="font-bold text-slate-800 mb-3">Available Dates</h2>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {guide.availableDates.slice(0, 20).map((date) => (
                  <button
                    key={date}
                    type="button"
                    disabled={!isTourist}
                    onClick={() => { if (isTourist) { setBookingDate(date); setBookingError(""); } }}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition
                      ${bookingDate === date
                        ? "bg-blue-600 text-white border-blue-600"
                        : isTourist
                          ? "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600 cursor-pointer"
                          : "bg-slate-50 text-slate-400 border-slate-200 cursor-default"
                      }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
              {!isTourist && (
                <p className="text-slate-400 text-xs mt-3 flex items-center gap-1">
                  <AlertCircle size={12} /> Only tourists can book a guide
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right — booking panel (TOURIST only) */}
        {isTourist && (
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-4">
              <h2 className="font-bold text-slate-800 mb-1">Book This Guide</h2>
              <p className="text-slate-400 text-xs mb-4">Select a date and send a booking request</p>

              {bookingSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <CheckCircle size={32} className="mx-auto text-emerald-500 mb-2" />
                  <p className="text-emerald-700 font-semibold text-sm">{bookingSuccess}</p>
                  <button
                    onClick={() => setBookingSuccess("")}
                    className="mt-3 text-xs text-emerald-600 underline"
                  >
                    Book another date
                  </button>
                </div>
              ) : (
                <>
                  {bookingError && (
                    <div className="mb-3 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-xs flex items-start gap-1.5">
                      <AlertCircle size={13} className="mt-0.5 flex-shrink-0" /> {bookingError}
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Select Date
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={bookingDate}
                      onChange={(e) => { setBookingDate(e.target.value); setBookingError(""); }}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    />
                    {bookingDate && !guide.availableDates?.includes(bookingDate) && (
                      <p className="text-amber-600 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle size={11} /> Choose from the available dates above
                      </p>
                    )}
                  </div>

                  {/* Price summary */}
                  <div className="bg-slate-50 rounded-xl p-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Rate</span>
                      <span className="font-semibold text-slate-800">
                        ${parseFloat(guide.pricePerDay).toFixed(2)} / day
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1.5 pt-1.5 border-t border-slate-200">
                      <span className="font-bold text-slate-700">Total</span>
                      <span className="font-bold text-blue-600">
                        ${parseFloat(guide.pricePerDay).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={booking || !bookingDate}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold text-sm transition shadow-md shadow-blue-200"
                  >
                    {booking ? "Sending Request..." : "Send Booking Request"}
                  </button>
                  <p className="text-xs text-slate-400 text-center mt-2">
                    Guide must confirm your request
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GuideDetailPage;
