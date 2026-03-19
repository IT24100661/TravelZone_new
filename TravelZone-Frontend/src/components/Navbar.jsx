import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">TravelZone</Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/guides">Guides</Link>
          <Link to="/hotels">Hotels</Link>

          {!user && <Link to="/register">Register</Link>}
          {!user && <Link to="/login">Login</Link>}

          {user && <Link to={`/profile/${user.id}`}>Profile</Link>}
          {user?.role === "GUIDE" && <Link to="/guides/add">Guide Profile</Link>}
          {user?.role === "HOTEL_OWNER" && <Link to="/hotels/add">Add Hotel</Link>}
          {user && <button onClick={logout} className="logout-btn">Logout</button>}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
