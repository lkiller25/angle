/* Tests dans un vrai navigateur (Chromium via Playwright) : suppression,
   export, import, stockage indisponible, mouvement réduit, parcours clavier.
   dépendances : npm i -D playwright jsdom  puis  npx playwright install chromium
   usage : npm run serve (autre terminal) puis node tests/navigateur.mjs
   variables : BASE_URL (défaut http://127.0.0.1:8000), CHROMIUM_PATH (optionnel)
*/
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const fs = require('node:fs');

let pkg;
try { pkg = require('playwright'); }
catch { pkg = require('playwright-core'); }

const BASE = process.env.BASE_URL || 'http://127.0.0.1:8000';
const lancement = { headless: true };
if (process.env.CHROMIUM_PATH) {
  lancement.executablePath = process.env.CHROMIUM_PATH;
  lancement.args = ['--no-sandbox'];
  if (process.env.LD_LIBRARY_PATH) {
    lancement.env = Object.assign({}, process.env, { LD_LIBRARY_PATH: process.env.LD_LIBRARY_PATH });
  }
}

const base = BASE + '/index.html';
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; console.log('  ✓', l); } else { fail++; console.log('  ✗ ÉCHEC', l); } };
const browser = await pkg.chromium.launch(lancement);
function ecouter(page, erreurs) {
  page.on('pageerror', e => erreurs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') erreurs.push('console: ' + m.text()); });
}

console.log('— Dialogue de suppression');
{
  const erreurs = [];
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage(); ecouter(page, erreurs);
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.setItem('declic.v1', JSON.stringify({
    version: 1,
    favoris: ['observer-ombres-quartier'],
    carnet: [
      { id: 'p1', defiId: 'observer-ombres-quartier', statut: 'realise', note: 'Les ombres du square indiquaient midi et demi.', cree: '2026-10-20T09:00:00.000Z', maj: '2026-10-20T10:00:00.000Z' },
      { id: 'p2', defiId: 'creer-trait-chemin', statut: 'passe', note: '', cree: '2026-10-19T09:00:00.000Z', maj: '2026-10-19T09:30:00.000Z' }
    ],
    atelier: { duree: 15, categorie: 'observer', contexte: 'dehors', defiId: 'observer-ombres-quartier', ouverte: true }
  })));
  await page.reload({ waitUntil: 'networkidle' });
  await page.goto(base + '#/carnet', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  ok(await page.locator('[data-page]').count() === 2, 'deux pages de carnet restaurées');
  await page.screenshot({ path: '/tmp/shots/12-carnet-rempli.png', fullPage: true });
  await page.locator('[data-page]').first().locator('[data-action="supprimer"]').click();
  await page.waitForTimeout(250);
  ok(await page.locator('#dialogue-suppression').evaluate(d => d.open), 'dialogue modal ouvert');
  await page.screenshot({ path: '/tmp/shots/13-dialogue-suppression.png' });
  // annuler d'abord
  await page.locator('#dialogue-suppression button[value="annuler"]').click();
  await page.waitForTimeout(200);
  ok(await page.locator('[data-page]').count() === 2, 'annulation : rien n’est supprimé');
  // puis confirmer
  await page.locator('[data-page]').first().locator('[data-action="supprimer"]').click();
  await page.waitForTimeout(200);
  await page.locator('#dialogue-suppression button[value="supprimer"]').click();
  await page.waitForTimeout(300);
  ok(await page.locator('[data-page]').count() === 1, 'confirmation : une page supprimée');
  const reste = await page.evaluate(() => JSON.parse(localStorage.getItem('declic.v1')).carnet.length);
  ok(reste === 1, 'suppression persistée');

  console.log('— Export JSON');
  const [dl] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#btn-export').click()
  ]);
  const chemin = '/tmp/export-declic.json';
  await dl.saveAs(chemin);
  const donnees = JSON.parse(fs.readFileSync(chemin, 'utf8'));
  ok(donnees.application === 'DECLIC', 'export étiqueté');
  ok(donnees.carnet.length === 1 && donnees.favoris.length === 1, 'export contient carnet et favoris');
  ok(/declic-carnet-\d{4}-\d{2}-\d{2}\.json/.test(dl.suggestedFilename()), 'nom de fichier daté : ' + dl.suggestedFilename());

  console.log('— Import JSON');
  const importable = {
    application: 'DECLIC', version: 1, exporte: '2026-10-22T12:00:00.000Z',
    favoris: ['bouger-tour-pieuvre', 'inconnu-xyz'],
    carnet: [
      { id: 'i1', defiId: 'partager-question-tasse', statut: 'essaye', note: 'Question posée à la boulangère.', cree: '2026-10-21T08:00:00.000Z', maj: '2026-10-21T08:10:00.000Z' },
      { id: 'i2', defiId: 'defi-qui-nexiste-pas', statut: 'realise', note: 'x', cree: '2026-10-21T08:00:00.000Z' },
      { id: 'i3', defiId: 'creer-titre-de-film', statut: 'statut-bidon', note: '', cree: '2026-10-21T08:00:00.000Z' }
    ]
  };
  fs.writeFileSync('/tmp/import-declic.json', JSON.stringify(importable));
  await page.setInputFiles('#fichier-import', '/tmp/import-declic.json');
  await page.waitForTimeout(400);
  ok(await page.locator('#dialogue-import').evaluate(d => d.open), 'aperçu d’import ouvert');
  const apercu = await page.locator('[data-import-texte]').innerText();
  console.log('    aperçu →', apercu.replace(/\n/g, ' | '));
  ok(/3 entrée/i.test(apercu), 'entrées invalides comptées (3 attendues)');
  await page.screenshot({ path: '/tmp/shots/14-dialogue-import.png' });
  await page.locator('[data-import-confirmer]').click();
  await page.waitForTimeout(400);
  ok(await page.locator('[data-page]').count() === 1, 'import appliqué : une page valide');
  ok(await page.locator('[data-compte="favoris"]').innerText() === '1', 'favori inconnu écarté');
  const apresImport = await page.evaluate(() => JSON.parse(localStorage.getItem('declic.v1')));
  ok(apresImport.carnet[0].defiId === 'partager-question-tasse', 'import écrit en local');
  ok(erreurs.length === 0, 'aucune erreur console : ' + JSON.stringify(erreurs));
  await ctx.close();
}


