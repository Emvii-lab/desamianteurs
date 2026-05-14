import '@testing-library/jest-dom/vitest'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = String(value) },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (i: number) => Object.keys(store)[i] ?? null,
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true })

// matchMedia mock (absent de jsdom)
Object.defineProperty(global, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Variables d'environnement pour les tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.SUPABASE_EDGE_URL = 'https://edge.test.supabase.co'
process.env.STRIPE_SECRET_KEY = 'sk_test_123'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123'
process.env.STRIPE_PRICE_ESSENTIEL = 'price_essentiel_123'
process.env.STRIPE_PRICE_PERFORMANCE = 'price_performance_123'
process.env.STRIPE_PRICE_PREMIUM = 'price_premium_123'
process.env.STRIPE_PRICE_ASSO = 'price_asso_123'
