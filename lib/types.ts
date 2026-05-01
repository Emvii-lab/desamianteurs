// Core Entities
export interface Client {
  id: string
  first_name: string | null
  last_name: string | null
  email?: string
}

export interface Partner {
  id: string
  company_name: string
  siret: string
  partner_type: string
  is_verified: boolean
  created_at: string
}

export interface Quote {
  id: string
  address_city: string
  address_postal_code: string
  client_type: string
  status: 'draft' | 'published' | 'closed'
  created_at: string
}

export interface Review {
  id: string
  rating: number
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

// Dashboard Specific Types
export interface AdminStats {
  users: number
  partners: number
  pending: number
  quotes: number
  reviews: number
}

export interface PendingPartner {
  id: string
  name: string
  siret: string
  type: string
  date: string
  docs: number
}

export interface PendingReview {
  id: string
  author: string
  target: string
  rating: number
  text: string
}

export interface DraftQuote {
  id: string
  city: string
  postalCode: string
  services: string
  created: string
  clientType: string
}

export interface ClientStats {
  demandes: number
  devisCount: number
  messages: number
  reviews: number
}

export interface ClientDemande {
  id: string
  title: string
  address: string
  type: string
  devis: number
  status: string
  statusColor: string
  statusText: string
}

export interface ClientDevis {
  id: string
  initials: string
  company: string
  city: string
  price: string
  rating: number
  color: string
}

// Form & Service Types
export interface ServiceType {
  id: string
  name: string
  description: string
  code: string
}

export interface PropertyType {
  id: string
  label: string
  category?: string
  code: string
}

export interface DemandeFormData {
  serviceTypes: string[]
  userType: string
  propertyType: string
  surface: string
  situationPhase: string
  situationContext: string[]
  interventionTypes: string[]
  moePhase: string
  accreditations: string[]
  timing: string
  budget: string
  addressSearch: string
  streetAddress: string
  city: string
  postalCode: string
  department: string
  complement: string
  accessibility: string
  floor: string
  elevator: string
  description: string
  // Auth/Contact
  prenom: string
  nom: string
  email: string
  telephone: string
  password?: string
  passwordConfirm?: string
  cgu: boolean
  notifs: boolean
}
