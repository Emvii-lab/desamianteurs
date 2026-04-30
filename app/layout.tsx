import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Désamianteurs.fr – Trouvez un professionnel certifié amiante',
  description: "Mettez en relation particuliers, entreprises et professionnels certifiés du secteur de l'amiante. Devis gratuits, pros vérifiés.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${dmSans.variable} ${dmSerifDisplay.variable}`}>
      <body style={{ fontFamily: 'var(--font-sans), DM Sans, sans-serif', margin: 0 }}>
        {children}
      </body>
    </html>
  )
}
