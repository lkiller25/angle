# DÉCLIC

**Quelques minutes. Une autre façon de voir.**

DÉCLIC transforme un moment libre en petite expérience créative à vivre maintenant. On arrive sans idée, on choisit son temps et son envie, on repart avec quelque chose de concret à essayer.

Site statique en HTML, CSS et JavaScript vanilla. Aucun backend, aucune API, aucune dépendance à l’exécution. Hébergement prévu : GitHub Pages.

---

## 1. Intention artistique

**L’atelier des possibles.** Pas un tableau de bord, pas une page de cartes et d’icônes : un atelier éditorial où des objets ordinaires deviennent des portes d’entrée. Un carnet ouvert au centre, une fenêtre qui montre plusieurs façons de voir, une tasse dont la vapeur devient des formes, un crayon dont le trait devient un chemin, une feuille pliée en paysage, deux bulles qui se répondent.

Trois partis pris tiennent l’ensemble :

1. **Le papier plutôt que l’écran.** Fond ivoire, encre, ombres dures décalées (pas de flou), grain de papier à 5 % d’opacité, filets pleins et pointillés. Les cartes ressemblent à des objets posés sur une table, pas à des composants d’interface.
2. **Une seule couleur d’action.** Le corail #F06445 ne sert qu’à ce qu’on peut faire (bouton principal, indicateur de temps, marque-page, tampon). Le reste de l’interface est neutre. Les autres couleurs — bleu doux, jaune chaud, vert sauge — sont **réservées aux illustrations**.
3. **Le mouvement raconte, il ne décore pas.** Cinq gestes seulement : le trait qui se dessine sous « autre chose », le dépliage de la carte, le motif qui apparaît quand on choisit une envie, le marque-page qui se pose sur les favoris, le tampon discret à l’enregistrement. Aucun ne retarde une action : l’état change immédiatement, l’animation accompagne.

### Typographie

| Rôle | Police | Pourquoi |
|---|---|---|
| Titres | **Fraunces** (variable, axes `opsz`/`SOFT`/`WONK`) | sérif éditoriale à fort caractère, lisible en très grand ; les axes permettent d’adoucir les titres de section |
| Texte | **Instrument Sans** (variable) | sans-sérif sobre, chiffres tabulaires pour les durées et les dates, très bonne tenue en petit corps |

Les deux fichiers `.woff2` sont **auto-hébergés** dans `assets/fonts/` (licence SIL OFL 1.1, copies incluses). Aucun appel à Google Fonts, aucun CDN : le site fonctionne hors ligne et ne transmet aucune requête à un tiers.

### Palette

| Jeton | Valeur | Usage |
|---|---|---|
| `--papier` | `#F5F1E8` | fond |
| `--papier-carte` | `#FBF8F0` | cartes, pages de carnet |
| `--encre` | `#20221F` | texte, traits |
| `--encre-2` | `#41453A` | texte courant secondaire |
| `--encre-3` | `#63665A` | métadonnées (5,2:1) |
| `--corail` | `#F06445` | actions, marque-page, tampon |
| `--corail-texte` | `#AB3B22` | corail lisible en texte (5,5:1) |
| `--bleu` `--jaune` `--sauge` | `#7FA3C4` `#E8B54B` `#8FA98C` | **illustrations uniquement** |

Tous les contrastes de texte ont été calculés : le plus faible couple texte/fond utilisé est à 4,67:1 (pied de page), au-dessus du seuil AA de 4,5:1. Le cadran de temps utilise volontairement le corail d’encre (5,5:1) plutôt que le corail vif, pour rester perceptible comme trait fin.

### Illustrations — méthode employée

**Aucune image générée par IA n’est utilisée.** Les illustrations sont des **fichiers SVG écrits à la main** pour ce projet, réunis dans une seule source : `assets/illustrations/sprite.svg`.

Elles partagent une grammaire explicite, documentée en tête du fichier :

- trait d’encre 2,2 px, bouts et jonctions arrondis, jamais parfaitement rectiligne ;
- papier clair `#FFFDF7` devant, `#F1EADA` derrière, ombre portée **dure** décalée de 4 à 6 px (`#DDD3BE`) ;
- mêmes couleurs secondaires, même vue de trois-quarts, même ligne de sol.

21 symboles au total : 16 appelés directement dans la page, 5 pictogrammes de contexte injectés à l’exécution par le script. Les scènes :

