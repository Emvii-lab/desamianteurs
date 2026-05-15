import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase-server', () => ({ createServerSupabase: vi.fn() }))
vi.mock('@supabase/supabase-js',  () => ({ createClient: vi.fn() }))

import { POST, DELETE } from '@/app/api/admin/user/route'
import { createServerSupabase } from '@/lib/supabase-server'
import { createClient }         from '@supabase/supabase-js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeServerSupabase(isAdmin = true) {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }) },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: isAdmin ? { id: 'admin-row' } : null }),
        }),
      }),
    }),
  }
}

function makeAdminClient({
  generateLinkError = null as { message: string } | null,
  deleteUserError   = null as { message: string } | null,
  partnerData       = null as { id: string } | null,
  clientData        = null as { id: string } | null,
  quotesData        = [] as { id: string }[],
} = {}) {
  const deleteChain = vi.fn().mockResolvedValue({ error: null })
  const fromDelete  = vi.fn().mockReturnValue({ delete: vi.fn().mockReturnValue({ eq: deleteChain, in: deleteChain }) })

  return {
    auth: {
      admin: {
        generateLink: vi.fn().mockResolvedValue(
          generateLinkError
            ? { data: null, error: generateLinkError }
            : { data: { properties: { action_link: 'https://reset.link' } }, error: null }
        ),
        deleteUser: vi.fn().mockResolvedValue(
          deleteUserError ? { error: deleteUserError } : { error: null }
        ),
      },
    },
    from: vi.fn().mockImplementation((table: string) => {
      // maybeSingle lookups
      const maybySingle = vi.fn()
      if (table === 'partners') maybySingle.mockResolvedValue({ data: partnerData })
      else if (table === 'clients') maybySingle.mockResolvedValue({ data: clientData })
      else maybySingle.mockResolvedValue({ data: null })

      const quoteSingle = vi.fn().mockResolvedValue({ data: quotesData })

      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ maybeSingle: maybySingle, data: quotesData }),
        }),
        delete: vi.fn().mockReturnValue({ eq: deleteChain, in: deleteChain }),
      }
    }),
    _deleteChain: deleteChain,
  }
}

function makeReq(method: string, body: unknown, origin = 'http://localhost:3000') {
  return new Request(`${origin}/api/admin/user`, {
    method,
    headers: { 'Content-Type': 'application/json', origin },
    body: JSON.stringify(body),
  })
}

beforeEach(() => vi.clearAllMocks())

// ─── POST — réinitialisation mot de passe ────────────────────────────────────

describe('POST /api/admin/user (reset password)', () => {
  it('retourne 403 si non admin', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(makeServerSupabase(false) as any)
    const res = await POST(makeReq('POST', { email: 'test@example.com' }))
    expect(res.status).toBe(403)
  })

  it('retourne 400 si email absent', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(makeServerSupabase() as any)
    vi.mocked(createClient).mockReturnValue(makeAdminClient() as any)
    const res = await POST(makeReq('POST', {}))
    expect(res.status).toBe(400)
  })

  it('appelle generateLink avec l\'email et le bon redirectTo', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(makeServerSupabase() as any)
    const admin = makeAdminClient()
    vi.mocked(createClient).mockReturnValue(admin as any)

    await POST(makeReq('POST', { email: 'user@example.com' }, 'https://desamianteurs.fr'))

    expect(admin.auth.admin.generateLink).toHaveBeenCalledWith(expect.objectContaining({
      type: 'recovery',
      email: 'user@example.com',
      options: expect.objectContaining({ redirectTo: expect.stringContaining('/reinitialiser-mot-de-passe') }),
    }))
  })

  it('retourne ok:true et le lien de réinitialisation', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(makeServerSupabase() as any)
    vi.mocked(createClient).mockReturnValue(makeAdminClient() as any)

    const res  = await POST(makeReq('POST', { email: 'user@example.com' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
    expect(json.link).toBe('https://reset.link')
  })

  it('retourne 400 si Supabase renvoie une erreur', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(makeServerSupabase() as any)
    vi.mocked(createClient).mockReturnValue(makeAdminClient({ generateLinkError: { message: 'User not found' } }) as any)

    const res = await POST(makeReq('POST', { email: 'unknown@example.com' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/user not found/i)
  })
})

// ─── DELETE — suppression utilisateur ────────────────────────────────────────

describe('DELETE /api/admin/user', () => {
  it('retourne 403 si non admin', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(makeServerSupabase(false) as any)
    const res = await DELETE(makeReq('DELETE', { userId: 'u1', role: 'client' }))
    expect(res.status).toBe(403)
  })

  it('retourne 400 si userId absent', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(makeServerSupabase() as any)
    vi.mocked(createClient).mockReturnValue(makeAdminClient() as any)
    const res = await DELETE(makeReq('DELETE', { role: 'client' }))
    expect(res.status).toBe(400)
  })

  it('supprime un utilisateur client et appelle deleteUser', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(makeServerSupabase() as any)
    const admin = makeAdminClient({ clientData: { id: 'client-row' }, quotesData: [] })
    vi.mocked(createClient).mockReturnValue(admin as any)

    const res = await DELETE(makeReq('DELETE', { userId: 'auth-1', role: 'client' }))
    expect(res.status).toBe(200)
    expect(admin.auth.admin.deleteUser).toHaveBeenCalledWith('auth-1')
  })

  it('supprime toutes les tables liées au partenaire avant deleteUser', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(makeServerSupabase() as any)
    const admin = makeAdminClient({ partnerData: { id: 'partner-row' } })
    vi.mocked(createClient).mockReturnValue(admin as any)

    const res = await DELETE(makeReq('DELETE', { userId: 'auth-2', role: 'partenaire' }))
    expect(res.status).toBe(200)

    const tables = (admin.from as ReturnType<typeof vi.fn>).mock.calls.map(([t]: string[]) => t)
    // Toutes les tables de la cascade partenaire doivent être touchées
    expect(tables).toContain('partners')
    expect(tables).toContain('quote_assignments')
    expect(tables).toContain('partner_domains')
    expect(tables).toContain('target_markets')
    expect(tables).toContain('intervention_zones')
    // deleteUser doit être appelé EN DERNIER (après les prédélétions)
    expect(admin.auth.admin.deleteUser).toHaveBeenCalledWith('auth-2')
    const deleteUserCallIndex = admin.auth.admin.deleteUser.mock.invocationCallOrder[0]
    const lastFromCallOrder = Math.max(
      ...(admin.from as ReturnType<typeof vi.fn>).mock.invocationCallOrder
    )
    expect(deleteUserCallIndex).toBeGreaterThan(lastFromCallOrder)
  })

  it('supprime un admin et appelle deleteUser', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(makeServerSupabase() as any)
    const admin = makeAdminClient()
    vi.mocked(createClient).mockReturnValue(admin as any)

    const res = await DELETE(makeReq('DELETE', { userId: 'auth-3', role: 'admin' }))
    expect(res.status).toBe(200)
    const tables = (admin.from as ReturnType<typeof vi.fn>).mock.calls.map(([t]: string[]) => t)
    expect(tables).toContain('admins')
    expect(admin.auth.admin.deleteUser).toHaveBeenCalledWith('auth-3')
  })

  it('retourne 500 si deleteUser échoue', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(makeServerSupabase() as any)
    vi.mocked(createClient).mockReturnValue(
      makeAdminClient({ deleteUserError: { message: 'User does not exist' } }) as any
    )

    const res = await DELETE(makeReq('DELETE', { userId: 'auth-4', role: 'client' }))
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toMatch(/user does not exist/i)
  })
})
