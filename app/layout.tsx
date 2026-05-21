import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
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
    <html lang="fr" className={`${dmSans.variable} ${dmSerifDisplay.variable}`} data-scroll-behavior="smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Pré-connexions aux services externes pour réduire la latence */}
        <link rel="preconnect" href="https://zpagogunyynnmysaglwr.supabase.co" />
        <link rel="preconnect" href="https://js.stripe.com" />
        <link rel="dns-prefetch" href="https://api-adresse.data.gouv.fr" />
      </head>
      <body style={{ fontFamily: 'var(--font-sans), DM Sans, sans-serif', margin: 0 }}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
