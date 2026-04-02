import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { useAuth } from "../../../auth/AuthContext";
import {
  Star, Pencil, Trash2, Plus, X, CheckCircle, AlertCircle,
  MapPin, Calendar, User as UserIcon, Building2
} from "lucide-react";

function StarRating({ value, onChange, readOnly = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onClick={() => !readOnly && onChange && onChange(n)}
          className={`transition ${readOnly ? "cursor-default" : "hover:scale-110"}`}>
          <Star size={18}
            className={n <= value ? "text-amber-400 fill-amber-400" : "text-slate-300"} />
        </button>
      ))}
    </div>
  );
}

// ── Group consecutive bookings for the same guide (same logic as PaymentsPage) ──
function groupBookings(bookings) {
  if (!bookings || bookings.length === 0) return [];

  const sorted = [...bookings].sort((a, b) => {
    const timeDiff = new Date(a.createdAt) - new Date(b.createdAt);
    if (timeDiff !== 0) return timeDiff;
    return a.bookingDate < b.bookingDate ? -1 : 1;
  });

  const groups = [];
  let current = null;

  for (const booking of sorted) {
    const created = new Date(booking.createdAt).getTime();
    const guideName = booking.guideName || "—";

    const withinWindow =
      current &&
      current.guideName === guideName &&
      Math.abs(created - current.firstCreatedAt) < 15000; // 15s window

    if (withinWindow) {
      current.bookings.push(booking);
      if (booking.bookingDate < current.startDate) current.startDate = booking.bookingDate;
      if (booking.bookingDate > current.endDate)   current.endDate   = booking.bookingDate;
      // Group is already reviewed only if ALL individual bookings have been reviewed
      // But since we submit one review per group using primaryBookingId,
      // mark alreadyReviewed true only if the primary booking is reviewed
    } else {
      if (current) groups.push(current);
      current = {
        // Use the earliest bookingId as the primary — this is what gets sent as guideBookingId
        primaryBookingId:  booking.guideBookingId,
        guideName:         guideName,
        guideLocation:     booking.guideLocation || "",
        startDate:         booking.bookingDate,
        endDate:           booking.bookingDate,
        firstCreatedAt:    created,
        bookings:          [booking],
        alreadyReviewed:   booking.alreadyReviewed || false,
        bookingDate:       booking.bookingDate,
      };
    }
  }
  if (current) groups.push(current);

  return groups;
}

