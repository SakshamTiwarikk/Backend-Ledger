import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAllAccounts } from '../hooks'          // ← uses the admin-specific hook
import { formatCurrency, shortId } from '../utils/helpers'
import { Skeleton, Badge } from '../components/ui'
import InitialFundsModal from '../components/modals/InitialFundsModal'
import Topbar from '../components/layout/Topbar'

function InfoCard({ label, value, icon, color = 'text-brand-500', bg = 'bg-brand-50', loading = false }) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <span className={color}>{icon}</span>
      </div>
      <div>
        <p className="text-xs text-ink-muted uppercase tracking-widest font-semibold">{label}</p>
        {loading
          ? <div className="skeleton h-6 w-24 mt-1 rounded" />
          : <p className="font-mono font-bold text-ink-primary text-lg mt-0.5">{value}</p>
        }
      </div>
    </div>
  )
}

export default function Admin() {
  // useAllAccounts fetches GET /api/accounts/all — returns every user's account
  // with user.name and user.email populated so admin can see who owns each account
  const { accounts, balances, totalBalance, loading, balancesLoading, refresh } = useAllAccounts()
  const [showFunds, setShowFunds] = useState(false)

  // Only show non-admin (regular user) accounts in the seeding dropdown
  // Filter is optional — showing all is fine too since admin can add funds to any account
  const userAccounts = accounts.filter(a => {
    // If user field is populated as an object, we have the name/email available
    return a.status === 'ACTIVE'
  })

  return (
    <>
      <Topbar title="Admin" />

      <main className="flex-1 p-6 space-y-6 page-enter">
        {/* Page header */}
        <div>
          <p className="text-ink-muted text-xs font-semibold uppercase tracking-widest mb-1">
            System Administration
          </p>
          <h1 className="font-display font-bold text-ink-primary text-2xl">Admin Panel</h1>
          <p className="text-ink-muted text-sm mt-1">
            Execute system-level operations and monitor the full ledger ecosystem.
            All actions here are immutably logged.
          </p>
        </div>

        {/* System stats — now reflects ALL users' data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard
            label="Total Ledger Value"
            value={formatCurrency(totalBalance)}
            loading={loading || balancesLoading}
            icon={
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            }
          />
          <InfoCard
            label="Total Accounts"
            value={loading ? '…' : accounts.length}
            loading={loading}
            bg="bg-emerald-50"
            color="text-emerald-600"
            icon={
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20"/>
              </svg>
            }
          />
          <InfoCard
            label="Active Accounts"
            value={loading ? '…' : accounts.filter(a => a.status === 'ACTIVE').length}
            loading={loading}
            bg="bg-violet-50"
            color="text-violet-600"
            icon={
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            }
          />
          <InfoCard
            label="System Status"
            value="Operational"
            bg="bg-emerald-50"
            color="text-emerald-600"
            icon={
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            }
          />
        </div>

        {/* Operations grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Initial Fund Seeding card */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-surface-900 rounded-xl flex items-center justify-center">
                <svg width="18" height="18" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M12 2l2.4 4.8L20 8l-4 3.9.9 5.6L12 15l-4.9 2.5.9-5.6L4 8l5.6-.8L12 2z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-display font-semibold text-ink-primary">Initial Fund Seeding</h3>
                <p className="text-ink-muted text-xs mt-0.5">Requires systemUser privilege</p>
              </div>
            </div>

            <p className="text-ink-muted text-sm mb-4 leading-relaxed">
              Add initial liquidity to any user account. Creates a system-to-account
              ledger transaction permanently recorded in the audit trail.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
              <p className="text-amber-700 text-xs font-medium flex items-start gap-2">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <circle cx="12" cy="16" r="0.5" fill="currentColor"/>
                </svg>
                Only accounts with <strong className="mx-1">systemUser: true</strong> in MongoDB
                can call POST /api/transactions/system/initial-funds.
              </p>
            </div>

            <button
              onClick={() => setShowFunds(true)}
              disabled={loading}
              className="btn-primary w-full"
            >
              Open Initial Funds Panel
            </button>
          </div>

          {/* API reference */}
          <div className="card p-6">
            <h3 className="font-display font-semibold text-ink-primary mb-4">API Reference</h3>
            <div className="space-y-2">
              {[
                { method: 'POST', path: '/api/auth/register',                         desc: 'Register new user' },
                { method: 'POST', path: '/api/auth/login',                            desc: 'Authenticate user' },
                { method: 'POST', path: '/api/auth/logout',                           desc: 'Invalidate token' },
                { method: 'GET',  path: '/api/accounts',                              desc: "Own user's accounts" },
                { method: 'GET',  path: '/api/accounts/all',                          desc: 'All accounts (admin)' },
                { method: 'POST', path: '/api/accounts',                              desc: 'Create account' },
                { method: 'GET',  path: '/api/accounts/balance/:id',                  desc: 'Get balance' },
                { method: 'GET',  path: '/api/accounts/by-email/:email',              desc: 'Find by email' },
                { method: 'POST', path: '/api/transactions',                          desc: 'Create transfer' },
                { method: 'POST', path: '/api/transactions/system/initial-funds',     desc: 'Seed funds (admin)' },
              ].map(r => (
                <div key={r.path} className="flex items-center gap-3 py-1.5 border-b border-surface-50 last:border-0">
                  <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded min-w-[44px] text-center
                    ${r.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {r.method}
                  </span>
                  <code className="font-mono text-xs text-ink-secondary flex-1 truncate">{r.path}</code>
                  <span className="text-xs text-ink-muted hidden sm:block truncate max-w-[120px]">{r.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full account registry — shows ALL users' accounts */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-ink-primary text-base">
                Full Account Registry
              </h3>
              <p className="text-ink-muted text-xs mt-0.5">
                All user accounts across the platform — {accounts.length} total
              </p>
            </div>
            <button
              onClick={refresh}
              className="btn-ghost text-xs py-1.5 px-3 gap-1.5"
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50">
                  {['Account ID', 'Owner Name', 'Owner Email', 'Currency', 'Status', 'Balance', 'Created'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-ink-muted whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  // Skeleton rows while loading
                  [1,2,3].map(i => (
                    <tr key={i} className="border-b border-surface-50">
                      {[1,2,3,4,5,6,7].map(j => (
                        <td key={j} className="px-5 py-4">
                          <Skeleton className="h-4 w-20 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : accounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <p className="text-ink-muted text-sm">No accounts found</p>
                      <p className="text-ink-muted text-xs mt-1">
                        User accounts will appear here once users register and create accounts.
                      </p>
                    </td>
                  </tr>
                ) : (
                  accounts.map((acc, i) => (
                    <motion.tr
                      key={acc._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-surface-50 hover:bg-surface-50 transition-colors"
                    >
                      {/* Account ID */}
                      <td className="px-5 py-3.5">
                        <p className="font-mono text-xs text-ink-secondary font-medium">
                          {shortId(acc._id)}
                        </p>
                        <p className="text-[10px] text-ink-muted font-mono mt-0.5">
                          {acc._id.slice(0, 12)}…
                        </p>
                      </td>

                      {/* Owner Name — populated from user document */}
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-ink-primary">
                          {/* acc.user is populated as { name, email } by the backend */}
                          {typeof acc.user === 'object' ? acc.user?.name : '—'}
                        </p>
                      </td>

                      {/* Owner Email */}
                      <td className="px-5 py-3.5">
                        <p className="text-xs text-ink-secondary">
                          {typeof acc.user === 'object' ? acc.user?.email : '—'}
                        </p>
                      </td>

                      {/* Currency */}
                      <td className="px-5 py-3.5">
                        <span className="badge badge-blue text-[10px]">
                          {acc.currency || 'INR'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <Badge status={acc.status} />
                      </td>

                      {/* Balance */}
                      <td className="px-5 py-3.5">
                        {balancesLoading
                          ? <Skeleton className="h-4 w-20 rounded" />
                          : <span className="font-mono text-sm font-semibold text-ink-primary">
                              {formatCurrency(balances[acc._id])}
                            </span>
                        }
                      </td>

                      {/* Created At */}
                      <td className="px-5 py-3.5 text-xs text-ink-muted whitespace-nowrap">
                        {acc.createdAt
                          ? new Date(acc.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })
                          : '—'
                        }
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal receives all active user accounts from GET /api/accounts/all */}
      {/* balances lets the modal show the current balance of the selected account */}
      <InitialFundsModal
        open={showFunds}
        onClose={() => setShowFunds(false)}
        accounts={userAccounts}
        balances={balances}
        accountsLoading={loading}
        onSuccess={refresh}
      />
    </>
  )
}
