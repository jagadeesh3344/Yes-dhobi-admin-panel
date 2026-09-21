# Yes Dhobi Admin Portal

A centralized management console for Yes Dhobi laundry and dry cleaning operations, streamlining end-to-end order processing, partner fleet coordination, and customer support.

## Features

- **Dashboard**: Real-time KPI metrics (orders today, revenue, active deliveries), operational order tracking, and quick onboarding actions for riders and laundry vendors.
- **Order Management**: End-to-end lifecycle tracking across pickup, washing, ironing, quality check, and delivery stages.
- **Rider & Vendor Hub**: Fleet dispatch, zone allocations, availability statuses, capacity management, and onboarding workflows.
- **Customer Directory**: Customer profiles, order histories, status tracking, and data export.
- **Revenue & Analytics**: Financial breakdowns, commission tracking, and performance charts.
- **Verifications & Support**: Vendor and rider KYC approvals, dispute resolution, and customer support ticket handling.

## Tech Stack

- **Frontend**: React 19, TypeScript, React Router v7
- **Styling**: Tailwind CSS v4, Lucide React Icons, Motion
- **Charts**: Recharts
- **Tooling**: Vite

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

```bash
npm install
```

### Development

Run the local development server on port 3000:

```bash
npm run dev
```

### Build

Create an optimized production build:

```bash
npm run build
```

## Connecting to the backend

The panel is a pure frontend; all data comes from the Yes Dhobi API in [`jagadeesh3344/yes-dhobi` → `backend/`](https://github.com/jagadeesh3344/yes-dhobi/tree/main/backend).

1. Copy `.env.example` to `.env` and set `VITE_API_URL` to the API base URL:
   * local development: `http://localhost:4000/api/v1` (run the backend with `npm run dev` there)
   * production: the deployed API, e.g. `https://api.yesdhobi.com/api/v1` — the AWS deploy script `backend/infra/deploy-frontends.sh` sets this automatically when it builds and publishes the panel.
2. Sign in with an admin account (the backend seed creates `admin@yesdhobi.com` / `Admin@12345`; change it after first login).

Live updates (orders, riders, tickets, notifications) arrive over Socket.IO from the same API; the "Real-Time Sync" toggle in the header turns them on/off.

* Deployment (AWS): [backend/DEPLOY.md](https://github.com/jagadeesh3344/yes-dhobi/blob/main/backend/DEPLOY.md)
* Testing the panel: [backend/TESTING.md](https://github.com/jagadeesh3344/yes-dhobi/blob/main/backend/TESTING.md) Part 6
