import { 
  Search, Layers, Wrench, Shield, Home, FlaskConical, 
  AlertCircle, BookCopy, Microscope 
} from 'lucide-react'

export const ICON_MAP: Record<string, any> = {
  diagnostic_amiante: Search,
  moe_amiante_plomb: BookCopy,
  intervention_ss4: Wrench,
  mise_en_securite: Shield,
  desamiantage: Home,
  preleveur_air_materiaux: Microscope,
  conseil_juridique: Search,
}

export const SITUATIONS_PHASE = [
  { id: 'pre_sale',       label: 'Avant vente ou location' },
  { id: 'pre_works',      label: 'Avant travaux' },
  { id: 'pre_demolition', label: 'Avant démolition' },
]

export const SITUATIONS_CONTEXT = [
  { id: 'during_works', label: 'Pendant chantier' },
  { id: 'post_works',   label: 'Après travaux' },
  { id: 'emergency',    label: 'Urgence' },
]

export const TIMINGS = [
  { id: 'emergency',        label: 'Urgent' },
  { id: 'within_1_month',   label: 'Sous 1 mois' },
  { id: 'within_3_months',  label: 'Sous 3 mois' },
  { id: 'over_3_months',    label: '+ 3 mois' },
]

export const BUDGET_OPTIONS = [
  { id: 'under_1000',   label: 'Moins de 1 000 €' },
  { id: '1000_5000',    label: '1 000 — 5 000 €' },
  { id: '5000_20000',   label: '5 000 — 20 000 €' },
  { id: '20000_50000',  label: '20 000 — 50 000 €' },
  { id: 'over_50000',   label: 'Plus de 50 000 €' },
  { id: 'undefined',    label: 'Je ne sais pas encore' },
]

export const ACCESSIBILITY_OPTIONS = [
  { id: 'free_access',    label: 'Libre accès' },
  { id: 'by_appointment', label: 'Sur rendez-vous' },
  { id: 'digicode',       label: 'Digicode' },
]

export const FLOOR_OPTIONS = [
  { id: 'ground_floor',     label: 'Rez-de-chaussée' },
  { id: 'floor_1',          label: '1er étage' },
  { id: 'floor_2',          label: '2ème étage' },
  { id: 'floor_3',          label: '3ème étage' },
  { id: 'floor_4_and_above',label: '4ème étage et +' },
  { id: 'attic',            label: 'Comble' },
  { id: 'basement',         label: 'Sous-sol' },
]

export const ELEVATOR_OPTIONS = [
  { id: 'oui', label: 'Oui' },
  { id: 'non', label: 'Non' },
]

export const USER_TYPES = ['Particulier', 'Professionnel privé', 'Public / collectivité']

export const CATEGORY_MAP: Record<string, string> = {
  'Particulier':           'individual',
  'Professionnel privé':   'private_professional',
  'Public / collectivité': 'public_authority',
}

export const AVATAR_COLORS = ['#C0392B','#2C3E50','#7D3C98','#1E3A5F','#27AE60','#2E86AB','#E67E22']

export const TYPE_LABEL: Record<string, string> = {
  asbestos_remover: 'Désamianteur',
  diagnostician: 'Diagnostiqueur',
  sampler_lab: 'Préleveur / Labo',
  project_manager: 'MOE / AMO',
  legal_expert: 'Expert juridique',
  specialized_lawyer: 'Avocat spécialisé',
}

export const PLANS = [
  {
    id: 'essentiel', name: 'ESSENTIEL', price: '49', period: '/mois',
    features: [
      { category: 'VISIBILITÉ & MATCHING', items: ['Présence dans l\'annuaire interne', 'Accès aux demandes restantes'] },
      { category: 'RÉCEPTION DES DEMANDES', items: [{ text: 'Différé', disabled: true }] },
    ],
    cta: 'Choisir Essentiel', ctaStyle: 'btn-outline',
  },
  {
    id: 'performance', name: 'PERFORMANCE', price: '99', period: '/mois',
    features: [
      { category: 'VISIBILITÉ & MATCHING', items: ['Mise en avant régionale', 'Accès 2ème vague'] },
      { category: 'ZONE & DEMANDES', items: ['Quota de 5 dossiers simultanés'] },
      { category: 'RÉCEPTION DES DEMANDES', items: [{ text: '2ème vague', success: true, badge_text: 'Prioritaire' }] },
    ],
    cta: 'Choisir Performance', ctaStyle: 'btn-outline',
  },
  {
    id: 'premium', name: 'PREMIUM', price: '219', period: '/mois',
    tag: 'Le plus populaire', highlight: true,
    features: [
      { category: 'VISIBILITÉ & MATCHING', items: ['Visibilité prioritaire', 'Priorité dans l\'algorithme'] },
      { category: 'ZONE & DEMANDES', items: ['Dossiers illimités'] },
      { category: 'RÉCEPTION DES DEMANDES', items: [{ text: 'Temps réel - 1ère Vague', success: true, badge_text: 'Temps réel', badge: 'En tête de liste pour chaque nouvelle demande' }] },
    ],
    cta: 'Choisir Premium', ctaStyle: 'btn-red',
  },
]

