import { createAdminSupabase } from './supabase-admin'

export async function notifyNewAssignments(quoteId?: string) {
  const webhookUrl = process.env.N8N_WEBHOOK_NOTIFY_PARTNER
  if (!webhookUrl) {
    console.error('[notify-partners] N8N_WEBHOOK_NOTIFY_PARTNER non configuré')
    return
  }

  const supabase = createAdminSupabase()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  let query = db
    .from('quote_assignments')
    .select(`
      id,
      quote_id,
      wave,
      partners!partner_id ( email, first_name, last_name, company_name, alert_channels ),
      quotes!quote_id ( address_city, address_department, timeline, client_type )
    `)
    .eq('status', 'pending')
    .is('notified_at', null)

  if (quoteId) query = query.eq('quote_id', quoteId)

  const { data: assignments, error } = await query
  if (error) { console.error('[notify-partners] query error:', error.message); return }
  if (!assignments?.length) return

  const quoteIds = [...new Set((assignments as any[]).map((a: any) => a.quote_id as string))]
  const { data: serviceRows, error: serviceError } = await db
    .from('quote_service_types')
    .select('quote_id, ref_service_types!service_type_id ( code )')
    .in('quote_id', quoteIds)

  if (serviceError) {
    console.error('[notify-partners] serviceRows error:', serviceError.message)
  }

  const servicesByQuote: Record<string, string[]> = {}
  for (const row of (serviceRows ?? []) as any[]) {
    const qid: string = row.quote_id
    const code: string | undefined = row.ref_service_types?.code
    if (code) (servicesByQuote[qid] ??= []).push(code)
  }

  for (const a of assignments as any[]) {
    const partner = a.partners
    const quote   = a.quotes
    if (!partner?.email) continue
    if (!partner.alert_channels?.includes('email')) continue

    const payload = {
      partner_email:  partner.email as string,
      partner_prenom: partner.first_name as string,
      company_name:   partner.company_name as string,
      wave:           a.wave as number,
      quote_id:       a.quote_id as string,
      ville:          quote?.address_city as string | null,
      departement:    quote?.address_department as string | null,
      timeline:       quote?.timeline as string | null,
      client_type:    quote?.client_type as string | null,
      services:       servicesByQuote[a.quote_id] ?? [],
    }

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        await db
          .from('quote_assignments')
          .update({ notified_at: new Date().toISOString() })
          .eq('id', a.id)
      } else {
        console.error('[notify-partners] n8n error:', res.status, await res.text().catch(() => ''))
      }
    } catch (err: any) {
      console.error('[notify-partners] fetch error:', err?.message)
    }
  }
}
