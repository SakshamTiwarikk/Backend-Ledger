import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useOutsideClick } from '../../hooks'

export default function Topbar({ title, subtitle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)
  useOutsideClick(menuRef, () => setShowMenu(false))

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 bg-surface-50/90 backdrop-blur-md border-b border-surface-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left — breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-ink-muted font-medium hidden sm:block">LedgerCurator</span>
          {title && (
            <>
              <span className="text-ink-muted hidden sm:block">/</span>
              <span className="text-xs font-semibold text-ink-primary">{title}</span>
            </>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Search (decorative) */}
          <div className="hidden md:flex items-center gap-2 bg-white border border-surface-200 rounded-xl px-3 py-2 text-sm text-ink-muted w-48">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
            </svg>
            <span>Search entries…</span>
          </div>

          {/* Bell */}
          <button className="relative p-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-100 rounded-xl transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
          </button>

          {/* Settings */}
          <button className="p-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-100 rounded-xl transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
            </svg>
          </button>

          {/* Avatar dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(v => !v)}
              className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold hover:ring-2 hover:ring-brand-200 transition-all"
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 card-md py-1 z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-surface-100">
                  <p className="text-sm font-semibold text-ink-primary truncate">{user?.name}</p>
                  <p className="text-xs text-ink-muted truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
