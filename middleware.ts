import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
          // Écriture des cookies côté requête
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Écriture des cookies dans la réponse (obligatoire pour persister)
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  // Ignorer les prefetch Next.js et les assets statiques
  const isPrefetch = request.headers.get('next-router-prefetch') === '1'
    || request.headers.get('purpose') === 'prefetch'
  if (isPrefetch) return supabaseResponse

  // Routes publiques : pas d'appel réseau Supabase, on passe directement
  if (!pathname.startsWith('/espace-')) {
    return supabaseResponse
  }

  // Routes privées uniquement : valider le token (appel réseau) + refresher les cookies
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Token expiré ou refresh token introuvable — on nettoie les cookies et on redirige
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/connexion'
    const response = NextResponse.redirect(redirectUrl)
    // Supprimer tous les cookies Supabase pour éviter la boucle d'erreurs
    request.cookies.getAll()
      .filter(c => c.name.startsWith('sb-'))
      .forEach(c => response.cookies.delete(c.name))
    return response
  }

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/connexion'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Tous les chemins sauf fichiers statiques et images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
