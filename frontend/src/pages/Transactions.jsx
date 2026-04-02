import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { transactionsAPI, accountsAPI } from '../services/api'
import { formatCurrency, formatDate, shortId, getErrorMsg } from '../utils/helpers'
import { Spinner, Skeleton, EmptyState, Badge } from '../components/ui'
import TransferModal from '../components/modals/TransferModal'
import InitialFundsModal from '../components/modals/InitialFundsModal'
import Topbar from '../components/layout/Topbar'
import toast from 'react-hot-toast'

// ── Transaction row ────────────────────────────────────────────────────────
function TxRow({ tx, accounts, index }) {
  const fromAcc = accounts.find(a => a._id === tx.fromAccount)
  const toAcc   = accounts.find(a => a._id === tx.toAccount)
  

  return (
    <motion.tr
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="border-b border-surface-50 hover:bg-surface-50 transition-colors group"
    >
      {/* Transaction */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
            ${tx.status === 'COMPLETED' || tx.status === 'COMPLETE' ? 'bg-emerald-50' : tx.status === 'PENDING' ? 'bg-amber-50' : 'bg-red-50'}`}>
            <svg width="12" height="12" fill="none"
              stroke={tx.status === 'COMPLETED' || tx.status === 'COMPLETE' ? '#10b981' : tx.status === 'PENDING' ? '#f59e0b' : '#ef4444'}
              strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
              <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-primary">
              {fromAcc ? `${shortId(fromAcc._id)}` : 'System'} → {toAcc ? `${shortId(toAcc._id)}` : '—'}
            </p>
            <p className="text-[10px] text-ink-muted font-mono mt-0.5">
              REF: {(tx._id || '').slice(-10).toUpperCase()}
            </p>
          </div>
        </div>
      </td>

      {/* Origin → Destination */}
      <td className="px-5 py-3.5 hidden md:table-cell">
        <p className="text-xs text-ink-secondary">
          {fromAcc ? `${fromAcc.currency || 'INR'} ${shortId(fromAcc._id)}` : 'System'}
        </p>
        <p className="text-xs text-ink-muted mt-0.5">→ {toAcc ? shortId(toAcc._id) : '—'}</p>
      </td>

      {/* Date */}
      <td className="px-5 py-3.5 hidden lg:table-cell">
        <p className="text-xs text-ink-muted">
          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
        </p>
      </td>

      {/* Amount */}
      <td className="px-5 py-3.5 text-right">
        <span className="font-mono font-bold text-sm text-negative">
          -{formatCurrency(tx.amount)}
        </span>
      </td>
    </motion.tr>
  )
}

// ── Transactions Page ──────────────────────────────────────────────────────
export default function Transactions() {
  const [accounts, setAccounts]         = useState([])
  const [balances, setBalances]         = useState({})
  const [accLoading, setAccLoading]     = useState(true)
  const [showTransfer, setShowTransfer] = useState(false)
  const [showFunds, setShowFunds]       = useState(false)
  const [recipientEmail, setRecipientEmail] = useState("")
const [toAccount, setToAccount] = useState(null)
const [loadingUser, setLoadingUser] = useState(false)

  // Create entry inline form
  const [form, setForm]     = useState({ fromAccount: '', toAccount: '', amount: '' })
  const [txLoading, setTxLoading] = useState(false)

  // Notification toast state
  const [notification, setNotification] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])

  const fetchAccounts = useCallback(async () => {
    setAccLoading(true)
    try {
      const res  = await accountsAPI.getAll()
      const data = res.data?.accounts || []
      if (!mounted.current) return
      setAccounts(Array.isArray(data) ? data : [])

      // Fetch balances
      const results = await Promise.allSettled(
        data.map(a => accountsAPI.getBalance(a._id).then(r => ({ id: a._id, balance: r.data?.balance ?? 0 })))
      )
      if (!mounted.current) return
      const map = {}
      results.forEach(r => { if (r.status === 'fulfilled') map[r.value.id] = r.value.balance })
      setBalances(map)
    } catch { toast.error('Failed to load accounts') }
    finally { if (mounted.current) setAccLoading(false) }
  }, [])

  const handleSearchUser = async () => {
  if (!recipientEmail) return toast.error("Enter email")

  try {
    setLoadingUser(true)

    const res = await accountsAPI.getByEmail(recipientEmail)

    setToAccount(res.data.account)
    toast.success("User found")

  } catch (err) {
    setToAccount(null)
    toast.error("User not found")
  } finally {
    setLoadingUser(false)
  }
}
  useEffect(() => { fetchAccounts() }, [fetchAccounts])

  const handleTransfer = async (e) => {
    e.preventDefault()
    if (!form.fromAccount) return toast.error('Select source account')
    if (!toAccount) return toast.error('Find recipient first')
    if (form.fromAccount === form.toAccount) return toast.error('Accounts must differ')
    const amt = parseFloat(form.amount)
    if (!amt || amt <= 0) return toast.error('Enter a valid amount')

    const fromBal = balances[form.fromAccount]
    if (fromBal !== undefined && amt > fromBal) {
      return toast.error(`Insufficient balance (${formatCurrency(fromBal)} available)`)
    }

    setTxLoading(true)
    setNotification(null)
    try {
      await transactionsAPI.create({
        fromAccount:    form.fromAccount,
        toAccount: toAccount._id,
        amount:         amt,
        idempotencyKey: uuidv4(),
      })
      setNotification({ id: `TXN-${Date.now().toString(36).toUpperCase()}`, msg: 'Transfer Initiated', sub: 'Transaction is being processed.' })
      setForm(f => ({ ...f, amount: '' }))
      toast.success('Transfer initiated!')
      fetchAccounts()
    } catch (err) {
      toast.error(getErrorMsg(err, 'Transfer failed'))
    } finally {
      setTxLoading(false)
    }
  }

  const totalBalance = Object.values(balances).reduce((s, v) => s + (v || 0), 0)

  const accountOptions = accounts.map(a => ({
    value: a._id,
    label: `${a.currency || 'INR'} Account (${shortId(a._id)})`,
    balance: balances[a._id],
  }))

  return (
    <>
      <Topbar title="Transactions" />

      <main className="flex-1 p-6 page-enter">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-ink-muted text-xs font-semibold uppercase tracking-widest mb-1">Financial Operations</p>
            <h1 className="font-display font-bold text-ink-primary text-2xl">Transactions</h1>
            <p className="text-ink-muted text-sm mt-1">
              Manage your capital flow with mathematical precision. Record new entries or audit historical account movement across accounts.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="card px-4 py-2.5 text-right hidden sm:block">
              <p className="text-[10px] text-ink-muted uppercase tracking-widest font-semibold">Total Balance</p>
              <p className="font-mono font-bold text-ink-primary text-lg">{formatCurrency(totalBalance)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

          {/* Left — Create Entry panel */}
          <div className="xl:col-span-2 space-y-4">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-5">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-brand-500">
                  <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
                  <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
                </svg>
                <h2 className="font-display font-semibold text-ink-primary text-base">Create Entry</h2>
              </div>

              <form onSubmit={handleTransfer} className="space-y-4">
                {/* From */}
                <div>
                  <label className="input-label">From Account</label>
                  {accLoading ? <Skeleton className="h-11 rounded-xl" /> : (
                    <select value={form.fromAccount} onChange={e => set('fromAccount', e.target.value)} className="input">
                      <option value="">Select account…</option>
                      {accountOptions.map(o => (
                        <option key={o.value} value={o.value}>
                          {o.label} {o.balance !== undefined ? `— ${formatCurrency(o.balance)}` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                  {form.fromAccount && (
                    <p className="text-[10px] text-ink-muted mt-1 font-mono">
                      Acct. {shortId(form.fromAccount)}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="w-7 h-7 bg-surface-100 border border-surface-200 rounded-full flex items-center justify-center">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                    </svg>
                  </div>
                </div>

               {/* To Account via Email */}
<div>
  <label className="input-label">Recipient Email</label>

  <input
    type="email"
    placeholder="Enter recipient email"
    value={recipientEmail}
    onChange={(e) => setRecipientEmail(e.target.value)}
    className="input"
  />

  <button
    type="button"
    onClick={handleSearchUser}
    className="btn-secondary mt-2 w-full"
  >
    {loadingUser ? "Searching..." : "Find User"}
  </button>

  {toAccount && (
    <div className="mt-3 p-3 border rounded-xl bg-surface-50">
      <p className="text-sm font-semibold text-ink-primary">
        {toAccount.user.name}
      </p>
      <p className="text-xs text-ink-muted">
        {toAccount.user.email}
      </p>
      <p className="text-xs font-mono mt-1">
        Acct: {shortId(toAccount._id)}
      </p>
    </div>
  )}
</div>

                {/* Amount */}
                <div>
                  <label className="input-label">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted font-mono text-sm">$</span>
                    <input
                      type="number"
                      value={form.amount}
                      onChange={e => set('amount', e.target.value)}
                      placeholder="0.00"
                      min="0.01" step="0.01"
                      className="input pl-8 font-mono"
                    />
                  </div>
                </div>

                <button type="submit" disabled={txLoading} className="btn-primary w-full py-3">
                  {txLoading
                    ? <><Spinner size={16} color="text-white" /> Processing…</>
                    : <>
                        Authorize Transfer
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                        </svg>
                      </>
                  }
                </button>
              </form>

              {/* Security badge */}
              <p className="text-center text-ink-muted text-[10px] mt-3 flex items-center justify-center gap-1">
                <svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                Securely signed · Validated protocol v4.1
              </p>

              {/* In-progress notification */}
              <AnimatePresence>
                {notification && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="mt-4 bg-brand-50 border border-brand-200 rounded-xl p-3 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 bg-positive rounded-full flex items-center justify-center flex-shrink-0">
                      <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brand-700">{notification.msg}</p>
                      <p className="text-xs text-brand-600 mt-0.5">{notification.id} {notification.sub}</p>
                    </div>
                    <button onClick={() => setNotification(null)} className="text-brand-400 hover:text-brand-600">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          
          </div>

          {/* Right — Ledger History */}
          <div className="xl:col-span-3">
            <div className="card overflow-hidden h-full">
              <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
                <h2 className="font-display font-semibold text-ink-primary text-base">Ledger History</h2>
                <div className="flex items-center gap-2">
                  <button className="btn-secondary text-xs py-1.5 px-3 gap-1.5">
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                    </svg>
                    Filter
                  </button>
                  <button className="btn-secondary text-xs py-1.5 px-3 gap-1.5">
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round"/>
                    </svg>
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-100 bg-surface-50">
                      {['Transaction', 'Origin → Destination', 'Date', 'Amount'].map((h, i) => (
                        <th key={h} className={`px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-ink-muted
                          ${i === 1 ? 'hidden md:table-cell' : ''}
                          ${i === 2 ? 'hidden lg:table-cell' : ''}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={4} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <svg className="text-ink-muted" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
                            <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
                          </svg>
                          <p className="text-ink-secondary font-semibold text-sm">No transactions yet</p>
                          <p className="text-ink-muted text-xs max-w-xs text-center">
                            Authorize a transfer using the form to record your first ledger movement.
                          </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer stats */}
              <div className="px-5 py-4 border-t border-surface-100 bg-surface-50 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Avg Settlement Speed', value: '0.4s' },
                  { label: 'Accuracy Audit Score', value: '100%' },
                  { label: 'System Status', value: 'All synced' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="font-mono font-bold text-ink-primary text-lg">{s.value}</p>
                    <p className="text-[10px] text-ink-muted uppercase tracking-widest font-semibold mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System status footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-positive rounded-full animate-pulse-dot" />
            <p className="text-ink-muted text-xs">System fully operational. All ledgers synced.</p>
          </div>
          <div className="flex items-center gap-4">
            {['COMPLIANCE', 'SECURITY', 'SUPPORT API'].map(l => (
              <button key={l} className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted hover:text-brand-500 transition-colors">
                {l}
              </button>
            ))}
          </div>
        </div>
      </main>

      <TransferModal
        open={showTransfer}
        onClose={() => setShowTransfer(false)}
        accounts={accounts}
        balances={balances}
        onSuccess={fetchAccounts}
      />
      <InitialFundsModal
        open={showFunds}
        onClose={() => setShowFunds(false)}
        accounts={accounts}
        onSuccess={fetchAccounts}
      />
    </>
  )
}
