'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { CheckCircle, AlertCircle, Clock, XCircle, Upload, RefreshCw, Info, Loader } from 'lucide-react'

interface RefDoc {
  id: string
  code: string
  label: string
  description: string | null
  is_required: boolean
  sort_order: number
}

interface UploadedDoc {
  id: string
  document_type_id: string
  status: 'missing' | 'pending' | 'verified' | 'rejected' | 'expired'
  file_name: string | null
  file_size: number | null
  uploaded_at: string | null
  verified_at: string | null
  expires_at: string | null
  notes: string | null
  rejection_reason: string | null
}

type DocStatus = 'missing' | 'pending' | 'verified' | 'rejected' | 'expired'

interface MergedDoc extends RefDoc {
  uploadedId: string | null
  displayStatus: DocStatus
  fileName: string | null
  fileSize: number | null
  uploadedAt: string | null
  verifiedAt: string | null
  expiresAt: string | null
  rejectionReason: string | null
}

interface Props {
  partnerId: string
  userId: string
  partnerTypeLabel: string
  isVerified: boolean
  refDocs: RefDoc[]
  uploadedDocs: UploadedDoc[]
}

const STATUS_CONFIG: Record<DocStatus, {
  bg: string; border: string; iconColor: string; labelBg: string; labelColor: string; labelText: string
}> = {
  verified: {
    bg: '#F0FDF4', border: '#BBF7D0',
    iconColor: '#16A34A', labelBg: '#D1FAE5', labelColor: '#065F46', labelText: 'Vérifié',
  },
  pending: {
    bg: '#FFFBEB', border: '#FDE68A',
    iconColor: '#D97706', labelBg: '#FEF3C7', labelColor: '#92400E', labelText: 'En attente',
  },
  rejected: {
    bg: '#FEF2F2', border: '#FECACA',
    iconColor: '#DC2626', labelBg: '#FEE2E2', labelColor: '#991B1B', labelText: 'Refusé',
  },
  expired: {
    bg: '#FFF7ED', border: '#FED7AA',
    iconColor: '#EA580C', labelBg: '#FFEDD5', labelColor: '#9A3412', labelText: 'Expiré',
  },
  missing: {
    bg: '#FFFBEB', border: '#FDE68A',
    iconColor: '#D97706', labelBg: '#FEF3C7', labelColor: '#92400E', labelText: 'Manquant',
  },
}

