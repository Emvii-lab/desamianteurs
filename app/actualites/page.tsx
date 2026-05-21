import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Actualités | Désamianteurs.com',
  description: 'Suivez les dernières actualités sur la réglementation amiante, les certifications et les bonnes pratiques du secteur.',
}

type Article = {
  slug:     string
  category: string
  catColor: string
  title:    string
  excerpt:  string
  date:     string
  readTime: string
  featured?: boolean
}

const ARTICLES: Article[] = [
  {
    slug:     'reglementation-ss3-2026',
    category: 'Réglementation',
    catColor: '#DC2626',
    title:    'Mise à jour SS3 : ce qui change pour les entreprises de désamiantage en 2026',
    excerpt:  'Le décret du 15 janvier 2026 renforce les exigences de certification pour les interventions sous-section 3. Voici les nouvelles obligations à connaître avant le 1er juillet 2026.',
    date:     '28 avril 2026',
    readTime: '5 min',
    featured: true,
  },
  {
    slug:     'cofrac-nouvelle-accreditation',
    category: 'Certifications',
    catColor: '#1D4ED8',
    title:    "COFRAC : les nouvelles exigences d'accréditation pour les laboratoires d'analyse amiante",
    excerpt:  "Le COFRAC publie la révision de ses exigences pour les accréditations BREv26 et HP11. Les laboratoires ont 18 mois pour se mettre en conformité.",
    date:     '15 avril 2026',
    readTime: '4 min',
  },
  {
    slug:     'dta-bilan-2025',
    category: 'Diagnostic',
    catColor: '#059669',
    title:    'Bilan 2025 des DTA : 40 % des établissements publics toujours non conformes',
    excerpt:  'Le ministère du Travail publie son rapport annuel sur les Dossiers Techniques Amiante. Les établissements scolaires et hospitaliers restent les plus en retard.',
    date:     '8 avril 2026',
    readTime: '6 min',
  },
  {
    slug:     'qualibat-1552-controle',
    category: 'Certifications',
    catColor: '#1D4ED8',
    title:    'Qualibat 1552 : renforcement des contrôles terrain à partir de juin 2026',
    excerpt:  "Qualibat annonce des audits surprises sur les chantiers SS3 pour vérifier la conformité des certifications. Les entreprises non conformes s'exposent à une suspension immédiate.",
    date:     '2 avril 2026',
    readTime: '3 min',
  },
  {
    slug:     'marche-desamiantage-croissance',
    category: 'Marché',
    catColor: '#7C3AED',
    title:    "Le marché du désamiantage en France : +12 % de croissance attendue d'ici 2028",
    excerpt:  "Selon l'étude Xerfi, la rénovation du parc immobilier français devrait générer 3,2 milliards d'euros de travaux de désamiantage sur les 5 prochaines années.",
    date:     '25 mars 2026',
    readTime: '4 min',
  },
  {
    slug:     'formation-ss3-financement',
    category: 'Formation',
    catColor: '#D97706',
    title:    'Financement des formations SS3 : OPCO et France Travail élargissent leur soutien',
    excerpt:  "Les OPCO de la construction et France Travail annoncent un plan d'aide renforcé pour financer les formations certifiantes SS3 des demandeurs d'emploi et salariés.",
    date:     '18 mars 2026',
    readTime: '3 min',
  },
]

const CATEGORIES = ['Tous', 'Réglementation', 'Certifications', 'Diagnostic', 'Marché', 'Formation']

export default function ActualitesPage() {
  const featured = ARTICLES.find(a => a.featured)
  const rest     = ARTICLES.filter(a => !a.featured)

  return (
    <div style={{ background: '#F3F4F6', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'var(--black)', padding: '56px 32px 48px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 20, background: 'rgba(192,57,43,0.18)', color: 'var(--red)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Actualités
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 3.5vw, 42px)', color: 'white', marginBottom: 12, fontWeight: 700 }}>
            Réglementation, certifications &amp; secteur amiante
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, maxWidth: 580, lineHeight: 1.7, margin: 0 }}>
            Restez informé des évolutions réglementaires, des nouvelles certifications et des tendances du secteur du désamiantage.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 32px 80px' }}>

        {/* Catégories */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
          {CATEGORIES.map((cat, i) => (
            <span key={cat} style={{
              padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'default',
              background: i === 0 ? 'var(--black)' : 'white',
              color: i === 0 ? 'white' : 'var(--gray-600)',
              border: `1px solid ${i === 0 ? 'var(--black)' : 'var(--gray-200)'}`,
            }}>
              {cat}
            </span>
          ))}
        </div>

        {/* Article à la une */}
        {featured && (
          <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 16, overflow: 'hidden', marginBottom: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '32px 36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: `${featured.catColor}15`, color: featured.catColor }}>
                  {featured.category}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#FEF3C7', color: '#92400E' }}>
                  À la une
                </span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: 'var(--black)', marginBottom: 14, lineHeight: 1.35 }}>
                {featured.title}
              </h2>
              <p style={{ fontSize: 15, color: 'var(--gray-600)', lineHeight: 1.75, marginBottom: 20, maxWidth: 680 }}>
                {featured.excerpt}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--gray-400)' }}>
                  <span>{featured.date}</span>
                  <span>·</span>
                  <span>Lecture {featured.readTime}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Lire l'article
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Grille articles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {rest.map(article => (
            <div key={article.slug} style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: `${article.catColor}15`, color: article.catColor, alignSelf: 'flex-start' }}>
                {article.category}
              </span>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--black)', lineHeight: 1.4, margin: 0 }}>
                {article.title}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.65, margin: 0, flex: 1 }}>
                {article.excerpt}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--gray-100)', fontSize: 11, color: 'var(--gray-400)' }}>
                <span>{article.date} · {article.readTime}</span>
                <span style={{ fontWeight: 600, color: 'var(--red)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 3 }}>
                  Lire
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA newsletter */}
        <div style={{ marginTop: 48, background: 'var(--black)', borderRadius: 16, padding: '36px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'white', marginBottom: 6, fontWeight: 700 }}>
              Restez informé des évolutions réglementaires
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: 0 }}>
              Recevez une synthèse mensuelle des actualités amiante directement dans votre boîte mail.
            </p>
          </div>
          <a href="mailto:contact@desamianteurs.com?subject=Inscription newsletter" className="btn btn-red" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
            S'inscrire à la newsletter
          </a>
        </div>

      </div>

      <Footer />
    </div>
  )
}
