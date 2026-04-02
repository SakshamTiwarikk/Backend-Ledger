// Format INR currency
export const formatCurrency = (val, compact = false) => {
  if (val === undefined || val === null) return '—'
  if (compact && Math.abs(val) >= 1_000_000) {
    return `₹${(val / 1_000_000).toFixed(1)}M`
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 2
  }).format(val)
}

// Short account ID display
export const shortId = (id) => id ? `••••${id.slice(-4).toUpperCase()}` : '—'

// Format date
export const formatDate = (d) => {
  if (!d) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  }).format(new Date(d))
}

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try { await navigator.clipboard.writeText(text); return true } catch { return false }
}

// Get greeting
export const greeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// Error message extractor
export const getErrorMsg = (err, fallback = 'Something went wrong') =>
  err?.response?.data?.message || err?.message || fallback
