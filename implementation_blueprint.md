# B2B Inventory & Ordering System: Implementation Blueprint

This document details the software development blueprint for the mobile-first B2B Inventory & Ordering System. It establishes the folder structures, state management rules, offline-sync protocols, devops pipeline configuration, and a step-by-step release schedule for the React Native + Expo mobile client and the NestJS backend.

---

## 1. React Native (Expo) Folder Structure

*We adopt a feature-based folder structure inside a `/src` directory to support scalable development while maintaining clean separation of concerns.*

```
/
├── app.json                 # Expo config
├── App.tsx                  # App root entry
├── package.json
├── tsconfig.json
└── src/
    ├── assets/              # Static media, icons, and localized fonts
    │   ├── fonts/           # Outfit (Bold, SemiBold), Inter (Regular, Bold)
    │   └── images/          # Image assets, app icons
    ├── components/          # Reusable presentation components
    │   ├── Button/          # Large B2BButton touch targets
    │   ├── Card/            # B2BProductCard, B2BOrderCard
    │   ├── Feedback/        # SkeletonLoader, ToastAlerts
    │   └── Input/           # B2BTextInput, MatrixGridCounter
    ├── database/            # SQLite & MMKV configurations
    │   ├── schema.ts        # Expo SQLite schema definitions
    │   └── mmkvStore.ts     # Encrypted MMKV key-value storage setup
    ├── features/            # Feature-scoped modules (Logic, Hooks, Screens)
    │   ├── auth/            # Login, forgot password
    │   ├── catalog/         # Categories, products, details
    │   ├── customer/        # Profiles, dealer lookups
    │   ├── ledger/          # Balance screens, entry logs
    │   ├── notifications/   # Push feeds
    │   ├── orders/          # Cart, order sheets, history
    │   └── sync/            # Sync indicators, trigger controls
    ├── hooks/               # Global utility hooks (useVoiceSearch, useNetwork)
    ├── navigation/          # React Navigation configurations
    │   ├── AppNavigator.tsx # Root Navigation Router
    │   ├── TabNavigator.tsx # bottom tab navigation configs
    │   └── types.ts         # TypeScript navigation route params types
    ├── services/            # API integration layers
    │   ├── api.ts           # Axios instance with refresh token interceptors
    │   └── queryClient.ts   # TanStack Query client configuration
    ├── store/               # Zustand global state definitions
    │   ├── useAuthStore.ts  # Session token state
    │   └── useCartStore.ts  # Local cart and matrix quantity states
    ├── types/               # Global typescript typings
    └── utils/               # Helper tools (formatters, validator schemas)
```

---

## 2. Backend NestJS Folder Structure

*The NestJS backend follows a domain-driven module architecture. Each business capability wraps its controller, service, Prisma data access, and validation DTOs.*

```
src/
├── app.module.ts             # App core root module
├── main.ts                   # Entry bootstrap, NestJS settings
├── prisma/                   # Prisma ORM setup
│   ├── schema.prisma         # Postgres relation definitions
│   └── seed.ts               # Database mock seeding
├── common/                   # Global guards, interceptors, and filters
│   ├── decorators/           # Custom decorators (e.g., GetUser)
│   ├── filters/              # Global RFC 7807 Exception Filter
│   ├── guards/               # JwtAuthGuard, RolesGuard
│   └── interceptors/         # Logging and transaction interceptors
└── modules/                  # Feature modular business blocks
    ├── auth/                 # JWT token lifecycle, refresh rotations
    ├── customers/            # Profiles, credit limits updates
    ├── products/             # Product catalog, variants, presigned urls
    ├── inventory/            # ATP stock calculations, audit triggers
    ├── orders/               # Transactional checkout, reservations
    ├── dispatches/           # Packing lists, LR logs, deliver triggers
    ├── invoices/             # Billing PDF rendering, S3 file triggers
    ├── ledger/               # Double-entry ledger records, aging logic
    ├── notifications/        # WebSockets and Firebase dispatchers
    └── sync/                 # Delta sync bundle computations (Pull/Push)
```

---

## 3. State Management Strategy

To ensure optimal performance and eliminate redundant network fetches, global states are divided between client-side session states (**Zustand**) and server-state caching (**TanStack Query**).

