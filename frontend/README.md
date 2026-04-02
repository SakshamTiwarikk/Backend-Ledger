# LedgerCurator Frontend

**Precision financial management UI** — built with React + Vite + Tailwind CSS + Framer Motion.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (backend must be running on :3000)
npm run dev

# Visit http://localhost:5173
```

> Backend: `cd Backend-Ledger && npm run dev` (port 3000)

---

## Project Structure

```
src/
├── pages/
│   ├── Login.jsx            # Auth login — POST /api/auth/login
│   ├── Register.jsx         # Auth register — POST /api/auth/register
│   ├── Dashboard.jsx        # Architectural overview with account cards
│   ├── Accounts.jsx         # Account registry + balance table
│   ├── Transactions.jsx     # Create entry form + ledger history
│   └── Admin.jsx            # System operations + API reference
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx    # Sidebar + main content wrapper
│   │   ├── Sidebar.jsx      # Responsive nav (desktop fixed, mobile drawer)
│   │   └── Topbar.jsx       # Breadcrumb + search + user menu
│   ├── ui/
│   │   ├── index.jsx        # Spinner, Skeleton, Badge, StatCard, EmptyState
│   │   └── AccountCard.jsx  # Dark gradient account card with live balance
│   └── modals/
│       ├── CreateAccountModal.jsx  # POST /api/accounts
│       ├── TransferModal.jsx       # POST /api/transactions
│       └── InitialFundsModal.jsx   # POST /api/transactions/system/initial-funds
│
├── services/
│   └── api.js               # Axios instance + all API methods
│
├── context/
│   └── AuthContext.jsx      # JWT auth state with localStorage persistence
│
├── hooks/
│   └── index.js             # useAccounts, useOutsideClick, useLocalStorage
│
└── utils/
    └── helpers.js           # formatCurrency, shortId, formatDate, getErrorMsg
```

---

## Backend API Contract

| Method | Endpoint                                  | Auth      | Notes                              |
|--------|-------------------------------------------|-----------|------------------------------------|
| POST   | `/api/auth/register`                      | None      | `{ name, email, password }`       |
| POST   | `/api/auth/login`                         | None      | `{ email, password }`             |
| POST   | `/api/auth/logout`                        | Token     | Blacklists token                   |
| GET    | `/api/accounts`                           | JWT       | Returns `{ accounts: [...] }`     |
| POST   | `/api/accounts`                           | JWT       | No body — account tied to user    |
| GET    | `/api/accounts/balance/:accountId`        | JWT       | Returns `{ accountId, balance }`  |
| POST   | `/api/transactions`                       | JWT       | `{ fromAccount, toAccount, amount, idempotencyKey }` |
| POST   | `/api/transactions/system/initial-funds`  | SystemJWT | `{ toAccount, amount, idempotencyKey }` — `systemUser: true` required |

### Important field names (exact match with backend):
- Transactions use `fromAccount` / `toAccount` (not `fromAccountId`)
- Every transaction requires a unique `idempotencyKey` (frontend auto-generates UUID)
- Initial funds endpoint is protected by `authSystemUserMiddleware` — only `systemUser: true` users

---

## Tech Stack

| Package          | Version | Purpose                  |
|------------------|---------|--------------------------|
| React            | 18      | UI framework             |
| Vite             | 5       | Build tool               |
| Tailwind CSS     | 3       | Utility-first styling    |
| Framer Motion    | 11      | Page/modal animations    |
| Axios            | 1.6     | HTTP client              |
| React Router     | 6       | Client-side routing      |
| react-hot-toast  | 2       | Toast notifications      |
| uuid             | 10      | Idempotency key gen      |

---

## Design System

| Element           | Value                                      |
|-------------------|--------------------------------------------|
| Primary color     | `#2563EB` (brand-500)                     |
| Background        | `#f1f5f9` (surface-100)                   |
| Card background   | `#ffffff`                                  |
| Display font      | Bricolage Grotesque (headings)             |
| Body font         | Manrope                                    |
| Mono font         | JetBrains Mono (amounts, IDs)             |

---

## Build for Production

```bash
npm run build
# Output in dist/ — serve with any static host
```
