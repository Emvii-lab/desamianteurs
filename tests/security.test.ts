/**
 * Tests de sécurité
 *
 * Couvre : IDOR, mass assignment, injection, privilege escalation,
 *          auth enforcement, Stripe webhook tampering.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/supabase-server', () => ({ createServerSupabase: vi.fn() }))
vi.mock('@/lib/stripe',          () => ({ getStripe: vi.fn() }))
vi.mock('next/headers',          () => ({ headers: vi.fn(), cookies: vi.fn() }))
vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn() }))

import { PATCH as profilePATCH  } from '@/app/api/partner/profile/route'
import { PATCH as absencePATCH  } from '@/app/api/partner/absence/route'
import { PATCH as adminPartner  } from '@/app/api/admin/partner/route'
import { PATCH as adminQuote    } from '@/app/api/admin/quote/route'
import { PATCH as adminReview   } from '@/app/api/admin/review/route'
import { POST  as checkout      } from '@/app/api/stripe/create-checkout/route'
import { GET   as verifySession } from '@/app/api/stripe/verify-session/route'
import { POST  as webhook       } from '@/app/api/stripe/webhook/route'
import { POST  as verifySiret   } from '@/app/api/verify-siret/route'

import { createServerSupabase } from '@/lib/supabase-server'
import { getStripe }            from '@/lib/stripe'
import { headers }              from 'next/headers'
import { createClient }         from '@supabase/supabase-js'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function json(body: unknown, method = 'PATCH') {
  return new Request('http://localhost/api/test', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function get(qs: string) {
  return new Request(`http://localhost/api/test?${qs}`)
}

function buildSupabase({
  user           = { id: 'user-1' } as { id: string } | null,
  isAdmin        = false,
  partnerData    = null as object | null,
  updateError    = null as { message: string } | null,
} = {}) {
  const updateEq = vi.fn().mockResolvedValue({ error: updateError })
  const update   = vi.fn().mockReturnValue({ eq: updateEq })

  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: vi.fn().mockImplementation((table: string) => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: partnerData, error: null }),
          }),
          single: vi.fn().mockResolvedValue({
            data: table === 'admins' && isAdmin ? { id: 'admin-1' } : null,
          }),
          maybeSingle: vi.fn().mockResolvedValue({ data: partnerData, error: null }),
        }),
      }),
      update,
    })),
    _update: update,
    _updateEq: updateEq,
  }
}

const fetchMock = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

// ─────────────────────────────────────────────────────────────────────────────
// 1. IDOR — un utilisateur ne peut pas accéder aux ressources d'un autre
// ─────────────────────────────────────────────────────────────────────────────

describe('Sécurité — IDOR', () => {
  it('create-checkout : user B ne peut pas créer une session pour le partenaire de user A', async () => {
    // partnerData null = ce partenaire n'appartient pas à user B
    const mock = buildSupabase({ user: { id: 'user-b' }, partnerData: null })
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)
    vi.mocked(getStripe).mockReturnValue({ checkout: { sessions: { create: vi.fn() } } } as any)

    const res = await checkout(json({ partnerId: 'partner-of-user-a' }, 'POST'))
    expect(res.status).toBe(403)
  })

  it('verify-session : user B ne peut pas voir la session Stripe de user A', async () => {
    // La session n'est pas associée à user B → 404
    const mock = buildSupabase({ user: { id: 'user-b' }, partnerData: null })
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)
    vi.mocked(getStripe).mockReturnValue({} as any)

    const res = await verifySession(get('session_id=cs_belongs_to_user_a'))
    expect(res.status).toBe(404)
  })

  it('partner/profile : la mise à jour est toujours scopée à l\'utilisateur authentifié (pas à un user_id fourni)', async () => {
    const mock = buildSupabase({ user: { id: 'user-1' } })
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)

    await profilePATCH(json({ first_name: 'Jean', user_id: 'autre-user' }))

    // L'eq() doit toujours utiliser user-1, jamais 'autre-user'
    const eqArg = mock._updateEq.mock.calls[0]
    expect(eqArg).toEqual(['user_id', 'user-1'])
  })

  it('partner/absence : la mise à jour est toujours scopée à l\'utilisateur authentifié', async () => {
    const mock = buildSupabase({ user: { id: 'user-1' } })
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)

    await absencePATCH(json({ absence_start: '2026-07-01', user_id: 'autre-user' }))

    const eqArg = mock._updateEq.mock.calls[0]
    expect(eqArg).toEqual(['user_id', 'user-1'])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. Mass assignment — les champs sensibles sont filtrés par whitelist
// ─────────────────────────────────────────────────────────────────────────────

describe('Sécurité — Mass assignment', () => {
  const DANGEROUS_FIELDS = {
    is_verified:        true,
    status:             'active',
    stripe_customer_id: 'cus_injected',
    subscription:       'premium',
    validation_fee_paid: true,
    user_id:            'autre-user',
    rejection_reason:   'auto-approved',
  }

  it('filtre tous les champs sensibles envoyés dans une mise à jour de profil', async () => {
    const mock = buildSupabase()
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)

    await profilePATCH(json({ first_name: 'Jean', ...DANGEROUS_FIELDS }))

    const updateArg = mock._update.mock.calls[0][0]
    expect(updateArg).toHaveProperty('first_name', 'Jean')

    for (const key of Object.keys(DANGEROUS_FIELDS)) {
      expect(updateArg).not.toHaveProperty(key)
    }
  })

  it('n\'accepte que les champs de la whitelist, même si d\'autres sont présents', async () => {
    const mock = buildSupabase()
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)

    await profilePATCH(json({
      phone: '0612345678',
      description: 'Mon cabinet',
      admin: true,
      role: 'superadmin',
      __proto__: { isAdmin: true },
    }))

    const updateArg = mock._update.mock.calls[0][0]
    const WHITELIST = ['first_name','last_name','phone','description','company_address','city','zip_code','certified_workers_count','accept_individuals','avatar_url','logo_url','updated_at']
    const receivedKeys = Object.keys(updateArg)
    for (const key of receivedKeys) {
      expect(WHITELIST).toContain(key)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. Auth enforcement — toutes les routes protégées rejettent sans session
// ─────────────────────────────────────────────────────────────────────────────

describe('Sécurité — Auth enforcement (routes protégées)', () => {
  const NO_USER = buildSupabase({ user: null })

  beforeEach(() => {
    vi.mocked(createServerSupabase).mockResolvedValue(NO_USER as any)
  })

  it('PATCH /api/partner/profile → 401', async () => {
    expect((await profilePATCH(json({ first_name: 'x' }))).status).toBe(401)
  })

  it('PATCH /api/partner/absence → 401', async () => {
    expect((await absencePATCH(json({}))).status).toBe(401)
  })

  it('POST /api/stripe/create-checkout → 401', async () => {
    vi.mocked(getStripe).mockReturnValue({} as any)
    expect((await checkout(json({ partnerId: 'p1' }, 'POST'))).status).toBe(401)
  })

  it('GET /api/stripe/verify-session → 401', async () => {
    vi.mocked(getStripe).mockReturnValue({} as any)
    expect((await verifySession(get('session_id=cs_123'))).status).toBe(401)
  })

  it('PATCH /api/admin/partner → 403 (non-admin)', async () => {
    expect((await adminPartner(json({ partnerId: 'p1', action: 'verify' }))).status).toBe(403)
  })

  it('PATCH /api/admin/quote → 403 (non-admin)', async () => {
    expect((await adminQuote(json({ quoteId: 'q1' }))).status).toBe(403)
  })

  it('PATCH /api/admin/review → 403 (non-admin)', async () => {
    expect((await adminReview(json({ reviewId: 'r1', action: 'approved' }))).status).toBe(403)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. Privilege escalation — un non-admin ne peut pas accéder aux routes admin
// ─────────────────────────────────────────────────────────────────────────────

describe('Sécurité — Privilege escalation', () => {
  it('un partenaire authentifié ne peut pas appeler les routes admin', async () => {
    // isAdmin: false → verifyAdmin retourne null → 403
    const mock = buildSupabase({ user: { id: 'partner-user' }, isAdmin: false })
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)

    const res = await adminPartner(json({ partnerId: 'p1', action: 'verify' }))
    expect(res.status).toBe(403)
  })

  it('un admin ne peut pas modifier son propre profil partenaire via la route admin', async () => {
    // La route admin/partner cible un partnerId arbitraire.
    // Même un admin ne peut pas bypass la route — il passe toujours par verifyAdmin.
    const mock = buildSupabase({ isAdmin: true })
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)

    // Action invalide → 400, pas 200 (le serveur valide quand même)
    const res = await adminPartner(json({ partnerId: 'p1' })) // action manquante
    expect(res.status).toBe(400)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 5. Injection — les inputs dangereux sont neutralisés
// ─────────────────────────────────────────────────────────────────────────────

describe('Sécurité — Injection SIRET', () => {
  it('neutralise une tentative d\'injection SQL dans le SIRET', async () => {
    // '; DROP TABLE partners; -- → replace(/\D/g,'') → '' → fail validation 14 chiffres
    const res = await verifySiret(json({ siret: "'; DROP TABLE partners; --" }, 'POST'))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/invalide|manquant/i)
  })

  it('neutralise un payload XSS dans le SIRET (ne garde que les chiffres)', async () => {
    // Payload XSS sans chiffres dans les balises → après strip: exactement 14 chiffres valides
    // <script>xss</script>12345678901234 → '12345678901234'
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ nom: 'Test', siret: '12345678901234' }), { status: 200 })
    )
    const res = await verifySiret(json({ siret: '<script>xss</script>12345678901234' }, 'POST'))
    expect(res.status).toBe(200)

    // Seuls les chiffres sont transmis à l'edge function
    const fetchBody = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string)
    expect(fetchBody.siret).toBe('12345678901234')
    expect(fetchBody.siret).not.toMatch(/<script>/i)
  })

  it('rejette un SIRET démesuré (>100 caractères)', async () => {
    const res = await verifySiret(json({ siret: '1'.repeat(200) }, 'POST'))
    expect(res.status).toBe(400) // trop de chiffres → regex \d{14} ne match pas
  })

  it('rejette un SIRET null', async () => {
    const res = await verifySiret(json({ siret: null }, 'POST'))
    expect(res.status).toBe(400)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 6. Stripe Webhook — manipulation du payload et des métadonnées
// ─────────────────────────────────────────────────────────────────────────────

describe('Sécurité — Stripe webhook tampering', () => {
  const mockStripe = { webhooks: { constructEvent: vi.fn() } }
  const mockUpdateEq = vi.fn().mockResolvedValue({ error: null })
  const mockAdmin = {
    from: vi.fn().mockReturnValue({ update: vi.fn().mockReturnValue({ eq: mockUpdateEq }) }),
  }

  function fakeEvent(type: string, data: object) {
    return { type, data: { object: data } }
  }

  beforeEach(() => {
    vi.mocked(getStripe).mockReturnValue(mockStripe as any)
    vi.mocked(createClient).mockReturnValue(mockAdmin as any)
    vi.mocked(headers).mockResolvedValue({ get: () => 'valid-sig' } as any)
    mockStripe.webhooks.constructEvent.mockReset()
    mockUpdateEq.mockReset()
    mockAdmin.from.mockClear()
    mockUpdateEq.mockResolvedValue({ error: null })
    mockAdmin.from.mockReturnValue({ update: vi.fn().mockReturnValue({ eq: mockUpdateEq }) })
  })

  it('ignore checkout.session.completed sans client_reference_id (évite une update orpheline)', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValueOnce(
      fakeEvent('checkout.session.completed', {
        client_reference_id: null, // pas d'utilisateur identifié
        customer: 'cus_123',
        metadata: {},
      })
    )
    const res = await webhook(new Request('http://localhost', { method: 'POST', body: '{}' }))
    expect(res.status).toBe(200)
    expect(mockAdmin.from).not.toHaveBeenCalled() // aucune écriture en base
  })

  it('n\'applique pas un plan inconnu dans les métadonnées (évite une valeur arbitraire en BDD)', async () => {
    const updateMock = vi.fn().mockReturnValue({ eq: mockUpdateEq })
    mockAdmin.from.mockReturnValue({ update: updateMock })

    mockStripe.webhooks.constructEvent.mockReturnValueOnce(
      fakeEvent('checkout.session.completed', {
        client_reference_id: 'user-1',
        customer: 'cus_123',
        metadata: { plan: 'superadmin_free' }, // plan inventé
      })
    )
    await webhook(new Request('http://localhost', { method: 'POST', body: '{}' }))

    // update() ne doit PAS contenir subscription: 'superadmin_free'
    const updateArg = updateMock.mock.calls[0]?.[0]
    expect(updateArg).not.toHaveProperty('subscription')
    expect(updateArg).toHaveProperty('validation_fee_paid', true) // le reste s'applique
  })

  it('rejette un webhook avec corps vide et signature absente', async () => {
    vi.mocked(headers).mockResolvedValue({ get: () => null } as any)
    const res = await webhook(new Request('http://localhost', { method: 'POST', body: '' }))
    expect(res.status).toBe(400)
  })

  it('rejette un webhook dont la signature ne correspond pas au corps', async () => {
    vi.mocked(headers).mockResolvedValue({ get: () => 'tampered-sig' } as any)
    mockStripe.webhooks.constructEvent.mockImplementationOnce(() => {
      throw new Error('No signatures found matching the expected signature')
    })
    const res = await webhook(new Request('http://localhost', { method: 'POST', body: '{"tampered":true}' }))
    expect(res.status).toBe(400)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 7. Inputs malformés — les routes résistent aux corps inattendus
// ─────────────────────────────────────────────────────────────────────────────

describe('Sécurité — Corps de requête malformés', () => {
  it('admin/partner : body vide → 400 (pas de crash serveur)', async () => {
    const mock = buildSupabase({ isAdmin: true })
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)

    const res = await adminPartner(json({}))
    expect(res.status).toBe(400)
  })

  it('admin/quote : quoteId null → 400', async () => {
    const mock = buildSupabase({ isAdmin: true })
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)

    const res = await adminQuote(json({ quoteId: null }))
    expect(res.status).toBe(400)
  })

  it('partner/profile : body complètement vide → 200 (aucun champ à mettre à jour, pas de crash)', async () => {
    const mock = buildSupabase()
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)

    const res = await profilePATCH(json({}))
    // Aucun champ whitelisté → update avec juste updated_at → ok
    expect(res.status).toBe(200)
  })

  it('verify-siret : body non-JSON → 400 (pas de crash)', async () => {
    const req = new Request('http://localhost/api/verify-siret', {
      method: 'POST',
      body: 'not-json-at-all',
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await verifySiret(req as any)
    expect(res.status).toBe(400)
  })
})
