import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              maxAge: 60 * 60 * 24 * 365, // persistant 1 an — évite les cookies éphémères dans le WebView
              sameSite: 'lax',
              secure: true,
            })
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  const isPrefetch = request.headers.get('next-router-prefetch') === '1'
    || request.headers.get('purpose') === 'prefetch'
  if (isPrefetch) return supabaseResponse

  if (!pathname.startsWith('/espace-')) {
    return supabaseResponse
  }

  // getSession() lit les cookies sans appel réseau (rapide, pas de déco sur erreur réseau)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // Pas de session locale → on essaie getUser() pour confirmer
    try {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        const url = request.nextUrl.clone()
        url.pathname = '/connexion'
        return NextResponse.redirect(url)
      }
    } catch {
      // Erreur réseau temporaire : on laisse passer plutôt que de déconnecter
      return supabaseResponse
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
