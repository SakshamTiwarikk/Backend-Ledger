import { motion } from 'framer-motion'
import { formatCurrency, shortId } from '../../utils/helpers'
import { Skeleton, Badge } from '../ui'

const PALETTE = [
  { bg: 'from-slate-800 to-slate-900',   accent: 'bg-slate-700' },
  { bg: 'from-blue-900 to-indigo-900',   accent: 'bg-blue-800' },
  { bg: 'from-emerald-900 to-teal-900',  accent: 'bg-emerald-800' },
  { bg: 'from-violet-900 to-purple-900', accent: 'bg-violet-800' },
  { bg: 'from-rose-900 to-pink-900',     accent: 'bg-rose-800' },
]

export default function AccountCard({ account, balance, balanceLoading, index, onTransfer }) {
  const pal = PALETTE[index % PALETTE.length]
  const id  = account._id

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className={`relative overflow-hidden rounded-xl2 bg-gradient-to-br ${pal.bg}
                  border border-white/10 shadow-card-md cursor-default select-none`}
    >
      {/* Subtle circuit lines */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative p-5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-white/50 text-[10px] uppercase tracking-widest font-semibold mb-1">
              {account.currency || 'INR'} Account
            </p>
            <p className="font-mono text-white/70 text-xs tracking-widest">{shortId(id)}</p>
          </div>
          <div className={`w-9 h-9 ${pal.accent} rounded-xl flex items-center justify-center`}>
            <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8" viewBox="0 0 24 24">
              <rect x="2" y="6" width="20" height="13" rx="2"/>
              <path d="M2 10h20M6 14h2m3 0h2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Balance */}
        <div className="mb-5">
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-1">Balance</p>
          {balanceLoading
            ? <Skeleton className="h-8 w-36 bg-white/10" />
            : <p className="font-mono text-2xl font-bold text-white leading-tight">
                {formatCurrency(balance)}
              </p>
          }
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <Badge status={account.status} />
          <button
            onClick={() => onTransfer?.(account)}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-semibold
                       px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
              <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
            </svg>
            Transfer
          </button>
        </div>
      </div>
    </motion.div>
  )
}
