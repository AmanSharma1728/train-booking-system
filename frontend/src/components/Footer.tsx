import { Link } from "react-router-dom";
import "./Footer.scss";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h2 className="footer-logo">🚆 TrainTick</h2>
          <p>Official railway ticketing portal. Providing reliable and secure travel solutions since 2026.</p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/search">Search Trains</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Support & Legal</h3>
          <ul>
            <li><a href="#help">Help Center</a></li>
            <li><a href="#safety">Travel Safety</a></li>
            <li><a href="#terms">Terms of Service</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>123 Railway Plaza, Central District</p>
          <p>New Delhi, 110001</p>
          <p>Email: <strong>support@traintick.gov</strong></p>
          <p>Helpline: <strong>1800-TRAIN-TICK</strong></p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 TrainTick National Railways. All rights reserved.</p>
        <div className="footer-bottom-links">
          <span>Official Government Portal</span>
          <div className="pulse-indicator"></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
