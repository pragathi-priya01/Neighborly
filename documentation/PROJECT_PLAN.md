# Neighbourly - Project Execution Plan & Status

## 1. Executive Overview
Neighbourly is a Hyperlocal Service Marketplace connecting residents with trusted local service providers for everyday home and personal services (plumbing, electrical, appliance repair, tutoring, carpentry, cleaning, etc.).

The system encompasses:
- Three User Personas: Resident, Provider, Admin
- End-to-end Booking State Machine
- Server-side verified Razorpay Payments (Test Mode)
- Real-time Chat & Notifications via Socket.IO
- Natural Language AI Service Request Extraction with Manual Editing & Fallback
- Hybrid AI Provider Matching with Deterministic Hard Filtering & Transparent Match Explanations
- Verified Provider Workflows, Review Authenticity, and Dispute Management
- Admin Control Center with Platform Analytics (Recharts)

---

## 2. Phase-by-Phase Execution Roadmap & Progress

- [x] **Phase 1: Foundation**
  - Root structure, documentation, client, server setup
  - Layered Express architecture: Routes -> Middleware -> Controllers -> Services -> Models
  - Structured logging (Pino) & Centralized error handling
  - Zero-friction Database Connection (MongoDB Atlas + In-Memory Fallback for instant setup)
  - Tailwind CSS setup, design system tokens, responsive layouts

- [x] **Phase 2: Authentication & RBAC**
  - JWT authentication with secure bearer headers
  - Password hashing with bcryptjs
  - User model (Resident, Provider, Admin) with role validation
  - Role-based authorization middleware (preventing privilege escalation)
  - IDOR prevention and ownership checks
  - Auth frontend forms: Register, Login, Protected Routes

- [x] **Phase 3: Services & Providers**
  - Service catalog model & seeder
  - ProviderProfile model (skills, pricing, availability, radius, verification status, trust metrics)
  - Provider onboarding & profile editing
  - Search, filter, debounce, pagination for residents to discover nearby verified services

- [x] **Phase 4: Neighbour Requests**
  - ServiceRequest model with structured fields (category, description, budget, preferredDate/Time, neighborhood)
  - Request creation and management
  - Eligible provider matching and request broadcasting
  - ProviderOffer model: providers review requests and submit quotes/offers
  - Resident offer comparison & selection workflow

- [x] **Phase 5: Booking State Machine**
  - Controlled transitions: `PENDING` -> `ACCEPTED` -> `PAYMENT_PENDING` -> `PAID` -> `IN_PROGRESS` -> `COMPLETED`
  - Alternate states: `REJECTED`, `CANCELLED`, `DISPUTED`
  - Server-side state transition guards preventing client tampering
  - Booking tracking UI for residents & providers

- [x] **Phase 6: AI Feature 1 — Service Request Assistant**
  - Natural language problem input ("My kitchen tap is leaking tomorrow morning, budget around 600")
  - Structured extraction via LLM with fallback rule-based regex parser
  - Zod schema validation
  - Editable UI confirmation before request persistence
  - Robust error handling: app stays 100% operational if AI is offline

- [x] **Phase 7: AI Feature 2 — Hybrid Provider Matching**
  - Deterministic hard filtering (category, neighborhood, active verification, availability)
  - Scoring algorithm (experience, rating, completion rate, distance/radius, pricing compatibility)
  - Natural language explanation generation for top matches
  - Human-in-the-loop: resident always retains choice

- [x] **Phase 8: Real-Time Chat & Notifications**
  - Socket.IO server and client integration
  - Conversation and Message models persisted in MongoDB
  - Room authorization: only participants can join/read/send
  - Unread message tracking & in-app notification triggers for booking lifecycle events

- [x] **Phase 9: Razorpay Payment Integration (Test Mode)**
  - Server-side order creation (`orders.create` in paise)
  - Client-side Razorpay test checkout
  - Cryptographic signature verification (`HMAC SHA256`)
  - Webhook endpoint with signature validation and idempotency
  - Clear UI indication of TEST MODE

- [x] **Phase 10: Reviews & Disputes**
  - Review model: only allowed for verified `COMPLETED` bookings; duplicate review prevention
  - Provider rating recalculation
  - Dispute model: residents or providers can raise disputes on contested bookings
  - Admin dispute resolution workflow

- [x] **Phase 11: Admin Dashboard & Analytics**
  - Metrics cards: total users, providers, bookings, revenue volume, disputes
  - Visual analytics with Recharts (booking volume over time, category distribution, user growth)
  - Provider verification queue: approve or reject with feedback
  - Service catalog management & dispute resolution center

- [x] **Phase 12: Security Hardening & Audit**
  - Rate limiting, Helmet security headers, CORS protection
  - Input sanitization, ownership verification on all routes
  - No leaked credentials or fake client-side role updates

- [x] **Phase 13: UI/UX Polish & Responsiveness**
  - High quality micro-interactions, responsive mobile nav
  - Empty states, skeletons, toast notifications, confirmation modals

- [x] **Phase 14: Automated & Manual Testing Suite**
  - End-to-end testing of Resident, Provider, and Admin journeys
  - Unit & integration tests for auth, bookings, payments, and AI fallback (12/12 passing)

- [x] **Phase 15: Production Readiness & Deployment Documentation**
  - Environment variables documentation (.env.example)
  - Production build scripts & deployment instructions
