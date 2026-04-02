import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { accountsAPI } from '../../services/api'
import { getErrorMsg } from '../../utils/helpers'
import { Spinner } from '../ui'
import toast from 'react-hot-toast'

const overlay = { hidden: { opacity: 0 }, visible: { opacity: 1 } }
const panel   = {
  hidden:  { opacity: 0, scale: 0.96, y: 10 },
  visible: { opacity: 1, scale: 1,    y: 0, transition: { type: 'spring', stiffness: 420, damping: 32 } },
  exit:    { opacity: 0, scale: 0.96, y: 6, transition: { duration: 0.15 } },
}

export default function CreateAccountModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    setLoading(true)
    try {
      await accountsAPI.create()
      toast.success('Account created successfully!')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(getErrorMsg(err, 'Failed to create account'))
    } finally {
      setLoading(false)
    }
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
            className="w-full max-w-sm card-md p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display font-bold text-ink-primary text-lg">Create New Account</h2>
                <p className="text-ink-muted text-sm mt-0.5">A new INR ledger account will be created for you.</p>
              </div>
              <button onClick={onClose} className="btn-ghost p-1.5 -mr-1 -mt-1">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Info box */}
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-brand-700 text-sm">INR Account</p>
                  <p className="text-brand-600 text-xs mt-0.5">Default currency is Indian Rupee. Status will be set to ACTIVE automatically.</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleCreate} disabled={loading} className="btn-primary flex-1">
                {loading ? <><Spinner size={16} color="text-white" /> Creating…</> : 'Create Account'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
