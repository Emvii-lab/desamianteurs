import { UseFormReturn } from 'react-hook-form'
import { DemandeFormValues } from '@/hooks/useDemandeForm'
import { useState } from 'react'
import { User, CheckCircle2, Eye, EyeOff, Send, ChevronLeft } from 'lucide-react'

interface Props {
  form: UseFormReturn<DemandeFormValues>
  onBack: () => void
  onSubmit: () => void
  loading: boolean
  error: string
  isLoggedIn: boolean
  loggedInName: string
  authMode: 'create' | 'login'
  setAuthMode: (mode: 'create' | 'login') => void
}

export function Step3Coordonnees({ 
  form, onBack, onSubmit, loading, error, 
  isLoggedIn, loggedInName, authMode, setAuthMode 
}: Props) {
  const { register, watch, formState: { errors } } = form
  const [showPwd, setShowPwd] = useState(false)
  const [showPwdConfirm, setShowPwdConfirm] = useState(false)

  return (
    <div className="fade-in-up">
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Vos coordonnées</h2>
      <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 28 }}>Étape 3 sur 3 — Dernière étape avant d&apos;envoyer votre demande aux pros.</p>

      {isLoggedIn ? (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '16px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
          <CheckCircle2 size={20} color="#16A34A" strokeWidth={2} />
          <span style={{ fontSize: 14, color: '#166534' }}>
            Connecté en tant que <strong>{loggedInName}</strong> — votre demande sera envoyée directement.
          </span>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', border: '1.5px solid #E5E7EB', borderRadius: 8, overflow: 'hidden', marginBottom: 28 }}>
            {(['create', 'login'] as const).map(mode => (
              <button key={mode} type="button" onClick={() => setAuthMode(mode)} className="step-tab-btn" style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                border: 'none', cursor: 'pointer', fontWeight: 600,
                background: authMode === mode ? '#C0392B' : 'white',
                color: authMode === mode ? 'white' : '#374151',
                transition: 'all 0.15s',
              }}>
                {mode === 'create' ? <User size={16} /> : <CheckCircle2 size={16} />}
                {mode === 'create' ? 'Créer mon compte' : "J'ai déjà un compte"}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {authMode === 'create' && (
              <div className="step-grid-2" style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label className="label">Prénom</label>
                  <input className="input" placeholder="Jean" {...register('prenom')} />
                  {errors.prenom && <p className="error-text">{errors.prenom.message}</p>}
                </div>
                <div>
                  <label className="label">Nom</label>
                  <input className="input" placeholder="Dupont" {...register('nom')} />
                  {errors.nom && <p className="error-text">{errors.nom.message}</p>}
                </div>
              </div>
            )}
            <div>
              <label className="label">Adresse email</label>
              <input type="email" className="input" placeholder="jean.dupont@email.com" {...register('email')} />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>
            {authMode === 'create' && (
              <div>
                <label className="label">Téléphone</label>
                <input type="tel" className="input" placeholder="00 00 00 00 00" {...register('telephone')} />
                {errors.telephone && <p className="error-text">{errors.telephone.message}</p>}
              </div>
            )}
            <div>
              <label className="label">Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} className="input" placeholder={authMode === 'create' ? "8 caractères minimum" : "••••••••"} {...register('password')} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                  {showPwd ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>
            {authMode === 'create' && (
              <div>
                <label className="label">Confirmer le mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPwdConfirm ? 'text' : 'password'} className="input" placeholder="Confirmez votre mot de passe" {...register('passwordConfirm')} style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPwdConfirm(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                    {showPwdConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                {errors.passwordConfirm && <p className="error-text">{errors.passwordConfirm.message}</p>}
              </div>
            )}
          </div>

          {authMode === 'create' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#4B5563', cursor: 'pointer' }}>
                <input type="checkbox" {...register('cgu')} style={{ accentColor: '#C0392B', marginTop: 2 }} />
                <span>J&apos;accepte les <a href="/cgu" style={{ color: '#C0392B' }}>CGU</a> et la <a href="/confidentialite" style={{ color: '#C0392B' }}>Politique de confidentialité</a></span>
              </label>
              {errors.cgu && <p className="error-text">{errors.cgu.message}</p>}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#4B5563', cursor: 'pointer' }}>
                <input type="checkbox" {...register('notifs')} style={{ accentColor: '#C0392B' }} />
                J&apos;accepte de recevoir des notifications par e-mail
              </label>
            </div>
          )}
        </>
      )}

      {error && <div className="form-error" style={{ marginTop: 16 }}>{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <button type="button" className="btn btn-outline step-nav-btn" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ChevronLeft size={18} /> Retour
        </button>
        <button type="button" className="btn btn-red step-nav-btn" onClick={onSubmit} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: loading ? 0.7 : 1 }}>
          <Send size={16} strokeWidth={2} />
          {loading ? 'Envoi en cours...' : 'Envoyer ma demande'}
        </button>
      </div>
    </div>
  )
}
