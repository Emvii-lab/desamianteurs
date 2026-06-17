import { NextRequest, NextResponse } from 'next/server'
import { getRequestUser } from '@/lib/auth-request'
import { createAdminSupabase } from '@/lib/supabase-admin'
import { notifyNewAssignments } from '@/lib/notify-partners'
import { rateLimit } from '@/lib/rate-limit'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  const { user } = await getRequestUser(req)
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // Rate-limit : 10 notifications / 10 min / utilisateur
  const rl = rateLimit(`notify-partners:${user.id}`, 10, 10 * 60 * 1000)
  if (!rl.ok) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  const { quoteId } = body as { quoteId?: string }
  if (!quoteId || !UUID_RE.test(quoteId)) {
    return NextResponse.json({ error: 'quoteId invalide' }, { status: 400 })
  }

  // Contrôle d'appartenance : la demande doit appartenir à l'utilisateur connecté
  const admin = createAdminSupabase()
  const { data: quote } = await admin
    .from('quotes').select('client_id').eq('id', quoteId).maybeSingle()
  if (!quote) return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 })

  const { data: client } = await admin
    .from('clients').select('user_id').eq('id', (quote as { client_id: string }).client_id).maybeSingle()
  if (!client || (client as { user_id: string }).user_id !== user.id) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  await notifyNewAssignments(quoteId)
  return NextResponse.json({ ok: true })
}
