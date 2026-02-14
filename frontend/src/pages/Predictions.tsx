import { FormEvent, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Match } from "../types";

type Prediction = {
  id: number;
  matchId: number;
  userId: string;
  homeScorePrediction: number;
  awayScorePrediction: number;
  pointsEarned: number;
};

const Predictions = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [myPredictions, setMyPredictions] = useState<Prediction[]>([]);
  const [matchId, setMatchId] = useState<number>(0);
  const [homeScore, setHomeScore] = useState(1);
  const [awayScore, setAwayScore] = useState(1);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const upcoming = await api.get<Match[]>("/matches/upcoming");
      setMatches(upcoming);
      if (upcoming.length > 0) setMatchId(upcoming[0].id);
    };
    void load();
  }, []);

  const loadMine = async () => {
    const token = localStorage.getItem("football_token") ?? "";
    if (!token) {
      setMessage("נדרש להתחבר לצפייה בתחזיות שלך");
      return;
    }
    const mine = await api.get<Prediction[]>("/predictions/my", token);
    setMyPredictions(mine);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    const token = localStorage.getItem("football_token") ?? "";
    if (!token) {
      setMessage("נדרש להתחבר כדי לשמור תחזית");
      return;
    }

    await api.post(
      "/predictions",
      {
        matchId,
        homeScorePrediction: homeScore,
        awayScorePrediction: awayScore
      },
      token
    );
    setMessage("התחזית נשמרה");
    await loadMine();
  };

  return (
    <section>
      <h2>תחזיות</h2>
      <form className="form" onSubmit={onSubmit}>
        <label>
          משחק
          <select value={matchId} onChange={(e) => setMatchId(Number(e.target.value))}>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                #{match.id} - {match.homeTeam?.name ?? match.homeTeamId} מול{" "}
                {match.awayTeam?.name ?? match.awayTeamId}
              </option>
            ))}
          </select>
        </label>

        <label>
          שערים בית
          <input
            type="number"
            min={0}
            max={20}
            value={homeScore}
            onChange={(e) => setHomeScore(Number(e.target.value))}
          />
        </label>

        <label>
          שערים חוץ
          <input
            type="number"
            min={0}
            max={20}
            value={awayScore}
            onChange={(e) => setAwayScore(Number(e.target.value))}
          />
        </label>

        <button type="submit">שמור תחזית</button>
      </form>

      <button className="secondary-btn" onClick={() => void loadMine()}>
        טען תחזיות שלי
      </button>

      <div className="card-grid">
        {myPredictions.map((prediction) => (
          <article className="card" key={prediction.id}>
            <strong>משחק #{prediction.matchId}</strong>
            <p>
              תחזית: {prediction.homeScorePrediction}-{prediction.awayScorePrediction}
            </p>
            <p>נקודות: {prediction.pointsEarned}</p>
          </article>
        ))}
      </div>

      {message && <p>{message}</p>}
    </section>
  );
};

export default Predictions;
