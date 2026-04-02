import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { getErrorMsg } from '../utils/helpers'
import { Spinner } from '../components/ui'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '', remember: false })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('All fields are required')
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(getErrorMsg(err, 'Invalid credentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      {/* Dot grid overlay */}
      <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />

      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Brand mark */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center shadow-brand mb-4">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path d="M3 6h18M3 12h12M3 18h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="font-display font-bold text-ink-primary text-2xl tracking-tight">LedgerCurator</h1>
          <p className="text-ink-muted text-sm text-center max-w-xs text-balance mt-1">
            Precision financial management and architectural data curation.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="card-md w-full max-w-[400px] p-7"
        >
          <h2 className="font-display font-bold text-ink-primary text-xl mb-1">Welcome Back</h2>
          <p className="text-ink-muted text-sm mb-6">Please enter your credentials to access the ledger.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <at x1="2" y1="7" x2="22" y2="7"/>
                    <path d="M1 8l11 7L23 8"/><rect x="1" y="4" width="22" height="16" rx="2"/>
                  </svg>
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="name@company.com"
                  className="input pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="input-label !mb-0">Password</label>
                
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="••••••••"
                  className="input pl-10 pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary"
                >
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    {showPass
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={e => set('remember', e.target.checked)}
                className="w-4 h-4 rounded accent-brand-500"
              />
              <span className="text-sm text-ink-secondary">Keep me logged in for 30 days</span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-1">
              {loading
                ? <><Spinner size={18} color="text-white" /> Signing in…</>
                : 'Login to Dashboard'
              }
            </button>
          </form>

          <p className="text-center text-ink-muted text-sm mt-5">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-brand-500 font-semibold hover:text-brand-600 transition-colors">
              Register
            </Link>
          </p>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-6 mt-6"
        >
          {[
            { icon: '🔒', label: 'AES-256 ENCRYPTED' },
            { icon: '✓', label: 'SOC2 COMPLIANT' },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-1.5 text-ink-muted text-[10px] font-semibold uppercase tracking-widest">
              <span>{b.icon}</span>
              <span>{b.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
