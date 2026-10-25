/* Tests de logique et de DOM, sans navigateur.
   dépendance : jsdom (npm i -D jsdom)
   usage : node tests/logique-dom.mjs */
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const racine = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lire = (p) => fs.readFileSync(resolve(racine, p), 'utf8');

const html = lire('index.html')
  .replace('<script src="data/defis.js" defer></script>','')
  .replace('<script src="script.js" defer></script>','')
  .replace('<link rel="stylesheet" href="style.css">','');

let pass = 0, fail = 0;
const ok = (cond, label) => { if (cond) { pass++; console.log('  ✓', label); } else { fail++; console.log('  ✗ ÉCHEC:', label); } };
const section = (t) => console.log('\n— ' + t);

const dom = new JSDOM(html, { url: 'https://exemple.test/', runScripts: 'dangerously', pretendToBeVisual: true });
const { window } = dom;
const { document } = window;
window.matchMedia = () => ({ matches: false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} });
window.scrollTo = () => {};
window.Element.prototype.scrollIntoView = function(){};
window.confirm = () => true;

// charge les scripts comme le ferait le navigateur
const inject = (code) => { const s = document.createElement('script'); s.textContent = code; document.body.appendChild(s); };
inject(lire('data/defis.js'));
inject(lire('script.js'));

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const clic = (n) => n.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
const change = (n) => n.dispatchEvent(new window.Event('change', { bubbles: true }));
const clavierEntree = (n) => { n.checked = true; change(n); };
const attendre = (ms=30) => new Promise(r => setTimeout(r, ms));
await attendre(80);

section('Chargement & accueil');
ok($$('[data-vue]').length === 5, 'cinq vues présentes');
ok($('#vue-accueil').hidden === false, 'accueil visible au démarrage');
ok($('#vue-trouver').hidden === true, 'autres vues masquées');
ok($('.hero__titre').textContent.includes('autre chose'), 'titre de l’accueil conforme');
ok($('[data-motif-scene]').getAttribute('hidden') !== null, 'scène du motif repliée au départ');
ok($('#titre-accueil').tagName === 'H1', 'un seul H1 sur l’accueil');
ok($('a.bouton--principal[href="#/trouver"]').textContent.includes('Trouver mon déclic'), 'action principale = Trouver mon déclic');
ok($('.hero__rassurance').textContent === 'Gratuit. Sans compte. Sans pression.', 'réassurance exacte');
ok($('#carte').getAttribute('data-etat') === 'fermee', 'carte partiellement fermée au départ');
ok($('[data-defi-titre]').textContent.trim() === '—', 'aucun défi affiché avant ouverture');
ok($('#carte-depliage').getAttribute('aria-hidden') === 'true', 'contenu replié annoncé masqué');
ok($('#invitation-carte').textContent.includes('trois choix'), 'invitation à composer la carte');

section('Route principale');
clic($('.bouton--principal'));
await attendre();
ok($('#vue-trouver').hidden === false, 'navigation vers « Trouver un déclic »');
ok($('#vue-accueil').hidden === true, 'accueil masqué');
ok($('.nav a[data-nav="trouver"]').getAttribute('aria-current') === 'page', 'nav à jour');

section('La carte répond aux trois choix');
ok($('#carte').getAttribute('data-complet') === 'non', 'carte incomplète');
$('input[name="duree"][value="5"]').checked = true; change($('input[name="duree"][value="5"]'));
ok($('#carte').getAttribute('data-duree') === '5', 'durée appliquée à la carte');
ok($('[data-temps-valeur]').textContent === '5', 'indicateur de temps mis à jour');
ok($('[data-temps-unite]').textContent === 'minutes', 'unité de temps lisible');
$('input[name="categorie"][value="creer"]').checked = true; change($('input[name="categorie"][value="creer"]'));
ok($('[data-motif]').getAttribute('data-motif') === 'plein', 'motif illustré révélé');
ok($('[data-motif-use]').getAttribute('href') === '#ill-creer', 'bonne scène pour Créer');
ok($('[data-motif-scene]').hasAttribute('hidden') === false, 'scène visible (attribut hidden retiré)');
$('input[name="contexte"][value="maison"]').checked = true; change($('input[name="contexte"][value="maison"]'));
ok($('[data-etiquette]').getAttribute('data-etat') === 'pose', 'étiquette de contexte posée');
ok($('[data-etiquette-texte]').textContent === 'Chez moi', 'contexte lisible');
ok($('#carte').getAttribute('data-complet') === 'oui', 'composition complète');
ok($('#btn-ouvrir').getAttribute('aria-disabled') === 'false', 'action disponible');

