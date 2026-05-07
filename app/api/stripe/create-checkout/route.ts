import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createServerSupabase } from '@/lib/supabase-server'

const PLAN_PRICES: Record<string, string | undefined> = {
  essentiel:   process.env.STRIPE_PRICE_ESSENTIEL,
  performance: process.env.STRIPE_PRICE_PERFORMANCE,
  premium:     process.env.STRIPE_PRICE_PREMIUM,
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { partnerId, plan } = await req.json()

  const { data: partnerCheck } = await supabase
    .from('partners')
    .select('id')
    .eq('id', partnerId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!partnerCheck) return NextResponse.json({ error: 'Partenaire introuvable' }, { status: 403 })

  const origin = req.headers.get('origin') ?? 'http://localhost:3000'
  const stripe = getStripe()
  const planPrice = plan ? PLAN_PRICES[plan] : undefined

  if (plan && !planPrice) {
    console.error('[create-checkout] Plan inconnu ou price ID manquant:', plan)
    return NextResponse.json({ error: `Plan "${plan}" inconnu ou price ID non configuré` }, { status: 400 })
  }

  let session

  try {

  if (planPrice) {
    // ── Plan payant : abonnement mensuel ──
    session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: planPrice, quantity: 1 }],
      subscription_data: {
        metadata: { partner_id: partnerId, plan },
      },
      success_url:  `${origin}/inscription/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:   `${origin}/inscription?tab=partenaire&cancelled=1`,
      client_reference_id: user.id,
      metadata: { user_id: user.id, partner_id: partnerId, plan },
      locale: 'fr',
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      payment_method_types: ['card'],
    })
  } else {
    // ── Freemium : frais de validation avec code promo offert automatiquement ──
    const promoId = process.env.STRIPE_PROMO_ASSO
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: process.env.STRIPE_PRICE_ASSO!, quantity: 1 }],
      ...(promoId ? { discounts: [{ promotion_code: promoId }] } : { allow_promotion_codes: true }),
      success_url:  `${origin}/inscription/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:   `${origin}/inscription?tab=partenaire&cancelled=1`,
      client_reference_id: user.id,
      metadata: { user_id: user.id, partner_id: partnerId },
      locale: 'fr',
      billing_address_collection: 'auto',
      payment_method_types: ['card'],
      custom_text: {
        submit: { message: "Cotisation reversée intégralement à l'association partenaire." },
      },
    })
  }

  await supabase
    .from('partners')
    .update({ stripe_checkout_session_id: session.id })
    .eq('id', partnerId)

  return NextResponse.json({ url: session.url })

  } catch (err: any) {
    console.error('[create-checkout] Erreur Stripe:', err?.message ?? err)
    return NextResponse.json(
      { error: err?.message ?? 'Erreur lors de la création de la session Stripe' },
      { status: 500 }
    )
  }
}
