import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="container hero">
      <div className="hero-box">
        <h1>Discover Sri Lanka with TravelZone</h1>
        <p>Search trusted guides, explore hotels, and manage bookings in one place.</p>
        <div className="hero-actions">
          <Link to="/guides" className="link-btn">Explore Guides</Link>
          <Link to="/hotels" className="link-btn secondary">Browse Hotels</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
