import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { UserPlus, Mail, Lock, User, ShieldCheck } from "lucide-react";
import "./Login.scss";

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "male" as const
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        parseInt(formData.age),
        formData.gender
      );
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="icon">
            <UserPlus size={28} />
          </div>
          <h1>Join TrainTick</h1>
          <p>Create an account to start booking</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label><User size={14} /> Full Name</label>
            <input 
              type="text" 
              placeholder="John Doe" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="input-group">
            <label><Mail size={14} /> Email Address</label>
            <input 
              type="email" 
              placeholder="name@company.com" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="row" style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Age</label>
              <input 
                type="number" 
                placeholder="25" 
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                required
              />
            </div>
            <div className="input-group" style={{ flex: 1.5 }}>
              <label>Gender</label>
              <select 
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
                style={{
                  padding: '5px 12px',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  height: '42px',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label><Lock size={14} /> Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
            <LogIn size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

// Internal icon for button
const LogIn = ({ size }: { size: number }) => <ShieldCheck size={size} />;

export default Register;
