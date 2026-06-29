# TODO — Application de suivi médical personnalisé

> État du produit comparé au **Product Brief**.
> Légende : ✅ Fait · 🟡 Partiel · ❌ À faire

Stack : Expo Router (RN) · tRPC · MongoDB (Mongoose) · Better Auth (OTP) · HeroUI + Tailwind · file d'attente jobs IA (extraction).

---

## Vue d'ensemble

| # | Fonctionnalité (brief) | État |
|---|------------------------|------|
| 6.1 | Fiche médicale | ✅ |
| 6.2 | Menu de modification fiche | 🟡 |
| 6.3 | Ordonnance unique | ✅ |
| 6.3 | Alerte interaction médicamenteuse | 🟡 |
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

## 6.1 Fiche médicale — ✅

**Fait**
- Schéma data complet couvre tous les champs du brief : `apps/native/app/health/health-schema.ts`
  - Infos perso : nom, prénom, date naissance, sexe bio, groupe sanguin, taille, poids
  - Allergies (liste), antécédents familiaux, antécédents chirurgicaux
  - Conditions par spécialité (cardio, pneumo, neuro, endoc, psy)
  - Gynéco + obstétrique (femmes) : ménopause, contraception, grossesses, accouchements, césariennes…
- Stockage MongoDB chiffré/non-chiffré : `packages/db/src/models/auth.model.ts`, `packages/domain/src/health-data/service.ts`
- Écran liste catégories : `apps/native/app/health/index.tsx`
- Écran synthèse lecture seule : `apps/native/app/health/overview.tsx`
- [x] Champ **tension artérielle** réel (valeur saisie) : type `blood_pressure` + `BloodPressureInput`, persisté, affiché en overview + carte synthèse
- [x] Champs **habitudes** : catégorie `habits` (tabac, alcool, drogues, autres) dans le schema
- [x] Vraie **carte fiche médicale** synthèse "en un coup d'œil" : `apps/native/components/features/medical-summary/medical-summary-card.tsx` (nom, âge/sexe, groupe sanguin, tension, taille/poids, nb conditions, allergies)
- [x] Accès rapide synthèse depuis home : carte « Medical record » affiche un aperçu réel (nom, âge/sexe, nb conditions, nb allergies) → `apps/native/app/(tabs)/index.tsx`
- [x] Message confirmation "Your medical record has been updated." : toast `success` après save (`ToastProvider` dans `_layout.tsx`, `useToast` dans `app/health/[category].tsx`)

## 6.2 Menu modification fiche — 🟡

**Fait**
- Édition par catégorie : `apps/native/app/health/[category].tsx`
- Inputs : texte, date picker, groupe sanguin, taille/poids, choix, listes
- Save/cancel

**À faire**
- [ ] Champ **texte libre** "ajouter une information manuelle" par section
- [ ] Regrouper en menu "Modifier vos infos persos" tel que décrit (sections : perso, allergies, habitudes, antécédents médicaux/chir/familiaux)

## 6.3 Ordonnance unique — ✅

**Fait**
- Écran traitements actifs unifiés : `apps/native/app/prescriptions/current.tsx`
- Carte "Ordonnance unifiée" : `apps/native/app/(tabs)/documents.tsx`
- Modèles : `PrescriptionUnified`, `PrescriptionUnifiedView` (`packages/db/src/models/prescriptions.model.ts`)
- Champs médicament : nom, dosage, fréquence, durée, type (one_off/chronic), route, instructions
- [x] Champ **forme** (galénique) stocké + affiché : liste courte (10 formes) `MEDICATION_FORMS`, picker dans `medication-editor`, persisté (DTO `form` → data → vue unifiée → AI extrait aussi `form`), affiché en chip dans `current.tsx`
- [x] Champ **posologie / moment de prise** explicite : moments structurés `INTAKE_MOMENTS` (matin/midi/soir/coucher/pendant le repas), chips multi-sélection dans l'éditeur, persisté `intakeMoments`, affiché en chips
- [x] Affichage **statut actif/terminé** : `current.tsx` lit la vue complète (`unified.get`), sépare actifs / terminés (carte « Past treatments ») + badge `DotChip` Actif/Terminé
- [x] Distinction visuelle **chronique vs ponctuel** : badge dédié (chip accent « Chronique » / neutre « Ponctuel »)

## 6.3 Alerte interaction médicamenteuse — 🟡 (MVP hybride)

