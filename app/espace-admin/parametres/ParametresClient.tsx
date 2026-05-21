'use client'

import { useState } from 'react'
import { 
  User, Mail, Shield, CheckCircle, 
  LogOut, Save
} from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/animations'
import { createClient } from '@/lib/supabase'
import { FormMessage } from '@/components/ui/FormMessage'

type Admin = {
  id: string
  first_name: string
  last_name: string
  email: string
}

export default function ParametresClient({ initialAdmin }: { initialAdmin: Admin }) {
  const [admin, setAdmin] = useState(initialAdmin)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const supabase = createClient()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase
      .from('admins')
      .update({
        first_name: admin.first_name,
        last_name: admin.last_name,
      })
      .eq('id', admin.id)

    if (error) {
      setMessage({ type: 'error', text: 'Une erreur est survenue lors de la mise à jour.' })
    } else {
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès.' })
    }
    setLoading(false)
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="admin-page-content"
      style={{ maxWidth: '800px' }}
    >
      <motion.div variants={fadeUp} style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0A0A0A', marginBottom: '4px' }}>Paramètres du compte</h1>
        <p style={{ color: '#6B7280', fontSize: '14px' }}>Gérez vos informations personnelles et vos préférences de sécurité.</p>
      </motion.div>

      <motion.form 
        variants={staggerContainer}
        onSubmit={handleUpdate} 
        style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
      >
        {/* Section Profil */}
        <motion.section variants={fadeUp} style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <User size={18} style={{ color: '#4B5563' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Profil Personnel</h2>
          </div>
          <div className="step-grid-2" style={{ display: 'grid', gap: '16px' }}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Prénom</label>
              <input 
                type="text" 
                value={admin.first_name || ''}
                onChange={e => setAdmin({ ...admin, first_name: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Nom</label>
              <input 
                type="text" 
                value={admin.last_name || ''}
                onChange={e => setAdmin({ ...admin, last_name: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ ...inputGroupStyle, marginTop: '16px' }}>
            <label style={labelStyle}>Adresse email (non modifiable)</label>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', 
              padding: '10px 12px', background: '#F9FAFB', 
              borderRadius: '8px', border: '1px solid #E5E7EB', color: '#6B7280', fontSize: '14px'
            }}>
              <Mail size={14} /> {admin.email}
            </div>
          </div>
        </motion.section>

        {/* Section Sécurité */}
        <motion.section variants={fadeUp} style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Shield size={18} style={{ color: '#4B5563' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Sécurité</h2>
          </div>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
            Votre compte est protégé par l'authentification sécurisée de la plateforme.
          </p>
          <div className="admin-params-security" style={{ display: 'flex', gap: '12px' }}>
            <motion.div 
              whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              style={{ 
                flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB',
                display: 'flex', alignItems: 'center', gap: '12px'
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={18} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Compte actif</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>Droit d'administration complet</div>
              </div>
            </motion.div>
            <motion.button 
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = '/connexion'}
              style={{ 
                padding: '12px 24px', borderRadius: '12px', border: '1px solid #FEE2E2', 
                background: 'white', color: '#DC2626', fontWeight: 600, fontSize: '14px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <LogOut size={16} /> Déconnexion
            </motion.button>
          </div>
        </motion.section>

        {message && <FormMessage type={message.type} text={message.text} />}

        {/* Save Button */}
        <div className="admin-params-save" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button type="submit" disabled={loading} className="btn btn-red" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Save size={16} /> {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  )
}

const sectionStyle: React.CSSProperties = {
  background: 'white',
  padding: '24px',
  borderRadius: '16px',
  border: '1px solid #E5E7EB',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
}

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '20px',
  paddingBottom: '12px',
  borderBottom: '1px solid #F3F4F6',
}

const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
}

const labelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#374151',
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s',
}
