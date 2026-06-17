import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

/**
 * Proxy Google Places Autocomplete.
 * La clé reste côté serveur (GOOGLE_PLACES_KEY) — jamais embarquée dans l'app mobile.
 * Accessible sans authentification (le formulaire de demande est public), protégé par rate-limit IP.
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rl = rateLimit(`places-autocomplete:${ip}`, 60, 60 * 1000)
  if (!rl.ok) {
    return NextResponse.json({ status: 'RATE_LIMITED', predictions: [] }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
  }

  const input = (req.nextUrl.searchParams.get('input') ?? '').trim()
  const sessiontoken = req.nextUrl.searchParams.get('sessiontoken') ?? ''
  if (input.length < 3) return NextResponse.json({ status: 'OK', predictions: [] })

  const key = process.env.GOOGLE_PLACES_KEY
  if (!key) return NextResponse.json({ status: 'NOT_CONFIGURED', predictions: [] }, { status: 500 })

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}`
    + `&key=${key}&language=fr&components=country:fr&types=address`
    + (sessiontoken ? `&sessiontoken=${encodeURIComponent(sessiontoken)}` : '')

  try {
    const res = await fetch(url)
    const data = await res.json()
    return NextResponse.json({
      status: data.status,
      error_message: data.error_message,
      predictions: (data.predictions ?? []).map((p: any) => ({ description: p.description, place_id: p.place_id })),
    })
  } catch (err) {
    console.error('[places/autocomplete]', err)
    return NextResponse.json({ status: 'FETCH_ERROR', predictions: [] }, { status: 502 })
  }
}
