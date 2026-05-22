export function timeAgo(date: string | Date) {
  const diff = Date.now() - new Date(date).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return "Il y a moins d'1h"
  if (h < 24) return `Il y a ${h}h`
  if (h < 168) return `Il y a ${Math.floor(h / 24)}j`
  return new Date(date).toLocaleDateString('fr-FR')
}

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function colorFor(id: string, palette = ['#1E3A5F', '#C0392B', '#7D3C98', '#2E86AB', '#27AE60', '#E67E22', '#2C3E50']): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return palette[Math.abs(hash) % palette.length]
}

export function parseLocation(ville: string, adresse: string, cp: string): { city: string; zip: string } {
  const full = `${ville} ${adresse}`.trim()
  const match = full.match(/\b(\d{5})\b/)
  if (match) {
    const extractedZip = match[1]
    const parts = full.split(extractedZip)
    let extractedCity = parts[parts.length - 1].trim()
    if (/\d/.test(extractedCity)) {
      const words = extractedCity.split(/\s+/)
      const last = words[words.length - 1]
      if (!/\d/.test(last)) extractedCity = last
    }
    return { city: extractedCity.toUpperCase() || ville.toUpperCase(), zip: extractedZip }
  }
  return { city: ville.toUpperCase(), zip: cp }
}
