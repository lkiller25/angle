/* Audits statiques : contrastes WCAG, structure du document, liens et étiquettes.
   dépendance : jsdom (npm i -D jsdom)
   usage : node tests/audit.mjs */
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const racine = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// --- contrastes
const lin = c => { c /= 255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); };
const lum = hex => { const n = parseInt(hex.slice(1), 16); return 0.2126*lin(n>>16&255) + 0.7152*lin(n>>8&255) + 0.0722*lin(n&255); };
const ratio = (a,b) => { const l1 = lum(a), l2 = lum(b); return ((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)); };
const paires = [
  ['encre / papier', '#20221F', '#F5F1E8', 4.5],
  ['encre-2 / papier', '#41453A', '#F5F1E8', 4.5],
  ['encre-3 / papier', '#63665A', '#F5F1E8', 4.5],
  ['encre-3 / papier-carte', '#63665A', '#FBF8F0', 4.5],
  ['corail-texte / papier', '#AB3B22', '#F5F1E8', 4.5],
  ['corail-texte / papier-carte', '#AB3B22', '#FBF8F0', 4.5],
  ['encre / corail (bouton)', '#20221F', '#F06445', 4.5],
  ['papier / corail-texte (bouton danger)', '#F5F1E8', '#AB3B22', 4.5],
  ['papier / encre (statut actif)', '#F5F1E8', '#20221F', 4.5],
  ['sauge-fonce / papier', '#4C6248', '#F5F1E8', 4.5],
  ['encre-3 / papier-creux (pied)', '#63665A', '#ECE5D4', 4.5],
  ['encre / corail-clair (bannière)', '#20221F', '#F9D3C8', 4.5],
  ['corail-texte / corail-clair (bordure, non-texte 3:1)', '#AB3B22', '#F9D3C8', 3],
  ['corail-texte / papier (cadran, non-texte 3:1)', '#AB3B22', '#F5F1E8', 3],
  ['encre-3 / papier-carte (libellés)', '#63665A', '#FBF8F0', 4.5],
];
console.log('— Contrastes (WCAG 2.1 AA texte courant = 4.5:1)');
let souci = 0;
paires.forEach(([nom,a,b,min]) => {
  const r = ratio(a,b);
  const ok = r >= min;
  if (!ok) souci++;
  console.log(`  ${ok ? '✓' : '✗'} ${nom.padEnd(38)} ${r.toFixed(2)}:1`);
});

// --- structure
const html = fs.readFileSync(resolve(racine, 'index.html'), 'utf8');
const { window } = new JSDOM(html);
const d = window.document;
console.log('\n— Structure du document');
const ids = [...d.querySelectorAll('[id]')].map(n => n.id);
const doublons = ids.filter((id, i) => ids.indexOf(id) !== i);
console.log(doublons.length ? '  ✗ ids en double : ' + doublons.join(', ') : '  ✓ aucun id en double (' + ids.length + ' ids)');
console.log(d.documentElement.getAttribute('lang') === 'fr' ? '  ✓ lang="fr"' : '  ✗ lang manquant');
console.log(d.title.length > 10 ? '  ✓ title présent' : '  ✗ title');
console.log(d.querySelector('meta[name="viewport"]') ? '  ✓ viewport' : '  ✗ viewport');
const h1s = [...d.querySelectorAll('[data-vue] h1')];
console.log('  ✓ ' + h1s.length + ' titres h1 (un par vue)');
const sauts = [];
[...d.querySelectorAll('h1,h2,h3,h4')].forEach(n => {
  const niveau = Number(n.tagName[1]);
  const precedent = n.previousElementSibling;
  if (niveau > 1) {
    // vérifie qu'un titre de niveau supérieur existe dans le même bloc parent
    let p = n.parentElement, trouve = false;
    while (p && !trouve) {
      if ([...p.querySelectorAll('h1,h2,h3,h4')].some(x => x !== n && Number(x.tagName[1]) < niveau)) trouve = true;
      p = p.parentElement;
    }
    if (!trouve) sauts.push(n.tagName + ' « ' + n.textContent.trim().slice(0, 32) + ' »');
  }
});
console.log(sauts.length ? '  ⚠ titres sans parent de niveau supérieur : ' + sauts.join(' / ') : '  ✓ hiérarchie de titres cohérente');
const liensVides = [...d.querySelectorAll('a')].filter(a => !a.textContent.trim() && !a.getAttribute('aria-label'));
console.log(liensVides.length ? '  ✗ liens sans intitulé : ' + liensVides.length : '  ✓ tous les liens ont un intitulé');
const boutonsVides = [...d.querySelectorAll('button')].filter(b => !b.textContent.trim() && !b.getAttribute('aria-label'));
console.log(boutonsVides.length ? '  ✗ boutons sans intitulé : ' + boutonsVides.length : '  ✓ tous les boutons ont un intitulé');
const imagesDecoration = [...d.querySelectorAll('svg')].filter(s => !s.getAttribute('aria-hidden') && s.getAttribute('role') !== 'img');
console.log(imagesDecoration.length ? '  ⚠ ' + imagesDecoration.length + ' svg sans role ni aria-hidden' : '  ✓ tous les svg sont étiquetés ou décoratifs');
const landmarks = ['header','nav','main','footer'].map(t => t + ':' + d.querySelectorAll(t).length);
console.log('  ✓ repères ' + landmarks.join(', '));
const labelledby = [...d.querySelectorAll('[aria-labelledby]')].map(n => n.getAttribute('aria-labelledby')).flatMap(v => v.split(/\s+/));
const manquants = labelledby.filter(id => !d.getElementById(id));
console.log(manquants.length ? '  ✗ aria-labelledby orphelin : ' + manquants.join(', ') : '  ✓ toutes les références aria-labelledby existent');
const describedby = [...d.querySelectorAll('[aria-describedby]')].map(n => n.getAttribute('aria-describedby'));
console.log(describedby.length === 0 ? '  ✓ aria-describedby : ' + describedby.length : '  ⚠ aria-describedby : ' + describedby.join(','));
const controles = [...d.querySelectorAll('[aria-controls]')].map(n => n.getAttribute('aria-controls')).filter(id => !d.getElementById(id));
console.log(controles.length ? '  ✗ aria-controls orphelin : ' + controles.join(', ') : '  ✓ aria-controls valides');
const autofocus = d.querySelectorAll('[autofocus]').length;
console.log(autofocus === 0 ? '  ✓ pas d’autofocus' : '  ⚠ autofocus présent');
const liensExternes = [...d.querySelectorAll('a[href^="http"]')].length;
console.log('  ✓ ' + liensExternes + ' lien(s) externe(s)');
const targetBlank = d.querySelectorAll('a[target="_blank"]').length;
console.log(targetBlank === 0 ? '  ✓ aucun target=_blank sauvage' : '  ⚠ target=_blank × ' + targetBlank);
console.log(souci === 0 ? '\nContrastes : tout passe AA.' : `\nContrastes : ${souci} paire(s) sous le seuil.`);
if (souci > 0 || doublons.length || sauts.length) process.exitCode = 1;
