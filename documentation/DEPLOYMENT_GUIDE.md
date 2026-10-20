# Neighbourly - Deployment & User Guide

Neighbourly is a Hyperlocal Service Marketplace connecting residents with trusted local service providers for everyday home and personal services.

---

## 1. Quick Start (Development Mode)

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- (Optional) Local MongoDB or MongoDB Atlas cluster. *Note: If no MongoDB URI is supplied in `.env`, the server automatically starts an in-memory MongoDB instance with zero configuration required.*

### Installation
From the repository root:
```bash
# Install root, client, and server dependencies
npm run install:all
```

### Running the Services
Open two terminal windows (or run commands concurrently):

1. **Terminal 1: Start Backend API & Real-time Socket Server**
   ```bash
   npm run dev:server
   ```
   *The backend starts at `http://localhost:5000` and automatically populates development seed data (users, verified providers, service categories).*

2. **Terminal 2: Start Frontend Application (Vite Dev Server)**
   ```bash
   npm run dev:client
   ```
   *The frontend starts at `http://localhost:5173`.*

---

## 2. Seed Accounts & Credentials

The database auto-seeds with pre-configured personas for testing all marketplace roles:

| Role | Name | Email | Password | Locality |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Platform Admin | `admin@neighbourly.local` | `Admin@1234` | Central Indiranagar |
| **Resident** | Arun Sharma | `arun.resident@neighbourly.local` | `Resident@123` | Indiranagar |
| **Resident** | Priya Venkatesh | `priya.resident@neighbourly.local` | `Resident@123` | Koramangala |
| **Provider** | Rajesh Kumar (Plumber) | `rajesh.plumbing@neighbourly.local` | `Provider@123` | Indiranagar |
| **Provider** | Suresh Patel (Electrician) | `suresh.electric@neighbourly.local` | `Provider@123` | Koramangala |

---

## 3. End-to-End User Journeys

### A. Resident Journey
1. **Browse Services**: Visit `/services` to search by keyword, filter by categories (Plumbing, Electrical, Cleaning, Appliance Repair, Tutoring, Carpentry, etc.), minimum rating, or distance.
2. **AI Service Request**: Go to `/resident/request/new` and describe your problem in natural language (e.g., *"My kitchen sink tap is leaking, need someone tomorrow morning, budget around 600"*).
   - AI extracts the category, schedule, budget, and suggested skills with manual editing before saving.
3. **Compare Offers**: View incoming provider offers under `/resident/requests/:id`.
4. **Book & Chat**: Accept an offer to create a booking and immediately initiate real-time chat with the provider under `/chat`.
5. **Razorpay Test Payment**: Click "Pay with Razorpay Test Mode" on `/resident/bookings/:id`. Test credentials are provided automatically.
6. **Review & Disputes**: After service completion, submit a rating and verified review or raise a dispute if issues arise.

### B. Provider Journey
1. **Feed & Job Discovery**: Visit `/provider/feed` to review resident service requests posted in your neighborhood.
2. **Submit Offers**: Propose your quote and estimated hours for relevant requests.
3. **Manage Bookings**: Accept bookings, mark services as "In Progress", and "Completed" under `/provider/bookings`.
4. **Profile & Verification**: Upload trade certificates and manage skill pricing under `/provider/profile`.

### C. Administrator Journey
1. **Platform Analytics**: Visit `/admin/dashboard` for Recharts analytics covering booking trends, category volume, and revenue.
2. **Provider Verification**: Review uploaded trade documents and verify/reject providers under `/admin/verifications`.
3. **Governance**: Search and suspend or reactivate accounts in `/admin/users`.
4. **Dispute Mediation**: Mediate disputes and issue binding verdicts in `/admin/disputes`.

---

## 4. Environment Variables

### Server (`server/.env`)
```ini
NODE_ENV=development
PORT=5000
MONGODB_URI= # Leave blank for automated in-memory MongoDB
CLIENT_URL=http://localhost:5173

JWT_SECRET=neighbourly_dev_jwt_secret_super_secure_key_2026_xyz
JWT_EXPIRES_IN=7d

RAZORPAY_KEY_ID=rzp_test_placeholder_key_id
RAZORPAY_KEY_SECRET=placeholder_secret_key
RAZORPAY_WEBHOOK_SECRET=placeholder_webhook_secret
RAZORPAY_MODE=test

AI_API_KEY= # Optional Gemini API key; heuristic NLP fallback active if blank
AI_MODEL=gemini-1.5-flash
```

### Client (`client/.env`)
```ini
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 5. Automated Testing Suite

To run the automated backend test suite (unit and integration tests for AI fallback, Authentication/RBAC, and Marketplace lifecycles):
```bash
npm run test:server
```
All tests use Node's native runner with in-memory MongoDB isolation.

---

## 6. Production Build

To build the client application bundle:
```bash
npm run build:client
```
The optimized assets are output to `client/dist`.
