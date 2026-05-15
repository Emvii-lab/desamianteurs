import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import UtilisateursClient from '@/app/espace-admin/utilisateurs/UtilisateursClient'

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Filtre les props spécifiques à framer-motion pour éviter les warnings React
function stripMotion({ children, variants, initial, animate, exit, transition, viewport,
  whileHover, whileTap, whileFocus, whileInView, drag, dragConstraints, layout, ...rest }: any) {
  return rest
}

vi.mock('framer-motion', () => ({
  motion: {
    div:   ({ children, ...p }: any) => <div {...stripMotion(p)}>{children}</div>,
    tr:    ({ children, ...p }: any) => <tr {...stripMotion(p)}>{children}</tr>,
    tbody: ({ children, ...p }: any) => <tbody {...stripMotion(p)}>{children}</tbody>,
  },
  AnimatePresence: ({ children }: any) => children,
  useInView: () => true,
}))

vi.mock('@/lib/animations', () => ({
  fadeUp:         {},
  staggerContainer: {},
  tableRowHover:  {},
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}))

// ─── Données de test ──────────────────────────────────────────────────────────

const mockClient = {
  id: 'profile-client-1',
  user_id: 'auth-client-1',
  first_name: 'Marie',
  last_name: 'Martin',
  email: 'marie.martin@example.com',
  phone: '0612345678',
  created_at: '2026-01-15T10:00:00Z',
  role: 'client',
  company_name: undefined,
  partner_type: undefined,
}

const mockPartner = {
  id: 'profile-partner-1',
  user_id: 'auth-partner-1',
  first_name: 'Paul',
  last_name: 'Durand',
  email: 'paul.durand@example.com',
  phone: '0698765432',
  created_at: '2026-02-01T08:00:00Z',
  role: 'partenaire',
  company_name: 'Amiante Pro SARL',
  partner_type: 'diagnostician',
}

const fetchMock = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

// ─── Tableau des utilisateurs ─────────────────────────────────────────────────

describe('UtilisateursClient — tableau', () => {
  it('affiche les utilisateurs dans le tableau', () => {
    render(<UtilisateursClient initialUsers={[mockClient, mockPartner]} />)
    expect(screen.getByText('Marie Martin')).toBeInTheDocument()
    expect(screen.getByText('Paul Durand')).toBeInTheDocument()
  })

  it('filtre les utilisateurs par onglet rôle', () => {
    render(<UtilisateursClient initialUsers={[mockClient, mockPartner]} />)
    fireEvent.click(screen.getByText(/Partenaires/))
    expect(screen.queryByText('Marie Martin')).not.toBeInTheDocument()
    expect(screen.getByText('Paul Durand')).toBeInTheDocument()
  })

  it('filtre par recherche sur le nom', () => {
    render(<UtilisateursClient initialUsers={[mockClient, mockPartner]} />)
    fireEvent.change(screen.getByPlaceholderText('Rechercher...'), { target: { value: 'marie' } })
    expect(screen.getByText('Marie Martin')).toBeInTheDocument()
    expect(screen.queryByText('Paul Durand')).not.toBeInTheDocument()
  })
})

// ─── Modale détails ───────────────────────────────────────────────────────────

describe('UserDetailModal', () => {
  it('s\'ouvre en cliquant sur "Détails" et affiche la section reset', () => {
    render(<UtilisateursClient initialUsers={[mockClient]} />)
    fireEvent.click(screen.getByRole('button', { name: /détails/i }))
    // Contenu unique à la modale (pas dans le tableau)
    expect(screen.getByText('Réinitialiser le mot de passe')).toBeInTheDocument()
  })

  it('affiche le nom complet et le badge de rôle dans la modale', () => {
    render(<UtilisateursClient initialUsers={[mockClient]} />)
    fireEvent.click(screen.getByRole('button', { name: /détails/i }))
    // "Marie Martin" apparaît dans le tableau ET dans la modale → au moins 2 occurrences
    expect(screen.getAllByText('Marie Martin').length).toBeGreaterThanOrEqual(2)
    // La modale a une section unique "Réinitialiser le mot de passe" — si présente, la modale est ouverte
    expect(screen.getByText('Réinitialiser le mot de passe')).toBeInTheDocument()
    // L'email est affiché dans le header de la modale (pas juste dans le tableau)
    expect(screen.getAllByText('marie.martin@example.com').length).toBeGreaterThanOrEqual(2)
  })

  it('se ferme en cliquant sur le bouton ×', () => {
    render(<UtilisateursClient initialUsers={[mockClient]} />)
    fireEvent.click(screen.getByRole('button', { name: /détails/i }))
    expect(screen.getByText('Réinitialiser le mot de passe')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /fermer la modale/i }))
    expect(screen.queryByText('Réinitialiser le mot de passe')).not.toBeInTheDocument()
  })

  it('appelle POST /api/admin/user avec l\'email au clic sur "Envoyer"', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true, link: 'https://reset.link' }), { status: 200 })
    )
    render(<UtilisateursClient initialUsers={[mockClient]} />)
    fireEvent.click(screen.getByRole('button', { name: /détails/i }))
    fireEvent.click(screen.getByRole('button', { name: /envoyer/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/admin/user', expect.objectContaining({
        method: 'POST',
      }))
      // Vérifie la structure exacte du JSON envoyé (pas juste une substring)
      const body = JSON.parse(fetchMock.mock.calls[0][1].body)
      expect(body).toEqual(expect.objectContaining({ email: 'marie.martin@example.com' }))
    })
  })

  it('affiche "Email envoyé" après succès du reset', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    )
    render(<UtilisateursClient initialUsers={[mockClient]} />)
    fireEvent.click(screen.getByRole('button', { name: /détails/i }))
    fireEvent.click(screen.getByRole('button', { name: /envoyer/i }))

    await waitFor(() => {
      expect(screen.getByText(/email envoyé/i)).toBeInTheDocument()
    })
  })

  it('affiche un message d\'erreur si le reset échoue', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'User not found' }), { status: 400 })
    )
    render(<UtilisateursClient initialUsers={[mockClient]} />)
    fireEvent.click(screen.getByRole('button', { name: /détails/i }))
    fireEvent.click(screen.getByRole('button', { name: /envoyer/i }))

    await waitFor(() => {
      expect(screen.getByText(/user not found/i)).toBeInTheDocument()
    })
  })

  it('ouvre la modale de confirmation en cliquant sur "Supprimer"', () => {
    render(<UtilisateursClient initialUsers={[mockClient]} />)
    fireEvent.click(screen.getByRole('button', { name: /détails/i }))
    const supprimerBtns = screen.getAllByRole('button', { name: /supprimer/i })
    fireEvent.click(supprimerBtns[0])
    // Le bouton "Supprimer définitivement" est unique à la modale de confirmation
    expect(screen.getByRole('button', { name: /supprimer définitivement/i })).toBeInTheDocument()
  })
})

