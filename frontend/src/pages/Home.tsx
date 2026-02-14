import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Match, NewsArticle } from "../types";

const featuredLeagues = ["Premier League", "La Liga", "Ligat HaAl"];

const Home = () => {
  const [liveMatchesByLeague, setLiveMatchesByLeague] = useState<Record<string, Match[]>>({});
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [premierLeague, laLiga, ligatHaAl, trending] = await Promise.all([
          api.get<Match[]>("/matches/live?league=Premier League"),
          api.get<Match[]>("/matches/live?league=La Liga"),
          api.get<Match[]>("/matches/live?league=Ligat HaAl"),
          api.get<NewsArticle[]>("/news/trending")
        ]);

        setLiveMatchesByLeague({
          "Premier League": premierLeague,
          "La Liga": laLiga,
          "Ligat HaAl": ligatHaAl
        });
        setNews(trending);
      } catch (err) {
        setError(err instanceof Error ? err.message : "שגיאה בטעינת נתונים");
      }
    };

    void load();
  }, []);

  return (
    <section>
      <h2>מרכז הכדורגל שלך</h2>
      <p>תוצאות חיות מהליגות המובילות: אנגליה, ספרד וישראל.</p>
      <div className="card-grid">
        {featuredLeagues.map((league) => (
          <article className="card league-card" key={league}>
            <div className="league-header">
              <strong>{league}</strong>
              <span className="league-badge">LIVE</span>
            </div>
            {(liveMatchesByLeague[league] ?? []).length === 0 ? (
              <p>אין כרגע משחקים חיים בליגה זו</p>
            ) : (
              (liveMatchesByLeague[league] ?? []).map((match) => (
                <div className="score-row" key={match.id}>
                  <span>{match.homeTeam?.name}</span>
                  <span className="score-chip">
                    {match.homeScore} - {match.awayScore}
                  </span>
                  <span>{match.awayTeam?.name}</span>
                </div>
              ))
            )}
          </article>
        ))}

        <article className="card">
          <strong>חדשות חמות</strong>
          {news.length === 0 ? <p>אין כתבות כרגע</p> : news.map((n) => <p key={n.id}>{n.title}</p>)}
        </article>
      </div>
      {error && <p>{error}</p>}
    </section>
  );
};

export default Home;
