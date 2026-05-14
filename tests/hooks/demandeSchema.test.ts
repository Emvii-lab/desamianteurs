import { describe, expect, it } from 'vitest'
import { demandeSchema } from '@/hooks/useDemandeForm'

/** Données minimales cohérentes avec le schéma (formulaire demande / inscription). */
function minimalValid() {
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

describe('demandeSchema', () => {
  it('accepte une charge minimale valide', () => {
    const r = demandeSchema.safeParse(minimalValid())
    expect(r.success).toBe(true)
  })

  it('refuse sans prestation', () => {
    const r = demandeSchema.safeParse({ ...minimalValid(), serviceTypes: [] })
    expect(r.success).toBe(false)
  })

  it('refuse si les CGU ne sont pas acceptées', () => {
    const r = demandeSchema.safeParse({ ...minimalValid(), cgu: false })
    expect(r.success).toBe(false)
  })

  it('refuse un email invalide', () => {
    const r = demandeSchema.safeParse({ ...minimalValid(), email: 'pas-un-email' })
    expect(r.success).toBe(false)
  })

  it('refuse un téléphone trop court', () => {
    const r = demandeSchema.safeParse({ ...minimalValid(), telephone: '123' })
    expect(r.success).toBe(false)
  })

  it('refuse si mot de passe et confirmation diffèrent', () => {
    const r = demandeSchema.safeParse({
      ...minimalValid(),
      password: 'secret123',
      passwordConfirm: 'autrechose',
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      const paths = r.error.flatten().fieldErrors.passwordConfirm
      expect(paths?.length).toBeGreaterThan(0)
    }
  })

  it('accepte mot de passe absent (optionnel)', () => {
    const r = demandeSchema.safeParse(minimalValid())
    expect(r.success).toBe(true)
  })
})
