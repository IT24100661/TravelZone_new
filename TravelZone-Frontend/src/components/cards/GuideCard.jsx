import { Link } from "react-router-dom";

const GuideCard = ({ guide }) => {
  return (
    <div className="card item-card">
      <img
        src={guide.profilePhoto || "/guide-placeholder.jpg"}
        alt={guide.name}
        className="card-image"
        onError={(e) => {
          e.currentTarget.src = "/guide-placeholder.jpg";
        }}
      />

      <h3>{guide.name}</h3>
      <p>Languages: {Array.isArray(guide.languages) ? guide.languages.join(", ") : (guide.languages || "N/A")}</p>
      <p>Rating: {guide.rating ?? "N/A"}</p>
      <p>Price/Day: {guide.pricePerDay ?? "N/A"}</p>

      <Link to={`/guides/${guide.guideId || guide.id}`} className="link-btn">
        View Details
      </Link>
    </div>
  );
};

export default GuideCard;
