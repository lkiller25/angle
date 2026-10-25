/* Vérifie la bibliothèque éditoriale — aucune dépendance, Node seul.
   usage : node tests/defis.mjs */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const racine = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(resolve(racine, 'data/defis.js'), 'utf8');
const window = {};
new Function('window', src)(window);
const D = window.DECLIC_DEFIS;
const CATS = ['creer','observer','reflechir','bouger','partager'];
const CTX = ['maison','bureau','dehors','trajet','ensemble'];
const ids = new Set(); let err = [];
const seenTitles = new Set();
D.forEach((d, i) => {
  if (ids.has(d.id)) err.push('id dupliqué: '+d.id); ids.add(d.id);
  if (seenTitles.has(d.titre)) err.push('titre dupliqué: '+d.titre); seenTitles.add(d.titre);
  if (!CATS.includes(d.categorie)) err.push('catégorie: '+d.id);
  if (![5,15,30].includes(d.duree)) err.push('durée: '+d.id);
  if (!Array.isArray(d.contextes) || !d.contextes.length) err.push('contextes: '+d.id);
  d.contextes.forEach(c => { if (!CTX.includes(c)) err.push('contexte invalide '+c+' dans '+d.id); });
  if (!Array.isArray(d.materiel) || !d.materiel.length) err.push('matériel: '+d.id);
  if (!d.consigne || d.consigne.length < 40) err.push('consigne courte: '+d.id);
  if (!Array.isArray(d.etapes) || d.etapes.length < 2 || d.etapes.length > 4) err.push('étapes '+ (d.etapes||[]).length +': '+d.id);
  if (!d.variante || d.variante.length < 30) err.push('variante: '+d.id);
  if (!d.question) err.push('question manquante: '+d.id);
  if (/TODO|lorem|xxx/i.test(JSON.stringify(d))) err.push('texte provisoire: '+d.id);
});
console.log('Défis:', D.length, '| erreurs:', err.length);
err.forEach(e => console.log('  ✗', e));
if (err.length) process.exitCode = 1;

const buckets = {};
D.forEach(d => { const k = d.categorie+'/'+d.duree; buckets[k]=(buckets[k]||0)+1; });
console.log('\nRépartition catégorie/durée:');
CATS.forEach(c => console.log(' ', c.padEnd(10), [5,15,30].map(x => `${x}min:${buckets[c+'/'+x]||0}`).join('  ')));

const combos = [];
CATS.forEach(c => [5,15,30].forEach(d => CTX.forEach(x => {
  const n = D.filter(z => z.categorie===c && z.duree===d && z.contextes.includes(x)).length;
  if (!n) combos.push(`${c}/${d}/${x}`);
})));
console.log('\nCombinaisons sans résultat (sur ' + (CATS.length*3*CTX.length) + '):', combos.length);
console.log(combos.join(', '));
const ctxCount = {}; CTX.forEach(x => ctxCount[x] = D.filter(z=>z.contextes.includes(x)).length);
console.log('\nDéfis par contexte:', ctxCount);
console.log('Titres >', 42, 'car :', D.filter(d=>d.titre.length>42).map(d=>d.titre).length);
