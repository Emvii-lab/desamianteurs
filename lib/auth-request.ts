import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createServerSupabase } from './supabase-server'

type ResolvedUser = { id: string; email?: string } | null

/**
 * Résout l'utilisateur d'une requête API depuis :
 *  1. la session par cookie (web / SSR)
 *  2. un header `Authorization: Bearer <access_token>` (app mobile, auth par token)
 *
 * Renvoie aussi un client Supabase utilisable pour les requêtes qui suivent.
 */
export async function getRequestUser(req: Request): Promise<{ user: ResolvedUser; supabase: SupabaseClient }> {
  const cookieSupabase = await createServerSupabase()
  const { data: { user: cookieUser } } = await cookieSupabase.auth.getUser()
  if (cookieUser) return { user: cookieUser, supabase: cookieSupabase as unknown as SupabaseClient }

  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const tokenClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    )
    const { data: { user } } = await tokenClient.auth.getUser(token)
    if (user) return { user, supabase: tokenClient }
  }

  return { user: null, supabase: cookieSupabase as unknown as SupabaseClient }
}
