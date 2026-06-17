/**
 * Limiteur de débit léger, en mémoire (par instance serverless).
 *
 * Suffisant comme première barrière contre les abus/bursts. Limite : sur Vercel,
 * la mémoire n'est pas partagée entre instances ni garantie persistante — pour une
 * protection forte et distribuée, passer à Upstash Redis (@upstash/ratelimit).
 */
type Entry = { count: number; reset: number }
const buckets = new Map<string, Entry>()

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfter: number } {
  const now = Date.now()
  const entry = buckets.get(key)

  if (!entry || now > entry.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }

  if (entry.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((entry.reset - now) / 1000) }
  }

  entry.count++
  return { ok: true, retryAfter: 0 }
}

// Purge périodique des entrées expirées (évite une fuite mémoire si beaucoup de clés)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [k, v] of buckets) if (now > v.reset) buckets.delete(k)
  }, 10 * 60 * 1000).unref?.()
}
