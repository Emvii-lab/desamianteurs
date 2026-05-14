import { describe, it, expect } from 'vitest'
import { demandeSchema } from '@/hooks/useDemandeForm'

function base() {
  return {
    serviceTypes: ['desamiantage'],
    userType: 'individual',
    propertyType: 'house',
    situationContext: [] as string[],
    interventionTypes: [] as string[],
    accreditations: [] as string[],
    timing: 'within_1_month',
    budget: 'under_1000',
    streetAddress: '1 rue de la Paix',
    city: 'Paris',
    postalCode: '75001',
    floor: 'ground_floor',
    elevator: 'oui',
    prenom: 'Jean',
    nom: 'Dupont',
    email: 'jean.dupont@example.com',
    telephone: '0612345678',
    cgu: true,
    notifs: false,
  }
}

describe('demandeSchema — champs adresse', () => {
  it('refuse si streetAddress est vide', () => {
    expect(demandeSchema.safeParse({ ...base(), streetAddress: '' }).success).toBe(false)
  })

  it('refuse si city est vide', () => {
    expect(demandeSchema.safeParse({ ...base(), city: '' }).success).toBe(false)
  })

  it('refuse si postalCode est vide', () => {
    expect(demandeSchema.safeParse({ ...base(), postalCode: '' }).success).toBe(false)
  })

  it('refuse si floor est vide', () => {
    expect(demandeSchema.safeParse({ ...base(), floor: '' }).success).toBe(false)
  })

  it('refuse si elevator est vide', () => {
    expect(demandeSchema.safeParse({ ...base(), elevator: '' }).success).toBe(false)
  })

  it('accepte complement optionnel absent', () => {
    const { complement: _, ...data } = base() as any
    expect(demandeSchema.safeParse(data).success).toBe(true)
  })
})

describe('demandeSchema — champs contact', () => {
  it('refuse si prenom est vide', () => {
    expect(demandeSchema.safeParse({ ...base(), prenom: '' }).success).toBe(false)
  })

  it('refuse si nom est vide', () => {
    expect(demandeSchema.safeParse({ ...base(), nom: '' }).success).toBe(false)
  })

  it('accepte un mot de passe valide avec confirmation identique', () => {
    const r = demandeSchema.safeParse({
      ...base(),
      password: 'monMotDePasse1',
      passwordConfirm: 'monMotDePasse1',
    })
    expect(r.success).toBe(true)
  })

  it('refuse un mot de passe de moins de 8 caractères', () => {
    const r = demandeSchema.safeParse({ ...base(), password: 'court', passwordConfirm: 'court' })
    expect(r.success).toBe(false)
  })
})

describe('demandeSchema — serviceTypes multiples', () => {
  it('accepte plusieurs types de service', () => {
    const r = demandeSchema.safeParse({
      ...base(),
      serviceTypes: ['desamiantage', 'diagnostic_amiante'],
    })
    expect(r.success).toBe(true)
  })

  it('refuse un tableau de serviceTypes vide', () => {
    expect(demandeSchema.safeParse({ ...base(), serviceTypes: [] }).success).toBe(false)
  })
})
