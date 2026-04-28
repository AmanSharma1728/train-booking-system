import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Mail, Users, CalendarDays, LogOut } from "lucide-react";
import "./Profile.scss";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    localStorage.removeItem("currentHold");
    navigate("/");
  };

  const avatarLetter = user.name.charAt(0).toUpperCase();

  const genderLabel: Record<string, string> = {
    male: "Male",
    female: "Female",
    other: "Other",
  };

  return (
    <div className="profile-page">
      <div className="profile-card">

        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">{avatarLetter}</div>
          <div className="profile-header-info">
            <h1 className="profile-name">{user.name}</h1>
            <span className="profile-badge">Passenger</span>
          </div>
        </div>

        {/* Details */}
        <div className="profile-details">
          <div className="detail-item">
            <span className="detail-icon"><User size={16} /></span>
            <div className="detail-body">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{user.name}</span>
            </div>
          </div>

          <div className="detail-item">
            <span className="detail-icon"><Mail size={16} /></span>
            <div className="detail-body">
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{user.email}</span>
            </div>
          </div>

          <div className="detail-item">
            <span className="detail-icon"><CalendarDays size={16} /></span>
            <div className="detail-body">
              <span className="detail-label">Age</span>
              <span className="detail-value">{user.age} years</span>
            </div>
          </div>

          <div className="detail-item">
            <span className="detail-icon"><Users size={16} /></span>
            <div className="detail-body">
              <span className="detail-label">Gender</span>
              <span className="detail-value">{genderLabel[user.gender] ?? "—"}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="profile-actions">
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
