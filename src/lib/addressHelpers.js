// Normalize an address string for fuzzy matching
export function normalizeAddress(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[.,#]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\b(street|st|avenue|ave|road|rd|blvd|boulevard|drive|dr|lane|ln|place|pl|court|ct)\b/gi, match => {
      const m = match.toLowerCase()
      if (['street', 'st'].includes(m)) return 'st'
      if (['avenue', 'ave'].includes(m)) return 'ave'
      if (['road', 'rd'].includes(m)) return 'rd'
      if (['boulevard', 'blvd'].includes(m)) return 'blvd'
      if (['drive', 'dr'].includes(m)) return 'dr'
      if (['lane', 'ln'].includes(m)) return 'ln'
      if (['place', 'pl'].includes(m)) return 'pl'
      if (['court', 'ct'].includes(m)) return 'ct'
      return m
    })
    .trim()
}

// Format full address for display
export function formatFullAddress({ address, city, state, zip, unit }) {
  const parts = [address]
  if (unit) parts[0] = `${address}, Unit ${unit}`
  if (city) parts.push(city)
  const stateZip = [state, zip].filter(Boolean).join(' ')
  if (stateZip) parts.push(stateZip)
  return parts.join(', ')
}
