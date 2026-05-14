import { describe, it, expect } from 'vitest'
import {
  CATEGORY_MAP,
  TYPE_LABEL,
  NEEDS_SIRET,
  TIMINGS,
  BUDGET_OPTIONS,
  FLOOR_OPTIONS,
  ELEVATOR_OPTIONS,
  STATUS_LABEL,
  INSCRIPTION_PARTNER_TYPES,
} from '@/lib/constants'

describe('CATEGORY_MAP', () => {
  it('mappe Particulier → individual', () => {
    expect(CATEGORY_MAP['Particulier']).toBe('individual')
  })

  it('mappe Professionnel privé → private_professional', () => {
    expect(CATEGORY_MAP['Professionnel privé']).toBe('private_professional')
  })

  it('mappe Public / collectivité → public_authority', () => {
    expect(CATEGORY_MAP['Public / collectivité']).toBe('public_authority')
  })

  it('contient exactement 3 entrées', () => {
    expect(Object.keys(CATEGORY_MAP)).toHaveLength(3)
  })
})

describe('TYPE_LABEL', () => {
  it('traduit asbestos_remover en Désamianteur', () => {
    expect(TYPE_LABEL['asbestos_remover']).toBe('Désamianteur')
  })

  it('traduit diagnostician en Diagnostiqueur', () => {
    expect(TYPE_LABEL['diagnostician']).toBe('Diagnostiqueur')
  })

  it('couvre tous les types de partenaires de INSCRIPTION_PARTNER_TYPES', () => {
    for (const { id } of INSCRIPTION_PARTNER_TYPES) {
      expect(TYPE_LABEL[id] ?? TYPE_LABEL[id]).toBeDefined()
    }
  })
})

describe('NEEDS_SIRET', () => {
  it('contient les types professionnels qui nécessitent un SIRET', () => {
    expect(NEEDS_SIRET).toContain('diagnostician')
    expect(NEEDS_SIRET).toContain('asbestos_remover')
    expect(NEEDS_SIRET).toContain('private_professional')
  })

  it('ne contient pas individual (particulier)', () => {
    expect(NEEDS_SIRET).not.toContain('individual')
  })
})

describe('TIMINGS', () => {
  it('contient 4 options de délai', () => {
    expect(TIMINGS).toHaveLength(4)
  })

  it('inclut une option urgent', () => {
    expect(TIMINGS.some(t => t.id === 'emergency')).toBe(true)
  })
})

describe('STATUS_LABEL', () => {
  it('mappe open → En cours', () => {
    expect(STATUS_LABEL['open']).toBe('En cours')
  })

  it('mappe closed → Clôturée', () => {
    expect(STATUS_LABEL['closed']).toBe('Clôturée')
  })
})
