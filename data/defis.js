/*
  DÉCLIC — bibliothèque éditoriale locale
  ---------------------------------------
  Aucune génération, aucune IA, aucune requête réseau : ces défis sont écrits,
  relus et rangés à la main. Le fichier est volontairement séparé de script.js
  pour qu'on puisse corriger un texte sans toucher à la mécanique.

  Champs d'un défi :
    id        identifiant stable (ne jamais le changer : le carnet s'y réfère)
    titre     titre éditorial court
    categorie creer | observer | reflechir | bouger | partager
    duree     5 | 15 | 30 (minutes, durée réaliste, pas une promesse)
    contextes liste parmi : maison, bureau, dehors, trajet, ensemble
    materiel  liste de matériel courant, jamais d'achat nécessaire
    consigne  une phrase qui dit quoi faire
    etapes    2 ou 3 étapes concrètes
    variante  version plus accessible (assise, plus courte, sans matériel)
    question  question facultative pour garder une trace dans le carnet

  Règles de rédaction tenues pour l'ensemble des défis :
    pas d'achat, pas de danger, pas de publication imposée, pas de contact
    avec des inconnus, pas d'effort physique intense, pas de promesse
    psychologique. Les défis « partager » ont toujours une version en solo.
*/
window.DECLIC_DEFIS = [
  /* ------------------------------------------------ CRÉER (8) */
  {
    id: 'creer-trait-chemin',
    titre: 'Le trait devient un chemin',
    categorie: 'creer',
    duree: 5,
    contextes: ['maison', 'bureau', 'trajet', 'dehors', 'ensemble'],
    materiel: ['un stylo', 'une feuille'],
    consigne: 'Dessine une ligne sans lever le stylo pendant vingt secondes, puis relis-la comme une carte.',
    etapes: [
      'Pose la pointe et promène-la vingt secondes, sans jamais la lever.',
      'Regarde le résultat : où sont les côtes, les détours, les impasses ?',
      'Écris trois noms de lieux le long du trait.'
    ],
    variante: 'Sans stylo : suis du doigt les rainures d’une table ou le bord d’un objet, et nomme trois étapes.',
    question: 'Comment s’appelle l’endroit où ton trait s’est arrêté ?'
  },
  {
    id: 'creer-machine-trois-objets',
    titre: 'Trois objets, une machine',
    categorie: 'creer',
    duree: 5,
    contextes: ['maison', 'bureau', 'ensemble'],
    materiel: ['un stylo', 'une feuille', 'trois objets à portée de main'],
    consigne: 'Prends trois objets autour de toi et dessine la machine improbable qu’ils formeraient ensemble.',
    etapes: [
      'Choisis trois objets sans réfléchir plus de dix secondes.',
      'Dessine-les assemblés, même mal, même de travers.',
      'Écris à quoi sert cette machine en une phrase.'
    ],
    variante: 'Pose les objets côte à côte et décris la machine à voix haute au lieu de la dessiner.',
    question: 'À quoi servirait cette machine, honnêtement ?'
  },
  {
    id: 'creer-titre-de-film',
    titre: 'Le titre du film',
    categorie: 'creer',
    duree: 5,
    contextes: ['trajet', 'dehors', 'bureau', 'maison', 'ensemble'],
    materiel: ['rien'],
    consigne: 'Regarde ce qui se passe autour de toi et donne-lui un titre de film, puis un sous-titre.',
    etapes: [
      'Choisis une scène banale : un arrêt, un couloir, une queue.',
      'Trouve un titre de trois mots maximum.',
      'Ajoute un sous-titre qui raconte la suite.'
    ],
    variante: 'Ferme les yeux et donne un titre au dernier bruit que tu as entendu.',
    question: 'Quel serait le titre de la suite ?'
  },
  {
    id: 'creer-feuille-paysage',
    titre: 'La feuille qui se plie en paysage',
    categorie: 'creer',
    duree: 15,
    contextes: ['maison', 'bureau', 'ensemble', 'dehors', 'trajet'],
    materiel: ['une feuille', 'un stylo'],
    consigne: 'Plie une feuille en accordéon, déplie-la, et utilise les plis comme relief pour dessiner un paysage.',
    etapes: [
      'Plie la feuille en quatre ou cinq bandes, dans un sens puis dans l’autre.',
      'Déplie-la et suis les plis : ce sont des crêtes et des vallées.',
      'Ajoute deux ou trois éléments : un arbre, une maison, un chemin.'
    ],
    variante: 'Sans plier : dessine un paysage en partant d’une seule ligne horizontale.',
    question: 'Qu’est-ce qu’on verrait depuis le point le plus haut ?'
  },
  {
    id: 'creer-recette-impossible',
    titre: 'La recette impossible',
    categorie: 'creer',
    duree: 15,
    contextes: ['maison', 'bureau', 'ensemble'],
    materiel: ['un stylo', 'une feuille'],
    consigne: 'Écris une recette avec quatre choses présentes autour de toi, mais détournées de leur usage.',
    etapes: [
      'Note quatre objets ou aliments visibles.',
      'Écris la recette en trois étapes, avec des quantités farfelues mais précises.',
      'Termine par une phrase de service.'
    ],
    variante: 'Dicte la recette à voix haute, en trois phrases, sans rien écrire.',
    question: 'Qui mangerait ça, et pourquoi ?'
  },
  {
    id: 'creer-ombre-theatre',
    titre: 'Le petit théâtre d’ombre',
    categorie: 'creer',
    duree: 30,
    contextes: ['maison', 'bureau', 'ensemble'],
    materiel: ['une lampe ou le soleil', 'une feuille', 'deux objets'],
    consigne: 'Installe une lumière et une surface, puis joue une scène de trente secondes avec des ombres.',
    etapes: [
      'Place une feuille contre un mur et braque la lumière dessus.',
      'Fais entrer deux objets entre la lumière et la feuille.',
      'Joue une scène courte : une rencontre, un départ, un retour.',
      'Dessine l’image que tu as préférée.'
    ],
    variante: 'Sans lumière dirigée : dessine la scène ombre et lumière sur une feuille, en noir et blanc.',
    question: 'Quelle était la scène, en une phrase ?'
  },
  {
    id: 'creer-carte-postale-futur',
    titre: 'Carte postale du futur proche',
    categorie: 'creer',
    duree: 30,
    contextes: ['maison', 'bureau', 'trajet', 'ensemble'],
    materiel: ['une feuille', 'un stylo', 'des couleurs si tu veux'],
    consigne: 'Écris et illustre une carte postale envoyée depuis dans trois jours, à toi ou à quelqu’un.',
    etapes: [
      'Décide d’un lieu ordinaire : ta cuisine, un quai, un escalier.',
      'Écris quatre lignes au présent, comme si tu y étais déjà.',
      'Dessine un timbre inventé dans le coin.',
      'Adresse-la à qui tu veux, ou à toi.'
    ],
    variante: 'Écris seulement les quatre lignes, sans dessin, et garde-les dans ton carnet.',
    question: 'Qu’est-ce qui, dans trois jours, risque d’avoir changé ?'
  },
  {
    id: 'creer-cadre-vide',
    titre: 'Le cadre vide',
    categorie: 'creer',
    duree: 30,
    contextes: ['maison', 'dehors', 'bureau', 'ensemble', 'trajet'],
    materiel: ['une feuille', 'des ciseaux si tu en as'],
    consigne: 'Découpe un cadre dans une feuille et promène-le pour composer cinq images sans appareil photo.',
    etapes: [
      'Découpe (ou dessine) un cadre de la taille de ta main.',
      'Pose-le sur cinq choses différentes, près et loin.',
      'Pour chaque image, note un mot : couleur, matière, ou sensation.',
      'Garde la meilleure en dessin rapide.'
    ],
    variante: 'Sans cadre : forme un rectangle avec tes mains et fais le même parcours.',
    question: 'Quelle image garderais-tu si tu ne pouvais en garder qu’une ?'
  },

  /* ------------------------------------------------ OBSERVER (8) */
  {
    id: 'observer-detail-oublie',
    titre: 'Le détail oublié',
    categorie: 'observer',
    duree: 5,
    contextes: ['maison', 'bureau', 'trajet', 'ensemble', 'dehors'],
    materiel: ['rien'],
    consigne: 'Choisis un objet que tu vois tous les jours et trouve cinq détails que tu n’avais jamais remarqués.',
    etapes: [
      'Regarde l’objet trente secondes sans rien faire d’autre.',
      'Note cinq détails : rayures, traces, jeux de lumière, usure.',
      'Garde celui qui t’étonne le plus.'
    ],
    variante: 'Tu peux toucher l’objet les yeux fermés et décrire cinq sensations à la place.',
    question: 'Quel détail retiens-tu ?'
  },
  {
    id: 'observer-trois-nuances',
    titre: 'Trois fois la même couleur',
    categorie: 'observer',
    duree: 5,
    contextes: ['dehors', 'trajet', 'bureau', 'maison', 'ensemble'],
    materiel: ['rien'],
    consigne: 'Prends une couleur autour de toi et trouve trois de ses nuances dans trois matières différentes.',
    etapes: [
      'Choisis une couleur qui te plaît aujourd’hui.',
      'Trouve-la sur un objet dur, un textile, et quelque chose de vivant ou de lointain.',
      'Compare : laquelle est la plus claire, la plus sombre ?'
    ],
    variante: 'Cherche les trois nuances dans une seule pièce, sans te lever.',
    question: 'Laquelle des trois préfères-tu ?'
  },
  {
    id: 'observer-couleur-manquante',
    titre: 'La couleur qui manque',
    categorie: 'observer',
    duree: 5,
    contextes: ['maison', 'bureau', 'dehors', 'trajet', 'ensemble'],
    materiel: ['rien'],
    consigne: 'Repère la couleur la plus présente autour de toi, puis cherche celle qui n’apparaît nulle part.',
    etapes: [
      'Fais le tour du lieu du regard et nomme la couleur dominante.',
      'Cherche une couleur absente : violet, vert clair, rose, autre chose.',
      'Si tu la trouves, note où elle se cachait.'
    ],
    variante: 'Fais l’exercice en fermant un œil, pour voir ce que le regard choisit en premier.',
    question: 'Où as-tu fini par la trouver ?'
  },
  {
    id: 'observer-son-lointain',
    titre: 'Le son le plus lointain',
    categorie: 'observer',
    duree: 15,
    contextes: ['maison', 'bureau', 'dehors', 'trajet', 'ensemble'],
    materiel: ['rien'],
    consigne: 'Ferme les yeux deux minutes et range les sons du plus proche au plus lointain.',
    etapes: [
      'Ferme les yeux, sans bouger, deux minutes.',
      'Ouvre les yeux et note cinq sons dans l’ordre de distance.',
      'Écris à côté de chacun ce que tu imagines de sa source.'
    ],
    variante: 'Dans un lieu bruyant : concentre-toi sur un seul son continu et décris-le en trois mots.',
    question: 'Lequel des sons t’a surpris ?'
  },
  {
    id: 'observer-quatre-points-de-vue',
    titre: 'La fenêtre, quatre points de vue',
    categorie: 'observer',
    duree: 15,
    contextes: ['maison', 'bureau', 'dehors', 'trajet', 'ensemble'],
    materiel: ['rien'],
    consigne: 'Regarde une même scène de quatre manières et note ce qui change.',
    etapes: [
      'Observe la scène debout, puis assis.',
      'Regarde-la en plissant les yeux, puis à travers un cadre fait de tes mains.',
      'Note une chose que chaque point de vue a révélée.'
    ],
    variante: 'Deux points de vue seulement : debout, puis assis, trente secondes chacun.',
    question: 'Lequel montrait le plus de choses ?'
  },
  {
    id: 'observer-ombres-quartier',
    titre: 'Le plan des ombres',
    categorie: 'observer',
    duree: 15,
    contextes: ['dehors', 'trajet', 'maison', 'bureau', 'ensemble'],
    materiel: ['rien'],
    consigne: 'Cherche comment les ombres renseignent sur l’heure, la lumière et le vent, sans regarder ta montre.',
    etapes: [
      'Repère trois ombres de longueurs différentes.',
      'Devine l’heure à partir de la plus courte, puis vérifie.',
      'Trouve un objet dont l’ombre indique une direction.'
    ],
    variante: 'Depuis une fenêtre, observe seulement les ombres qui bougent : feuilles, nuages, passants.',
    question: 'À quelle heure étais-tu, d’après les ombres ?'
  },
  {
    id: 'observer-portrait-lieu',
    titre: 'Le portrait d’un lieu sans photo',
    categorie: 'observer',
    duree: 30,
    contextes: ['dehors', 'maison', 'bureau', 'trajet', 'ensemble'],
    materiel: ['un stylo', 'une feuille'],
    consigne: 'Décris un lieu en vingt mots, sans adjectifs de valeur comme beau, triste ou agréable.',
    etapes: [
      'Choisis un lieu où tu peux rester dix minutes.',
      'Note d’abord les faits : matières, bruits, lumières, distances.',
      'Écris une description de vingt mots exactement.',
      'Relis et supprime un mot, puis un autre.'
    ],
    variante: 'Décris le lieu à voix haute en dix mots, sans écrire.',
    question: 'Quel détail rendrait ce lieu reconnaissable entre mille ?'
  },
  {
    id: 'observer-inventaire-minuscule',
    titre: 'L’inventaire minuscule',
    categorie: 'observer',
    duree: 30,
    contextes: ['maison', 'bureau', 'ensemble', 'dehors'],
    materiel: ['un stylo', 'une feuille'],
    consigne: 'Recense douze petits objets autour de toi et invente une ligne d’histoire pour chacun.',
    etapes: [
      'Cherche douze objets plus petits qu’une main.',
      'Range-les du plus ancien au plus récent, selon toi.',
      'Écris pour trois d’entre eux une phrase qui raconte d’où ils viennent.'
    ],
    variante: 'Choisis cinq objets et dis leur histoire à voix haute.',
    question: 'Lequel garderais-tu si tu devais en garder un seul ?'
  },

  /* ------------------------------------------------ RÉFLÉCHIR (8) */
  {
    id: 'reflechir-deux-formes',
    titre: 'Deux formes, trois assemblages',
    categorie: 'reflechir',
    duree: 5,
    contextes: ['maison', 'bureau', 'trajet', 'dehors', 'ensemble'],
    materiel: ['un stylo', 'une feuille'],
    consigne: 'Dessine deux formes simples, puis assemble-les de trois façons différentes et nomme chaque assemblage.',
    etapes: [
      'Trace deux formes : un triangle et un rectangle, ou un cercle et une ligne.',
      'Assemble-les trois fois, différemment.',
      'Donne un nom à chaque assemblage.'
    ],
    variante: 'Sans dessin : pose deux objets et déplace-les trois fois en nommant chaque position.',
    question: 'Lequel des trois assemblages préfères-tu ?'
  },
  {
    id: 'reflechir-meilleure-question',
    titre: 'La question meilleure',
    categorie: 'reflechir',
    duree: 5,
    contextes: ['maison', 'bureau', 'trajet', 'ensemble', 'dehors'],
    materiel: ['un stylo', 'une feuille'],
    consigne: 'Prends une décision en cours et écris cinq questions à son sujet, puis entoure la plus utile.',
    etapes: [
      'Écris la décision en une phrase, sans la juger.',
      'Écris cinq questions, même mauvaises.',
      'Entoure celle qui ouvrirait le plus de possibilités.'
    ],
    variante: 'Fais l’exercice à voix haute, sans écrire, en trois questions.',
    question: 'Quelle question as-tu entourée ?'
  },
  {
    id: 'reflechir-titre-journee',
    titre: 'Le titre de ta journée',
    categorie: 'reflechir',
    duree: 5,
    contextes: ['trajet', 'maison', 'bureau', 'dehors', 'ensemble'],
    materiel: ['rien'],
    consigne: 'Donne à ta journée en cours un titre, un sous-titre et une phrase de résumé.',
    etapes: [
      'Pense à trois moments depuis le réveil.',
      'Choisis un titre de trois mots.',
      'Ajoute une phrase qui dit ce qui compte dans cette journée.'
    ],
    variante: 'Choisis seulement trois mots, sans phrase.',
    question: 'Quel titre as-tu trouvé ?'
  },
  {
    id: 'reflechir-pour-contre-objets',
    titre: 'Le pour et le contre en objets',
    categorie: 'reflechir',
    duree: 15,
    contextes: ['maison', 'bureau', 'ensemble'],
    materiel: ['cinq petits objets'],
    consigne: 'Utilise cinq petits objets comme jetons pour peser une décision à deux options.',
    etapes: [
      'Pose un objet au centre : c’est la décision.',
      'Place deux objets à gauche pour une option, deux à droite pour l’autre.',
      'Déplace un objet à chaque argument que tu trouves.',
      'Regarde la position finale, sans obéir.'
    ],
    variante: 'Sans objets : utilise cinq doigts et lève-les pour chaque argument.',
    question: 'Qu’est-ce qui a fait bouger le dernier objet ?'
  },
  {
    id: 'reflechir-carte-possibles',
    titre: 'La carte des possibles',
    categorie: 'reflechir',
    duree: 15,
    contextes: ['maison', 'bureau', 'trajet', 'dehors', 'ensemble'],
    materiel: ['un stylo', 'une feuille'],
    consigne: 'Dessine trois chemins possibles pour la même journée avec trois façons d’en sortir.',
    etapes: [
      'Dessine un point de départ : maintenant.',
      'Trace trois branches vers trois fins de journée différentes.',
      'Ajoute sur chaque branche un imprévu probable.',
      'Relie deux branches par un raccourci.'
    ],
    variante: 'Décris les trois fins de journée à voix haute, en une phrase chacune.',
    question: 'Laquelle des trois fins te ressemble le plus aujourd’hui ?'
  },
  {
    id: 'reflechir-mot-qui-manque',
    titre: 'Le mot qui manque',
    categorie: 'reflechir',
    duree: 15,
    contextes: ['maison', 'bureau', 'trajet', 'dehors', 'ensemble'],
    materiel: ['un stylo', 'une feuille'],
    consigne: 'Écris trois phrases sur ta journée, puis retire un mot à chaque fois pour voir ce qui reste.',
    etapes: [
      'Écris trois phrases sans te relire.',
      'Barre un mot par phrase, le moins nécessaire.',
      'Barre encore un mot par phrase.',
      'Lis ce qui reste à voix haute.'
    ],
    variante: 'Fais-le avec une seule phrase et deux mots barrés.',
    question: 'Qu’est-ce qui reste quand on enlève le reste ?'
  },
  {
    id: 'reflechir-lettre-hesitation',
    titre: 'La lettre à qui hésite',
    categorie: 'reflechir',
    duree: 30,
    contextes: ['maison', 'bureau', 'trajet', 'ensemble', 'dehors'],
    materiel: ['un stylo', 'une feuille'],
    consigne: 'Écris une lettre courte à quelqu’un qui doit choisir, sans lui donner de conseil.',
    etapes: [
      'Pense à une situation de choix, réelle ou imaginée.',
      'Écris quatre phrases qui décrivent ce que tu vois de sa situation.',
      'Termine par une question, pas par une solution.'
    ],
    variante: 'Écris trois phrases seulement, dont une question.',
    question: 'Quelle question as-tu posée à la fin ?'
  },
  {
    id: 'reflechir-musee-evidences',
    titre: 'Le musée des évidences',
    categorie: 'reflechir',
    duree: 30,
    contextes: ['maison', 'bureau', 'dehors', 'trajet', 'ensemble'],
    materiel: ['un stylo', 'une feuille'],
    consigne: 'Liste dix évidences de ta journée, puis retourne-en trois pour voir ce qu’elles deviennent.',
    etapes: [
      'Écris dix phrases qui commencent par « c’est normal que ».',
      'Choisis-en trois et inverse-les.',
      'Note ce que l’inversion rend visible.'
    ],
    variante: 'Fais-le avec quatre évidences et une seule inversion.',
    question: 'Laquelle des inversions t’a le plus surpris ?'
  },

  /* ------------------------------------------------ BOUGER DOUCEMENT (7) */
  {
    id: 'bouger-tour-pieuvre',
    titre: 'Le tour de la pièce, autrement',
    categorie: 'bouger',
    duree: 5,
    contextes: ['maison', 'bureau', 'ensemble'],
    materiel: ['rien'],
    consigne: 'Fais un tour lent de la pièce en changeant une seule chose : le rythme, l’appui, ou le chemin.',
    etapes: [
      'Fais un tour à ton rythme habituel.',
      'Refais le tour plus lentement, en posant toute la plante du pied.',
      'Note la différence en un mot.'
    ],
    variante: 'Assis : parcours le tour de la pièce seulement des yeux, en trois arrêts.',
    question: 'Qu’est-ce qui a changé dans le deuxième tour ?'
  },
  {
    id: 'bouger-trois-etirements',
    titre: 'Trois étirements d’écoute',
    categorie: 'bouger',
    duree: 5,
    contextes: ['maison', 'bureau', 'trajet', 'ensemble'],
    materiel: ['rien'],
    consigne: 'Fais trois mouvements doux et lents — nuque, épaules, mains — en restant dans le confort.',
    etapes: [
      'Tourne doucement la tête à droite, puis à gauche, sans forcer.',
      'Monte les épaules vers les oreilles, relâche en soufflant.',
      'Ouvre et ferme les mains lentement, dix fois.',
      'Reste immobile trente secondes.'
    ],
    variante: 'Assis ou allongé : ne bouge que les mains et les pieds.',
    question: 'Où as-tu senti le plus de relâchement ?'
  },
  {
    id: 'bouger-cinq-minutes-dehors',
    titre: 'Le trajet des cinq minutes',
    categorie: 'bouger',
    duree: 15,
    contextes: ['dehors'],
    materiel: ['rien'],
    consigne: 'Sors cinq minutes sans destination précise, puis reviens par un autre chemin.',
    etapes: [
      'Sors et marche cinq minutes sans décider où aller.',
      'Choisis un point de repère et fais demi-tour.',
      'Reviens par une rue ou un chemin différent.',
      'Note un détail que tu n’avais jamais vu près de chez toi.'
    ],
    variante: 'Depuis une fenêtre : fais le même parcours du regard et décris-le en trois phrases.',
    question: 'Quel détail as-tu découvert ?'
  },
  {
    id: 'bouger-pause-debout',
    titre: 'La pause debout',
    categorie: 'bouger',
    duree: 15,
    contextes: ['maison', 'bureau'],
    materiel: ['rien'],
    consigne: 'Pendant un quart d’heure, lève-toi trois fois et change de posture à chaque fois.',
    etapes: [
      'Commence par une posture confortable, assise ou debout.',
      'Toutes les cinq minutes, change : debout, accoudé, assis autrement.',
      'Après chaque changement, note une sensation en un mot.'
    ],
    variante: 'Si tu ne peux pas te lever : change seulement la position des bras et du regard.',
    question: 'Quelle posture était la plus confortable ?'
  },
  {
    id: 'bouger-chemin-du-regard',
    titre: 'Le chemin du regard',
    categorie: 'bouger',
    duree: 15,
    contextes: ['maison', 'bureau', 'trajet', 'dehors', 'ensemble'],
    materiel: ['rien'],
    consigne: 'Suis des yeux un trajet précis dans l’espace, trois fois, en changeant de point de départ.',
    etapes: [
      'Choisis un objet de départ et un objet d’arrivée.',
      'Relie-les du regard sans sauter, en suivant les arêtes et les lignes.',
      'Recommence depuis un autre départ.',
      'Trouve le trajet le plus long possible.'
    ],
    variante: 'Fais-le sur une seule image ou une photo, en suivant les lignes du bout du doigt dans l’air.',
    question: 'Quel trajet était le plus inattendu ?'
  },
  {
    id: 'bouger-marche-du-detail',
    titre: 'La marche du détail',
    categorie: 'bouger',
    duree: 30,
    contextes: ['dehors'],
    materiel: ['rien'],
    consigne: 'Marche quinze minutes en changeant de rythme à chaque coin de rue.',
    etapes: [
      'Commence à ton rythme habituel.',
      'À chaque coin de rue, change : plus lent, normal, plus lent.',
      'Toutes les cinq minutes, arrête-toi et regarde en arrière.',
      'Note une chose que tu as vue trois fois.'
    ],
    variante: 'Sans sortir : fais le même principe dans un couloir ou une pièce, sur trois minutes.',
    question: 'Qu’est-ce qui revient trois fois dans ce trajet ?'
  },
  {
    id: 'bouger-banc-aller-retour',
    titre: 'Le banc et l’aller-retour',
    categorie: 'bouger',
    duree: 30,
    contextes: ['dehors', 'ensemble'],
    materiel: ['rien'],
    consigne: 'Assieds-toi quelque part dix minutes, marche cinq minutes, reviens t’asseoir au même endroit.',
    etapes: [
      'Trouve un endroit où t’asseoir tranquillement.',
      'Observe dix minutes sans téléphone.',
      'Marche cinq minutes dans une direction simple.',
      'Reviens au même endroit et note ce qui a changé.'
    ],
    variante: 'Reste assis et remplace la marche par cinq minutes d’observation d’un seul détail.',
    question: 'Le lieu était-il différent au retour ?'
  },

  /* ------------------------------------------------ PARTAGER (7) */
  {
    id: 'partager-question-tasse',
    titre: 'La question de la tasse',
    categorie: 'partager',
    duree: 5,
    contextes: ['ensemble', 'maison'],
    materiel: ['rien'],
    consigne: 'Pose à quelqu’un une question qui n’attend pas de réponse utile.',
    etapes: [
      'Trouve une question simple sur son goût, sa journée, ses habitudes.',
      'Pose-la sans enchaîner sur autre chose.',
      'Écoute la réponse jusqu’au bout, sans la compléter.'
    ],
    variante: 'En solo : écris la question et réponds-y pour toi.',
    question: 'Qu’as-tu appris en écoutant ?'
  },
  {
    id: 'partager-detail-offert',
    titre: 'Le détail offert',
    categorie: 'partager',
    duree: 5,
    contextes: ['ensemble', 'maison', 'bureau', 'dehors'],
    materiel: ['rien'],
    consigne: 'Montre ou décris à quelqu’un un détail que tu viens de remarquer, sans commentaire.',
    etapes: [
      'Repère un détail de moins de dix centimètres.',
      'Montre-le ou décris-le en une phrase.',
      'Laisse l’autre réagir, ou pas.'
    ],
    variante: 'En solo : photographie mentalement le détail et note-le dans ton carnet.',
    question: 'Le détail a-t-il été remarqué par l’autre ?'
  },
  {
    id: 'partager-message-trois-lignes',
    titre: 'Le message en trois lignes',
    categorie: 'partager',
    duree: 5,
    contextes: ['maison', 'trajet', 'ensemble'],
    materiel: ['rien'],
    consigne: 'Écris un message de trois lignes à quelqu’un que tu connais, puis décide de l’envoyer ou non.',
    etapes: [
      'Choisis une personne que tu n’as pas contactée depuis un moment.',
      'Écris trois lignes : un souvenir, une question, une phrase simple.',
      'Relis, puis envoie ou garde-le.'
    ],
    variante: 'Écris les trois lignes pour toi, dans ton carnet.',
    question: 'Qu’as-tu décidé de faire du message ?'
  },
  {
    id: 'partager-deux-points-de-vue',
    titre: 'Deux points de vue, un objet',
    categorie: 'partager',
    duree: 15,
    contextes: ['ensemble', 'maison', 'bureau', 'dehors'],
    materiel: ['un objet commun'],
    consigne: 'Choisissez un objet commun et décrivez-le chacun de votre côté, puis comparez sans juger.',
    etapes: [
      'Choisissez un objet visible par tous les deux.',
      'Chacun note trois mots et un souvenir lié à cet objet.',
      'Comparez : qu’est-ce qui est commun, qu’est-ce qui diffère ?'
    ],
    variante: 'En solo : décris un objet à deux voix, comme deux personnes différentes.',
    question: 'Quelle différence vous a surpris ?'
  },
  {
    id: 'partager-regard-journee',
    titre: 'Le cadeau du regard',
    categorie: 'partager',
    duree: 15,
    contextes: ['ensemble', 'maison', 'trajet'],
    materiel: ['rien'],
    consigne: 'Choisis un détail de ta journée et raconte-le à quelqu’un en trois phrases.',
    etapes: [
      'Repense à un moment précis depuis le réveil.',
      'Trouve le détail qui le rend mémorable.',
      'Raconte-le en trois phrases, sans expliquer pourquoi c’est beau.'
    ],
    variante: 'En solo : écris les trois phrases dans ton carnet.',
    question: 'Le détail a-t-il gardé sa force en le racontant ?'
  },
  {
    id: 'partager-reportage-croise',
    titre: 'Le petit reportage croisé',
    categorie: 'partager',
    duree: 30,
    contextes: ['ensemble', 'dehors'],
    materiel: ['un stylo', 'une feuille ou deux'],
    consigne: 'Observez cinq minutes le même lieu, chacun de votre côté, puis comparez trois détails.',
    etapes: [
      'Choisissez un lieu où vous pouvez rester cinq minutes.',
      'Notez chacun trois détails sans vous concerter.',
      'Mettez vos listes côte à côte.',
      'Cherchez un détail que personne n’a noté.'
    ],
    variante: 'En solo : note trois détails à deux moments différents de la même journée.',
    question: 'Sur quel détail étiez-vous tous les deux d’accord ?'
  },
  {
    id: 'partager-page-carnet',
    titre: 'La place du carnet',
    categorie: 'partager',
    duree: 30,
    contextes: ['maison', 'ensemble', 'bureau', 'trajet'],
    materiel: ['un stylo', 'une feuille'],
    consigne: 'Écris une page de carnet destinée à être lue par une personne, puis décide si elle la lira.',
    etapes: [
      'Choisis un sujet simple : ce que tu vois de ta fenêtre.',
      'Écris une dizaine de lignes, sans te relire.',
      'Montre-la, envoie-la, ou garde-la pour toi.',
      'Note ce que tu as choisi de faire.'
    ],
    variante: 'Écris trois lignes et lis-les à voix haute.',
    question: 'Qu’as-tu choisi : montrer ou garder ?'
  },
  {
    id: 'bouger-appuis-cinq-minutes',
    titre: 'Le poids d’un appui',
    categorie: 'bouger',
    duree: 5,
    contextes: ['maison', 'bureau', 'dehors', 'trajet', 'ensemble'],
    materiel: ['rien'],
    consigne: 'Tiens debout une minute et laisse ton poids passer lentement d’un pied à l’autre.',
    etapes: [
      'Debout, les pieds écartés de la largeur du bassin, pose l’attention sur tes appuis.',
      'Laisse le poids aller à droite pendant quelques respirations, puis à gauche.',
      'Termine immobile, en sentant les deux pieds également posés.',
      'Note où tu as senti le plus de stabilité.'
    ],
    variante: 'Assis : fais le même transfert avec les mains posées sur les cuisses, puis sur les accoudoirs.',
    question: 'Quel côté portait le plus facilement ton poids ?'
  },
  {
    id: 'bouger-demenagement-minuscule',
    titre: 'Le déménagement minuscule',
    categorie: 'bouger',
    duree: 30,
    contextes: ['maison', 'bureau', 'ensemble'],
    materiel: ['un petit espace à ranger', 'cinq objets'],
    consigne: 'Déplace cinq objets vers un nouvel endroit, un par un, lentement, sans te presser.',
    etapes: [
      'Choisis cinq objets d’une étagère, d’un tiroir ou d’un coin de table.',
      'Porte le premier ailleurs, en le regardant comme si tu le voyais pour la première fois.',
      'Répète pour les quatre autres, en faisant une pause entre chaque.',
      'Regarde la nouvelle disposition et décide de la garder, ou non.'
    ],
    variante: 'Assis : désigne les objets et décris leur nouvel endroit à voix haute, sans les porter.',
    question: 'Quel objet a le plus gagné à changer de place ?'
  }
];
