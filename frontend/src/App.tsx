import { NavLink, Route, Routes } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import LiveMatches from "./pages/LiveMatches";
import TeamHub from "./pages/TeamHub";
import Auth from "./pages/Auth";
import Predictions from "./pages/Predictions";
import Quiz from "./pages/Quiz";

const navItems = [
  { to: "/", label: "משחקים" },
  { to: "/live", label: "לייב" },
  { to: "/team", label: "הקבוצה שלי" },
  { to: "/quiz", label: "חידונים" },
  { to: "/predictions", label: "תחזיות" },
  { to: "/auth", label: "חשבון" }
] as const;

const App = () => {
  const [showImageLogo, setShowImageLogo] = useState(true);

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand-block">
          {showImageLogo ? (
            <img
              src="/goal-live-logo.png"
              alt="GOAL LIVE logo"
              className="brand-image-logo"
              onError={() => setShowImageLogo(false)}
            />
          ) : (
            <div className="brand-logo">GL</div>
          )}
          <div>
            <h1>GOAL LIVE</h1>
            <p>תוצאות, חדשות וליגות מובילות</p>
          </div>
        </div>
        <nav className="top-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/live" element={<LiveMatches />} />
          <Route path="/team" element={<TeamHub />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </main>

      <nav className="bottom-nav">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={`bottom-${item.to}`}
            to={item.to}
            className={({ isActive }) => (isActive ? "bottom-link active" : "bottom-link")}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default App;
