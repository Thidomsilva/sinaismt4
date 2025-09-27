# Signals Live

This is a Next.js application built with Firebase Studio to display real-time trading signal assertiveness from an MT4 indicator.

## Objective

The platform shows the current assertiveness per pair and timeframe as calculated by an existing MT4 indicator. It does not store historical signals, only displaying the current state: win-rate, sample size, last signal direction, and market status.

## Tech Stack

-   **Frontend**: Next.js (React) + Tailwind CSS
-   **Backend**: Next.js API Routes (emulating Node.js + Express on Firebase)
-   **Deployment**: Firebase App Hosting
-   **Database**: None (in-memory cache with a 10-minute TTL)

## Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   Firebase CLI

### 1. Installation

Clone the repository and install the dependencies:

```bash
npm install
```

### 2. Environment Variables

This project uses Next.js API routes that emulate a backend server. You don't need a separate `.env.example` as the configuration is handled within the Next.js environment. The API is configured to accept requests from any origin (`*`) to accommodate POSTs from MT4.

### 3. Running the Emulators

To run the application locally with Firebase emulators (which is good practice, though not strictly necessary for this in-memory setup), use:

```bash
firebase emulators:start
```

This will start the local development server and emulate Firebase services. The application will be available at `http://localhost:9002`.

### 4. Running in Dev Mode

For frontend development with hot-reloading, run the Next.js development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:9002`.

## API Endpoints

The API is served from the same Next.js application.

-   `POST /api/snapshot`: Receives and caches a new snapshot from MT4.
-   `GET /api/snapshots`: Returns all current, non-expired snapshots.
-   `GET /api/health`: A health check endpoint.

### Testing the `snapshot` endpoint

You can test the endpoint by sending a POST request using `cURL`. Replace `<URL>` with your deployed function URL or `http://localhost:9002` for local testing.

**Production URL Format**: `https://api-<YOUR_PROJECT_ID>.web.app` (The default URL for App Hosting backends)

```bash
curl -X POST https://api-<YOUR_PROJECT_ID>.web.app/api/snapshot \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "EURUSD",
    "tf": "M1",
    "winrate": 72.5,
    "sample": 180,
    "lastSignal": "SELL",
    "expiry": 5,
    "serverTime": 1695818700,
    "isMarketOpen": true,
    "spread": 12,
    "notes": "MA20/50/100 alinhadas; MACD<0; RSI<50"
  }'
```

## Deployment

To deploy the application to Firebase App Hosting:

```bash
firebase deploy
```

This command will deploy both the Next.js application (frontend and API routes) to Firebase App Hosting.
