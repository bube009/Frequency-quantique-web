let audioCtx = null;
let currentOscillator = null;
let currentItem = null;
let remainingSec = 0;
let timerInterval = null;
let currentOscillator = null;
let audioCtx = null; 
// Charge les données depuis frequencies.json
async function loadData() {
  const res = await fetch("frequencies.json");
  return await res.json();
}

function renderList(data) {
  const list = document.getElementById("list");
  list.innerHTML = "";

  data.forEach((item) => {
    const li = document.createElement("li");
    li.className = "freq-item";

    li.innerHTML = `
      <div class="freq-main">
        <div>
          <div class="freq-name">${item.name}</div>
          <div class="freq-meta">${item.category} — ${item.frequencyHz} Hz</div>
        </div>
        <button class="freq-btn" type="button">Voir</button>
      </div>
    `;

    li.querySelector("button").addEventListener("click", () => showDetail(item));
    list.appendChild(li);
  });
}

function showDetail(item) {
  currentItem = item;

  const detail = document.getElementById("detail");
  const name = document.getElementById("detail-name");
  const cat = document.getElementById("detail-category");
  const freq = document.getElementById("detail-frequency");
  const dur = document.getElementById("detail-duration");
  const notes = document.getElementById("detail-notes");

  name.textContent = item.name;
  cat.textContent = item.category;
  freq.textContent = `${item.frequencyHz} Hz`;

  if (item.durationSec && item.durationSec > 0) {
    const min = Math.round(item.durationSec / 60);
    dur.textContent = `Durée recommandée : ${min} min`;
  } else {
    dur.textContent = `Durée libre (pas de minuterie).`;
  }

  notes.textContent = item.notes || "";

  detail.classList.remove("hidden");
  updateNowPlaying(); // rafraîchit le panneau du bas
}

// Démarre la fréquence de l'item courant
function startSession() {
  if (!currentItem) return;
  startFrequency(currentItem);
}

// Arrête proprement la fréquence en cours
function stopFrequency(resetBg = true) {
  if (currentOscillator) {
    try {
      currentOscillator.stop();
    } catch (e) {}
    currentOscillator.disconnect();
    currentOscillator = null;
  }

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  if (resetBg) {
    document.body.classList.remove("angel-mode");
  }

  remainingSec = 0;
  updateNowPlaying();
}

// Lance une nouvelle fréquence et arrête automatiquement l’ancienne
function startFrequency(item) {
  // Arrêt automatique de tout ce qui joue déjà
  stopFrequency(false);

  // Pas de fréquence définie → on affiche juste un message
  if (!item.frequencyHz || item.frequencyHz <= 0) {
    updateNowPlaying(
      `Aucune fréquence définie pour "${item.name}" — complète-la dans ton grimoire.`
    );
    return;
  }

  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
  }

  const osc = audioCtx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = item.frequencyHz;
  osc.connect(audioCtx.destination);
  osc.start();

  currentOscillator = osc;
  currentItem = item;

  // Mode "ange" = fond spécial
  if (item.category === "Ange guérisseur") {
    document.body.classList.add("angel-mode");
  } else {
    document.body.classList.remove("angel-mode");
  }

  // Minuterie
  remainingSec = item.durationSec && item.durationSec > 0 ? item.durationSec : 0;

  if (timerInterval) clearInterval(timerInterval);

  if (remainingSec > 0) {
    timerInterval = setInterval(() => {
      remainingSec--;
      if (remainingSec <= 0) {
        stopFrequency();
      } else {
        updateNowPlaying();
      }
    }, 1000);
  }

  updateNowPlaying();
}

// Met à jour le panneau de lecture en bas
function updateNowPlaying(message) {
  const panel = document.getElementById("now-playing");
  const title = document.getElementById("np-title");
  const info = document.getElementById("np-info");
  const timer = document.getElementById("np-timer");

  if (message) {
    title.textContent = message;
    info.textContent = "";
    timer.textContent = "";
    return;
  }

  if (!currentItem || !currentOscillator) {
    title.textContent = "Aucune fréquence en cours";
    info.textContent = "";
    timer.textContent = "";
    return;
  }

  title.textContent = `${currentItem.name} — ${currentItem.frequencyHz} Hz`;
  info.textContent = `${currentItem.category}${
    currentItem.group ? " • " + currentItem.group : ""
  }`;

  if (remainingSec > 0) {
    const min = Math.floor(remainingSec / 60);
    const sec = remainingSec % 60;
    timer.textContent = `Temps restant : ${min} min ${String(sec).padStart(2, "0")} s`;
  } else {
    timer.textContent = "Mode libre (aucune minuterie).";
  }
}

// Initialisation
document.addEventListener("DOMContentLoaded", async () => {
  const data = await loadData();
  renderList(data);

  const search = document.getElementById("search");
  search.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    const filtered = data.filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.group && item.group.toLowerCase().includes(q))
      );
    });
    renderList(filtered);
  });

  document.getElementById("play-btn").addEventListener("click", startSession);
});