| Fichier / symbole | Rôle |
|---|---|
| `ill-accueil` | scène d’accueil : le carnet DÉCLIC entouré de son petit monde |
| `ill-creer` · `ill-observer` · `ill-reflechir` · `ill-bouger` · `ill-partager` | les cinq envies, utilisées comme motif de carte, vignette d’accueil et visuel de fiche |
| `ill-carnet-vide` | carnet vide (accueil + état vide du carnet) |
| `ill-favoris-vide` | marque-page encore libre (état vide des favoris) |
| `ill-aucun-resultat` | éléments qu’on peut réarranger (aucun résultat, carte impossible) |
| `ill-tampon` | tampon « enregistré » |
| `g-creer` … `g-partager`, `g-maison` … `g-ensemble`, `marque` | pictogrammes 24×24 de catégorie et de contexte, signe de la marque (utilisés à l’exécution pour les contextes) |

Chaque scène est vérifiée par rastérisation pendant le développement (rendu PNG) pour contrôler la composition : aucun fichier d’illustration n’est déclaré s’il n’existe pas.

Le sprite est **inliné** dans `index.html` (entre les repères `ILLUSTRATIONS:START/END`) : un `<use>` vers un fichier externe est bloqué par la politique d’origine en `file://` comme sur certaines configurations GitHub Pages. Inliné, les scènes s’affichent partout, sans requête réseau supplémentaire.

---

## 2. Ce que fait le produit

### L’expérience signature : la carte qui s’ouvre

1. La carte arrive **partiellement fermée** : seule sa couverture est visible, avec un cadran neutre et une zone de motif en pointillés.
2. **Le choix de la durée** fait pivoter l’aiguille et remplit l’arc du cadran (5 / 15 / 30 minutes).
3. **Le choix de l’envie** révèle le motif illustré correspondant, avec une courte transition de dépliage (l’ancien motif sort, le nouveau entre).
4. **Le choix du contexte** vient poser une étiquette inclinée (« Dehors », « En train de… ») qui complète la composition.
5. **« Ouvrir mon déclic »** déplie le rabat et révèle l’activité : catégorie, durée, contexte, consigne, étapes numérotées, matériel, variante accessible, question facultative.

Aucune simulation de chargement, aucune fausse génération : la carte lit une bibliothèque locale de 40 défis.

### Fonctionnalités livrées

- **Sélection** par durée (5/15/30), par envie (5 catégories) et par contexte (5 lieux).
- **40 défis** écrits à la main, avec identifiant stable, titre éditorial, catégorie, durée, contextes, matériel, consigne, 3 à 4 étapes, variante plus accessible, question facultative.
- **« Une autre idée »** : propose un autre défi compatible avec les mêmes réglages, sans jamais modifier le contexte choisi.
- **Recherche et filtres** dans la bibliothèque (texte libre accent-insensible, envie, durée, contexte), avec les filtres reflétés dans l’URL (partageables, retour arrière fonctionnel).
- **Aucun résultat** : l’état vide explique ce qui ne correspond pas et propose d’élargir **sans jamais modifier un filtre à la place de l’utilisateur** (chaque suggestion indique le nombre de résultats qu’elle ouvrirait).
- **Favoris** : ajout/retrait depuis la carte et depuis les fiches, marque-page illustré qui se pose, compteur dans la navigation.
- **Défi en cours récupérable** après rechargement (réglages, défi ouvert, état de la carte).
- **Carnet** : statut *réalisé / essayé / passé*, note libre (2 000 caractères), modification, suppression avec **boîte de dialogue de confirmation** native (`<dialog>`), export/import JSON.
- **Gestion du stockage** : indisponible (navigation privée, réglages) → bannière explicite et mode dégradé assumé ; saturé (`QuotaExceededError`) → message dédié invitant à exporter ; données corrompues → copie brute conservée de côté, carnet reparti proprement ; idées inconnues ou statuts invalides → écartés et **signalés à l’utilisateur**.
- **Import** : aperçu obligatoire avant application (nombre de pages, de favoris, date d’export, entrées ignorées), remplacement complet annoncé.

### Partis pris de contenu

- Les données du carnet et des favoris **commencent vides** : aucun historique inventé.
- Aucun compteur de visiteurs, aucun témoignage, aucune urgence, aucune publicité, aucun compte.
- Le nombre de défis n’est jamais présenté comme un score personnel. Le carnet affiche « 3 pages — 2 réalisés, 1 essayé », sans note ni niveau.
- Aucune promesse psychologique, aucun bénéfice médical, aucun vocabulaire de performance.
- Aucun défi dangereux, aucun achat, aucune publication imposée, aucun contact avec des inconnus, aucun effort intense. Chaque défi « bouger » et « partager » a une variante assise, immobile ou en solo.

---

## 3. Contenu des défis

`data/defis.js` — 40 défis, répartis sur 5 catégories et 3 durées.

