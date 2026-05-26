import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import './globals.css'
import CookieConsent from '@/components/CookieConsent'

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

const BASE_URL = 'https://www.desamianteurs.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Désamianteurs.com – Trouvez un professionnel certifié amiante',
    template: '%s | Désamianteurs.com',
  },
  description: "Mettez en relation particuliers, entreprises et professionnels certifiés du secteur de l'amiante. Devis gratuits, pros vérifiés.",
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Désamianteurs',
  },
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: BASE_URL,
    siteName: 'Désamianteurs.com',
    title: 'Désamianteurs.com – Trouvez un professionnel certifié amiante',
    description: "Trouvez un professionnel certifié amiante. Devis gratuits, pros vérifiés.",
    images: [{ url: '/icons/icon-512.png', width: 512, height: 512, alt: 'Désamianteurs.com' }],
  },
  twitter: {
    card: 'summary',
    title: 'Désamianteurs.com',
    description: "Trouvez un professionnel certifié amiante. Devis gratuits, pros vérifiés.",
    images: ['/icons/icon-512.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${dmSans.variable} ${dmSerifDisplay.variable}`} data-scroll-behavior="smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#C0392B" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://zpagogunyynnmysaglwr.supabase.co" />
        <link rel="preconnect" href="https://js.stripe.com" />
        <link rel="dns-prefetch" href="https://api-adresse.data.gouv.fr" />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
          }
        `}} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Désamianteurs.com',
          url: BASE_URL,
          logo: `${BASE_URL}/icons/icon-512.png`,
          description: "Annuaire de professionnels certifiés pour le désamiantage. Devis gratuits, pros vérifiés.",
          sameAs: [],
        })}} />
      </head>
      <body style={{ fontFamily: 'var(--font-sans), DM Sans, sans-serif', margin: 0 }}>
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
