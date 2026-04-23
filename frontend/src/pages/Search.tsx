import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { Train as TrainIcon, Clock, ArrowRight, Filter, ChevronRight } from "lucide-react";
import SearchBar from "../components/SearchBar";
import type { Train } from "../types/Booking";
import "./Search.scss";

const Search = () => {
  const [searchParams] = useSearchParams();
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);

  const source = searchParams.get("source") || "";
  const destination = searchParams.get("destination") || "";
  const date = searchParams.get("date") || "";

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        setLoading(true);
        const data = await api.searchTrains(source, destination, date);
        setTrains(data);
      } catch (err) {
        console.error("Failed to fetch trains:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrains();
  }, [source, destination, date]);

  return (
    <div className="search-page">
      <div className="search-header-container">
        <div className="container">
          <SearchBar variant="standard" />
        </div>
      </div>

      <div className="search-content">
        <aside className="filters">
          <div className="filter-card card glass">
            <div className="filter-header">
              <Filter size={18} />
              <h3>Refine Search</h3>
            </div>

            <div className="filter-section">
              <h4>Availability</h4>
              <div className="filter-group">
                <label className="checkbox-item">
                  <input type="checkbox" />
                  <span>Available Only</span>
                </label>
              </div>
            </div>

            <div className="filter-section">
              <h4>Departure Time</h4>
              <div className="filter-group">
                <label className="checkbox-item">
                  <input type="checkbox" />
                  <span>Early Morning (00:00 - 06:00)</span>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" />
                  <span>Mid Day (06:00 - 12:00)</span>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" />
                  <span>Evening (12:00 - 18:00)</span>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" />
                  <span>Night (18:00 - 24:00)</span>
                </label>
              </div>
            </div>

            <div className="filter-section">
              <h4>Train Type</h4>
              <div className="filter-group">
                <label className="checkbox-item">
                  <input type="checkbox" />
                  <span>Rajdhani Express</span>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" />
                  <span>Shatabdi Express</span>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" />
                  <span>Duronto / Superfast</span>
                </label>
              </div>
            </div>

            <div className="filter-section">
              <h4>Class Preference</h4>
              <div className="filter-group grid-2">
                <label className="checkbox-item">
                  <input type="checkbox" />
                  <span>1A</span>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" />
                  <span>2A</span>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" />
                  <span>3A</span>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" />
                  <span>SL</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        <main className="results-list">
          <div className="results-meta">
            <h2>{source} <ArrowRight size={20} /> {destination}</h2>
            <p>{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} • {trains.length} Trains Found</p>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Fetching the best routes for you...</p>
            </div>
          ) : trains.length > 0 ? (
            trains.map((train) => (
              <div key={train.id} className="train-card card">
                <div className="train-info">
                  <div className="name-group">
                    <div className="icon">
                      <TrainIcon size={24} />
                    </div>
                    <div>
                      <h3>{train.name}</h3>
                      <span>#{train.number}</span>
                    </div>
                  </div>
                  
                  <div className="schedule">
                    <div className="time-node">
                      <span className="time">{train.departure}</span>
                      <span className="station">{train.src}</span>
                    </div>
                    <div className="duration-path">
                      <Clock size={14} />
                      <span>{train.duration}</span>
                      <div className="line"></div>
                    </div>
                    <div className="time-node text-right">
                      <span className="time">{train.arrival}</span>
                      <span className="station">{train.dest}</span>
                    </div>
                  </div>
                </div>

                <div className="inventory">
                  {Object.entries(train.inventory).map(([code, details]) => (
                    <button key={code} className="class-box">
                      <div className="class-header">
                        <span className="code">{code}</span>
                        <span className="price">₹{details?.price}</span>
                      </div>
                      <span className={`status ${details?.available ? 'available' : 'full'}`}>
                        {details?.available ? `${details.available} Available` : 'Sold Out'}
                      </span>
                    </button>
                  ))}
                  <button className="book-btn btn-primary">
                    Book Now
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results card">
              <TrainIcon size={48} />
              <h3>No Trains Found</h3>
              <p>We couldn't find any trains for this route and date. Try a different search.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Search;
