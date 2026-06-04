import { createAdminSupabase } from './supabase-admin'

interface Assignment {
  id: string
  quote_id: string
  wave: number
  partners: {
    email: string
    first_name: string
    last_name: string
    company_name: string
    alert_channels: string[]
  } | null
  quotes: {
    address_city: string | null
    address_department: string | null
    timeline: string | null
    client_type: string | null
  } | null
}

export async function notifyNewAssignments(quoteId?: string) {
  const webhookUrl = process.env.N8N_WEBHOOK_NOTIFY_PARTNER
  if (!webhookUrl) {
    console.error('[notify-partners] N8N_WEBHOOK_NOTIFY_PARTNER non configuré')
    return
  }

  const supabase = createAdminSupabase()

  let query = supabase
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

  const quoteIds = [...new Set((assignments as Assignment[]).map(a => a.quote_id))]
  const { data: serviceRows, error: serviceError } = await supabase
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

  for (const a of assignments as Assignment[]) {
    const partner = a.partners
    const quote   = a.quotes
    if (!partner?.email) continue
    if (!partner.alert_channels?.includes('email')) continue

    const payload = {
      partner_email:  partner.email,
      partner_prenom: partner.first_name,
      company_name:   partner.company_name,
      wave:           a.wave,
      quote_id:       a.quote_id,
      ville:          quote?.address_city,
      departement:    quote?.address_department,
      timeline:       quote?.timeline,
      client_type:    quote?.client_type,
      services:       servicesByQuote[a.quote_id] ?? [],
    }

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        await supabase
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
