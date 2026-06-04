import { timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'

export function verifyCronSecret(req: NextRequest): boolean {
  const secret = req.headers.get('x-cron-secret')
  if (!secret || !process.env.CRON_SECRET) return false
  try {
    return timingSafeEqual(Buffer.from(secret), Buffer.from(process.env.CRON_SECRET))
  } catch {
    return false
  }
}
