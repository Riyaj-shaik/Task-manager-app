# Task Manager

A simple Task Manager where users sign up, log in, and manage their own tasks across three stages: **Todo**, **In Progress**, and **Done**.

Built as an intern assignment.

## Live links

- **Frontend:** https://orchestratask.netlify.app
- **Backend:**  https://task-manager-app-ithl.onrender.com
- Please note: The backend is hosted on Render's free tier and may take up to 50 seconds to respond after a period of inactivity. If a request seems slow, please wait while the server wakes up and processes your request.


## Stack

| Layer    | Tech                                     |
| -------- | ---------------------------------------- |
| Frontend | HTML + CSS + vanilla JavaScript (no framework) |
| Backend  | Node.js + Express                        |
| Database | MongoDB (via Mongoose)                   |
| Auth     | JWT + bcrypt                             |
| Hosting  | Netlify (FE) + Render (BE) + MongoDB Atlas (DB) |

## Project structure

```
task-manager-intern/
├── backend/
│   ├── server.js              # Express entry
│   ├── db.js                  # MongoDB connection
│   ├── middleware/auth.js     # JWT verify
│   ├── routes/
│   │   ├── auth.routes.js     # POST /register, POST /login
│   │   └── tasks.routes.js    # CRUD /tasks
│   ├── models/
│   │   ├── User.model.js
│   │   └── Task.model.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── index.html             # Login + Register
    ├── dashboard.html         # Task board
    ├── css/style.css
    └── js/
        ├── config.js          # Backend URL (edit for prod)
        ├── auth.js
        └── tasks.js
```

## Local setup

### Prereqs

- Node.js v18 or higher
- A free MongoDB Atlas account: https://www.mongodb.com/atlas

### 1. Set up MongoDB Atlas

1. Create a free cluster (M0 tier).
2. Database Access → add a user with username + password.
3. Network Access → allow access from anywhere (`0.0.0.0/0`).
4. Connect → "Drivers" → copy the connection string (looks like `mongodb+srv://...`).

### 2. Run the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

- `MONGO_URI` = your Atlas connection string (replace `<password>` with your real password)
- `JWT_SECRET` = any long random string (e.g. paste 32+ random characters)

Then start it:

```bash
npm start
# Server listening on port 4000
```

### 3. Run the frontend

The frontend is plain HTML. The easiest options:

```bash
cd frontend
npx serve .
# or
python3 -m http.server 5500
```

Then open the printed URL (usually `http://localhost:3000` or `http://localhost:5500`).

> If you change the backend URL, also update `frontend/js/config.js`.

## Deployment

### Backend → Render

1. Push this repo to GitHub.
2. Sign up at https://render.com (free tier).
3. **New → Web Service →** connect your GitHub repo.
4. Configure:
   - **Root directory:** `backend`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
5. Environment variables:
   - `MONGO_URI` — your Atlas connection string
   - `JWT_SECRET` — long random string
   - `FRONTEND_URL` — your Netlify URL (set this after the frontend is deployed)

Render gives you a URL like `https://task-manager-backend-xxxx.onrender.com`.

> Note: the free Render tier sleeps after 15 minutes of inactivity. The first request after waking takes ~30s.

### Frontend → Netlify

1. Edit `frontend/js/config.js` and set:
   ```js
   window.API_BASE_URL = 'https://task-manager-backend-xxxx.onrender.com';
   ```
2. Sign up at https://app.netlify.com.
3. Click **"Add new site → Deploy manually"** and drag the `frontend/` folder onto the page.
4. Netlify gives you a URL like `https://task-manager-xxxx.netlify.app`.
5. Go back to Render and set `FRONTEND_URL` to that Netlify URL (this locks CORS to your frontend).

## API reference

All `/api/tasks/*` endpoints require an `Authorization: Bearer <token>` header.

| Method | Endpoint               | Body                                  | Description           |
| ------ | ---------------------- | ------------------------------------- | --------------------- |
| POST   | `/api/auth/register`   | `{ email, password }`                 | Create account        |
| POST   | `/api/auth/login`      | `{ email, password }`                 | Login                 |
| GET    | `/api/tasks`           | —                                     | List the user's tasks |
| POST   | `/api/tasks`           | `{ title, description?, stage? }`     | Create a task         |
| PUT    | `/api/tasks/:id`       | any of `{ title, description, stage }`| Update a task         |
| DELETE | `/api/tasks/:id`       | —                                     | Delete a task         |

Valid `stage` values: `todo`, `in_progress`, `done`.

## Assumptions and tradeoffs

- **JWT in localStorage.** Simple to implement and works across page reloads. Vulnerable to XSS in principle; acceptable for this assignment. In production, httpOnly cookies are safer.
- **No drag-and-drop.** Tasks move between columns via a dropdown rather than drag. Trade-off: less flashy, but keeps the JS readable with zero dependencies.
- **No password reset / email verification.** Out of scope for a small assignment.
- **No pagination.** Tasks are returned all at once. Fine for the expected scale; would need pagination at scale.
- **CORS.** In production, set `FRONTEND_URL` so only the frontend is allowed. In dev it falls back to `*`.
- **Inline edit uses `window.prompt()`.** Functional but minimal. A modal would be nicer; deferred for time.
- **Errors surfaced inline.** Both pages show errors in a small `.error` element rather than using a toast library.
- **Render free tier sleeps.** The first request after inactivity takes ~30s; the frontend shows a "Loading..." state until it responds.

## AI usage

The brief states that backend implementation is mandatory if AI tools were used. This project was scaffolded with the help of Claude (AI) — that's why it includes a full custom Node/Express backend with MongoDB and JWT auth, rather than a managed service like Firebase.
