// app.js – Version propre

let allFrequencies = [];
let currentOsc = null;
let currentCardId = null;
let audioCtx = null;

// Sélecteurs de base
const listEl = document.getElementById("frequencyList");
const searchEl = document.getElementById("searchInput");
const categoryEl = document.getElementById("categoryFilter");
const statusEl = document.getElementById("status");

// ----------- Chargement du JSON ----------- //

async function loadFrequencies() {
  try {
    statusEl.textContent = "Chargement des fréquences...";
    const res = await fetch("frequencies.json", { cache: "no-store" });

    if (!res.ok) {
      throw new Error("Impossible de charger frequencies.json");
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Le JSON doit être un tableau [] d'objets.");
    }

    allFrequencies = data;
    statusEl.textContent = `Fréquences chargées : ${allFrequencies.length}`;
    renderList();
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Erreur: " + err.message;
    listEl.innerHTML = "";
  }
}

// ----------- Rendu de la liste ----------- //

function renderList() {
  const q = (searchEl.value || "").toLowerCase().trim();
  const cat = categoryEl.value;

  const filtered = allFrequencies.filter((item) => {
    if (cat !== "all" && item.category !== cat) return false;

    if (!q) return true;

    const haystack = [
      item.name,
      item.category,
      ...(item.keywords || []),
      item.description || "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });

  if (filtered.length === 0) {
    listEl.innerHTML =
      '<p style="opacity:0.8;font-size:0.85rem;">Aucun résultat pour ces critères…</p>';
    return;
  }

  listEl.innerHTML = filtered
    .map(
      (item) => `
      <article class="card ${item.id === currentCardId ? "playing" : ""}" data-id="${
        item.id
      }">
        <div class="card-header">
          <h2 class="card-title">${escapeHtml(item.name)}</h2>
          <span class="card-category">${escapeHtml(item.category || "Autre")}</span>
        </div>
        <div class="card-meta">
          <span>${item.frequency_hz} Hz</span>
          ${
            item.duration_minutes
              ? `<span>${item.duration_minutes} min</span>`
              : ""
          }
        </div>
        ${
          item.description
            ? `<p class="card-description">${escapeHtml(item.description)}</p>`
            : ""
        }
        <div class="card-actions">
          <button class="btn btn-start" data-id="${
            item.id
          }">Démarrer</button>
          <button class="btn secondary btn-stop" data-id="${
            item.id
          }">Arrêter</button>
        </div>
      </article>
    `
    )
    .join("");
}

// ----------- Audio (Web Audio API simple) ----------- //

function ensureAudioContext() {
  if (!audioCtx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) {
      alert("Web Audio non supporté sur ce navigateur.");
      return null;
    }
    audioCtx = new Ctor();
  }
  return audioCtx;
}

function startFrequency(item) {
  const ctx = ensureAudioContext();
  if (!ctx) return;

  stopCurrent(); // stop si un autre joue

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = item.frequency_hz || 440;

  // volume modéré
  gain.gain.value = 0.15;

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();

  currentOsc = osc;
  currentCardId = item.id;
  highlightCurrentCard();
}

function stopCurrent() {
  if (currentOsc) {
    try {
      currentOsc.stop();
    } catch (e) {
      console.warn("Osc déjà stoppé:", e);
    }
    currentOsc.disconnect();
    currentOsc = null;
    currentCardId = null;
    highlightCurrentCard();
  }
}

function highlightCurrentCard() {
  document
    .querySelectorAll(".card")
    .forEach((el) => el.classList.remove("playing"));

  if (!currentCardId) return;

  const el = document.querySelector(`.card[data-id="${currentCardId}"]`);
  if (el) el.classList.add("playing");
}

// ----------- Utilitaire ----------- //

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ----------- Événements UI ----------- //

// Recherche & filtre
searchEl.addEventListener("input", () => {
  renderList();
});

categoryEl.addEventListener("change", () => {
  renderList();
});

// Délégation des clics Start/Stop
listEl.addEventListener("click", (event) => {
  const startBtn = event.target.closest(".btn-start");
  const stopBtn = event.target.closest(".btn-stop");

  if (startBtn) {
    const id = startBtn.dataset.id;
    const item = allFrequencies.find((f) => f.id === id);
    if (item) {
      startFrequency(item);
    }
  } else if (stopBtn) {
    const id = stopBtn.dataset.id;
    if (id === currentCardId) {
      // on arrête seulement si c'est la fréquence en cours
      stopCurrent();
    }
  }
});

// ----------- Init ----------- //

loadFrequencies();
