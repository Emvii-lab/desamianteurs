import { headers } from 'next/headers'
import { getStripe } from '@/lib/stripe'
import { createAdminSupabase } from '@/lib/supabase-admin'
import Stripe from 'stripe'

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

  const admin = createAdminSupabase()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId     = session.client_reference_id
      const customerId = session.customer as string
      const plan       = session.metadata?.plan as string | undefined

      if (!userId) break

      const update: Record<string, unknown> = {
        validation_fee_paid:    true,
        validation_fee_paid_at: new Date().toISOString(),
        stripe_customer_id:     customerId,
      }

      // Pour les plans payants, on note l'abonnement choisi
      if (plan && ['essentiel', 'performance', 'premium'].includes(plan)) {
        update.subscription = plan
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (admin as any)
        .from('partners')
        .update(update)
        .eq('user_id', userId)

      if (error) console.error('[Stripe webhook] Erreur update partner:', error.message)
      else console.log(`[Stripe webhook] Partner validé (plan: ${plan ?? 'freemium'}):`, userId)
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

