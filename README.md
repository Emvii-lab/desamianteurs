# Désamianteurs.com — Documentation technique complète

> Plateforme de mise en relation entre clients et professionnels certifiés du secteur amiante/plomb.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack technique](#2-stack-technique)
3. [Architecture du projet](#3-architecture-du-projet)
4. [Carte des routes](#4-carte-des-routes)
5. [Base de données Supabase](#5-base-de-données-supabase)
6. [Authentification & rôles](#6-authentification--rôles)
7. [Flux utilisateurs clés](#7-flux-utilisateurs-clés)
8. [Intégration Stripe](#8-intégration-stripe)
9. [Stockage de fichiers](#9-stockage-de-fichiers)
10. [Variables d'environnement](#10-variables-denvironnement)
11. [Installation locale](#11-installation-locale)
12. [Déploiement Vercel](#12-déploiement-vercel)
13. [Conventions de code](#13-conventions-de-code)

---

## 1. Vue d'ensemble

Désamianteurs.com est une marketplace B2B/B2C spécialisée dans le secteur amiante et plomb en France. La plateforme connecte :

- **Clients** (particuliers, professionnels, public / collectivités) qui soumettent des demandes de devis
- **Partenaires** (désamianteurs, diagnostiqueurs, laboratoires, MOE, avocats, expert judiciaire) qui répondent aux demandes
- **Administrateurs** qui modèrent la plateforme, valident les profils et publient les demandes

### Modèle de distribution des demandes (algorithme)

Les demandes sont distribuées en **3 vagues prioritaires** :
- **Vague 1** — Premium (+ exceptions Performance via score de réactivité)
- **Vague 2** — Performance
- **Vague 3** — Essentiel (accès libre aux demandes non traitées)

Le **score de réactivité** (0–24 pts) est calculé sur les 10–20 derniers dossiers. Répondre dans les premières heures maximise le score.

---

## 2. Stack technique

| Couche | Technologie | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.4 |
| UI | React | 19.2.4 |
| Langage | TypeScript | 5 |
| Styles | TailwindCSS + inline styles | 4 |
| Animations | Framer Motion | 12.38.0 |
| Base de données | Supabase (PostgreSQL 17) | — |
| Auth | Supabase Auth (GoTrue v2) | — |
| Stockage | Supabase Storage (S3) | — |
| Temps réel | Supabase Realtime (WebSocket) | — |
| Paiements | Stripe | 22.1.0 |
| Cartographie | Google Maps API + @vis.gl/react-google-maps | 1.8.3 |
| Géocodage | API Adresse data.gouv.fr | — |
| Formulaires | React Hook Form + Zod | 7.74 / 4.4 |
| Dates | date-fns | 4.1.0 |
| Déploiement | Vercel | — |

---

## 3. Architecture du projet

```
desamianteurs/
├── app/                        # Next.js App Router
│   ├── (public)/               # Pages publiques
│   │   ├── page.tsx            # Accueil
│   │   ├── professionnels/     # Annuaire + profil pro
│   │   ├── formulaire/         # Formulaire demande client
│   │   ├── tarifs/
│   │   ├── actualites/
│   │   ├── certifications/
│   │   ├── cgu/ confidentialite/ mentions-legales/ charte/
│   │   ├── connexion/
│   │   └── inscription/
│   ├── espace-admin/           # Dashboard administrateur
│   ├── espace-client/          # Dashboard client
│   ├── espace-partenaire/      # Dashboard partenaire
│   └── api/                    # Route Handlers (API)
│       ├── stripe/             # Webhooks + checkout
│       ├── admin/              # Mutations admin sécurisées
│       └── verify-siret/       # Validation SIRET (INSEE)
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── PromoBar.tsx
│   ├── DashboardSidebar.tsx
│   └── ui/                     # Composants UI réutilisables
├── lib/
│   ├── supabase.ts             # Client navigateur
│   ├── supabase-server.ts      # Client serveur (SSR)
│   ├── stripe.ts               # Singleton Stripe
│   ├── types.ts                # Types TypeScript partagés
│   ├── constants.ts            # Constantes métier
│   ├── utils.ts                # Utilitaires (timeAgo, formatSize…)
│   ├── kpis.ts                 # Métriques publiques
│   └── animations.ts           # Presets Framer Motion
├── services/
│   └── demandeService.ts       # Soumission formulaire (auth + devis)
├── hooks/
│   └── useDemandeForm.ts       # Validation Zod du formulaire
└── supabase/                   # (edge functions si nécessaire)
```

### Règle clé : Server vs Client Components

- Les **layouts** (`espace-admin`, `espace-client`, `espace-partenaire`) sont des **Server Components** : ils vérifient l'auth côté serveur et font `redirect()` si nécessaire.
- Les **pages** fetchent les données côté serveur et passent au composant `*Client.tsx`.
- Les composants `*Client.tsx` gèrent l'interactivité (état, events, Realtime).

---

## 4. Carte des routes

### Pages publiques

| Route | Description |
|---|---|
| `/` | Page d'accueil avec KPIs, pros à la une, formulaire de recherche |
| `/professionnels` | Annuaire filtrable + carte Google Maps |
| `/professionnels/[id]` | Profil public d'un partenaire |
| `/formulaire` | Formulaire multi-étapes de demande de devis |
| `/tarifs` | Plans d'abonnement Essentiel / Performance / Premium |
| `/actualites` | Articles secteur amiante |
| `/certifications` | Documents requis par type de professionnel |
| `/connexion` | Connexion email/mot de passe ou Google OAuth |
| `/inscription` | Création de compte client ou partenaire |
| `/inscription/completer` | Complétion profil après Google OAuth |
| `/inscription/succes` | Confirmation de paiement Stripe |

### Pages légales

| Route | Description |
|---|---|
| `/cgu` | Conditions Générales d'Utilisation |
| `/confidentialite` | Politique RGPD |
| `/mentions-legales` | Mentions légales (LCEN + SREN 2024) |
| `/charte` | Charte de bonne conduite partenaires |

### Espace Admin (`/espace-admin/*`)

> Accès restreint : rôle `admin` vérifié dans le layout et les pages.

| Route | Description |
|---|---|
| `/espace-admin` | Tableau de bord (stats, partenaires en attente, avis, demandes) |
| `/espace-admin/partenaires` | Liste et validation des comptes partenaires |
| `/espace-admin/demandes` | Toutes les demandes + publication |
| `/espace-admin/demandes/[id]` | Détail d'une demande |
| `/espace-admin/avis` | Modération des avis clients |
| `/espace-admin/utilisateurs` | Gestion des utilisateurs |
| `/espace-admin/prestations` | Types de prestations et domaines |
| `/espace-admin/parametres` | Paramètres de la plateforme |

### Espace Client (`/espace-client/*`)

> Accès restreint : rôle `client`.

| Route | Description |
|---|---|
| `/espace-client` | Tableau de bord client |
| `/espace-client/demandes` | Mes demandes de devis |
| `/espace-client/devis` | Devis reçus des partenaires |
| `/espace-client/messagerie` | Messagerie temps réel |

### Espace Partenaire (`/espace-partenaire/*`)

> Accès restreint : rôle `partenaire`.

| Route | Description |
|---|---|
| `/espace-partenaire` | Tableau de bord + bannière inscription incomplète |
| `/espace-partenaire/demandes` | Nouvelles demandes dans la zone |
| `/espace-partenaire/messagerie` | Messagerie temps réel avec les clients |
| `/espace-partenaire/documents` | Gestion des documents obligatoires |

### API Routes

| Route | Méthode | Description |
|---|---|---|
| `/api/stripe/create-checkout` | POST | Crée une session Stripe (80€ ou abonnement) |
| `/api/stripe/verify-session` | GET | Vérifie le statut de paiement |
| `/api/stripe/validate-promo` | GET | Valide un code promo Stripe |
| `/api/stripe/webhook` | POST | Webhook Stripe (paiement confirmé) |
| `/api/verify-siret` | POST | Validation SIRET via edge function Supabase |
| `/api/admin/quote` | PATCH | Publication d'une demande (admin) |
| `/api/admin/partner` | PATCH | Validation/refus d'un partenaire (admin) |
| `/api/admin/review` | PATCH | Approbation/rejet d'un avis (admin) |

---

## 5. Base de données Supabase

### Tables principales

#### `clients`
| Colonne | Type | Description |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → auth.users | |
| `first_name`, `last_name` | text | |
| `email`, `phone` | text | |
| `client_type` | enum | `individual` / `private_professional` / `public_authority` |
| `avatar_url` | text | URL photo profil |
| `siret`, `company_name`, `company_address`, `company_activity` | text | Pro uniquement |
| `is_active` | bool | |
| `cgu_accepted_at` | timestamptz | |

#### `partners`
| Colonne | Type | Description |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → auth.users | |
| `partner_type` | enum | Voir types partenaires |
| `status` | enum | `pending` / `active` / `suspended` / `rejected` |
| `subscription` | enum | `freemium` / `essentiel` / `performance` / `premium` / `platinium` |
| `is_verified`, `validation_fee_paid` | bool | Validé par admin + frais payés |
| `avatar_url`, `logo_url` | text | Photo contact ou logo entreprise |
| `average_rating`, `review_count` | numeric/int | Mis à jour par trigger automatique |
| `reactivity_score`, `reactivity_sample` | numeric/smallint | Score 0–24 pts |
| `stripe_customer_id`, `stripe_checkout_session_id` | text | Stripe |
| `max_active_visits`, `max_active_quotes`, `max_users` | smallint | Limites selon abonnement |
| `has_stats`, `has_dashboard`, `has_budget_mode` | bool | Fonctionnalités selon plan |

#### `quotes` (demandes de devis)
Contient toutes les informations d'une demande : adresse, surface, type de bien, phase, type d'intervention, délai, budget, documents joints, statut.

**Statuts** : `draft` → `submitted` → `in_progress` → `completed` / `cancelled` / `published`

#### `quote_assignments`
Distribution des demandes aux partenaires. Chaque ligne = un partenaire qui reçoit une demande.

**Statuts** : `pending` → `accepted` → `quote_sent` / `refused` / `expired`

| Champ | Description |
|---|---|
| `wave` | 1 (Premium), 2 (Performance), 3 (Essentiel) |
| `is_exception` | Performance promu en vague 1 via score réactivité |
| `reactivity_points` | Points gagnés sur ce dossier (base 24h, -1/h) |

#### `reviews`
Avis clients sur les partenaires. Statuts : `pending` → `approved` / `rejected`.

> **Trigger automatique** : `trg_sync_partner_review_stats` — à chaque INSERT/UPDATE/DELETE d'un avis approuvé, `partners.review_count` et `partners.average_rating` sont recalculés automatiquement.

#### `messages`
Messages de la messagerie, liés à un `quote_assignments.id`.

#### `intervention_zones`
Zone géographique d'un partenaire. Un seul enregistrement par partenaire.

**Scopes** : `department` / `region` / `nationwide` / `international`

#### `partner_documents`
Documents réglementaires uploadés par les partenaires. Statuts : `missing` / `pending` / `verified` / `rejected` / `expired`.

> Contrainte unique : `(partner_id, document_type_id)` — un document par type.

### Tables de référence (`ref_*`)

| Table | Contenu |
|---|---|
| `ref_document_types` | Documents requis par type de partenaire |
| `ref_domains` | Certifications et domaines d'intervention par type |
| `ref_service_types` | Types de prestations (diagnostic, désamiantage, etc.) |
| `ref_property_types` | Types de biens (maison, appartement, ERP, etc.) |
| `ref_regions` | 18 régions françaises |
| `ref_departments` | 101 départements français |
| `ref_partner_types` | Labels et couleurs par type de partenaire |

### Enums PostgreSQL

```sql
partner_type:    asbestos_remover | diagnostician | sampler_lab
                 project_manager  | legal_expert  | specialized_lawyer

partner_status:  pending | active | suspended | rejected

subscription_plan: freemium | essentiel | performance | premium | platinium

client_type:     individual | private_professional | public_authority

quote_status:    draft | submitted | in_progress | completed | cancelled | published

assignment_status: pending | accepted | quote_sent | refused | expired

coverage_scope:  department | region | nationwide | international
```

### Fonctions SQL

| Fonction | Description |
|---|---|
| `get_public_kpis()` | KPIs publics (nb partenaires, demandes, note moyenne, depts) |
| `get_avg_rating()` | Note moyenne globale des avis approuvés |
| `get_partner_reviews(p_partner_id, p_limit)` | Avis d'un partenaire avec nom client anonymisé (`Prénom I.`) |
| `get_partner_zone(p_partner_id)` | Zone d'intervention formatée en texte |
| `get_partner_diagnostic(p_partner_id)` | Diagnostic de positionnement dans le classement |
| `sync_partner_review_stats()` | Trigger : recalcul review_count + average_rating |

### Sécurité (RLS)

Toutes les tables ont **Row Level Security activé**. Principes :

- Les données `ref_*` sont en **lecture publique** (nécessaire pour le formulaire, les pages publiques)
- Les clients/partenaires lisent et modifient **uniquement leurs propres données**
- Les admins ont accès à tout via des policies dédiées
- Les mutations admin passent par des **routes API sécurisées** (`/api/admin/*`) qui vérifient le rôle côté serveur avant d'écrire

---

## 6. Authentification & rôles

### Providers

- Email + mot de passe (via Supabase Auth)
- Google OAuth (via `/auth/callback/route.ts`)

### Détection du rôle au login

Après connexion, le rôle est déterminé en interrogeant en parallèle les 3 tables de profils :

```typescript
const [adminRes, partnerRes] = await Promise.all([
  supabase.from('admins').select('id').eq('user_id', userId).maybeSingle(),
  supabase.from('partners').select('id').eq('user_id', userId).maybeSingle(),
])
if (adminRes.data)   → /espace-admin
if (partnerRes.data) → /espace-partenaire
else                 → /espace-client
```

### Protection des espaces

Chaque layout de dashboard est un **Server Component** qui :
1. Appelle `supabase.auth.getUser()` (vérification JWT serveur, pas local)
2. Vérifie l'existence du profil correspondant au rôle
3. Fait `redirect('/connexion')` ou `redirect('/espace-client')` si non autorisé

---

## 7. Flux utilisateurs clés

### 7.1 Inscription partenaire

```
Tarifs → [Choisir un plan] → /inscription?tab=partenaire&plan=essentiel
  → Formulaire (SIRET, certifications, zones, marchés, photo/logo)
  → Création compte auth.users + partners (status: pending, validation_fee_paid: false)
  → Stripe checkout :
      - Freemium : paiement 80€ unique (STRIPE_PRICE_ASSO) + code promo ASSO2026 auto
      - Plan payant : abonnement mensuel (STRIPE_PRICE_ESSENTIEL/PERFORMANCE/PREMIUM)
  → Webhook checkout.session.completed :
      - validation_fee_paid = true
      - subscription = plan choisi
      - stripe_customer_id sauvegardé
  → /inscription/succes
```

Si le partenaire annule le paiement et revient sur `/espace-partenaire` → bannière "Finaliser mon inscription" avec lien vers checkout 80€.

### 7.2 Dépôt d'une demande client

```
/formulaire (multi-étapes) :
  Étape 1 : Type de prestation, type de bien, surface, phase
  Étape 2 : Adresse (géocodée via api-adresse.data.gouv.fr)
  Étape 3 : Coordonnées + création/connexion compte

→ demandeService.submitDemande() :
  1. Auth (signUp ou signInWithPassword)
  2. Get/Create profil client
  3. INSERT quotes
  4. INSERT quote_service_types (N types de prestation)
  5. Upload documents vers Storage bucket `quote-documents`

→ Demande en statut `submitted`
→ Admin publie la demande (`published`)
→ Distribution automatique aux partenaires de la zone
```

### 7.3 Cycle de vie d'une demande (partenaire)

```
Réception (quote_assignments.status = 'pending')
  → "Prendre contact" → status = 'accepted', contact_date = now()
  → Messagerie ouverte avec le client
  → "Devis envoyé" → status = 'quote_sent', quote_sent_date = now()
  → Score de réactivité calculé : base 24pts - 1pt/heure de délai
```

### 7.4 Modération admin

- **Partenaires** : vérification des documents → `is_verified = true`, `status = 'active'`
- **Avis** : modération avant publication → `status = 'approved'`
- **Demandes** : publication vers les partenaires → `status = 'published'`

Toutes ces mutations passent par `/api/admin/*` (routes sécurisées avec vérification admin).

---

## 8. Intégration Stripe

### Produits & Prix (environnement test)

| Variable | Price ID | Type | Montant |
|---|---|---|---|
| `STRIPE_PRICE_ASSO` | `price_1TTTbx6P...` | one_time | 80 € |
| `STRIPE_PRICE_ESSENTIEL` | `price_1TTTbx6P...` | recurring/mois | 49 € |
| `STRIPE_PRICE_PERFORMANCE` | `price_1TTTbx6P...` | recurring/mois | 99 € |
| `STRIPE_PRICE_PREMIUM` | `price_1TTTby6P...` | recurring/mois | 219 € |

**Code promo** : `STRIPE_PROMO_ASSO` = `promo_1TTTdI6P...` (code ASSO2026, 100% off, 500 utilisations max) — appliqué automatiquement sur les frais d'inscription.

### Flux de paiement

- **Freemium** : `mode: 'payment'` + `discounts: [{ promotion_code: STRIPE_PROMO_ASSO }]`
- **Plan payant** : `mode: 'subscription'` + la price ID du plan

### Webhook (`/api/stripe/webhook`)

Écoute l'événement `checkout.session.completed` :
```typescript
partners.validation_fee_paid = true
partners.stripe_customer_id  = session.customer
partners.subscription        = session.metadata.plan  // si plan payant
```

> **Important** : La signature Stripe est vérifiée via `stripe.webhooks.constructEvent()`. Le body est lu en `text()` brut (obligatoire).

### Vérification session (`/api/stripe/verify-session`)

Endpoint **authentifié** — vérifie que la session appartient au partenaire de l'utilisateur connecté avant d'interroger Stripe.

---

## 9. Stockage de fichiers

### Buckets Supabase Storage

| Bucket | Visibilité | Contenu |
|---|---|---|
| `quote-documents` | Privé | Pièces jointes des demandes clients |
| `user-media` | Public | Photos profil et logos des partenaires |
| `partner-documents` | Privé | Documents réglementaires des partenaires |

### Conventions de chemin

```
user-media/         {user_id}/avatar.{ext}     → photo de contact
                    {user_id}/logo.{ext}        → logo entreprise
partner-documents/  {user_id}/{doc_code}.{ext}  → documents réglementaires
quote-documents/    {quote_id}/{filename}       → pièces jointes demandes
```

### Politiques RLS Storage

- `user-media` : lecture publique, écriture/modification/suppression par le propriétaire (`auth.uid()` = 1er segment du chemin)
- `partner-documents` : lecture et écriture par le propriétaire uniquement
- `quote-documents` : accès par le client propriétaire du devis

---

## 10. Variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...         # Clé service role (webhooks, admin)
SUPABASE_EDGE_URL=https://xxxx.supabase.co/functions/v1

# Stripe (test)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...          # Générer avec : stripe listen --forward-to localhost:3000/api/stripe/webhook

# Stripe — Price IDs
STRIPE_PRICE_ASSO=price_...             # 80€ frais d'inscription (one_time)
STRIPE_PRICE_ESSENTIEL=price_...        # 49€/mois
STRIPE_PRICE_PERFORMANCE=price_...      # 99€/mois
STRIPE_PRICE_PREMIUM=price_...          # 219€/mois
STRIPE_PROMO_ASSO=promo_...             # Code promo ASSO2026 (100% off)

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIza...
```

### Variables Vercel (production)

Ajouter dans **Settings → Environment Variables** sur Vercel, en particulier :
- `STRIPE_PROMO_ASSO` — indispensable pour l'application automatique du code promo
- `STRIPE_WEBHOOK_SECRET` — générer depuis le dashboard Stripe pour le webhook de production
- Autoriser `https://desamianteurs.vercel.app/*` dans les **HTTP referrers** de la clé Google Maps

---

## 11. Installation locale

```bash
# 1. Cloner le projet
git clone https://github.com/Emvii-lab/desamianteurs.git
cd desamianteurs

# 2. Installer les dépendances
npm install

# 3. Copier et remplir les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés

# 4. Lancer le serveur de développement
npm run dev

# 5. (Optionnel) Écouter les webhooks Stripe en local
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Le projet tourne sur `http://localhost:3000`.

---

## 12. Déploiement Vercel

Le projet est déployé sur **Vercel** (branche `main` → production automatique).

```bash
# Déploiement manuel
vercel --prod

# Vérifier le build localement
npm run build
```

**Post-déploiement checklist :**
- [ ] Variables d'environnement complètes dans Vercel
- [ ] Domaine Google Maps autorisé (`https://desamianteurs.vercel.app/*`)
- [ ] Webhook Stripe configuré avec l'URL de production
- [ ] `STRIPE_WEBHOOK_SECRET` mis à jour avec le secret de production

---

## 13. Conventions de code

### Styles
- **Inline styles** React pour tous les composants (cohérence avec le design system)
- Variables CSS globales dans `globals.css` : `--red`, `--black`, `--gray-*`, `--font-serif`, `--font-sans`
- Classes utilitaires : `.btn`, `.btn-red`, `.btn-outline`, `.input`, `.badge`, `.card`

### Composants
- `*Client.tsx` = composant client (`'use client'`) avec logique interactive
- `page.tsx` = Server Component qui fetch les données et passe au composant client
- Layout = Server Component avec vérification auth + redirect

### Sécurité
- Les mutations sensibles (admin) passent par des **routes API** avec vérification côté serveur
- `supabase.auth.getUser()` (vérification serveur) — jamais `getSession()` pour les décisions d'autorisation
- RLS activée sur toutes les tables
- Les clés `service_role` et `STRIPE_SECRET_KEY` ne sont jamais exposées côté client

### Typages Supabase
Les jointures Supabase (`!inner`, alias) sont souvent typées en tableau même pour des relations 1:1. Normaliser avec :
```typescript
const data: QuoteData = Array.isArray(raw.quotes) ? raw.quotes[0] : raw.quotes
```

### Données de test

Les comptes de test (environnement Supabase) ont le mot de passe `Demo2026!`.

| Email | Rôle |
|---|---|
| `admin@desamianteurs.com` | Administrateur |
| `contact@sarl-desamiante-pro.fr` | Partenaire (Performance) |
| `info@diagnostic-habitat69.fr` | Partenaire (Premium) |
| `martin.dupont@gmail.com` | Client |
| `agnes.fontaine@orange.fr` | Client |

---

*Documentation générée le 07/05/2026 — version courante du projet.*
