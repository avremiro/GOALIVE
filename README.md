# Football App (Monorepo)

בסיס אפליקציית כדורגל עובד עם:

- `frontend` - React + TypeScript + Vite
- `backend` - Express + TypeScript
- `backend/prisma` - התחלת סכימה ל-PostgreSQL (להמשך חיבור DB אמיתי)

## דרישות מוקדמות

- Node.js 20+
- npm 10+

## התקנה

```bash
npm install
```

## הרצה בפיתוח

טרמינל 1 (Backend):

```bash
npm run dev:backend
```

טרמינל 2 (Frontend):

```bash
npm run dev:frontend
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`  
Health Check: `http://localhost:5000/api/v1/health`

## משתני סביבה

1. להעתיק `backend/.env.example` ל-`backend/.env`
2. להעתיק `frontend/.env.example` ל-`frontend/.env`

בשלב הבא תצטרך להוסיף גם:

- `DATABASE_URL`
- `RAPIDAPI_KEY`
- `NEWS_API_KEY`

## מבנה תיקיות נוכחי

```text
football-app/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── routes/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
└── package.json
```

## מה מוכן כרגע

- Frontend:
  - ניווט ועבודה עם API עבור: בית, לייב, הקבוצה שלי, התחברות, חידונים, תחזיות
  - רענון משחקים חיים כל 30 שניות
  - שמירת טוקן התחברות ב-`localStorage`
- Backend:
  - Health: `GET /api/v1/health`
  - Auth: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
  - Teams: `GET /api/v1/teams`, `GET /api/v1/teams/:id`, `GET /api/v1/teams/:id/matches`, `GET /api/v1/teams/:id/news`
  - Matches: `GET /api/v1/matches`, `GET /api/v1/matches/live`, `GET /api/v1/matches/upcoming`, `GET /api/v1/matches/:id`, `GET /api/v1/matches/:id/events`
  - News: `GET /api/v1/news`, `GET /api/v1/news/trending`, `GET /api/v1/news/:id`
  - Quizzes: `GET /api/v1/quizzes`, `GET /api/v1/quizzes/:id`, `POST /api/v1/quizzes/:id/submit`, `GET /api/v1/quizzes/leaderboard/global`
  - Predictions: `POST /api/v1/predictions`, `GET /api/v1/predictions/my`, `GET /api/v1/predictions/leaderboard`
  - Notifications: `GET /api/v1/notifications`, `PUT /api/v1/notifications/settings`
- Data Store:
  - כרגע נתוני דמו בזיכרון (in-memory) כדי לאפשר פיתוח מהיר ללא DB

## משתמש דמו לבדיקה

- אימייל: `demo@football.app`
- סיסמה: `123456`

## שלבים הבאים המומלצים

1. מעבר מ-in-memory ל-Prisma + PostgreSQL + migrations.
2. הוספת Redis caching ל-live matches.
3. חיבור API-Football ו-News API אמיתיים במקום mock data.
4. הוספת הרשאות מתקדמות, refresh tokens ו-logout.
5. הכנסת Redux Toolkit + RTK Query + Tailwind + shadcn/ui.

## הערות

- הסקפולד נועד להתחלה מהירה ונקייה.
- אפשר להוסיף בהמשך Redux Toolkit, Tailwind, Socket.io, ו-PWA לפי האיפיון.
