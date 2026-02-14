import { Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import LiveMatches from "./pages/LiveMatches";
import TeamHub from "./pages/TeamHub";
import Auth from "./pages/Auth";
import Predictions from "./pages/Predictions";
import Quiz from "./pages/Quiz";

const App = () => {
  return (
    <div className="app-shell">
      <header className="top-bar">
        <h1>Football App</h1>
        <nav>
          <Link to="/">בית</Link>
          <Link to="/live">לייב</Link>
          <Link to="/team">הקבוצה שלי</Link>
          <Link to="/quiz">חידונים</Link>
          <Link to="/predictions">תחזיות</Link>
          <Link to="/auth">התחברות</Link>
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
    </div>
  );
};

export default App;