| Envie | 5 min | 15 min | 30 min |
|---|---|---|---|
| Créer | 3 | 2 | 3 |
| Observer | 3 | 3 | 2 |
| Réfléchir | 3 | 3 | 2 |
| Bouger doucement | 3 | 3 | 3 |
| Partager | 3 | 2 | 2 |

Sur les 75 combinaisons possibles (envie × durée × contexte), **une seule** ne renvoie aucun résultat : *bouger / 30 min / en déplacement*. Ce trou est volontairement laissé pour que l’état vide soit réellement atteignable et testable dans le produit — mais il est rare, et l’utilisateur est toujours guidé vers une combinaison voisine.

---

## 4. Installation et déploiement

### En local (le plus simple)

```bash
git clone <ce dépôt>
cd angle
python3 -m http.server 8000      # ou : npx serve .
# puis ouvrir http://localhost:8000
```

Le site fonctionne aussi par **double-clic sur `index.html`** (protocole `file://`) : aucun module ES, aucun `fetch`, aucun `<use>` externe. Seule différence : sur certains navigateurs, `localStorage` est restreint en `file://` — DÉCLIC le détecte, l’annonce et reste utilisable.

### Sur GitHub Pages

1. Pousser le dépôt sur GitHub.
2. `Settings → Pages → Build and deployment → Source : Deploy from a branch`, branche `main`, dossier `/ (root)`.
3. Le site est publié à l’adresse `https://<compte>.github.io/<dépôt>/`.

Aucune étape de build n’est nécessaire : les fichiers sont servis tels quels.

### Modifier les illustrations

La source unique est `assets/illustrations/sprite.svg`. Après modification :

```bash
node tools/build.mjs          # réinjecte le sprite dans index.html
node tools/build.mjs --check  # vérifie que index.html est à jour (sortie ≠ 0 sinon)
```

L’outil vérifie aussi que chaque `<use href="#…">` de la page pointe vers une scène existante, y compris les pictogrammes injectés à l’exécution — il échoue plutôt que de laisser une illustration manquante.

### Arborescence

```
index.html                        page complète (sprite d’illustrations inliné)
style.css                         feuille de style unique, commentée par sections
script.js                         logique du produit (vanilla, IIFE, sans module)
data/defis.js                     bibliothèque éditoriale des 40 défis
assets/illustrations/sprite.svg   source des 21 symboles SVG
tests/                            4 suites de test rejouables (Node, jsdom, Playwright)
package.json                      scripts de test et de build (aucune dépendance à l’exécution)
assets/fonts/                     Fraunces + Instrument Sans (.woff2) + licences OFL
tools/build.mjs                   inlining du sprite + vérification des références
ANGLE-redesign-complet/           ancien projet ANGLE conservé tel quel (archive)
```

---

## 5. Tests réellement exécutés

Environnement : Node 22, jsdom 30 (tests DOM) et **Chromium (build headless) piloté par Playwright** pour les tests navigateur et les captures. Rien de tout cela n’est nécessaire pour faire tourner le site.

### Séries automatisées — **132 vérifications, 0 échec**

| Série | Vérifications | Commande | Résultat |
|---|---|---|---|
| Bibliothèque éditoriale (Node seul) | 40 défis validés + 75 combinaisons | `npm run test:defis` | ✅ |
| Logique et DOM (jsdom) | 101 | `npm run test:dom` | ✅ |
| Navigateur réel : suppression, export, import, stockage, mouvement réduit, clavier | 31 | `npm run test:navigateur` | ✅ |
| Audits structure et contraste | 14 paires + 14 contrôles | `npm run test:audit` | ✅ |

Les quatre suites sont livrées dans `tests/` et rejouables :

```bash
npm install                                   # jsdom + playwright (outils de test uniquement)
npx playwright install chromium               # une seule fois
npm run serve                                 # dans un autre terminal
npm run test                                  # check + defis + dom + audit
npm run test:navigateur                       # nécessite le serveur local
```

**Couvert — logique et produit (jsdom)**

