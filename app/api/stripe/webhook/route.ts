import { headers } from 'next/headers'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Client admin (service_role) — bypass RLS pour les updates du webhook
function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) return new Response('Signature manquante', { status: 400 })

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (e: any) {
    console.error('[Stripe webhook] Signature invalide:', e.message)
    return new Response(`Webhook error: ${e.message}`, { status: 400 })
  }

  const admin = getAdmin()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.client_reference_id
      const customerId = session.customer as string

      if (!userId) break

      const { error } = await admin
        .from('partners')
        .update({
          validation_fee_paid: true,
          validation_fee_paid_at: new Date().toISOString(),
          stripe_customer_id: customerId,
        })
        .eq('user_id', userId)

      if (error) console.error('[Stripe webhook] Erreur update partner:', error.message)
      else console.log('[Stripe webhook] Partner validé:', userId)
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      console.warn('[Stripe webhook] Paiement échoué:', pi.id, pi.last_payment_error?.message)
      break
    }

    default:
      console.log('[Stripe webhook] Event ignoré:', event.type)
  }

  return new Response('OK', { status: 200 })
}

// Stripe envoie du raw body — désactiver le body parsing de Next.js
export const config = { api: { bodyParser: false } }
