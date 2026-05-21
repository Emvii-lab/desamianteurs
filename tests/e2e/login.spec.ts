import { test, expect } from '@playwright/test'
import { mockSupabaseLogin, mockAdminRole } from './helpers'

test.describe('Page Connexion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/connexion')
  })

  // ── Ce test couvre le bug "bouton bloqué indéfiniment sur Connexion..." ──────
  test('Supabase inaccessible → message d\'erreur après timeout (bouton non bloqué)', async ({ page }) => {
    // Simuler Supabase qui ne répond jamais (réseau coupé)
    await page.route('**/auth/v1/**', () => { /* ne pas appeler fulfill → hang */ })

    await page.fill('input[type="email"]', 'admin@test.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Le bouton doit passer en état chargement
    await expect(page.locator('button[type="submit"]')).toHaveText('Connexion...')

    // Après notre timeout de 15s, le bouton doit revenir à son état normal
    await expect(page.locator('button[type="submit"]')).toHaveText('Se connecter', { timeout: 20_000 })
    await expect(page.locator('.form-error')).toBeVisible()
  })

  // ── Ce test couvre "mauvais identifiants → erreur affichée" ─────────────────
  test('identifiants incorrects → erreur visible, bouton débloqué', async ({ page }) => {
    await mockSupabaseLogin(page, false)

    await page.fill('input[type="email"]', 'wrong@test.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('.form-error')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeEnabled()
    await expect(page.locator('button[type="submit"]')).not.toHaveText('Connexion...')
  })

  // ── Ce test couvre "auth réussie → navigation initiée, pas d'erreur" ─────────
  // Note : vérifier la destination finale (/espace-admin) nécessite des credentials
  // réels car le layout fait un getUser() SSR côté serveur (non interceptable par
  // Playwright). Ce test vérifie que l'auth a bien fonctionné côté client.
  test('login réussi → auth valide, aucune erreur affichée', async ({ page }) => {
    await mockSupabaseLogin(page, true)
    await mockAdminRole(page)

    await page.fill('input[type="email"]', 'admin@test.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Le bouton doit passer en état chargement (auth en cours)
    await expect(page.locator('button[type="submit"]')).toHaveText('Connexion...')

    // Aucune erreur d'authentification ne doit s'afficher (auth réussie côté client)
    await expect(page.locator('.form-error')).not.toBeVisible({ timeout: 5_000 })
  })
})
