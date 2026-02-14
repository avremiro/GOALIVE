import { FormEvent, useState } from "react";
import { api } from "../lib/api";
import type { User } from "../types";

type AuthResponse = {
  token: string;
  user: User;
};

const Auth = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("demo@football.app");
  const [username, setUsername] = useState("demo");
  const [password, setPassword] = useState("123456");
  const [message, setMessage] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    try {
      const payload =
        mode === "register"
          ? { email, username, password, favoriteTeamIds: [1] }
          : { email, password };

      const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
      const result = await api.post<AuthResponse>(endpoint, payload);
      localStorage.setItem("football_token", result.token);
      localStorage.setItem("football_user", JSON.stringify(result.user));
      setMessage("התחברת בהצלחה");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "פעולה נכשלה");
    }
  };

  return (
    <section>
      <h2>{mode === "login" ? "התחברות" : "הרשמה"}</h2>
      <form className="form" onSubmit={onSubmit}>
        <label>
          אימייל
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        {mode === "register" && (
          <label>
            שם משתמש
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
        )}

        <label>
          סיסמה
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button type="submit">{mode === "login" ? "התחבר" : "צור חשבון"}</button>
      </form>

      <button
        type="button"
        className="secondary-btn"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        {mode === "login" ? "אין לך חשבון? עבור להרשמה" : "כבר רשום? עבור להתחברות"}
      </button>

      {message && <p>{message}</p>}
    </section>
  );
};

export default Auth;
