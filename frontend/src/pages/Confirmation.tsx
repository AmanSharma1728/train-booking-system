import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { CheckCircle2, Ticket as TicketIcon, MapPin, Calendar, Clock, Download, Home, ShieldCheck, QrCode } from "lucide-react";
import type { Ticket as TicketType } from "../types/Booking";
import "./Confirmation.scss";

const Confirmation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<TicketType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchBooking = async () => {
      try {
        const data = await api.getBooking(id);
        setBooking(data);
      } catch (err) {
        console.error("Failed to fetch booking:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="confirmation-page loading">
        <div className="spinner"></div>
        <p>Generating Your Secure Ticket...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="confirmation-page error">
        <h2>Ticket Retrieval Failed</h2>
        <p>We couldn't locate this booking. It may still be processing or expired.</p>
        <Link to="/" className="btn-primary">Return to Dashboard</Link>
      </div>
    );
  }

  // Mock Coach and Seat Assignment if missing
  const coach = "B2";
  const startSeat = 42;

  return (
    <div className="confirmation-page">
      <div className="conf-header">
        <div className="success-badge">
          <ShieldCheck size={18} />
          <span>Verified Transaction Success</span>
        </div>
        <h1>Your journey is confirmed.</h1>
        <p>Please keep this digital pass ready for inspection during your journey.</p>
      </div>

      <div className="ticket-wrapper">
        <div className="ticket-card auth-ticket">
          {/* Top Branding Bar */}
          <div className="ticket-branding">
            <div className="logo-group">
              <span className="logo-icon">🚅</span>
              <span className="logo-text">TrainTick <span>Official Pass</span></span>
            </div>
            <div className="pnr-box">
              <label>PNR NUMBER</label>
              <span className="pnr-val">{booking.pnr || "842-9951"}</span>
            </div>
          </div>

          <div className="ticket-main">
            <div className="watermark">🚅</div>
            
            <div className="route-overview">
              <div className="station from">
                <span className="code">{booking.src.substring(0, 4).toUpperCase()}</span>
                <span className="time">{booking.departure}</span>
                <span className="city">{booking.src}</span>
              </div>
              <div className="journey-path">
                <div className="line"></div>
                <TicketIcon size={24} className="path-icon" />
              </div>
              <div className="station to">
                <span className="code">{booking.dest.substring(0, 4).toUpperCase()}</span>
                <span className="time">{booking.arrival}</span>
                <span className="city">{booking.dest}</span>
              </div>
            </div>

            <div className="meta-grid">
              <div className="meta-item">
                <label><Calendar size={12} /> JOURNEY DATE</label>
                <span>{new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="meta-item">
                <label><Clock size={12} /> CLASS & QUOTA</label>
                <span>{booking.classCode} • General</span>
              </div>
              <div className="meta-item">
                <label><MapPin size={12} /> COACH & SEAT</label>
                <span>{coach} / {startSeat}{booking.passengers.length > 1 ? ` - ${startSeat + booking.passengers.length - 1}` : ''}</span>
              </div>
            </div>

            <div className="passenger-manifest">
              <label>PASSENGER MANIFEST</label>
              <div className="manifest-table">
                {booking.passengers.map((p, i) => (
                  <div className="manifest-row" key={i}>
                    <span className="p-num">0{i+1}</span>
                    <span className="p-name">{p.name}</span>
                    <span className="p-age">{p.age} / {p.gender[0].toUpperCase()}</span>
                    <span className="p-status">CNF</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ticket-perforation">
            <div className="cut"></div>
          </div>

          <div className="ticket-footer-sec">
            <div className="footer-cols">
              <div className="qr-col">
                <div className="qr-box">
                  <QrCode size={64} strokeWidth={1.5} />
                </div>
                <span className="scan-text">SCAN FOR VALIDITY</span>
              </div>
              
              <div className="billing-col">
                <div className="bill-item">
                  <label>Base Fare</label>
                  <span>₹{booking.totalFare}</span>
                </div>
                <div className="bill-item">
                  <label>Taxes & Fees</label>
                  <span>₹45</span>
                </div>
                <div className="bill-total">
                  <label>TOTAL PAID</label>
                  <span>₹{booking.totalFare + 45}</span>
                </div>
              </div>
            </div>
            
            <div className="fine-print">
              * This is a computer generated E-Ticket and does not require a physical signature. 
              Please carry a valid Photo ID during travel. Standard cancellations apply.
            </div>
          </div>
        </div>
      </div>

      <div className="conf-actions no-print">
        <button className="btn-action primary shine" onClick={() => window.print()}>
          <Download size={18} />
          Print Digital Pass
        </button>
        <button className="btn-action secondary" onClick={() => navigate('/')}>
          <Home size={18} />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Confirmation;
