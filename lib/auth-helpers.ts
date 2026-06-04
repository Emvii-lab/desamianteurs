import { createServerSupabase } from './supabase-server'

type SupabaseServer = Awaited<ReturnType<typeof createServerSupabase>>

export async function verifyAdmin(supabase: SupabaseServer) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: admin } = await supabase.from('admins').select('id').eq('user_id', user.id).single()
  return admin ? user : null
}
