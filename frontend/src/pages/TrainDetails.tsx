import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../services/api";
import { Train as TrainIcon, User, ArrowRight, ShieldCheck } from "lucide-react";
import type { Train, ClassCode } from "../types/Booking";
import "./TrainDetails.scss";

const TrainDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [train] = useState<Train | null>(location.state?.train || null);
  const [selectedClass, setSelectedClass] = useState<ClassCode | null>(null);
  
  const [passengers, setPassengers] = useState<Array<{
    id: string;
    name: string;
    age: string;
    gender: "male" | "female" | "other" | "";
  }>>([{
    id: Math.random().toString(36).substr(2, 9),
    name: "",
    age: "",
    gender: ""
  }]);

  const [isHolding, setIsHolding] = useState(false);

  const addPassenger = () => {
    setPassengers([...passengers, {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      age: "",
      gender: ""
    }]);
  };

  const removePassenger = (id: string) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter(p => p.id !== id));
    }
  };

  const updatePassenger = (id: string, field: string, value: string) => {
    setPassengers(passengers.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const [validationError, setValidationError] = useState("");

  const handleHoldSeat = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn("User not authenticated. Redirecting to login...");
      navigate('/login', { state: { from: location.pathname, train } });
      return;
    }

    if (!selectedClass) {
      setValidationError("Please select a travel class before continuing.");
      setTimeout(() => setValidationError(""), 3000);
      return;
    }

    if (passengers.some(p => !p.name || !p.age || !p.gender)) {
      setValidationError("Please fill in all passenger details (Name, Age, Gender).");
      setTimeout(() => setValidationError(""), 3000);
      return;
    }
    
    try {
      setIsHolding(true);
      console.log("Initiating seat hold...", { trainId: train.id, selectedClass, passengers });
      
      const response = await api.holdSeat({
        trainId: train.id,
        classCode: selectedClass,
        passengers: passengers.map(p => ({
          name: p.name,
          age: parseInt(p.age),
          gender: (p.gender as any) || "male"
        })),
        bookingDate: train.date || new Date().toISOString().split('T')[0],
        requestedSeats: passengers.length
      });
      
      console.log("Hold successful:", response);
      localStorage.setItem('currentHold', JSON.stringify({
        ...response,
        passengersCount: passengers.length,
        totalFare: (train.inventory[selectedClass]?.price || 0) * passengers.length
      }));
      
      navigate('/payment');
    } catch (err) {
      console.error("Hold failed:", err);
      setValidationError("This seat is no longer available. Please try another class.");
      setTimeout(() => setValidationError(""), 3000);
    } finally {
      setIsHolding(false);
    }
  };

  if (!train) {
    return (
      <div className="error-screen">
        <p>No train data found. Please go back to search.</p>
        <button className="btn-primary" onClick={() => navigate('/search')}>Go to Search</button>
      </div>
    );
  }

  const totalPrice = (train.inventory[selectedClass || 'SL']?.price || 0) * passengers.length;

  const isFormValid = selectedClass && !passengers.some(p => !p.name || !p.age || !p.gender);

  return (
    <div className="train-details-page">
      <div className="booking-stepper">
        <div className="step active"><span>1</span> Selection</div>
        <div className="line"></div>
        <div className="step"><span>2</span> Payment</div>
        <div className="line"></div>
        <div className="step"><span>3</span> Confirmation</div>
      </div>

      <div className="details-container">
        <main className="selection-form">
          <section className="train-header-section">
            <div className="section-header">
              <div className="section-icon">
                <TrainIcon size={24} />
              </div>
              <div className="train-meta">
                <h2>{train.name}</h2>
                <span>Train #{train.number} • Runs Daily</span>
              </div>
            </div>
            
            <div className="route-card card">
              <div className="route-info">
                <div className="node">
                  <span className="time">{train.departure}</span>
                  <span className="city">{train.src}</span>
                </div>
                <div className="path">
                  <span className="duration">{train.duration}</span>
                  <div className="line-wrapper">
                    <ArrowRight size={18} />
                  </div>
                </div>
                <div className="node text-right">
                  <span className="time">{train.arrival}</span>
                  <span className="city">{train.dest}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="class-selection">
            <div className="section-header">
              <div className="section-icon">
                <ShieldCheck size={20} />
              </div>
              <h2>Select Travel Class</h2>
            </div>
            <div className="class-grid">
              {(Object.entries(train.inventory) as [ClassCode, { available: number; price: number }][]).map(([code, details]) => (
                <div 
                  key={code} 
                  className={`class-card card ${selectedClass === code ? 'selected' : ''} ${!details.available ? 'disabled' : ''}`}
                  onClick={() => details.available && setSelectedClass(code)}
                >
                  <div className="header">
                    <span className="code">{code}</span>
                    <span className="price">₹{details.price}</span>
                  </div>
                  <div className="status">
                    {details.available ? `${details.available} Seats Left` : 'Sold Out'}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="passenger-section">
            <div className="section-header">
              <div className="section-icon">
                <User size={20} />
              </div>
              <h2>Passenger Details</h2>
              <button className="btn-add" onClick={addPassenger}>+ Add Passenger</button>
            </div>
            
            <div className="passengers-list">
              {passengers.map((p, index) => (
                <div key={p.id} className="passenger-card card">
                  <div className="passenger-header">
                    <span>Passenger {index + 1}</span>
                    {passengers.length > 1 && (
                      <button className="btn-remove" onClick={() => removePassenger(p.id)}>Remove</button>
                    )}
                  </div>
                  <div className="form-grid">
                    <div className="input-group">
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Enter passenger name"
                        value={p.name}
                        onChange={(e) => updatePassenger(p.id, "name", e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label>Age</label>
                      <input 
                        type="number" 
                        placeholder="Age"
                        value={p.age}
                        onChange={(e) => updatePassenger(p.id, "age", e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label>Gender</label>
                      <select 
                        value={p.gender}
                        onChange={(e) => updatePassenger(p.id, "gender", e.target.value)}
                      >
                        <option value="" disabled>Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className="booking-summary">
          <div className="summary-card card glass">
            <h3>Fare Summary</h3>
            {selectedClass ? (
              <div className="price-breakdown">
                <div className="row">
                  <span>Base Fare ({selectedClass} × {passengers.length})</span>
                  <span>₹{train.inventory[selectedClass]?.price * passengers.length}</span>
                </div>
                <div className="row">
                  <span>Service Tax</span>
                  <span>₹0</span>
                </div>
                <div className="row total">
                  <span>Total Amount</span>
                  <span>₹{totalPrice}</span>
                </div>
              </div>
            ) : (
              <p className="hint">Select a class to see pricing</p>
            )}

            <div className="security-note">
              <ShieldCheck size={16} />
              <p>Seats are held for 10 minutes once you click book.</p>
            </div>

            {validationError && (
              <div className="inline-error">
                {validationError}
              </div>
            )}

            <button 
              className={`btn-primary w-full ${isHolding ? 'loading' : ''} ${!isFormValid ? 'disabled-ui' : ''}`}
              onClick={handleHoldSeat}
              disabled={isHolding}
            >
              {isHolding ? 'Processing...' : 'Continue to Payment'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TrainDetails;