**Fait**
- [x] Source/référentiel **hybride** : ruleset curé déterministe (`packages/infrastructure/src/interactions/ruleset.ts` + `matcher.ts`) + couche LLM Ollama informative (`interactions/ai.ts`)
- [x] Moteur détection sur l'ordonnance unique : job async `interaction.analysis` recalculé après `recomputeUnifiedView`, persisté dans `PrescriptionInteractionsView` (`interactions/service.ts`, `apps/queue/src/handlers/interaction.ts`)
- [x] Détection conflit **allergie ↔ médicament** (règles de classe : bêta-lactamines, sulfamides, AINS, opioïdes ; allergies lues via `getHealthData`)
- [x] UI alerte prudente + disclaimer + invite médecin/pharmacien : `components/features/prescription/interaction-alert/`, affichée dans `app/prescriptions/current.tsx`
- [x] Niveaux de criticité : `info` / `warning` / `danger` (chip couleur)
- API : `prescriptions.unified.interactions`. Test unitaire matcher : `interactions/matcher.test.ts`.

**À faire (durcissement)**
- [ ] Étendre le ruleset curé (couverture limitée — MVP volontairement petit, paires haute sévérité)
- [ ] Normalisation médicaments (texte libre → principe actif/ATC) pour fiabiliser le matching
- [ ] Badge danger sur la carte ordonnance unifiée (`app/(tabs)/documents.tsx`)
- [ ] Évaluer/limiter le risque d'hallucination de la couche LLM (garde-fous, validation)

## 6.4 Modification ordonnance — 🟡 (bloqué seulement par 6.10)

**Fait**
- Créer manuel : `apps/native/app/prescriptions/new.tsx`
- Éditer existant : `apps/native/app/prescriptions/[id].tsx`, `prescription-editor/`, `medication-editor/`
- Hooks : `use-manual-prescription-form.ts`, `use-prescription-detail-form.ts`, `use-prescription-draft.ts`
- API `prescriptions.save` (upsert), `prescriptions.upload`, `prescriptions.get`
- [x] **Suppression** traitement : endpoint `prescriptions.delete` (`deleteUnifiedPrescription` supprime l'unifié + le raw lié, recompute vue) + UI confirmée « Vous allez supprimer [nom]. Cette action est irréversible. » (dialog dans `prescription-forms.tsx`, bouton danger dans `prescription-editor`)
- [x] Écran de **vérification** des infos extraites avant validation : `PrescriptionDetailForm` affiche l'extraction (états processing/failed/report), info éditable, « Review the extracted info and make any corrections » avant save

**À faire**
- [ ] MAJ **rappels associés** après edit/delete — **bloqué : dépend de 6.10** (feature rappels inexistante)

## 6.5 Scan de document — 🟢 (compte-rendu UI = 6.6)

**Fait**
- Caméra + galerie : `apps/native/features/prescriptions/use-prescription-photo.ts` (permissions iOS gérées)
- Upload base64 : `use-prescription-upload.ts`
- **IA locale fiabilisée** : provider Ollama `gemma3:4b` avec sortie structurée (`format` JSON schema), timeout, prompt classification — `packages/infrastructure/src/prescriptions/ai.ts` + `parser.ts` (`UNIFIED_JSON_SCHEMA`)
- Extraction IA serveur (queue) : `apps/queue/src/handlers/prescription.ts`
- UI upload/preview : `apps/native/app/(tabs)/documents.tsx`
- [x] **Sélection zone d'intérêt** (crop) — `allowsEditing:true` (galerie + caméra)
- [x] Distinguer **scan ordonnance** vs **compte rendu** — champ `documentType` (prescription/report/unknown) extrait par l'IA
- [x] Écran **validation/correction** — `PrescriptionDetailDialog`/`Form` (poll + auto-remplit ; branches `failed` + report/unknown)
- [x] Retour auto vers documents (carte ordonnance refetch) après save
- [x] **Multi-pages** : `storageKeys[]` sur le raw, `images[]` en un appel Ollama, UI « Add page »
- [x] Reports exclus de l'ordonnance unifiée (`recomputeUnifiedView` filtre `documentType==="report"`)

**À faire (dépend 6.6)**
- [ ] Cas compte rendu : router vers liste examens + écran dédié (modèle Exam = 6.6). Aujourd'hui : classification persistée + placeholder « gestion à venir »

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