### 3.1 Zustand (Local Client State)
*   **Purpose**: Manages transient client data that does not require persistent server sync but is accessed globally across screens.
*   **Key Store Allocations**:
    1.  `Auth Store`: User authentication details, active JWT, refresh token string, and permissions matrix.
    2.  `Cart Store`: Active selections, product matrix quantities (e.g., matching Size x Finish quantities), and credit limit verification limits.
    3.  `Sync Queue Store`: Tracks the local queue of modifications made while offline (`pending_sync` queue counters).
*   **Storage Bindings**: Persisted to local storage using fast **MMKV** key-value storage.

### 3.2 TanStack Query (Server Cache State)
*   **Purpose**: Handles all remote HTTP network calls, data caching, background revalidations, and cache invalidation schedules.
*   **Usage**:
    *   `useQuery`: Fetches product catalogs (`GET /products`), ledger lists (`GET /ledger`), and order details. Automatically returns cached copies while executing background fetches.
    *   `useMutation`: Triggers state changes (e.g., order booking `POST /orders`, dispatch delivery triggers). Automates caching updates using `queryClient.invalidateQueries`.
    *   *Configuration*: `staleTime` defaults to 5 minutes for catalogs; ledger summaries default to 10 seconds to maintain financial accuracy.

---

## 4. Offline Sync Architecture

*The app is offline-first. App write mutations are queued locally inside SQLite, and sync operations occur incrementally.*

```
[Offline Mutation] ──► [Save to Local SQLite] ──► [Add to Outbox Queue]
                                                         │
                                                  (Network Restored)
                                                         ▼
[Server Success] ◄─── [Process POST /sync/push] ◄────── [Upload Queue]
```

### 4.1 SQLite Storage & Outbox Table
*   Local database queries are run against SQLite (accessed via Expo SQLite).
*   A special `sync_outbox` table is maintained to track offline changes:
```sql
CREATE TABLE sync_outbox (
  id TEXT PRIMARY KEY,
  table_name TEXT NOT NULL,       -- e.g., 'orders'
  action TEXT NOT NULL,           -- 'CREATE', 'UPDATE'
  payload TEXT NOT NULL,          -- JSON payload data
  created_at INTEGER NOT NULL
);
```

### 4.2 Sync Protocol
1.  **Push Cycle (Local $\rightarrow$ Server)**:
    *   When connection is restored, the sync manager fetches all rows in `sync_outbox` sorted by `created_at` ascending.
    *   Sends a POST request to `/api/v1/sync/push`.
    *   The server processes mutations inside atomic transaction blocks.
2.  **Conflict Resolution & De-duplication**:
    *   *Double Insertions*: The server enforces a unique database constraint on the `offline_client_id` column. If a request is retried due to a dropped connection, the server catches the duplicate key conflict and returns a success block.
    *   *Out of Stock / Credit Limits*: If an offline order fails validation (e.g. credit limit exceeded), the server saves the order with a status of `PENDING_APPROVAL` and registers a push notification alert.
    *   *Conflict Resolution*: In cases of catalog modifications, the server's database acts as the single source of truth. Version tracking fields (`version: BIGINT`) are checked. If a version mismatch occurs, the server responds with a `409 Conflict`, prompting the mobile client to pull changes first.
3.  **Pull Cycle (Server $\rightarrow$ Local)**:
    *   On success of the push cycle, the client runs `GET /api/v1/sync/pull?lastPulledAt=timestamp`.
    *   The database query returns only the row delta changes modified since that timestamp.
    *   The client updates its SQLite tables and records the new `serverTime` as its latest synchronization timestamp.

---

## 5. Development Sprint Plan (10-Sprint Roadmap)

*Each sprint represents a 2-week development cycle targeting clean functional deliverables.*

### Sprint 1: Foundation & Project Bootstrap
*   *Backend*: Init NestJS, configure PostgreSQL schema inside Prisma, seed initial data.
*   *Frontend*: Init Expo project, configure TypeScript, structure global folders, load Design Token constants.
*   *Outcome*: App builds and runs on simulators; database connections are established.

