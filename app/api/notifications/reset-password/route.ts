import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-admin'
import { rateLimit } from '@/lib/rate-limit'

/**
 * Réinitialisation de mot de passe via e-mail n8n (template aux couleurs Désamianteurs).
 * Génère le lien de récupération côté serveur (admin) et l'envoie au webhook n8n.
 *
 * Endpoint public (l'utilisateur est déconnecté) → protégé par rate-limit IP.
 * Réponse toujours `{ ok: true }` pour ne pas révéler si un compte existe (anti-énumération).
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rl = rateLimit(`reset-password:${ip}`, 5, 10 * 60 * 1000)
  if (!rl.ok) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
  }

  let email: string | undefined
  try { email = (await req.json())?.email } catch { /* ignore */ }
  if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

  const webhookUrl = process.env.N8N_WEBHOOK_RESET_PASSWORD
  if (!webhookUrl) {
    console.error('[reset-password] N8N_WEBHOOK_RESET_PASSWORD non configuré')
    return NextResponse.json({ error: 'Service indisponible' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.desamianteurs.com'
  const admin = createAdminSupabase()

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: `${appUrl}/reinitialiser-mot-de-passe` },
  })

  // Email inconnu (ou autre erreur) : on répond OK sans envoyer, pour ne pas divulguer
  // l'existence du compte.
  const tokenHash = data?.properties?.hashed_token
  if (error || !tokenHash) {
    return NextResponse.json({ ok: true })
  }

  // Lien vers NOTRE page avec le token_hash : la page établit la session via verifyOtp.
  // Plus robuste (les scanners d'e-mail ne consomment pas le jeton car la vérif est en JS).
  const confirmationUrl = `${appUrl}/reinitialiser-mot-de-passe?token_hash=${encodeURIComponent(tokenHash)}&type=recovery`
  const prenom = (data.user?.user_metadata as { prenom?: string } | undefined)?.prenom || 'Client'

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: email, prenom, confirmationUrl }),
    })
    if (!res.ok) throw new Error(`n8n webhook error: ${res.status}`)
  } catch (err) {
    console.error('[reset-password]', err)
    return NextResponse.json({ error: 'Erreur envoi' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
