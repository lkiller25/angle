/* ANGLE — moteur d'analyse préservé + couche cinématique indépendante. */
"use strict";
(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const home = $("#home");
  const workspace = $("#workspace");
  const warning = $("#storage-warning");
  // Conserver ces clés et les identifiants des questions : compatibilité V1.
  const KEYS = { history: "angle.v1.history", draft: "angle.v1.draft" };
  const UNKNOWN = "Je ne sais plus.";
  const OUTCOMES = { won: "Fight gagné", lost: "Fight perdu", other: "Autre issue / échange interrompu" };
  const MODES = { zero: "Sans construction", build: "Avec construction" };
  const TEAMS = { solo: "Solo", duo: "Duo", trio: "Trio", squad: "Section" };
  const STAGES = ["Revenir au choix", "Préciser les informations", "Comparer les options", "Tirer ta conclusion"];

  // Aucun sens de question ni condition d'analyse n'a été remplacé par un effet visuel.
  const QUESTIONS = [
    { id: "goal", stage: 0, type: "choice",
      label: "Quel était ton objectif prioritaire sur cette partie ?",
      help: "L’objectif réel au moment du choix, pas celui que tu aimerais avoir eu.",
      options: [["top1", "Maximiser mes chances de Top 1"], ["points", "Chercher une élimination pour ma progression en ranked"], ["both", "Les deux, sans priorité clairement définie"], ["other", "Un autre objectif"], ["unknown", "Je ne sais plus"]] },
    { id: "motive", stage: 0, type: "choice",
      label: "Quelle était ta principale raison d’engager ?",
      help: "Choisis la raison principale. Tu pourras nuancer ensuite.",
      options: [["position", "Obtenir ou sécuriser une position"], ["resources", "Récupérer des ressources ou de l’équipement"], ["threat", "Écarter une menace"], ["elimination", "Rechercher une élimination"], ["reaction", "Réagir à une opportunité ou à une impulsion"], ["other", "Autre raison / je ne sais plus"]] },
    { id: "nearby", stage: 0, type: "choice",
      label: "Avant d’engager, qu’avais-tu observé sur les autres joueurs autour ?",
      help: "L’absence d’indice après vérification n’est pas la même chose qu’une absence de vérification.",
      options: [["signs", "J’avais des indices de présence"], ["checked", "J’avais vérifié, sans repérer d’indice"], ["unchecked", "Je n’avais pas vérifié"], ["unknown", "Je ne sais plus"]] },
    { id: "zone", stage: 0, type: "choice",
      label: "Quelle contrainte de zone connaissais-tu à cet instant ?",
      options: [["comfortable", "J’avais du temps et une position jouable"], ["urgent", "Je devais bientôt me déplacer"], ["moving", "J’étais déjà en déplacement"], ["unknown", "Je ne sais plus"]] },
    { id: "priority", stage: 1, type: "text",
      label: "Si tes deux objectifs entraient en conflit, lequel voulais-tu privilégier ?",
      when: (a) => a.goal === "both", help: "Tu peux aussi reconnaître que tu n’avais pas fait ce choix." },
    { id: "otherGoal", stage: 1, type: "text", label: "Quel autre objectif poursuivais-tu ?", when: (a) => a.goal === "other" },
    { id: "benefit", stage: 1, type: "text",
      label: "Qu’espérais-tu obtenir concrètement grâce à cet engagement ?",
      help: "Décris le bénéfice attendu avant de connaître le résultat." },
    { id: "alternative", stage: 1, type: "choice",
      label: "Voyais-tu une autre façon de poursuivre ton objectif sans engager maintenant ?",
      help: "Une alternative disponible n’est pas automatiquement une meilleure alternative.",
      options: [["yes", "Oui, j’avais une autre option"], ["no", "Je n’en voyais pas à cet instant"], ["unknown", "Je ne sais plus"]] },
    { id: "evidence", stage: 1, type: "text",
      label: "Quels indices de présence connaissais-tu avant d’agir ?",
      when: (a) => a.nearby === "signs", help: "Ne rajoute pas une information découverte seulement après le combat." },
    { id: "uncertainty", stage: 1, type: "text",
      label: "Qu’est-ce qui restait incertain sur les autres joueurs autour de toi ?",
      when: (a) => a.nearby !== "signs", help: "Ne pas avoir repéré quelqu’un ne prouve pas son absence." },
    { id: "compare", stage: 2, type: "text",
      label: "Compare ton engagement à l’autre option : bénéfices, risques et coûts des deux côtés.",
      when: (a) => a.alternative === "yes", help: "Évite de comparer une version idéale de l’alternative à la pire issue du combat." },
    { id: "notFight", stage: 2, type: "text",
      label: "Qu’aurais-tu risqué ou abandonné en n’engageant pas à cet instant ?",
      when: (a) => a.alternative !== "yes", help: "Ne pas combattre peut aussi avoir un coût. Tu peux manquer d’informations." },
    { id: "positionGain", stage: 2, type: "text",
      label: "Qu’est-ce que la position recherchée ajoutait à ta position actuelle ?",
      when: (a) => a.motive === "position", help: "Distingue ce que tu espérais obtenir de ce que tu as effectivement obtenu." },
    { id: "zoneTrade", stage: 2, type: "text",
      label: "Comment l’engagement s’articulait-il avec ton déplacement vers la zone ?",
      when: (a) => a.zone === "urgent" || a.zone === "moving", help: "Il pouvait aider le déplacement, le retarder, ou avoir un effet incertain." },
    { id: "changeMind", stage: 2, type: "text",
      label: "Quelle information aurait pu te faire changer d’avis avant d’engager ?",
      help: "Une condition observable, pas seulement « si j’avais su que j’allais perdre »." },
    { id: "judgment", stage: 3, type: "choice",
      label: "Avec les informations disponibles avant le combat, comment qualifies-tu ton choix ?",
      help: "ANGLE ne sélectionne aucune conclusion à ta place.",
      options: [["defensible", "Une décision défendable"], ["review", "Une décision que je souhaite revoir"], ["uncertain", "Je n’ai pas assez d’informations pour conclure"]] },
    { id: "reason", stage: 3, type: "text",
      label: "Quel élément de ton raisonnement soutient cette conclusion ?",
      help: "Si le résultat avait été inverse, garderais-tu cette justification ? Explique." },
    { id: "signal", stage: 3, type: "text",
      label: "Quel signal concret veux-tu vérifier avant un prochain engagement ?",
      help: "Facultatif. Tu peux aussi choisir de ne rien changer pour l’instant.", optional: true }
  ];
  const byId = new Map(QUESTIONS.map((q) => [q.id, q]));
  let storageOK = true, toastTimer, current = null, records = [], draft = null;
  let effects = null, viewFrame = 0;

  function node(tag, className = "", text = "") {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== "") element.textContent = text;
    return element;
  }
  function button(text, className, action) {
    const element = node("button", `button ${className}`, text);
    element.type = "button";
    element.addEventListener("click", action);
    return element;
  }
  function toast(message) {
    const element = $("#toast");
    element.textContent = message;
    element.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { element.hidden = true; }, 6500);
  }
  function storageFailure(message = "") {
    storageOK = false;
    warning.hidden = false;
    warning.textContent = message || "Stockage indisponible ou données illisibles : tes changements restent uniquement dans cet onglet. Exporte tes données avant de le fermer. Les anciennes données illisibles ne sont pas remplacées.";
    updateCounters();
  }
  function activeQuestions(answers) { return QUESTIONS.filter((q) => !q.when || q.when(answers)); }
  function cleanAnswers(answers) {
    const cleaned = {};
    for (const q of QUESTIONS) {
      const value = answers[q.id];
      if (typeof value !== "string") continue;
      if (q.type === "choice") {
        if (q.options.some(([key]) => key === value)) cleaned[q.id] = value;
      } else cleaned[q.id] = value.slice(0, 4000);
    }
    for (const q of QUESTIONS) if (q.when && !q.when(cleaned)) delete cleaned[q.id];
    return cleaned;
  }
  function validRecord(record) {
    return record && typeof record === "object" && record.version === 1 &&
      typeof record.id === "string" && typeof record.createdAt === "string" &&
      Number.isFinite(Date.parse(record.createdAt)) && typeof record.story === "string" &&
      typeof record.title === "string" && record.setup && typeof record.setup === "object" &&
      ["single", "group"].includes(record.setup.format) &&
      Object.prototype.hasOwnProperty.call(OUTCOMES, record.setup.outcome) &&
      Object.prototype.hasOwnProperty.call(MODES, record.setup.mode) &&
      Object.prototype.hasOwnProperty.call(TEAMS, record.setup.team) &&
      record.answers && typeof record.answers === "object" && !Array.isArray(record.answers);
  }
  function normalizeRecord(record) {
    return {
      version: 1, id: record.id.slice(0, 120), createdAt: record.createdAt,
      title: record.title.slice(0, 80), story: record.story.slice(0, 6000),
      setup: { format: record.setup.format, outcome: record.setup.outcome, mode: record.setup.mode, team: record.setup.team },
      answers: cleanAnswers(record.answers),
      step: ["setup", "story", "questions", "summary"].includes(record.step) ? record.step : "setup",
      cursor: Number.isInteger(record.cursor) && record.cursor >= 0 ? record.cursor : 0
    };
  }
  function readStorage(key, fallback, validate) {
    // Une clé corrompue ne doit pas empêcher la lecture d'une autre clé valide.
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const value = JSON.parse(raw);
      if (!validate(value)) throw new Error("Format de stockage invalide");
      return value;
    } catch { storageFailure(); return fallback; }
  }
  function writeStorage(key, value) {
    if (!storageOK) return false;
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch { storageFailure(); return false; }
  }
  function updateCounters() {
    $("#history-count").textContent = String(records.length);
    $("#resume-button").hidden = !draft;
    const status = $("#draft-status");
    if (status) status.textContent = storageOK ? "Brouillon enregistré dans ce navigateur." : "Brouillon en mémoire dans cet onglet uniquement.";
  }
  function structuredCopy(value) { return JSON.parse(JSON.stringify(value)); }
  function saveDraft() {
    if (!current) return;
    draft = structuredCopy(current);
    writeStorage(KEYS.draft, draft);
    updateCounters();
  }
  function focusView(heading) {
    cancelAnimationFrame(viewFrame);
    viewFrame = requestAnimationFrame(() => {
      if (!heading.isConnected) return;
      heading.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
      effects?.enterWorkspace(workspace);
    });
  }
  function showBase(title, eyebrow, description, wide = false) {
    home.hidden = true;
    workspace.hidden = false;
    workspace.className = `workspace${wide ? " wide" : ""}`;
    workspace.replaceChildren();
    effects?.setHome(false);
    const kicker = node("div", "kicker");
    kicker.append(node("span", "", eyebrow), node("span", "", "ANGLE / V1"));
    const heading = node("h1", "", title);
    heading.tabIndex = -1;
    workspace.append(kicker, heading);
    if (description) workspace.append(node("p", "intro", description));
    $$("[data-nav]").forEach((link) => link.removeAttribute("aria-current"));
    if (eyebrow === "MÉMOIRE LOCALE") $('[data-nav="history"]').setAttribute("aria-current", "page");
    focusView(heading);
  }
  function showHome() {
    cancelAnimationFrame(viewFrame);
    home.hidden = false;
    workspace.hidden = true;
    $$("[data-nav]").forEach((link) => link.removeAttribute("aria-current"));
    $('[data-nav="home"]').setAttribute("aria-current", "page");
    updateCounters();
    $("#hero-title").focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
    effects?.setHome(true);
  }
  function addDraftStatus() {
    const status = node("p", "save-state"); status.id = "draft-status";
    workspace.append(status); updateCounters();
  }
  function makeNotice(text) { return node("p", "notice", text); }
  function makeError(form) {
    const error = node("p", "form-error"); error.setAttribute("role", "alert"); error.hidden = true;
    form.append(error); return error;
  }
  function clearError(form, error) {
    error.hidden = true;
    $$(".invalid-field", form).forEach((element) => element.classList.remove("invalid-field"));
    $$("[aria-invalid]", form).forEach((element) => element.removeAttribute("aria-invalid"));
  }
  function fail(error, message, target) {
    error.textContent = message; error.hidden = false;
    if (target) {
      target.setAttribute("aria-invalid", "true");
      target.closest(".field")?.classList.add("invalid-field");
      target.focus();
    }
  }
  function choiceField(id, label, options, value, onChange, help = "") {
    const field = node("fieldset", "field"); field.id = `field-${id}`;
    field.append(node("legend", "", label));
    if (help) {
      const description = node("p", "field-help", help); description.id = `help-${id}`;
      field.append(description); field.setAttribute("aria-describedby", description.id);
    }
    const choices = node("div", "choices");
    for (const [key, text] of options) {
      const wrapper = node("label", `choice${value === key ? " selected" : ""}`);
      const input = document.createElement("input");
      input.type = "radio"; input.name = id; input.value = key; input.checked = value === key;
      input.addEventListener("change", () => {
        $$(".choice", choices).forEach((item) => item.classList.remove("selected"));
        wrapper.classList.add("selected");
        field.classList.remove("invalid-field");
        $$("[aria-invalid]", field).forEach((item) => item.removeAttribute("aria-invalid"));
        onChange(key);
        effects?.select(wrapper);
      });
      wrapper.append(input, node("span", "", text)); choices.append(wrapper);
    }
    field.append(choices); return field;
  }
  function textField(id, label, value, onChange, options = {}) {
    const field = node("div", "field");
    const labelNode = node("label", "", label); labelNode.htmlFor = id; field.append(labelNode);
    if (options.help) {
      const description = node("p", "field-help", options.help); description.id = `help-${id}`; field.append(description);
    }
    const input = document.createElement(options.short ? "input" : "textarea");
    if (options.short) input.type = "text";
    input.id = id; input.value = value || ""; input.maxLength = options.maxLength || 4000;
    input.placeholder = options.placeholder || "";
    if (options.story) input.className = "story-input";
    if (options.help) input.setAttribute("aria-describedby", `help-${id}`);
    input.addEventListener("input", () => {
      input.removeAttribute("aria-invalid"); field.classList.remove("invalid-field"); onChange(input.value);
    });
    field.append(input);
    if (options.unknown) field.append(button("Je ne sais plus", "ghost small", () => {
      input.value = UNKNOWN; input.removeAttribute("aria-invalid"); field.classList.remove("invalid-field");
      onChange(UNKNOWN); input.focus();
    }));
    return field;
  }
  function selectField(id, label, choices, value, onChange) {
    const field = node("div", "field"); const labelNode = node("label", "", label); labelNode.htmlFor = id;
    const select = document.createElement("select"); select.id = id;
    for (const [key, text] of choices) { const option = node("option", "", text); option.value = key; select.append(option); }
    select.value = value; select.addEventListener("change", () => onChange(select.value));
    field.append(labelNode, select); return field;
  }
  function newAnalysis() {
    if (draft && !window.confirm("Un brouillon existe. Le remplacer par une nouvelle analyse ?")) return;
    current = {
      version: 1, id: `angle-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString(), title: "", story: "",
      setup: { format: "single", outcome: "lost", mode: "zero", team: "solo" },
      answers: {}, step: "setup", cursor: 0
    };
    showSetup();
  }
  function resumeDraft() {
    if (!draft) return;
    current = structuredCopy(draft);
    if (current.step === "story") showStory();
    else if (current.step === "questions") showQuestions(current.cursor);
    else if (current.step === "summary") showSummary(current, false);
    else showSetup();
  }
  function showSetup() {
    current.step = "setup"; saveDraft();
    showBase("Reviens au moment du choix.", "AVANT DE COMMENCER", "Cette première version examine la décision d’engager. Continuer, poursuivre et se retirer ne sont pas encore des parcours séparés.");
    workspace.append(makeNotice("Analyse une victoire comme une défaite : le résultat ne suffit pas à qualifier la décision. ANGLE ne lit ni ton replay ni ton récit avec une IA."));
    const form = node("form", "panel");
    form.append(choiceField("format", "Comment veux-tu avancer ?", [["single", "Une question à la fois — pour te concentrer"], ["group", "Plusieurs questions par écran — pour comparer"]], current.setup.format, (value) => { current.setup.format = value; saveDraft(); }));
    form.append(choiceField("outcome", "Quel fight veux-tu analyser ?", Object.entries(OUTCOMES), current.setup.outcome, (value) => { current.setup.outcome = value; saveDraft(); }, "Ce choix décrit l’issue. Il ne déclenche aucun verdict ni aucune branche de jugement."));
    form.append(selectField("mode", "Mode", Object.entries(MODES), current.setup.mode, (value) => { current.setup.mode = value; saveDraft(); }));
    form.append(selectField("team", "Format d’équipe", Object.entries(TEAMS), current.setup.team, (value) => { current.setup.team = value; saveDraft(); }));
    const actions = node("div", "actions"); actions.append(button("Accueil", "ghost", showHome));
    const next = node("button", "button primary", "Raconter mon fight →"); next.type = "submit";
    actions.append(next); form.append(actions);
    form.addEventListener("submit", (event) => { event.preventDefault(); showStory(); });
    workspace.append(form); addDraftStatus();
  }
  function showStory() {
    current.step = "story"; saveDraft();
    showBase("Pose la scène.", "TON RÉCIT", "Raconte avec tes mots. Les questions suivantes s’adapteront à tes choix structurés, pas à une interprétation automatique de ce texte.");
    const form = node("form", "panel");
    form.append(textField("analysis-title", "Un titre pour retrouver ce fight — facultatif", current.title, (value) => { current.title = value; saveDraft(); }, { short: true, maxLength: 80, placeholder: "Ex. La hauteur en Top 15" }));
    const hints = node("div", "recap-hints");
    ["Où étais-tu ?", "Pourquoi engager ?", "Comment ça s’est terminé ?"].forEach((text) => hints.append(node("span", "chip", text)));
    form.append(hints, textField("story", "Ton combat, juste avant et après la décision d’engager", current.story, (value) => { current.story = value; saveDraft(); }, {
      story: true, maxLength: 6000,
      placeholder: "Position, zone, informations connues, raison de l’engagement, puis résultat…",
      help: "Évite les informations personnelles. Un récit court suffit."
    }));
    const error = makeError(form); const actions = node("div", "actions");
    actions.append(button("← Préparation", "secondary", showSetup));
    const next = node("button", "button primary", "Examiner mon choix →"); next.type = "submit";
    actions.append(next); form.append(actions);
    form.addEventListener("submit", (event) => {
      event.preventDefault(); clearError(form, error);
      if (current.story.trim().length < 15) { fail(error, "Décris brièvement la scène : au moins 15 caractères.", $("#story")); return; }
      showQuestions(0);
    });
    workspace.append(form); addDraftStatus();
  }
  function setAnswer(id, value) { current.answers[id] = value; current.answers = cleanAnswers(current.answers); saveDraft(); }
  function questionCard(q, number) {
    const card = node("article", "panel question-card");
    card.append(node("span", "question-number", `REPÈRE ${String(number).padStart(2, "0")}`));
    if (q.type === "choice") card.append(choiceField(q.id, q.label, q.options, current.answers[q.id], (value) => setAnswer(q.id, value), q.help));
    else card.append(textField(q.id, q.label, current.answers[q.id], (value) => setAnswer(q.id, value), {
      help: q.help, unknown: !q.optional,
      placeholder: q.optional ? "Un signal observable, ou laisse ce champ vide." : "Ton raisonnement, sans chercher la réponse attendue…"
    }));
    return card;
  }
  function validateQuestions(questions, error) {
    for (const q of questions) {
      const value = current.answers[q.id];
      if (!q.optional && (typeof value !== "string" || !value.trim())) {
        const target = q.type === "choice" ? document.querySelector(`input[name="${q.id}"]`) : document.getElementById(q.id);
        fail(error, "Une réponse manque. Tu peux utiliser « Je ne sais plus » si nécessaire.", target); return false;
      }
    }
    return true;
  }
  function showQuestions(cursor = 0) {
    current.step = "questions"; current.answers = cleanAnswers(current.answers);
    const active = activeQuestions(current.answers), grouped = current.setup.format === "group";
    const count = grouped ? STAGES.length : active.length;
    current.cursor = Math.max(0, Math.min(cursor, count - 1)); saveDraft();
    const visible = grouped ? active.filter((q) => q.stage === current.cursor) : [active[current.cursor]];
    const stage = grouped ? current.cursor : visible[0].stage;
    showBase(STAGES[stage], `LE MOMENT D’ENGAGER / ${current.cursor + 1} SUR ${count}`, "Reviens aux informations disponibles avant d’agir. Une incertitude vaut mieux qu’une explication inventée après coup.");
    const progress = document.createElement("progress"); progress.className = "progress";
    progress.max = count; progress.value = current.cursor + 1;
    progress.setAttribute("aria-label", "Avancement dans le parcours, pas un score"); workspace.append(progress);
    const recall = node("details"); recall.append(node("summary", "", "Relire mon récit"), node("p", "quote", current.story)); workspace.append(recall);
    const form = node("form"); visible.forEach((q) => form.append(questionCard(q, active.indexOf(q) + 1)));
    const error = makeError(form), actions = node("div", "actions");
    actions.append(button("← Retour", "secondary", () => { if (current.cursor === 0) showStory(); else showQuestions(current.cursor - 1); }));
    const next = node("button", "button primary", current.cursor === count - 1 ? "Construire ma synthèse →" : "Continuer →");
    next.type = "submit"; actions.append(next); form.append(actions);
    form.addEventListener("submit", (event) => {
      event.preventDefault(); clearError(form, error);
      if (!validateQuestions(visible, error)) return;
      const updatedCount = grouped ? STAGES.length : activeQuestions(current.answers).length;
      if (current.cursor >= updatedCount - 1) showSummary(current, false); else showQuestions(current.cursor + 1);
    });
    workspace.append(form); addDraftStatus();
  }
  function answerLabel(id, value) {
    const q = byId.get(id);
    if (!q || !value) return "Non renseigné";
    return q.type === "choice" ? q.options.find(([key]) => key === value)?.[1] || "Non renseigné" : value;
  }
  function definitionList(entries) {
    const list = node("dl", "answer-list");
    for (const [label, value] of entries) list.append(node("dt", "", label), node("dd", "", value));
    return list;
  }
  function summaryPanel(title, entries, full = false) {
    const panel = node("article", `panel${full ? " full" : ""}`);
    panel.append(node("h2", "", title), definitionList(entries)); return panel;
  }
  function summaryData(record) {
    const answers = cleanAnswers(record.answers), active = activeQuestions(answers);
    const unknown = (q) => {
      const value = answers[q.id];
      return !value || value === "unknown" || value === UNKNOWN || (value === "other" && q.id === "motive");
    };
    return {
      answers,
      established: active.filter((q) => q.stage < 3 && !unknown(q)).map((q) => [q.label, answerLabel(q.id, answers[q.id])]),
      missing: active.filter((q) => !q.optional && unknown(q)).map((q) => q.label)
    };
  }
  function showSummary(record, saved) {
    if (!saved) { current.step = "summary"; saveDraft(); }
    const { answers, established, missing } = summaryData(record);
    showBase(record.title.trim() || "Ton débrief.", saved ? "ANALYSE CONSERVÉE" : "SYNTHÈSE À RELIRE", "Cette fiche reprend tes réponses. Elle ne vérifie pas les faits du match et ne juge pas automatiquement la qualité du combat.", true);
    const meta = node("div", "recap-hints");
    [OUTCOMES[record.setup.outcome], MODES[record.setup.mode], TEAMS[record.setup.team]].forEach((text) => meta.append(node("span", "chip", text)));
    workspace.append(meta);
    const grid = node("div", "summary-grid"), storyPanel = node("article", "panel full"), storyDetails = node("details");
    storyDetails.append(node("summary", "", "Ton récit original"), node("p", "quote", record.story)); storyPanel.append(storyDetails); grid.append(storyPanel);
    grid.append(summaryPanel("Éléments établis dans tes réponses", established.length ? established : [["État", "Aucun élément suffisamment renseigné."]], true));
    const unknownPanel = node("article", "panel"); unknownPanel.append(node("h2", "", "Informations manquantes"));
    const missingList = node("ul", "missing-list");
    if (missing.length) missing.forEach((text) => missingList.append(node("li", "", text)));
    else missingList.append(node("li", "", "Aucun champ requis n’a été laissé inconnu. Cela ne garantit pas que toutes les informations utiles du match sont présentes."));
    unknownPanel.append(missingList); grid.append(unknownPanel);
    const reconsider = node("article", "panel"); reconsider.append(node("h2", "", "Points à reconsidérer"));
    if (answers.judgment === "review") reconsider.append(definitionList([["Point que tu souhaites revoir", answers.reason || "Non précisé"]]));
    else reconsider.append(node("p", "quote", "Aucune erreur n’est déduite automatiquement. Ta conclusion reste celle que tu as choisie, avec les limites des informations rapportées."));
    reconsider.append(definitionList([["Signal que tu souhaites vérifier", answers.signal?.trim() || "Aucun signal ajouté"]])); grid.append(reconsider);
    grid.append(summaryPanel("Ta conclusion, pas celle d’ANGLE", [["Ton appréciation", answerLabel("judgment", answers.judgment)], ["Ta justification", answers.reason || "Non renseignée"]], true));
    workspace.append(grid);
    const actions = node("div", "actions");
    if (!saved) {
      actions.append(button("← Revoir mes réponses", "secondary", () => showQuestions(current.setup.format === "group" ? STAGES.length - 1 : activeQuestions(current.answers).length - 1)));
      const save = button("Conserver cette analyse", "primary", async () => {
        if (!current || save.disabled) return;
        const all = activeQuestions(current.answers);
        const incomplete = all.find((q) => !q.optional && !current.answers[q.id]?.trim());
        if (incomplete) {
          toast("Une réponse requise manque. Reviens au parcours pour la compléter.");
          showQuestions(current.setup.format === "group" ? incomplete.stage : all.indexOf(incomplete)); return;
        }
        // Un frame permet au navigateur d'afficher le vrai état d'enregistrement.
        // Aucun délai artificiel ni fausse analyse par IA.
        save.disabled = true; save.setAttribute("aria-busy", "true");
        const stored = structuredCopy(current);
        await new Promise((resolve) => requestAnimationFrame(resolve));
        stored.answers = cleanAnswers(stored.answers);
        records = [stored, ...records.filter((item) => item.id !== stored.id)];
        const persisted = writeStorage(KEYS.history, records);
        draft = null; current = null; writeStorage(KEYS.draft, null); updateCounters();
        showSummary(stored, true);
        toast(persisted && storageOK ? "Analyse conservée dans ce navigateur." : "Analyse conservée uniquement dans cet onglet. Pense à l’exporter.");
      }); actions.append(save);
    } else {
      actions.append(button("← Historique", "secondary", showHistory), button("Analyser un autre fight ↗", "primary", newAnalysis));
    }
    workspace.append(actions);
    if (!saved) addDraftStatus();
    else workspace.append(node("p", "save-state", storageOK ? "Historique local : pas de synchronisation entre appareils." : "Cette session n’a pas de sauvegarde persistante disponible."));
  }
  function dateLabel(value) { return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
  function recordTitle(record) { return record.title.trim() || `Fight du ${dateLabel(record.createdAt)}`; }
  function exportHistory() {
    const content = JSON.stringify({ application: "ANGLE", version: 1, exportedAt: new Date().toISOString(), analyses: records, brouillon: draft }, null, 2);
    const blob = new Blob([content], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = url; link.download = `angle-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast("Export lancé. Cette V1 n’intègre pas encore de réimportation.");
  }
  function deleteRecord(id) {
    if (!window.confirm("Supprimer définitivement cette analyse de cet historique ?")) return;
    records = records.filter((record) => record.id !== id);
    const persisted = writeStorage(KEYS.history, records); showHistory();
    toast(persisted ? "Analyse supprimée de l’historique local." : "Analyse retirée de cet onglet. Suppression persistante non garantie.");
  }
  function showHistory() {
    showBase("Garde une trace. Pas une note.", "MÉMOIRE LOCALE", "Relis ce que tu savais, ce que tu cherchais et ce que tu as conclu. Aucun score de décision n’est calculé.", true);
    workspace.append(makeNotice("Les analyses sont conservées sur ce navigateur quand le stockage est disponible. Un nettoyage des données peut les supprimer. En navigation privée, elles peuvent disparaître à la fermeture. Aucun thème récurrent n’est diagnostiqué dans cette première version."));
    const toolbar = node("div", "actions"), left = node("div", "actions-group"), right = node("div", "actions-group");
    left.append(button("Nouvelle analyse ↗", "primary", newAnalysis));
    if (draft) left.append(button("Reprendre le brouillon", "secondary", resumeDraft));
    right.append(button("Exporter mes données", "secondary", exportHistory));
    if (records.length) right.append(button("Tout supprimer", "danger", () => {
      if (!window.confirm("Supprimer toutes les analyses de cet historique ? Le brouillon sera conservé.")) return;
      records = []; const persisted = writeStorage(KEYS.history, records); showHistory();
      toast(persisted ? "Historique supprimé." : "Historique retiré de cet onglet. Suppression persistante non garantie.");
    }));
    toolbar.append(left, right); workspace.append(toolbar);
    const list = node("div", "history-list");
    if (!records.length) {
      const empty = node("div", "panel empty-state");
      empty.append(node("h2", "", "Aucune analyse pour l’instant."), node("p", "", "Ton premier débrief commence par une décision, pas par une note.")); list.append(empty);
    }
    for (const record of records) {
      const card = node("article", "panel history-card"), info = node("div"), controls = node("div", "actions-group");
      info.append(node("span", "chip", OUTCOMES[record.setup.outcome]), node("h2", "", recordTitle(record)), node("p", "", `${dateLabel(record.createdAt)} · ${MODES[record.setup.mode]} · ${TEAMS[record.setup.team]}`));
      controls.append(button("Relire", "secondary small", () => showSummary(record, true)), button("Supprimer", "danger small", () => deleteRecord(record.id)));
      card.append(info, controls); list.append(card);
    }
    workspace.append(list); updateCounters();
  }

  // COUCHE VISUELLE : aucun accès aux réponses, aucun calcul de verdict.
  function createEffects() {
    // Ajouter ici uniquement TES ressources autorisées. Chaînes vides = aucun téléchargement.
    // Exemple d'usage après ajout réel d'un fichier : hero: "./ma-video.mp4"
    // Préférer un court MP4/WebM sombre et muet. Le site n'en dépend jamais.
    const VIDEO_SOURCES = { hero: "", passage: "" };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const connection = navigator.connection;
    let paused = false, atHome = !home.hidden, frame = 0;
    let pointer = null;
    const visibleScenes = new Set(), animated = new Set(), splitTargets = [], videoStates = [];
    const toggle = $("#motion-toggle");
    const allowed = () => !paused && !reduced.matches && !document.hidden;
    const descriptions = {
      engage: "Engager : quel bénéfice attendais-tu, pour quel risque et pour quel objectif ?",
      rotate: "Changer de chemin : qu’aurais-tu conservé, gagné ou abandonné en prenant une autre route ?",
      observe: "Observer : quelle information supplémentaire aurait pu modifier ton choix ? Quel coût avait l’attente ?"
    };
    function animate(element, keyframes, options) {
      if (!allowed() || !element.animate) return;
      const animation = element.animate(keyframes, options);
      animated.add(animation);
      animation.onfinish = () => animated.delete(animation);
      animation.oncancel = () => animated.delete(animation);
    }
    function syncMotion() {
      document.body.classList.toggle("effects-paused", !allowed());
      const stopped = paused || reduced.matches;
      toggle.setAttribute("aria-pressed", String(stopped));
      toggle.textContent = reduced.matches ? "Mouvements réduits (système)" : paused ? "Mouvements : en pause" : "Mouvements : actifs";
      toggle.disabled = reduced.matches;
      if (!allowed()) {
        splitTargets.forEach(({ words }) => words.forEach((word) => { word.style.opacity = "1"; }));
        animated.forEach((animation) => animation.cancel()); animated.clear();
        document.documentElement.style.setProperty("--terrain-x", "0px");
        document.documentElement.style.setProperty("--terrain-y", "0px");
        document.documentElement.style.setProperty("--map-rx", "0deg");
        document.documentElement.style.setProperty("--map-ry", "0deg");
      }
      videoStates.forEach(syncVideo);
      schedule();
    }
    function splitHeading(element) {
      // On découpe seulement les nœuds texte, en conservant <br>, <em> et les espaces.
      // Pas de duplication aria-hidden : le vrai texte reste sélectionnable et lisible.
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const texts = [];
      while (walker.nextNode()) texts.push(walker.currentNode);
      const words = [];
      texts.forEach((textNode) => {
        const fragment = document.createDocumentFragment();
        textNode.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) fragment.append(document.createTextNode(part));
          else {
            const mask = node("span", "word-mask"), word = node("span", "reveal-word", part);
            mask.append(word); fragment.append(mask); words.push(word);
          }
        });
        textNode.replaceWith(fragment);
      });
      splitTargets.push({ element, words });
    }
    function reveal(element) {
      const words = $$(".reveal-word", element);
      if (words.length) words.forEach((word, i) => animate(word,
        [{ transform: "translateY(108%)", opacity: .25 }, { transform: "translateY(0)", opacity: 1 }],
        { duration: 850, delay: Math.min(i * 55, 500), easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" }
      ));
      else animate(element, [{ opacity: .3, transform: "translateY(22px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 800, easing: "cubic-bezier(.22,1,.36,1)" });
    }
    function draw() {
      frame = 0;
      if (!atHome || !allowed()) return;
      // Luminosité liée au scroll : seuil bas lisible, aucune saisie bloquée.
      splitTargets.forEach(({ element, words }) => {
        const rect = element.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > innerHeight) return;
        const progress = Math.max(0, Math.min(1, (innerHeight * .94 - rect.top) / (innerHeight * .68)));
        words.forEach((word, i) => {
          const local = Math.max(0, Math.min(1, progress * (words.length + 2) - i));
          word.style.opacity = String(.48 + .52 * local);
        });
      });
      if (pointer && fine.matches) {
        document.documentElement.style.setProperty("--mx", `${pointer.x}px`);
        document.documentElement.style.setProperty("--my", `${pointer.y}px`);
        document.documentElement.style.setProperty("--terrain-x", `${(pointer.x / innerWidth - .5) * 18}px`);
        document.documentElement.style.setProperty("--terrain-y", `${(pointer.y / innerHeight - .5) * 12}px`);
        if (visibleScenes.has($("#champ"))) {
          const rect = $(".map-depth").getBoundingClientRect();
          const x = Math.max(-.5, Math.min(.5, (pointer.x - rect.left) / rect.width - .5));
          const y = Math.max(-.5, Math.min(.5, (pointer.y - rect.top) / rect.height - .5));
          document.documentElement.style.setProperty("--map-rx", `${-y * 3}deg`);
          document.documentElement.style.setProperty("--map-ry", `${x * 4}deg`);
        }
      }
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
    function stopVideo(state) {
      state.video.pause(); state.video.classList.remove("is-ready");
    }
    function syncVideo(state) {
      const canPlay = atHome && allowed() && state.inView && !state.failed && !connection?.saveData;
      if (!canPlay || !state.url) { stopVideo(state); return; }
      if (state.pending) return;
      if (!state.loaded) {
        state.loaded = true;
        try {
          const parsed = new URL(state.url, document.baseURI);
          if (!["http:", "https:", "file:"].includes(parsed.protocol)) throw new Error("Protocole vidéo non pris en charge");
          state.video.src = parsed.href;
          state.video.load();
          state.timer = setTimeout(() => {
            if (state.video.readyState < 2) { state.failed = true; stopVideo(state); }
          }, 9000);
        } catch { state.failed = true; stopVideo(state); return; }
      }
      state.pending = true;
      const promise = state.video.play();
      if (promise?.then) promise.then(() => {
        state.pending = false;
        if (!(atHome && allowed() && state.inView)) stopVideo(state);
      }).catch(() => { state.pending = false; state.failed = true; stopVideo(state); });
      else state.pending = false;
    }
    function initVideos() {
      for (const [id, url] of Object.entries(VIDEO_SOURCES)) {
        const video = $(`#${id}-video`);
        const state = { video, url: url.trim(), loaded: false, pending: false, failed: false, inView: false, timer: 0 };
        video.muted = true;
        video.addEventListener("playing", () => {
          clearTimeout(state.timer);
          if (atHome && allowed() && state.inView && !state.failed) video.classList.add("is-ready");
          else stopVideo(state);
        });
        video.addEventListener("error", () => { clearTimeout(state.timer); state.failed = true; stopVideo(state); });
        videoStates.push(state);
      }
      if (!("IntersectionObserver" in window)) return;
      const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
        const state = videoStates.find((item) => item.video === entry.target);
        state.inView = entry.isIntersecting; syncVideo(state);
      }), { threshold: .05 });
      videoStates.forEach((state) => observer.observe(state.video));
    }
    function init() {
      $$("[data-split]").forEach(splitHeading);
      toggle.hidden = false;
      toggle.addEventListener("click", () => { paused = !paused; syncMotion(); });
      if ("IntersectionObserver" in window) {
        const reveals = new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target); observer.unobserve(entry.target);
        }), { threshold: .12 });
        $$("[data-split], [data-reveal]").forEach((element) => reveals.observe(element));
        const scenes = new IntersectionObserver((entries) => entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting && atHome);
          if (entry.isIntersecting) visibleScenes.add(entry.target); else visibleScenes.delete(entry.target);
        }), { threshold: 0 });
        $$(".scene").forEach((element) => scenes.observe(element));
      }
      $$("[data-route]").forEach((control) => {
        control.disabled = false;
        control.addEventListener("click", () => {
          const route = control.dataset.route;
          $$("[data-route]").forEach((other) => {
            const selected = other === control;
            other.classList.toggle("is-active", selected); other.setAttribute("aria-pressed", String(selected));
          });
          $$("[data-map-route]").forEach((element) => element.classList.toggle("is-active", element.dataset.mapRoute === route));
          $("#route-description").textContent = descriptions[route];
          animate($("#route-description"), [{ opacity: .4, transform: "translateY(5px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 300 });
        });
      });
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule, { passive: true });
      document.addEventListener("pointermove", (event) => {
        if (!atHome || !allowed() || !fine.matches) return;
        pointer = { x: event.clientX, y: event.clientY }; schedule();
      }, { passive: true });
      document.documentElement.addEventListener("pointerleave", () => { pointer = null; });
      document.addEventListener("visibilitychange", syncMotion);
      if (reduced.addEventListener) reduced.addEventListener("change", syncMotion);
      else reduced.addListener(syncMotion);
      connection?.addEventListener?.("change", syncMotion);
      initVideos(); syncMotion();
    }
    return {
      init,
      setHome(value) {
        atHome = value;
        $$(".scene").forEach((scene) => scene.classList.toggle("is-visible", value && visibleScenes.has(scene)));
        if (!value) {
          animated.forEach((animation) => animation.cancel()); animated.clear();
        }
        videoStates.forEach(syncVideo); schedule();
      },
      enterWorkspace(root) {
        // Ni temporisation de navigation ni overlay bloquant : le formulaire existe déjà.
        Array.from(root.children).slice(0, 8).forEach((element, i) => {
          animate(element, [{ opacity: .35, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }],
            { duration: 380, delay: i * 22, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" });
        });
      },
      select(element) { animate(element, [{ transform: "translateX(0)" }, { transform: "translateX(3px)" }, { transform: "translateX(0)" }], { duration: 240 }); }
    };
  }

  function initialize() {
    try { const probe = "angle.v1.storage-test"; localStorage.setItem(probe, "1"); localStorage.removeItem(probe); }
    catch { storageFailure(); }
    records = readStorage(KEYS.history, [], (value) => Array.isArray(value) && value.every(validRecord)).map(normalizeRecord);
    const rawDraft = readStorage(KEYS.draft, null, (value) => value === null || validRecord(value));
    draft = rawDraft ? normalizeRecord(rawDraft) : null;
    $$("#start-button, [data-start]").forEach((control) => { control.disabled = false; control.addEventListener("click", newAnalysis); });
    $("#resume-button").addEventListener("click", resumeDraft);
    $$('a[href="#accueil"]').forEach((link) => link.addEventListener("click", (event) => { event.preventDefault(); showHome(); }));
    $('[data-nav="history"]').addEventListener("click", (event) => { event.preventDefault(); showHistory(); });
    // Ne plus recharger brutalement un formulaire quand un autre onglet écrit.
    window.addEventListener("storage", (event) => {
      if (![KEYS.history, KEYS.draft, null].includes(event.key)) return;
      storageFailure("Les données ont changé dans un autre onglet. Pour éviter un écrasement, les écritures sont suspendues ici. Exporte ton travail puis recharge cette page pour retrouver les données du navigateur.");
    });
    updateCounters();
    try { effects = createEffects(); effects.init(); }
    catch (error) { console.warn("ANGLE : effets visuels désactivés, parcours conservé.", error); effects = null; }
    if (window.location.hash === "#historique") showHistory();
  }
  initialize();
})();
