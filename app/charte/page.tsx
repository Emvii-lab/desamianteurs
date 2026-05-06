import type { Metadata } from 'next'
import LegalPage, { LegalSection, InfoBox, LegalList, LegalTable } from '@/components/ui/LegalPage'

export const metadata: Metadata = {
  title: 'Charte de bonne conduite | Désamianteurs.fr',
  description: 'Charte de bonne conduite applicable à tous les professionnels référencés sur Désamianteurs.fr.',
}

const TOC = [
  { id: 'art1', label: 'Exactitude des informations' },
  { id: 'art2', label: 'Certifications et conformité réglementaire' },
  { id: 'art3', label: 'Délais de réponse et de traitement' },
  { id: 'art4', label: 'Qualité des prestations' },
  { id: 'art5', label: 'Comportement sur la Plateforme' },
  { id: 'art6', label: 'Notation et système d\'évaluation' },
  { id: 'art7', label: 'Sanctions' },
  { id: 'art8', label: 'Acceptation et entrée en vigueur' },
]

export default function ChartePage() {
  return (
    <LegalPage
      tag="Professionnels"
      tagColor="#6C3483"
      tagBg="#F4ECF7"
      title="Charte de Bonne Conduite"
      meta="Applicable à tous les professionnels référencés sur Désamianteurs.fr · Version 1.0 — Mars 2026"
      toc={TOC}
    >
      {/* Préambule */}
      <div style={{ background: '#F4ECF7', borderLeft: '3px solid #6C3483', borderRadius: '0 8px 8px 0', padding: '14px 18px', marginBottom: 20, fontSize: 13, color: '#111', lineHeight: 1.7 }}>
        La présente Charte définit les engagements que tout Professionnel s'engage à respecter en s'inscrivant sur Désamianteurs.fr. Elle constitue une annexe aux CGU et fait partie intégrante du contrat. Elle est acceptée par le Professionnel lors de la création de son compte.
      </div>

      <LegalSection id="art1" title="Article 1 — Exactitude des informations">
        <LegalList items={[
          'Le Professionnel s\'engage à fournir des informations exactes, complètes et à jour sur son profil (identité, SIRET, zone d\'intervention, types de prestations).',
          <span>Toute modification de situation (changement d'adresse, cessation d'activité, modification des certifications) doit être communiquée dans un délai de <strong>15 jours</strong>.</span>,
          'Il est interdit de mentionner des certifications non obtenues ou expirées.',
        ]} />
      </LegalSection>

      <LegalSection id="art2" title="Article 2 — Certifications et conformité réglementaire">
        <LegalList items={[
          'Le Professionnel garantit détenir, à tout moment, les certifications réglementaires requises pour les prestations proposées sur son profil.',
          <span>Les documents de certification doivent être téléversés dans l'espace dédié dans un délai de <strong>7 jours</strong> après inscription.</span>,
          'En cas d\'expiration d\'une certification, le Professionnel informe la Plateforme immédiatement. Le profil est suspendu jusqu\'au renouvellement.',
          'La Plateforme peut vérifier automatiquement la certification Qualibat 1552 via l\'API Entreprise. Le Professionnel autorise expressément cette vérification.',
        ]} />
        <InfoBox color="#92400E" bg="#FFFBEB" border="#FDE68A">
          <strong>Rappel réglementaire :</strong> La certification Qualibat 1552 est obligatoire depuis 2022 pour toute intervention SS3. Les diagnostiqueurs doivent être certifiés COFRAC. Les laboratoires doivent être accrédités COFRAC. Les MOE doivent disposer d'une RC Pro spécifique MOE désamiantage.
        </InfoBox>
      </LegalSection>

      <LegalSection id="art3" title="Article 3 — Délais de réponse et de traitement">
        <LegalTable
          headers={['Engagement', 'Délai maximum', 'Conséquence en cas de dépassement']}
          rows={[
            ['Accusé de réception d\'un contact', <strong>48 heures ouvrées</strong>, 'Relance automatique J+3 · impact note délais'],
            ['Envoi d\'un devis', <strong>5 jours ouvrés</strong>, 'Relance automatique · impact note délais'],
            ['Redémarrage contact sans réponse', <strong>Automatique à J+3</strong>, 'Notification PRO + réactivation du contact'],
            ['Mise à jour statut d\'une demande', <strong>48h après changement</strong>, 'Rappel automatique'],
          ]}
        />
        <p style={{ marginTop: 12 }}>Ces délais sont suivis automatiquement par la plateforme et entrent dans le calcul de la note délais visible sur le profil public.</p>
      </LegalSection>

      <LegalSection id="art4" title="Article 4 — Qualité des prestations">
        <LegalList items={[
          'Le Professionnel réalise ses prestations dans le respect des règles de l\'art et de la réglementation en vigueur (Code du travail, Code de la santé publique, Code de l\'environnement).',
          'Il maintient ses salariés formés conformément à la réglementation (formations SS3/SS4 à jour).',
          'Il garantit disposer d\'une assurance Responsabilité Civile Professionnelle couvrant ses activités référencées sur la Plateforme.',
        ]} />
      </LegalSection>

      <LegalSection id="art5" title="Article 5 — Comportement sur la Plateforme">
        <LegalList items={[
          'Traiter les Clients avec professionnalisme, courtoisie et honnêteté.',
          <span>Il est <strong>interdit</strong> de contacter les Clients hors de la Plateforme avant qu'une relation contractuelle hors-ligne soit établie, dans le but de contourner le système d'abonnement.</span>,
          <span>Il est <strong>interdit</strong> de solliciter des avis positifs en échange d'une remise ou d'un avantage commercial.</span>,
          <span>Il est <strong>interdit</strong> de déposer des avis sur d'autres Professionnels référencés sur la Plateforme.</span>,
        ]} />
      </LegalSection>

      <LegalSection id="art6" title="Article 6 — Notation et système d'évaluation">
        <p>Les Professionnels sont notés par les Clients sur plusieurs critères :</p>
        <LegalList items={[
          'Qualité de la prestation (1 à 5 étoiles)',
          'Délai de réponse au contact (calculé automatiquement)',
          'Délai de remise de devis (calculé automatiquement)',
          'Communication et suivi (1 à 5 étoiles)',
        ]} />
        <p style={{ marginTop: 10 }}>Un Professionnel obtenant une note moyenne inférieure à <strong>3/5 sur les délais pendant 3 mois consécutifs</strong> recevra un avertissement. En dessous de 2/5, son compte sera suspendu.</p>
      </LegalSection>

      <LegalSection id="art7" title="Article 7 — Sanctions">
        <LegalTable
          headers={['Manquement', 'Sanction applicable']}
          rows={[
            ['Non-dépôt des documents dans les 7 jours', 'Rappel automatique puis suspension du profil jusqu\'au dépôt'],
            ['Certification expirée non renouvelée', 'Suspension immédiate du profil'],
            ['Note délais < 2/5 sur 3 mois consécutifs', 'Avertissement puis suspension'],
            ['Fraude, fausse certification, comportement abusif', 'Résiliation immédiate sans remboursement + signalement si nécessaire'],
            ['Contournement du système d\'abonnement', 'Résiliation immédiate + pénalité contractuelle'],
          ]}
        />
      </LegalSection>

      <LegalSection id="art8" title="Article 8 — Acceptation et entrée en vigueur">
        <p>La présente Charte est acceptée par le Professionnel lors de la création de son compte, par validation d'une case à cocher explicite. Elle est opposable dès l'activation du compte.</p>
        <p style={{ marginTop: 10 }}>L'éditeur se réserve le droit de modifier la présente Charte avec un préavis de <strong>30 jours</strong> par email. La poursuite de l'utilisation de la Plateforme après ce délai vaut acceptation des nouvelles dispositions.</p>
      </LegalSection>
    </LegalPage>
  )
}
