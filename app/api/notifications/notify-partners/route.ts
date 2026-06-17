import { NextRequest, NextResponse } from 'next/server'
import { getRequestUser } from '@/lib/auth-request'
import { notifyNewAssignments } from '@/lib/notify-partners'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  const { user } = await getRequestUser(req)
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  const { quoteId } = body as { quoteId?: string }
  if (!quoteId || !UUID_RE.test(quoteId)) {
    return NextResponse.json({ error: 'quoteId invalide' }, { status: 400 })
  }

  await notifyNewAssignments(quoteId)
  return NextResponse.json({ ok: true })
}
