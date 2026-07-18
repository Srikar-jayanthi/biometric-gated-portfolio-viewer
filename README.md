# Biometric-Gated Micro-Investment Portfolio Viewer

A full-stack, secure, real-time micro-investment portfolio tracking application built with a React Native (Expo) client and a type-safe tRPC / Prisma / PostgreSQL backend.

---

## 🏗️ Architecture & Tech Stack

- **Client:** React Native (Expo SDK 51) with TypeScript, utilizing `@trpc/client`, `@trpc/react-query`, `@tanstack/react-query`, `expo-local-authentication`, `expo-secure-store` / `localStorage`, and custom `react-native-svg` components.
- **Server:** Node.js with tRPC and Express, establishing end-to-end type safety between the server and the client.
- **Database:** PostgreSQL managed through Prisma ORM.
- **Containerization:** Containerized backend and database services managed via Docker Compose.

---

## 🚀 One-Command Setup & Running the Project

### Prerequisites

Ensure you have the following installed on your host machine:
- [Docker & Docker Compose](https://www.docker.com/products/docker-desktop)
- [Node.js (v18+) & npm](https://nodejs.org/)

---

### 1. Run Backend Services (Docker Compose)

The backend and database services are fully containerized. To build, migrate, and start all services in a single command, run this from the root directory:

```bash
docker-compose up --build -d
```

- **Healthchecks:** The `db` container performs automatic pg_isready health checks. The `backend` container waits for the database to be fully healthy before executing database migrations, pushing the database schema, running the database seed script, and launching the tRPC API.
- **Backend Host Port:** The healthy backend container listens on `http://localhost:4000`.
- **Database Seeding:** On startup, the database is seeded automatically with the credentials specified in `submission.json` and a set of initial stock holdings (`AAPL`, `GOOGL`, `MSFT`).

---

### 2. Seeding & Test Credentials

The database is automatically pre-seeded. You can log in using:
- **Email:** `test@example.com`
- **Password:** `password123`

---

### 3. Run the Frontend Client (Expo)

To start the Expo mobile and web client:

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the client-side dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Expo development server:
   ```bash
   npm run start
   ```
   - **For Web Browser:** Press **`w`** in the terminal command line or open **[http://localhost:8081](http://localhost:8081)**.
   - **For Mobile:** Scan the QR code using the **Expo Go** application on a physical device, or press **`a`** (Android) / **`i`** (iOS) to launch simulators.

---

## 🔍 Core Requirements Mapping (Evaluator Reference)

Here is a list of the 11 Core Requirements and where they are implemented in the codebase:

### 1. Docker Compose Integration
- **Constraint:** Multi-container build, healthy checks, and automated database seeding on launch.
- **Implementation File:** [docker-compose.yml](file:///c:/Users/JAYANTHI%20SRIKAR/Desktop/GPP/docker-compose.yml) and backend entry point [backend/Dockerfile](file:///c:/Users/JAYANTHI%20SRIKAR/Desktop/GPP/backend/Dockerfile).

### 2. Environment Template
- **Constraint:** Documents `DATABASE_URL`, `JWT_SECRET`, and `PORT`.
- **Implementation File:** [backend/.env.example](file:///c:/Users/JAYANTHI%20SRIKAR/Desktop/GPP/backend/.env.example).

### 3. Submission Configuration
- **Constraint:** Pre-seeded credentials stored in `submission.json` at the root.
- **Implementation File:** [submission.json](file:///c:/Users/JAYANTHI%20SRIKAR/Desktop/GPP/submission.json).

### 4. Public tRPC Authentication Procedures
- **Constraint:** Expose public `user.register` and `user.login` routes.
- **Implementation File:** [backend/src/router/user.ts](file:///c:/Users/JAYANTHI%20SRIKAR/Desktop/GPP/backend/src/router/user.ts).

### 5. Protected tRPC Portfolio Procedures
- **Constraint:** Restrict `holding.add`, `holding.list`, and `holding.remove` behind verified Bearer JWT middleware.
- **Implementation File:** [backend/src/router/holding.ts](file:///c:/Users/JAYANTHI%20SRIKAR/Desktop/GPP/backend/src/router/holding.ts) and [backend/src/context.ts](file:///c:/Users/JAYANTHI%20SRIKAR/Desktop/GPP/backend/src/context.ts).

### 6. Immediate Startup Biometric Gate
- **Constraint:** Keeps the main portfolio unmounted (`data-testid="portfolio-dashboard"`) until local authentication succeeds.
- **Implementation File:** [frontend/App.tsx](file:///c:/Users/JAYANTHI%20SRIKAR/Desktop/GPP/frontend/App.tsx#L254-L264).

### 7. Background Auto-Lock Inactivity Timeout
- **Constraint:** Triggers re-lock and prints `RE_AUTH_TRIGGERED` to the console if backgrounded for more than 5 minutes.
- **Implementation File:** [frontend/App.tsx](file:///c:/Users/JAYANTHI%20SRIKAR/Desktop/GPP/frontend/App.tsx#L210-L252).

### 8. Dynamic Portfolio Value Calculations
- **Constraint:** Correctly computes and displays values mapped to `data-testid="ticker-<TICKER>"`, `data-testid="current-value-<TICKER>"`, and `data-testid="gain-loss-<TICKER>"`.
- **Implementation File:** [frontend/App.tsx](file:///c:/Users/JAYANTHI%20SRIKAR/Desktop/GPP/frontend/App.tsx#L450-L500).

### 9. Stale Price Indicator
- **Constraint:** Renders `data-testid="stale-indicator-<TICKER>"` if price update timestamp is older than 1 hour.
- **Implementation File:** [frontend/App.tsx](file:///c:/Users/JAYANTHI%20SRIKAR/Desktop/GPP/frontend/App.tsx#L533-L545).

### 10. Custom SVG Sparkline Charts
- **Constraint:** Render history trends using pure `react-native-svg` (or native SVG tags on web fallback) wrapped in `data-testid="sparkline-container-<TICKER>"`. No external charting libraries.
- **Implementation File:** [frontend/App.tsx](file:///c:/Users/JAYANTHI%20SRIKAR/Desktop/GPP/frontend/App.tsx#L70-L127).

### 11. Security Analysis Document
- **Constraint:** Present at root and parseable in Markdown (minimum 400 words).
- **Implementation File:** [SECURITY.md](file:///c:/Users/JAYANTHI%20SRIKAR/Desktop/GPP/SECURITY.md).

---

## 🔒 Security Operations

- **Token Storage:** Uses `expo-secure-store` on iOS/Android native keychains and `localStorage` on web browsers.
- **Biometric Gate:** Employs OS-level Local Authentication for face and fingerprint validation, falling back cleanly to credentials if unconfigured.
- **Server Signatures:** All JWT tokens are signed using HMAC-SHA256 signatures backed by the `JWT_SECRET` environment configuration.
