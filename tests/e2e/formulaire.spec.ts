import { test, expect } from '@playwright/test'
import { mockLoggedInUser } from './helpers'

test.describe('Formulaire demande', () => {
  test.beforeEach(async ({ page }) => {
    // Mock les données server-side chargées par page.tsx
    await page.route('**/rest/v1/ref_service_types**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'srv-1', name: 'Diagnostic amiante / plomb', code: 'diagnostic_amiante', description: 'Repérage bâtiments construits avant 1997' },
        ]),
      })
    })
    await page.route('**/rest/v1/ref_property_types**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'prop-1', label: 'Maison individuelle', category: 'individual' },
        ]),
      })
    })
  })

  // ── Smoke test : la page se charge et l'étape 1 est visible ─────────────────
  test('la page charge et affiche l\'étape 1', async ({ page }) => {
    await page.goto('/formulaire')
    await expect(page.locator('h2')).toContainText('Décrivez votre besoin')
    await expect(page.locator('text=Diagnostic amiante')).toBeVisible()
  })

  // ── Ce test couvre "bouton Envoyer ne fait rien quand connecté" ──────────────
  test('submit étape 3 connecté → écran succès ou erreur (pas de blocage silencieux)', async ({ page }) => {
    // Simuler utilisateur connecté
    await mockLoggedInUser(page)

    // Mock la résolution du client (clients table)
    await page.route('**/rest/v1/clients**', async route => {
      const method = route.request().method()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(method === 'GET' ? [] : [{ id: 'client-id' }]),
      })
    })
    // Mock la création du devis
    await page.route('**/rest/v1/quotes**', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 'quote-id' }]),
      })
    })
    await page.route('**/rest/v1/quote_service_types**', async route => {
      await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
    })

    await page.goto('/formulaire')

    // Étape 1 : sélections obligatoires
    await page.click('text=Diagnostic amiante')
    await page.click('text=Particulier')

    // Type de bien via CustomSelect
    await page.click('[placeholder="Sélectionnez d\'abord votre profil"], [placeholder="Sélectionner le type de bien"]')
    await page.click('text=Maison individuelle')

    // Délai (4 boutons — prendre le 1er)
    await page.locator('.step-grid-4 button').first().click()
    // Budget via CustomSelect
    await page.click('[placeholder="Sélectionner un budget"]')
    await page.locator('[role="option"], .custom-select-option').first().click()

    await page.click('text=Étape suivante')

    // Étape 2 : adresse
    await page.fill('[placeholder="Numéro et nom de rue"]', '10 rue de la Paix')
    await page.fill('[placeholder="Code postal"]', '75001')
    await page.fill('[placeholder="Ville"]', 'Paris')

    // Étage et ascenseur
    await page.click('[placeholder="Sélectionnez"]')
    await page.locator('[role="option"], .custom-select-option').first().click()
    // Second select (ascenseur)
    await page.locator('[placeholder="Sélectionnez"]').nth(1).click()
    await page.locator('[role="option"], .custom-select-option').first().click()

    await page.click('text=Étape suivante')

    // Étape 3 : connecté → banner "Connecté en tant que" visible
    await expect(page.locator('text=Connecté en tant que')).toBeVisible()

    // Cliquer sur "Envoyer ma demande"
    await page.click('text=Envoyer ma demande')

    // Le résultat DOIT être visible : succès ou erreur — jamais un bouton bloqué
    const successOrError = page.locator('text=Demande envoyée, .form-error')
    await expect(successOrError.or(page.locator('text=Demande envoyée !'))).toBeVisible({ timeout: 10_000 })
  })
})
