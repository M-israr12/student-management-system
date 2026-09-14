# Ledger — Student Management System

Full-stack project: **Node.js + Express backend**, **SQLite database**, and a **vanilla HTML/CSS/JS frontend** — fully connected, with login, dashboard, and complete student CRUD + search.

```
Frontend (HTML/CSS/JS)  ──fetch (JWT)──▶  Backend (Express API)  ──▶  SQLite database
```

---

## 1. Folder structure

```
student-management-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # SQLite connection, schema, seeds default admin
│   ├── controllers/
│   │   ├── auth.controller.js    # login / register / me
│   │   └── student.controller.js # CRUD + search + dashboard stats
│   ├── middleware/
│   │   └── auth.middleware.js    # JWT verification
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── student.routes.js
│   ├── database/                 # students.db is auto-created here on first run
│   ├── .env.example              # copy to .env
│   ├── package.json
│   └── server.js                 # entry point
│
├── frontend/
│   ├── login.html                # login screen
│   ├── index.html                # dashboard + students (single page app)
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── api.js                # fetch wrapper (adds JWT header)
│       ├── auth.js                # login form + route guard + logout
│       ├── dashboard.js          # dashboard stats rendering
│       ├── students.js           # student table, search, add/edit/delete
│       └── app.js                # view router + toast notifications
│
└── README.md
```

---

## 2. Requirements

- **Node.js** v18 or newer (v22 also works) — [nodejs.org](https://nodejs.org)
- npm (comes with Node.js)

No separate database server is needed — SQLite runs as a local file (`backend/database/students.db`), created automatically the first time you start the backend.

---

## 3. Setup & run (step by step)

### Step 1 — Install backend dependencies

```bash
cd student-management-system/backend
npm install
```

### Step 2 — Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and, ideally, change `JWT_SECRET` to a random string. Defaults work fine for local testing:

```
PORT=5000
JWT_SECRET=change_this_to_a_long_random_secret_key
JWT_EXPIRES_IN=1d
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin123
```

### Step 3 — Start the backend

```bash
npm start
```

You should see:

```
Seeded default admin user -> username: "admin", password: "admin123"
🚀 Server running at http://localhost:5000
```

The database file and the **admin account are created automatically** on this first run.

### Step 4 — Open the frontend

The backend already serves the frontend as static files, so the whole app runs from **one URL**:

```
http://localhost:5000
```

Just open that in your browser — it loads `login.html` automatically.

> Alternative: you can also open `frontend/login.html` directly as a file, or serve the `frontend/` folder with any static server (e.g. VS Code "Live Server"). If you do that, make sure the backend is running on `http://localhost:5000`, since `frontend/js/api.js` points there by default (`API_BASE_URL`).

### Step 5 — Log in

- Username: `admin`
- Password: `admin123`

Change this password by creating a new account (`POST /api/auth/register`) or editing it directly, then remove the old one — there's no in-app "change password" screen in this base version, but the API is ready for you to wire one up.

---

## 4. What's included

- 🔐 **Login system** — JWT-based auth; all `/api/students/*` routes require a valid token; a default admin account is auto-seeded.
- 📊 **Dashboard** — total / active / inactive students, students added this month, a students-by-course breakdown, and a "recently added" list.
- 👨‍🎓 **Student management** — Add, Edit, Delete, and live Search (by name, email, roll number, or course), plus status filter and pagination.
- ⚙️ **REST API** — clean Express routes, input validation, and consistent JSON responses.
- 🗄️ **Database** — SQLite via `better-sqlite3`, schema auto-created on first run, indexed for fast search.
- 🎨 **Responsive frontend** — sidebar navigation on desktop, collapses to a compact top bar on mobile; no framework required.

---

## 5. API reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint                     | Auth | Description                          |
|--------|-------------------------------|------|---------------------------------------|
| POST   | `/auth/login`                 | No   | Log in, returns JWT + user            |
| POST   | `/auth/register`              | No   | Create a new admin account            |
| GET    | `/auth/me`                    | Yes  | Get current logged-in user            |
| GET    | `/students`                   | Yes  | List students (supports query params below) |
| GET    | `/students/:id`               | Yes  | Get one student                       |
| POST   | `/students`                   | Yes  | Create a student                      |
| PUT    | `/students/:id`               | Yes  | Update a student                      |
| DELETE | `/students/:id`               | Yes  | Delete a student                      |
| GET    | `/students/stats/dashboard`   | Yes  | Dashboard summary stats               |

`GET /students` query params: `search`, `status` (`active`/`inactive`), `course`, `page`, `limit`.

Authenticated requests need a header:
```
Authorization: Bearer <token>
```

---

## 6. Troubleshooting

- **"Could not reach the server" in the browser** → make sure `npm start` is running in `backend/` and nothing else is using port 5000.
- **Port already in use** → change `PORT` in `.env`, and update `API_BASE_URL` at the top of `frontend/js/api.js` to match.
- **`better-sqlite3` fails to install** → it compiles a small native module; make sure you have a recent Node.js version. Deleting `node_modules` and re-running `npm install` usually fixes stale build artifacts.
- **Forgot the admin password** → stop the server, delete `backend/database/students.db*` files, and restart — this recreates a fresh database with the default admin account (⚠️ this also erases any students you've already added, so only do this for a fresh dev setup).
- **CORS errors** → only relevant if you serve the frontend from a different origin than the backend; the backend already has `cors()` enabled for all origins.

---

## 7. Next steps you might want to add

- Change-password / forgot-password screen
- Role-based permissions (e.g. read-only "staff" role vs "admin")
- CSV export of the student list
- Server-side rate limiting on `/auth/login`
