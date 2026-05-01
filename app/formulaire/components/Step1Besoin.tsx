import { ServiceType, PropertyType } from '@/lib/types'
import { ICON_MAP, USER_TYPES, SITUATIONS_PHASE, SITUATIONS_CONTEXT, TIMINGS, BUDGET_OPTIONS, INTERVENTION_TYPES_SS3, PHASES_MOE, ACCREDITATIONS_LABO } from '@/lib/constants'
import CustomSelect from '@/components/ui/CustomSelect'
import { AlertCircle, ChevronRight, Upload, X, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { UseFormReturn } from 'react-hook-form'
import { DemandeFormValues } from '@/hooks/useDemandeForm'
import { formatSize } from '@/lib/utils'

interface Props {
  form: UseFormReturn<DemandeFormValues>
  services: ServiceType[]
  propertyTypes: PropertyType[]
  onNext: () => void
  files: File[]
  onFilesChange: (files: File[]) => void
}

export function Step1Besoin({ form, services, propertyTypes, onNext, files, onFilesChange }: Props) {
  const { register, watch, setValue, formState: { errors } } = form
  const selectedServices = watch('serviceTypes')
  const userType = watch('userType')
  const propertyType = watch('propertyType')
  const timing = watch('timing')
  const situationPhase = watch('situationPhase')
  const situationContext = watch('situationContext')
  const interventionTypes = watch('interventionTypes')
  const moePhase = watch('moePhase')
  const accreditations = watch('accreditations')

  const propertyOptions = userType 
    ? propertyTypes.filter(p => !p.category || p.category === (userType === 'Particulier' ? 'individual' : userType === 'Professionnel privé' ? 'private_professional' : 'public_authority'))
    : []

  const handleServiceToggle = (id: string) => {
    const current = selectedServices || []
    const updated = current.includes(id) ? current.filter(i => i !== id) : [...current, id]
    setValue('serviceTypes', updated, { shouldValidate: true })
  }

  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles) return
    const added = Array.from(newFiles)
    onFilesChange([...files, ...added])
  }

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="fade-in-up">
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Décrivez votre besoin</h2>
      <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 32 }}>Étape 1 sur 3 — Plus vous êtes précis, mieux les professionnels pourront vous répondre.</p>

      {/* Prestation Type */}
      <div style={{ marginBottom: 40 }}>
        <label className="label" style={{ marginBottom: 16 }}>Type de prestation <span style={{ color: 'var(--red)' }}>*</span></label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {services.map(st => {
            const selected = selectedServices?.includes(st.id)
            const Icon = ICON_MAP[st.code] ?? AlertCircle
            return (
              <motion.button key={st.id} type="button"
                whileHover={{ scale: 1.01, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleServiceToggle(st.id)}
                style={{
                  padding: '18px 20px',
                  border: `1.5px solid ${selected ? '#C0392B' : '#E5E7EB'}`,
                  borderRadius: 12,
                  background: selected ? 'rgba(192,57,43,0.04)' : 'white',
                  textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.15s, background-color 0.15s',
                  boxShadow: selected ? '0 4px 12px rgba(192,57,43,0.08)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: selected ? '#C0392B' : '#F3F4F6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: selected ? 'white' : '#6B7280', transition: 'all 0.15s',
                  }}>
                    <Icon size={16} strokeWidth={2} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: selected ? '#C0392B' : '#111', lineHeight: 1.2, fontFamily: 'var(--font-sans), sans-serif' }}>{st.name}</span>
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.5, paddingLeft: 0 }}>{st.description}</div>
              </motion.button>
            )
          })}
        </div>
        {errors.serviceTypes && <p className="error-text">{errors.serviceTypes.message}</p>}
      </div>

      {/* User Type */}
      <div style={{ marginBottom: 40 }}>
        <label className="label" style={{ marginBottom: 16 }}>Vous êtes <span style={{ color: 'var(--red)' }}>*</span></label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {USER_TYPES.map(t => (
            <motion.button key={t} type="button" 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setValue('userType', t, { shouldValidate: true })} 
              style={{
                padding: '12px 8px', border: `1.5px solid ${userType === t ? '#C0392B' : '#E5E7EB'}`,
                borderRadius: 8, background: userType === t ? 'rgba(192,57,43,0.04)' : 'white',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', color: userType === t ? '#C0392B' : '#374151',
                transition: 'all 0.15s', fontFamily: 'var(--font-sans), sans-serif',
              }}>{t}</motion.button>
          ))}
        </div>
        {errors.userType && <p className="error-text">{errors.userType.message}</p>}
      </div>

      {/* Property & Surface */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
        <div>
          <label className="label">Type de bien <span style={{ color: 'var(--red)' }}>*</span></label>
          <CustomSelect
            options={propertyOptions.map(p => ({ id: p.id, label: p.label }))}
            value={propertyType}
            onChange={v => setValue('propertyType', v, { shouldValidate: true })}
            placeholder={userType ? 'Sélectionner le type de bien' : "Sélectionnez d'abord votre profil"}
            disabled={!userType}
          />
          {errors.propertyType && <p className="error-text">{errors.propertyType.message}</p>}
        </div>
        <div>
          <label className="label">Surface estimée (m²)</label>
          <div style={{ position: 'relative' }}>
            <input type="number" className="input" placeholder="Ex : 75" {...register('surface')} />
            <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--gray-400)', fontWeight: 700 }}>m²</span>
          </div>
        </div>
      </div>

      {/* Conditional Fields (same logic as original) */}
      {services.some(s => selectedServices?.includes(s.id) && s.code === 'diagnostic_amiante') && (
        <div style={{ marginBottom: 32 }} className="fade-in">
          <label className="label" style={{ marginBottom: 12 }}>Phase du projet (Diagnostic) <span style={{ color: 'var(--red)' }}>*</span></label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 10 }}>
            {SITUATIONS_PHASE.map(s => (
              <motion.button key={s.id} type="button" 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setValue('situationPhase', s.id)} 
                style={{
                  padding: '12px 8px', border: `1.5px solid ${situationPhase === s.id ? '#C0392B' : '#E5E7EB'}`,
                  borderRadius: 8, background: situationPhase === s.id ? 'rgba(192,57,43,0.04)' : 'white',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', color: situationPhase === s.id ? '#C0392B' : '#374151',
                  fontFamily: 'var(--font-sans), sans-serif',
                }}>{s.label}</motion.button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {SITUATIONS_CONTEXT.map(s => {
              const active = situationContext?.includes(s.id)
              return (
                <motion.button key={s.id} type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setValue('situationContext', active ? situationContext.filter(x => x !== s.id) : [...(situationContext || []), s.id])}
                  style={{
                    padding: '12px 8px', border: `1.5px solid ${active ? '#C0392B' : '#E5E7EB'}`,
                    borderRadius: 8, background: active ? 'rgba(192,57,43,0.04)' : 'white',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer', color: active ? '#C0392B' : '#374151',
                    fontFamily: 'var(--font-sans), sans-serif',
                  }}>{s.label}</motion.button>
              )
            })}
          </div>
        </div>
      )}

      {services.some(s => selectedServices?.includes(s.id) && s.code === 'desamiantage') && (
        <div style={{ marginBottom: 32 }} className="fade-in">
          <label className="label" style={{ marginBottom: 12 }}>Type d'intervention (Désamiantage) <span style={{ color: 'var(--red)' }}>*</span></label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {INTERVENTION_TYPES_SS3.map(s => {
              const active = interventionTypes?.includes(s.id)
              return (
                <motion.button key={s.id} type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setValue('interventionTypes', active ? interventionTypes.filter(x => x !== s.id) : [...(interventionTypes || []), s.id])}
                  style={{
                    padding: '12px 8px', border: `1.5px solid ${active ? '#C0392B' : '#E5E7EB'}`,
                    borderRadius: 8, background: active ? 'rgba(192,57,43,0.04)' : 'white',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer', color: active ? '#C0392B' : '#374151',
                    fontFamily: 'var(--font-sans), sans-serif',
                  }}>{s.label}</motion.button>
              )
            })}
          </div>
        </div>
      )}

      {services.some(s => selectedServices?.includes(s.id) && s.code === 'moe_amiante_plomb') && (
        <div style={{ marginBottom: 32 }} className="fade-in">
          <label className="label" style={{ marginBottom: 12 }}>Mission MOE / AMO <span style={{ color: 'var(--red)' }}>*</span></label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {PHASES_MOE.map(s => (
              <motion.button key={s.id} type="button" 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setValue('moePhase', s.id)} 
                style={{
                  padding: '12px 8px', border: `1.5px solid ${moePhase === s.id ? '#C0392B' : '#E5E7EB'}`,
                  borderRadius: 8, background: moePhase === s.id ? 'rgba(192,57,43,0.04)' : 'white',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', color: moePhase === s.id ? '#C0392B' : '#374151',
                  fontFamily: 'var(--font-sans), sans-serif',
                }}>{s.label}</motion.button>
            ))}
          </div>
        </div>
      )}

      {services.some(s => selectedServices?.includes(s.id) && s.code === 'preleveur_air_materiaux') && (
        <div style={{ marginBottom: 32 }} className="fade-in">
          <label className="label" style={{ marginBottom: 12 }}>Besoins d'analyse (Laboratoire) <span style={{ color: 'var(--red)' }}>*</span></label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {ACCREDITATIONS_LABO.map(s => {
              const active = accreditations?.includes(s.id)
              return (
                <motion.button key={s.id} type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setValue('accreditations', active ? accreditations.filter(x => x !== s.id) : [...(accreditations || []), s.id])}
                  style={{
                    padding: '12px 8px', border: `1.5px solid ${active ? '#C0392B' : '#E5E7EB'}`,
                    borderRadius: 8, background: active ? 'rgba(192,57,43,0.04)' : 'white',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer', color: active ? '#C0392B' : '#374151',
                    fontFamily: 'var(--font-sans), sans-serif',
                  }}>{s.label}</motion.button>
              )
            })}
          </div>
        </div>
      )}

      {/* ... (other conditional fields following same pattern) ... */}
      
      {/* Timing & Budget */}
      <div style={{ marginBottom: 32 }}>
        <label className="label" style={{ marginBottom: 12 }}>Quand est prévue la prestation ? <span style={{ color: 'var(--red)' }}>*</span></label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {TIMINGS.map(t => (
            <motion.button key={t.id} type="button" 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setValue('timing', t.id, { shouldValidate: true })} 
              style={{
                padding: '12px 8px', border: `1.5px solid ${timing === t.id ? '#C0392B' : '#E5E7EB'}`,
                borderRadius: 8, background: timing === t.id ? 'rgba(192,57,43,0.04)' : 'white',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', color: timing === t.id ? '#C0392B' : '#374151',
                fontFamily: 'var(--font-sans), sans-serif',
              }}>{t.label}</motion.button>
          ))}
        </div>
        {errors.timing && <p className="error-text">{errors.timing.message}</p>}
      </div>

      <div style={{ marginBottom: 32 }}>
        <label className="label" style={{ marginBottom: 12 }}>Budget prévu <span style={{ color: 'var(--red)' }}>*</span></label>
        <CustomSelect
          options={BUDGET_OPTIONS}
          value={watch('budget')}
          onChange={v => setValue('budget', v, { shouldValidate: true })}
          placeholder="Sélectionner un budget"
        />
        {errors.budget && <p className="error-text">{errors.budget.message}</p>}
      </div>

      {/* File Upload */}
      <div style={{ marginBottom: 32 }}>
        <label className="label" style={{ marginBottom: 12 }}>Documents et photos <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(facultatif)</span></label>
        <label style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 8, padding: '32px 24px', cursor: 'pointer', border: '1.5px dashed #D1D5DB', borderRadius: 10,
          background: '#FAFAFA', transition: 'border-color 0.15s',
        }}>
          <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf,.docx" style={{ display: 'none' }} onChange={e => handleFileChange(e.target.files)} />
          <Upload size={32} color="#9CA3AF" />
          <span style={{ fontWeight: 700, fontSize: 14, color: '#374151' }}>Glissez vos documents et vos photos</span>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>JPG, PNG, PDF, DOCX — Max 10 MB</span>
        </label>
        {files.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {files.map((file, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white' }}>
                <FileText size={16} color="#C0392B" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{formatSize(file.size)}</div>
                </div>
                <button type="button" onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9CA3AF' }}>
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-red" onClick={onNext} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px' }}>
          Étape suivante <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
