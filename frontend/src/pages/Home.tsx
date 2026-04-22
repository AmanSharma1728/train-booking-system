import { Link } from "react-router-dom";
import { Search, Train, Shield, Clock } from "lucide-react";
import "./Home.scss";

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1>Reliable Train Travel, Simplified.</h1>
          <p>The official portal for seamless railway bookings and real-time transit data.</p>
          
          <div className="search-card">
            <div className="search-inputs">
              <div className="input-group">
                <label>From</label>
                <input type="text" placeholder="Departure Station" defaultValue="New Delhi" />
              </div>
              <div className="input-group">
                <label>To</label>
                <input type="text" placeholder="Arrival Station" defaultValue="Mumbai Central" />
              </div>
              <div className="input-group">
                <label>Travel Date</label>
                <input type="date" defaultValue="2026-05-10" />
              </div>
            </div>
            <Link to="/search" className="search-btn">
              <Search size={20} />
              Search Trains
            </Link>
          </div>
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
