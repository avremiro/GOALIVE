import { useEffect, useState } from "react";
import { api } from "../lib/api";

type QuizListItem = {
  id: number;
  title: string;
  difficulty: string;
  questionCount: number;
};

type QuizDetail = {
  id: number;
  title: string;
  difficulty: string;
  questions: {
    id: number;
    text: string;
    options: string[];
  }[];
};

const Quiz = () => {
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizDetail | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const list = await api.get<QuizListItem[]>("/quizzes");
      setQuizzes(list);
    };
    void load();
  }, []);

  const openQuiz = async (quizId: number) => {
    setMessage("");
    const detail = await api.get<QuizDetail>(`/quizzes/${quizId}`);
    setSelectedQuiz(detail);
    setAnswers(new Array(detail.questions.length).fill(-1));
  };

  const submit = async () => {
    const token = localStorage.getItem("football_token") ?? "";
    if (!token) {
      setMessage("נדרש להתחבר כדי לשלוח תוצאה");
      return;
    }
    if (!selectedQuiz) return;
    const result = await api.post<{ result: { score: number }; totalQuestions: number }>(
      `/quizzes/${selectedQuiz.id}/submit`,
      { answers },
      token
    );
    setMessage(`הציון שלך: ${result.result.score}/${result.totalQuestions}`);
  };

  return (
    <section>
      <h2>חידונים</h2>
      <div className="card-grid">
        {quizzes.map((quiz) => (
          <article className="card" key={quiz.id}>
            <strong>{quiz.title}</strong>
            <p>
              קושי: {quiz.difficulty} | שאלות: {quiz.questionCount}
            </p>
            <button onClick={() => void openQuiz(quiz.id)}>התחל חידון</button>
          </article>
        ))}
      </div>

      {selectedQuiz && (
        <article className="card">
          <h3>{selectedQuiz.title}</h3>
          {selectedQuiz.questions.map((question, qIndex) => (
            <div key={question.id}>
              <p>{question.text}</p>
              <div className="card-grid">
                {question.options.map((option, oIndex) => (
                  <button
                    key={`${question.id}-${option}`}
                    className={answers[qIndex] === oIndex ? "secondary-btn" : ""}
                    onClick={() => {
                      const next = [...answers];
                      next[qIndex] = oIndex;
                      setAnswers(next);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={() => void submit()}>שלח תשובות</button>
        </article>
      )}

      {message && <p>{message}</p>}
    </section>
  );
};

export default Quiz;
