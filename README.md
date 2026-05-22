# Désamianteurs.com — Documentation technique

> Plateforme de mise en relation entre clients et professionnels certifiés du secteur amiante/plomb.  
> 🌐 [www.desamianteurs.com](https://www.desamianteurs.com)

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
12. [Déploiement](#12-déploiement)
13. [PWA & TWA Android](#13-pwa--twa-android)
14. [Conventions de code](#14-conventions-de-code)

---

## 1. Vue d'ensemble

Désamianteurs.com est une marketplace B2B/B2C spécialisée dans le secteur amiante et plomb en France. La plateforme connecte :

- **Clients** (particuliers, professionnels, collectivités) qui soumettent des demandes de devis
- **Partenaires** (désamianteurs, diagnostiqueurs, laboratoires, MOE, avocats, experts) qui répondent aux demandes
- **Administrateurs** qui modèrent la plateforme, valident les profils et publient les demandes

### Modèle de distribution des demandes

Les demandes sont distribuées en **3 vagues prioritaires** :
- **Vague 1** — Premium (+ exceptions Performance via score de réactivité)
- **Vague 2** — Performance
- **Vague 3** — Essentiel (accès libre aux demandes non traitées)

Le **score de réactivité** (0–24 pts) est calculé sur les 10–20 derniers dossiers.

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
| Emails | Nodemailer (SMTP) | — |
| Déploiement | Vercel (prod) + VPS Docker (mirror) | — |

---

## 3. Architecture du projet

```
desamianteurs/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Accueil
│   ├── professionnels/         # Annuaire + profil pro
│   ├── formulaire/             # Formulaire demande client (multi-étapes)
│   ├── tarifs/
│   ├── connexion/ inscription/
│   ├── espace-admin/           # Dashboard administrateur
│   ├── espace-client/          # Dashboard client
│   ├── espace-partenaire/      # Dashboard partenaire
│   ├── manifest.ts             # Manifest PWA
│   └── api/                    # Route Handlers
│       ├── stripe/             # Webhooks + checkout
│       ├── admin/              # Mutations admin sécurisées
│       ├── notifications/      # Emails transactionnels
│       └── verify-siret/       # Validation SIRET (INSEE)
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── PromoBar.tsx
│   ├── DashboardSidebar.tsx
│   ├── CookieConsent.tsx       # Bannière RGPD
│   └── ui/                     # Composants UI réutilisables
├── lib/
│   ├── supabase.ts             # Client navigateur (browser)
│   ├── supabase-server.ts      # Client serveur (SSR)
│   ├── stripe.ts               # Singleton Stripe
│   ├── types.ts                # Types TypeScript partagés
│   ├── constants.ts            # Constantes métier
│   ├── hooks/                  # Hooks React custom
│   └── animations.ts           # Presets Framer Motion
├── services/
│   └── demandeService.ts       # Soumission formulaire
├── emails/                     # Templates HTML emails
│   ├── reset-password.html
│   └── confirmation-demande.html
├── public/
│   ├── icons/                  # Icônes PWA (12 tailles)
│   ├── sw.js                   # Service Worker
│   └── .well-known/
│       └── assetlinks.json     # Digital Asset Links (TWA Android)
├── scripts/                    # Scripts utilitaires
│   ├── stripe-setup.mjs        # Création produits Stripe
│   ├── stripe-coupon.mjs       # Création code promo
│   └── generate-icons.mjs      # Génération icônes PWA
├── tests/                      # Tests unitaires + E2E
└── Dockerfile                  # Build multi-stage pour VPS
```

### Règle clé : Server vs Client Components

- Les **layouts** sont des **Server Components** : vérification auth + `redirect()` si nécessaire
- Les **pages** fetchent les données côté serveur et passent au composant `*Client.tsx`
- Les composants `*Client.tsx` gèrent l'interactivité (état, events, Realtime)
- **Pas de proxy/middleware** — l'auth est gérée au niveau des pages et par le browser client Supabase

---

## 4. Carte des routes

### Pages publiques

| Route | Description |
|---|---|
| `/` | Accueil avec KPIs, témoignages, pros à la une |
| `/professionnels` | Annuaire filtrable + carte Google Maps |
| `/professionnels/[id]` | Profil public d'un partenaire |
| `/formulaire` | Formulaire multi-étapes de demande de devis |
| `/tarifs` | Plans d'abonnement |
| `/connexion` | Connexion email/mot de passe ou Google OAuth |
| `/inscription` | Création de compte client ou partenaire |

### Espace Admin (`/espace-admin/*`)

| Route | Description |
|---|---|
| `/espace-admin` | Tableau de bord |
| `/espace-admin/partenaires` | Liste et validation des partenaires |
| `/espace-admin/partenaires/[id]` | Détail d'un partenaire |
| `/espace-admin/demandes` | Toutes les demandes + publication |
| `/espace-admin/avis` | Modération des avis |
| `/espace-admin/utilisateurs` | Gestion des utilisateurs |

### Espace Client & Partenaire

| Route | Description |
|---|---|
| `/espace-client/demandes` | Mes demandes |
| `/espace-client/devis` | Devis reçus |
| `/espace-partenaire/demandes` | Nouvelles demandes dans la zone |
| `/espace-partenaire/documents` | Documents réglementaires |

### API Routes

| Route | Méthode | Auth | Description |
|---|---|---|---|
| `/api/stripe/create-checkout` | POST | Utilisateur connecté | Crée une session Stripe |
| `/api/stripe/webhook` | POST | Signature Stripe | Webhook paiement confirmé |
| `/api/stripe/verify-session` | GET | Utilisateur connecté | Vérifie statut paiement |
| `/api/verify-siret` | POST | Public | Validation SIRET |
| `/api/admin/*` | PATCH/DELETE | Admin | Mutations admin |
| `/api/notifications/confirmation-demande` | POST | Utilisateur connecté | Email de confirmation |

---

## 5. Base de données Supabase

### Tables principales

#### `clients` / `partners`
Profils utilisateurs avec leurs données métier. `partners` inclut : `status`, `subscription`, `reactivity_score`, `is_verified`, `validation_fee_paid`, `stripe_customer_id`.

#### `quotes` (demandes de devis)
Statuts : `draft` → `submitted` → `published` → `in_progress` → `completed` / `cancelled`

#### `quote_assignments`
Distribution aux partenaires. Champs clés : `wave` (1/2/3), `reactivity_points`, `is_exception`.

#### `messages`
Messagerie temps réel, liée à `quote_assignments.id`.

#### `reviews`
Avis clients. Trigger `trg_sync_partner_review_stats` : recalcul automatique de `average_rating` et `review_count`.

### Tables de référence (`ref_*`)

`ref_document_types`, `ref_service_types`, `ref_property_types`, `ref_regions`, `ref_departments`, `ref_partner_types`

### Fonctions SQL notables

| Fonction | Description |
|---|---|
| `get_public_kpis()` | KPIs publics (accueil) |
| `get_partner_diagnostic(p_partner_id)` | Diagnostic de positionnement |
| `distribute_quote()` | Distribution en vagues (trigger) |
| `escalate_quotes_wave_2()` | Relance si pas de réponse |

### Sécurité (RLS)

Toutes les tables ont Row Level Security activé. Les mutations admin passent par `/api/admin/*` avec vérification côté serveur.

---

## 6. Authentification & rôles

### Providers
- Email + mot de passe (Supabase Auth)
- Google OAuth (`/auth/callback`)

### Détection du rôle

```typescript
const [adminRes, partnerRes] = await Promise.all([
  supabase.from('admins').select('id').eq('user_id', userId).maybeSingle(),
  supabase.from('partners').select('id').eq('user_id', userId).maybeSingle(),
])
// admin → /espace-admin | partner → /espace-partenaire | sinon → /espace-client
```

### Session

Le **browser client** (`createBrowserClient`) gère le refresh automatique des tokens. Les pages Server Components vérifient l'auth via `getUser()`. Pas de middleware/proxy pour éviter les conflits de refresh token.

---

## 7. Flux utilisateurs clés

### Inscription partenaire

```
Tarifs → /inscription?tab=partenaire&plan=essentiel
  → Formulaire (SIRET, certifications, zones, photo/logo)
  → Stripe checkout (80€ one-time ou abonnement mensuel)
  → Webhook → validation_fee_paid = true
  → Admin valide le profil → status = 'active'
```

### Dépôt d'une demande client

```
/formulaire (3 étapes) → demandeService.submitDemande()
  → Auth (signUp ou signIn)
  → INSERT quotes + quote_service_types + upload documents
  → Email de confirmation envoyé
  → Admin publie → distribution automatique aux partenaires
```

---

## 8. Intégration Stripe

### Plans

| Plan | Type | Montant |
|---|---|---|
| Inscription (Freemium) | one_time | 80 € |
| Essentiel | recurring/mois | 49 € |
| Performance | recurring/mois | 99 € |
| Premium | recurring/mois | 219 € |

**Code promo** `ASSO2026` : 100% de réduction sur les frais d'inscription, appliqué automatiquement.

Les Price IDs et clés Stripe sont configurés via variables d'environnement (voir section 10).

### Webhook

Écoute `checkout.session.completed` → met à jour `partners` (fee paid, customer ID, subscription). Signature vérifiée via `stripe.webhooks.constructEvent()`.

---

## 9. Stockage de fichiers

| Bucket | Visibilité | Contenu |
|---|---|---|
| `quote-documents` | Privé | Pièces jointes des demandes |
| `user-media` | Public | Photos profil et logos |
| `partner-documents` | Privé | Documents réglementaires |

---

## 10. Variables d'environnement

Créer `.env.local` à la racine (voir `.env.example`) :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_EDGE_URL=https://xxxx.supabase.co/functions/v1

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ASSO=price_...
STRIPE_PRICE_ESSENTIEL=price_...
STRIPE_PRICE_PERFORMANCE=price_...
STRIPE_PRICE_PREMIUM=price_...
STRIPE_PROMO_ASSO=promo_...

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIza...

# SMTP (emails transactionnels)
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# App
NEXT_PUBLIC_APP_URL=https://www.desamianteurs.com
```

---

## 11. Installation locale

```bash
# 1. Cloner
git clone https://github.com/Emvii-lab/desamianteurs.git
cd desamianteurs

# 2. Dépendances
npm install

# 3. Variables d'environnement
cp .env.example .env.local
# Remplir .env.local avec vos clés

# 4. Développement
npm run dev

# 5. Tests
npm run test

# 6. (Optionnel) Écouter les webhooks Stripe
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 12. Déploiement

### Vercel (production principale)

Déploiement automatique sur push `main` → `https://www.desamianteurs.com`

```bash
# Vérifier le build
npm run build

# Variables à configurer dans Vercel → Settings → Environment Variables
```

**Checklist post-déploiement :**
- [ ] Variables d'environnement complètes
- [ ] Domaine Google Maps autorisé (`https://www.desamianteurs.com/*`)
- [ ] Webhook Stripe configuré avec l'URL de production
- [ ] `NEXT_PUBLIC_APP_URL=https://www.desamianteurs.com`

### VPS Docker (mirror)

Le projet inclut un `Dockerfile` multi-stage optimisé pour la production.

```bash
# Build
docker build -t desamianteurs .

# Run
docker run -p 3000:3000 --env-file .env desamianteurs
```

### Remotes Git

```bash
origin    → https://github.com/Emvii-lab/desamianteurs.git
devlogica → https://git2.devlogica.com/Desamianteurs/site-next-js.git
```

`git push` envoie automatiquement sur les deux remotes.

---

## 13. PWA & TWA Android

L'application est une **Progressive Web App** installable sur Android via une **Trusted Web Activity (TWA)**.

### PWA
- Manifest : `app/manifest.ts`
- Service Worker : `public/sw.js` (cache offline)
- Icônes : `public/icons/` (12 tailles, format maskable inclus)

### TWA (Play Store)
- Digital Asset Links : `public/.well-known/assetlinks.json`
- Build APK : via [Bubblewrap CLI](https://github.com/GoogleChromeLabs/bubblewrap)
- Package ID : `com.desamianteurs.app`

```bash
# Regénérer les icônes PWA
node scripts/generate-icons.mjs

# Rebuild APK (dans le dossier TWA)
bubblewrap build
```

---

## 14. Conventions de code

### Styles
- Inline styles React pour tous les composants
- Variables CSS dans `globals.css` : `--red`, `--black`, `--gray-*`, `--radius`, `--font-serif`, `--font-sans`
- Classes utilitaires : `.btn`, `.btn-red`, `.btn-outline`, `.input`, `.badge`, `.card`

### Composants
- `*Client.tsx` = composant client (`'use client'`) avec logique interactive
- `page.tsx` = Server Component qui fetch les données et passe au composant client
- Layout = Server Component avec vérification auth + redirect

### Sécurité
- Mutations admin via routes API avec vérification côté serveur
- Jamais `getSession()` pour les décisions d'autorisation serveur → toujours `getUser()`
- RLS activée sur toutes les tables
- `service_role` et `STRIPE_SECRET_KEY` jamais exposés côté client
- Allowlist sur les valeurs écrites en base (enums validés)

---

*Documentation mise à jour le 22/05/2026*
