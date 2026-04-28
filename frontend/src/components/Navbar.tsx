import { useRef, useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Ticket } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.scss";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    localStorage.removeItem("currentHold");
    navigate("/");
  };

  const avatarLetter = user?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <span className="icon">🚅</span>
        TrainTick
      </Link>

      <div className="nav-links">
        <Link to="/search" className="nav-item">Search</Link>

        {user ? (
          <>
            <Link to="/bookings" className="nav-item">
              <Ticket size={14} />
              Bookings
            </Link>

            {/* Avatar + Dropdown */}
            <div className="avatar-wrapper" ref={dropdownRef}>
              <button
                id="avatar-toggle"
                className="avatar-circle"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-label="User menu"
                aria-expanded={dropdownOpen}
              >
                {avatarLetter}
              </button>

              {dropdownOpen && (
                <div className="avatar-dropdown" role="menu">
                  <div className="dropdown-user-info">
                    <span className="dropdown-name">{user.name}</span>
                    <span className="dropdown-email">{user.email}</span>
                  </div>
                  <div className="dropdown-divider" />
                  <Link
                    to="/profile"
                    className="dropdown-item"
                    role="menuitem"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={14} />
                    View Profile
                  </Link>
                  <button
                    className="dropdown-item dropdown-item--danger"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-item">Login</Link>
            <Link to="/register" className="register-btn">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
