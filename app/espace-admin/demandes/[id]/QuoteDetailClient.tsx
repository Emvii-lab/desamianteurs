'use client'

import { 
  ChevronLeft, MapPin, Calendar, Clock, 
  Building2, User, Mail, Phone, FileText,
  CheckCircle2, AlertCircle, Send, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/animations'

type Props = {
  quote: any
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
  draft:       { label: 'Brouillon',  color: '#6B7280', bg: '#F3F4F6', Icon: FileText },
  submitted:   { label: 'Envoyée',    color: '#D97706', bg: '#FEF3C7', Icon: Clock },
  in_progress: { label: 'En cours',   color: '#2563EB', bg: '#DBEAFE', Icon: Send },
  completed:   { label: 'Terminée',   color: '#059669', bg: '#D1FAE5', Icon: CheckCircle2 },
  cancelled:   { label: 'Annulée',    color: 'var(--red)', bg: 'var(--red-light)', Icon: AlertCircle },
  published:   { label: 'Publiée',    color: '#059669', bg: '#D1FAE5', Icon: Send },
}

const TIMELINE_LABELS: Record<string, string> = {
  emergency:       'Urgent',
  within_1_month:  'Sous 1 mois',
  within_3_months: 'Sous 3 mois',
  over_3_months:   '+ 3 mois',
}

export default function QuoteDetailClient({ quote }: Props) {
  const status = STATUS_CONFIG[quote.status] || STATUS_CONFIG.draft
  const StatusIcon = status.Icon
  const dateStr = quote.created_at ? format(new Date(quote.created_at), 'dd MMMM yyyy', { locale: fr }) : '—'

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="admin-page-content"
    >
      {/* Fil d'Ariane & Retour */}
      <motion.div variants={fadeUp} style={{ marginBottom: '24px' }}>
        <Link href="/espace-admin/demandes" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280', textDecoration: 'none', fontSize: '14px' }}>
          <ArrowLeft size={16} /> Retour aux demandes
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={fadeUp} className="quote-header">
        <div>
          <div className="quote-title-row">
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0A0A0A' }}>Demande #{quote.id.slice(0, 8)}</h1>
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '6px', 
              padding: '6px 12px', borderRadius: '20px', 
              background: status.bg, color: status.color, 
              fontSize: '12px', fontWeight: 700, textTransform: 'uppercase'
            }}>
              <StatusIcon size={14} />
              {status.label}
            </div>
          </div>
          <p style={{ color: '#6B7280', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} /> Déposée le {dateStr}
          </p>
        </div>
      </motion.div>

      <div className="quote-detail-grid" style={{ display: 'grid', gap: '24px' }}>
        {/* Colonne Gauche: Détails */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Section title="Détails du projet">
            <div className="quote-info-grid" style={{ display: 'grid', gap: '24px' }}>
              <InfoItem icon={Building2} label="Type de bien" value={quote.ref_property_types?.label || 'Propriété'} />
              <InfoItem icon={FileText} label="Surface" value={quote.surface_m2 ? `${quote.surface_m2} m²` : '—'} />
              <InfoItem icon={Clock} label="Délai souhaité" value={TIMELINE_LABELS[quote.timeline] || quote.timeline} />
              <InfoItem icon={MapPin} label="Localisation" value={`${quote.address_city || ''} (${quote.address_department || ''})`} />
            </div>

            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #F3F4F6' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '12px' }}>Services demandés</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {quote.quote_service_types?.length > 0 ? (
                  quote.quote_service_types.map((s: any, idx: number) => (
                    <span key={idx} style={{ padding: '6px 12px', background: '#F0F9FF', color: '#0284C7', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
                      {s.service?.label}
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#6B7280', fontSize: '13px' }}>Aucun service spécifié</span>
                )}
              </div>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #F3F4F6' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '12px' }}>Description</p>
              <div style={{ fontSize: '15px', color: '#374151', lineHeight: '1.6', background: '#F9FAFB', padding: '16px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
                {quote.description || "Aucune description fournie par le client."}
              </div>
            </div>
          </Section>

          <Section title="Adresse exacte">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0F9FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={20} />
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{quote.address_street || "Adresse non fournie"}</div>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>{quote.address_postal_code} {quote.address_city}</div>
                {quote.address_complement && <div style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '4px' }}>Complément : {quote.address_complement}</div>}
              </div>
            </div>
          </Section>
        </div>

        {/* Colonne Droite: Contact & Pros */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Section title="Contact Client">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--red-light)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {quote.contact_first_name?.[0]}{quote.contact_last_name?.[0]}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600 }}>{quote.contact_first_name} {quote.contact_last_name}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Client {quote.client_type === 'individual' ? 'Particulier' : 'Professionnel'}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <ContactLink icon={Mail} label={quote.contact_email} href={`mailto:${quote.contact_email}`} />
                <ContactLink icon={Phone} label={quote.contact_phone} href={`tel:${quote.contact_phone}`} />
              </div>
            </div>
          </Section>

          <Section title="Professionnels assignés">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {quote.quote_assignments?.length > 0 ? (
                quote.quote_assignments.map((a: any) => (
                  <div key={a.id} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #F3F4F6', background: '#F9FAFB' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>{a.partner?.company_name}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> Assigné le {format(new Date(a.created_at), 'dd/MM/yy')}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', background: '#F9FAFB', borderRadius: '12px', border: '1px dashed #E5E7EB' }}>
                  <AlertCircle size={24} style={{ color: '#9CA3AF', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '13px', color: '#6B7280' }}>Aucun professionnel n'a encore été assigné à cette demande.</p>
                </div>
              )}
              
              {quote.status === 'draft' && (
                <button className="btn btn-red" style={{ width: '100%', marginTop: '8px' }}>
                  Publier la demande
                </button>
              )}
            </div>
          </Section>
        </div>
      </div>
    </motion.div>
  )
}

function Section({ title, children, noPadding = false }: { title: string; children: React.ReactNode; noPadding?: boolean }) {
  return (
    <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #F3F4F6', background: '#F9FAFB' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
      </div>
      <div style={{ padding: noPadding ? 0 : '24px' }}>
        {children}
      </div>
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F3F4F6', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} />
      </div>
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{value}</div>
      </div>
    </div>
  )
}

function ContactLink({ icon: Icon, label, href }: { icon: any; label: string; href: string }) {
  return (
    <a href={href} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#4B5563', fontSize: '14px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #F3F4F6', transition: 'all 0.2s' }}>
      <Icon size={16} style={{ color: '#9CA3AF' }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    </a>
  )
}
