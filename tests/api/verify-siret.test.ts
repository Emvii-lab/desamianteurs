import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST } from '@/app/api/verify-siret/route'

const fetchMock = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
  process.env.N8N_WEBHOOK_VERIFY_SIRET = 'https://n8n.test/webhook/verify-siret'
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.N8N_WEBHOOK_VERIFY_SIRET
})

function makeReq(body: unknown) {
  return new Request('http://localhost/api/verify-siret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/verify-siret', () => {
  it('retourne 400 si le corps JSON est invalide', async () => {
    const req = new Request('http://localhost/api/verify-siret', {
      method: 'POST',
      body: 'not-json',
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req as any)
    expect(res.status).toBe(400)
  })

  it('retourne 400 si le SIRET est absent', async () => {
    const res = await POST(makeReq({}) as any)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/manquant/i)
  })

  it('retourne 400 si le SIRET a moins de 14 chiffres', async () => {
    const res = await POST(makeReq({ siret: '1234567890' }) as any)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/invalide/i)
  })

  it('retourne 400 si le SIRET a plus de 14 chiffres', async () => {
    const res = await POST(makeReq({ siret: '123456789012345' }) as any)
    expect(res.status).toBe(400)
  })

  it('nettoie les espaces avant validation (14 chiffres après nettoyage)', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ nom: 'ACME', siret: '12345678901234' }), { status: 200 })
    )
    const res = await POST(makeReq({ siret: '123 456 789 01234' }) as any)
    expect(res.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('retourne 500 si N8N_WEBHOOK_VERIFY_SIRET est absent', async () => {
    delete process.env.N8N_WEBHOOK_VERIFY_SIRET
    const res = await POST(makeReq({ siret: '12345678901234' }) as any)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toMatch(/configuration/i)
  })

  it('traduit le code NAF connu en libellé français', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ nom: 'ISO Corp', activite: '43.29A' }), { status: 200 })
    )
    const res = await POST(makeReq({ siret: '12345678901234' }) as any)
    const json = await res.json()
    expect(json.activite).toBe("Travaux d'isolation")
  })

  it('retourne 504 en cas de timeout (AbortError)', async () => {
    fetchMock.mockImplementationOnce(() => {
      const err = Object.assign(new Error('Aborted'), { name: 'AbortError' })
      return Promise.reject(err)
    })
    const res = await POST(makeReq({ siret: '12345678901234' }) as any)
    expect(res.status).toBe(504)
    const json = await res.json()
    expect(json.error).toMatch(/délai/i)
  })

  it('propage le statut HTTP si l\'edge function répond en erreur', async () => {
    fetchMock.mockResolvedValueOnce(new Response('Not found', { status: 404 }))
    const res = await POST(makeReq({ siret: '12345678901234' }) as any)
    expect(res.status).toBe(404)
  })
})
