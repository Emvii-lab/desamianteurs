import { createClient } from '@/lib/supabase'
import { CATEGORY_MAP } from '@/lib/constants'
import type { DemandeFormData } from '@/lib/types'

type SupabaseClient = ReturnType<typeof createClient>

const ALLOWED_FILE_TYPES = /^(image\/(jpeg|png|webp)|application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document))$/
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 Mo

// ─── Étape 1 : authentification ───────────────────────────────────────────────

async function resolveUserId(
  supabase: SupabaseClient,
  data: Pick<DemandeFormData, 'email' | 'password' | 'prenom' | 'nom' | 'telephone' | 'userType'>,
  isLoggedIn: boolean,
  authMode: 'create' | 'login',
): Promise<string> {
  if (isLoggedIn) {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) throw new Error('Session expirée. Veuillez vous reconnecter.')
    return user.id
  }

  if (authMode === 'create') {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password!,
      options: {
        data: {
          prenom:      data.prenom,
          nom:         data.nom,
          telephone:   data.telephone,
          client_type: CATEGORY_MAP[data.userType] || 'individual',
        },
      },
    })
    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        throw new Error('Cet email est déjà enregistré. Veuillez vous connecter.')
      }
      throw new Error(error.message)
    }
    if (!authData.user) throw new Error('Erreur lors de la création du compte.')
    return authData.user.id
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password!,
  })
  if (error) throw new Error(error.message || 'Identifiants incorrects.')
  if (!authData.user) throw new Error('Utilisateur non trouvé.')
  return authData.user.id
}

// ─── Étape 2 : profil client ──────────────────────────────────────────────────

async function resolveClientId(
  supabase: SupabaseClient,
  userId: string,
  data: Pick<DemandeFormData, 'prenom' | 'nom' | 'email' | 'telephone' | 'userType'>,
): Promise<string> {
  const { data: existing } = await supabase
    .from('clients').select('id').eq('user_id', userId).maybeSingle()
  if (existing) return existing.id

  const { data: newClient, error } = await supabase
    .from('clients')
    .insert({
      user_id:     userId,
      first_name:  data.prenom || '',
      last_name:   data.nom || '',
      email:       data.email,
      phone:       data.telephone || '',
      client_type: CATEGORY_MAP[data.userType] || 'individual',
    })
    .select('id').single()
  if (error) throw new Error(error.message || 'Erreur création profil client.')
  return newClient.id
}

// ─── Étape 3 : création du devis ──────────────────────────────────────────────

async function createQuote(
  supabase: SupabaseClient,
  clientId: string,
  data: DemandeFormData,
): Promise<string> {
  const department = data.postalCode?.startsWith('97')
    ? data.postalCode.substring(0, 3)
    : data.postalCode?.substring(0, 2) || null

  const { data: quote, error } = await supabase
    .from('quotes')
    .insert({
      client_id:           clientId,
      property_type_id:    data.propertyType,
      address_street:      data.streetAddress,
      address_complement:  data.complement,
      address_city:        data.city,
      address_postal_code: data.postalCode,
      address_department:  department,
      client_type:         CATEGORY_MAP[data.userType] || 'individual',
      timeline:            data.timing,
      budget:              data.budget,
      description:         data.description,
      surface_m2:          parseFloat(data.surface || '0') || 0,
      contact_first_name:  data.prenom || '',
      contact_last_name:   data.nom || '',
      contact_email:       data.email,
      contact_phone:       data.telephone || '',
      project_phase: [
        ...(data.situationPhase   ? [data.situationPhase]   : []),
        ...(data.situationContext || []),
        ...(data.moePhase         ? [data.moePhase]         : []),
      ],
      intervention_type: data.interventionTypes || [],
      sampling_type:     data.accreditations    || [],
      site_access:       data.accessibility     || null,
      floor:             data.floor             || null,
      has_elevator:      data.elevator === 'oui',
      status:            'submitted',
    })
    .select('id').single()

  if (error) throw new Error(error.message || 'Erreur création devis.')
  return quote.id
}

// ─── Étape 4 : liaison types de service ───────────────────────────────────────

async function linkServiceTypes(
  supabase: SupabaseClient,
  quoteId: string,
  serviceTypes: string[],
): Promise<void> {
  if (serviceTypes.length === 0) return
  const { error } = await supabase.from('quote_service_types').insert(
    serviceTypes.map(sid => ({ quote_id: quoteId, service_type_id: sid }))
  )
  if (error) console.error('Erreur liaison services:', error.message)
}

// ─── Étape 5 : upload fichiers ────────────────────────────────────────────────

async function uploadQuoteFiles(
  supabase: SupabaseClient,
  quoteId: string,
  files: File[],
): Promise<void> {
  if (files.length === 0) return

  const uploadedPaths: string[] = []
  for (const file of files) {
    if (!ALLOWED_FILE_TYPES.test(file.type)) { console.warn('[upload] type rejeté:', file.type); continue }
    if (file.size > MAX_FILE_SIZE) { console.warn('[upload] fichier trop lourd:', file.name); continue }
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
    const safeName = `${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage
      .from('quote-documents')
      .upload(`${quoteId}/${safeName}`, file)
    if (!error) uploadedPaths.push(`${quoteId}/${safeName}`)
  }

  if (uploadedPaths.length > 0) {
    await supabase.from('quotes').update({ documents_url: uploadedPaths }).eq('id', quoteId)
  }
}

// ─── Orchestrateur public ─────────────────────────────────────────────────────

export const demandeService = {
  async submitDemande(
    data: DemandeFormData,
    files: File[],
    isLoggedIn: boolean,
    authMode: 'create' | 'login',
  ) {
    const supabase = createClient()
    let userId: string
    let submissionData = data

    if (isLoggedIn) {
      // L'utilisateur est déjà connecté : récupérer les vraies infos auth
      // (email/prenom/nom sont vides dans le formulaire quand connecté)
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) throw new Error('Session expirée. Veuillez vous reconnecter.')
      userId = user.id
      submissionData = {
        ...data,
        email:     user.email     || '',
        prenom:    user.user_metadata?.prenom    || '',
        nom:       user.user_metadata?.nom       || '',
        telephone: user.user_metadata?.telephone || '',
      }
    } else {
      userId = await resolveUserId(supabase, data, isLoggedIn, authMode)
    }

    const clientId = await resolveClientId(supabase, userId, submissionData)
    const quoteId  = await createQuote(supabase, clientId, submissionData)
    await linkServiceTypes(supabase, quoteId, submissionData.serviceTypes)
    await uploadQuoteFiles(supabase, quoteId, files)

    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.desamianteurs.com')

    // Notifier les partenaires assignés en vague 1 (non bloquant)
    fetch(`${baseUrl}/api/notifications/notify-partners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quoteId }),
    }).catch(err => console.error('[notify-partners]', err))

    // Envoi email de confirmation au client (non bloquant)
    fetch(`${baseUrl}/api/notifications/confirmation-demande`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prenom:      submissionData.prenom,
        email:       submissionData.email,
        service:     submissionData.serviceTypes?.join(', ') || '',
        type_bien:   submissionData.propertyType || '',
        ville:       submissionData.city || '',
        code_postal: submissionData.postalCode || '',
        delai:       submissionData.timing || '',
        ref_demande: quoteId,
      }),
    }).catch(err => console.error('[email confirmation]', err))

    return { success: true, quoteId }
  },
}
