import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { 
  Calendar, 
  MapPin, 
  ArrowRight, 
  ChevronRight, 
  XCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Train as TrainIcon,
  Search
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import type { Ticket } from "../types/Booking";
import "./History.scss";

const History = () => {
  const [bookings, setBookings] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getHistory();
      // Sort by date descending
      const sorted = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setBookings(sorted);
    } catch (err) {
      console.error("Failed to fetch history:", err);
      showToast("Failed to load booking history", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      setCancelling(true);
      await api.cancelBooking(id);
      showToast("Booking cancelled successfully. Refund initiated.", "success");
      setShowCancelModal(null);
      fetchHistory(); // Refresh list
    } catch (err) {
      console.error("Cancellation failed:", err);
      showToast("Failed to cancel booking. Please try again.", "error");
    } finally {
      setCancelling(false);
    }
  };

  const isUpcoming = (date: string) => {
    const journeyDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return journeyDate >= today;
  };

  const filteredBookings = bookings.filter(b => {
    // Exclude abandoned holds and pending payments from the main history
    if (b.status === "SEAT_HELD" || b.status === "PAYMENT_PENDING") return false;
    
    if (b.status === "CANCELLED") return filter === "past";
    return filter === "upcoming" ? isUpcoming(b.date) : !isUpcoming(b.date);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "status-success";
      case "RAC":
      case "WAITLISTED": return "status-warning";
      case "CANCELLED": return "status-danger";
      case "PAYMENT_PENDING":
      case "SEAT_HELD": return "status-info";
      default: return "status-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED": return <CheckCircle2 size={14} />;
      case "RAC":
      case "WAITLISTED": return <Clock size={14} />;
      case "CANCELLED": return <XCircle size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="history-page loading">
        <div className="spinner"></div>
        <p>Retrieving your journeys...</p>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <div className="header-top">
          <h1>My Bookings</h1>
          <button className="btn-refresh" onClick={fetchHistory} title="Refresh Bookings">
            <Clock size={18} className={loading ? "spin" : ""} />
            Refresh
          </button>
        </div>
        <p>Manage your upcoming journeys and view past travel history.</p>
      </div>

      <div className="history-filters">
        <button 
          className={filter === "upcoming" ? "active" : ""} 
          onClick={() => setFilter("upcoming")}
        >
          Upcoming
        </button>
        <button 
          className={filter === "past" ? "active" : ""} 
          onClick={() => setFilter("past")}
        >
          Past & Cancelled
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="empty-history card">
          <div className="icon-box">
            <Search size={40} />
          </div>
          <h3>No bookings found</h3>
          <p>You haven't {filter === "upcoming" ? "any upcoming" : "past"} journeys yet.</p>
          <Link to="/search" className="btn-primary">
            <TrainIcon size={18} />
            Search Trains
          </Link>
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="booking-card card">
              <div className="card-top">
                <div className="train-info">
                  <div className={`status-badge ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    {booking.status}
                  </div>
                  <span className="date">
                    <Calendar size={14} />
                    {new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="pnr-info">
                  <label>PNR</label>
                  <span>{booking.pnr || "—"}</span>
                </div>
              </div>

              <div className="card-main">
                <div className="route">
                  <div className="station">
                    <span className="code">{(booking.src || "???").substring(0, 3).toUpperCase()}</span>
                    <span className="name">{booking.src || "Unknown Station"}</span>
                  </div>
                  <div className="path">
                    <div className="line"></div>
                    <ArrowRight size={16} />
                  </div>
                  <div className="station">
                    <span className="code">{(booking.dest || "???").substring(0, 3).toUpperCase()}</span>
                    <span className="name">{booking.dest || "Unknown Station"}</span>
                  </div>
                </div>

                <div className="details-grid">
                  <div className="detail">
                    <label>Train</label>
                    <span>{booking.trainName || "Express Train"}</span>
                  </div>
                  <div className="detail">
                    <label>Class</label>
                    <span>{booking.classCode}</span>
                  </div>
                  <div className="detail">
                    <label>Status Detail</label>
                    <span className={booking.status === 'CONFIRMED' ? 'highlight' : 'highlight-warn'}>
                      {booking.status === 'CONFIRMED' ? (booking.seatInfo || "B2-42") : (booking.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="btn-text"
                  onClick={() => navigate(`/confirmation/${booking.id}`)}
                >
                  View Details <ChevronRight size={16} />
                </button>
                
                {filter === "upcoming" && booking.status !== "CANCELLED" && (
                  <button 
                    className="btn-cancel"
                    onClick={() => setShowCancelModal(booking.id)}
                  >
                    Cancel Journey
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal card">
            <h2>Cancel Journey?</h2>
            <p>Are you sure you want to cancel your booking for PNR <strong>{bookings.find(b => b.id === showCancelModal)?.pnr || "Pending"}</strong>?</p>
            <div className="warning-box">
              <AlertCircle size={18} />
              <p>Refunds are processed within 5-7 business days to your original payment method.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowCancelModal(null)}
                disabled={cancelling}
              >
                Go Back
              </button>
              <button 
                className="btn-danger" 
                onClick={() => handleCancel(showCancelModal)}
                disabled={cancelling}
              >
                {cancelling ? "Processing..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
