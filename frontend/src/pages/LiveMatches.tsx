import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Match } from "../types";

const leagueOptions = ["Premier League", "La Liga", "Ligat HaAl"] as const;

const LiveMatches = () => {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [activeLeague, setActiveLeague] =
    useState<(typeof leagueOptions)[number]>("Premier League");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get<Match[]>(
          `/matches/live?league=${encodeURIComponent(activeLeague)}`
        );
        setLiveMatches(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "שגיאה בטעינת משחקים חיים");
      }
    };

    void load();
    const interval = setInterval(() => {
      void load();
    }, 30000);

    return () => clearInterval(interval);
  }, [activeLeague]);

  return (
    <section className="live-page">
      <h2>תוצאות LIVE לפי ליגה</h2>
      <p>המסך מתעדכן אוטומטית כל 30 שניות.</p>

      <div className="league-tabs">
        {leagueOptions.map((league) => (
          <button
            key={league}
            className={activeLeague === league ? "" : "secondary-btn"}
            onClick={() => setActiveLeague(league)}
          >
            {league}
          </button>
        ))}
      </div>

      {liveMatches.map((match) => (
        <article className="card match-card" key={match.id}>
          <div className="match-headline">
            <span>{match.homeTeam?.name}</span>
            <span className="score-chip">
              {match.homeScore} - {match.awayScore}
            </span>
            <span>{match.awayTeam?.name}</span>
          </div>
          <p>
            ליגה: {match.league} | סטטוס: {match.status}
          </p>
          <div className="events-list">
            {match.events.map((event) => (
              <p key={event.id}>
                {event.minute}' {event.type} - {event.playerName}
              </p>
            ))}
          </div>
        </article>
      ))}
      {liveMatches.length === 0 && <p>אין משחקים חיים כרגע.</p>}
      {error && <p>{error}</p>}
    </section>
  );
};

export default LiveMatches;
