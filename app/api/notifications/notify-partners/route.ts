import { NextRequest, NextResponse } from 'next/server'
import { notifyNewAssignments } from '@/lib/notify-partners'

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  const { quoteId } = body as { quoteId?: string }
  if (!quoteId) return NextResponse.json({ error: 'quoteId manquant' }, { status: 400 })

  await notifyNewAssignments(quoteId)
  return NextResponse.json({ ok: true })
}
