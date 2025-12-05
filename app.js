// ================== Config ==================

const DATA_URL = "frequencies.json"; // adapte si ton JSON est ailleurs

// Sélecteurs DOM (adapte les IDs en fonction de ton HTML)
const listEl = document.querySelector("#frequency-list");
const countEl = document.querySelector("#frequency-count");
const searchEl = document.querySelector("#search-input");
const categoryEl = document.querySelector("#category-select");

// ================== État global ==================

let allFrequencies = [];   // toutes les fréquences du JSON
let filtered = [];         // fréquences après filtre recherche + catégorie
let currentCardId = null;  // id de la carte actuellement en lecture

// ================== Utilitaires ==================

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ================== Audio (Web Audio API simple) ==================

let audioCtx = null;
let currentOsc = null;

function startTone(freqHz) {
  // Stop précédent
  stopTone();

  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }

  const osc = audioCtx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freqHz, audioCtx.currentTime);
  osc.connect(audioCtx.destination);
  osc.start();

  currentOsc = osc;
}

function stopTone() {
  if (currentOsc) {
    try {
      currentOsc.stop();
    } catch (e) {
      // ignore
    }
    currentOsc.disconnect();
    currentOsc = null;
  }
}

// ================== Rendu des cartes ==================

function renderList() {
  if (!listEl || !countEl) return;

  // compteur
  countEl.textContent = filtered.length.toString();

  if (filtered.length === 0) {
    listEl.innerHTML =
      '<p style="opacity:0.8;font-size:0.85rem;">Aucune fréquence trouvée pour ces filtres.</p>';
    return;
  }

  listEl.innerHTML = filtered
    .map((item) => {
      const isActive = item.id === currentCardId;

      return `
<article class="card ${isActive ? "card--active" : ""}" data-id="${item.id}">
  <div class="card-header">
    <h2 class="card-title">${escapeHtml(item.name)}</h2>
    <span class="card-category">${escapeHtml(item.type || item.category || "")}</span>
  </div>

  <div class="card-meta">
    <span>${item.frequency} Hz</span>
    ${
      item.duration
        ? `<span>${item.duration} min</span>`
        : ""
    }
  </div>

  ${
    item.description
      ? `<p class="card-description">${escapeHtml(item.description)}</p>`
      : ""
  }

  <div class="card-actions">
    <button class="btn btn-start" data-id="${item.id}">Démarrer</button>
    <button class="btn btn-stop secondary" data-id="${item.id}">Arrêter</button>
  </div>
</article>
`;
    })
    .join("");
}

// ================== Filtres (recherche + catégorie) ==================

function applyFilters() {
  const q = (searchEl ? searchEl.value : "").trim().toLowerCase();
  const category = categoryEl ? categoryEl.value : "Toutes";

  filtered = allFrequencies.filter((item) => {
    // filtre catégorie
    if (category && category !== "Toutes" && item.category !== category) {
      return false;
    }

    // filtre recherche texte
    if (q) {
      const haystack = (
        (item.name || "") +
        " " +
        (item.description || "") +
        " " +
        (item.category || "") +
        " " +
        (item.type || "")
      ).toLowerCase();

      if (!haystack.includes(q)) {
        return false;
      }
    }

    return true;
  });

  renderList();
}

// ================== Gestion des clics start/stop ==================

document.addEventListener("click", (e) => {
  const startBtn = e.target.closest(".btn-start");
  const stopBtn = e.target.closest(".btn-stop");

  if (startBtn) {
    const id = startBtn.dataset.id;
    const item = allFrequencies.find((f) => f.id === id);
    if (!item) return;

    currentCardId = id;         // pour mettre la carte en "active"
    startTone(item.frequencies);  //  ici on utilise la bonne fréquence
    renderList();               // re-render pour maj état visuel
  }

  if (stopBtn) {
    stopTone();
    currentCardId = null;
    renderList();
  }
});

// ================== Chargement du JSON ==================

async function loadFrequencies() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) {
      throw new Error("Impossible de charger les fréquences");
    }
    const data = await  un frequencie.json();

    // On suppose que data est soit un tableau direct,
    // soit un objet { frequencies: [...] }
    allFrequencies = Array.isArray(data) ? data : data.frequencies || [];

    filtered = allFrequencies.slice();
    renderList();
  } catch (err) {
    console.error(err);
    if (listEl) {
      listEl.innerHTML =
        '<p style="opacity:0.8;font-size:0.85rem;color:#ffb3b3;">Erreur de chargement des fréquences.</p>';
    }
  }
}

// ================== Listeners de filtre ==================

if (searchEl) {
  searchEl.addEventListener("input", () => {
    applyFilters();
  });
}

