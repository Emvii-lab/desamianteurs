# Documentation de l'Algorithme de Matching - Désamianteurs.fr

Cette documentation détaille le fonctionnement de l'algorithme de distribution des demandes de devis aux professionnels partenaires.

---

## 1. Vue d'Ensemble
L'algorithme a pour but de mettre en relation un client (particulier ou professionnel) avec les 3 professionnels les plus qualifiés et réactifs de sa zone géographique, tout en garantissant un flux d'opportunités minimal aux abonnés Premium.

---

## 2. Processus de Filtrage (Éligibilité)
Lorsqu'une demande est soumise, l'algorithme filtre les partenaires selon les critères suivants :

1.  **Zone Géographique** : Le partenaire doit couvrir le département du chantier (via son périmètre `department` ou `nationwide`).
2.  **Type de Métier** : Mapping automatique entre le besoin client et le type de partenaire :
    *   *Diagnostic Amiante* → Diagnostiqueur
    *   *Désamiantage / SS4* → Entreprise de désamiantage
    *   *Maîtrise d'Œuvre* → Maître d'œuvre / AMO
    *   *Analyse Laboratoire* → Laboratoire de prélèvement
3.  **Type de Client** : Si le client est un particulier, seuls les pros ayant coché "Accepte les particuliers" sont éligibles.
4.  **Statut** : Le partenaire doit être en statut `active` et ne pas être en période d'absence (mode veille).

---

## 3. Système de Vagues (Distribution)

### Vague 1 : Priorité & Excellence (Instantané)
Les 3 meilleurs partenaires sont sélectionnés pour recevoir la demande immédiatement.
**Critères de classement (Ordre de priorité) :**
1.  **Mode Réactivation** (Priorité absolue pour les Premium en manque d'opportunités).
2.  **Niveau d'Abonnement** (Platinium > Premium).
3.  **Score de Réactivité** (Calculé sur les 20 derniers dossiers).
4.  **Note Moyenne** (Avis clients).

*Note : Les abonnés **Performance** peuvent être injectés en Vague 1 s'ils ont un score de réactivité exceptionnel (≥ 30 points) et n'ont pas dépassé leur quota de dossiers actifs.*

### Vague 2 : Escalade (Après 24h)
Si la demande n'a pas reçu suffisamment de réponses après 24h, elle est ouverte à tous les partenaires **Performance**, **Premium** et **Platinium** de la zone qui n'étaient pas dans la Vague 1.

### Vague 3 : Marketplace (Libre Accès)
Si aucun devis n'est envoyé après un délai prolongé, la demande devient accessible aux abonnés **Essentiel** et **Freemium**.

---

## 4. Filet de Sécurité Premium (Safety Net)
Pour garantir la satisfaction des abonnés Premium/Platinium, un mécanisme de surveillance des "Gaps" (périodes sans demandes) est actif :

### J+5 : Diagnostic de Visibilité
Si un Premium n'a reçu aucune demande depuis 5 jours :
*   Un niveau d'alerte `j5` est déclenché.
*   Le dashboard affiche un diagnostic expliquant la cause de la non-sélection (ex: Réactivité en baisse, Notes inférieures à la concurrence, ou simplement manque de volume dans la zone).

### J+7 : Boost de Réactivation
Si le délai atteint 7 jours sans opportunité :
*   Le partenaire passe en mode **Réactivation Active**.
*   Il est **propulsé en tête de liste** lors du prochain matching dans sa zone, occupant d'office l'un des 3 slots de la Vague 1, quel que soit son score actuel.
*   Ce boost dure 3 jours ou jusqu'à la réception d'une nouvelle demande.

---

## 5. Calcul du Score de Réactivité
Le score est le moteur principal du classement.
*   **Base** : 24 points (pour les dossiers pros) ou 36 points (pour les particuliers).
*   **Calcul** : `Score = Base - Heures_écoulées_avant_premier_contact`.
*   **Exemple** : Un pro répond à un particulier en 2h. Son score est `36 - 2 = 34 points`.
*   **Pénalités** : Un refus ou une expiration de demande entraîne un score de **0** pour ce dossier.
*   **Moyenne** : Le score affiché est la moyenne des 20 derniers dossiers sur une fenêtre de 2 mois.

---

## 6. Diagnostic Dashboard (Transparence)
Chaque professionnel dispose d'un outil de diagnostic qui lui indique :
*   Son rang réel dans son département.
*   Le nombre total de concurrents éligibles.
*   La raison principale de son classement (Réactivité, Note, ou Volume de zone).

---

*Documentation mise à jour le 03/05/2026 par Antigravity AI.*
