import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createReservation, getHotelDetails } from "../../api/hotelApi";
import ReservationForm from "../../components/forms/ReservationForm";

const HotelDetailPage = () => {
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getHotelDetails(hotelId).then((res) => setHotel(res.data)).catch(console.error);
  }, [hotelId]);

  const handleReserve = async (payload) => {
    try {
      await createReservation({ ...payload, hotelId });
      setMessage("Reservation created successfully");
    } catch (err) {
      setMessage(err.response?.data?.message || "Reservation failed");
    }
  };

  if (!hotel) return <div className="container section">Loading...</div>;

  return (
    <div className="container section detail-layout">
      <div className="card detail-card">
        <h2>{hotel.name}</h2>
        <p>Location: {hotel.location}</p>
        <p>Description: {hotel.description}</p>
        <p>Facilities: {Array.isArray(hotel.facilities) ? hotel.facilities.join(", ") : hotel.facilities}</p>
        <p>Rating: {hotel.rating}</p>
      </div>

      <ReservationForm hotelId={hotelId} onSubmit={handleReserve} />
      {message && <p className="status-msg">{message}</p>}
    </div>
  );
};

export default HotelDetailPage;
