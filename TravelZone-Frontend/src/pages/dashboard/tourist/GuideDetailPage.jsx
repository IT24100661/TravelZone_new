import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import {
  MapPin, Star, Banknote, Globe, CalendarDays,
  ArrowLeft, Clock, CheckCircle, AlertCircle
} from "lucide-react";

function GuideDetailPage() {
  const { guideId } = useParams();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Date range state ────────────────────────────────────────────────────────
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    api.get(`/api/guides/${guideId}`)
      .then((res) => setGuide(res.data))
      .catch(() => navigate("/dashboard/guides"))
      .finally(() => setLoading(false));
  }, [guideId]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const today = new Date().toISOString().split("T")[0];

  const lkr = (amount) =>
    `LKR ${parseFloat(amount).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Count days in range (inclusive)
  const countDays = () => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e < s) return 0;
    return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  };

  const days = countDays();
  const totalPrice = guide ? parseFloat(guide.pricePerDay) * Math.max(days, 1) : 0;

  // ── Booking handler ─────────────────────────────────────────────────────────
  const handleBooking = async () => {
    setBookingError("");

    if (!startDate) {
      setBookingError("Please select a start date");
      return;
    }
    if (!endDate) {
      setBookingError("Please select an end date");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setBookingError("End date must be on or after start date");
      return;
    }

    setBooking(true);
    try {
      await api.post("/api/guide-bookings", {
        guideId: parseInt(guideId),
        startDate,
        endDate,
        totalPrice: guide.pricePerDay, // per-day price; backend multiplies per row
      });

      const label = startDate === endDate
        ? startDate
        : `${startDate} to ${endDate}`;
      setBookingSuccess(
        `Booking request sent for ${label} (${days} day${days !== 1 ? "s" : ""})! Awaiting guide confirmation.`
      );
      setStartDate("");
      setEndDate("");
    } catch (err) {
      setBookingError(err?.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  // ── Quick-select: clicking an available date sets it as start or fills range ─
  const handleDateChipClick = (date) => {
    setBookingError("");
    if (!startDate || (startDate && endDate)) {
      // Fresh start
      setStartDate(date);
      setEndDate("");
    } else {
      // startDate already set — fill end or swap
      if (date < startDate) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!guide) return null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate("/dashboard/guides")}
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
              <Banknote size={14} />
              {lkr(guide.pricePerDay)} / day
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left — details */}
        <div className="md:col-span-2 space-y-5">

          {/* About */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-bold text-slate-800 mb-3">About</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{guide.bio}</p>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-bold text-slate-800 mb-4">Details</h2>
            <div className="space-y-3">
              {[
                { icon: Clock,        label: "Experience", value: `${guide.experienceYears} years` },
                { icon: Globe,        label: "Languages",  value: guide.languages?.join(", ") || "—" },
                { icon: CalendarDays, label: "Available",  value: `${guide.availableDates?.length || 0} days open` },
                { icon: Banknote,     label: "Rate",       value: `${lkr(guide.pricePerDay)} per day` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <span className="flex items-center gap-2 text-slate-500 text-sm">
                    <Icon size={15} className="text-blue-400" /> {label}
                  </span>
                  <span className="text-slate-800 font-semibold text-sm">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Available dates — click to set range */}
          {guide.availableDates?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-slate-800">Available Dates</h2>
                <span className="text-xs text-slate-400">
                  Click to select · Click again to set range
                </span>
              </div>

              {/* Selected range indicator */}
              {startDate && (
                <div className="mb-3 flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl text-xs text-blue-700 font-medium">
                  <CalendarDays size={13} />
                  {endDate && endDate !== startDate
                    ? `${startDate} → ${endDate} (${days} days)`
                    : `From ${startDate} — select end date`}
                  <button
                    type="button"
                    onClick={() => { setStartDate(""); setEndDate(""); setBookingError(""); }}
                    className="ml-auto text-blue-400 hover:text-blue-600 text-xs underline"
                  >
                    Clear
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto">
                {guide.availableDates.slice(0, 30).map((date) => {
                  const isStart  = date === startDate;
                  const isEnd    = date === endDate;
                  const inRange  = startDate && endDate && date > startDate && date < endDate;
                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => handleDateChipClick(date)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition ${
                        isStart || isEnd
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : inRange
                          ? "bg-blue-100 text-blue-700 border-blue-300"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600"
                      }`}
                    >
                      {date}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right — booking panel */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-4">
            <h2 className="font-bold text-slate-800 mb-1">Book This Guide</h2>
            <p className="text-slate-400 text-xs mb-4">Choose a date range and send a booking request</p>

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
                  <div className="mb-3 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-xs flex items-center gap-1.5">
                    <AlertCircle size={13} /> {bookingError}
                  </div>
                )}

                {/* Start date */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setBookingError("");
                      // If end date is now before start, reset it
                      if (endDate && e.target.value > endDate) setEndDate("");
                    }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                {/* End date */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    End Date
                    <span className="text-slate-400 font-normal ml-1">(same as start = 1 day)</span>
                  </label>
                  <input
                    type="date"
                    min={startDate || today}
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setBookingError("");
                    }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                {/* Price summary */}
                <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Rate per day</span>
                    <span className="font-semibold text-slate-800">
                      {lkr(guide.pricePerDay)}
                    </span>
                  </div>
                  {days > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Number of days</span>
                      <span className="font-semibold text-slate-800">{days}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                    <span className="font-bold text-slate-700">
                      {days > 0 ? "Estimated Total" : "Total"}
                    </span>
                    <span className="font-bold text-blue-600">
                      {days > 0 ? lkr(totalPrice) : lkr(guide.pricePerDay)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleBooking}
                  disabled={booking || !startDate || !endDate}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-semibold text-sm transition shadow-md shadow-blue-200"
                >
                  {booking
                    ? "Sending Request..."
                    : days > 1
                    ? `Book ${days} Days`
                    : "Send Booking Request"}
                </button>
                <p className="text-xs text-slate-400 text-center mt-2">
                  Guide must confirm each day in your range
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuideDetailPage;