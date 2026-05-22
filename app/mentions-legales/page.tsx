import type { Metadata } from 'next'
import LegalPage, { LegalSection, LegalTable, InfoBox } from '@/components/ui/LegalPage'

export const metadata: Metadata = {
  title: 'Mentions légales | Désamianteurs.fr',
  description: 'Mentions légales de Désamianteurs.fr, conformes à la LCEN et à la loi SREN du 21 mai 2024.',
}

const TOC = [
  { id: 'editeur',    label: "Éditeur du site" },
  { id: 'hebergeur',  label: "Hébergeur des pages web" },
  { id: 'donnees',    label: "Hébergeur des données (loi SREN 2024)" },
  { id: 'pi',         label: "Propriété intellectuelle" },
  { id: 'responsabilite', label: "Responsabilité" },
  { id: 'mediation',  label: "Médiation des litiges" },
]

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      tag="Légal"
      title="Mentions légales"
      meta="Conformes à la LCEN et à la loi SREN du 21 mai 2024 · Mise à jour : mars 2026"
      toc={TOC}
    >
      <LegalSection id="editeur" title="1. Éditeur du site">
        <LegalTable
          headers={['Information', 'Valeur']}
          rows={[
            ['Nom / Raison sociale',    '[À compléter après création de la structure]'],
            ['Forme juridique',         '[Auto-entrepreneur / SASU / EURL]'],
            ['SIRET',                   '[À compléter après immatriculation]'],
            ['Adresse du siège',        '[À compléter]'],
            ['Email de contact',        'contact@desamianteurs.fr'],
            ['Directeur de publication','Mélanie VOYMANT'],
          ]}
        />
      </LegalSection>

      <LegalSection id="hebergeur" title="2. Hébergeur des pages web">
        <LegalTable
          headers={['Société', 'Adresse', 'Site']}
          rows={[
            [<strong>Vercel Inc.</strong>, '340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis', 'vercel.com'],
          ]}
        />
      </LegalSection>

      <LegalSection id="donnees" title="3. Hébergeur des données (loi SREN du 21 mai 2024)">
        <p>Conformément à la loi n° 2024-449 du 21 mai 2024 (SREN), les hébergeurs des données traitées sur la plateforme sont :</p>
        <LegalTable
          headers={['Service', 'Société', 'Données hébergées']}
          rows={[
            ['Base de données', 'Supabase Inc. (AWS eu-west-3, Paris)', 'Données utilisateurs, demandes, messages, certifications'],
            ['Fichiers / documents', 'Supabase Storage (AWS eu-west-3, Paris)', 'Documents de certification uploadés par les PRO'],
            ['Automatisation emails', 'n8n (OVH VPS, Roubaix, France)', "Données transitoires pour envoi d’emails automatiques"],
          ]}
        />
        <InfoBox>
          <strong>Données en Europe :</strong> Les données personnelles sont stockées sur des serveurs AWS situés en Europe (région eu-west-3, Paris). Aucun transfert hors Union Européenne.
        </InfoBox>
      </LegalSection>

      <LegalSection id="pi" title="4. Propriété intellectuelle">
        <p>L'ensemble des contenus du site Désamianteurs.fr (textes, graphismes, logos, icônes, images, architecture) est la propriété exclusive de l'éditeur ou de ses partenaires, protégé par le droit de la propriété intellectuelle. Toute reproduction sans accord préalable écrit est interdite.</p>
      </LegalSection>

      <LegalSection id="responsabilite" title="5. Responsabilité">
        <p>Désamianteurs.fr est une plateforme de mise en relation. L'éditeur ne peut être tenu responsable de la qualité des prestations réalisées par les professionnels référencés, ni des relations contractuelles nouées entre les utilisateurs.</p>
      </LegalSection>

      <LegalSection id="mediation" title="6. Médiation des litiges">
        <p>En cas de litige non résolu à l'amiable, recours possible auprès du Centre de médiation et d'arbitrage de Paris (CMAP) — <a href="https://www.cmap.fr" style={{ color: 'var(--red)' }}>www.cmap.fr</a></p>
      </LegalSection>
    </LegalPage>
  )
}
