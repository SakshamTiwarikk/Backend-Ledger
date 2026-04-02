import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { transactionsAPI } from '../../services/api'
import { getErrorMsg, formatCurrency } from '../../utils/helpers'
import { Spinner } from '../ui'
import toast from 'react-hot-toast'

const overlay = { hidden: { opacity: 0 }, visible: { opacity: 1 } }
const panel = {
  hidden:  { opacity: 0, scale: 0.96, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 420, damping: 32 } },
  exit:    { opacity: 0, scale: 0.96, y: 6, transition: { duration: 0.15 } },
}

export default function InitialFundsModal({ open, onClose, accounts, balances, accountsLoading, onSuccess }) {
  const [form, setForm]       = useState({ toAccount: '', amount: '' })
  const [loading, setLoading] = useState(false)

  // Reset form whenever modal opens
  useEffect(() => {
    if (open) setForm({ toAccount: '', amount: '' })
  }, [open])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const handleClear = () => setForm({ toAccount: '', amount: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.toAccount) return toast.error('Please select a target account')
    const amt = parseFloat(form.amount)
    if (!amt || amt <= 0) return toast.error('Enter a valid amount greater than 0')

    setLoading(true)
    try {
      await transactionsAPI.initialFunds({
        toAccount:      form.toAccount,
        amount:         amt,
        idempotencyKey: uuidv4(),
      })
      toast.success('Initial funds added successfully!')
      onSuccess?.()
      onClose()
    } catch (err) {
      if (err?.response?.status === 403) {
        toast.error('Access denied: only system admin can add initial funds')
      } else {
        toast.error(getErrorMsg(err, 'Failed to add initial funds'))
      }
    } finally {
      setLoading(false)
    }
  }

  // Find the currently selected account object to show its details
  const selected = accounts.find(a => a._id === form.toAccount)

  // Build display name for each account in dropdown
  // acc.user is populated as { name, email } from GET /api/accounts/all
  const getLabel = (acc) => {
    const shortId  = acc._id.slice(-6).toUpperCase()
    const currency = acc.currency || 'INR'
    const owner    = typeof acc.user === 'object' && acc.user !== null
      ? `${acc.user.name} — ${acc.user.email}`
      : `Account`
    return `${owner} | ${currency} #${shortId}`
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={overlay} initial="hidden" animate="visible" exit="hidden"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            variants={panel} initial="hidden" animate="visible" exit="exit"
            className="w-full max-w-md card-md p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-900 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M12 2l2.4 4.8L20 8l-4 3.9.9 5.6L12 15l-4.9 2.5.9-5.6L4 8l5.6-.8L12 2z"/>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display font-bold text-ink-primary text-base">
                      System: Add Initial Funds
                    </h2>
                    <span className="badge badge-red text-[9px] px-1.5 py-0.5">AUTH REQUIRED</span>
                  </div>
                  <p className="text-ink-muted text-xs mt-0.5">Initialize liquidity for new ledger accounts</p>
                </div>
              </div>
              <button onClick={onClose} className="btn-ghost p-1.5 -mr-1 -mt-1">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="border-t border-surface-200 my-4" />

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Target Account dropdown */}
              <div>
                <label className="input-label">Target Account</label>

                {accountsLoading ? (
                  <div className="input flex items-center gap-2 text-ink-muted">
                    <Spinner size={14} />
                    <span className="text-sm">Loading accounts…</span>
                  </div>
                ) : (
                  <select
                    value={form.toAccount}
                    onChange={e => set('toAccount', e.target.value)}
                    className="input"
                  >
                    <option value="">Select account…</option>
                    {accounts.length === 0
                      ? <option disabled>No active user accounts found</option>
                      : accounts.map(a => (
                          <option key={a._id} value={a._id}>
                            {getLabel(a)}
                          </option>
                        ))
                    }
                  </select>
                )}

                {/* Owner info card shown after selection */}
                {selected && (
                  <div className="mt-2 rounded-xl border border-surface-200 bg-surface-50 overflow-hidden">
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-ink-primary">
                          {typeof selected.user === 'object' ? selected.user.name : 'Unknown Owner'}
                        </p>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {typeof selected.user === 'object' ? selected.user.email : selected._id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">
                          Current Balance
                        </p>
                        <p className="font-mono font-bold text-ink-primary text-sm mt-0.5">
                          {balances && balances[selected._id] !== undefined
                            ? formatCurrency(balances[selected._id])
                            : '—'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-surface-100 border-t border-surface-200 flex items-center gap-4 text-[10px] text-ink-muted font-semibold uppercase tracking-wider">
                      <span>{selected.currency || 'INR'}</span>
                      <span className={`${selected.status === 'ACTIVE' ? 'text-positive' : 'text-negative'}`}>
                        ● {selected.status}
                      </span>
                      <span className="font-mono">#{selected._id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="input-label">Initial Amount (INR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted font-mono text-sm">₹</span>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={e => set('amount', e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="input pl-8 font-mono"
                  />
                </div>
              </div>

              {/* Admin core notice */}
              <div className="bg-slate-900 rounded-xl p-4 text-white">
                <p className="text-xs font-semibold text-white/80 mb-1">Administrative Core</p>
                <p className="text-white/50 text-xs leading-relaxed">
                  Execute system-level operations and initial fund seeding. Access
                  to these controls is logged and audited against the primary
                  immutable ledger.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button type="button" onClick={handleClear} className="btn-secondary flex-1">
                  Clear Fields
                </button>
                <button
                  type="submit"
                  disabled={loading || !form.toAccount || accountsLoading}
                  className="btn-primary flex-1 bg-brand-500"
                >
                  {loading
                    ? <><Spinner size={16} color="text-white" /> Processing…</>
                    : 'POST /initial-funds'
                  }
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
