# TODO — Application de suivi médical personnalisé

> État du produit comparé au **Product Brief**.
> Légende : ✅ Fait · 🟡 Partiel · ❌ À faire

Stack : Expo Router (RN) · tRPC · MongoDB (Mongoose) · Better Auth (OTP) · HeroUI + Tailwind · file d'attente jobs IA (extraction).

---

## Vue d'ensemble

| # | Fonctionnalité (brief) | État |
|---|------------------------|------|
| 6.1 | Fiche médicale | 🟡 |
| 6.2 | Menu de modification fiche | 🟡 |
| 6.3 | Ordonnance unique | 🟡 |
| 6.3 | Alerte interaction médicamenteuse | ❌ |
| 6.4 | Modification ordonnance (add/edit/delete) | 🟡 |
| 6.5 | Scan de document | 🟡 |
| 6.6 | Liste examens / comptes rendus | ❌ |
| 6.7 | Rendez-vous médicaux | ❌ |
| 6.8 | Annuaire professionnels de santé | ❌ |
| 6.9 | Calendrier de suivi personnalisé | ❌ |
| 6.10 | Rappels de prise | ❌ |
| — | Onboarding | ✅ |
| — | Auth / Sign-in | ✅ |
| — | Health score | 🟡 |

---

## 6.1 Fiche médicale — 🟡

**Fait**
- Schéma data complet couvre tous les champs du brief : `apps/native/app/health/health-schema.ts`
  - Infos perso : nom, prénom, date naissance, sexe bio, groupe sanguin, taille, poids
  - Allergies (liste), antécédents familiaux, antécédents chirurgicaux
  - Conditions par spécialité (cardio, pneumo, neuro, endoc, psy)
  - Gynéco + obstétrique (femmes) : ménopause, contraception, grossesses, accouchements, césariennes…
- Stockage MongoDB chiffré/non-chiffré : `packages/db/src/models/auth.model.ts`, `packages/domain/src/health-data/service.ts`
- Écran liste catégories : `apps/native/app/health/index.tsx`
- Écran synthèse lecture seule : `apps/native/app/health/overview.tsx`

