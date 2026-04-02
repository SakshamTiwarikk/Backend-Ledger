// ── Spinner ────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = 'text-brand-500', className = '' }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      className={`animate-spin ${color} ${className}`}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}

// ── StatusDot ──────────────────────────────────────────────────────────────
export function StatusDot({ status }) {
  const map = {
    ACTIVE:   'bg-positive',
    FROZEN:   'bg-warning',
    CLOSED:   'bg-negative',
    COMPLETED:'bg-positive',
    COMPLETE: 'bg-positive',
    PENDING:  'bg-warning',
    FAILED:   'bg-negative',
    REVERSED: 'bg-slate-400',
  }
  return (
    <span className={`inline-block w-1.5 h-1.5 rounded-full ${map[status] || 'bg-slate-400'}`} />
  )
}

// ── Badge ──────────────────────────────────────────────────────────────────
export function Badge({ status }) {
  const map = {
    ACTIVE:   'badge-green',
    FROZEN:   'badge-yellow',
    CLOSED:   'badge-red',
    COMPLETED:'badge-green',
    COMPLETE: 'badge-green',
    PENDING:  'badge-yellow',
    FAILED:   'badge-red',
    REVERSED: 'badge-gray',
  }
  return <span className={map[status] || 'badge-gray'}>{status}</span>
}

// ── EmptyState ─────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 bg-surface-100 border border-surface-200 rounded-2xl flex items-center justify-center mb-4 text-ink-muted">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-ink-primary text-base mb-1">{title}</h3>
      {desc && <p className="text-ink-muted text-sm max-w-xs mb-5">{desc}</p>}
      {action}
    </div>
  )
}

// ── StatCard ───────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon, accent = false, loading = false }) {
  return (
    <div className={`stat-card ${accent ? 'bg-brand-500 border-brand-600 text-white' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${accent ? 'text-blue-200' : 'text-ink-muted'}`}>
            {label}
          </p>
          {loading
            ? <Skeleton className="h-7 w-32 mt-1" />
            : <p className={`font-mono text-2xl font-semibold leading-tight ${accent ? 'text-white' : 'text-ink-primary'}`}>
                {value}
              </p>
          }
          {sub && !loading && (
            <p className={`text-xs mt-1 ${accent ? 'text-blue-200' : 'text-ink-muted'}`}>{sub}</p>
          )}
        </div>
        {icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${accent ? 'bg-white/15' : 'bg-surface-100'}`}>
            <span className={accent ? 'text-white' : 'text-brand-500'}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  )
}