- chargement, cinq vues, un seul `<h1>` par vue, carte fermée au départ, contenu replié annoncé masqué ;
- navigation vers « Trouver mon déclic » depuis l’action principale ;
- la carte répond aux trois choix (durée → cadran, envie → motif, contexte → étiquette), état « complet » puis bouton actif ;
- ouverture : `data-etat`, `aria-expanded`, `inert`, actions secondaires, titre, étapes, matériel, variante, question, numéro éditorial ;
- cohérence défi/filtres : le défi proposé respecte toujours les trois choix ;
- « Une autre idée » change de défi **et conserve le contexte** ;
- favoris : état, marque-page posé, pastille, persistance ;
- carnet : ajout, tampon, nombre de pages, note enregistrée, statut modifié, compte par statut, focus conservé après changement de statut ;
- bibliothèque : 40 idées sans filtre, recherche sans résultat (état vide + suggestions), recherche pertinente (« stylo »), filtres reflétés dans l’URL, filtres jamais modifiés d’office, suggestion appliquée, réinitialisation ;
- lien direct `#/defi/<id>` : ouvre l’atelier, bon défi, réglages synchronisés ;
- **récupération après rechargement** : carte rouverte, défi et carnet restaurés ;
- suppression : dialogue, annulation, confirmation, persistance ;
- **stockage saturé** : bannière, message explicite, interface toujours fonctionnelle.

**Couvert — navigateur réel (Chromium)**

- dialogue de confirmation (annuler ≠ confirmer), suppression persistée ;
- **export** : téléchargement réel, nom daté `declic-carnet-AAAA-MM-JJ.json`, contenu étiqueté ;
- **import** : aperçu affiché avec les entrées invalides dénombrées, application, idées inconnues écartées, données écrites en local ;
- **stockage indisponible** (`localStorage` levée) : bannière, carte utilisable, message de repli honnête « cette session seulement » ;
- **`prefers-reduced-motion: reduce`** : contenu lisible et message affiché immédiatement, sans attendre d’animation ;
- **clavier seul** : lien d’évitement en premier, action principale atteignable, `Entrée` déclenche, focus porté sur le titre de la vue, flèches sur le groupe de durées, ouverture au clavier, anneau de focus visible (3 px) ;
- **aucune erreur console** ni requête en échec sur les parcours testés ;
- **aucun débordement horizontal** à 320, 390, 768 et 1440 px, sur les vues accueil / trouver / explorer / favoris / carnet, carte ouverte.

**Couvert — statique**

- 40 défis : identifiants uniques, catégories et durées valides, 2 à 4 étapes, variante et question présentes, aucun texte provisoire ;
- 75 combinaisons de filtres calculées (1 seule vide, documentée) ;
- contrastes : 14 paires calculées, toutes ≥ 4,5:1 pour le texte et ≥ 3:1 pour les éléments non textuels ;
- structure : aucun `id` en double, `lang="fr"`, repères `header`/`nav`/`main`/`footer`, `aria-labelledby`/`aria-controls` valides, aucun lien ou bouton sans intitulé, aucun `autofocus`, aucun `target="_blank"`, aucun `href="#"` mort, tous les champs étiquetés.

### Non couvert — limites assumées

- **Pas de test avec lecteur d’écran réel** (NVDA, VoiceOver, TalkBack). L’ordre de focus, les noms accessibles et les annonces `aria-live` ont été vérifiés dans le DOM, pas à l’oreille.
- **Chromium uniquement** : Firefox et Safari n’ont pas été exécutés. Les points sensibles sont `inert` (Safari ≥ 15.5), `color-mix()` (progressif, avec repli visuel) et `<dialog>` (repli `window.confirm` prévu dans le code).
- **Pas de test utilisateur** : la promesse, la durée des défis et la lisibilité éditoriale n’ont pas été validées par de vraies personnes.
- **Pas de test de zoom navigateur au-delà de 200 %** ni de mode contraste élevé forcé.
- L’import ne **fusionne** pas : il remplace. C’est annoncé dans l’aperçu, mais c’est un choix discutable pour un usage à deux appareils.
- Le rendu du grain (`feTurbulence` en data URI) varie légèrement selon le moteur ; il est purement décoratif et disparaît à l’impression.
- La bibliothèque est **statique et locale** : pas de mise à jour à distance, pas de contribution d’utilisateurs.

---

## 6. Contraintes respectées

- HTML, CSS et JavaScript vanilla ; aucun backend, aucune API payante, aucun compte.
- Compatible GitHub Pages et `file://`.
- `localStorage` avec vérification d’écriture, gestion du quota et des données corrompues.
- Toute saisie (note du carnet, recherche, import JSON) est insérée via `textContent` / `replaceChildren` : **aucune injection HTML possible**, y compris depuis un fichier importé.
- Responsive de 320 px à 1440 px, utilisable au clavier, aucune information essentielle dépendante du mouvement.
- Aucun bouton factice, aucun lien mort, aucune dépendance lourde.

---

## 7. Archive

L’ancien projet ANGLE (prototype Fortnite, fichiers `index.html` / `style.css` / `script.js` d’origine) est **conservé sans modification** dans `ANGLE-redesign-complet/`. DÉCLIC occupe désormais la racine du dépôt.
