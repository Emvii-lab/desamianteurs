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
  { label: 'Essentiel', zone: 'Au choix', leads: 'Illimité (restantes)', reception: 'Différé', engagement: 'Sans' },
  { label: 'Performance', zone: 'Au choix', leads: '5 simultanés', reception: '2ème vague', engagement: 'Sans' },
  { label: 'Premium', zone: 'Au choix', leads: 'Illimités', reception: '1ère vague - Temps réel', engagement: 'Sans' },
]

export const STEPS_PRICE = [
  { n: '01', title: 'Inscription', desc: 'SIRET, documents et certifications. Délai de dépôt : 7 jours.' },
  { n: '02', title: 'Cotisation', desc: 'Paiement de la cotisation annuelle à l\'association.' },
  { n: '03', title: 'Validation', desc: 'Vérification des documents par l\'équipe sous 5 jours ouvrés.' },
  { n: '04', title: 'Freemium', desc: 'Votre compte est activé. Vous recevez votre 1re affaire gratuitement.' },
  { n: '05', title: 'Abonnement', desc: 'Après le 1er contact, choisissez parmi les 3 formules. Adhésion à l\'association optionnelle.' },
]

export const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  submitted:  { bg: '#FEF3C7',                   color: '#D97706' },
  open:       { bg: 'rgba(52,211,153,0.1)',    color: '#059669' },
  in_progress:{ bg: 'rgba(52,211,153,0.1)',    color: '#059669' },
  closed:     { bg: 'var(--gray-100)',          color: 'var(--gray-400)' },
  cancelled:  { bg: 'var(--gray-100)',          color: 'var(--gray-400)' },
  published:  { bg: 'rgba(192,57,43,0.1)',      color: 'var(--red)' },
}

export const STATUS_LABEL: Record<string, string> = {
  submitted: 'Envoyée', open: 'En cours', in_progress: 'En cours', closed: 'Clôturée',
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

export const NAF_CODES: Record<string, string> = {
  '39.00Z': 'Dépollution et gestion des déchets',
  '41.10A': 'Promotion immobilière de logements',
  '41.20A': 'Construction de maisons individuelles',
  '41.20B': "Construction d'autres bâtiments",
  '43.11Z': 'Travaux de démolition',
  '43.12A': 'Travaux de terrassement courants et travaux préparatoires',
  '43.21A': "Travaux d'installation électrique dans tous locaux",
  '43.22A': "Travaux d'installation d'eau et de gaz",
  '43.22B': "Travaux d'installation d'équipements thermiques et de climatisation",
  '43.29A': "Travaux d'isolation",
  '43.29B': "Autres travaux d'installation",
  '43.31Z': 'Travaux de plâtrerie',
  '43.32A': 'Travaux de menuiserie bois et PVC',
  '43.33Z': 'Travaux de revêtement des sols et des murs',
  '43.34Z': 'Travaux de peinture et vitrerie',
  '43.39Z': 'Autres travaux de finition',
  '43.91A': 'Travaux de charpente',
  '43.91B': 'Travaux de couverture par éléments',
  '43.99A': "Travaux d'étanchéification",
  '43.99B': 'Travaux de montage de structures métalliques',
  '43.99C': 'Travaux de démolition',
  '43.99D': 'Autres travaux spécialisés de construction',
  '43.99E': 'Location avec opérateur de matériel de construction',
  '62.01Z': 'Programmation informatique',
  '62.02A': 'Conseil en systèmes et logiciels informatiques',
  '69.10Z': 'Activités juridiques',
  '69.20Z': 'Activités comptables',
  '70.22Z': 'Conseil pour les affaires et autres conseils de gestion',
  '71.11Z': "Activités d'architecture",
  '71.12B': 'Ingénierie, études techniques',
  '71.20A': 'Contrôle technique automobile',
  '71.20B': 'Analyses, essais et inspections techniques',
  '74.90B': 'Activités spécialisées diverses',
  '81.10Z': 'Activités combinées de soutien lié aux bâtiments',
}