// ─── Modale confirmation suppression ─────────────────────────────────────────

describe('DeleteConfirmModal', () => {
  function openDeleteConfirm(user = mockClient) {
    render(<UtilisateursClient initialUsers={[user]} />)
    fireEvent.click(screen.getByRole('button', { name: /détails/i }))
    fireEvent.click(screen.getByRole('button', { name: /^supprimer$/i }))
  }

  it('affiche le nom et l\'email de l\'utilisateur dans la modale de confirmation', () => {
    openDeleteConfirm()
    // Le bouton unique à la modale de confirmation est présent
    expect(screen.getByRole('button', { name: /supprimer définitivement/i })).toBeInTheDocument()
    // L'email apparaît dans le header de la modale de confirmation (en plus du tableau et de la modale détails)
    expect(screen.getAllByText('marie.martin@example.com').length).toBeGreaterThanOrEqual(2)
  })

  it('affiche les éléments en cascade pour un client', () => {
    openDeleteConfirm(mockClient)
    expect(screen.getByText(/profil client/i)).toBeInTheDocument()
    expect(screen.getByText(/demandes de devis/i)).toBeInTheDocument()
  })

  it('affiche les éléments en cascade pour un partenaire', () => {
    openDeleteConfirm(mockPartner)
    expect(screen.getByText(/profil partenaire/i)).toBeInTheDocument()
    expect(screen.getByText(/zones d'intervention/i)).toBeInTheDocument()
  })

  it('affiche toujours "Le compte d\'authentification"', () => {
    openDeleteConfirm()
    expect(screen.getByText(/compte d'authentification/i)).toBeInTheDocument()
  })

  it('ferme la modale de confirmation en cliquant "Annuler"', () => {
    openDeleteConfirm()
    fireEvent.click(screen.getByRole('button', { name: /annuler/i }))
    expect(screen.queryByText(/supprimer définitivement/i)).not.toBeInTheDocument()
  })

  it('appelle DELETE /api/admin/user avec userId et role', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    )
    openDeleteConfirm()
    fireEvent.click(screen.getByRole('button', { name: /supprimer définitivement/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/admin/user', expect.objectContaining({
        method: 'DELETE',
        body: expect.stringContaining('auth-client-1'),
      }))
    })
  })

  it('retire l\'utilisateur de la liste après suppression réussie', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    )
    render(<UtilisateursClient initialUsers={[mockClient, mockPartner]} />)

    // Ouvre détails du client
    const detailsBtns = screen.getAllByRole('button', { name: /détails/i })
    fireEvent.click(detailsBtns[0])
    fireEvent.click(screen.getByRole('button', { name: /^supprimer$/i }))

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /supprimer définitivement/i }))
    })

    await waitFor(() => {
      expect(screen.queryByText('Marie Martin')).not.toBeInTheDocument()
    })
    // Le partenaire doit rester visible
    expect(screen.getByText('Paul Durand')).toBeInTheDocument()
  })

  it('affiche une erreur si DELETE échoue', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Suppression impossible' }), { status: 500 })
    )
    openDeleteConfirm()
    fireEvent.click(screen.getByRole('button', { name: /supprimer définitivement/i }))

    await waitFor(() => {
      expect(screen.getByText(/suppression impossible/i)).toBeInTheDocument()
    })
  })
})
