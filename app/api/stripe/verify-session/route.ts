import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'session_id manquant' }, { status: 400 })

  // Vérifie que la session appartient au partenaire de l'utilisateur courant
  const { data: partner } = await supabase
    .from('partners')
    .select('id')
    .eq('stripe_checkout_session_id', sessionId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!partner) return NextResponse.json({ error: 'Session introuvable' }, { status: 404 })

  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return NextResponse.json({
      status: session.payment_status,
      paid: session.payment_status === 'paid',
      email: session.customer_details?.email,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