console.log('— Stockage indisponible');
{
  const erreurs = [];
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('Stockage bloqué'); } });
  });
  const page = await ctx.newPage(); ecouter(page, erreurs);
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  ok(await page.locator('#etat-stockage').isVisible(), 'bannière affichée');
  ok((await page.locator('#etat-stockage').innerText()).includes('indisponible'), 'message explicite');
  await page.click('.bouton--principal');
  await page.check('input[name="categorie"][value="bouger"]');
  await page.check('input[name="duree"][value="5"]');
  await page.check('input[name="contexte"][value="maison"]');
  await page.click('#btn-ouvrir');
  await page.waitForTimeout(500);
  ok(await page.locator('#carte').getAttribute('data-etat') === 'ouverte', 'le produit reste utilisable');
  await page.click('#btn-enregistrer');
  await page.waitForTimeout(300);
  ok((await page.locator('[data-pied-note]').innerText()).includes('session'), 'message de repli honnête');
  ok(erreurs.length === 0, 'aucune erreur JS');
  await ctx.close();
}

console.log('— Mouvement réduit');
{
  const erreurs = [];
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  page.on('pageerror', e => erreurs.push(e.message));
  await page.goto(base + '#/trouver', { waitUntil: 'networkidle' });
  await page.check('input[name="duree"][value="30"]');
  await page.check('input[name="categorie"][value="partager"]');
  await page.check('input[name="contexte"][value="ensemble"]');
  await page.click('#btn-ouvrir');
  await page.waitForTimeout(120);
  ok(await page.locator('[data-defi-titre]').isVisible(), 'titre lisible sans attendre');
  ok(await page.locator('.carte__interieur').evaluate(n => getComputedStyle(n).visibility) === 'visible', 'contenu visible instantanément');
  await page.click('#btn-enregistrer');
  await page.waitForTimeout(120);
  ok((await page.locator('[data-pied-note]').innerText()).includes('Ajouté'), 'tampon non bloquant, message immédiat');
  await page.screenshot({ path: '/tmp/shots/16-mouvement-reduit.png', fullPage: true });
  ok(erreurs.length === 0, 'aucune erreur JS');
}

console.log('— Parcours clavier seul');
{
  const erreurs = [];
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const page = await ctx.newPage();
  page.on('pageerror', e => erreurs.push(e.message));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  ok((await page.evaluate(() => document.activeElement.className)).includes('saut-contenu'), 'lien d’évitement en premier');
  let atteint = false;
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab');
    const t = await page.evaluate(() => document.activeElement.textContent.trim().slice(0, 40));
    if (/Trouver mon déclic/.test(t)) { atteint = true; break; }
  }
  ok(atteint, 'bouton principal atteignable au clavier');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(350);
  ok(await page.locator('#vue-trouver').isVisible(), 'navigation clavier OK');
  ok((await page.evaluate(() => document.activeElement.id)) === 'titre-trouver', 'focus sur le titre de la vue');
  await page.locator('input[name="duree"][value="5"]').focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(150);
  ok((await page.evaluate(() => document.querySelector('input[name="duree"]:checked').value)) === '15', 'flèches sur le groupe de durées');
  await page.check('input[name="categorie"][value="observer"]');
  await page.check('input[name="contexte"][value="bureau"]');
  await page.locator('#btn-ouvrir').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  ok(await page.locator('#carte').getAttribute('data-etat') === 'ouverte', 'ouverture au clavier');
  await page.keyboard.press('Tab');
  const anneau = await page.evaluate(() => {
    const a = document.activeElement; const s = getComputedStyle(a);
    return { tag: a.tagName, txt: a.textContent.trim().slice(0, 30), outline: s.outlineStyle + ' ' + s.outlineWidth };
  });
  ok(anneau.outline.includes('solid') || anneau.outline.includes('auto'), 'anneau de focus sur « ' + anneau.txt + ' » (' + anneau.outline + ')');
  await page.screenshot({ path: '/tmp/shots/17-focus-visible.png' });
  ok(erreurs.length === 0, 'aucune erreur JS');
}
await browser.close();
console.log(`\nRésultat : ${pass} réussites, ${fail} échec(s).`);
process.exit(fail ? 1 : 0);
