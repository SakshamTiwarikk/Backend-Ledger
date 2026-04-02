import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAccounts } from '../hooks'
import { formatCurrency, shortId } from '../utils/helpers'
import { Skeleton, EmptyState, Badge } from '../components/ui'
import AccountCard from '../components/ui/AccountCard'
import CreateAccountModal from '../components/modals/CreateAccountModal'
import TransferModal from '../components/modals/TransferModal'
import Topbar from '../components/layout/Topbar'

export default function Accounts() {
  const { accounts, balances, totalBalance, loading, balancesLoading, refresh } = useAccounts()
  const [showCreate,   setShowCreate]   = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [selectedAcc,  setSelectedAcc]  = useState(null)

  const handleTransfer = (acc) => {
    setSelectedAcc(acc)
    setShowTransfer(true)
  }

  return (
    <>
      <Topbar title="Accounts" />

      <main className="flex-1 p-6 space-y-6 page-enter">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-ink-primary text-2xl">Accounts</h1>
            <p className="text-ink-muted text-sm mt-1">
              {accounts.length} ledger account{accounts.length !== 1 ? 's' : ''} — Total: <span className="font-semibold text-ink-primary font-mono">{formatCurrency(totalBalance)}</span>
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary self-start sm:self-auto">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create Account
          </button>
        </div>

        {/* Account cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-44 rounded-xl2" />)}
          </div>
        ) : accounts.length === 0 ? (
          <div className="card p-2">
            <EmptyState
              icon={
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20"/>
                </svg>
              }
              title="No accounts"
              desc="Create your first ledger account to get started."
              action={<button onClick={() => setShowCreate(true)} className="btn-primary">Create Account</button>}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* Account detail table */}
        {accounts.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-100">
              <h2 className="font-display font-semibold text-ink-primary text-base">Account Registry</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-100 bg-surface-50">
                    {['Account ID', 'Currency', 'Status', 'Balance', 'Created', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-ink-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acc, i) => (
                    <motion.tr
                      key={acc._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-surface-50 hover:bg-surface-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-mono text-xs text-ink-secondary font-medium">{shortId(acc._id)}</p>
                        <p className="text-[10px] text-ink-muted mt-0.5 font-mono">{acc._id.slice(0, 12)}…</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="badge badge-blue">{acc.currency || 'INR'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge status={acc.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        {balancesLoading
                          ? <Skeleton className="h-4 w-24" />
                          : <span className="font-mono text-sm font-semibold text-ink-primary">
                              {formatCurrency(balances[acc._id])}
                            </span>
                        }
                      </td>
                      <td className="px-5 py-3.5 text-xs text-ink-muted">
                        {acc.createdAt ? new Date(acc.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleTransfer(acc)}
                          disabled={acc.status !== 'ACTIVE'}
                          className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
                        >
                          Transfer
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <CreateAccountModal open={showCreate} onClose={() => setShowCreate(false)} onSuccess={refresh} />
      <TransferModal
        open={showTransfer}
        onClose={() => setShowTransfer(false)}
        accounts={accounts}
        balances={balances}
        defaultFrom={selectedAcc}
        onSuccess={refresh}
      />
    </>
  )
}