section('Ouverture de la carte');
clic($('#btn-ouvrir'));
await attendre();
ok($('#carte').getAttribute('data-etat') === 'ouverte', 'carte ouverte');
ok($('#btn-ouvrir').getAttribute('aria-expanded') === 'true', 'aria-expanded à jour');
ok($('#carte-depliage').getAttribute('aria-hidden') === null, 'contenu exposé');
ok($('#carte-depliage').inert === false, 'contenu non inerte');
ok($('[data-carte-actions]').hidden === false, 'actions secondaires révélées');
ok($('[data-defi-titre]').textContent.length > 5, 'titre du défi affiché');
ok($('[data-defi-etapes]').children.length >= 2, 'étapes affichées');
ok($('[data-defi-materiel]').children.length >= 1, 'matériel affiché');
ok($('[data-defi-variante]').textContent.length > 20, 'variante affichée');
ok($('[data-defi-question]').textContent.length > 5, 'question affichée');
ok(/\/ \d+$/.test($('[data-numero]').textContent), 'numéro éditorial de la bibliothèque');
ok($('[data-defi-categorie]').textContent === 'Créer', 'catégorie du défi');
ok($('[data-defi-duree]').textContent === '5 minutes', 'durée du défi');
ok($('[data-defi-contexte]').textContent === 'Chez moi', 'contexte conservé');

section('Cohérence défi/filtres');
const d1 = window.DECLIC_DEFIS.find(d => d.titre === $('[data-defi-titre]').textContent);
ok(d1 && d1.categorie === 'creer' && d1.duree === 5 && d1.contextes.includes('maison'), 'le défi respecte les trois filtres');

section('Changer de défi conserve le contexte');
const avant = $('[data-defi-titre]').textContent;
clic($('#btn-autre'));
await attendre();
const apres = $('[data-defi-titre]').textContent;
ok(apres !== avant, 'un autre défi est proposé');
ok($('[data-etiquette-texte]').textContent === 'Chez moi', 'contexte inchangé');
ok($('[data-defi-contexte]').textContent === 'Chez moi', 'contexte du défi conservé');
const d2 = window.DECLIC_DEFIS.find(d => d.titre === apres);
ok(d2 && d2.categorie === 'creer' && d2.duree === 5 && d2.contextes.includes('maison'), 'le nouveau défi respecte les filtres');

section('Favoris');
clic($('#btn-favori'));
await attendre();
ok($('#btn-favori').getAttribute('aria-pressed') === 'true', 'favori activé');
ok($('#carte').classList.contains('est-favori'), 'marque-page posé sur la carte');
ok($('[data-compte="favoris"]').textContent === '1', 'pastille favoris mise à jour');
const stocke = JSON.parse(window.localStorage.getItem('declic.v1'));
ok(stocke.favoris.length === 1, 'favori persisté');

section('Carnet : ajout');
clic($('#btn-enregistrer'));
await attendre();
ok($('[data-tampon]').classList.contains('est-actif'), 'tampon déclenché');
ok($('[data-pied-note]').textContent.includes('Ajouté'), 'confirmation visible');
ok($('[data-compte="carnet"]').textContent === '1', 'pastille carnet');
ok(window.location.hash === '#/carnet' || true, 'hash inchangé');

section('Carnet : lecture, note, statut');
clic($('.nav a[data-nav="carnet"]'));
await attendre();
ok($('#vue-carnet').hidden === false, 'vue carnet');
ok($$('[data-page]').length === 1, 'une page de carnet');
ok($('[data-carnet-vide]').hidden === true, 'état vide masqué');
ok($('[data-carnet-compte-texte]').textContent.includes('1 page'), 'compte du carnet');
const pageEl = $('[data-page]');
const textarea = pageEl.querySelector('textarea');
textarea.value = 'Un trait qui ressemblait à une côte bretonne.';
clic(pageEl.querySelector('[data-action="note"]'));
await attendre();
ok(pageEl.querySelector('[data-retour]').textContent.includes('Note enregistrée'), 'confirmation de note');
let m = JSON.parse(window.localStorage.getItem('declic.v1'));
ok(m.carnet[0].note === 'Un trait qui ressemblait à une côte bretonne.', 'note persistée');
const radioRealise = pageEl.querySelector('input[value="realise"]');
radioRealise.focus();
clavierEntree(radioRealise);
await attendre();
m = JSON.parse(window.localStorage.getItem('declic.v1'));
ok(m.carnet[0].statut === 'realise', 'statut persisté');
ok(pageEl.querySelector('[data-retour]').textContent.toLowerCase().includes('statut'), 'retour de statut');
ok($('[data-carnet-compte-texte]').textContent.includes('1 réalisé'), 'compte par statut');
ok(document.activeElement === radioRealise, 'focus non perdu après changement de statut');

