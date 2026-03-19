import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createGuideBooking, getGuideDetails } from "../../api/guideApi";
import BookingForm from "../../components/forms/BookingForm";

const GuideDetailPage = () => {
  const { guideId } = useParams();
  const [guide, setGuide] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getGuideDetails(guideId)
      .then((res) => setGuide(res.data))
      .catch((err) => {
        setMessage(err.response?.data?.message || "Failed to load guide details");
      });
  }, [guideId]);

  const handleBooking = async (payload) => {
    try {
      await createGuideBooking(payload);
      setMessage("Booking created successfully");
    } catch (err) {
      setMessage(err.response?.data?.message || "Booking failed");
    }
  };

  if (!guide) {
    return <div className="container section">Loading...</div>;
  }

  return (
    <div className="container section detail-layout">
      <div className="card detail-card">
        <img
          src={guide.profilePhoto || "/guide-placeholder.jpg"}
          alt={guide.name}
          className="card-image"
          onError={(e) => {
            e.currentTarget.src = "/guide-placeholder.jpg";
          }}
        />
        <h2>{guide.name}</h2>
        <p>Location: {guide.location}</p>
        <p>Experience: {guide.experienceYears} years</p>
        <p>Languages: {Array.isArray(guide.languages) ? guide.languages.join(", ") : "N/A"}</p>
        <p>Price/Day: {guide.pricePerDay}</p>
        <p>Rating: {guide.rating}</p>
        <p>{guide.bio}</p>
      </div>

      <div>
        <BookingForm
          guideId={guide.guideId}
          pricePerDay={guide.pricePerDay}
          onSubmit={handleBooking}
        />
        {message && <p className="status-msg">{message}</p>}
      </div>
    </div>
  );
};

export default GuideDetailPage;
