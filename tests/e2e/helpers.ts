import type { Page } from '@playwright/test'

/**
 * Intercepte les appels Supabase Auth (/auth/v1/token)
 * et renvoie une réponse contrôlée.
 */
export async function mockSupabaseLogin(page: Page, success: boolean) {
  await page.route('**/auth/v1/token**', async route => {
    if (success) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'fake.jwt.token',
          refresh_token: 'fake-refresh',
          token_type: 'bearer',
          expires_in: 3600,
          user: {
            id: 'test-user-id',
            email: 'admin@test.com',
            aud: 'authenticated',
            role: 'authenticated',
            user_metadata: { prenom: 'Admin', nom: 'Test' },
          },
        }),
      })
    } else {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'invalid_grant',
          error_description: 'Invalid login credentials',
        }),
      })
    }
  })
}

/**
 * Simule un utilisateur connecté en tant qu'admin
 * en mockant /auth/v1/user (utilisé par supabase.auth.getUser())
 */
export async function mockLoggedInUser(page: Page) {
  await page.route('**/auth/v1/user**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-user-id',
        email: 'admin@test.com',
        aud: 'authenticated',
        role: 'authenticated',
        user_metadata: { prenom: 'Admin', nom: 'Test' },
      }),
    })
  })
}

/**
 * Mock la redirection de rôle (admins table → /espace-admin)
 */
export async function mockAdminRole(page: Page) {
  await page.route('**/rest/v1/admins**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ id: 'admin-id', user_id: 'test-user-id' }]),
    })
  })
  await page.route('**/rest/v1/partners**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })
}
