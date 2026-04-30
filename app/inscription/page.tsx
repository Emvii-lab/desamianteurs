import { Suspense } from 'react'
import { createServerSupabase } from '@/lib/supabase-server'
import { InscriptionContent } from './InscriptionClient'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Inscription | Désamianteurs.fr',
}

export default async function InscriptionPage() {
  const supabase = await createServerSupabase()
  
  const [reg, dep, doc, dom] = await Promise.all([
    supabase.from('ref_regions').select('*').order('sort_order'),
    supabase.from('ref_departments').select('*').order('sort_order'),
    supabase.from('ref_document_types').select('*').order('sort_order'),
    supabase.from('ref_domains').select('*').order('sort_order')
  ])

  return (
    <div className="fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Suspense>
        <InscriptionContent 
          initialRegions={reg.data || []} 
          initialDepartments={dep.data || []} 
          initialDocTypes={doc.data || []}
          initialDomains={dom.data || []}
        />
      </Suspense>
      <Footer />
    </div>
  )
}
