import { NextRequest, NextResponse } from 'next/server'

const NAF: Record<string, string> = {
  '39.00Z': 'Dépollution et gestion des déchets',
  '41.10A': 'Promotion immobilière de logements',
  '41.20A': 'Construction de maisons individuelles',
  '41.20B': "Construction d'autres bâtiments",
  '43.11Z': 'Travaux de démolition',
  '43.12A': 'Travaux de terrassement courants et travaux préparatoires',
  '43.21A': 'Travaux d\'installation électrique dans tous locaux',
  '43.22A': "Travaux d'installation d'eau et de gaz",
  '43.22B': "Travaux d'installation d'équipements thermiques et de climatisation",
  '43.29A': "Travaux d'isolation",
  '43.29B': "Autres travaux d'installation",
  '43.31Z': 'Travaux de plâtrerie',
  '43.32A': 'Travaux de menuiserie bois et PVC',
  '43.33Z': 'Travaux de revêtement des sols et des murs',
  '43.34Z': 'Travaux de peinture et vitrerie',
  '43.39Z': 'Autres travaux de finition',
  '43.91A': 'Travaux de charpente',
  '43.91B': 'Travaux de couverture par éléments',
  '43.99A': "Travaux d'étanchéification",
  '43.99B': 'Travaux de montage de structures métalliques',
  '43.99C': 'Travaux de démolition',
  '43.99D': 'Autres travaux spécialisés de construction',
  '43.99E': 'Location avec opérateur de matériel de construction',
  '62.01Z': 'Programmation informatique',
  '62.02A': 'Conseil en systèmes et logiciels informatiques',
  '69.10Z': 'Activités juridiques',
  '69.20Z': 'Activités comptables',
  '70.22Z': 'Conseil pour les affaires et autres conseils de gestion',
  '71.11Z': "Activités d'architecture",
  '71.12B': 'Ingénierie, études techniques',
  '71.20A': 'Contrôle technique automobile',
  '71.20B': 'Analyses, essais et inspections techniques',
  '74.90B': 'Activités spécialisées diverses',
  '81.10Z': 'Activités combinées de soutien lié aux bâtiments',
}

const SIRET_RE = /^\d{14}$/

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const { siret } = body as { siret?: string }

  if (!siret || typeof siret !== 'string') {
    return NextResponse.json({ error: 'SIRET manquant' }, { status: 400 })
  }

  const clean = siret.replace(/\D/g, '')

  if (!SIRET_RE.test(clean)) {
    return NextResponse.json({ error: 'SIRET invalide — 14 chiffres requis' }, { status: 400 })
  }

  const edgeUrl = process.env.SUPABASE_EDGE_URL
  if (!edgeUrl) {
    return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
  }

  try {
    const res = await fetch(`${edgeUrl}/verify-siret`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ siret: clean }),
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'SIRET introuvable ou service indisponible' }, { status: res.status })
    }

    const data = await res.json()

    if (data?.activite && NAF[data.activite]) {
      data.activite = NAF[data.activite]
    }

    return NextResponse.json(data)
  } catch (e: any) {
    if (e?.name === 'TimeoutError') {
      return NextResponse.json({ error: 'Délai dépassé — réessayez' }, { status: 504 })
    }
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
