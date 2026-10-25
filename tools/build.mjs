#!/usr/bin/env node
/*
  DÉCLIC — petit outil de livraison, sans dépendance.

  Il fait deux choses :
  1. il inline le sprite d'illustrations (assets/illustrations/sprite.svg)
     dans index.html, entre les repères ILLUSTRATIONS:START / END.
     Pourquoi inline plutôt qu'en <img> ou en <use src="..."> : sur GitHub Pages
     comme en local (file://), un <use> vers un fichier externe est bloqué par
     la politique d'origine. Inline, les scènes s'affichent partout, sans requête.
  2. il vérifie que chaque scène appelée dans index.html existe bien dans le sprite.

  Usage :
    node tools/build.mjs           # réécrit index.html
    node tools/build.mjs --check   # ne modifie rien, sort en erreur si désynchronisé
*/
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cheminHtml = resolve(racine, 'index.html');
const cheminSprite = resolve(racine, 'assets/illustrations/sprite.svg');

const DEBUT = '<!-- ILLUSTRATIONS:START -->';
const FIN = '<!-- ILLUSTRATIONS:END -->';

const sprite = readFileSync(cheminSprite, 'utf8').trim();
const html = readFileSync(cheminHtml, 'utf8');

const iDebut = html.indexOf(DEBUT);
const iFin = html.indexOf(FIN);
if (iDebut === -1 || iFin === -1 || iFin < iDebut) {
  console.error('Repères ILLUSTRATIONS:START / END introuvables dans index.html.');
  process.exit(1);
}

/* Le bloc d'illustrations est enveloppé dans un conteneur hors flux :
   les <symbol> restent utilisables par <use>, mais ne prennent aucune place. */
const bloc = `${DEBUT}
  <div class="sprite" aria-hidden="true">
${sprite.split('\n').map((l) => (l ? '    ' + l : l)).join('\n')}
  </div>
  ${FIN}`;

const nouveau = html.slice(0, iDebut) + bloc + html.slice(iFin + FIN.length);

/* — vérification des références — */
/* Certains symboles ne sont appelés qu'à l'exécution par script.js : les
   pictogrammes de contexte sont injectés dans l'étiquette de la carte. */
const IDS_DYNAMIQUES = ['g-maison', 'g-bureau', 'g-dehors', 'g-trajet', 'g-ensemble'];

const idsSprite = new Set([...sprite.matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1]));
const dansLaPage = [...nouveau.matchAll(/<use href="#([^"]+)"/g)].map((m) => m[1]);
const idsUtilises = new Set(dansLaPage.concat(IDS_DYNAMIQUES));
const manquants = [...idsUtilises].filter((id) => !idsSprite.has(id));

if (manquants.length) {
  console.error('Références d’illustration introuvables dans le sprite :', manquants.join(', '));
  process.exit(1);
}

const orphelins = [...idsSprite].filter((id) => !idsUtilises.has(id));

if (process.argv.includes('--check')) {
  if (nouveau !== html) {
    console.error('index.html n’est pas synchronisé avec le sprite. Lance : node tools/build.mjs');
    process.exit(1);
  }
  console.log(`Sprite à jour — ${idsSprite.size} symboles, ${new Set(dansLaPage).size} dans la page, ${IDS_DYNAMIQUES.length} à l'exécution.`);
  if (orphelins.length) console.log('Symboles jamais utilisés :', orphelins.join(', '));
  process.exit(0);
}

writeFileSync(cheminHtml, nouveau);
console.log(`index.html mis à jour — ${idsSprite.size} symboles, ${new Set(dansLaPage).size} dans la page, ${IDS_DYNAMIQUES.length} à l'exécution.`);
if (orphelins.length) console.log('Symboles jamais utilisés :', orphelins.join(', '));
