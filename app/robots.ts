import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/espace-admin/',
        '/espace-client/',
        '/espace-partenaire/',
        '/connexion',
        '/inscription/',
        '/mot-de-passe-oublie',
        '/reinitialiser-mot-de-passe',
      ],
    },
    sitemap: 'https://www.desamianteurs.com/sitemap.xml',
  }
}