### Sprint 2: Core Auth & User Session
*   *Backend*: Auth modules (`/auth/login`, `/auth/refresh`, JWT generation, token rotation rules).
*   *Frontend*: Login screen, forgot password forms, Zustand auth store with MMKV.
*   *Outcome*: Secure user login, session caching, and token refreshing verified.

### Sprint 3: Catalog & Products
*   *Backend*: Categories and Product modules (`GET /categories`, `GET /products`, search filters).
*   *Frontend*: B2BProductCard, Product catalog search, category pill filter sliders.
*   *Outcome*: Catalog browsing with fuzzy voice search.

### Sprint 4: Variant Grid & Local Cart
*   *Backend*: Variant management panel, product image presigned S3 URLs.
*   *Frontend*: Product details screen, Size × Finish dropdown grid picker, Zustand cart store.
*   *Outcome*: Users can build and edit their shopping cart using standard box package multipliers.

### Sprint 5: Transactional Order Booking
*   *Backend*: Transactional checkout endpoints (`POST /orders`). Implements optimistic concurrency locks and Available-To-Promise (ATP) allocations.
*   *Frontend*: Checkout confirmations, credit limit alerts, order booking integration.
*   *Outcome*: Orders placed, stock reserved, and backorders automatically computed.

### Sprint 6: Customer Profile & Ledger Account
*   *Backend*: Customer details, Ledger module integration (chronological debit/credit entry listings).
*   *Frontend*: Customer profiles, outstanding balance banners, ledger statements.
*   *Outcome*: Distributors can check outstanding balances and download transactions.

### Sprint 7: Picking & Dispatches
*   *Backend*: Dispatch endpoints (`POST /dispatches`), status transitions matching state machine.
*   *Frontend*: Staff packing sheets, LR tracking number forms, camera QR barcode scanner triggers.
*   *Outcome*: Staff can scan invoice QR codes and dispatch order items.

### Sprint 8: Delivery Confirmation & Billing
*   *Backend*: Delivery endpoints (`POST /dispatches/:id/deliver`), auto-billing, ledger debit triggers, S3 invoice PDF rendering.
*   *Frontend*: Delivery forms, invoice PDF list screens, WhatsApp sharing payloads.
*   *Outcome*: Delivering a package generates invoices and writes entries to ledger balances.

### Sprint 9: Notifications & Sync
*   *Backend*: WebSocket sync controls, push notification dispatchers.
*   *Frontend*: In-app notifications feed, offline detection banners, SQLite outbox sync.
*   *Outcome*: Offline ordering queued and auto-synced.

### Sprint 10: Super Admin Overrides
*   *Backend*: Force approvals, manual inventory adjustment overrides, reports generator.
*   *Frontend*: Admin dashboards, reports lists, inventory modification overlays.
*   *Outcome*: Admins can override credit limits and check dashboard metrics.

---

## 6. CI/CD Plan

```
[GitHub Merge] ──► [Lint & Unit Test] ──► [Build Docker / Expo EAS]
                                                  │
                                          ┌───────┴───────┐
                                          ▼               ▼
                                   [Staging Deploy] [Production Deploy]
```

### 6.1 Backend Pipeline (Docker + ECS Fargate)
*   **CI Trigger**: Pull requests to `main` or `staging` branches.
*   **Actions**:
    1.  Runs `npm run lint` and unit/integration tests.
    2.  Builds Docker production container image.
    3.  Pushes container image to AWS ECR.
    4.  Triggers rolling deployment to Amazon ECS (Fargate) staging/production task definitions.

### 6.2 Frontend Pipeline (Expo Application Services - EAS)
*   **CI Trigger**: Commits to release branches.
*   **Actions**:
    1.  Runs TypeScript compilation checks.
    2.  Triggers EAS CLI: `eas build --platform all --profile staging`.
    3.  Automates Over-The-Air (OTA) updates for JS bundle changes via `eas update`.
    4.  Pushes binaries to TestFlight (iOS) and Google Play Console Internal Track (Android).

---

## 7. Environment Strategy

