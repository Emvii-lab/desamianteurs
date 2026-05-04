import { UseFormReturn } from 'react-hook-form'
import { DemandeFormValues } from '@/hooks/useDemandeForm'
import GoogleAddressMap from '@/components/ui/GoogleAddressMap'
import CustomSelect from '@/components/ui/CustomSelect'
import { ACCESSIBILITY_OPTIONS, FLOOR_OPTIONS, ELEVATOR_OPTIONS } from '@/lib/constants'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  form: UseFormReturn<DemandeFormValues, any, any>
  onNext: () => void
  onBack: () => void
}

export function Step2Localisation({ form, onNext, onBack }: Props) {
  const { register, watch, setValue, formState: { errors } } = form
  const addressSearch = watch('addressSearch')
  const streetAddress = watch('streetAddress')
  const city = watch('city')
  const postalCode = watch('postalCode')
  const accessibility = watch('accessibility')
  const floor = watch('floor')
  const elevator = watch('elevator')

  return (
    <div className="fade-in-up">
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Localisation & détails du chantier</h2>
      <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 32 }}>Étape 2 sur 3 — Adresse, accessibilité, étage et description du chantier.</p>

      <div style={{ marginBottom: 24 }}>
        <label className="label">Adresse du bien <span style={{ color: 'var(--red)' }}>*</span></label>
        <GoogleAddressMap
          searchValue={addressSearch || ''}
          onSearchChange={v => setValue('addressSearch', v)}
          onSelect={r => {
            setValue('streetAddress', r.street, { shouldValidate: true })
            setValue('city', r.city, { shouldValidate: true })
            setValue('postalCode', r.postalCode, { shouldValidate: true })
            setValue('department', r.department)
          }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 1fr', gap: 10, marginTop: 10 }}>
          <input className="input" placeholder="Numéro et nom de rue" {...register('streetAddress')} />
          <input className="input" placeholder="Code postal" {...register('postalCode')} />
          <input className="input" placeholder="Ville" {...register('city')} />
        </div>
        {(errors.streetAddress || errors.city || errors.postalCode) && (
          <p className="error-text">L'adresse complète est requise</p>
        )}
      </div>

      <div style={{ marginBottom: 24 }}>
        <label className="label">Complément d'adresse <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(facultatif)</span></label>
        <input className="input" placeholder="Bâtiment, appartement, étage, digicode..." {...register('complement')} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label className="label">Accessibilité du chantier <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(facultatif)</span></label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {ACCESSIBILITY_OPTIONS.map(opt => {
            const active = accessibility === opt.id
            return (
              <button key={opt.id} type="button"
                onClick={() => setValue('accessibility', active ? '' : opt.id)}
                style={{
                  padding: '12px 8px', border: `1.5px solid ${active ? '#C0392B' : '#E5E7EB'}`,
                  borderRadius: 8, background: active ? 'rgba(192,57,43,0.04)' : 'white',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', color: active ? '#C0392B' : '#374151',
                }}
              >{opt.label}</button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div>
          <label className="label">Étage <span style={{ color: 'var(--red)' }}>*</span></label>
          <CustomSelect
            options={FLOOR_OPTIONS}
            value={floor} onChange={v => setValue('floor', v, { shouldValidate: true })} placeholder="Sélectionnez"
          />
          {errors.floor && <p className="error-text">{errors.floor.message}</p>}
        </div>
        <div>
          <label className="label">Ascenseur <span style={{ color: 'var(--red)' }}>*</span></label>
          <CustomSelect
            options={ELEVATOR_OPTIONS}
            value={elevator} onChange={v => setValue('elevator', v, { shouldValidate: true })} placeholder="Sélectionnez"
          />
          {errors.elevator && <p className="error-text">{errors.elevator.message}</p>}
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <label className="label">Description complémentaire</label>
        <textarea
          className="input" rows={4}
          placeholder="Ex : Plafond avec dalles suspectes dans couloir + cuisine, bâtiment de 1972, travaux prévus en mai..."
          {...register('description')}
          style={{ resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button type="button" className="btn btn-outline" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px' }}>
          <ChevronLeft size={18} /> Retour
        </button>
        <button type="button" className="btn btn-red" onClick={onNext} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px' }}>
          Étape suivante <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
