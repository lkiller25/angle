/* ==========================================================================
   DÉCLIC — logique du produit
   --------------------------------------------------------------------------
   JavaScript vanilla, aucun module ES (donc aucune restriction d'origine) :
   le site fonctionne aussi bien sur GitHub Pages qu'ouvert directement en
   local. Tout le contenu éditorial vit dans data/defis.js.

   Règles tenues dans ce fichier :
   • aucune donnée saisie n'est interprétée comme du HTML (textContent only) ;
   • toute lecture du stockage est validée avant usage ;
   • l'absence de stockage ou son saturation dégrade l'expérience sans la casser ;
   • aucun minuteur ne retarde une action : les animations accompagnent, elles
     ne conditionnent jamais l'état.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ 01. Référentiels */

  var CATEGORIES = {
    creer: { nom: 'Créer', court: 'Créer', scene: 'ill-creer', picto: 'g-creer' },
    observer: { nom: 'Observer', court: 'Observer', scene: 'ill-observer', picto: 'g-observer' },
    reflechir: { nom: 'Réfléchir', court: 'Réfléchir', scene: 'ill-reflechir', picto: 'g-reflechir' },
    bouger: { nom: 'Bouger doucement', court: 'Bouger', scene: 'ill-bouger', picto: 'g-bouger' },
    partager: { nom: 'Partager', court: 'Partager', scene: 'ill-partager', picto: 'g-partager' }
  };

  var CONTEXTES = {
    maison: 'Chez moi',
    bureau: 'Au bureau',
    dehors: 'Dehors',
    trajet: 'En déplacement',
    ensemble: 'Avec quelqu’un'
  };

  var STATUTS = { realise: 'Réalisé', essaye: 'Essayé', passe: 'Passé' };
  var DUREES = [5, 15, 30];
  var CLE = 'declic.v1';
  var VERSION = 1;

  var BIBLIO = Array.isArray(window.DECLIC_DEFIS) ? window.DECLIC_DEFIS.slice() : [];

  /* ------------------------------------------------------------------ 02. Utilitaires */

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function el(balise, classe, texte) {
    var n = document.createElement(balise);
    if (classe) n.className = classe;
    if (texte !== undefined && texte !== null) n.textContent = texte;
    return n;
  }

  function svgInterne(contenu, classe, viewBox) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', viewBox || '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    if (classe) svg.setAttribute('class', classe);
    svg.innerHTML = contenu;
    return svg;
  }

  function icone(id, classe) {
    return svgInterne('<use href="#' + id + '"></use>', classe);
  }

  function normaliser(texte) {
    return String(texte || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  function dateLisible(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return 'date inconnue';
    try {
      return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    } catch (e) {
      return d.toLocaleDateString();
    }
  }

  function horodatage() { return new Date().toISOString(); }

  function identifiantUnique() {
    var base = 'page-' + Date.now().toString(36);
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return 'page-' + window.crypto.randomUUID();
    }
    return base + '-' + Math.random().toString(36).slice(2, 8);
  }

  function trouverDefi(id) {
    for (var i = 0; i < BIBLIO.length; i++) if (BIBLIO[i].id === id) return BIBLIO[i];
    return null;
  }

  function indexDefi(id) {
    for (var i = 0; i < BIBLIO.length; i++) if (BIBLIO[i].id === id) return i;
    return -1;
  }

  function annoncer(message) {
    var zone = $('[data-annonce]');
    if (!zone) return;
    zone.textContent = '';
    window.setTimeout(function () { zone.textContent = message; }, 60);
  }

  function reduireMouvement() {
    return typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function defilementDoux(cible) {
    try {
      cible.scrollIntoView({ block: 'nearest', behavior: reduireMouvement() ? 'auto' : 'smooth' });
    } catch (e) {
      cible.scrollIntoView(false);
    }
  }

  /* ------------------------------------------------------------------ 03. Validation de la bibliothèque */

  function validerBibliotheque(liste) {
    var valides = [];
    var rejets = [];
    var vus = Object.create(null);

    liste.forEach(function (d) {
      var souci = null;
      if (!d || typeof d !== 'object') souci = 'entrée non exploitable';
      else if (!d.id || typeof d.id !== 'string') souci = 'identifiant manquant';
      else if (vus[d.id]) souci = 'identifiant en double : ' + d.id;
      else if (!CATEGORIES[d.categorie]) souci = 'catégorie inconnue : ' + d.id;
      else if (DUREES.indexOf(Number(d.duree)) === -1) souci = 'durée invalide : ' + d.id;
      else if (!Array.isArray(d.etapes) || d.etapes.length < 2) souci = 'étapes insuffisantes : ' + d.id;
      else if (!Array.isArray(d.contextes) || !d.contextes.length) souci = 'aucun contexte : ' + d.id;

      if (souci) { rejets.push(souci); return; }
      vus[d.id] = true;
      valides.push(d);
    });

    return { valides: valides, rejets: rejets };
  }

  /* ------------------------------------------------------------------ 04. Stockage */

  var stockage = {
    disponible: false,
    ecritureOk: true,
    raison: '',
    verifier: function () {
      try {
        var t = '__declic_test__';
        window.localStorage.setItem(t, '1');
        window.localStorage.removeItem(t);
        this.disponible = true;
      } catch (e) {
        this.disponible = false;
        this.raison = 'Le stockage local est indisponible dans ce navigateur (navigation privée, réglage de confidentialité ou espace bloqué).';
      }
      return this.disponible;
    },
    lire: function () {
      if (!this.disponible) return null;
      try { return window.localStorage.getItem(CLE); } catch (e) { return null; }
    },
    ecrire: function (valeur) {
      if (!this.disponible) return false;
      try {
        window.localStorage.setItem(CLE, valeur);
        this.ecritureOk = true;
        return true;
      } catch (e) {
        this.ecritureOk = false;
        var plein = e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22);
        afficherBanniereStockage(plein
          ? 'Le stockage de ton navigateur est plein. Tes changements restent utilisables dans cette page, mais risquent de ne pas survivre à un rechargement. Pense à exporter ton carnet.'
          : 'L’enregistrement local a échoué. Tes changements restent utilisables dans cette page, mais ne seront pas conservés après rechargement. Tu peux exporter ton carnet.');
        return false;
      }
    },
    mettreDeCote: function (brut) {
      try {
        if (this.disponible) window.localStorage.setItem(CLE + '.illisible.' + Date.now(), brut);
      } catch (e) { /* tant pis : on ne bloque pas l'usage */ }
    }
  };

  function modeleVide() {
    return {
      version: VERSION,
      favoris: [],
      carnet: [],
      atelier: { duree: null, categorie: null, contexte: null, defiId: null, ouverte: false }
    };
  }

  function normaliserModele(brut) {
    var base = modeleVide();
    var ignorees = 0;
    if (!brut || typeof brut !== 'object') return { modele: base, ignorees: 0 };

    if (Array.isArray(brut.favoris)) {
      brut.favoris.forEach(function (id) {
        if (typeof id === 'string' && trouverDefi(id) && base.favoris.indexOf(id) === -1) base.favoris.push(id);
        else ignorees++;
      });
    }

    if (Array.isArray(brut.carnet)) {
      brut.carnet.forEach(function (p) {
        if (!p || typeof p !== 'object') { ignorees++; return; }
        if (!trouverDefi(p.defiId)) { ignorees++; return; }
        if (!STATUTS[p.statut]) { ignorees++; return; }
        var note = typeof p.note === 'string' ? p.note.slice(0, 2000) : '';
        var cree = new Date(p.cree);
        var maj = new Date(p.maj || p.cree);
        base.carnet.push({
          id: typeof p.id === 'string' && p.id ? p.id.slice(0, 80) : identifiantUnique(),
          defiId: p.defiId,
          statut: p.statut,
          note: note,
          cree: isNaN(cree.getTime()) ? horodatage() : cree.toISOString(),
          maj: isNaN(maj.getTime()) ? horodatage() : maj.toISOString()
        });
      });
    }

    if (brut.atelier && typeof brut.atelier === 'object') {
      var a = brut.atelier;
      base.atelier.duree = DUREES.indexOf(Number(a.duree)) !== -1 ? Number(a.duree) : null;
      base.atelier.categorie = CATEGORIES[a.categorie] ? a.categorie : null;
      base.atelier.contexte = CONTEXTES[a.contexte] ? a.contexte : null;
      base.atelier.defiId = trouverDefi(a.defiId) ? a.defiId : null;
      base.atelier.ouverte = a.ouverte === true && !!base.atelier.defiId;
    }

    return { modele: base, ignorees: ignorees };
  }

  /* ------------------------------------------------------------------ 05. État */

  var etat = {
    modele: modeleVide(),
    defiCourantId: null,
    suppressionId: null,
    importEnAttente: null,
    premierRoutage: true,
    banniereLue: false
  };

  function sauvegarder() {
    etat.modele.version = VERSION;
    return stockage.ecrire(JSON.stringify(etat.modele));
  }

  function estFavori(id) { return etat.modele.favoris.indexOf(id) !== -1; }

  function faireBasculerFavori(id) {
    var i = etat.modele.favoris.indexOf(id);
    if (i === -1) etat.modele.favoris.push(id);
    else etat.modele.favoris.splice(i, 1);
    sauvegarder();
    majPastilles();
    return i === -1;
  }

  function afficherBanniereStockage(message) {
    var zone = $('#etat-stockage');
    if (!zone) return;
    zone.textContent = message;
    zone.hidden = false;
    if (!etat.banniereLue) {
      etat.banniereLue = true;
      annoncer(message);
    }
  }

  /* ------------------------------------------------------------------ 06. Correspondance & filtres */

  function correspondre(defi, f) {
    if (f.duree && Number(defi.duree) !== Number(f.duree)) return false;
    if (f.categorie && defi.categorie !== f.categorie) return false;
    if (f.contexte && defi.contextes.indexOf(f.contexte) === -1) return false;
    return true;
  }

  function defisCorrespondants(f) { return BIBLIO.filter(function (d) { return correspondre(d, f); }); }

  function texteCherchable(defi) {
    return normaliser([
      defi.titre,
      defi.consigne,
      CATEGORIES[defi.categorie].nom,
      defi.materiel.join(' '),
      defi.etapes.join(' '),
      defi.variante,
      defi.question,
      defi.contextes.map(function (c) { return CONTEXTES[c]; }).join(' ')
    ].join(' '));
  }

  function descriptionsFiltres(f) {
    var morceaux = [];
    if (f.categorie) morceaux.push(CATEGORIES[f.categorie].nom.toLowerCase());
    if (f.duree) morceaux.push(f.duree + ' minutes');
    if (f.contexte) morceaux.push(CONTEXTES[f.contexte].toLowerCase());
    return morceaux;
  }

  /* ------------------------------------------------------------------ 07. Routeur */

  var TITRES = {
    accueil: 'DÉCLIC — Quelques minutes. Une autre façon de voir.',
    trouver: 'Compose ton déclic — DÉCLIC',
    explorer: 'Explorer les idées — DÉCLIC',
    favoris: 'Mes favoris — DÉCLIC',
    carnet: 'Mon carnet — DÉCLIC'
  };

  function analyserHash() {
    var brut = window.location.hash.replace(/^#\/?/, '');
    var parties = brut.split('?');
    var chemin = parties[0] || '';
    var params = new URLSearchParams(parties[1] || '');
    var segments = chemin.split('/').filter(Boolean);

    if (!segments.length) return { vue: 'accueil', params: params };
    if (segments[0] === 'defi' && segments[1]) {
      return { vue: 'defi', id: decodeURIComponent(segments[1]), params: params };
    }
    if (TITRES[segments[0]]) return { vue: segments[0], params: params };
    return { vue: 'accueil', params: params, inconnu: true };
  }

  function afficherVue(nom, options) {
    options = options || {};
    var sections = $$('[data-vue]');
    sections.forEach(function (s) {
      var actif = s.getAttribute('data-vue') === nom;
      s.hidden = !actif;
    });

    var nav = $$('.nav a');
    nav.forEach(function (a) {
      if (a.getAttribute('data-nav') === nom) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    document.title = TITRES[nom] || TITRES.accueil;

    if (options.focus) {
      var cible = $('#titre-' + nom) || $('#' + nom + ' h1');
      if (cible) {
        try { cible.focus({ preventScroll: true }); } catch (e) { cible.focus(); }
      }
      var hautVue = $('[data-vue="' + nom + '"]');
      if (hautVue && hautVue.getBoundingClientRect().top < -4) {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    }
  }

  function router() {
    var r = analyserHash();
    var nomVue = r.vue === 'defi' ? 'trouver' : r.vue;

    afficherVue(nomVue, { focus: !etat.premierRoutage });
    etat.premierRoutage = false;

    if (r.vue === 'defi') {
      ouvrirDefiDepuisRoute(r.id);
      return;
    }

    if (r.vue === 'explorer') {
      appliquerParamsExplorer(r.params);
      rendreExplorer({ depuisRoute: true });
    } else if (r.vue === 'favoris') {
      rendreFavoris();
    } else if (r.vue === 'carnet') {
      rendreCarnet();
    } else if (r.vue === 'trouver') {
      majCarte();
    }
  }

  /* ------------------------------------------------------------------ 08. Atelier : la carte */

  var carte = $('#carte');
  var depliage = $('#carte-depliage');
  var btnOuvrir = $('#btn-ouvrir');
  var formulaireAtelier = $('#reglages');

  var els = {
    ouvrirTexte: $('[data-ouvrir-texte]'),
    tempsValeur: $('[data-temps-valeur]'),
    tempsUnite: $('[data-temps-unite]'),
    motif: $('[data-motif]'),
    motifVide: $('[data-motif-vide]'),
    motifScene: $('[data-motif-scene]'),
    motifUse: $('[data-motif-use]'),
    etiquette: $('[data-etiquette]'),
    etiquetteTexte: $('[data-etiquette-texte]'),
    etiquettePicto: $('[data-etiquette-picto] use'),
    invitation: $('#invitation-carte'),
    numero: $('[data-numero]'),
    actions: $('[data-carte-actions]'),
    piedNote: $('[data-pied-note]'),
    btnAutre: $('#btn-autre'),
    btnFavori: $('#btn-favori'),
    favoriTexte: $('[data-favori-texte]'),
    btnEnregistrer: $('#btn-enregistrer'),
    tampon: $('[data-tampon]'),
    tamponTexte: $('[data-tampon-texte]'),
    defi: $('#defi'),
    defiCategorie: $('[data-defi-categorie]'),
    defiDuree: $('[data-defi-duree]'),
    defiContexte: $('[data-defi-contexte]'),
    defiTitre: $('[data-defi-titre]'),
    defiConsigne: $('[data-defi-consigne]'),
    defiEtapes: $('[data-defi-etapes]'),
    defiMateriel: $('[data-defi-materiel]'),
    defiVariante: $('[data-defi-variante]'),
    defiQuestion: $('[data-defi-question]'),
    defiSource: $('.defi__source'),
    vide: $('[data-carte-vide]'),
    videTitre: $('[data-vide-titre]'),
    videTexte: $('[data-vide-texte]'),
    videActions: $('[data-vide-actions]'),
    aideEnvie: $('[data-aide-envie]')
  };

  var minuteries = { motif: 0, tampon: 0, enregistrer: 0 };

  function filtresAtelier() {
    if (!formulaireAtelier) return { duree: null, categorie: null, contexte: null };
    var d = formulaireAtelier.querySelector('input[name="duree"]:checked');
    var c = formulaireAtelier.querySelector('input[name="categorie"]:checked');
    var x = formulaireAtelier.querySelector('input[name="contexte"]:checked');
    return {
      duree: d ? Number(d.value) : null,
      categorie: c ? c.value : null,
      contexte: x ? x.value : null
    };
  }

  function filtresComplets(f) { return !!(f.duree && f.categorie && f.contexte); }

  function reglerRadios(f) {
    if (!formulaireAtelier) return;
    [['duree', f.duree], ['categorie', f.categorie], ['contexte', f.contexte]].forEach(function (paire) {
      var nom = paire[0];
      var valeur = paire[1];
      $$('input[name="' + nom + '"]', formulaireAtelier).forEach(function (input) {
        input.checked = valeur !== null && valeur !== undefined && String(input.value) === String(valeur);
      });
    });
  }

  function majMotif(categorie) {
    if (!els.motif) return;
    window.clearTimeout(minuteries.motif);

    if (!categorie) {
      els.motif.setAttribute('data-motif', 'vide');
      els.motif.removeAttribute('data-anim');
      if (els.motifVide) els.motifVide.hidden = false;
      /* <svg> n'implémente pas l'attribut IDL « hidden » : on manipule l'attribut. */
      if (els.motifScene) els.motifScene.setAttribute('hidden', '');
      return;
    }

    var cat = CATEGORIES[categorie];
    els.motifUse.setAttribute('href', '#' + cat.scene);
    els.motifVide.hidden = true;
    els.motifScene.removeAttribute('hidden');
    els.motif.setAttribute('data-motif', 'plein');
    els.motif.setAttribute('data-anim', 'entree');
    minuteries.motif = window.setTimeout(function () {
      els.motif.removeAttribute('data-anim');
    }, 520);
  }

  function majEtiquette(contexte) {
    if (!els.etiquette) return;
    if (contexte) {
      els.etiquette.setAttribute('data-etat', 'pose');
      els.etiquetteTexte.textContent = CONTEXTES[contexte];
      els.etiquettePicto.setAttribute('href', '#g-' + contexte);
    } else {
      els.etiquette.setAttribute('data-etat', 'vide');
      els.etiquetteTexte.textContent = 'Contexte à préciser';
      els.etiquettePicto.setAttribute('href', '#g-maison');
    }
  }

  function majCarte() {
    if (!carte) return;
    var f = filtresAtelier();
    var complet = filtresComplets(f);

    if (f.duree) carte.setAttribute('data-duree', String(f.duree));
    else carte.removeAttribute('data-duree');

    if (els.tempsValeur) els.tempsValeur.textContent = f.duree ? String(f.duree) : '—';
    if (els.tempsUnite) els.tempsUnite.textContent = f.duree ? 'minutes' : 'temps à choisir';

    majMotif(f.categorie);
    majEtiquette(f.contexte);

    carte.setAttribute('data-complet', complet ? 'oui' : 'non');
    btnOuvrir.setAttribute('aria-disabled', complet ? 'false' : 'true');

    if (els.invitation) {
      els.invitation.hidden = false;
      els.invitation.textContent = complet
        ? 'Tout est prêt. La carte n’attend plus que toi.'
        : 'La carte attend tes trois choix.';
    }

    if (els.aideEnvie) {
      els.aideEnvie.textContent = f.categorie === 'bouger'
        ? 'Les propositions « bouger » ont toujours une version assise ou immobile.'
        : '';
      els.aideEnvie.hidden = !els.aideEnvie.textContent;
    }
  }

  function melanger(liste) {
    var copie = liste.slice();
    for (var i = copie.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = copie[i];
      copie[i] = copie[j];
      copie[j] = t;
    }
    return copie;
  }

  function choisirDans(liste) {
    var melange = melanger(liste);
    if (melange.length > 1 && melange[0].id === etat.defiCourantId) return melange[1];
    return melange[0];
  }

  function rendreDefi(defi) {
    if (!defi) return;
    etat.defiCourantId = defi.id;

    els.defi.hidden = false;
    els.vide.hidden = true;

    els.defiCategorie.textContent = CATEGORIES[defi.categorie].nom;
    els.defiDuree.textContent = defi.duree + ' minutes';

    var contexteChoisi = filtresAtelier().contexte;
    var contextesAffiches = contexteChoisi && defi.contextes.indexOf(contexteChoisi) !== -1
      ? [CONTEXTES[contexteChoisi]]
      : defi.contextes.slice(0, 2).map(function (c) { return CONTEXTES[c]; });
    els.defiContexte.textContent = contextesAffiches.join(' · ');

    els.defiTitre.textContent = defi.titre;
    els.defiConsigne.textContent = defi.consigne;

    els.defiEtapes.replaceChildren.apply(els.defiEtapes, defi.etapes.map(function (etape) {
      return el('li', null, etape);
    }));

    var materielBrut = (defi.materiel && defi.materiel.length) ? defi.materiel : ['rien'];
    var materiel = materielBrut.length === 1 && materielBrut[0] === 'rien'
      ? ['aucun matériel nécessaire']
      : materielBrut;
    els.defiMateriel.replaceChildren.apply(els.defiMateriel, materiel.map(function (m) {
      return el('li', null, m);
    }));

    els.defiVariante.textContent = defi.variante;
    els.defiQuestion.textContent = defi.question || 'Pas de question pour cette idée : la trace peut rester dans ta tête.';

    var i = indexDefi(defi.id);
    if (els.numero) {
      els.numero.hidden = false;
      els.numero.textContent = 'idée ' + String(i + 1).padStart(2, '0') + ' / ' + BIBLIO.length;
    }

    majBoutonFavori();
    majPiedNote('');

    etat.modele.atelier = {
      duree: filtresAtelier().duree,
      categorie: filtresAtelier().categorie,
      contexte: filtresAtelier().contexte,
      defiId: defi.id,
      ouverte: carte.getAttribute('data-etat') === 'ouverte'
    };
  }

  function suggestionsAtelier(f) {
    var suggestions = [];

    if (f.contexte) {
      var sansContexte = { duree: f.duree, categorie: f.categorie, contexte: null };
      var n1 = defisCorrespondants(sansContexte).length;
      if (n1 > 0) suggestions.push({
        texte: 'Ouvrir le contexte (' + n1 + ' idée' + (n1 > 1 ? 's' : '') + ')',
        action: function () { appliquerFiltresAtelier(sansContexte); }
      });
    }

    DUREES.forEach(function (d) {
      if (d === f.duree) return;
      var essai = { duree: d, categorie: f.categorie, contexte: f.contexte };
      var n = defisCorrespondants(essai).length;
      if (n > 0) suggestions.push({
        texte: 'Essayer ' + d + ' minutes (' + n + ')',
        action: function () { appliquerFiltresAtelier(essai); }
      });
    });

    suggestions.push({
      texte: 'Chercher dans toute la bibliothèque',
      action: function () {
        var params = new URLSearchParams();
        if (f.duree) params.set('duree', String(f.duree));
        if (f.contexte) params.set('contexte', f.contexte);
        window.location.hash = '#/explorer' + (params.toString() ? '?' + params.toString() : '');
      }
    });

    return suggestions.slice(0, 4);
  }

  function rendreVideAtelier(f) {
    els.defi.hidden = true;
    els.vide.hidden = false;
    etat.defiCourantId = null;

    var morceaux = descriptionsFiltres(f);
    els.videTitre.textContent = 'Aucune idée ne réunit ces trois choix';
    els.videTexte.textContent = 'Rien ne correspond à « ' + morceaux.join(' · ') + ' ». Aucun filtre n’a été changé à ta place : tu peux élargir toi-même.';

    var boutons = suggestionsAtelier(f).map(function (s) {
      var b = el('button', 'bouton bouton--fantome', s.texte);
      b.type = 'button';
      b.addEventListener('click', s.action);
      return b;
    });

    var tout = el('a', 'bouton bouton--secondaire', 'Voir toutes les idées');
    tout.href = '#/explorer';
    boutons.push(tout);

    els.videActions.replaceChildren.apply(els.videActions, boutons);
    if (els.numero) els.numero.hidden = true;
    majPiedNote('');
  }

  function appliquerFiltresAtelier(nouveau) {
    reglerRadios(nouveau);
    majCarte();
    if (carte.getAttribute('data-etat') === 'ouverte') {
      ouvrirCarte({ focusTitre: true });
    } else {
      annoncer('Réglages appliqués. La carte est prête à s’ouvrir.');
    }
    etat.modele.atelier = {
      duree: nouveau.duree, categorie: nouveau.categorie, contexte: nouveau.contexte,
      defiId: etat.defiCourantId, ouverte: carte.getAttribute('data-etat') === 'ouverte'
    };
    sauvegarder();
  }

  function majBoutonOuvrir(ouverte) {
    if (els.ouvrirTexte) els.ouvrirTexte.textContent = ouverte ? 'Refermer la carte' : 'Ouvrir mon déclic';
    btnOuvrir.setAttribute('aria-expanded', ouverte ? 'true' : 'false');
    carte.classList.toggle('est-ouverte', ouverte);
  }

  function ouvrirCarte(options) {
    options = options || {};
    var f = filtresAtelier();

    if (!filtresComplets(f)) {
      guiderVersManquant(f);
      return;
    }

    var liste = defisCorrespondants(f);
    if (!liste.length) {
      rendreVideAtelier(f);
    } else {
      /* On reprend l'idée déjà choisie si elle colle toujours aux réglages :
         refermer la carte ne doit pas faire perdre la proposition en cours. */
      var candidat = options.defiId || (etat.modele.atelier && etat.modele.atelier.defiId);
      var defi = candidat ? trouverDefi(candidat) : null;
      if (!defi || !correspondre(defi, f)) defi = choisirDans(liste);
      rendreDefi(defi);
    }

    carte.setAttribute('data-etat', 'ouverte');
    majBoutonOuvrir(true);
    depliage.inert = false;
    depliage.removeAttribute('aria-hidden');
    els.actions.hidden = false;

    etat.modele.atelier = {
      duree: f.duree, categorie: f.categorie, contexte: f.contexte,
      defiId: etat.defiCourantId, ouverte: true
    };
    sauvegarder();

    if (options.focusTitre) {
      var cible = liste.length ? els.defiTitre : els.videTitre;
      try { cible.focus({ preventScroll: true }); } catch (e) { cible.focus(); }
      var zone = carte.getBoundingClientRect();
      if (zone.top < 60 || zone.bottom > window.innerHeight + 40) defilementDoux(carte);
    }

    if (etat.defiCourantId) {
      var d = trouverDefi(etat.defiCourantId);
      annoncer('Carte ouverte. ' + (d ? d.titre + ', ' + d.duree + ' minutes.' : 'Aucune idée ne correspond à ces choix.'));
    } else {
      annoncer('Aucune idée ne réunit ces trois choix. Des solutions d’élargissement sont proposées.');
    }
  }

  function fermerCarte(options) {
    options = options || {};
    carte.setAttribute('data-etat', 'fermee');
    majBoutonOuvrir(false);
    els.actions.hidden = true;
    depliage.inert = true;
    depliage.setAttribute('aria-hidden', 'true');

    etat.modele.atelier.ouverte = false;
    etat.modele.atelier.defiId = etat.defiCourantId;
    sauvegarder();

    if (options.message) annoncer(options.message);
    if (options.focusBouton && btnOuvrir) {
      try { btnOuvrir.focus({ preventScroll: true }); } catch (e) { btnOuvrir.focus(); }
    }
  }

  function guiderVersManquant(f) {
    var manque = null;
    var nom = '';
    if (!f.duree) { manque = '#groupe-duree input'; nom = 'une durée'; }
    else if (!f.categorie) { manque = '#groupe-envie input'; nom = 'une envie'; }
    else if (!f.contexte) { manque = '#groupe-contexte input'; nom = 'un contexte'; }

    var cible = manque ? $(manque) : null;
    if (cible) {
      try { cible.focus({ preventScroll: true }); } catch (e) { cible.focus(); }
      if (cible.getBoundingClientRect().top < 0) defilementDoux(cible.closest('fieldset'));
    }
    annoncer('Il manque ' + nom + ' pour ouvrir la carte.');
    if (els.invitation) els.invitation.textContent = 'Il manque ' + nom + ' : la carte s’ouvrira juste après.';
  }

  function majBoutonFavori() {
    if (!els.btnFavori) return;
    var id = etat.defiCourantId;
    var fav = id ? estFavori(id) : false;
    els.btnFavori.setAttribute('aria-pressed', fav ? 'true' : 'false');
    els.btnFavori.disabled = !id;
    if (els.favoriTexte) els.favoriTexte.textContent = fav ? 'Dans tes favoris' : 'Garder en favori';
    carte.classList.toggle('est-favori', fav);
  }

  function majPiedNote(message, lien, avecTampon) {
    if (els.tampon) {
      els.tampon.hidden = !avecTampon;
      if (!avecTampon) els.tampon.classList.remove('est-actif');
    }
    if (!els.piedNote) return;
    if (!message) {
      els.piedNote.replaceChildren();
      return;
    }
    var fragment = document.createDocumentFragment();
    fragment.appendChild(document.createTextNode(message + ' '));
    if (lien) {
      var a = el('a', null, lien.texte);
      a.href = lien.href;
      a.style.textDecoration = 'underline';
      a.style.textUnderlineOffset = '3px';
      fragment.appendChild(a);
    }
    els.piedNote.replaceChildren(fragment);
  }

  function lancerTampon(texte) {
    if (!els.tampon) return;
    window.clearTimeout(minuteries.tampon);
    if (els.tamponTexte) els.tamponTexte.textContent = texte || 'Noté';
    els.tampon.hidden = false;
    els.tampon.classList.remove('est-actif');
    void els.tampon.offsetWidth;
    els.tampon.classList.add('est-actif');
  }

  var dernierEnregistrement = 0;

  function enregistrerAuCarnet() {
    var id = etat.defiCourantId;
    if (!id) return;
    if (Date.now() - dernierEnregistrement < 900) return; /* double clic accidentel */
    dernierEnregistrement = Date.now();
    var defi = trouverDefi(id);
    if (!defi) return;

    var maintenant = horodatage();
    var page = {
      id: identifiantUnique(),
      defiId: id,
      statut: 'essaye',
      note: '',
      cree: maintenant,
      maj: maintenant
    };
    etat.modele.carnet.push(page);
    var garde = sauvegarder();

    lancerTampon('Noté');
    majPastilles();
    majPiedNote(
      garde
        ? 'Ajouté à ton carnet.'
        : 'Ajouté pour cette session seulement : le stockage local n’a pas répondu.',
      { texte: 'Ouvrir le carnet', href: '#/carnet' },
      true
    );
    annoncer('« ' + defi.titre + ' » ajouté à ton carnet, statut essayé.');
    if (window.location.hash === '#/carnet') rendreCarnet();

    /* Confirmation visuelle du bouton : on ne le désactive pas (le grisé se lit mal
       et laisserait croire à une panne), on marque simplement l'ajout. */
    var texteInitial = els.btnEnregistrer.getAttribute('data-texte-initial') || els.btnEnregistrer.textContent;
    els.btnEnregistrer.setAttribute('data-texte-initial', texteInitial);
    els.btnEnregistrer.textContent = 'Ajouté à ton carnet';
    els.btnEnregistrer.classList.add('est-confirme');
    window.clearTimeout(minuteries.enregistrer);
    minuteries.enregistrer = window.setTimeout(function () {
      els.btnEnregistrer.textContent = texteInitial;
      els.btnEnregistrer.classList.remove('est-confirme');
    }, 1800);
  }

  if (formulaireAtelier) {
    formulaireAtelier.addEventListener('change', function (evt) {
      if (!evt.target || evt.target.type !== 'radio') return;
      var etaitOuverte = carte.getAttribute('data-etat') === 'ouverte';
      majCarte();
      etat.modele.atelier = {
        duree: filtresAtelier().duree,
        categorie: filtresAtelier().categorie,
        contexte: filtresAtelier().contexte,
        defiId: etat.defiCourantId,
        ouverte: false
      };
      sauvegarder();
      if (etaitOuverte) {
        fermerCarte({ message: 'La carte se referme : tes nouveaux réglages sont pris en compte.' });
      }
    });
  }

  if (btnOuvrir) {
    btnOuvrir.addEventListener('click', function () {
      if (carte.getAttribute('data-etat') === 'ouverte') {
        fermerCarte({ message: 'Carte refermée. Ton défi reste noté, tu peux le retrouver en rechargeant la page.', focusBouton: true });
      } else {
        ouvrirCarte({ focusTitre: true });
      }
    });
  }

  if (els.btnAutre) {
    els.btnAutre.addEventListener('click', function () {
      var f = filtresAtelier();
      var liste = defisCorrespondants(f).filter(function (d) { return d.id !== etat.defiCourantId; });
      if (!liste.length) {
        var seule = defisCorrespondants(f);
        majPiedNote(seule.length
          ? 'C’est la seule idée pour ces réglages. Élargis un choix pour en voir d’autres.'
          : 'Plus aucune idée pour ces réglages.');
        annoncer('Aucune autre idée pour ces réglages. Tu peux élargir un filtre.');
        return;
      }
      var defi = choisirDans(liste);
      rendreDefi(defi);
      els.defi.classList.remove('est-nouveau');
      void els.defi.offsetWidth;
      els.defi.classList.add('est-nouveau');
      annoncer('Nouvelle idée : ' + defi.titre + '.');
    });
  }

  if (els.btnFavori) {
    els.btnFavori.addEventListener('click', function () {
      var id = etat.defiCourantId;
      if (!id) return;
      var ajoute = faireBasculerFavori(id);
      majBoutonFavori();
      majPiedNote(ajoute ? 'Gardé dans tes favoris.' : 'Retiré de tes favoris.', { texte: 'Voir mes favoris', href: '#/favoris' });
      annoncer(ajoute ? 'Idée gardée en favori.' : 'Idée retirée des favoris.');
      if (window.location.hash.indexOf('#/favoris') === 0) rendreFavoris();
    });
  }

  if (els.btnEnregistrer) {
    els.btnEnregistrer.addEventListener('click', enregistrerAuCarnet);
  }

  /* ------------------------------------------------------------------ 09. Explorer */

  var explorer = {
    grille: $('[data-grille-defis]'),
    vide: $('[data-explorer-vide]'),
    entete: $('[data-resultats-entete]'),
    recherche: $('#recherche'),
    categorie: $('#filtre-categorie'),
    duree: $('#filtre-duree'),
    contexte: $('#filtre-contexte'),
    reset: $('#filtres-reset'),
    videTitre: $('[data-vide-explorer-titre]'),
    videTexte: $('[data-vide-explorer-texte]'),
    videActions: $('[data-vide-explorer-actions]')
  };

  function filtresExplorer() {
    return {
      categorie: explorer.categorie && explorer.categorie.value ? explorer.categorie.value : null,
      duree: explorer.duree && explorer.duree.value ? Number(explorer.duree.value) : null,
      contexte: explorer.contexte && explorer.contexte.value ? explorer.contexte.value : null
    };
  }

  function appliquerParamsExplorer(params) {
    if (!explorer.categorie) return;
    var cat = params.get('categorie');
    var duree = params.get('duree');
    var contexte = params.get('contexte');
    var recherche = params.get('q');

    explorer.categorie.value = cat && CATEGORIES[cat] ? cat : '';
    explorer.duree.value = duree && DUREES.indexOf(Number(duree)) !== -1 ? String(Number(duree)) : '';
    explorer.contexte.value = contexte && CONTEXTES[contexte] ? contexte : '';
    if (explorer.recherche) explorer.recherche.value = recherche ? recherche.slice(0, 80) : '';
  }

  function ecrireParamsExplorer() {
    var f = filtresExplorer();
    var params = new URLSearchParams();
    if (f.categorie) params.set('categorie', f.categorie);
    if (f.duree) params.set('duree', String(f.duree));
    if (f.contexte) params.set('contexte', f.contexte);
    if (explorer.recherche && explorer.recherche.value.trim()) params.set('q', explorer.recherche.value.trim().slice(0, 80));
    var nouveau = '#/explorer' + (params.toString() ? '?' + params.toString() : '');
    if (window.location.hash !== nouveau) {
      try { window.history.replaceState(null, '', nouveau); } catch (e) { /* file:// : on laisse le hash tel quel */ }
    }
  }

  function suggestionsExplorer(f, recherche) {
    var suggestions = [];
    var essais = [];

    if (recherche) {
      essais.push({
        texte: 'Effacer la recherche',
        faire: function () { explorer.recherche.value = ''; rendreExplorer(); }
      });
    }
    if (f.contexte) {
      essais.push({
        texte: 'Retirer le contexte',
        faire: function () { explorer.contexte.value = ''; rendreExplorer(); }
      });
    }
    if (f.duree) {
      essais.push({
        texte: 'Retirer la durée',
        faire: function () { explorer.duree.value = ''; rendreExplorer(); }
      });
    }
    if (f.categorie) {
      essais.push({
        texte: 'Retirer l’envie',
        faire: function () { explorer.categorie.value = ''; rendreExplorer(); }
      });
    }

    essais.forEach(function (e) {
      var copie = Object.assign({}, f);
      if (e.texte === 'Retirer le contexte') copie.contexte = null;
      if (e.texte === 'Retirer la durée') copie.duree = null;
      if (e.texte === 'Retirer l’envie') copie.categorie = null;
      var n = (e.texte === 'Effacer la recherche')
        ? BIBLIO.filter(function (d) { return correspondre(d, f); }).length
        : BIBLIO.filter(function (d) { return correspondre(d, copie) && (!recherche || texteCherchable(d).indexOf(recherche) !== -1); }).length;
      if (n > 0) suggestions.push({ texte: e.texte + ' (' + n + ')', faire: e.faire });
    });

    return suggestions.slice(0, 4);
  }

  function rendreExplorer(options) {
    options = options || {};
    if (!explorer.grille) return;

    var f = filtresExplorer();
    var recherche = normaliser(explorer.recherche ? explorer.recherche.value : '');
    var liste = BIBLIO.filter(function (d) {
      return correspondre(d, f) && (!recherche || texteCherchable(d).indexOf(recherche) !== -1);
    });

    explorer.grille.replaceChildren.apply(explorer.grille, liste.map(creerCarteDefi));
    explorer.grille.hidden = liste.length === 0;

    var filtresActifs = descriptionsFiltres(f);
    if (recherche) filtresActifs.push('« ' + (explorer.recherche.value.trim()) + ' »');

    if (explorer.entete) {
      if (!filtresActifs.length) {
        explorer.entete.textContent = liste.length + ' idées écrites à la main, toutes durées et tous contextes confondus.';
      } else {
        explorer.entete.textContent = liste.length + ' idée' + (liste.length > 1 ? 's' : '') + ' correspond' + (liste.length > 1 ? 'ent' : '') + ' à ' + filtresActifs.join(' · ') + '.';
      }
    }

    if (explorer.vide) {
      explorer.vide.hidden = liste.length !== 0;
      if (!liste.length) {
        if (explorer.videTitre) explorer.videTitre.textContent = 'Aucun résultat, et ce n’est pas grave';
        if (explorer.videTexte) {
          explorer.videTexte.textContent = filtresActifs.length
            ? 'Rien ne correspond à ' + filtresActifs.join(' · ') + '. Les filtres restent tels quels : voici comment les élargir, si tu veux.'
            : 'La bibliothèque est vide : le fichier data/defis.js n’a pas pu être chargé.';
        }
        if (explorer.videActions) {
          var boutons = suggestionsExplorer(f, recherche).map(function (s) {
            var b = el('button', 'bouton bouton--fantome', s.texte);
            b.type = 'button';
            b.addEventListener('click', s.faire);
            return b;
          });
          var tout = el('button', 'bouton bouton--secondaire', 'Tout effacer');
          tout.type = 'button';
          tout.addEventListener('click', reinitialiserFiltres);
          boutons.push(tout);
          explorer.videActions.replaceChildren.apply(explorer.videActions, boutons);
        }
      }
    }

    if (!options.depuisRoute) ecrireParamsExplorer();
    if (!options.sansAnnonce) {
      annoncer(liste.length + ' idée' + (liste.length > 1 ? 's' : '') + ' affichée' + (liste.length > 1 ? 's' : '') + '.');
    }
  }

  function reinitialiserFiltres() {
    if (explorer.recherche) explorer.recherche.value = '';
    if (explorer.categorie) explorer.categorie.value = '';
    if (explorer.duree) explorer.duree.value = '';
    if (explorer.contexte) explorer.contexte.value = '';
    rendreExplorer();
  }

  [explorer.recherche, explorer.categorie, explorer.duree, explorer.contexte].forEach(function (champ) {
    if (!champ) return;
    var evenement = champ.tagName === 'INPUT' ? 'input' : 'change';
    champ.addEventListener(evenement, function () { rendreExplorer(); });
  });

  if (explorer.reset) explorer.reset.addEventListener('click', reinitialiserFiltres);

  /* ------------------------------------------------------------------ 10. Cartes de la bibliothèque */

  function creerCarteDefi(defi) {
    var li = el('li', 'carte-defi');
    li.setAttribute('data-defi', defi.id);

    var ruban = el('span', 'carte-defi__ruban');
    ruban.setAttribute('aria-hidden', 'true');
    ruban.setAttribute('data-actif', estFavori(defi.id) ? 'oui' : 'non');

    var scene = el('div', 'carte-defi__scene');
    scene.setAttribute('aria-hidden', 'true');
    scene.appendChild(icone(CATEGORIES[defi.categorie].scene, 'scene'));
    var svgScene = scene.querySelector('svg');
    if (svgScene) svgScene.setAttribute('viewBox', '0 0 240 200');

    var corps = el('div', 'carte-defi__corps');

    var meta = el('p', 'carte-defi__meta');
    meta.appendChild(el('span', 'etiquette-cat', CATEGORIES[defi.categorie].court));
    meta.appendChild(el('span', null, defi.duree + ' min'));

    var titre = el('h3', 'carte-defi__titre', defi.titre);
    var consigne = el('p', 'carte-defi__consigne', defi.consigne);

    var contextes = el('p', 'carte-defi__contextes',
      defi.contextes.map(function (c) { return CONTEXTES[c]; }).join(' · '));

    var pied = el('div', 'carte-defi__pied');

    var ouvrir = el('a', 'bouton bouton--secondaire carte-defi__ouvrir', 'Ouvrir cette idée');
    ouvrir.href = '#/defi/' + encodeURIComponent(defi.id);

    var favori = el('button', 'carte-defi__favori');
    favori.type = 'button';
    favori.setAttribute('data-action', 'favori');
    favori.setAttribute('data-id', defi.id);
    var actif = estFavori(defi.id);
    favori.setAttribute('aria-pressed', actif ? 'true' : 'false');
    favori.setAttribute('aria-label', (actif ? 'Retirer des favoris' : 'Garder en favori') + ' : ' + defi.titre);
    favori.appendChild(svgInterne('<path d="M7 4h10v16l-5-4-5 4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>', 'signet'));

    pied.appendChild(ouvrir);
    pied.appendChild(favori);

    corps.appendChild(meta);
    corps.appendChild(titre);
    corps.appendChild(consigne);
    corps.appendChild(contextes);
    corps.appendChild(pied);

    li.appendChild(ruban);
    li.appendChild(scene);
    li.appendChild(corps);
    return li;
  }

  function gererClicFavori(evt) {
    var bouton = evt.target.closest('[data-action="favori"]');
    if (!bouton) return;
    var id = bouton.getAttribute('data-id');
    if (!id) return;
    var ajoute = faireBasculerFavori(id);
    bouton.setAttribute('aria-pressed', ajoute ? 'true' : 'false');
    bouton.setAttribute('aria-label', (ajoute ? 'Retirer des favoris' : 'Garder en favori') + ' : ' + (trouverDefi(id) || {}).titre);
    bouton.classList.remove('est-pose');
    void bouton.offsetWidth;
    bouton.classList.add('est-pose');

    var carteDefi = bouton.closest('.carte-defi');
    if (carteDefi) {
      var ruban = carteDefi.querySelector('.carte-defi__ruban');
      if (ruban) ruban.setAttribute('data-actif', ajoute ? 'oui' : 'non');
    }

    annoncer(ajoute ? 'Idée gardée en favori.' : 'Idée retirée des favoris.');

    if (window.location.hash.indexOf('#/favoris') === 0) rendreFavoris();
    if (etat.defiCourantId === id) majBoutonFavori();
  }

  document.addEventListener('click', gererClicFavori);

  /* ------------------------------------------------------------------ 11. Favoris */

  var grilleFavoris = $('[data-grille-favoris]');
  var favorisVide = $('[data-favoris-vide]');

  function rendreFavoris() {
    if (!grilleFavoris) return;
    var liste = etat.modele.favoris.map(trouverDefi).filter(Boolean);
    grilleFavoris.replaceChildren.apply(grilleFavoris, liste.map(creerCarteDefi));
    grilleFavoris.hidden = liste.length === 0;
    if (favorisVide) favorisVide.hidden = liste.length !== 0;
  }

  /* ------------------------------------------------------------------ 12. Carnet */

  var listeCarnet = $('[data-liste-carnet]');
  var carnetVide = $('[data-carnet-vide]');
  var carnetCompte = $('[data-carnet-compte-texte]');

  function compterStatuts() {
    var compte = { realise: 0, essaye: 0, passe: 0 };
    etat.modele.carnet.forEach(function (p) { if (compte[p.statut] !== undefined) compte[p.statut]++; });
    return compte;
  }

  function majPastilles() {
    var compteCarnet = etat.modele.carnet.length;
    var compteFavoris = etat.modele.favoris.length;
    $$('[data-compte="carnet"]').forEach(function (n) {
      n.textContent = String(compteCarnet);
      n.hidden = compteCarnet === 0;
    });
    $$('[data-compte="favoris"]').forEach(function (n) {
      n.textContent = String(compteFavoris);
      n.hidden = compteFavoris === 0;
    });
  }

  function creerPageCarnet(page) {
    var defi = trouverDefi(page.defiId);
    var li = el('li', 'page-carnet');
    li.setAttribute('data-page', page.id);

    var entete = el('div', 'page-carnet__entete');
    var titre = el('h2', 'page-carnet__titre', defi ? defi.titre : 'Idée retirée de la bibliothèque');
    var date = el('span', 'page-carnet__date', 'noté le ' + dateLisible(page.cree));
    entete.appendChild(titre);
    entete.appendChild(date);

    var meta = el('p', 'page-carnet__meta');
    if (defi) {
      meta.appendChild(el('span', 'etiquette-cat', CATEGORIES[defi.categorie].court));
      meta.appendChild(el('span', null, defi.duree + ' min'));
    } else {
      meta.appendChild(el('span', null, 'identifiant : ' + page.defiId));
    }

    li.appendChild(entete);
    li.appendChild(meta);

    var question = null;
    if (defi && defi.question) {
      question = el('p', 'page-carnet__question', defi.question);
      question.setAttribute('data-question', page.id);
      /* La question sert d'amorce : une fois la note écrite, elle s'efface. */
      if (page.note) question.hidden = true;
      li.appendChild(question);
    }

    /* statut */
    var groupe = el('div', 'statuts');
    groupe.setAttribute('role', 'group');
    var idLegende = 'statuts-' + page.id;
    var legende = el('p', 'statuts__legende', 'Où en es-tu ?');
    legende.id = idLegende;
    groupe.setAttribute('aria-labelledby', idLegende);
    groupe.appendChild(legende);

    Object.keys(STATUTS).forEach(function (cle) {
      var label = el('label', 'statut');
      var input = el('input');
      input.type = 'radio';
      input.name = 'statut-' + page.id;
      input.value = cle;
      input.checked = page.statut === cle;
      input.setAttribute('data-action', 'statut');
      var boite = el('span', 'statut__boite', STATUTS[cle]);
      label.appendChild(input);
      label.appendChild(boite);
      groupe.appendChild(label);
    });
    li.appendChild(groupe);

    /* note */
    var zoneNote = el('div', 'page-carnet__note');
    var idNote = 'note-' + page.id;
    var labelNote = el('label', null, 'Ta note, si tu veux');
    labelNote.setAttribute('for', idNote);
    var textarea = el('textarea');
    textarea.id = idNote;
    textarea.value = page.note;
    textarea.maxLength = 2000;
    textarea.rows = 2;
    textarea.placeholder = 'Un mot, une phrase, ce que ça a donné…';
    textarea.addEventListener('input', function () {
      textarea.classList.toggle('note-prise', textarea.value.trim().length > 0);
    });
    zoneNote.appendChild(labelNote);
    zoneNote.appendChild(textarea);
    if (page.note) textarea.classList.add('note-prise');
    li.appendChild(zoneNote);

    /* actions */
    var pied = el('div', 'page-carnet__pied');

    var enregistrer = el('button', 'bouton bouton--secondaire', 'Enregistrer la note');
    enregistrer.type = 'button';
    enregistrer.setAttribute('data-action', 'note');

    var supprimer = el('button', 'bouton bouton--fantome', 'Supprimer');
    supprimer.type = 'button';
    supprimer.setAttribute('data-action', 'supprimer');

    var retour = el('p', 'page-carnet__statut-note');
    retour.setAttribute('data-retour', page.id);
    retour.setAttribute('role', 'status');

    if (defi) {
      var ouvrir = el('a', 'bouton bouton--fantome', 'Ouvrir l’idée');
      ouvrir.href = '#/defi/' + encodeURIComponent(defi.id);
      pied.appendChild(ouvrir);
    }
    pied.appendChild(enregistrer);
    pied.appendChild(supprimer);
    pied.appendChild(retour);

    li.appendChild(pied);
    return li;
  }

  function majCompteCarnet(pages) {
    if (!carnetCompte) return;
    if (!pages.length) {
      carnetCompte.textContent = 'Aucune page pour l’instant.';
      return;
    }
    var c = compterStatuts();
    var morceaux = [];
    if (c.realise) morceaux.push(c.realise + ' réalisé' + (c.realise > 1 ? 's' : ''));
    if (c.essaye) morceaux.push(c.essaye + ' essayé' + (c.essaye > 1 ? 's' : ''));
    if (c.passe) morceaux.push(c.passe + ' passé' + (c.passe > 1 ? 's' : ''));
    carnetCompte.textContent = pages.length + ' page' + (pages.length > 1 ? 's' : '') + ' — ' + morceaux.join(', ') + '.';
  }

  function rendreCarnet() {
    if (!listeCarnet) return;
    var pages = etat.modele.carnet.slice().sort(function (a, b) {
      return String(b.cree).localeCompare(String(a.cree));
    });

    listeCarnet.replaceChildren.apply(listeCarnet, pages.map(creerPageCarnet));
    listeCarnet.hidden = pages.length === 0;
    if (carnetVide) carnetVide.hidden = pages.length !== 0;

    majCompteCarnet(pages);
    majPastilles();
  }

  if (listeCarnet) {
    listeCarnet.addEventListener('change', function (evt) {
      var input = evt.target;
      if (!input || input.getAttribute('data-action') !== 'statut') return;
      var pageLi = input.closest('[data-page]');
      if (!pageLi) return;
      var page = etat.modele.carnet.find(function (p) { return p.id === pageLi.getAttribute('data-page'); });
      if (!page || !STATUTS[input.value]) return;
      page.statut = input.value;
      page.maj = horodatage();
      sauvegarder();
      var retour = pageLi.querySelector('[data-retour]');
      if (retour) retour.textContent = 'Statut : ' + STATUTS[page.statut].toLowerCase() + '.';
      majCompteCarnet(etat.modele.carnet);
      annoncer('Statut mis à jour : ' + STATUTS[page.statut].toLowerCase() + '.');
    });

    listeCarnet.addEventListener('click', function (evt) {
      var bouton = evt.target.closest('[data-action]');
      if (!bouton) return;
      var action = bouton.getAttribute('data-action');
      var pageLi = bouton.closest('[data-page]');
      if (!pageLi) return;
      var id = pageLi.getAttribute('data-page');
      var page = etat.modele.carnet.find(function (p) { return p.id === id; });
      if (!page) return;

      if (action === 'note') {
        var textarea = pageLi.querySelector('textarea');
        var texte = (textarea ? textarea.value : '').slice(0, 2000).trim();
        var retour = pageLi.querySelector('[data-retour]');
        if (!texte) {
          if (retour) retour.textContent = 'Rien à enregistrer : la note est vide.';
          annoncer('La note est vide.');
          if (textarea) textarea.focus();
          return;
        }
        page.note = texte;
        page.maj = horodatage();
        sauvegarder();
        if (textarea) {
          textarea.classList.add('note-transmise');
          window.setTimeout(function () { textarea.classList.remove('note-transmise'); }, 950);
        }
        var questionAffichee = pageLi.querySelector('[data-question]');
        if (questionAffichee) {
          questionAffichee.hidden = true;
          questionAffichee.setAttribute('aria-hidden', 'true');
        }
        if (retour) retour.textContent = 'Note enregistrée. Les questions restent dans le défi, pas dans le carnet.';
        annoncer('Note enregistrée.');
      }

      if (action === 'supprimer') {
        ouvrirDialogueSuppression(page);
      }
    });
  }

  /* ------------------------------------------------------------------ 13. Suppression */

  var dialogueSuppression = $('#dialogue-suppression');
  var texteSuppression = $('[data-suppression-texte]');

  function ouvrirDialogueSuppression(page) {
    if (!dialogueSuppression) return;
    etat.suppressionId = page.id;
    var defi = trouverDefi(page.defiId);
    if (texteSuppression) {
      texteSuppression.textContent = '« ' + (defi ? defi.titre : 'cette page') + ' » sera retirée de ce navigateur. '
        + 'Les notes saisies seront perdues. C’est définitif.';
    }
    if (typeof dialogueSuppression.showModal === 'function') dialogueSuppression.showModal();
    else if (window.confirm('Supprimer cette page de carnet ?')) supprimerPage(page.id);
  }

  function supprimerPage(id) {
    var avant = etat.modele.carnet.length;
    etat.modele.carnet = etat.modele.carnet.filter(function (p) { return p.id !== id; });
    if (etat.modele.carnet.length === avant) return;
    sauvegarder();
    rendreCarnet();
    annoncer('Page supprimée du carnet.');
  }

  if (dialogueSuppression) {
    dialogueSuppression.addEventListener('close', function () {
      if (dialogueSuppression.returnValue === 'supprimer' && etat.suppressionId) {
        supprimerPage(etat.suppressionId);
      }
      etat.suppressionId = null;
    });
  }

  /* ------------------------------------------------------------------ 14. Import / export */

  var dialogueImport = $('#dialogue-import');
  var texteImport = $('[data-import-texte]');
  var boutonImportConfirmer = $('[data-import-confirmer]');
  var boutonImportAnnuler = $('[data-import-annuler]');
  var champFichier = $('#fichier-import');

  function construireExport() {
    return {
      application: 'DECLIC',
      version: VERSION,
      exporte: horodatage(),
      favoris: etat.modele.favoris.slice(),
      carnet: etat.modele.carnet.map(function (p) {
        return { id: p.id, defiId: p.defiId, statut: p.statut, note: p.note, cree: p.cree, maj: p.maj };
      })
    };
  }

  function exporter() {
    var donnees = construireExport();
    var texte = JSON.stringify(donnees, null, 2);
    var nom = 'declic-carnet-' + new Date().toISOString().slice(0, 10) + '.json';
    try {
      var blob = new Blob([texte], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var lien = el('a');
      lien.href = url;
      lien.download = nom;
      document.body.appendChild(lien);
      lien.click();
      document.body.removeChild(lien);
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      annoncer('Export préparé : ' + nom + '. ' + donnees.carnet.length + ' page(s), ' + donnees.favoris.length + ' favori(s).');
    } catch (e) {
      if (texteImport) texteImport.textContent = 'L’export a échoué dans ce navigateur. Voici le contenu à copier : ' + texte.slice(0, 1200);
      if (dialogueImport && typeof dialogueImport.showModal === 'function') dialogueImport.showModal();
    }
  }

  function validerImport(donnees) {
    if (!donnees || typeof donnees !== 'object') return { ok: false, message: 'Le fichier ne contient pas un objet JSON lisible.' };
    if (!Array.isArray(donnees.favoris) && !Array.isArray(donnees.carnet)) {
      return { ok: false, message: 'Le fichier ne ressemble pas à un export DÉCLIC : ni « favoris » ni « carnet ».' };
    }
    var normalise = normaliserModele({
      favoris: donnees.favoris,
      carnet: donnees.carnet,
      atelier: etat.modele.atelier
    });
    return {
      ok: true,
      modele: normalise.modele,
      ignorees: normalise.ignorees,
      apercu: {
        favoris: normalise.modele.favoris.length,
        pages: normalise.modele.carnet.length,
        exporte: typeof donnees.exporte === 'string' ? donnees.exporte : null,
        version: donnees.version !== undefined ? donnees.version : null,
        ignorees: normalise.ignorees
      }
    };
  }

  function preparerApercuImport(fichier) {
    if (!fichier) return;
    if (fichier.size > 2 * 1024 * 1024) {
      annoncer('Fichier trop volumineux : 2 Mo maximum.');
      return;
    }
    var lecteur = new FileReader();
    lecteur.onload = function () {
      var donnees;
      try {
        donnees = JSON.parse(String(lecteur.result));
      } catch (e) {
        annoncer('Fichier illisible : ce n’est pas du JSON valide.');
        if (texteImport) texteImport.textContent = 'Fichier illisible : ce n’est pas du JSON valide.';
        return;
      }
      var verdict = validerImport(donnees);
      if (!verdict.ok) {
        annoncer(verdict.message);
        if (texteImport) texteImport.textContent = verdict.message;
        return;
      }

      etat.importEnAttente = verdict.modele;
      var p = verdict.apercu;
      if (texteImport) {
        var fragment = document.createDocumentFragment();
        fragment.appendChild(el('p', null, 'Ce fichier contient :'));
        var ul = el('ul');
        ul.appendChild(el('li', null, p.pages + ' page' + (p.pages > 1 ? 's' : '') + ' de carnet'));
        ul.appendChild(el('li', null, p.favoris + ' favori' + (p.favoris > 1 ? 's' : '')));
        if (p.exporte) ul.appendChild(el('li', null, 'exporté le ' + dateLisible(p.exporte)));
        if (p.version !== null) ul.appendChild(el('li', null, 'version du format : ' + String(p.version)));
        if (p.ignorees) ul.appendChild(el('li', null, p.ignorees + ' entrée(s) ignorée(s), car incomplètes ou inconnues'));
        fragment.appendChild(ul);
        fragment.appendChild(el('p', null, 'L’import remplace intégralement ton carnet et tes favoris actuels (' + etat.modele.carnet.length + ' page(s), ' + etat.modele.favoris.length + ' favori(s)).'));
        texteImport.replaceChildren(fragment);
      }
      if (dialogueImport && typeof dialogueImport.showModal === 'function') dialogueImport.showModal();
      else confirmerImport();
    };
    lecteur.onerror = function () {
      annoncer('Lecture du fichier impossible.');
    };
    lecteur.readAsText(fichier);
  }

  function confirmerImport() {
    if (!etat.importEnAttente) return;
    etat.modele.favoris = etat.importEnAttente.favoris.slice();
    etat.modele.carnet = etat.importEnAttente.carnet.slice();
    etat.importEnAttente = null;
    sauvegarder();
    rendreCarnet();
    rendreFavoris();
    majPastilles();
    if (dialogueImport && dialogueImport.open) dialogueImport.close();
    annoncer('Import terminé : ' + etat.modele.carnet.length + ' page(s), ' + etat.modele.favoris.length + ' favori(s).');
  }

  var btnExport = $('#btn-export');
  var btnImport = $('#btn-import');
  if (btnExport) btnExport.addEventListener('click', exporter);
  if (btnImport && champFichier) {
    btnImport.addEventListener('click', function () { champFichier.click(); });
    champFichier.addEventListener('change', function () {
      var fichier = champFichier.files && champFichier.files[0];
      preparerApercuImport(fichier);
      champFichier.value = '';
    });
  }
  if (dialogueImport) {
    dialogueImport.addEventListener('close', function () {
      if (!etat.importEnAttente) return;
      etat.importEnAttente = null;
      annoncer('Import annulé. Rien n’a été modifié.');
    });
  }
  if (boutonImportConfirmer) boutonImportConfirmer.addEventListener('click', confirmerImport);
  if (boutonImportAnnuler) {
    boutonImportAnnuler.addEventListener('click', function () {
      etat.importEnAttente = null;
      if (dialogueImport && dialogueImport.open) dialogueImport.close();
    });
  }

  /* ------------------------------------------------------------------ 15. Lien direct vers une idée */

  function ouvrirDefiDepuisRoute(id) {
    var defi = trouverDefi(id);
    if (!defi) {
      annoncer('Cette idée n’existe pas ou plus.');
      if (els.invitation) els.invitation.textContent = 'Cette idée n’existe pas ou plus. Compose une nouvelle carte.';
      window.location.hash = '#/trouver';
      return;
    }

    reglerRadios({
      duree: defi.duree,
      categorie: defi.categorie,
      contexte: defi.contextes[0]
    });
    majCarte();
    etat.defiCourantId = defi.id;
    rendreDefi(defi);
    carte.setAttribute('data-etat', 'ouverte');
    majBoutonOuvrir(true);
    depliage.inert = false;
    depliage.removeAttribute('aria-hidden');
    els.actions.hidden = false;
    etat.modele.atelier = {
      duree: defi.duree, categorie: defi.categorie, contexte: defi.contextes[0],
      defiId: defi.id, ouverte: true
    };
    sauvegarder();
    annoncer('Idée ouverte : ' + defi.titre + '.');
    var vue = $('[data-vue="trouver"]');
    if (vue && vue.getBoundingClientRect().top < -4) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }

  /* ------------------------------------------------------------------ 16. Restauration & démarrage */

  function restaurerAtelier() {
    var a = etat.modele.atelier;
    reglerRadios({ duree: a.duree, categorie: a.categorie, contexte: a.contexte });
    majCarte();

    if (a.ouverte && a.defiId) {
      var defi = trouverDefi(a.defiId);
      if (defi && correspondre(defi, a)) {
        etat.defiCourantId = defi.id;
        rendreDefi(defi);
        carte.setAttribute('data-etat', 'ouverte');
        majBoutonOuvrir(true);
        depliage.inert = false;
        depliage.removeAttribute('aria-hidden');
        els.actions.hidden = false;
        etat.modele.atelier.ouverte = true;
        etat.modele.atelier.defiId = defi.id;
        sauvegarder();
        majPiedNote('Carte retrouvée telle que tu l’avais laissée.');
      }
    } else {
      depliage.inert = true;
      depliage.setAttribute('aria-hidden', 'true');
    }
  }

  function demarrer() {
    var verdict = validerBibliotheque(BIBLIO);
    BIBLIO = verdict.valides;

    stockage.verifier();
    if (!stockage.disponible) {
      afficherBanniereStockage(stockage.raison + ' Tu peux continuer : le carnet et les favoris fonctionneront le temps de cette visite, et l’export JSON reste disponible.');
    }

    var brut = stockage.lire();
    if (brut) {
      try {
        var lu = normaliserModele(JSON.parse(brut));
        etat.modele = lu.modele;
        if (lu.ignorees) {
          afficherBanniereStockage(lu.ignorees + ' entrée(s) du carnet n’ont pas pu être relues (idée inconnue ou statut invalide). Elles ont été écartées ; le reste du carnet est intact.');
        }
      } catch (e) {
        stockage.mettreDeCote(brut);
        afficherBanniereStockage('Les données enregistrées dans ce navigateur étaient illisibles. Une copie brute a été conservée de côté, et le carnet repart vide.');
        etat.modele = modeleVide();
      }
    }

    if (!BIBLIO.length) {
      afficherBanniereStockage('La bibliothèque de défis n’a pas pu être chargée (data/defis.js). Le site reste consultable, mais aucune idée ne peut être proposée.');
      annoncer('Bibliothèque indisponible.');
    } else if (verdict.rejets.length) {
      console.warn('DÉCLIC — défis écartés :', verdict.rejets);
    }

    restaurerAtelier();
    majPastilles();
    rendreExplorer({ sansAnnonce: true, depuisRoute: true });
    rendreFavoris();
    rendreCarnet();

    window.addEventListener('hashchange', router);
    router();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
  else demarrer();
})();
