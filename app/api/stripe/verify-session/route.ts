import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) return NextResponse.json({ error: 'session_id manquant' }, { status: 400 })

  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return NextResponse.json({
      status: session.payment_status,
      paid: session.payment_status === 'paid',
      email: session.customer_details?.email,
      name: session.customer_details?.name,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