if (categoryEl) {
  categoryEl.addEventListener("change", () => {
    applyFilters();
  });
}

// ================== Init ==================

loadFrequencies();
// ========= Données fréquences (maladies) =========

const FREQUENCIES = [
  {
    id: "mal_stress_general",
    name: "Stress – Général",
    category: "Maladies",
    type: "MALADIES",
    frequency: 396,
    duration: 15,
    description:
      "Exemple de signal pour le stress général (usage expérimental, sans valeur médicale).",
  },
  {
    id: "mal_depression_legere",
    name: "Dépression légère",
    category: "Maladies",
    type: "MALADIES",
    frequency: 639,
    duration: 20,
    description:
      "Signal test pour soutenir l’humeur (sans preuve médicale, expérimental).",
  },
  {
    id: "mal_douleur_chronique",
    name: "Douleur chronique",
    category: "Maladies",
    type: "MALADIES",
    frequency: 285,
    duration: 18,
    description:
      "Signal de test pour les douleurs persistantes (usage expérimental uniquement).",
  },
  {
    id: "mal_migraine_aigue",
    name: "Migraine aiguë",
    category: "Maladies",
    type: "MALADIES",
    frequency: 528,
    duration: 15,
    description:
      "Exemple de fréquence pour expérimenter sur les migraines (non médical).",
  },
  {
    id: "mal_insomnie",
    name: "Insomnie",
    category: "Maladies",
    type: "MALADIES",
    frequency: 432,
    duration: 30,
    description:
      "Signal relaxant pour troubles du sommeil (test audio, sans valeur thérapeutique prouvée).",
  },
  {
    id: "mal_anxiete_intense",
    name: "Anxiété intense",
    category: "Maladies",
    type: "MALADIES",
    frequency: 417,
    duration: 20,
    description:
      "Fréquence expérimentale pour états anxieux (pas un traitement médical).",
  },
  {
    id: "mal_fatigue_extreme",
    name: "Fatigue extrême",
    category: "Maladies",
    type: "MALADIES",
    frequency: 444,
    duration: 25,
    description:
      "Signal de test pour fatigue prolongée (usage expérimental).",
  },
  {
    id: "mal_inflammation_chronique",
    name: "Inflammation chronique",
    category: "Maladies",
    type: "MALADIES",
    frequency: 272,
    duration: 22,
    description:
      "Exemple de fréquence pour expérimenter sur l’inflammation (non validé médicalement).",
  },
  {
    id: "mal_troubles_digestifs",
    name: "Troubles digestifs",
    category: "Maladies",
    type: "MALADIES",
    frequency: 380,
    duration: 18,
    description:
      "Signal audio de test pour inconfort digestif (sans valeur thérapeutique reconnue).",
  },
  {
    id: "mal_recuperation_post_op",
    name: "Récupération post-opératoire",
    category: "Maladies",
    type: "MALADIES",
    frequency: 555,
    duration: 25,
    description:
      "Exemple de fréquence de soutien après intervention (usage expérimental seulement).",
  },
  {
    id: "mal_hypertension",
    name: "Hypertension (soutien)",
    category: "Maladies",
    type: "MALADIES",
    frequency: 462,
    duration: 20,
    description:
      "Signal de soutien expérimental pour pression artérielle élevée (ne remplace pas un traitement).",
  },
  {
    id: "mal_diabete",
    name: "Diabète (équilibre général)",
    category: "Maladies",
    type: "MALADIES",
    frequency: 510,
    duration: 24,
    description:
      "Fréquence test pour l’équilibre métabolique (aucune preuve médicale).",
  },
  {
    id: "mal_douleurs_articulaires",
    name: "Douleurs articulaires",
    category: "Maladies",
    type: "MALADIES",
    frequency: 294,
    duration: 20,
    description:
      "Signal expérimental pour raideurs et douleurs articulaires.",
  },
  {
    id: "mal_fibromyalgie",
    name: "Fibromyalgie (soutien)",
    category: "Maladies",
    type: "MALADIES",
    frequency: 333,
    duration: 28,
    description:
      "Exemple de fréquence pour douleurs diffuses (usage expérimental).",
  },
  {
    id: "mal_cancer_soutien",
    name: "Cancer (soutien énergétique)",
    category: "Maladies",
    type: "MALADIES",
    frequency: 600,
    duration: 30,
    description:
      "Signal de soutien énergétique symbolique, ne remplace jamais les traitements médicaux.",
  },
  {
    id: "mal_troubles_immunitaires",
    name: "Troubles immunitaires",
    category: "Maladies",
    type: "MALADIES",
    frequency: 488,
    duration: 22,
    description:
      "Fréquence test pour harmoniser le terrain immunitaire (non médical).",
  },
  {
    id: "mal_allergies_saison",
    name: "Allergies saisonnières",
    category: "Maladies",
    type: "MALADIES",
    frequency: 372,
    duration: 18,
    description:
      "Signal expérimental pour inconfort lié aux allergies.",
  },
  {
    id: "mal_troubles_respiratoires",
    name: "Troubles respiratoires",
    category: "Maladies",
    type: "MALADIES",
    frequency: 320,
    duration: 20,
    description:
      "Exemple de fréquence pour soutenir le confort respiratoire (sans valeur médicale prouvée).",
  },
  {
    id: "mal_addictions",
    name: "Addictions (accompagnement)",
    category: "Maladies",
    type: "MALADIES",
    frequency: 540,
    duration: 21,
    description:
      "Signal de soutien expérimental pour processus de libération d’habitudes.",
  },
  {
    id: "mal_burnout",
    name: "Burn-out",
    category: "Maladies",
    type: "MALADIES",
    frequency: 470,
    duration: 26,
    description:
      "Fréquence test pour fatigue nerveuse et mentale (usage expérimental, non médical).",
  },
];

