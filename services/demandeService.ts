import { createClient } from '@/lib/supabase'
import { CATEGORY_MAP } from '@/lib/constants'
import { DemandeFormData } from '@/lib/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const demandeService = {
  async submitDemande(data: DemandeFormData, files: File[], isLoggedIn: boolean, authMode: 'create' | 'login') {
    let currentUser: any = null
    let accessToken: string | null = null

    // 1. Auth Handling
    if (!isLoggedIn) {
      if (authMode === 'create') {
        const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            data: {
              prenom: data.prenom,
              nom: data.nom,
              telephone: data.telephone,
              client_type: CATEGORY_MAP[data.userType] || 'individual'
            }
          })
        })

        const authResult = await response.json()
        if (!response.ok) {
          if (authResult.msg?.includes("already registered")) {
            // Proceed to check if we can get a session or if they should login
            throw new Error("Cet email est déjà enregistré. Veuillez vous connecter.")
          } else {
            throw new Error(authResult.msg || "Erreur d'inscription")
          }
        }

        currentUser = authResult.user
        accessToken = authResult.session?.access_token
      } else {
        const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          })
        })

        const authResult = await response.json()
        if (!response.ok) throw new Error(authResult.error_description || authResult.msg || "Erreur de connexion")

        currentUser = authResult.user
        accessToken = authResult.access_token
      }
    } else {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      currentUser = session?.user
      accessToken = session?.access_token || null
    }

    if (!currentUser || !accessToken) throw new Error('Utilisateur non identifié.')

    // 2. Get/Create Client Profile
    let clientId: string | null = null
    
    const checkRes = await fetch(`${supabaseUrl}/rest/v1/clients?user_id=eq.${currentUser.id}&select=id`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessToken}` }
    })
    const checkData = await checkRes.json()
    
    if (checkData && checkData.length > 0) {
      clientId = checkData[0].id
    } else {
      const createRes = await fetch(`${supabaseUrl}/rest/v1/clients`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          first_name: data.prenom || '',
          last_name: data.nom || '',
          email: data.email || currentUser.email,
          phone: data.telephone || '',
          client_type: CATEGORY_MAP[data.userType] || 'individual'
        })
      })
      const newData = await createRes.json()
      if (!createRes.ok) throw new Error(newData.message || "Erreur profil client")
      clientId = newData[0].id
    }

    // 3. Create Quote
    const quoteRes = await fetch(`${supabaseUrl}/rest/v1/quotes`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        client_id: clientId,
        property_type_id: data.propertyType,
        address_street: data.streetAddress,
        address_complement: data.complement,
        address_city: data.city,
        address_postal_code: data.postalCode,
        address_department: data.postalCode?.startsWith('97') ? data.postalCode.substring(0, 3) : data.postalCode?.substring(0, 2) || null,
        client_type: CATEGORY_MAP[data.userType] || 'individual',
        timeline: data.timing,
        budget: data.budget,
        description: data.description,
        surface_m2: parseFloat(data.surface || '0') || 0,
        contact_first_name: data.prenom || '',
        contact_last_name: data.nom || '',
        contact_email: data.email || currentUser.email,
        contact_phone: data.telephone || '',
        project_phase: [
          ...(data.situationPhase ? [data.situationPhase] : []),
          ...(data.situationContext || []),
          ...(data.moePhase ? [data.moePhase] : [])
        ],
        intervention_type: data.interventionTypes || [],
        sampling_type: data.accreditations || [],
        site_access: data.accessibility || null,
        floor: data.floor || null,
        has_elevator: data.elevator === 'oui',
        status: 'submitted'
      })
    })
    
    const quoteData = await quoteRes.json()
    if (!quoteRes.ok) throw new Error(quoteData.message || "Erreur création devis")
    const finalQuoteId = quoteData[0].id

    // 4. Link Services
    if (data.serviceTypes.length > 0) {
      await fetch(`${supabaseUrl}/rest/v1/quote_service_types`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data.serviceTypes.map(sid => ({
          quote_id: finalQuoteId,
          service_type_id: sid
        })))
      })
    }

    // 5. Upload Files
    if (files.length > 0) {
      const uploadedPaths: string[] = []
      for (const file of files) {
        const filePath = `${finalQuoteId}/${file.name}`
        const storageRes = await fetch(`${supabaseUrl}/storage/v1/object/quote-documents/${filePath}`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${accessToken}`,
          },
          body: file
        })

        if (storageRes.ok) {
          uploadedPaths.push(filePath)
        }
      }

      if (uploadedPaths.length > 0) {
        await fetch(`${supabaseUrl}/rest/v1/quotes?id=eq.${finalQuoteId}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ documents_url: uploadedPaths })
        })
      }
    }

    return { success: true, quoteId: finalQuoteId }
  }
}
