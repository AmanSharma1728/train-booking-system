import { Link } from "react-router-dom";
import "./Navbar.scss";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        🚆 TrainTick
      </Link>
      <div className="nav-links">
        <Link to="/search">Search</Link>
        <Link to="/login">Login</Link>
        <Link to="/register" className="register-btn">
          Register
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
