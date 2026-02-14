import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Match, NewsArticle, StandingRow } from "../types";

const featuredLeagues = ["Premier League", "La Liga", "Ligat HaAl"];

const Home = () => {
  const [matchesByLeague, setMatchesByLeague] = useState<Record<string, Match[]>>({});
  const [standingsByLeague, setStandingsByLeague] = useState<Record<string, StandingRow[]>>({});
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [
          premierLeague,
          laLiga,
          ligatHaAl,
          premierTable,
          laLigaTable,
          ligatHaAlTable,
          trending
        ] = await Promise.all([
          api.get<Match[]>("/matches?league=Premier League"),
          api.get<Match[]>("/matches?league=La Liga"),
          api.get<Match[]>("/matches?league=Ligat HaAl"),
          api.get<StandingRow[]>("/matches/table?league=Premier League"),
          api.get<StandingRow[]>("/matches/table?league=La Liga"),
          api.get<StandingRow[]>("/matches/table?league=Ligat HaAl"),
          api.get<NewsArticle[]>("/news/trending")
        ]);

        setMatchesByLeague({
          "Premier League": premierLeague,
          "La Liga": laLiga,
          "Ligat HaAl": ligatHaAl
        });
        setStandingsByLeague({
          "Premier League": premierTable,
          "La Liga": laLigaTable,
          "Ligat HaAl": ligatHaAlTable
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
      <h2>Today - תוצאות ולוחות משחקים</h2>
      <p>אנגליה, ספרד וישראל במקום אחד.</p>
      <div className="card-grid">
        {featuredLeagues.map((league) => (
          <article className="card league-card" key={league}>
            <div className="league-header">
              <strong>{league}</strong>
              <span className="league-badge">TOP</span>
            </div>
            {(matchesByLeague[league] ?? []).length === 0 ? (
              <p>אין כרגע משחקים להצגה בליגה זו</p>
            ) : (
              (matchesByLeague[league] ?? []).slice(0, 5).map((match) => (
                <div className="score-row" key={match.id}>
                  <span>{match.homeTeam?.name ?? match.homeTeamId}</span>
                  <span className="score-chip">
                    {match.homeScore} - {match.awayScore}
                  </span>
                  <span>{match.awayTeam?.name ?? match.awayTeamId}</span>
                </div>
              ))
            )}
            <div className="mini-table">
              <div className="mini-table-head">
                <span>#</span>
                <span>קבוצה</span>
                <span>נק'</span>
              </div>
              {(standingsByLeague[league] ?? []).slice(0, 5).map((row) => (
                <div className="mini-table-row" key={`${league}-${row.teamId}`}>
                  <span>{row.rank}</span>
                  <span>{row.teamName}</span>
                  <span>{row.points}</span>
                </div>
              ))}
            </div>
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
