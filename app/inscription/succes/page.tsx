import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import SuccesClient from './SuccesClient'

export default async function SuccesPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  const sessionId = params.session_id

  if (!sessionId) redirect('/inscription')

  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/connexion')

  return <SuccesClient sessionId={sessionId} />
}
