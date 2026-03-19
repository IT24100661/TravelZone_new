import { Link } from "react-router-dom";

const HotelCard = ({ hotel }) => {
  return (
    <div className="card item-card">
      <img
        src={hotel.thumbnail || hotel.imageUrl || "https://via.placeholder.com/400x220?text=Hotel"}
        alt={hotel.name}
        className="card-image"
      />
      <h3>{hotel.name}</h3>
      <p>{hotel.location}</p>
      <p>Rating: {hotel.rating ?? "N/A"}</p>
      <p>Price: {hotel.minPrice ?? hotel.price}</p>
      <Link to={`/hotels/${hotel.id || hotel.hotelId}`} className="link-btn">View Details</Link>
    </div>
  );
};

export default HotelCard;
