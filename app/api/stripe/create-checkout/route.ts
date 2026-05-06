import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createServerSupabase } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { partnerId } = await req.json()

  // Vérifie que le partenaire appartient bien à l'utilisateur courant
  const { data: partnerCheck } = await supabase
    .from('partners')
    .select('id')
    .eq('id', partnerId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!partnerCheck) return NextResponse.json({ error: 'Partenaire introuvable' }, { status: 403 })

  const origin = req.headers.get('origin') ?? 'http://localhost:3000'
  const stripe = getStripe()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: process.env.STRIPE_PRICE_ASSO!, quantity: 1 }],
    success_url: `${origin}/inscription/succes?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/inscription?tab=partenaire&cancelled=1`,
    client_reference_id: user.id,
    metadata: { user_id: user.id, partner_id: partnerId },
    locale: 'fr',
    billing_address_collection: 'auto',
    allow_promotion_codes: true, // permet de saisir un code promo sur la page Stripe aussi
    payment_method_types: ['card'],
    custom_text: {
      submit: { message: "Cotisation reversée intégralement à l'association partenaire." },
    },
  })

  await supabase
    .from('partners')
    .update({ stripe_checkout_session_id: session.id })
    .eq('id', partnerId)

  return NextResponse.json({ url: session.url })
}
