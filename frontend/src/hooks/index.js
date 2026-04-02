import { useState, useEffect, useCallback, useRef } from 'react'
import { accountsAPI } from '../services/api'
import toast from 'react-hot-toast'

// ── useAccounts ───────────────────────────────────────────────────────────────
// Used by Dashboard, Accounts, Transactions pages
// Fetches only the CURRENT USER's own accounts + their balances
export function useAccounts() {
  const [accounts, setAccounts]               = useState([])
  const [balances, setBalances]               = useState({})
  const [loading, setLoading]                 = useState(true)
  const [balancesLoading, setBalancesLoading] = useState(false)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await accountsAPI.getAll()
      const data = res.data?.accounts || []
      if (mounted.current) setAccounts(Array.isArray(data) ? data : [])
      return data
    } catch (err) {
      toast.error('Failed to load accounts')
      return []
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [])

  const fetchBalances = useCallback(async (accountList) => {
    if (!accountList?.length) return
    setBalancesLoading(true)
    try {
      const results = await Promise.allSettled(
        accountList.map(a =>
          accountsAPI.getBalance(a._id).then(r => ({ id: a._id, balance: r.data?.balance ?? 0 }))
        )
      )
      if (!mounted.current) return
      const map = {}
      results.forEach(r => { if (r.status === 'fulfilled') map[r.value.id] = r.value.balance })
      setBalances(map)
    } finally {
      if (mounted.current) setBalancesLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    const data = await fetchAccounts()
    if (data?.length) await fetchBalances(data)
  }, [fetchAccounts, fetchBalances])

  useEffect(() => { refresh() }, [refresh])

  const totalBalance = Object.values(balances).reduce((s, v) => s + (v || 0), 0)

  return { accounts, balances, totalBalance, loading, balancesLoading, refresh }
}

// ── useAllAccounts ────────────────────────────────────────────────────────────
// Used ONLY by the Admin page
// Calls GET /api/accounts/all (authSystemUserMiddleware) to fetch every account
// across ALL users, with the user's name + email populated from the DB
export function useAllAccounts() {
  const [accounts, setAccounts]               = useState([])
  const [balances, setBalances]               = useState({})
  const [loading, setLoading]                 = useState(true)
  const [balancesLoading, setBalancesLoading] = useState(false)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      // This endpoint is protected by authSystemUserMiddleware on the backend
      const res  = await accountsAPI.getAllForAdmin()
      const data = res.data?.accounts || []
      if (!mounted.current) return []
      setAccounts(Array.isArray(data) ? data : [])
      return data
    } catch (err) {
      if (err?.response?.status === 403) {
        toast.error('Admin access required to view all accounts')
      } else {
        toast.error('Failed to load accounts')
      }
      return []
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [])

  const fetchBalances = useCallback(async (accountList) => {
    if (!accountList?.length) return
    setBalancesLoading(true)
    try {
      // Admin can call getBalance on any accountId (backend allows it for systemUser)
      const results = await Promise.allSettled(
        accountList.map(a =>
          accountsAPI.getBalance(a._id).then(r => ({ id: a._id, balance: r.data?.balance ?? 0 }))
        )
      )
      if (!mounted.current) return
      const map = {}
      results.forEach(r => { if (r.status === 'fulfilled') map[r.value.id] = r.value.balance })
      setBalances(map)
    } finally {
      if (mounted.current) setBalancesLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    const data = await fetchAll()
    if (data?.length) await fetchBalances(data)
  }, [fetchAll, fetchBalances])

  useEffect(() => { refresh() }, [refresh])

  const totalBalance = Object.values(balances).reduce((s, v) => s + (v || 0), 0)

  return { accounts, balances, totalBalance, loading, balancesLoading, refresh }
}

// ── useOutsideClick ───────────────────────────────────────────────────────────
export function useOutsideClick(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handler()
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}

// ── useLocalStorage ───────────────────────────────────────────────────────────
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const v = localStorage.getItem(key)
      return v ? JSON.parse(v) : initial
    } catch { return initial }
  })
  const set = useCallback((v) => {
    const next = typeof v === 'function' ? v(value) : v
    setValue(next)
    localStorage.setItem(key, JSON.stringify(next))
  }, [key, value])
  return [value, set]
}
