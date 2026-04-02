import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { transactionsAPI } from '../../services/api'
import { formatCurrency, getErrorMsg, shortId } from '../../utils/helpers'
import { Spinner } from '../ui'
import toast from 'react-hot-toast'

const overlay = { hidden: { opacity: 0 }, visible: { opacity: 1 } }
const panel   = {
  hidden:  { opacity: 0, scale: 0.96, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 420, damping: 32 } },
  exit:    { opacity: 0, scale: 0.96, y: 6, transition: { duration: 0.15 } },
}

export default function TransferModal({ open, onClose, accounts, balances, defaultFrom, onSuccess }) {
  const [form, setForm] = useState({ fromAccount: '', toAccount: '', amount: '' })
  const [loading, setLoading] = useState(false)

  // Seed fromAccount when defaultFrom changes
  useEffect(() => {
    if (defaultFrom) setForm(f => ({ ...f, fromAccount: defaultFrom._id || '' }))
  }, [defaultFrom, open])

  // Reset on close
  useEffect(() => {
    if (!open) setForm({ fromAccount: '', toAccount: '', amount: '' })
  }, [open])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.fromAccount) return toast.error('Select source account')
    if (!form.toAccount)   return toast.error('Select destination account')
    if (form.fromAccount === form.toAccount) return toast.error('Source and destination must differ')
    const amt = parseFloat(form.amount)
    if (!amt || amt <= 0) return toast.error('Enter a valid amount')

    // Balance check client-side for fast feedback
    const fromBal = balances?.[form.fromAccount]
    if (fromBal !== undefined && amt > fromBal) {
      return toast.error(`Insufficient balance (₹${fromBal.toLocaleString()} available)`)
    }

    setLoading(true)
    try {
      // Backend requires: fromAccount, toAccount, amount, idempotencyKey
      await transactionsAPI.create({
        fromAccount:    form.fromAccount,
        toAccount:      form.toAccount,
        amount:         amt,
        idempotencyKey: uuidv4(),
      })
      toast.success('Transfer initiated! Processing…')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(getErrorMsg(err, 'Transfer failed'))
    } finally {
      setLoading(false)
    }
  }

  const accountOptions = accounts.map(a => ({
    value: a._id,
    label: `${a.currency || 'INR'} Account (${shortId(a._id)})`,
    balance: balances?.[a._id],
    status: a.status,
  }))

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
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display font-bold text-ink-primary text-lg">Authorize Transfer</h2>
                <p className="text-ink-muted text-sm mt-0.5">Transfer funds between ledger accounts</p>
              </div>
              <button onClick={onClose} className="btn-ghost p-1.5 -mr-1 -mt-1">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* From account */}
              <div>
                <label className="input-label">From Account</label>
                <select
                  value={form.fromAccount}
                  onChange={e => set('fromAccount', e.target.value)}
                  className="input"
                >
                  <option value="">Select source account…</option>
                  {accountOptions.map(o => (
                    <option key={o.value} value={o.value} disabled={o.status !== 'ACTIVE'}>
                      {o.label} {o.balance !== undefined ? `— ${formatCurrency(o.balance)}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-surface-100 border border-surface-200 rounded-full flex items-center justify-center">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                  </svg>
                </div>
              </div>

              {/* To account */}
              <div>
                <label className="input-label">To Account</label>
                <select
                  value={form.toAccount}
                  onChange={e => set('toAccount', e.target.value)}
                  className="input"
                >
                  <option value="">Select destination account…</option>
                  {accountOptions
                    .filter(o => o.value !== form.fromAccount)
                    .map(o => (
                      <option key={o.value} value={o.value} disabled={o.status !== 'ACTIVE'}>
                        {o.label}
                      </option>
                    ))
                  }
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="input-label">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted font-mono text-sm">₹</span>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={e => set('amount', e.target.value)}
                    placeholder="0.00"
                    min="0.01" step="0.01"
                    className="input pl-8 font-mono"
                  />
                </div>
                {form.fromAccount && balances?.[form.fromAccount] !== undefined && (
                  <p className="text-xs text-ink-muted mt-1.5">
                    Available: <span className="font-semibold text-ink-secondary font-mono">{formatCurrency(balances[form.fromAccount])}</span>
                  </p>
                )}
              </div>

              {/* Note about 15s delay */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <p className="text-amber-700 text-xs flex items-start gap-2">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/>
                  </svg>
                  Transfers are processed with a ~15s settlement window. The status will update to COMPLETED automatically.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading
                    ? <><Spinner size={16} color="text-white" /> Processing…</>
                    : <>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
                          <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
                        </svg>
                        Authorize Transfer
                      </>
                  }
                </button>
              </div>
            </form>

            {/* Security note */}
            <p className="text-center text-ink-muted text-[10px] mt-4 flex items-center justify-center gap-1">
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Securely signed · Validated protocol v4.1
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
