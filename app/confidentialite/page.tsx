import type { Metadata } from 'next'
import LegalPage, { LegalSection, InfoBox, LegalList, LegalTable } from '@/components/ui/LegalPage'

export const metadata: Metadata = {
  title: 'Politique de confidentialité | Désamianteurs.fr',
  description: 'Politique de confidentialité et traitement des données personnelles conforme au RGPD — Désamianteurs.fr.',
}

const TOC = [
  { id: 'qui',          label: 'Qui sommes-nous ?' },
  { id: 'donnees',      label: 'Données collectées et finalités' },
  { id: 'destinataires','label': 'Destinataires des données' },
  { id: 'transferts',   label: 'Transferts hors Union Européenne' },
  { id: 'droits',       label: 'Vos droits' },
  { id: 'cookies',      label: 'Cookies' },
  { id: 'securite',     label: 'Sécurité des données' },
  { id: 'contact',      label: 'Contact' },
]

export default function ConfidentialitePage() {
  return (
    <LegalPage
      tag="RGPD"
      title="Politique de Confidentialité"
      meta="Conforme au Règlement UE 2016/679 (RGPD) · Version 1.0 — Mars 2026"
      toc={TOC}
    >
      <LegalSection id="qui" title="1. Qui sommes-nous ?">
        <p>Désamianteurs.fr est une plateforme de mise en relation spécialisée dans le secteur de l'amiante et du plomb. Responsable de traitement : <em>[raison sociale à compléter après immatriculation]</em>.</p>
        <p style={{ marginTop: 8 }}>Email RGPD : <strong>rgpd@desamianteurs.fr</strong></p>
      </LegalSection>

      <LegalSection id="donnees" title="2. Données collectées et finalités">
        <LegalTable
          headers={['Contexte', 'Données collectées', 'Base légale', 'Conservation']}
          rows={[
            ['Inscription Client', 'Nom, prénom, email, téléphone, adresse', 'Exécution du contrat (art. 6.1.b)', '3 ans après dernière activité'],
            ['Inscription PRO', 'Données entreprise, SIRET, certifications, RC Pro', 'Contrat + obligation légale (art. 6.1.b et c)', 'Durée abonnement + 3 ans'],
            ['Demandes de devis', 'Description, adresse du bien, photos, délai, budget', 'Exécution du contrat (art. 6.1.b)', '3 ans après clôture'],
            ['Messagerie', 'Contenu des messages', 'Intérêt légitime (art. 6.1.f)', '3 ans après clôture'],
            ['Cookies / navigation', 'IP, pages visitées, durée de session', 'Consentement (art. 6.1.a)', '13 mois maximum'],
            ['Logs techniques', 'Connexions, erreurs, IP', 'Obligation légale + sécurité', '12 mois'],
          ]}
        />
      </LegalSection>

      <LegalSection id="destinataires" title="3. Destinataires des données">
        <LegalList items={[
          "L'équipe interne Désamianteurs.fr (accès limité selon le rôle)",
          'Supabase Inc. — hébergeur base de données (DPA signé, données en Europe)',
          'Vercel Inc. — hébergeur du site web',
          'n8n (OVH) — automatisation email (données transitoires)',
          'Les Professionnels, pour les seules données nécessaires à la mise en relation',
        ]} />
        <InfoBox><strong>Aucune donnée n'est vendue ou cédée à des tiers à des fins commerciales.</strong></InfoBox>
      </LegalSection>

      <LegalSection id="transferts" title="4. Transferts hors UE">
        <p>Données hébergées en Europe (Supabase AWS eu-west-3 Paris, OVH Roubaix). Vercel peut traiter certaines métadonnées aux États-Unis — soumis au Data Privacy Framework UE-États-Unis.</p>
      </LegalSection>

      <LegalSection id="droits" title="5. Vos droits">
        <LegalTable
          headers={['Droit', 'Description']}
          rows={[
            [<strong>Accès</strong>, 'Obtenir une copie de toutes vos données personnelles'],
            [<strong>Rectification</strong>, 'Corriger des données inexactes ou incomplètes'],
            [<strong>Effacement</strong>, 'Demander la suppression de votre compte et de vos données'],
            [<strong>Portabilité</strong>, 'Recevoir vos données dans un format structuré lisible par machine'],
            [<strong>Opposition</strong>, 'S\'opposer au traitement pour des raisons particulières'],
            [<strong>Réclamation CNIL</strong>, 'Déposer une plainte sur cnil.fr — 3 Place de Fontenoy, 75007 Paris'],
          ]}
        />
        <p style={{ marginTop: 12 }}>Pour exercer vos droits : <strong>rgpd@desamianteurs.fr</strong> — Délai de réponse : 30 jours maximum.</p>
      </LegalSection>

      <LegalSection id="cookies" title="6. Cookies">
        <p>Le site utilise uniquement des cookies strictement nécessaires à son fonctionnement. Aucun cookie de tracking publicitaire ou analytique tiers n'est déposé.</p>
        <LegalTable
          headers={['Cookie', 'Finalité', 'Durée', 'Consentement']}
          rows={[
            ['sb-access-token', 'Session d\'authentification Supabase (JWT)', 'Durée de session', 'Non requis'],
            ['sb-refresh-token', 'Renouvellement de session Supabase', '1 an', 'Non requis'],
            ['__Host-next-auth', 'Sécurité CSRF des formulaires Next.js', 'Session', 'Non requis'],
          ]}
        />
        <InfoBox color="#059669" bg="#F0FDF4" border="#BBF7D0">
          Ces cookies sont <strong>strictement nécessaires</strong> au fonctionnement du service et ne peuvent pas être désactivés. Conformément à la doctrine CNIL, ils ne requièrent pas de consentement préalable.
        </InfoBox>
      </LegalSection>

      <LegalSection id="securite" title="7. Sécurité des données">
        <LegalList items={[
          'Chiffrement HTTPS/TLS sur l\'ensemble des communications',
          'Authentification sécurisée via Supabase Auth (JWT)',
          'Row Level Security (RLS) activé sur toutes les tables Supabase',
          'Mots de passe hachés (bcrypt) — jamais stockés en clair',
          'Sauvegardes automatiques quotidiennes',
        ]} />
      </LegalSection>

      <LegalSection id="contact" title="8. Contact et réclamations">
        <LegalList items={[
          <span>Email RGPD : <strong>rgpd@desamianteurs.fr</strong></span>,
          'En cas de violation de données : notification CNIL dans les 72h (art. 33 RGPD)',
        ]} />
      </LegalSection>
    </LegalPage>
  )
}
