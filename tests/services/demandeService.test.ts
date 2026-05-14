import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase', () => ({ createClient: vi.fn() }))

import { demandeService } from '@/services/demandeService'
import { createClient } from '@/lib/supabase'
import type { DemandeFormData } from '@/lib/types'

function baseData(): DemandeFormData {
  return {
    serviceTypes: ['desamiantage'],
    userType: 'Particulier',
    propertyType: 'house-id',
    situationContext: [],
    interventionTypes: [],
    accreditations: [],
    timing: 'within_1_month',
    budget: 'under_1000',
    streetAddress: '1 rue de la Paix',
    city: 'Paris',
    postalCode: '75001',
    floor: 'ground_floor',
    elevator: 'oui',
    prenom: 'Jean',
    nom: 'Dupont',
    email: 'jean@example.com',
    telephone: '0612345678',
    cgu: true,
    notifs: false,
  }
}

function buildClient({
  signUpResult = { data: { user: { id: 'user-new' } }, error: null },
  signInResult = { data: { user: { id: 'user-existing' } }, error: null },
  getUserResult = { data: { user: { id: 'user-logged' } }, error: null },
  existingClient = null as { id: string } | null,
  newClientResult = { data: { id: 'client-1' }, error: null },
  quoteResult = { data: { id: 'quote-1' }, error: null },
  quoteError = null as { message: string } | null,
  uploadError = null as { message: string } | null,
} = {}) {
  const storageUpload = vi.fn().mockResolvedValue({ error: uploadError })

  const from = vi.fn().mockImplementation((table: string) => {
    if (table === 'clients') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: existingClient, error: null }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue(newClientResult) }),
        }),
      }
    }
    if (table === 'quotes') {
      return {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(quoteError ? { data: null, error: quoteError } : quoteResult),
          }),
        }),
        update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      }
    }
    if (table === 'quote_service_types') {
      return { insert: vi.fn().mockResolvedValue({ error: null }) }
    }
    return {}
  })

  return {
    auth: {
      signUp: vi.fn().mockResolvedValue(signUpResult),
      signInWithPassword: vi.fn().mockResolvedValue(signInResult),
      getUser: vi.fn().mockResolvedValue(getUserResult),
    },
    from,
    storage: { from: vi.fn().mockReturnValue({ upload: storageUpload }) },
    _from: from,
    _storageUpload: storageUpload,
  }
}

beforeEach(() => vi.clearAllMocks())

