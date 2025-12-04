// toutes les fréquences chargées depuis le JSON
let allFrequencies = []; // ou le nom que tu utilises déjà
let audioCtx = null;
let currentOsc = null;

function startTone(freqHz) {
  // on arrête la précédente
  stopTone();

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freqHz, audioCtx.currentTime);
  osc.connect(audioCtx.destination);
  osc.start();

  currentOsc = osc;
}

function stopTone() {
  if (currentOsc) {
    try {
      currentOsc.stop();
    } catch (e) {}
    currentOsc.disconnect();
    currentOsc = null;
  }
}

// gestion globale des clics sur les boutons
document.addEventListener("click", (e) => {
  const startBtn = e.target.closest(".btn-start");
  const stopBtn  = e.target.closest(".btn-stop");

  if (startBtn) {
    const id = startBtn.dataset.id;

    // 🔥 on cherche la bonne entrée dans le JSON
    const item = allFrequencies.find((f) => f.id === id);
    if (!item) return;

    // et on joue SA fréquence
    startTone(item.frequency);
  }

  if (stopBtn) {
    stopTone();
  }
});
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
