# Biometric-Gated Micro-Investment Portfolio Viewer

A secure, real-time micro-investment portfolio tracking application built with a React Native (Expo) mobile client and a type-safe tRPC / Prisma / PostgreSQL backend.

---

## 🏗️ Architecture & Tech Stack

- **Client:** React Native (Expo) with TypeScript, featuring biometric gates (`expo-local-authentication`), secure credential storage (`expo-secure-store`), and custom data visualization (`react-native-svg`).
- **Server:** Node.js with tRPC and Express, establishing end-to-end type safety between the server procedures and the client.
- **Database:** PostgreSQL managed through Prisma ORM.
- **Containerization:** Multi-container orchestrations via Docker Compose.

---

## 📁 Repository Structure

```
/ (repository root)
├── docker-compose.yml         # Docker orchestration definition
├── submission.json            # Pre-seeded test user configuration
├── SECURITY.md                # Comprehensive threat modeling & security analysis
├── README.md                  # Setup & execution instructions
├── backend/                   # Node.js tRPC backend server
│   ├── src/                   # Server source files (routers, middleware, seed script)
│   ├── prisma/                # Prisma schema definitions
│   ├── Dockerfile             # Backend container definition
│   └── .env.example           # Backend environment variable template
└── frontend/                  # React Native Expo client app
    ├── App.tsx                # Client screens, state, biometrics, and SVG sparkline
    └── package.json           # Frontend dependency manifest
```

---

## 🚀 Setup & Execution Instructions

### Prerequisites

Ensure you have the following installed on your machine:
- [Docker & Docker Compose](https://www.docker.com/products/docker-desktop)
- [Node.js (v18+) & npm](https://nodejs.org/)

---

### 1. Running the Backend Services (Docker Compose)

The backend is fully containerized. To spin up the database and tRPC server in one command:

1. Clone the repository and navigate to the root directory.
2. Build and start the services:
   ```bash
   docker-compose up --build -d
   ```
3. Check that the containers are healthy:
   ```bash
   docker ps
   ```
   Both the `portfolio-backend` and `portfolio-db` containers will build, run migrations, automatically seed the test user, and enter a healthy state. The backend listens on `http://localhost:4000`.

---

### 2. Seeding & Test Credentials

On container startup, the database is automatically seeded using the configuration in `submission.json`:
- **Test Email:** `test@example.com`
- **Test Password:** `password123`

The seeding script also creates a set of initial stock holdings (`AAPL`, `GOOGL`, `MSFT`) in the database for the test user.

---

### 3. Running the Frontend Application (Expo)

To start the Expo mobile client application:

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
   You can run the application on an iOS/Android simulator or scan the QR code using the Expo Go application on a physical device.

---

## 🔒 Security Operations

- **Startup Lock:** The application boots into a locked state if a valid JWT is found. The dashboard is protected and hidden until Touch ID / Face ID matches.
- **Inactivity Timeout:** If the application is backgrounded and re-opened after more than 5 minutes (300 seconds), it locks access and forces biometric re-authentication, logging `RE_AUTH_TRIGGERED` to the console.
- **Password Protection:** User passwords are encrypted on the server using `bcryptjs` with salt round factor 10.