export const COMPARISON = [
  { label: 'Freemium', zone: '—', leads: '1 affaire', reception: '—', engagement: 'Sans' },
  { label: 'Essentiel', zone: '1', leads: 'Illimité (restantes)', reception: 'Différé', engagement: '3 mois' },
  { label: 'Performance', zone: '3', leads: '5 simultanés', reception: '2ème vague', engagement: '3 mois' },
  { label: 'Premium', zone: 'Illimité', leads: 'Illimités', reception: '1ère vague - Temps réel', engagement: '3 mois' },
]

export const STEPS_PRICE = [
  { n: '01', title: 'Inscription', desc: 'SIRET, documents et certifications. Délai de dépôt : 7 jours.' },
  { n: '02', title: 'Cotisation', desc: 'Paiement de la cotisation annuelle à l\'association.' },
  { n: '03', title: 'Validation', desc: 'Vérification des documents par l\'équipe sous 5 jours ouvrés.' },
  { n: '04', title: 'Freemium', desc: 'Votre compte est activé. Vous recevez votre 1re affaire gratuitement.' },
  { n: '05', title: 'Abonnement', desc: 'Après le 1er contact, choisissez parmi les 3 formules. Adhésion à l\'association optionnelle.' },
]

export const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  open:       { bg: 'rgba(52,211,153,0.1)',    color: '#059669' },
  in_progress:{ bg: 'rgba(52,211,153,0.1)',    color: '#059669' },
  closed:     { bg: 'var(--gray-100)',          color: 'var(--gray-400)' },
  cancelled:  { bg: 'var(--gray-100)',          color: 'var(--gray-400)' },
  published:  { bg: 'rgba(192,57,43,0.1)',      color: 'var(--red)' },
}

export const STATUS_LABEL: Record<string, string> = {
  open: 'En cours', in_progress: 'En cours', closed: 'Clôturée',
  cancelled: 'Annulée', published: 'Publiée',
}

export const INSCRIPTION_CLIENT_TYPES = [
  { id: 'individual',           label: 'Particulier' },
  { id: 'private_professional', label: 'Professionnel privé' },
  { id: 'public_authority',     label: 'Public / collectivité' },
]

export const INSCRIPTION_PARTNER_TYPES = [
  { id: 'diagnostician',     label: 'Diagnostiqueur' },
  { id: 'project_manager',   label: 'Maître d\'oeuvre (MOE)' },
  { id: 'asbestos_remover',  label: 'Désamianteur' },
  { id: 'sampler_lab',       label: 'Préleveur / Laboratoire' },
  { id: 'legal_expert',      label: 'Expert judiciaire' },
  { id: 'specialized_lawyer', label: 'Avocat – conseil spécialisé' },
]

export const NEEDS_SIRET = ['private_professional', 'public_authority', 'diagnostician', 'project_manager', 'asbestos_remover', 'sampler_lab', 'legal_expert', 'specialized_lawyer']

export const INTERVENTION_TYPES_SS3 = [
  { id: 'interior', label: 'Intérieur' },
  { id: 'exterior', label: 'Extérieur' },
  { id: 'civil_engineering', label: 'Génie civil' },
  { id: 'polluted_soils', label: 'Terres polluées' },
]

export const PHASES_MOE = [
  { id: 'conception', label: 'Conception' },
  { id: 'consultation', label: 'Consultation' },
  { id: 'realisation', label: 'Réalisation' },
]

export const ACCREDITATIONS_LABO = [
  { id: 'air', label: 'Air' },
  { id: 'materiaux', label: 'Matériaux' },
  { id: 'plomb', label: 'Plomb' },
  { id: 'strategie', label: 'Stratégie d\'échantillonnage' },
]
