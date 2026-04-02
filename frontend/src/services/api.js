import axios from 'axios'

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 → clear local session and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lc_token')
      localStorage.removeItem('lc_user')
      const path = window.location.pathname
      if (!path.startsWith('/login') && !path.startsWith('/register')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authAPI = {
  // POST /api/auth/register  { name, email, password }
  // → { user: { _id, email, name, systemUser }, token }
  register: (data) => api.post('/auth/register', data),

  // POST /api/auth/login  { email, password }
  // → { user: { _id, email, name, systemUser }, token }
  login: (data) => api.post('/auth/login', data),

  // POST /api/auth/logout
  logout: () => api.post('/auth/logout'),
}

// ── Accounts API ──────────────────────────────────────────────────────────────
export const accountsAPI = {
  // GET /api/accounts
  // Returns only the LOGGED-IN user's own accounts
  // → { accounts: [ { _id, user, status, currency, createdAt } ] }
  getAll: () => api.get('/accounts'),

  // GET /api/accounts/all  — ADMIN ONLY (authSystemUserMiddleware)
  // Returns ALL accounts across ALL users, user field populated with { name, email }
  // → { accounts: [ { _id, user: { name, email }, status, currency, createdAt } ] }
  getAllForAdmin: () => api.get('/accounts/all'),

  // POST /api/accounts
  // Creates an account tied to the currently logged-in user (no body needed)
  // → { account }
  create: () => api.post('/accounts'),

  // GET /api/accounts/balance/:accountId
  // Admins can query any account; regular users only their own
  // → { accountId, balance }
  getBalance: (accountId) => api.get(`/accounts/balance/${accountId}`),

  // GET /api/accounts/by-email/:email
  // Finds another user's active account by email (used for peer-to-peer transfers)
  // → { account: { _id, user: { name, email }, currency, status } }
  getByEmail: (email) => api.get(`/accounts/by-email/${encodeURIComponent(email)}`),
}

// ── Transactions API ──────────────────────────────────────────────────────────
export const transactionsAPI = {
  // POST /api/transactions  { fromAccount, toAccount, amount, idempotencyKey }
  // authMiddleware — any authenticated user can transfer from their own account
  create: (data) => api.post('/transactions', data),

  // POST /api/transactions/system/initial-funds  { toAccount, amount, idempotencyKey }
  // authSystemUserMiddleware — ONLY systemUser: true accounts can call this
  initialFunds: (data) => api.post('/transactions/system/initial-funds', data),
}

export default api
