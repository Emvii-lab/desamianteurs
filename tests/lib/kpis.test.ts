import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase-server', () => ({ createServerSupabase: vi.fn() }))

import { fetchKpis, fetchFeaturedPros } from '@/lib/kpis'
import { createServerSupabase } from '@/lib/supabase-server'

const KPI_DEFAULTS = { partners: 15, demandes: 8400, rating: 4.3, departments: 101 }

beforeEach(() => vi.clearAllMocks())

// ─── fetchKpis ──────────────────────────────────────────────────────────────

function buildKpisSupabase({ rpcData = null as any, rpcError = null as any, avgRating = null as any } = {}) {
  return {
    rpc: vi.fn().mockImplementation((fn: string) => {
      if (fn === 'get_public_kpis') return Promise.resolve({ data: rpcData, error: rpcError })
      if (fn === 'get_avg_rating') return Promise.resolve({ data: avgRating, error: null })
      return Promise.resolve({ data: null, error: null })
    }),
    from: vi.fn().mockImplementation((table: string) => ({
      // fallback: from('partners').select().eq() | from('quotes').select()
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: null, error: null }),
        // quotes n'a pas .eq() — on résout directement
        then: undefined,
      }),
    })),
  }
}

describe('fetchKpis', () => {
  it('retourne les données de la RPC get_public_kpis si disponible', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(buildKpisSupabase({
      rpcData: [{ partner_count: 42, demand_count: 500, avg_rating: 4.7, dept_count: 80 }],
    }) as any)
    const kpis = await fetchKpis()
    expect(kpis.partners).toBe(42)
    expect(kpis.demandes).toBe(500)
    expect(kpis.rating).toBe(4.7)
    expect(kpis.departments).toBe(80)
  })

  it('retourne les valeurs par défaut si la RPC échoue et les comptes sont null', async () => {
    // count: null → null ?? KPI_DEFAULTS.X → valeur par défaut
    vi.mocked(createServerSupabase).mockResolvedValue(buildKpisSupabase({
      rpcError: { message: 'function not found' },
    }) as any)
    const kpis = await fetchKpis()
    // count null → partner default 15
    expect(kpis.partners).toBe(KPI_DEFAULTS.partners)
    expect(kpis.departments).toBe(KPI_DEFAULTS.departments)
    expect(kpis.rating).toBe(KPI_DEFAULTS.rating)
  })

  it('retourne les valeurs par défaut si une exception est levée', async () => {
    vi.mocked(createServerSupabase).mockRejectedValue(new Error('Network error'))
    const kpis = await fetchKpis()
    expect(kpis).toEqual(KPI_DEFAULTS)
  })
})

// ─── fetchFeaturedPros ──────────────────────────────────────────────────────

function buildProsSupabase(prosData: any[]) {
  return {
    rpc: vi.fn().mockResolvedValue({ data: null, error: { message: 'n/a' } }),
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: prosData, error: null }),
          }),
        }),
      }),
    }),
  }
}

describe('fetchFeaturedPros', () => {
  it('transforme les données BDD en ProCard avec initiales et couleur', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(buildProsSupabase([
      { id: '1', company_name: 'Atlantique Analyses', city: '44000 Nantes', partner_type: 'sampler_lab', average_rating: 4.8, review_count: 97 },
    ]) as any)
    const pros = await fetchFeaturedPros()
    expect(pros).toHaveLength(1)
    expect(pros[0].name).toBe('Atlantique Analyses')
    expect(pros[0].initials).toBe('AA')
    expect(pros[0].type).toBe('Préleveur / Labo')
    expect(pros[0].rating).toBe(4.8)
    expect(pros[0].color).toBeDefined()
  })

  it('retourne les pros par défaut si la BDD est vide', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(buildProsSupabase([]) as any)
    const pros = await fetchFeaturedPros()
    expect(pros.length).toBeGreaterThan(0)
    expect(pros[0].name).toBe('Atlantique Analyses')
  })

  it('retourne les pros par défaut si une exception est levée', async () => {
    vi.mocked(createServerSupabase).mockRejectedValue(new Error('DB down'))
    const pros = await fetchFeaturedPros()
    expect(pros.length).toBeGreaterThan(0)
  })
})
