import type { Metadata } from 'next'
import LegalPage, { LegalSection, InfoBox, LegalList } from '@/components/ui/LegalPage'

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation | Désamianteurs.fr",
  description: "CGU de Désamianteurs.fr — marketplace de mise en relation amiante. Version 1.0 — Mars 2026.",
}

const TOC = [
  { id: 'art1',  label: 'Objet et champ d\'application' },
  { id: 'art2',  label: 'Inscription et création de compte' },
  { id: 'art3',  label: 'Description du service de mise en relation' },
  { id: 'art4',  label: 'Tarification et abonnements' },
  { id: 'art5',  label: 'Charte de bonne conduite' },
  { id: 'art6',  label: 'Avis et notations' },
  { id: 'art7',  label: 'Référencement et classement' },
  { id: 'art8',  label: 'Comportements interdits' },
  { id: 'art9',  label: 'Suspension et résiliation' },
  { id: 'art10', label: 'Responsabilité et garanties' },
  { id: 'art11', label: 'Droit applicable et litiges' },
  { id: 'art12', label: 'Modification des CGU' },
]

export default function CguPage() {
  return (
    <LegalPage
      tag="Légal"
      title="Conditions Générales d'Utilisation"
      meta="Marketplace B2B/B2C — Mise en relation amiante · Version 1.0 — Mars 2026"
      toc={TOC}
    >
      <LegalSection id="art1" title="Article 1 — Objet et champ d'application">
        <p>Les présentes CGU régissent l'accès et l'utilisation de la plateforme Désamianteurs.fr, place de marché numérique de mise en relation entre des clients ayant des besoins liés à l'amiante ou au plomb, et des professionnels certifiés du secteur.</p>
        <InfoBox><strong>Important :</strong> Tout accès implique l'acceptation sans réserve des présentes CGU.</InfoBox>
      </LegalSection>

      <LegalSection id="art2" title="Article 2 — Inscription et création de compte">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, marginTop: 0 }}>2.1 Compte CLIENT</h3>
        <p>Inscription gratuite. Email vérifié par lien d'activation. Informations requises : nom, prénom, email, téléphone, adresse postale.</p>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, marginTop: 14 }}>2.2 Compte PRO</h3>
        <p>Soumis à validation. Étapes : saisie du SIRET (vérification automatique via API INSEE), choix du type de professionnel, dépôt des documents de certification (délai 7 jours), validation admin sous 5 jours ouvrés.</p>
      </LegalSection>

      <LegalSection id="art3" title="Article 3 — Description du service">
        <p>Désamianteurs.fr agit en qualité d'intermédiaire de mise en relation. L'éditeur n'est pas partie aux contrats conclus entre Clients et Professionnels. Les Professionnels restent seuls responsables de la qualité, conformité réglementaire et exécution de leurs prestations.</p>
      </LegalSection>

      <LegalSection id="art4" title="Article 4 — Tarification et abonnements">
        <p>L'accès PRO est conditionné à un abonnement mensuel sans engagement (Essentiel, Performance ou Premium). La distribution des demandes suit un système de vagues prioritaires selon le niveau d'abonnement.</p>
        <p style={{ marginTop: 10 }}>Des frais de validation de dossier de <strong>80 € HT</strong> sont facturés à l'inscription, puis à chaque renouvellement de certifications.</p>
      </LegalSection>

      <LegalSection id="art5" title="Article 5 — Charte de bonne conduite">
        <p>Les Professionnels s'engagent à :</p>
        <LegalList items={[
          <span>Répondre à tout contact client dans un délai max de <strong>48h ouvrées</strong></span>,
          <span>Transmettre un devis sous <strong>5 jours ouvrés</strong></span>,
          'Maintenir leurs certifications à jour et les mettre à jour sur la plateforme',
          'Ne pas contourner le système d\'abonnement pour contacter les clients directement',
        ]} />
        <p style={{ marginTop: 10 }}>La charte complète est consultable sur la page <a href="/charte" style={{ color: 'var(--red)' }}>Charte de bonne conduite</a>.</p>
      </LegalSection>

      <LegalSection id="art6" title="Article 6 — Avis et notations">
        <p>Les avis clients sont soumis à modération avant publication. Seuls les clients ayant conclu une mission via la plateforme peuvent laisser un avis. Tout avis frauduleux ou complaisant entraîne sa suppression et une sanction de compte.</p>
      </LegalSection>

      <LegalSection id="art7" title="Article 7 — Référencement et classement">
        <p>Le classement des Professionnels tient compte du score de réactivité (temps de réponse), de la note de satisfaction client, du niveau d'abonnement et du nombre de missions réalisées. Ce classement détermine l'ordre de distribution des demandes.</p>
      </LegalSection>

      <LegalSection id="art8" title="Article 8 — Comportements interdits">
        <LegalList items={[
          'Fournir de fausses certifications ou des certifications expirées',
          'Contacter des clients hors plateforme avant une relation contractuelle établie',
          'Solliciter des avis en échange d\'avantages commerciaux',
          'Utiliser la plateforme à des fins concurrentielles ou de scraping',
          'Usurper l\'identité d\'un autre utilisateur',
        ]} />
      </LegalSection>

      <LegalSection id="art9" title="Article 9 — Suspension et résiliation">
        <p>L'éditeur se réserve le droit de suspendre ou résilier tout compte en cas de violation des présentes CGU, sans préavis en cas de faute grave. La résiliation volontaire est possible à tout moment avec un préavis de 30 jours.</p>
      </LegalSection>

      <LegalSection id="art10" title="Article 10 — Responsabilité et garanties">
        <p>Désamianteurs.fr est une plateforme de mise en relation et n'est pas responsable de la qualité des prestations réalisées, des relations contractuelles entre utilisateurs, ni des dommages résultant de l'utilisation de la plateforme. La plateforme ne garantit pas un volume minimum de demandes.</p>
      </LegalSection>

      <LegalSection id="art11" title="Article 11 — Droit applicable et litiges">
        <p>Les présentes CGU sont soumises au droit français. En cas de litige, les parties privilégient une résolution amiable. À défaut, les juridictions françaises sont seules compétentes.</p>
      </LegalSection>

      <LegalSection id="art12" title="Article 12 — Modification des CGU">
        <p>L'éditeur se réserve le droit de modifier les présentes CGU à tout moment. Toute modification sera notifiée par email avec un préavis de <strong>30 jours</strong>. La poursuite de l'utilisation vaut acceptation des nouvelles dispositions.</p>
        <p style={{ marginTop: 10, fontStyle: 'italic', color: 'var(--gray-400)', fontSize: 13 }}>Pour toute question : <strong>contact@desamianteurs.fr</strong></p>
      </LegalSection>
    </LegalPage>
  )
}
