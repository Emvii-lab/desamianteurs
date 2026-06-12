import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const searchParams = requestUrl.searchParams
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : requestUrl.origin
  const code = searchParams.get('code')
  const type = searchParams.get('type') ?? 'client'

  if (!code) {
    return NextResponse.redirect(`${origin}/connexion?error=missing_code`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/connexion?error=auth_failed`)
  }

  const userId = data.user.id

  // Vérifie si un profil admin/partenaire/client existe déjà
  const [{ data: admin }, { data: partner }, { data: client }] = await Promise.all([
    supabase.from('admins').select('id').eq('user_id', userId).maybeSingle(),
    supabase.from('partners').select('id').eq('user_id', userId).maybeSingle(),
    supabase.from('clients').select('id').eq('user_id', userId).maybeSingle(),
  ])

  if (admin)   return NextResponse.redirect(`${origin}/espace-admin`)
  if (partner) return NextResponse.redirect(`${origin}/espace-partenaire`)
  if (client)  return NextResponse.redirect(`${origin}/espace-client`)

  // Nouveau compte Google sans profil → complétion
  return NextResponse.redirect(`${origin}/inscription/completer?type=${type}`)
}