describe('demandeService.submitDemande', () => {
  it('crée un compte (signUp) et soumet le devis en mode create', async () => {
    const mock = buildClient()
    vi.mocked(createClient).mockReturnValue(mock as any)
    const result = await demandeService.submitDemande(
      { ...baseData(), password: 'secret123' }, [], false, 'create'
    )
    expect(result).toEqual({ success: true, quoteId: 'quote-1' })
    expect(mock.auth.signUp).toHaveBeenCalledWith(expect.objectContaining({ email: 'jean@example.com' }))
  })

  it('se connecte (signIn) en mode login sans appeler signUp', async () => {
    const mock = buildClient()
    vi.mocked(createClient).mockReturnValue(mock as any)
    await demandeService.submitDemande({ ...baseData(), password: 'secret123' }, [], false, 'login')
    expect(mock.auth.signInWithPassword).toHaveBeenCalled()
    expect(mock.auth.signUp).not.toHaveBeenCalled()
  })

  it('utilise la session existante si isLoggedIn=true (getUser)', async () => {
    const mock = buildClient({ existingClient: { id: 'client-existing' } })
    vi.mocked(createClient).mockReturnValue(mock as any)
    await demandeService.submitDemande(baseData(), [], true, 'create')
    expect(mock.auth.getUser).toHaveBeenCalled()
    expect(mock.auth.signUp).not.toHaveBeenCalled()
  })

  it('lève une erreur claire si l\'email est déjà enregistré', async () => {
    const mock = buildClient({
      signUpResult: { data: null as any, error: { message: 'User already registered' } },
    })
    vi.mocked(createClient).mockReturnValue(mock as any)
    await expect(
      demandeService.submitDemande({ ...baseData(), password: 'secret123' }, [], false, 'create')
    ).rejects.toThrow(/déjà enregistré/i)
  })

  it('crée un profil client si aucun n\'existe (existingClient=null)', async () => {
    const mock = buildClient({ existingClient: null })
    vi.mocked(createClient).mockReturnValue(mock as any)
    await demandeService.submitDemande(baseData(), [], true, 'create')
    const clientFrom = mock._from.mock.calls.filter(([t]: string[]) => t === 'clients')
    expect(clientFrom.length).toBeGreaterThan(0)
  })

  it('réutilise le profil client existant sans en créer un nouveau', async () => {
    const mock = buildClient({ existingClient: { id: 'client-existing' } })
    vi.mocked(createClient).mockReturnValue(mock as any)
    const result = await demandeService.submitDemande(baseData(), [], true, 'create')
    expect(result.success).toBe(true)
  })

  it('lève une erreur si la création du devis échoue', async () => {
    const mock = buildClient({
      existingClient: { id: 'client-1' },
      quoteError: { message: 'constraint violation' },
    })
    vi.mocked(createClient).mockReturnValue(mock as any)
    await expect(demandeService.submitDemande(baseData(), [], true, 'create')).rejects.toThrow()
  })

  it('extrait le département DOM-TOM sur 3 chiffres (97xxx)', async () => {
    const mock = buildClient({ existingClient: { id: 'client-1' } })
    vi.mocked(createClient).mockReturnValue(mock as any)
    await demandeService.submitDemande({ ...baseData(), postalCode: '97110' }, [], true, 'create')
    const quotesInsertArg = (() => {
      for (const call of mock._from.mock.calls) {
        if (call[0] === 'quotes') {
          const fromResult = mock._from.mock.results[mock._from.mock.calls.indexOf(call)]
          return fromResult?.value?.insert?.mock?.calls?.[0]?.[0]
        }
      }
    })()
    expect(quotesInsertArg?.address_department).toBe('971')
  })

  it('mappe Particulier → individual dans client_type via CATEGORY_MAP', async () => {
    const mock = buildClient({ existingClient: { id: 'client-1' } })
    vi.mocked(createClient).mockReturnValue(mock as any)
    await demandeService.submitDemande({ ...baseData(), userType: 'Particulier' }, [], true, 'create')
    const quotesInsertArg = (() => {
      for (const call of mock._from.mock.calls) {
        if (call[0] === 'quotes') {
          const idx = mock._from.mock.calls.indexOf(call)
          return mock._from.mock.results[idx]?.value?.insert?.mock?.calls?.[0]?.[0]
        }
      }
    })()
    expect(quotesInsertArg?.client_type).toBe('individual')
  })

  it('continue sans erreur si l\'upload de fichier échoue (non-bloquant)', async () => {
    const mock = buildClient({ existingClient: { id: 'client-1' }, uploadError: { message: 'Upload error' } })
    vi.mocked(createClient).mockReturnValue(mock as any)
    const result = await demandeService.submitDemande(
      baseData(), [new File(['content'], 'test.pdf')], true, 'create'
    )
    expect(result.success).toBe(true)
  })

  it('convertit elevator=oui en has_elevator:true dans le devis', async () => {
    const mock = buildClient({ existingClient: { id: 'client-1' } })
    vi.mocked(createClient).mockReturnValue(mock as any)
    await demandeService.submitDemande({ ...baseData(), elevator: 'oui' }, [], true, 'create')
    const quotesInsertArg = (() => {
      for (const call of mock._from.mock.calls) {
        if (call[0] === 'quotes') {
          const idx = mock._from.mock.calls.indexOf(call)
          return mock._from.mock.results[idx]?.value?.insert?.mock?.calls?.[0]?.[0]
        }
      }
    })()
    expect(quotesInsertArg?.has_elevator).toBe(true)
  })
})
