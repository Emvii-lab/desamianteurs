import { createClient } from '@/lib/supabase'
import { CATEGORY_MAP } from '@/lib/constants'
import { DemandeFormData } from '@/lib/types'

export const demandeService = {
  async submitDemande(data: DemandeFormData, files: File[], isLoggedIn: boolean, authMode: 'create' | 'login') {
    const supabase = createClient()
    let userId: string

    // 1. Auth
    if (!isLoggedIn) {
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
        userId = authData.user.id
      } else {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password!,
        })
        if (error) throw new Error(error.message || 'Identifiants incorrects.')
        if (!authData.user) throw new Error('Utilisateur non trouvé.')
        userId = authData.user.id
      }
    } else {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) throw new Error('Session expirée. Veuillez vous reconnecter.')
      userId = user.id
    }

    // 2. Récupère ou crée le profil client
    let clientId: string

    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (existing) {
      clientId = existing.id
    } else {
      const { data: newClient, error: clientErr } = await supabase
        .from('clients')
        .insert({
          user_id:     userId,
          first_name:  data.prenom || '',
          last_name:   data.nom || '',
          email:       data.email,
          phone:       data.telephone || '',
          client_type: CATEGORY_MAP[data.userType] || 'individual',
        })
        .select('id')
        .single()
      if (clientErr) throw new Error(clientErr.message || 'Erreur création profil client.')
      clientId = newClient.id
    }

    // 3. Crée le devis
    const { data: quote, error: quoteErr } = await supabase
      .from('quotes')
      .insert({
        client_id:            clientId,
        property_type_id:     data.propertyType,
        address_street:       data.streetAddress,
        address_complement:   data.complement,
        address_city:         data.city,
        address_postal_code:  data.postalCode,
        address_department:   data.postalCode?.startsWith('97')
          ? data.postalCode.substring(0, 3)
          : data.postalCode?.substring(0, 2) || null,
        client_type:          CATEGORY_MAP[data.userType] || 'individual',
        timeline:             data.timing,
        budget:               data.budget,
        description:          data.description,
        surface_m2:           parseFloat(data.surface || '0') || 0,
        contact_first_name:   data.prenom || '',
        contact_last_name:    data.nom || '',
        contact_email:        data.email,
        contact_phone:        data.telephone || '',
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
      .select('id')
      .single()

    if (quoteErr) throw new Error(quoteErr.message || 'Erreur création devis.')
    const finalQuoteId = quote.id

    // 4. Lie les types de service
    if (data.serviceTypes.length > 0) {
      const { error: servErr } = await supabase
        .from('quote_service_types')
        .insert(data.serviceTypes.map(sid => ({
          quote_id:        finalQuoteId,
          service_type_id: sid,
        })))
      if (servErr) console.error('Erreur liaison services:', servErr.message)
    }

    // 5. Upload des fichiers joints
    if (files.length > 0) {
      const uploadedPaths: string[] = []
      for (const file of files) {
        const path = `${finalQuoteId}/${file.name}`
        const { error: uploadErr } = await supabase.storage
          .from('quote-documents')
          .upload(path, file)
        if (!uploadErr) uploadedPaths.push(path)
      }
      if (uploadedPaths.length > 0) {
        await supabase
          .from('quotes')
          .update({ documents_url: uploadedPaths })
          .eq('id', finalQuoteId)
      }
    }

    return { success: true, quoteId: finalQuoteId }
  },
}
