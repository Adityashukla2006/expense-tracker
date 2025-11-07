# Expense Tracker (Node.js, Express, MongoDB)

A simple expense tracking web app built with Express and MongoDB. It supports user sign up/login (session-based), budget management, adding/deleting transactions, and category-wise expense tracking. Static HTML views are served from the `views` directory and assets from `public`.

## Tech Stack

- Node.js 20
- Express 5
- MongoDB (via Mongoose 8)
- Sessions & Cookies (`express-session`, `cookie-parser`)
- Static HTML/CSS/JS (no frontend framework)
- Dockerfile provided for containerized runs

## Project Structure

```
Web Project/
├─ index.js              # Express server & routes
├─ db.js                 # MongoDB connection helper
├─ Dockerfile
├─ package.json
├─ public/               # Static assets served at /
│  ├─ app.js
│  └─ images/
└─ views/                # Static HTML pages
   ├─ home.html          # Landing page
   ├─ dashboard.html     # Authenticated home
   ├─ addtransaction.html
   ├─ transactions.html
   ├─ signup.html
   ├─ login.html
   ├─ features.html
   ├─ price.html
   └─ aboutUs.html
```

## Prerequisites

- Node.js 18+ (recommended Node 20)
- MongoDB running locally on `mongodb://127.0.0.1:27017` (default DB: `credentials`)

## Setup

```bash
npm ci
```

If you prefer `npm install`, that works too, but the Dockerfile uses `npm ci` for reproducible installs.

## Environment Configuration

The app currently connects to local MongoDB by default (see `db.js`). There is commented code for AWS DocumentDB. If you plan to use DocumentDB:

- Provide these environment variables (example):
  - `DOCDB_USERNAME`
  - `DOCDB_PASSWORD`
  - Bundle the AWS CA bundle inside the container or host (e.g., `global-bundle.pem`) and point to it in `db.js`.

Also consider moving secrets like the session secret into environment variables. For example:

```bash
SESSION_SECRET=change-me
```

Then update `index.js` to read `process.env.SESSION_SECRET`.

## Running the App (Local)

```bash
npm start
```

This starts the server on `http://localhost:3000`.

## Running with Docker

Build and run the container (uses Node 20 Alpine):

```bash
docker build -t expense-tracker .
docker run --name expense-tracker --rm -p 3000:3000 \
  expense-tracker
```

If you use a local MongoDB instance from Docker on the same host, ensure the container can reach it. For example, on Windows Docker Desktop, host.docker.internal often works:

```bash
docker run --name expense-tracker --rm -p 3000:3000 \
  -e MONGODB_URI="mongodb://host.docker.internal:27017/credentials" \
  expense-tracker
```

Adjust `db.js` to read `MONGODB_URI` if you want this env override.

## Available Routes (Server)

- `GET /` → `views/home.html`
- `GET /home` → `views/dashboard.html` (requires session)
- `GET /login` → `views/login.html`
- `GET /signup` → `views/signup.html`
- `GET /features` → `views/features.html`
- `GET /aboutus` → `views/aboutUs.html`
- `GET /pricing` → `views/price.html`
- `GET /alltransactions` → `views/transactions.html`

### Auth & Session

- `POST /loggedin` → Log in a user by `username` and `password` (basic check, no hashing). Sets `req.session.user` on success and a friendly cookie.
- `POST /submit` → Create an account (`username`, `password`, `name`, `phonenumber`, `email`), logs the user in, and redirects to `/home`.
- `GET /logout` → Destroys the session.

### Budget & Transactions (JSON/API)

- `POST /setbudget` → Initialize or increment a user budget/balance. Requires active session.
- `POST /resetBudget` → Reset all budget/expense/category values to 0 for the logged-in user.
- `GET /get-balance` → Returns `{ balance }` for logged-in user.
- `GET /getdetails` → Returns banking document(s) for logged-in user.
- `POST /savetransaction` → Add a transaction for the logged-in user and adjust balance/expense/category.
- `GET /getTransactions` → Returns all transactions for the logged-in user.
- `DELETE /delete-transaction/:id` → Deletes a transaction by id; recalculates totals and category values.

## Data Models (Mongoose)

- `Details`:
  - `username` (unique, required), `password`, `name`, `phoneno`, `EmailAddress`
- `Banking`:
  - `username` (unique, required), `budget`, `expense`, `balance`
  - Category fields: `Food`, `Rent`, `Transport`, `Entertainment`, `Others`
- `Transaction`:
  - `username`, `item`, `category`, `cost`, `Date`

## Notes & Recommendations

- Passwords are currently stored in plaintext. For production, use hashing (e.g., `bcrypt`) and proper auth flows.
- Session secret is hardcoded; move it to `process.env.SESSION_SECRET`.
- Input validation/sanitization should be added on all POST routes.
- Consider rate limiting and CSRF protection for forms/routes.
- Add a `.env` file (not committed) to manage secrets and environment configuration.

## Scripts

- `npm start` → Run server (`node index.js`)
- `npm test` → Placeholder


