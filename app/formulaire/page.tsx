import { createServerSupabase } from '@/lib/supabase-server'
import FormulaireClient from './FormulaireClient'

export const metadata = {
  title: 'Déposer une demande de devis | Désamianteurs.fr',
  description: 'Décrivez votre besoin et recevez des devis de professionnels certifiés sous 48h.',
}

export default async function FormulairePage() {
  const supabase = await createServerSupabase()

  // Fetch reference data from Supabase on the server
  const [servicesRes, propertiesRes] = await Promise.all([
    supabase
      .from('ref_service_types')
      .select('id, code, label, description, sort_order')
      .order('sort_order', { ascending: true }),
    supabase
      .from('ref_property_types')
      .select('id, category, code, label, sort_order')
      .order('sort_order', { ascending: true })
  ])

  // Map database labels to the expected 'name' field for services
  const initialServices = (servicesRes.data || []).map(s => ({
    id: s.id,
    code: s.code,
    name: s.label,
    description: s.description
  }))

  const initialPropertyTypes = propertiesRes.data || []

  return (
    <FormulaireClient 
      initialServices={initialServices} 
      initialPropertyTypes={initialPropertyTypes} 
    />
  )
}
