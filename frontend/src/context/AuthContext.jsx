import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    try {
      const t = localStorage.getItem('lc_token')
      const u = localStorage.getItem('lc_user')
      if (t && u) { setToken(t); setUser(JSON.parse(u)) }
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password })
    const { token: t, user: u } = res.data
    setToken(t); setUser(u)
    localStorage.setItem('lc_token', t)
    localStorage.setItem('lc_user', JSON.stringify(u))
    return res.data
  }, [])

  const register = useCallback(async (name, email, password) => {
    return authAPI.register({ name, email, password })
  }, [])

  const logout = useCallback(async () => {
    try { await authAPI.logout() } catch { /* ignore server error */ }
    setToken(null); setUser(null)
    localStorage.removeItem('lc_token')
    localStorage.removeItem('lc_user')
    toast.success('Signed out successfully')
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
