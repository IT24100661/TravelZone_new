import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import {
  MapPin, Star, Banknote, Globe, CalendarDays,
  ArrowLeft, Clock, CheckCircle, AlertCircle
} from "lucide-react";

function DetailRow({ icon: Icon, label, value, isLast = false }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      paddingBottom: isLast ? 0 : "0.75rem", marginBottom: isLast ? 0 : "0.75rem",
      borderBottom: isLast ? "none" : "1px solid var(--tz-border)",
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "var(--tz-text-muted)", fontSize: "0.875rem" }}>
        <span style={{
          position: "relative", width: "1.75rem", height: "1.75rem", borderRadius: "0.5rem",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, overflow: "hidden",
          background: "linear-gradient(145deg, #60a5fa 0%, #2563eb 100%)",
          boxShadow: "0 3px 0px rgba(30,58,138,0.5), 0 4px 10px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.35)",
          transform: "translateY(-1px)",
        }}>
          <span style={{
            position: "absolute", top: "2px", left: "10%", width: "80%", height: "40%",
            borderRadius: "999px",
            background: "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%)",
            pointerEvents: "none",
          }} />
          <Icon size={12} color="#fff" style={{ position: "relative", zIndex: 2 }} />
        </span>
        {label}
      </span>
      <span style={{ color: "var(--tz-text)", fontWeight: 600, fontSize: "0.875rem" }}>
        {value}
      </span>
    </div>
  );
}

