import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { Match, NewsArticle, Team } from "../types";

const TeamHub = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [teamMatches, setTeamMatches] = useState<Match[]>([]);
  const [teamNews, setTeamNews] = useState<NewsArticle[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const data = await api.get<Team[]>("/teams");
        setTeams(data);
        if (data.length > 0) {
          setSelectedTeamId(data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "שגיאה בטעינת קבוצות");
      }
    };

    void loadTeams();
  }, []);

  useEffect(() => {
    if (!selectedTeamId) return;

    const loadTeamData = async () => {
      try {
        const [matches, news] = await Promise.all([
          api.get<Match[]>(`/teams/${selectedTeamId}/matches`),
          api.get<NewsArticle[]>(`/teams/${selectedTeamId}/news`)
        ]);
        setTeamMatches(matches);
        setTeamNews(news);
      } catch (err) {
        setError(err instanceof Error ? err.message : "שגיאה בטעינת נתוני קבוצה");
      }
    };

    void loadTeamData();
  }, [selectedTeamId]);

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId) ?? null,
    [teams, selectedTeamId]
  );

  return (
    <section>
      <h2>הקבוצה שלי</h2>
      <p>מרכז קבוצה ייעודי עם חדשות, משחקים קרובים, סגל וסטטיסטיקות.</p>
      <label>
        בחר קבוצה
        <select
          value={selectedTeamId ?? ""}
          onChange={(e) => setSelectedTeamId(Number(e.target.value))}
        >
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </label>

      {selectedTeam && (
        <article className="card">
          <strong>{selectedTeam.name}</strong>
          <p>
            {selectedTeam.country} | {selectedTeam.league}
          </p>
        </article>
      )}

      <div className="card-grid">
        <article className="card">
          <strong>משחקים</strong>
          {teamMatches.length === 0 ? (
            <p>אין משחקים להצגה</p>
          ) : (
            teamMatches.map((match) => (
              <p key={match.id}>
                #{match.id} | {match.status} | {match.homeScore}-{match.awayScore}
              </p>
            ))
          )}
        </article>

        <article className="card">
          <strong>חדשות קבוצה</strong>
          {teamNews.length === 0 ? (
            <p>אין חדשות להצגה</p>
          ) : (
            teamNews.map((item) => <p key={item.id}>{item.title}</p>)
          )}
        </article>
      </div>
      {error && <p>{error}</p>}
    </section>
  );
};

export default TeamHub;
