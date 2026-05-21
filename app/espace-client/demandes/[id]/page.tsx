import { createServerSupabase } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Clock, CheckCircle2, AlertCircle, FileText, Send, Users } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const metadata = { title: 'Détail demande | Désamianteurs.com' }

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft:       { label: 'Brouillon',  color: '#6B7280', bg: '#F3F4F6' },
  submitted:   { label: 'Envoyée',    color: '#D97706', bg: '#FEF3C7' },
  in_progress: { label: 'En cours',   color: '#2563EB', bg: '#DBEAFE' },
  completed:   { label: 'Terminée',   color: '#059669', bg: '#D1FAE5' },
  cancelled:   { label: 'Annulée',    color: '#DC2626', bg: '#FEE2E2' },
  published:   { label: 'Publiée',    color: '#059669', bg: '#D1FAE5' },
}

const TIMELINE_LABELS: Record<string, string> = {
  emergency:       'Urgent',
  within_1_month:  'Sous 1 mois',
  within_3_months: 'Sous 3 mois',
  over_3_months:   'Plus de 3 mois',
}

interface Props { params: Promise<{ id: string }> }

export default async function DemandeDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: client } = await supabase
    .from('clients').select('id').eq('user_id', user.id).maybeSingle()
  if (!client) redirect('/')

  const { data: quote } = await supabase
    .from('quotes')
    .select(`*, ref_property_types(label), quote_assignments(count)`)
    .eq('id', id)
    .eq('client_id', client.id)
    .maybeSingle()

  if (!quote) notFound()

  const status = STATUS_CONFIG[quote.status] || STATUS_CONFIG.draft
  const date = quote.created_at
    ? format(new Date(quote.created_at), 'dd MMMM yyyy', { locale: fr })
    : '—'
  const prosCount = quote.quote_assignments?.[0]?.count || 0

  const rows = [
    { label: 'Référence', value: `#${id.slice(0, 8).toUpperCase()}` },
    { label: 'Type de bien', value: quote.ref_property_types?.label || '—' },
    { label: 'Adresse', value: [quote.address_street, quote.address_city, quote.address_postal_code].filter(Boolean).join(', ') || '—' },
    { label: 'Surface', value: quote.surface_m2 ? `${quote.surface_m2} m²` : '—' },
    { label: 'Délai souhaité', value: TIMELINE_LABELS[quote.timeline] || quote.timeline || '—' },
    { label: 'Budget prévu', value: quote.budget?.replace('_', ' € – ') || '—' },
    { label: 'Date de dépôt', value: date },
    { label: 'Professionnels contactés', value: prosCount > 0 ? `${prosCount} professionnel${prosCount > 1 ? 's' : ''}` : 'Recherche en cours...' },
  ]

  return (
    <div style={{ padding: '24px', maxWidth: 720, margin: '0 auto' }}>
      <Link
        href="/espace-client/demandes"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--gray-500)', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 24 }}
      >
        <ArrowLeft size={16} /> Retour à mes demandes
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Demande #{id.slice(0, 8).toUpperCase()}</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', margin: 0 }}>{quote.ref_property_types?.label || 'Demande de devis'}</p>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 20, fontWeight: 700, fontSize: 12,
          background: status.bg, color: status.color
        }}>
          {status.label}
        </span>
      </div>

      {/* Détails */}
      <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
        {rows.map(({ label, value }, i) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            padding: '14px 20px',
            borderBottom: i < rows.length - 1 ? '1px solid var(--gray-100)' : 'none',
            gap: 16
          }}>
            <span style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 500, flexShrink: 0 }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--black)', textAlign: 'right' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Description */}
      {quote.description && (
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, padding: '20px', marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            Description
          </div>
          <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.7, margin: 0 }}>{quote.description}</p>
        </div>
      )}

      <Link
        href="/espace-client/messagerie"
        className="btn btn-red"
        style={{ width: '100%', justifyContent: 'center', display: 'flex' }}
      >
        Accéder à la messagerie
      </Link>
    </div>
  )
}
