# B2B Inventory & Ordering System

A mobile-first B2B ordering, inventory visibility, and customer ledger platform for a Hardware Fittings manufacturing business.

---

## Repository Structure

```
/
├── apps/
│   ├── mobile/     # React Native + Expo (TypeScript) — Field sales & customer app
│   └── server/     # NestJS + Prisma + PostgreSQL — Backend API
├── docs/           # Architecture specifications
└── README.md
```

---

## Tech Stack

### Mobile (`apps/mobile`)
- **Framework**: React Native + Expo (SDK 52+)
- **Language**: TypeScript (strict mode)
- **State**: Zustand (local) + TanStack Query (server cache)
- **Navigation**: React Navigation v7 (Native Stack + Bottom Tabs)
- **Forms**: React Hook Form + Zod
- **Storage**: react-native-mmkv (encrypted key-value)
- **Offline**: SQLite (Expo SQLite) — Sprint 9

### Backend (`apps/server`)
- **Framework**: NestJS 11 (strict TypeScript)
- **ORM**: Prisma 7
- **Database**: PostgreSQL
- **Cache**: Redis (Sprint 5+)
- **Auth**: JWT (Access + Refresh tokens)

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm 9+

### Backend Setup
```bash
cd apps/server

# 1. Copy and configure environment
cp .env.example .env
# Edit DATABASE_URL and JWT secrets in .env

# 2. Install dependencies
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Run database migrations (requires running PostgreSQL)
npx prisma migrate dev

# 5. Start development server
npm run start:dev
```

### Mobile Setup
```bash
cd apps/mobile

# 1. Install dependencies
npm install

# 2. Start Expo development server
npm start

# 3. Scan QR code with Expo Go app or run on emulator
npm run android
# or
npm run ios
```

---

## Sprint Progress

| Sprint | Focus | Status |
|--------|-------|--------|
| Sprint 1 | Bootstrap, Prisma, Navigation, Theme, Zustand | ✅ Complete |
| Sprint 2 | Auth (JWT Login, Biometrics, Session) | 🔲 Pending |
| Sprint 3 | Product Catalog & Search | 🔲 Pending |
| Sprint 4 | Variant Grid & Cart | 🔲 Pending |
| Sprint 5 | Order Booking & ATP Allocation | 🔲 Pending |
| Sprint 6 | Customer Ledger | 🔲 Pending |
| Sprint 7 | Dispatch & Tracking | 🔲 Pending |
| Sprint 8 | Invoices & WhatsApp Sharing | 🔲 Pending |
| Sprint 9 | Offline Sync Engine | 🔲 Pending |
| Sprint 10 | Admin Dashboard & Reports | 🔲 Pending |

---

## Architecture Documentation

All specification documents are in the project root:

- `lean_scope_definition.md` — V1 scope decisions
- `database_schema_specification.md` — PostgreSQL ERD
- `implementation_blueprint.md` — Sprint plan & folder structure
- `design_system_specification.md` — Design tokens & UI guidelines
- `api_contract_specification.md` — REST API contracts
- `mobile_screen_specification.md` — Screen-by-screen UX specs