function InfoCard({ title, subtitle, children }) {
  return (
    <div style={{
      background: "var(--tz-card-bg)", border: "1px solid var(--tz-card-border)",
      borderRadius: "1rem", padding: "1.25rem",
      boxShadow: "0 2px 0px rgba(0,0,0,0.06), 0 4px 14px rgba(0,0,0,0.06)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
        <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--tz-text)", margin: 0 }}>{title}</h2>
        {subtitle && <span style={{ fontSize: "0.72rem", color: "var(--tz-text-faint)" }}>{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────── */

/** Returns "YYYY-MM-DD" for a Date object in LOCAL time */
function toLocalDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Builds an array of 30 date strings starting from tomorrow */
function buildNext30Days() {
  const days = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 1; i <= 30; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    days.push(toLocalDateStr(d));
  }
  return days;
}

/* ═══════════════════════════════════════════════════════ */

function GuideDetailPage() {
  const { guideId } = useParams();
  const navigate    = useNavigate();

  const [guide, setGuide]                   = useState(null);
  const [loading, setLoading]               = useState(true);
  const [startDate, setStartDate]           = useState("");
  const [endDate, setEndDate]               = useState("");
  const [booking, setBooking]               = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingError, setBookingError]     = useState("");

  useEffect(() => {
    api.get(`/api/guides/${guideId}`)
      .then((res) => setGuide(res.data))
      .catch(() => navigate("/dashboard/guides"))
      .finally(() => setLoading(false));
  }, [guideId]);

  const today = new Date().toISOString().split("T")[0];

  const lkr = (amount) =>
    `LKR ${parseFloat(amount).toLocaleString("en-LK", {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    })}`;

  const countDays = () => {
    if (!startDate || !endDate) return 0;
    const diff = new Date(endDate) - new Date(startDate);
    return diff < 0 ? 0 : Math.round(diff / 86400000) + 1;
  };

  const days       = countDays();
  const totalPrice = guide ? parseFloat(guide.pricePerDay) * Math.max(days, 1) : 0;

  const handleBooking = async () => {
    setBookingError("");
    if (!startDate) return setBookingError("Please select a start date");
    if (!endDate)   return setBookingError("Please select an end date");
    if (new Date(endDate) < new Date(startDate))
      return setBookingError("End date must be on or after start date");
    setBooking(true);
    try {
      await api.post("/api/guide-bookings", {
        guideId: parseInt(guideId),
        startDate, endDate,
        totalPrice: guide.pricePerDay,
      });
      const label = startDate === endDate ? startDate : `${startDate} to ${endDate}`;
      setBookingSuccess(
        `Booking request sent for ${label} (${days} day${days !== 1 ? "s" : ""})! Awaiting guide confirmation.`
      );
      setStartDate(""); setEndDate("");
    } catch (err) {
      setBookingError(err?.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  const handleDateChipClick = (date) => {
    setBookingError("");
    if (!startDate || (startDate && endDate)) {
      setStartDate(date); setEndDate("");
    } else {
      if (date < startDate) { setEndDate(startDate); setStartDate(date); }
      else                  { setEndDate(date); }
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (!guide) return null;

  /* ── Date chip data ──────────────────────────────────────
     - next30Days  : always tomorrow → +30 days (recomputed each render/day)
     - availableSet: dates the guide marked as available
     - bookedSet   : dates already booked (guide.bookedDates from API)
     A chip is CLICKABLE only when it's in availableSet AND not in bookedSet.
  ─────────────────────────────────────────────────────── */
  const next30Days   = buildNext30Days();
  const availableSet = new Set(guide.availableDates || []);
  const bookedSet    = new Set(guide.bookedDates    || []); // add this field in your API response

  return (
    <>
      <style>{`
        .guide-detail-wrap { max-width: 768px; margin: 0 auto; }

        .guide-hero {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%);
          border-radius: 1.5rem; padding: 1.5rem;
          display: flex; align-items: center; gap: 1.25rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 8px 0px #1e3a8a, 0 16px 40px rgba(59,130,246,0.45),
                      inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .guide-hero-gloss {
          position: absolute; top: 0; left: 0; right: 0; height: 50%;
          border-radius: 1.5rem 1.5rem 0 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%);
          pointer-events: none;
        }
        .guide-hero-orb {
          position: absolute; top: -1.5rem; right: -1.5rem;
          width: 10rem; height: 10rem; background: rgba(255,255,255,0.08);
          border-radius: 9999px; filter: blur(28px); pointer-events: none;
        }
        .guide-avatar {
          position: relative; overflow: hidden; flex-shrink: 0;
          width: 5.5rem; height: 5.5rem; border-radius: 1rem;
          display: flex; align-items: center; justify-content: center;
          font-size: 2.25rem; font-weight: 900; color: #fff;
          border: 2px solid rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.18);
          box-shadow: 0 4px 0px rgba(0,0,0,0.25), 0 8px 20px rgba(0,0,0,0.2),
                      inset 0 1px 0 rgba(255,255,255,0.35);
          z-index: 2;
        }
        .guide-avatar::before {
          content: ""; position: absolute; top: 3px; left: 10%; width: 80%; height: 42%;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(255,255,255,0.42) 0%, transparent 100%);
          pointer-events: none;
        }
        .guide-avatar img {
          width: 100%; height: 100%; object-fit: cover;
          border-radius: calc(1rem - 2px); position: relative; z-index: 2;
        }
        .guide-hero-name  { color: #fff; font-size: 1.35rem; font-weight: 800; margin: 0 0 0.35rem; }
        .guide-hero-meta  { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
        .guide-hero-tag   { display: flex; align-items: center; gap: 0.3rem; font-size: 0.8rem; font-weight: 500; }

        .guide-grid { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }
        @media (min-width: 768px) {
          .guide-grid { grid-template-columns: 1fr 1fr 1fr; }
          .guide-left  { grid-column: span 2; }
          .guide-right { grid-column: span 1; }
        }
        .guide-left-stack { display: flex; flex-direction: column; gap: 1.25rem; }

        .about-text { color: var(--tz-text-muted); font-size: 0.875rem; line-height: 1.7; margin: 0; }

        /* Date chips */
        .date-chip-selected {
          background: linear-gradient(175deg,#1d4ed8,#3b82f6) !important;
          color: #fff !important; border-color: #2563eb !important;
          box-shadow: 0 3px 0px #1e3a8a, 0 4px 10px rgba(59,130,246,0.4) !important;
        }
        .date-chip-inrange {
          background: rgba(59,130,246,0.12) !important;
          color: #3b82f6 !important; border-color: rgba(59,130,246,0.3) !important;
        }
        .date-chip-available {
          background: var(--tz-surface-2) !important;
          color: var(--tz-text-muted) !important;
          border-color: var(--tz-border) !important;
        }
        /* Booked — greyed out, not clickable */
        .date-chip-booked {
          background: rgba(100,116,139,0.08) !important;
          color: var(--tz-text-faint) !important;
          border-color: rgba(100,116,139,0.2) !important;
          cursor: not-allowed !important;
          text-decoration: line-through;
          opacity: 0.55;
        }
        /* Not in guide's available list — shown but dimmed */
        .date-chip-unavailable {
          background: rgba(100,116,139,0.05) !important;
          color: var(--tz-text-faint) !important;
          border-color: rgba(100,116,139,0.15) !important;
          cursor: not-allowed !important;
          opacity: 0.4;
        }

        .date-range-banner {
          display: flex; align-items: center; gap: 0.5rem;
          background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3);
          color: #3b82f6; padding: 0.5rem 0.75rem; border-radius: 0.75rem;
          font-size: 0.75rem; font-weight: 600; margin-bottom: 0.75rem;
        }

        .booking-panel {
          border-radius: 1rem; padding: 1.25rem; position: sticky; top: 1rem;
          background: var(--tz-card-bg); border: 1px solid var(--tz-card-border);
          box-shadow: 0 4px 0px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.08);
        }
        .booking-panel-title { font-weight: 700; font-size: 0.95rem; color: var(--tz-text); margin: 0 0 0.2rem; }
        .booking-panel-sub   { color: var(--tz-text-muted); font-size: 0.75rem; margin: 0 0 1rem; }

        .price-summary {
          border-radius: 0.75rem; padding: 0.75rem; margin-bottom: 1rem;
          background: var(--tz-surface-2); border: 1px solid var(--tz-border-soft);
        }
        .price-row          { display: flex; justify-content: space-between; font-size: 0.825rem; margin-bottom: 0.4rem; }
        .price-row:last-child { margin-bottom: 0; }
        .price-label        { color: var(--tz-text-muted); }
        .price-value        { font-weight: 600; color: var(--tz-text); }
        .price-total-label  { font-weight: 700; color: var(--tz-text); }
        .price-total-value  { font-weight: 700; color: #3b82f6; }
        .price-divider      { border: none; border-top: 1px solid var(--tz-border); margin: 0.5rem 0; }

        .booking-success-box {
          border-radius: 1rem; padding: 1.25rem; text-align: center;
          background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.25);
          box-shadow: 0 3px 0px rgba(16,185,129,0.15);
        }
        .booking-success-icon {
          width: 3rem; height: 3rem; border-radius: 1rem; margin: 0 auto 0.75rem;
          background: linear-gradient(145deg,#34d399,#0d9488);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 0px rgba(6,78,59,0.4), 0 6px 16px rgba(16,185,129,0.35),
                      inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .booking-success-text { color: #059669; font-weight: 600; font-size: 0.875rem; line-height: 1.5; margin: 0; }

        .booking-error-box {
          display: flex; align-items: center; gap: 0.4rem;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
          color: #dc2626; padding: 0.5rem 0.75rem;
          border-radius: 0.75rem; font-size: 0.78rem; margin-bottom: 0.75rem;
        }

        .booking-label {
          display: block; font-size: 0.75rem; font-weight: 600;
          color: var(--tz-text-muted); margin-bottom: 0.375rem;
        }
        .booking-input {
          width: 100%; border-radius: 0.75rem; padding: 0.6rem 0.875rem;
          font-size: 0.875rem; outline: none; margin-bottom: 0.75rem;
          background: var(--tz-input-bg); border: 1px solid var(--tz-input-border);
          color: var(--tz-text); font-family: inherit;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .booking-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
        .booking-hint { font-size: 0.7rem; color: var(--tz-text-faint); text-align: center; margin-top: 0.5rem; display: block; }

        /* Legend */
        .chip-legend { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.75rem; }
        .chip-legend-item { display: flex; align-items: center; gap: 0.35rem; font-size: 0.68rem; color: var(--tz-text-faint); }
        .chip-legend-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
      `}</style>

      <div className="guide-detail-wrap">

        {/* Back */}
        <button
          onClick={() => navigate("/dashboard/guides")}
          className="btn-3d-slate"
          style={{ marginBottom: "1.25rem", padding: "0.5rem 1rem" }}
        >
          <ArrowLeft size={15} />
          <span>Back to Guides</span>
        </button>

        {/* Hero */}
        <div className="guide-hero">
          <div className="guide-hero-gloss" />
          <div className="guide-hero-orb" />
          <div className="guide-avatar">
            {guide.profilePhoto
              ? <img src={guide.profilePhoto} alt={guide.name} />
              : <span style={{ position: "relative", zIndex: 2 }}>{guide.name?.charAt(0)}</span>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 2 }}>
            <h1 className="guide-hero-name">{guide.name}</h1>
            <div className="guide-hero-meta">
              <span className="guide-hero-tag" style={{ color: "#bfdbfe" }}><MapPin size={13} /> {guide.location}</span>
              <span className="guide-hero-tag" style={{ color: "#fcd34d", fontWeight: 700 }}><Star size={13} fill="currentColor" /> {guide.rating?.toFixed(1) || "0.0"} rating</span>
              <span className="guide-hero-tag" style={{ color: "#6ee7b7", fontWeight: 700 }}><Banknote size={13} /> {lkr(guide.pricePerDay)} / day</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="guide-grid">

          {/* LEFT */}
          <div className="guide-left guide-left-stack">

            <InfoCard title="About">
              <p className="about-text">{guide.bio}</p>
            </InfoCard>

            <InfoCard title="Details">
              {[
                { icon: Clock,        label: "Experience", value: `${guide.experienceYears} years` },
                { icon: Globe,        label: "Languages",  value: guide.languages?.join(", ") || "—" },
                { icon: CalendarDays, label: "Available",  value: `${guide.availableDates?.length || 0} days open` },
                { icon: Banknote,     label: "Rate",       value: `${lkr(guide.pricePerDay)} per day` },
              ].map(({ icon, label, value }, i, arr) => (
                <DetailRow key={label} icon={icon} label={label} value={value} isLast={i === arr.length - 1} />
              ))}
            </InfoCard>

            {/* ══════════════════════════════════════════
                AVAILABLE DATES — next 30 days from tomorrow
                ✅ available + not booked  → clickable
                ❌ booked                  → strikethrough
                ➖ not in guide's list     → dimmed
            ══════════════════════════════════════════ */}
            <InfoCard
              title="Available Dates"
              subtitle="Next 30 days · Click to select range"
            >
              {/* Legend */}
              <div className="chip-legend">
                <span className="chip-legend-item">
                  <span className="chip-legend-dot" style={{ background: "var(--tz-text-muted)" }} />
                  Available
                </span>
                <span className="chip-legend-item">
                  <span className="chip-legend-dot" style={{ background: "#3b82f6" }} />
                  Selected
                </span>
                <span className="chip-legend-item">
                  <span className="chip-legend-dot" style={{ background: "rgba(100,116,139,0.4)" }} />
                  Booked / Unavailable
                </span>
              </div>

              {/* Range banner */}
              {startDate && (
                <div className="date-range-banner">
                  <CalendarDays size={12} />
                  {endDate && endDate !== startDate
                    ? `${startDate} → ${endDate} (${days} days)`
                    : `From ${startDate} — select end date`}
                  <button
                    type="button"
                    onClick={() => { setStartDate(""); setEndDate(""); setBookingError(""); }}
                    style={{
                      marginLeft: "auto", background: "none", border: "none",
                      cursor: "pointer", color: "inherit", fontSize: "0.72rem",
                      textDecoration: "underline", padding: 0,
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Chips — always 30 days: tomorrow to +30 */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", maxHeight: "13rem", overflowY: "auto" }}>
                {next30Days.map((date) => {
                  const isSelected  = date === startDate || date === endDate;
                  const inRange     = startDate && endDate && date > startDate && date < endDate;
                  const isBooked    = bookedSet.has(date);
                  const isAvailable = availableSet.has(date);

                  let chipClass = "date-chip-available";
                  if (isSelected)        chipClass = "date-chip-selected";
                  else if (inRange)      chipClass = "date-chip-inrange";
                  else if (isBooked)     chipClass = "date-chip-booked";
                  else if (!isAvailable) chipClass = "date-chip-unavailable";

                  const isDisabled = isBooked || !isAvailable;

                  return (
                    <button
                      key={date}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => !isDisabled && handleDateChipClick(date)}
                      className={chipClass}
                      title={isBooked ? "Already booked" : !isAvailable ? "Guide unavailable" : date}
                      style={{
                        fontSize: "0.72rem", padding: "0.35rem 0.75rem",
                        borderRadius: "0.625rem", fontWeight: 600,
                        border: "1px solid", transition: "all 0.15s ease",
                        cursor: isDisabled ? "not-allowed" : "pointer",
                      }}
                    >
                      {date}
                    </button>
                  );
                })}
              </div>
            </InfoCard>

          </div>

          {/* RIGHT: Booking panel */}
          <div className="guide-right">
            <div className="booking-panel">
              <p className="booking-panel-title">Book This Guide</p>
              <p className="booking-panel-sub">Choose a date range and send a booking request</p>

              {bookingSuccess ? (
                <div className="booking-success-box">
                  <div className="booking-success-icon">
                    <CheckCircle size={22} color="#fff" />
                  </div>
                  <p className="booking-success-text">{bookingSuccess}</p>
                  <button
                    onClick={() => setBookingSuccess("")}
                    style={{
                      marginTop: "0.75rem", background: "none", border: "none",
                      cursor: "pointer", color: "#059669", fontSize: "0.78rem",
                      textDecoration: "underline", padding: 0,
                    }}
                  >
                    Book another date
                  </button>
                </div>
              ) : (
                <>
                  {bookingError && (
                    <div className="booking-error-box"><AlertCircle size={13} /> {bookingError}</div>
                  )}

                  <label className="booking-label">Start Date</label>
                  <input
                    type="date" min={today} value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value); setBookingError("");
                      if (endDate && e.target.value > endDate) setEndDate("");
                    }}
                    className="booking-input"
                  />

                  <label className="booking-label">
                    End Date{" "}
                    <span style={{ color: "var(--tz-text-faint)", fontWeight: 400 }}>(same = 1 day)</span>
                  </label>
                  <input
                    type="date" min={startDate || today} value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setBookingError(""); }}
                    className="booking-input"
                  />

                  <div className="price-summary">
                    <div className="price-row">
                      <span className="price-label">Rate per day</span>
                      <span className="price-value">{lkr(guide.pricePerDay)}</span>
                    </div>
                    {days > 0 && (
                      <div className="price-row">
                        <span className="price-label">Number of days</span>
                        <span className="price-value">{days}</span>
                      </div>
                    )}
                    <hr className="price-divider" />
                    <div className="price-row">
                      <span className="price-total-label">{days > 0 ? "Estimated Total" : "Total"}</span>
                      <span className="price-total-value">{days > 0 ? lkr(totalPrice) : lkr(guide.pricePerDay)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={booking || !startDate || !endDate}
                    className="btn-3d-blue btn-3d-wide"
                  >
                    <span>
                      {booking ? "Sending Request..." : days > 1 ? `Book ${days} Days` : "Send Booking Request"}
                    </span>
                  </button>

                  <span className="booking-hint">Guide must confirm each day in your range</span>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default GuideDetailPage;