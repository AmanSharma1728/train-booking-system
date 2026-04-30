import "./App.scss";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Search from "./pages/Search";
import TrainDetails from "./pages/TrainDetails";
import Payment from "./pages/Payment";
import Register from "./pages/Register";
import Confirmation from "./pages/Confirmation";
import Profile from "./pages/Profile";
import History from "./pages/History";

const App = () => {
  return (
    <Router>
      <ToastProvider>
        <div className="app">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<Search />} />
              <Route path="/train/:id" element={<TrainDetails />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/confirmation/:id" element={<Confirmation />} />
              <Route path="/bookings" element={<History />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </Router>
  );
};

export default App;
