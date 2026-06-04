import { NextRequest, NextResponse } from 'next/server'
import { NAF_CODES } from '@/lib/constants'

const SIRET_RE = /^\d{14}$/

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const { siret } = body as { siret?: string }

  if (!siret || typeof siret !== 'string') {
    return NextResponse.json({ error: 'SIRET manquant' }, { status: 400 })
  }

  const clean = siret.replace(/\D/g, '')

  if (!SIRET_RE.test(clean)) {
    return NextResponse.json({ error: 'SIRET invalide — 14 chiffres requis' }, { status: 400 })
  }

  const webhookUrl = process.env.N8N_WEBHOOK_VERIFY_SIRET
  if (!webhookUrl) {
    return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    let res: Response
    try {
      res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siret: clean }),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    const text = await res.text()

    if (!res.ok) {
      console.error('[verify-siret] n8n webhook error:', res.status, text)
      return NextResponse.json({ error: 'SIRET introuvable ou service indisponible' }, { status: res.status })
    }

    let data: any
    try {
      data = JSON.parse(text)
    } catch {
      console.error('[verify-siret] JSON parse error. Raw response:', text)
      return NextResponse.json({ error: 'Réponse invalide du service SIRET' }, { status: 502 })
    }

    if (data?.activite && NAF_CODES[data.activite]) {
      data = { ...data, activite: NAF_CODES[data.activite] }
    }

    return NextResponse.json(data)
  } catch (e: any) {
    const isAbort = e?.name === 'AbortError' || e?.name === 'TimeoutError'
    console.error('[verify-siret] Erreur:', e?.name, e?.message)
    if (isAbort) {
      return NextResponse.json({ error: 'Délai dépassé — réessayez' }, { status: 504 })
    }
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