| Parameter | Local Development | Staging | Production |
| :--- | :--- | :--- | :--- |
| **API URL** | `http://localhost:3000/api/v1` | `https://staging-api.b2binventory.com/api/v1` | `https://api.b2binventory.com/api/v1` |
| **Database** | Local Postgres (Docker) | AWS RDS PostgreSQL (Multi-AZ dev instance) | AWS RDS PostgreSQL (Multi-AZ production instance) |
| **Redis** | Local Redis Container | AWS ElastiCache Redis | AWS ElastiCache Redis |
| **Files/PDF** | Local Mock Storage | AWS S3 Staging Bucket | AWS S3 Production Bucket |
| **Push Alerts** | Firebase Sandbox | Firebase Development | Firebase Production |

---

## 8. Testing Strategy

### 8.1 Unit Testing (Jest)
*   *Coverage Target*: $\ge 80\%$.
*   *Targets*:
    *   **Backend**: Helper utilities, ledger balance formulas, ATP stock calculations.
    *   **Frontend**: Zustand store selectors, utility date formatters, Zod schema validations.

### 8.2 Integration Testing (Supertest / Mock Service Worker)
*   *Targets*:
    *   **Backend**: `POST /orders` lifecycle tests (verifying concurrent transaction locks, credit balance failures, and database rollback behaviors).
    *   **Frontend**: Mock Service Worker (MSW) intercepts to verify API call state updates and offline queue writes.

### 8.3 End-to-End Testing (E2E)
*   *Frameworks*: **Detox** (React Native) & **Playwright** (Backend API flows).
*   *Critical Paths tested on every release build*:
    1.  Login $\rightarrow$ Scan QR code $\rightarrow$ Adjust Inventory.
    2.  Create Order (Offline) $\rightarrow$ Reconnect Network $\rightarrow$ Verify Sync.
    3.  Approve Order (Over Limit) $\rightarrow$ Deliver Dispatch $\rightarrow$ Check Ledger Debit Balance.

---

## 9. Release Roadmap & MVP Launch Criteria

### 9.1 Alpha Stage (Internal Testing)
*   Tested by in-house sales staff (Anil) and warehouse handlers (Rajesh).
*   *Objective*: Verify barcode scanning accuracy, sync reliability, and presbyopia visual comfort.

### 9.2 Beta Stage (Controlled Launch)
*   Released to 5 select distributors (e.g. Om Colour).
*   *Objective*: Monitor credit limit checks, ledger accuracy, and transaction performance in low-connectivity areas.

### 9.3 General MVP Launch Criteria
*   Zero critical data mutations failures in ledger or inventory transactions.
*   Full compliance with the 3-tap rule for order placements and ledger views.
*   EAS builds successfully running on Android 9+ and iOS 14+.
*   Successful automatic generation and WhatsApp delivery of invoice PDFs.

---

## 10. Code Generation Order

To minimize development blocks, modules should be built in the following sequence:

```
[Module 1: Authentication] ──► [Module 2: Products & Catalog] ──► [Module 3: Customers & Dues]
                                                                          │
                                                                          ▼
[Module 6: Ledger & Invoices] ◄── [Module 5: Dispatches & Delivery] ◄── [Module 4: Orders & ATP]
           │
           ▼
[Module 7: Sync Engine] ──► [Module 8: Admin Dashboards & Reports]
```

1.  **Authentication & Sessions**: Connect NestJS JWT auth with the React Native Login UI and Zustand stores.
2.  **Products & Catalog**: Build inventory variants schemas, seed catalog data, and implement catalog lookups on the mobile app.
3.  **Customers & Profiles**: Build customer details APIs, assigned staff associations, and profile dashboards.
4.  **Orders & Available-to-Promise (ATP)**: Establish order checkout routes, Prisma transactions, row-level locks, and mobile checkout pages.
5.  **Dispatches & Shipments**: Create dispatch models, packing slips, transport/LR fields, and QR scanner interfaces.
6.  **Ledger & Invoices**: Build ledger balance calculations, double-entry accounting updates, S3 PDF generation, and WhatsApp sharing.
7.  **Sync Engine**: Write sync pull/push controllers, SQLite outbox processing, and conflict resolution rules.
8.  **Admin Overrides & Reports**: Implement override features, dashboard KPI metrics, and report extraction tools.
