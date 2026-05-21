import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Désamianteurs.com',
    short_name: 'Désamianteurs',
    description: "Trouvez un professionnel certifié amiante. Devis gratuits, pros vérifiés.",
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#C0392B',
    orientation: 'portrait',
    lang: 'fr',
    categories: ['business', 'utilities'],
    icons: [
      { src: '/icons/icon-72.png',   sizes: '72x72',   type: 'image/png' },
      { src: '/icons/icon-96.png',   sizes: '96x96',   type: 'image/png' },
      { src: '/icons/icon-128.png',  sizes: '128x128', type: 'image/png' },
      { src: '/icons/icon-144.png',  sizes: '144x144', type: 'image/png' },
      { src: '/icons/icon-152.png',  sizes: '152x152', type: 'image/png' },
      { src: '/icons/icon-192.png',  sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-384.png',  sizes: '384x384', type: 'image/png' },
      { src: '/icons/icon-512.png',  sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    screenshots: [
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        label: 'Désamianteurs.com',
      },
    ],
  }
}
