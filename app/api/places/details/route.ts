import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

/**
 * Proxy Google Places Details.
 * La clé reste côté serveur (GOOGLE_PLACES_KEY). Protégé par rate-limit IP.
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rl = rateLimit(`places-details:${ip}`, 60, 60 * 1000)
  if (!rl.ok) {
    return NextResponse.json({ status: 'RATE_LIMITED' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
  }

  const placeId = req.nextUrl.searchParams.get('placeid') ?? ''
  const sessiontoken = req.nextUrl.searchParams.get('sessiontoken') ?? ''
  if (!placeId) return NextResponse.json({ status: 'INVALID_REQUEST' }, { status: 400 })

  const key = process.env.GOOGLE_PLACES_KEY
  if (!key) return NextResponse.json({ status: 'NOT_CONFIGURED' }, { status: 500 })

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}`
    + `&key=${key}&language=fr&fields=address_component,formatted_address,geometry`
    + (sessiontoken ? `&sessiontoken=${encodeURIComponent(sessiontoken)}` : '')

  try {
    const res = await fetch(url)
    const data = await res.json()
    const r = data.result
    return NextResponse.json({
      status: data.status,
      error_message: data.error_message,
      result: r ? {
        formatted_address: r.formatted_address,
        address_components: r.address_components,
        geometry: { location: r.geometry?.location },
      } : null,
    })
  } catch (err) {
    console.error('[places/details]', err)
    return NextResponse.json({ status: 'FETCH_ERROR' }, { status: 502 })
  }
}