**À faire**
- [ ] Champ **tension artérielle** réel (actuellement juste choix oui/non, pas de valeur)
- [ ] Champs **habitudes** : tabac, drogues, autres (brief les liste — vérifier présence dans schema)
- [ ] Vraie **carte fiche médicale** synthèse "en un coup d'œil" (dashboard)
- [ ] Accès rapide synthèse depuis home (aujourd'hui carte générique)
- [ ] Message confirmation "Votre fiche médicale a été mise à jour."

## 6.2 Menu modification fiche — 🟡

**Fait**
- Édition par catégorie : `apps/native/app/health/[category].tsx`
- Inputs : texte, date picker, groupe sanguin, taille/poids, choix, listes
- Save/cancel

**À faire**
- [ ] Champ **texte libre** "ajouter une information manuelle" par section
- [ ] Regrouper en menu "Modifier vos infos persos" tel que décrit (sections : perso, allergies, habitudes, antécédents médicaux/chir/familiaux)

## 6.3 Ordonnance unique — 🟡

**Fait**
- Écran traitements actifs unifiés : `apps/native/app/prescriptions/current.tsx`
- Carte "Ordonnance unifiée" : `apps/native/app/(tabs)/documents.tsx`
- Modèles : `PrescriptionUnified`, `PrescriptionUnifiedView` (`packages/db/src/models/prescriptions.model.ts`)
- Champs médicament : nom, dosage, fréquence, durée, type (one_off/chronic), route, instructions

**À faire**
- [ ] Champ **forme** (galénique) stocké + affiché (picker existe, pas persisté)
- [ ] Champ **posologie / moment de prise** explicite
- [ ] Affichage **statut actif/terminé** (existe en DB, pas en UI)
- [ ] Distinction visuelle **chronique vs ponctuel** dans la vue

## 6.3 Alerte interaction médicamenteuse — ❌

**À faire** (à cadrer — brief demande niveau criticité, source médicale, responsabilité)
- [ ] Source/référentiel interactions (base médicamenteuse)
- [ ] Moteur détection interactions sur l'ordonnance unique
- [ ] Détection conflit allergie ↔ médicament
- [ ] UI alerte prudente + invite consulter médecin/pharmacien
- [ ] Niveaux de criticité

## 6.4 Modification ordonnance — 🟡

**Fait**
- Créer manuel : `apps/native/app/prescriptions/new.tsx`
- Éditer existant : `apps/native/app/prescriptions/[id].tsx`, `prescription-editor/`, `medication-editor/`
- Hooks : `use-manual-prescription-form.ts`, `use-prescription-detail-form.ts`, `use-prescription-draft.ts`
- API `prescriptions.save` (upsert), `prescriptions.upload`, `prescriptions.get`

**À faire**
- [ ] **Suppression** traitement : endpoint + UI confirmée ("Vous allez supprimer [nom]…")
- [ ] MAJ **rappels associés** après edit/delete (dépend de 6.10)
- [ ] Écran de **vérification** des infos extraites avant validation

## 6.5 Scan de document — 🟡

**Fait**
- Caméra + galerie : `apps/native/features/prescriptions/use-prescription-photo.ts` (permissions iOS gérées)
- Upload base64 : `use-prescription-upload.ts`
- Extraction IA serveur (queue) : `apps/queue/src/handlers/prescription.ts`
- UI upload/preview : `apps/native/app/(tabs)/documents.tsx`

**À faire**
- [ ] **Sélection zone d'intérêt** (crop) avant analyse
- [ ] Distinguer **scan ordonnance** vs **scan compte rendu** (classification type doc)
- [ ] Écran **validation/correction** des infos détectées
- [ ] Retour auto vers l'écran ordonnance modifiée après extraction
- [ ] Cas compte rendu : router vers liste examens (dépend 6.6)
- [ ] Ajouter une nouvelle photo (multi-pages)

## 6.6 Liste examens / comptes rendus — ❌

**À faire** (rien n'existe)
- [ ] Modèle data examen (date, intitulé, conclusion courte, médecin, scan lié)
- [ ] Liste **chronologique groupée par année/mois**, récent → ancien
- [ ] Item : date — nom — conclusion courte
- [ ] Accès au scan complet au clic
- [ ] Recherche par mot-clé
- [ ] Ajouter / modifier / corriger un examen
- [ ] Extraction IA : intitulé, date, conclusion (réutiliser pipeline scan)

## 6.7 Rendez-vous médicaux — ❌

**À faire** (rien n'existe)
- [ ] Modèle data RDV (pro, spécialité, date, heure, lieu, notes, rappel)
- [ ] Liste RDV groupée par année
- [ ] Ajouter / modifier / supprimer RDV
- [ ] Rappel + fréquence notification
- [ ] Création auto du pro dans l'annuaire si absent (dépend 6.8)

## 6.8 Annuaire professionnels de santé — ❌

**À faire** (rien n'existe)
- [ ] Modèle data pro (nom, prénom, profession, spécialité, tél, adresse, email, notes)
- [ ] Liste groupée par spécialité
- [ ] CRUD fiche pro
- [ ] Association pro ↔ RDV (6.7) et pro ↔ examen (6.6)

## 6.9 Calendrier de suivi personnalisé — ❌

**À faire** (rien n'existe — fonctionnalité centrale)
- [ ] Moteur recommandations (fiche médicale + examens passés + référentiel)
- [ ] **Référentiel configurable par pays** (brief = recos USA, à généraliser)
- [ ] Calcul échéances suivis récurrents (ex : post-cancer sein, tous les 6 mois / 5 ans, basé sur dernière date connue)
- [ ] 2 vues : liste par année + calendrier classique
- [ ] **Code couleur** : rouge (pas de RDV) → noir (RDV planifié)
- [ ] Notifications avant échéance
- [ ] Message pédagogique au 1er accès

## 6.10 Rappels de prise — ❌

**À faire** (rien n'existe — champs fréquence/horaires présents mais pas exploités)
- [ ] Intégration **notifications** (expo-notifications + permissions)
- [ ] Logique de planification (fréquence, nb prises/jour, heures, durée)
- [ ] **Vue calendrier hebdomadaire** des prises
- [ ] CRUD rappel, association rappel ↔ médicament
- [ ] Navigation ordonnance unique → rappel du médicament
- [ ] Génération auto des rappels à l'ajout d'un traitement (lien 6.4)

---

## Déjà fait (hors brief explicite)

- ✅ **Onboarding** multi-étapes catégorie par catégorie : `apps/native/app/onboarding/`
- ✅ **Auth OTP** (Better Auth, multi-tenant) : `apps/native/app/(auth)/sign-in.tsx`, `lib/auth-client.ts`, `auth-gate/`
- 🟡 **Health score** : composant animé existe mais score **codé en dur (88)** — `components/features/health-score/` → manque l'algo de calcul

---

## Parcours utilisateurs (brief §7) — couverture

| Parcours | État |
|----------|------|
| 1 — Créer fiche médicale | 🟡 (via onboarding + édition) |
| 2 — Ajouter traitement manuel | 🟡 (manque proposition rappel à la fin) |
| 3 — Scanner ordonnance | 🟡 (manque crop + écran vérif) |
| 4 — Scanner compte rendu | ❌ (dépend 6.6) |
| 5 — Ajouter rendez-vous | ❌ (dépend 6.7 + 6.8) |
| 6 — Suivre examens recommandés | ❌ (dépend 6.9) |

---

## Priorités suggérées (ordre de dépendances)

1. **6.8 Annuaire pros** — socle pour RDV et examens
2. **6.7 Rendez-vous** — dépend annuaire
3. **6.6 Examens/comptes rendus** — réutilise pipeline scan, dépend annuaire
4. **6.10 Rappels de prise** — notifications, lié à l'ordonnance existante
5. **6.9 Calendrier de suivi** — central, dépend examens + RDV
6. **6.3 Interactions médicamenteuses** — nécessite référentiel externe, cadrage
7. **Compléments** : tension artérielle, forme galénique, statut actif/terminé, calcul health score
