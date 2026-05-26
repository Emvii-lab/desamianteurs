import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'https://www.desamianteurs.com'

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: BASE_URL,                              priority: 1.0,  changeFrequency: 'weekly'  },
  { url: `${BASE_URL}/professionnels`,          priority: 0.9,  changeFrequency: 'daily'   },
  { url: `${BASE_URL}/formulaire`,              priority: 0.8,  changeFrequency: 'monthly' },
  { url: `${BASE_URL}/tarifs`,                  priority: 0.7,  changeFrequency: 'monthly' },
  { url: `${BASE_URL}/actualites`,              priority: 0.6,  changeFrequency: 'weekly'  },
  { url: `${BASE_URL}/certifications`,          priority: 0.5,  changeFrequency: 'monthly' },
  { url: `${BASE_URL}/mentions-legales`,        priority: 0.2,  changeFrequency: 'yearly'  },
  { url: `${BASE_URL}/cgu`,                     priority: 0.2,  changeFrequency: 'yearly'  },
  { url: `${BASE_URL}/confidentialite`,         priority: 0.2,  changeFrequency: 'yearly'  },
  { url: `${BASE_URL}/charte`,                  priority: 0.2,  changeFrequency: 'yearly'  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data: partners } = await supabase
    .from('partners')
    .select('id, updated_at')
    .eq('status', 'active')

  const partnerRoutes: MetadataRoute.Sitemap = (partners ?? []).map((p) => ({
    url: `${BASE_URL}/professionnels/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    priority: 0.8,
    changeFrequency: 'weekly',
  }))

  return [...STATIC_ROUTES, ...partnerRoutes]
}
