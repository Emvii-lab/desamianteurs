'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { User, Mail, Phone, Save } from 'lucide-react'
import { motion } from 'framer-motion'
import { FormMessage } from '@/components/ui/FormMessage'

export default function ProfilClientForm() {
  const supabase = createClient()

  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [message, setMessage]     = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [prenom, setPrenom]       = useState('')
  const [nom, setNom]             = useState('')
  const [email, setEmail]         = useState('')
  const [telephone, setTelephone] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email || '')
      const { data: client } = await supabase
        .from('clients').select('first_name, last_name, phone')
        .eq('user_id', user.id).maybeSingle()
      if (client) {
        setPrenom(client.first_name || '')
        setNom(client.last_name || '')
        setTelephone(client.phone || '')
      } else {
        setPrenom(user.user_metadata?.prenom || '')
        setNom(user.user_metadata?.nom || '')
        setTelephone(user.user_metadata?.telephone || '')
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from('clients')
      .update({ first_name: prenom, last_name: nom, phone: telephone })
      .eq('user_id', user.id)
    setMessage(error
      ? { type: 'error', text: 'Erreur lors de la sauvegarde.' }
      : { type: 'success', text: 'Profil mis à jour avec succès.' }
    )
    setSaving(false)
  }

  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }
  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }

  if (loading) return <div style={{ padding: 32, color: '#9CA3AF' }}>Chargement...</div>

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Mon profil</h1>
      <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Gérez vos informations personnelles.</p>

      {message && <FormMessage type={message.type} text={message.text} />}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #F3F4F6' }}>
            <User size={16} color="#6B7280" />
            <span style={{ fontWeight: 700, fontSize: 15 }}>Identité</span>
          </div>
          <div className="step-grid-2" style={{ display: 'grid', gap: 16, marginBottom: 0 }}>
            <div><label style={lbl}>Prénom</label><input style={inp} value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Jean" /></div>
            <div><label style={lbl}>Nom</label><input style={inp} value={nom} onChange={e => setNom(e.target.value)} placeholder="Dupont" /></div>
          </div>
        </div>

        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #F3F4F6' }}>
            <Mail size={16} color="#6B7280" />
            <span style={{ fontWeight: 700, fontSize: 15 }}>Contact</span>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Email <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(non modifiable)</span></label>
            <input style={{ ...inp, background: '#F9FAFB', color: '#9CA3AF' }} value={email} disabled />
          </div>
          <div>
            <label style={lbl}>Téléphone</label>
            <div style={{ position: 'relative' }}>
              <Phone size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input style={{ ...inp, paddingLeft: 38 }} value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="06 00 00 00 00" type="tel" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn btn-red" style={{ justifyContent: 'center', gap: 8, display: 'flex' }}>
          <Save size={16} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </form>
    </div>
  )
}