function GuideBookingOption({ group, selected, onSelect }) {
  const isMultiDay = group.startDate !== group.endDate;
  const dayCount   = group.bookings.length;

  return (
    <button type="button" onClick={() => onSelect(group)}
      className={`w-full text-left p-3 rounded-xl border transition ${
        selected
          ? "border-amber-400 bg-amber-50"
          : group.alreadyReviewed
          ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
          : "border-slate-200 hover:border-amber-300 hover:bg-amber-50/50"
      }`}
      disabled={group.alreadyReviewed && !selected}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
            <UserIcon size={14} className="text-teal-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              {group.guideName}
              {isMultiDay && (
                <span className="bg-indigo-50 text-indigo-600 border border-indigo-200 px-1.5 py-0.5 rounded-md text-xs font-semibold">
                  {dayCount} days
                </span>
              )}
            </p>
            {group.guideLocation && (
              <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                <MapPin size={10} />
                <span>{group.guideLocation}</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          {group.alreadyReviewed ? (
            <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
              Reviewed ✓
            </span>
          ) : (
            <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">
              Completed
            </span>
          )}
          <div className="flex items-center gap-1 text-slate-400 text-xs mt-1 justify-end">
            <Calendar size={10} />
            <span>
              {isMultiDay
                ? `${group.startDate} → ${group.endDate}`
                : group.startDate}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function ReservationOption({ reservation, selected, onSelect }) {
  return (
    <button type="button" onClick={() => onSelect(reservation)}
      className={`w-full text-left p-3 rounded-xl border transition ${
        selected
          ? "border-amber-400 bg-amber-50"
          : reservation.alreadyReviewed
          ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
          : "border-slate-200 hover:border-amber-300 hover:bg-amber-50/50"
      }`}
      disabled={reservation.alreadyReviewed && !selected}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Building2 size={14} className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{reservation.hotelName}</p>
            {reservation.hotelLocation && (
              <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                <MapPin size={10} />
                <span>{reservation.hotelLocation}</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          {reservation.alreadyReviewed ? (
            <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
              Reviewed ✓
            </span>
          ) : (
            <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">
              Completed
            </span>
          )}
          {reservation.checkInDate && (
            <div className="flex items-center gap-1 text-slate-400 text-xs mt-1 justify-end">
              <Calendar size={10} />
              <span>
                {new Date(reservation.checkInDate).toLocaleDateString()} –{" "}
                {new Date(reservation.checkOutDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const isTourist = user?.role === "TOURIST";
  const isGuide   = user?.role === "GUIDE";

  const [reviews, setReviews]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");
  const [showForm, setShowForm]         = useState(false);
  const [editingId, setEditingId]       = useState(null);
  const [deleting, setDeleting]         = useState(null);
  const [submitting, setSubmitting]     = useState(false);

  // ── Grouped bookings + raw reservations ────────────────────────────────
  const [groupedBookings, setGroupedBookings] = useState([]);
  const [reviewableResv, setReviewableResv]   = useState([]);
  const [loadingOptions, setLoadingOptions]   = useState(false);

  const [form, setForm] = useState({
    type: "GUIDE_BOOKING",
    selectedGroup: null,         // ← a group object (may contain multiple bookings)
    selectedReservation: null,
    rating: 5,
    comment: "",
  });

  const endpoint = isTourist
    ? "/api/reviews/my-reviews"
    : isGuide
    ? "/api/reviews/guide-reviews"
    : "/api/reviews/hotel-reviews";

  const fetchReviews = () => {
    setLoading(true);
    api.get(endpoint)
      .then(res => setReviews(res.data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  // ── Fetch reviewable items and group guide bookings ────────────────────
  const fetchOptions = () => {
    if (!isTourist) return;
    setLoadingOptions(true);
    Promise.all([
      api.get("/api/reviews/reviewable-guide-bookings"),
      api.get("/api/reviews/reviewable-reservations"),
    ])
      .then(([b, r]) => {
        // ── Group individual day-bookings into multi-day trip groups ──────
        const raw = b.data || [];
        const groups = groupBookings(raw);

        // A group is "alreadyReviewed" if its primary booking has been reviewed.
        // The backend marks alreadyReviewed on the individual rows.
        // We check the first booking in the group as the primary.
        const markedGroups = groups.map(g => ({
          ...g,
          alreadyReviewed: g.bookings[0]?.alreadyReviewed || false,
        }));

        setGroupedBookings(markedGroups);
        setReviewableResv(r.data || []);
      })
      .catch(() => {})
      .finally(() => setLoadingOptions(false));
  };

  useEffect(() => { fetchReviews(); }, []);

  const resetForm = () => {
    setForm({
      type: "GUIDE_BOOKING",
      selectedGroup: null,
      selectedReservation: null,
      rating: 5,
      comment: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const openForm = () => {
    resetForm();
    setShowForm(true);
    fetchOptions();
    setError(""); setSuccess("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(""); setSuccess(""); setSubmitting(true);

    if (!editingId) {
      if (form.type === "GUIDE_BOOKING" && !form.selectedGroup) {
        setError("Please select a guide booking to review.");
        setSubmitting(false); return;
      }
      if (form.type === "HOTEL_RESERVATION" && !form.selectedReservation) {
        setError("Please select a hotel reservation to review.");
        setSubmitting(false); return;
      }
    }

    try {
      if (editingId) {
        await api.put(`/api/reviews/${editingId}`, { rating: form.rating, comment: form.comment });
        setSuccess("Review updated!");
      } else {
        const body = {
          rating:          form.rating,
          comment:         form.comment,
          // ── Send the primaryBookingId of the group (earliest booking in range) ──
          guideBookingId:  form.type === "GUIDE_BOOKING"
            ? form.selectedGroup.primaryBookingId
            : null,
          reservationId:   form.type === "HOTEL_RESERVATION"
            ? form.selectedReservation.reservationId
            : null,
        };
        await api.post("/api/reviews", body);
        setSuccess("Review submitted!");
      }
      resetForm();
      fetchReviews();
      fetchOptions();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit review.");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this review?")) return;
    setDeleting(id); setError(""); setSuccess("");
    try {
      await api.delete(`/api/reviews/${id}`);
      setSuccess("Review deleted.");
      fetchReviews();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete review.");
    } finally { setDeleting(null); }
  };

  const handleEdit = review => {
    setEditingId(review.id);
    setForm(p => ({ ...p, rating: review.rating, comment: review.comment || "" }));
    setShowForm(true);
    setError(""); setSuccess("");
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  const pendingGuideCount = groupedBookings.filter(g => !g.alreadyReviewed).length;
  const pendingHotelCount = reviewableResv.filter(r => !r.alreadyReviewed).length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            {isTourist ? "My Reviews" : isGuide ? "Reviews Received" : "Hotel Reviews"}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {isTourist
              ? "Reviews you left for guides and hotels"
              : isGuide
              ? "Feedback tourists left after their tours"
              : "Feedback tourists left about your hotels"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {reviews.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-center">
              <p className="text-xs text-slate-400">Avg Rating</p>
              <p className="text-xl font-black text-amber-500">{avgRating} ★</p>
            </div>
          )}
          {isTourist && (
            <button
              onClick={showForm ? resetForm : openForm}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition relative"
            >
              {showForm && !editingId ? <X size={16} /> : <Plus size={16} />}
              {showForm && !editingId ? "Cancel" : "Add Review"}
              {!showForm && (pendingGuideCount + pendingHotelCount) > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {pendingGuideCount + pendingHotelCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Alerts ──────────────────────────────────────────────────────── */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
          <CheckCircle size={15} />{success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
          <AlertCircle size={15} />{error}
        </div>
      )}

      {/* ── Review Form ─────────────────────────────────────────────────── */}
      {showForm && isTourist && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 mb-5">
            {editingId ? "Edit Review" : "New Review"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Type selector */}
            {!editingId && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Review For</label>
                <div className="flex gap-2">
                  {["GUIDE_BOOKING", "HOTEL_RESERVATION"].map(t => (
                    <button key={t} type="button"
                      onClick={() => setForm(p => ({
                        ...p, type: t,
                        selectedGroup: null,
                        selectedReservation: null,
                      }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                        form.type === t
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-white text-slate-600 border-slate-200 hover:border-amber-300"
                      }`}>
                      {t === "GUIDE_BOOKING" ? <UserIcon size={14} /> : <Building2 size={14} />}
                      {t === "GUIDE_BOOKING" ? "Guide" : "Hotel"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Item selector */}
            {!editingId && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {form.type === "GUIDE_BOOKING"
                    ? `Select a Guide (${groupedBookings.length} completed trip${groupedBookings.length !== 1 ? "s" : ""})`
                    : `Select a Hotel (${reviewableResv.length} completed stay${reviewableResv.length !== 1 ? "s" : ""})`}
                </label>

                {loadingOptions ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    Loading your completed {form.type === "GUIDE_BOOKING" ? "tours" : "stays"}...
                  </div>
                ) : form.type === "GUIDE_BOOKING" ? (
                  groupedBookings.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-2xl border border-slate-100">
                      <UserIcon size={24} className="mx-auto mb-2 text-slate-300" />
                      No completed guide tours to review yet.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {groupedBookings.map(group => (
                        <GuideBookingOption
                          key={group.primaryBookingId}
                          group={group}
                          selected={form.selectedGroup?.primaryBookingId === group.primaryBookingId}
                          onSelect={sel => !sel.alreadyReviewed && setForm(p => ({ ...p, selectedGroup: sel }))}
                        />
                      ))}
                    </div>
                  )
                ) : (
                  reviewableResv.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-2xl border border-slate-100">
                      <Building2 size={24} className="mx-auto mb-2 text-slate-300" />
                      No completed hotel stays to review yet.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {reviewableResv.map(r => (
                        <ReservationOption key={r.reservationId} reservation={r}
                          selected={form.selectedReservation?.reservationId === r.reservationId}
                          onSelect={sel => !sel.alreadyReviewed && setForm(p => ({ ...p, selectedReservation: sel }))} />
                      ))}
                    </div>
                  )
                )}

                {/* Selection confirmation chip */}
                {(form.selectedGroup || form.selectedReservation) && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                    <CheckCircle size={14} />
                    Reviewing:{" "}
                    <span className="font-semibold">
                      {form.selectedGroup?.guideName || form.selectedReservation?.hotelName}
                    </span>
                    {form.selectedGroup?.bookings?.length > 1 && (
                      <span className="text-emerald-500 text-xs">
                        · {form.selectedGroup.bookings.length}-day trip
                      </span>
                    )}
                    <button type="button"
                      onClick={() => setForm(p => ({ ...p, selectedGroup: null, selectedReservation: null }))}
                      className="ml-auto text-emerald-400 hover:text-emerald-600">
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Your Rating</label>
              <div className="flex items-center gap-3">
                <StarRating value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} />
                <span className="text-sm text-slate-500 font-medium">
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][form.rating]}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Comment (optional)
              </label>
              <textarea rows={3} value={form.comment}
                onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                placeholder="Share your experience..."
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-amber-400 text-sm resize-none" />
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button type="submit" disabled={submitting}
                className="bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition">
                {submitting ? "Saving..." : editingId ? "Update Review" : "Submit Review"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ── Review List ─────────────────────────────────────────────────── */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
          <Star size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600 font-semibold">No reviews yet</p>
          <p className="text-slate-400 text-sm mt-1">
            {isTourist
              ? "Complete a tour or stay and leave your first review."
              : "Tourist feedback will appear here after completed bookings."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center font-bold text-amber-600 flex-shrink-0">
                    {r.touristName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{r.touristName}</p>
                    <p className="text-slate-400 text-xs">
                      {r.guideBookingId
                        ? `Guide Booking #${r.guideBookingId}`
                        : `Hotel Reservation #${r.reservationId}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating value={r.rating} readOnly />
                  {isTourist && (
                    <>
                      <button onClick={() => handleEdit(r)}
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              {r.comment && (
                <p className="text-slate-600 text-sm mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                  {r.comment}
                </p>
              )}
              <p className="text-slate-400 text-xs mt-2">
                {new Date(r.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}