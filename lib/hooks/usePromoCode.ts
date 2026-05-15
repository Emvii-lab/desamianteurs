'use client'

import { useState, useEffect } from 'react'

type PromoMsg = { type: 'success' | 'error' | null; text: string }

export function usePromoCode() {
  const [promoCode, setPromoCode]       = useState('')
  const [promoValid, setPromoValid]     = useState(false)
  const [promoChecking, setPromoChecking] = useState(false)
  const [promoMsg, setPromoMsg]         = useState<PromoMsg>({ type: null, text: '' })

  useEffect(() => {
    if (!promoCode || promoCode.length < 4) {
      setPromoValid(false)
      setPromoMsg({ type: null, text: '' })
      return
    }

    setPromoChecking(true)
    const t = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/stripe/validate-promo?code=${encodeURIComponent(promoCode)}`)
        const data = await res.json()
        if (data.valid) {
          setPromoValid(data.isFull)
          setPromoMsg({ type: 'success', text: data.label })
        } else {
          setPromoValid(false)
          setPromoMsg({ type: 'error', text: data.error || 'Code invalide ou expiré' })
        }
      } catch {
        setPromoValid(false)
        setPromoMsg({ type: 'error', text: 'Impossible de vérifier le code' })
      } finally {
        setPromoChecking(false)
      }
    }, 600)

    return () => clearTimeout(t)
  }, [promoCode])

  return { promoCode, setPromoCode, promoValid, promoChecking, promoMsg }
}
