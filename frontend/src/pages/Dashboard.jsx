import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useAccounts } from '../hooks'
import { formatCurrency, greeting } from '../utils/helpers'
import { StatCard, Skeleton, EmptyState } from '../components/ui'
import AccountCard from '../components/ui/AccountCard'
import CreateAccountModal from '../components/modals/CreateAccountModal'
import TransferModal from '../components/modals/TransferModal'
import InitialFundsModal from '../components/modals/InitialFundsModal'
import Topbar from '../components/layout/Topbar'

// ── Recent Ledger Movement row ─────────────────────────────────────────────
function MovementRow({ tx, accounts }) {
  if (!tx) return null
  const fromAcc = accounts.find(a => a._id === (tx.fromAccount || tx.fromAccountId))
  const toAcc   = accounts.find(a => a._id === (tx.toAccount   || tx.toAccountId))
  const isDebit = !!tx.fromAccount
  const amt     = tx.amount || 0

  return (
    <div className="flex items-center gap-4 py-3 border-b border-surface-100 last:border-0 hover:bg-surface-50 px-5 -mx-5 rounded-lg transition-colors">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDebit ? 'bg-red-50' : 'bg-emerald-50'}`}>
        <svg width="14" height="14" fill="none" stroke={isDebit ? '#ef4444' : '#10b981'} strokeWidth="2" viewBox="0 0 24 24">
          {isDebit
            ? <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>
            : <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>
          }
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-primary truncate">
          {tx.description || (isDebit ? 'Ledger Transfer' : 'System Initial Funds')}
        </p>
        <p className="text-xs text-ink-muted font-mono truncate">
          {`TXN-${(tx._id || '').slice(-8).toUpperCase()}`}
        </p>
      </div>

      <div className="hidden sm:flex flex-col items-end min-w-0 max-w-[120px]">
        <p className="text-[10px] text-ink-muted uppercase tracking-widest font-semibold truncate">Status</p>
        <span className={`text-xs font-bold mt-0.5 ${tx.status === 'COMPLETED' || tx.status === 'COMPLETE' ? 'text-positive' : tx.status === 'PENDING' ? 'text-warning' : 'text-negative'}`}>
          {tx.status}
        </span>
      </div>

      <div className="hidden md:flex flex-col items-end">
        <p className="text-[10px] text-ink-muted uppercase tracking-widest font-semibold">Date</p>
        <p className="text-xs text-ink-secondary font-mono mt-0.5">
          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
        </p>
      </div>

      <div className="text-right min-w-[80px]">
        <p className={`font-mono font-bold text-sm ${isDebit ? 'text-negative' : 'text-positive'}`}>
          {isDebit ? '-' : '+'}{formatCurrency(amt)}
        </p>
      </div>
    </div>
  )
}

// ── Dashboard Page ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user }   = useAuth()
  const { accounts, balances, totalBalance, loading, balancesLoading, refresh } = useAccounts()

  const [showCreate,  setShowCreate]  = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [showFunds,   setShowFunds]   = useState(false)
  const [selectedAcc, setSelectedAcc] = useState(null)

  const handleTransfer = (account) => {
    setSelectedAcc(account)
    setShowTransfer(true)
  }

  // Mock recent movements — in a full app these come from a transactions endpoint
  const recentMovements = []

  return (
    <>
      <Topbar title="Dashboard" />

      <main className="flex-1 p-6 space-y-6 page-enter">
        {/* Top actions bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-ink-muted text-sm">{greeting()}, {user?.name?.split(' ')[0] || 'User'}</p>
            <h1 className="font-display font-bold text-ink-primary text-2xl mt-0.5">Architectural Overview</h1>
            <p className="text-ink-muted text-sm mt-1 max-w-lg">
              Precision-curated account ledgers for institutional-grade asset management. Monitor balances and transaction flows across the ecosystem.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button className="btn-secondary gap-2">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export Ledger
            </button>
            <button onClick={() => setShowCreate(true)} className="btn-primary gap-2">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create Account
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Ledger Balance"
            value={formatCurrency(totalBalance, true)}
            sub={`Across ${accounts.length} account${accounts.length !== 1 ? 's' : ''}`}
            loading={loading || balancesLoading}
            accent
            icon={
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            }
          />
          <StatCard
            label="Active Accounts"
            value={loading ? '…' : accounts.filter(a => a.status === 'ACTIVE').length}
            sub="All systems nominal"
            loading={loading}
            icon={
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20"/>
              </svg>
            }
          />
          <StatCard
            label="Avg Account Balance"
            value={accounts.length > 0 && !balancesLoading
              ? formatCurrency(totalBalance / accounts.length)
              : '—'}
            sub="Per account average"
            loading={loading || balancesLoading}
            icon={
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            }
          />
          <StatCard
            label="System Status"
            value="Operational"
            sub="All ledgers synced"
            icon={
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            }
          />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Accounts section — 2 cols */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-ink-primary text-base">Ledger Accounts</h2>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 text-brand-500 text-sm font-semibold hover:text-brand-600 transition-colors"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Account
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2].map(i => <Skeleton key={i} className="h-44 rounded-xl2" />)}
              </div>
            ) : accounts.length === 0 ? (
              <div className="card p-2">
                <EmptyState
                  icon={<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20"/></svg>}
                  title="No accounts yet"
                  desc="Create your first ledger account to start managing your finances."
                  action={
                    <button onClick={() => setShowCreate(true)} className="btn-primary">
                      Create First Account
                    </button>
                  }
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {accounts.map((acc, i) => (
                  <AccountCard
                    key={acc._id}
                    account={acc}
                    balance={balances[acc._id]}
                    balanceLoading={balancesLoading}
                    index={i}
                    onTransfer={handleTransfer}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right panel — Initial funds + admin */}
          <div className="space-y-4">
            {/* Admin core card */}
            <div className="bg-surface-900 rounded-xl2 p-5 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
                  <svg width="16" height="16" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M12 2l2.4 4.8L20 8l-4 3.9.9 5.6L12 15l-4.9 2.5.9-5.6L4 8l5.6-.8L12 2z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-display font-bold text-sm">Administrative Core</p>
                  <p className="text-white/40 text-xs">System controls</p>
                </div>
              </div>
              <p className="text-white/50 text-xs leading-relaxed mb-4">
                Execute system-level operations and initial fund seeding. Access to these controls is logged and audited against the primary immutable ledger.
              </p>
              <button
                onClick={() => setShowFunds(true)}
                className="w-full btn bg-brand-500 text-white hover:bg-brand-600 text-sm"
              >
                Add Initial Funds
              </button>
            </div>

            {/* Initial funds inline form */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-ink-primary text-sm">System: Add Initial Funds</p>
                  <p className="text-ink-muted text-xs mt-0.5">Initialize liquidity for new ledger accounts</p>
                </div>
                <span className="badge badge-red text-[9px]">AUTH REQUIRED</span>
              </div>
              <button
                onClick={() => setShowFunds(true)}
                className="w-full btn-secondary text-sm"
              >
                Open System Panel
              </button>
            </div>

            {/* Quick transfer */}
            <div className="card p-5">
              <p className="font-semibold text-ink-primary text-sm mb-3">Quick Transfer</p>
              <p className="text-ink-muted text-xs mb-4">Move funds between your ledger accounts instantly.</p>
              <button
                onClick={() => { setSelectedAcc(null); setShowTransfer(true) }}
                className="w-full btn-primary text-sm"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
                  <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
                </svg>
                New Entry
              </button>
            </div>
          </div>
        </div>

        {/* Recent Ledger Movements */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
            <h2 className="font-display font-semibold text-ink-primary text-base">Recent Ledger Movements</h2>
            <button className="text-brand-500 text-sm font-semibold hover:text-brand-600 transition-colors">
              View All
            </button>
          </div>

          <div className="px-5 py-3">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-4 pb-2 border-b border-surface-100 mb-1">
              {['Description', 'Status', 'Date', 'Amount'].map(h => (
                <p key={h} className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted">{h}</p>
              ))}
            </div>

            {recentMovements.length === 0 ? (
              <div className="py-12 text-center">
                <svg className="mx-auto mb-3 text-ink-muted" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
                  <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
                </svg>
                <p className="text-ink-muted text-sm">No recent movements</p>
                <p className="text-ink-muted text-xs mt-1">Create a transfer to see it here</p>
              </div>
            ) : (
              recentMovements.map((tx, i) => <MovementRow key={i} tx={tx} accounts={accounts} />)
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreateAccountModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={refresh}
      />
      <TransferModal
        open={showTransfer}
        onClose={() => setShowTransfer(false)}
        accounts={accounts}
        balances={balances}
        defaultFrom={selectedAcc}
        onSuccess={refresh}
      />
      <InitialFundsModal
        open={showFunds}
        onClose={() => setShowFunds(false)}
        accounts={accounts}
        onSuccess={refresh}
      />
    </>
  )
}
