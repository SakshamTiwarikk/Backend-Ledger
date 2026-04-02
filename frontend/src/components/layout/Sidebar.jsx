import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  {
    to: '/dashboard', label: 'Dashboard',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    )
  },
  {
    to: '/accounts', label: 'Accounts',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20"/>
        <path d="M6 14h2m3 0h2" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    to: '/transactions', label: 'Transactions',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
]

function SidebarContent({ onNavClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h10M4 18h13" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="font-display font-bold text-white text-sm leading-tight">LedgerCurator</p>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest">Precision Curator</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-2">Menu</p>
        <div className="space-y-0.5">
          {NAV.map(item => (
  <NavLink
    key={item.to}
    to={item.to}
    onClick={onNavClick}
    className={({ isActive }) =>
      `nav-item ${isActive ? 'active' : ''}`
    }
  >
    {item.icon}
    {item.label}
  </NavLink>
))}

{/* ✅ ADMIN ONLY */}
{user?.systemUser && (
  <NavLink
    to="/admin"
    onClick={onNavClick}
    className={({ isActive }) =>
      `nav-item ${isActive ? 'active' : ''}`
    }
  >
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M12 2l2.4 4.8L20 8l-4 3.9.9 5.6L12 15l-4.9 2.5.9-5.6L4 8l5.6-.8L12 2z"/>
    </svg>
    Admin
  </NavLink>
)}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/8 space-y-1">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name || 'User'}</p>
            <p className="text-slate-500 text-[10px] truncate">{user?.email || ''}</p>
          </div>
        </div>

       {user?.systemUser && (
  <button
    onClick={() => { onNavClick?.(); navigate('/admin') }}
    className="nav-item w-full text-left"
  >
     <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
          </svg>
    System Status
  </button>
)}

        <button
          onClick={handleLogout}
          className="nav-item w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Logout
        </button>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-surface-900 rounded-lg text-white"
        aria-label="Open menu"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Desktop sidebar */}
      <aside className="sidebar hidden lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="sidebar-overlay lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 380, damping: 35 }}
              className="sidebar lg:hidden flex"
            >
              <SidebarContent onNavClick={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
