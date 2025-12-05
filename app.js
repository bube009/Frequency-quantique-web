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
    startTone(item.frequency);  //  ici on utilise la bonne fréquence
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
    const data = await res.json();

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
