import { NextResponse } from 'next/server'

/**
 * Réponses d'erreur standardisées pour les routes API.
 * Centralise le format JSON et les codes HTTP courants.
 */
export const apiError = {
  badRequest:     (msg: string) => NextResponse.json({ error: msg }, { status: 400 }),
  unauthorized:   (msg = 'Non authentifié')  => NextResponse.json({ error: msg }, { status: 401 }),
  forbidden:      (msg = 'Non autorisé')     => NextResponse.json({ error: msg }, { status: 403 }),
  notFound:       (msg: string) => NextResponse.json({ error: msg }, { status: 404 }),
  serverError:    (msg: string) => NextResponse.json({ error: msg }, { status: 500 }),
  timeout:        (msg: string) => NextResponse.json({ error: msg }, { status: 504 }),
}