// ========= Utilitaires =========

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ========= Audio =========

let audioCtx = null;
let osc = null;
let gainNode = null;

async function startTone(freqHz) {
  // création / reprise du contexte
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }

  stopTone(); // stop précédent

  osc = audioCtx.createOscillator();
  gainNode = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(freqHz, audioCtx.currentTime);

  gainNode.gain.value = 0.18; // volume doux

  osc.connect(gainNode).connect(audioCtx.destination);
  osc.start();
}

function stopTone() {
  if (osc) {
    try {
      osc.stop();
    } catch (e) {}
    osc.disconnect();
    osc = null;
  }
  if (gainNode) {
    gainNode.disconnect();
    gainNode = null;
  }
}

// ========= UI / Filtres =========

const listEl = document.getElementById("freq-list");
const countEl = document.getElementById("freq-count");
const searchEl = document.getElementById("search");
const categoryEl = document.getElementById("category");

let filtered = FREQUENCIES.slice();
let currentId = null;

function renderList() {
  if (!listEl || !countEl) return;

  countEl.textContent = String(filtered.length);

  if (filtered.length === 0) {
    listEl.innerHTML =
      '<p style="opacity:0.8;font-size:0.85rem;">Aucune fréquence trouvée.</p>';
    return;
  }

  listEl.innerHTML = filtered
    .map((item) => {
      const active = item.id === currentId ? "card--active" : "";
      return `
<article class="card ${active}" data-id="${item.id}">
  <div class="card-header">
    <h2 class="card-title">${escapeHtml(item.name)}</h2>
    <span class="card-category">${escapeHtml(item.type || item.category)}</span>
  </div>
  <div class="card-meta">
    <span>${item.frequency} Hz</span>
    ${item.duration ? `<span>${item.duration} min</span>` : ""}
  </div>
  ${
    item.description
      ? `<p class="card-description">${escapeHtml(item.description)}</p>`
      : ""
  }
  <div class="card-actions">
    <button class="btn btn-start" data-id="${item.id}">Démarrer</button>
    <button class="btn btn-stop" data-id="${item.id}">Arrêter</button>
  </div>
</article>
`;
    })
    .join("");
}

function applyFilters() {
  const q = (searchEl?.value || "").trim().toLowerCase();
  const cat = categoryEl?.value || "Toutes";

  filtered = FREQUENCIES.filter((item) => {
    if (cat !== "Toutes" && item.category !== cat) return false;

    if (q) {
      const haystack = (
        (item.name || "") +
        " " +
        (item.description || "") +
        " " +
        (item.category || "") +
        " " +
        (item.type || "")
      ).toLowerCase();

      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  renderList();
}

// ========= Écouteurs =========

if (searchEl) {
  searchEl.addEventListener("input", applyFilters);
}
if (categoryEl) {
  categoryEl.addEventListener("change", applyFilters);
}

document.addEventListener("click", (e) => {
  const startBtn = e.target.closest(".btn-start");
  const stopBtn = e.target.closest(".btn-stop");

  if (startBtn) {
    const id = startBtn.dataset.id;
    const item = FREQUENCIES.find((f) => f.id === id);
    if (!item) return;

    currentId = id;
    startTone(item.frequency); // 🔥 fréquence propre à la carte
    renderList();
  }

  if (stopBtn) {
    stopTone();
    currentId = null;
    renderList();
  }
});

// ========= Init =========

applyFilters();// ========= Données fréquences (maladies) =========