function StatusIcon({ status }: { status: DocStatus }) {
  const color = STATUS_CONFIG[status].iconColor
  if (status === 'verified') return <CheckCircle size={20} color={color} strokeWidth={2.5} style={{ flexShrink: 0 }} />
  if (status === 'pending')  return <Clock        size={20} color={color} strokeWidth={2}   style={{ flexShrink: 0 }} />
  if (status === 'rejected') return <XCircle      size={20} color={color} strokeWidth={2.5} style={{ flexShrink: 0 }} />
  if (status === 'expired')  return <AlertCircle  size={20} color={color} strokeWidth={2}   style={{ flexShrink: 0 }} />
  return                            <AlertCircle  size={20} color={color} strokeWidth={2}   style={{ flexShrink: 0 }} />
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export default function DocumentsClient({
  partnerId, userId, partnerTypeLabel, isVerified, refDocs, uploadedDocs,
}: Props) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeDocId, setActiveDocId] = useState<string | null>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [docs, setDocs] = useState<MergedDoc[]>(() =>
    refDocs.map(rd => {
      const up = uploadedDocs.find(u => u.document_type_id === rd.id)
      return {
        ...rd,
        uploadedId:      up?.id ?? null,
        displayStatus:   (up?.status ?? 'missing') as DocStatus,
        fileName:        up?.file_name ?? null,
        fileSize:        up?.file_size ?? null,
        uploadedAt:      up?.uploaded_at ?? null,
        verifiedAt:      up?.verified_at ?? null,
        expiresAt:       up?.expires_at ?? null,
        rejectionReason: up?.rejection_reason ?? null,
      }
    })
  )

  const verifiedCount  = docs.filter(d => d.displayStatus === 'verified').length
  const requiredTotal  = docs.filter(d => d.is_required).length
  const missingCount   = docs.filter(d => d.displayStatus === 'missing' || d.displayStatus === 'rejected').length
  const pct            = requiredTotal > 0 ? Math.round((verifiedCount / requiredTotal) * 100) : 0

  const triggerUpload = (docId: string) => {
    setActiveDocId(docId)
    if (fileInputRef.current) fileInputRef.current.value = ''
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeDocId) return
    const doc = docs.find(d => d.id === activeDocId)
    if (!doc) return

    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [activeDocId]: 'Fichier trop volumineux (max 10 Mo)' }))
      return
    }

    setUploadingId(activeDocId)
    setErrors(prev => { const n = { ...prev }; delete n[activeDocId]; return n })

    const ext  = file.name.split('.').pop() ?? 'pdf'
    const path = `${userId}/${doc.code}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('partner-documents')
      .upload(path, file, { upsert: true })

    if (uploadErr) {
      setErrors(prev => ({ ...prev, [activeDocId]: uploadErr.message }))
      setUploadingId(null)
      return
    }

    const { error: dbErr } = await supabase
      .from('partner_documents')
      .upsert({
        partner_id:       partnerId,
        document_type_id: doc.id,
        status:           'pending',
        file_url:         path,
        file_name:        file.name,
        file_size:        file.size,
        uploaded_at:      new Date().toISOString(),
      }, { onConflict: 'partner_id,document_type_id' })

    if (dbErr) {
      setErrors(prev => ({ ...prev, [activeDocId]: dbErr.message }))
    } else {
      setDocs(prev => prev.map(d =>
        d.id === activeDocId
          ? { ...d, displayStatus: 'pending', fileName: file.name, fileSize: file.size, uploadedAt: new Date().toISOString(), rejectionReason: null }
          : d
      ))
    }
    setUploadingId(null)
  }

  return (
    <>
      {/* Header */}
      <div className="dash-header">
        <h1>Documents obligatoires</h1>
        <p>
          Gérez les documents requis pour votre profil{' '}
          <strong>{partnerTypeLabel}</strong>.
          Tous les documents doivent être fournis et vérifiés pour que votre profil soit visible.
        </p>
      </div>

      {/* Barre de progression */}
      <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, padding: '20px 24px', marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Progression du dossier</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: pct === 100 ? '#16A34A' : 'var(--red)' }}>
            {verifiedCount} / {requiredTotal} documents
          </span>
        </div>
        <div style={{ height: 8, background: 'var(--gray-100)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 4, transition: 'width 0.5s ease',
            width: `${pct}%`,
            background: pct === 100 ? '#16A34A' : 'var(--red)',
          }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 8 }}>
          {pct === 100
            ? '✓ Dossier complet — votre profil est visible des clients.'
            : `Il vous reste ${missingCount} document${missingCount > 1 ? 's' : ''} à fournir pour compléter votre dossier.`
          }
        </div>
      </div>

      {/* Liste des documents */}
      <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--gray-100)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Vos documents</h2>
          {missingCount > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#FEF3C7', color: '#92400E' }}>
              {missingCount} manquant{missingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {docs.map(doc => {
            const cfg       = STATUS_CONFIG[doc.displayStatus]
            const isLoading = uploadingId === doc.id
            const canUpload = doc.displayStatus === 'missing' || doc.displayStatus === 'rejected' || doc.displayStatus === 'expired'
            const canReplace = doc.displayStatus === 'verified' || doc.displayStatus === 'pending'

            return (
              <div key={doc.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', borderRadius: 8,
                background: cfg.bg, border: `1px solid ${cfg.border}`,
                transition: 'all 0.2s',
              }}>
                {isLoading
                  ? <Loader size={20} style={{ flexShrink: 0, color: cfg.iconColor, animation: 'spin 1s linear infinite' }} />
                  : <StatusIcon status={doc.displayStatus} />
                }

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: doc.displayStatus === 'missing' ? '#92400E' : doc.displayStatus === 'rejected' ? '#991B1B' : 'var(--black)' }}>
                    {doc.label}
                    {doc.is_required && <span style={{ color: 'var(--red)', marginLeft: 4 }}>*</span>}
                  </div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                    {doc.displayStatus === 'missing' && (doc.description ?? 'Document à fournir')}
                    {doc.displayStatus === 'pending' && doc.fileName && `${doc.fileName}${doc.fileSize ? ` · ${formatSize(doc.fileSize)}` : ''} · En attente de vérification`}
                    {doc.displayStatus === 'verified' && doc.verifiedAt && `Vérifié le ${new Date(doc.verifiedAt).toLocaleDateString('fr-FR')}${doc.fileName ? ` · ${doc.fileName}` : ''}`}
                    {doc.displayStatus === 'rejected' && (doc.rejectionReason ?? 'Document refusé — veuillez renvoyer un nouveau fichier')}
                    {doc.displayStatus === 'expired' && `Expiré${doc.expiresAt ? ` le ${new Date(doc.expiresAt).toLocaleDateString('fr-FR')}` : ''} — renouvellement requis`}
                  </div>
                  {errors[doc.id] && (
                    <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors[doc.id]}</div>
                  )}
                </div>

                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 12, background: cfg.labelBg, color: cfg.labelColor, flexShrink: 0 }}>
                  {cfg.labelText}
                </span>

                {canUpload && (
                  <button
                    className="btn btn-red btn-sm"
                    style={{ fontSize: 11, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                    disabled={isLoading}
                    onClick={() => triggerUpload(doc.id)}
                  >
                    <Upload size={12} />
                    {doc.displayStatus === 'rejected' ? 'Renvoyer' : doc.displayStatus === 'expired' ? 'Renouveler' : 'Téléverser'}
                  </button>
                )}
                {canReplace && (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                    disabled={isLoading}
                    onClick={() => triggerUpload(doc.id)}
                  >
                    <RefreshCw size={12} />
                    Remplacer
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Info box */}
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Info size={18} color="#1D4ED8" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 13, color: '#1E40AF', lineHeight: 1.6 }}>
          <strong>Documents requis pour un {partnerTypeLabel} :</strong>{' '}
          {docs.filter(d => d.is_required).map(d => d.label).join(', ')}.
          {' '}Votre profil ne sera visible qu'une fois le dossier complet et vérifié par notre équipe.
        </div>
      </div>

      {/* Input fichier unique partagé */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  )
}
