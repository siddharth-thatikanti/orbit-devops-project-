# Orbit Customer Portal

A full-stack customer support application with separate frontend, backend, and database folders. There are no container build files or container orchestration configuration.

## Project structure

```text
orbit-fullstack-app/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── database/
    ├── schema.sql
    └── README.md
```

## Requirements

- Node.js 18 or newer
- PostgreSQL 14 or newer

## 1. Set up PostgreSQL

Read `database/README.md`. Create a database named `orbit`, a user named `orbituser`, then run:

```bash
psql -h localhost -U orbituser -d orbit -f database/schema.sql
```

## 2. Configure the backend

Open a terminal in `backend/` and run:

```bash
npm install
```

Copy `.env.example` to `.env`, then update the database password to match your PostgreSQL user.

Start the API:

```bash
npm start
```

The API listens on `http://localhost:3000`.

Test it:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/requests
```

## 3. Start the frontend

Open `frontend/index.html` in a browser. If the browser restricts local file access, start a simple static server from the `frontend` folder:

```bash
npx serve .
```

Then open the local URL shown in the terminal. The frontend calls `http://localhost:3000/api`.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check database connectivity |
| GET | `/api/requests` | List requests |
| POST | `/api/requests` | Create a request |
| PATCH | `/api/requests/:id` | Update request status |
| DELETE | `/api/requests/:id` | Delete a request |

For non-local deployment, update `API_BASE` in `frontend/app.js` to the reachable backend URL and configure appropriate CORS origins, credentials, HTTPS, and database access controls.
