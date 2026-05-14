import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  colorFor,
  formatPrice,
  formatSize,
  getInitials,
  parseLocation,
  timeAgo,
} from '@/lib/utils'

describe('timeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-13T12:00:00.000Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('affiche « moins d’1h » pour un horodatage récent', () => {
    const d = new Date('2026-05-13T11:30:00.000Z')
    expect(timeAgo(d)).toBe("Il y a moins d'1h")
  })

  it('affiche les heures pour moins de 24h', () => {
    const d = new Date('2026-05-13T08:00:00.000Z')
    expect(timeAgo(d)).toBe('Il y a 4h')
  })

  it('affiche les jours pour moins de 7 jours', () => {
    const d = new Date('2026-05-10T12:00:00.000Z')
    expect(timeAgo(d)).toBe('Il y a 3j')
  })

  it('retombe sur une date locale au-delà d’une semaine', () => {
    const d = new Date('2026-04-01T12:00:00.000Z')
    expect(timeAgo(d)).toMatch(/\d{1,2}\/\d{1,2}\/2026/)
  })
})

describe('formatSize', () => {
  it('affiche les octets', () => {
    expect(formatSize(500)).toBe('500 o')
  })
  it('affiche les Ko', () => {
    expect(formatSize(2048)).toBe('2 Ko')
  })
  it('affiche les Mo avec une décimale', () => {
    expect(formatSize(1024 * 1024 * 2)).toBe('2.0 Mo')
  })
})

describe('formatPrice', () => {
  it('formate en EUR (locale fr)', () => {
    expect(formatPrice(49)).toMatch(/49/)
    expect(formatPrice(49)).toMatch(/€/)
  })
})

describe('getInitials', () => {
  it('prend jusqu’à deux initiales', () => {
    expect(getInitials('Jean Dupont')).toBe('JD')
  })
  it('gère une seule partie du nom', () => {
    expect(getInitials('Société')).toBe('S')
  })
  it('chaîne vide → chaîne vide (comportement actuel)', () => {
    expect(getInitials('')).toBe('')
  })
})

describe('colorFor', () => {
  it('est déterministe pour un même id', () => {
    expect(colorFor('partner-42')).toBe(colorFor('partner-42'))
  })
  it('choisit une entrée de la palette', () => {
    const palette = ['#AAA', '#BBB']
    expect(palette).toContain(colorFor('x', palette))
  })
})

describe('parseLocation', () => {
  it('extrait CP et ville quand le CP est dans la chaîne ville+adresse', () => {
    expect(parseLocation('Nantes', '12 rue X 44000', '44000')).toEqual({
      city: 'NANTES',
      zip: '44000',
    })
  })
  it('utilise le CP fourni si aucun dans le texte', () => {
    expect(parseLocation('Lyon', 'rue sans code', '69001')).toEqual({
      city: 'LYON',
      zip: '69001',
    })
  })
})
