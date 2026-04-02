import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { getErrorMsg } from '../utils/helpers'
import { Spinner } from '../components/ui'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate     = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('All fields are required')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(getErrorMsg(err, 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  const strength = (() => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 6)  s++
    if (p.length >= 10) s++
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-400'][strength]

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-col justify-between w-[52%] bg-surface-900 p-12 relative overflow-hidden"
      >
        {/* Background grid */}
        <div className="absolute inset-0 dot-grid opacity-10 pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
              <path d="M3 6h18M3 12h12M3 18h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="font-display font-bold text-white text-lg">LedgerCurator</p>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest">Precision Curator v4.2</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative">
          <h2 className="font-display font-bold text-white text-4xl leading-tight mb-4 text-balance">
            Architectural integrity for your financial records.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Join a network of precision-focused professionals managing complex ledgers with mathematical clarity and editorial elegance.
          </p>

          {/* Stats */}
          <div className="mt-8 card p-5 bg-white/5 border-white/10 max-w-xs">
            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold mb-1">Active Records</p>
            <p className="font-mono text-3xl font-bold text-white">482,109</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-1.5 h-1.5 bg-positive rounded-full animate-pulse-dot" />
              <p className="text-slate-400 text-xs">Verified Encrypted Vault</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative flex items-center justify-between">
          <p className="text-slate-600 text-xs">© 2024 LedgerCurator</p>
          <div className="flex gap-4">
            {['Privacy Policy', 'Security Standards'].map(l => (
              <button key={l} className="text-slate-600 hover:text-slate-400 text-xs transition-colors">{l}</button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-positive rounded-full" />
            <span className="text-slate-500 text-xs uppercase tracking-widest font-semibold">Systems Operational</span>
          </div>
        </div>
      </motion.div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                <path d="M3 6h18M3 12h12M3 18h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="font-display font-bold text-ink-primary">LedgerCurator</p>
          </div>

          <h2 className="font-display font-bold text-ink-primary text-2xl mb-1">Create Account</h2>
          <p className="text-ink-muted text-sm mb-7">Enter your details to begin curating your ledger.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Alexander Hamilton"
                className="input"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="input-label">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="curator@ledger.com"
                className="input"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="input-label">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="••••••••"
                className="input"
                autoComplete="new-password"
              />
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= strength ? strengthColor : 'bg-surface-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-ink-muted">Password strength: <span className="font-semibold">{strengthLabel}</span></p>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading
                ? <><Spinner size={18} color="text-white" /> Creating…</>
                : 'Create Account'
              }
            </button>
          </form>

          <p className="text-center text-ink-muted text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 font-semibold hover:text-brand-600 transition-colors">
              Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