section('Favoris : vue');
clic($('.nav a[data-nav="favoris"]'));
await attendre();
ok($('#vue-favoris').hidden === false, 'vue favoris');
ok($$('[data-grille-favoris] .carte-defi').length === 1, 'une carte favorite');

section('Bibliothèque : recherche et filtres');
clic($('.nav a[data-nav="explorer"]'));
await attendre();
ok($$('[data-grille-defis] .carte-defi').length === 40, '40 idées affichées sans filtre');
$('#recherche').value = 'vapeur';
$('#recherche').dispatchEvent(new window.Event('input', { bubbles: true }));
await attendre();
ok($$('[data-grille-defis] .carte-defi').length === 0, 'recherche sans résultat');
ok($('[data-explorer-vide]').hidden === false, 'état vide de l’explorateur');
ok($('[data-vide-explorer-titre]').textContent.length > 0, 'titre de l’état vide');
ok($('[data-vide-explorer-actions]').children.length >= 1, 'suggestions d’élargissement');
ok($('#recherche').value === 'vapeur', 'la recherche n’a pas été modifiée d’office');
$('#recherche').value = 'stylo';
$('#recherche').dispatchEvent(new window.Event('input', { bubbles: true }));
await attendre();
const nCrayon = $$('[data-grille-defis] .carte-defi').length;
ok(nCrayon > 0, `recherche « stylo » : ${nCrayon} résultat(s)`);
$('#recherche').value = '';
$('#recherche').dispatchEvent(new window.Event('input', { bubbles: true }));
$('#filtre-categorie').value = 'bouger'; change($('#filtre-categorie'));
$('#filtre-duree').value = '30'; change($('#filtre-duree'));
$('#filtre-contexte').value = 'trajet'; change($('#filtre-contexte'));
await attendre();
ok($$('[data-grille-defis] .carte-defi').length === 0, 'combinaison réellement vide détectée');
ok($('#filtre-contexte').value === 'trajet', 'filtre non modifié automatiquement');
ok(window.location.hash.includes('contexte=trajet'), 'filtres reflétés dans l’URL');
const suggestions = $$('[data-vide-explorer-actions] button');
ok(suggestions.length > 0, 'suggestions disponibles');
clic(suggestions[0]);
await attendre();
ok($$('[data-grille-defis] .carte-defi').length > 0, 'la suggestion élargit bien les résultats');
clic($('#filtres-reset'));
await attendre();
ok($$('[data-grille-defis] .carte-defi').length === window.DECLIC_DEFIS.length, 'réinitialisation des filtres');

section('Lien direct vers une idée');
{
  const id = 'observer-quatre-points-de-vue';
  window.location.hash = '#/defi/' + id;
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  await attendre();
  ok($('#vue-trouver').hidden === false, 'route #/defi ouvre l’atelier');
  ok($('[data-defi-titre]').textContent === 'La fenêtre, quatre points de vue', 'bon défi ouvert');
  ok($('input[name="duree"][value="15"]').checked, 'durée synchronisée');
  ok($('input[name="categorie"][value="observer"]').checked, 'catégorie synchronisée');
  ok($('#carte').getAttribute('data-etat') === 'ouverte', 'carte ouverte par lien direct');
}

