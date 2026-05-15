import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import PromoBar from '@/components/PromoBar'

afterEach(() => {
  cleanup()
})

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

const STORAGE_KEY = 'promobar_dismissed_v6'

describe('PromoBar', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useRealTimers()
  })

  it('affiche le bandeau si non encore fermé', async () => {
    render(<PromoBar />)
    await waitFor(() => {
      expect(screen.getByText(/Offre lancement/i)).toBeInTheDocument()
    })
    expect(screen.getByRole('link', { name: /Rejoindre le réseau/i })).toHaveAttribute(
      'href',
      '/inscription?tab=partenaire'
    )
  })

  it('n’affiche pas le bandeau si déjà dismissé (localStorage)', () => {
    localStorage.setItem(STORAGE_KEY, '1')
    render(<PromoBar />)
    expect(screen.queryByText(/Offre lancement/i)).not.toBeInTheDocument()
  })

  it('fermeture : écrit localStorage puis masque après l’animation', async () => {
    render(<PromoBar />)
    await waitFor(() => {
      expect(screen.getByText(/Offre lancement/i)).toBeInTheDocument()
    })

    vi.useFakeTimers()
    fireEvent.click(screen.getByRole('button', { name: /Fermer le bandeau/i }))
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(350)
    })

    expect(localStorage.getItem(STORAGE_KEY)).toBe('1')
    expect(screen.queryByText(/Offre lancement/i)).not.toBeInTheDocument()
    vi.useRealTimers()
  })
})
