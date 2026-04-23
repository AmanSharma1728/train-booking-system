import { Train, Shield, Clock } from "lucide-react";
import SearchBar from "../components/SearchBar";
import "./Home.scss";

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <div className="badge">Official Railway Booking Portal</div>
          <h1>Experience the Future of <span>Railway Travel.</span></h1>
          <p>Book tickets, track trains, and manage your journey with our state-of-the-art transit system.</p>
          
          <SearchBar variant="glass" />
        </div>
      </section>

      <section className="features">
        <div className="feature-item">
          <Clock className="feature-icon" />
          <h3>Real-time Updates</h3>
          <p>Get instant notifications on platform changes and delay alerts.</p>
        </div>
        <div className="feature-item">
          <Shield className="feature-icon" />
          <h3>Secure Bookings</h3>
          <p>Enterprise-grade encryption for all your transaction data.</p>
        </div>
        <div className="feature-item">
          <Train className="feature-icon" />
          <h3>Wide Coverage</h3>
          <p>Access over 5,000+ routes across the national railway network.</p>
        </div>
      </section>

      <section className="status-banner">
        <div className="status-indicator"></div>
        <p>System Status: <strong>All systems operational.</strong> Live data sync active.</p>
      </section>
    </div>
  );
};

export default Home;