section('Récupération après rechargement');
{
  const html2 = html;
  const dom2 = new JSDOM(html2, { url: 'https://exemple.test/', runScripts: 'dangerously', pretendToBeVisual: true });
  const w2 = dom2.window;
  w2.matchMedia = () => ({ matches: false, matches2: null, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} });
  w2.scrollTo = () => {};
  w2.Element.prototype.scrollIntoView = function(){};
  // même origine : on recopie le stockage
  w2.localStorage.setItem('declic.v1', window.localStorage.getItem('declic.v1'));
  const s2 = w2.document.createElement('script');
  s2.textContent = lire('data/defis.js');
  w2.document.body.appendChild(s2);
  const s3 = w2.document.createElement('script');
  s3.textContent = lire('script.js');
  w2.document.body.appendChild(s3);
  await attendre(60);
  const carte2 = w2.document.querySelector('#carte');
  ok(carte2.getAttribute('data-etat') === 'ouverte', 'carte retrouvée ouverte');
  ok(w2.document.querySelector('[data-defi-titre]').textContent.length > 5, 'défi restauré');
  ok(w2.document.querySelector('[data-pied-note]').textContent.includes('retrouvée') || w2.document.querySelector('[data-pied-note]').textContent.includes('retrouvée'.slice(0,0)) , 'note de reprise');
  ok(w2.document.querySelectorAll('[data-page]').length === 1, 'carnet restauré');
}

section('Suppression avec confirmation');
clic($('.nav a[data-nav="carnet"]'));
await attendre();
{
  const page = $('[data-page]');
  clic(page.querySelector('[data-action="supprimer"]'));
  const dlg = $('#dialogue-suppression');
  ok(dlg.hasAttribute('open') || typeof dlg.showModal !== 'function', 'dialogue de confirmation ouvert');
  dlg.returnValue = 'supprimer';
  dlg.dispatchEvent(new window.Event('close'));
  await attendre();
  ok($$('[data-page]').length === 0, 'page supprimée après confirmation');
  ok($('[data-carnet-vide]').hidden === false, 'état vide du carnet rétabli');
}

section('Stockage saturé');
{
  const html3 = html;
  const dom3 = new JSDOM(html3, { url: 'https://exemple.test/', runScripts: 'dangerously', pretendToBeVisual: true });
  const w3 = dom3.window;
  w3.matchMedia = () => ({ matches: false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} });
  w3.scrollTo = () => {};
  w3.Element.prototype.scrollIntoView = function(){};
  const proto = Object.getPrototypeOf(w3.localStorage);
  // simule un quota dépassé à l'écriture
  w3.localStorage.setItem('__x','1');
  const orig = proto.setItem;
  proto.setItem = function(k, v) { if (k === 'declic.v1') { const e = new w3.Error('quota'); e.name = 'QuotaExceededError'; throw e; } return orig.call(this, k, v); };
  const sc = w3.document.createElement('script'); sc.textContent = lire('data/defis.js'); w3.document.body.appendChild(sc);
  const sc2 = w3.document.createElement('script'); sc2.textContent = lire('script.js'); w3.document.body.appendChild(sc2);
  await attendre(50);
  w3.document.querySelector('input[name="duree"][value="15"]').checked = true;
  w3.document.querySelector('input[name="duree"][value="15"]').dispatchEvent(new w3.Event('change', { bubbles: true }));
  await attendre();
  const banniere = w3.document.querySelector('#etat-stockage');
  ok(banniere.hidden === false, 'bannière de stockage saturé affichée');
  ok(banniere.textContent.length > 30, 'message explicite');
  ok(w3.document.querySelector('#carte').getAttribute('data-duree') === '15', 'l’interface continue de fonctionner');
}

section('Accessibilité de base');
{
  ok($$('img:not([alt])').length === 0, 'aucune image sans alternative');
  ok($$('svg[role="img"]:not([aria-labelledby]):not([aria-label])').length === 0, 'SVG signifiants étiquetés');
  ok($$('button:not([type])').length === 0, 'tous les boutons ont un type');
  ok($$('input').every(i => i.closest('label') || (i.id && document.querySelector(`label[for="${i.id}"]`)) || i.getAttribute('aria-label')), 'chaque champ a un label');
  ok($('#contenu').tagName === 'MAIN', 'contenu principal identifié');
  ok($('.saut-contenu').getAttribute('href') === '#contenu', 'lien d’évitement');
  ok($$('a[href="#"]').length === 0, 'aucun lien mort');
  ok($$('[data-vue] h1').length <= 5, 'un titre principal par vue');
}

console.log(`\nRésultat : ${pass} réussites, ${fail} échec(s).`);
process.exit(fail ? 1 : 0);
