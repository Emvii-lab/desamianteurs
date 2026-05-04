import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')?.toUpperCase().trim()

  if (!code) return NextResponse.json({ valid: false, error: 'Code requis' })

  try {
    const stripe = getStripe()
    const list = await stripe.promotionCodes.list({ code, active: true, limit: 1 })

    if (!list.data.length) {
      return NextResponse.json({ valid: false, error: 'Code invalide ou expiré' })
    }

    const promo = list.data[0]
    const coupon = promo.coupon as Stripe.Coupon
    const isFull = coupon.percent_off === 100

    return NextResponse.json({
      valid: true,
      promoId: promo.id,
      percentOff: coupon.percent_off,
      amountOff: coupon.amount_off,
      isFull,
      label: isFull
        ? "Frais d'inscription offerts — 100% pris en charge"
        : coupon.percent_off
          ? `${coupon.percent_off}% de réduction sur les frais d'inscription`
          : `${((coupon.amount_off ?? 0) / 100).toFixed(2)}€ de réduction`,
    })
  } catch {
    return NextResponse.json({ valid: false, error: 'Erreur de validation' })
  }
}
