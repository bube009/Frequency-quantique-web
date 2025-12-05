// ==================== DONNÉES ====================

const FREQUENCIES = [
  { id:"mal_stress_general", name:"Stress – Général", category:"Maladies", type:"MALADIES", frequency:396, duration:15, description:"Exemple de signal pour stress général." },
  { id:"mal_depression_legere", name:"Dépression légère", category:"Maladies", type:"MALADIES", frequency:639, duration:20, description:"Soutien léger de l’humeur." },
  { id:"mal_douleur_chronique", name:"Douleur chronique", category:"Maladies", type:"MALADIES", frequency:285, duration:18, description:"Test pour douleurs persistantes." },
  { id:"mal_migraine_aigue", name:"Migraine aiguë", category:"Maladies", type:"MALADIES", frequency:528, duration:15, description:"Fréquence expérimentale migraine." },
  { id:"mal_insomnie", name:"Insomnie", category:"Maladies", type:"MALADIES", frequency:432, duration:30, description:"Relaxation du sommeil." },
  { id:"mal_anxiete_intense", name:"Anxiété intense", category:"Maladies", type:"MALADIES", frequency:417, duration:20, description:"Fréquence anti-anxiété expérimentale." },
  { id:"mal_fatigue_extreme", name:"Fatigue extrême", category:"Maladies", type:"MALADIES", frequency:444, duration:25, description:"Pour fatigue profonde." },
  { id:"mal_inflammation_chronique", name:"Inflammation chronique", category:"Maladies", type:"MALADIES", frequency:272, duration:22, description:"Inflammation test." },
  { id:"mal_troubles_digestifs", name:"Troubles digestifs", category:"Maladies", type:"MALADIES", frequency:380, duration:18, description:"Inconfort digestif." },
  { id:"mal_recuperation_post_op", name:"Récupération post-opératoire", category:"Maladies", type:"MALADIES", frequency:555, duration:25, description:"Récupération énergétique." },
  { id:"mal_hypertension", name:"Hypertension", category:"Maladies", type:"MALADIES", frequency:462, duration:20, description:"Soutien pression sanguine." },
  { id:"mal_diabete", name:"Diabète", category:"Maladies", type:"MALADIES", frequency:510, duration:24, description:"Équilibre métabolique." },
  { id:"mal_douleurs_articulaires", name:"Douleurs articulaires", category:"Maladies", type:"MALADIES", frequency:294, duration:20, description:"Articulations test." },
  { id:"mal_fibromyalgie", name:"Fibromyalgie", category:"Maladies", type:"MALADIES", frequency:333, duration:28, description:"Soutien énergétique fibromyalgie." },
  { id:"mal_cancer_soutien", name:"Cancer (soutien)", category:"Maladies", type:"MALADIES", frequency:600, duration:30, description:"Fréquence symbolique." },
  { id:"mal_troubles_immunitaires", name:"Troubles immunitaires", category:"Maladies", type:"MALADIES", frequency:488, duration:22, description:"Harmonisation immunitaire." },
  { id:"mal_allergies_saison", name:"Allergies saisonnières", category:"Maladies", type:"MALADIES", frequency:372, duration:18, description:"Allergies test." },
  { id:"mal_troubles_respiratoires", name:"Troubles respiratoires", category:"Maladies", type:"MALADIES", frequency:320, duration:20, description:"Respiration." },
  { id:"mal_addictions", name:"Addictions", category:"Maladies", type:"MALADIES", frequency:540, duration:21, description:"Accompagnement addictions." },
  { id:"mal_burnout", name:"Burn-out", category:"Maladies", type:"MALADIES", frequency:470, duration:26, description:"Fatigue nerveuse." }
];

// ==================== AUDIO ====================

let audioCtx = null;
let osc = null;

async function startTone(freq) {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }

  stopTone();

  osc = audioCtx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  osc.connect(audioCtx.destination);
  osc.start();

  currentWaveFrequency = freq; // pour l’animation eau
}

function stopTone() {
  if (osc) {
    try { osc.stop(); } catch(e){}
    osc.disconnect();
    osc = null;
  }
  currentWaveFrequency = 0;
}

// ==================== UI / FILTRES ====================

const listEl = document.querySelector("#freq-list");
const countEl = document.querySelector("#freq-count");
const searchEl = document.querySelector("#search");
const categoryEl = document.querySelector("#category");

let filtered = FREQUENCIES.slice();
let currentPlaying = null;

function renderList() {
  countEl.textContent = filtered.length;

  if (filtered.length === 0) {
    listEl.innerHTML = "<p style='opacity:0.8;font-size:0.85rem;'>Aucune fréquence trouvée.</p>";
    return;
  }

  listEl.innerHTML = filtered.map(item => `
    <article class="card ${currentPlaying === item.id ? "card--active" : ""}">
      <div class="card-header">
        <h2 class="card-title">${item.name}</h2>
        <span class="card-category">${item.type}</span>
      </div>

      <div class="card-meta">
        <span>${item.frequency} Hz</span>
        <span>${item.duration} min</span>
      </div>

      <p class="card-description">${item.description}</p>

      <div class="card-actions">
        <button class="btn btn-start" data-id="${item.id}">Démarrer</button>
        <button class="btn btn-stop" data-id="${item.id}">Arrêter</button>
      </div>
    </article>
  `).join("");
}

function applyFilters() {
  const q = searchEl.value.trim().toLowerCase();
  const category = categoryEl.value;

  filtered = FREQUENCIES.filter(f => {
    const matchesText =
      f.name.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q);

    const matchesCategory =
      category === "Toutes" || f.category === category;

    return matchesText && matchesCategory;
  });

  renderList();
}

document.addEventListener("click", e => {
  const startBtn = e.target.closest(".btn-start");
  const stopBtn = e.target.closest(".btn-stop");

  if (startBtn) {
    const id = startBtn.dataset.id;
    const item = FREQUENCIES.find(f => f.id === id);
    if (!item) return;

    currentPlaying = id;
    startTone(item.frequency);
    renderList();
  }

  if (stopBtn) {
    stopTone();
    currentPlaying = null;
    renderList();
  }
});

searchEl.addEventListener("input", applyFilters);
categoryEl.addEventListener("change", applyFilters);

// ==================== ANIMATION EAU ====================

const canvas = document.getElementById("water-canvas");
const ctx = canvas ? canvas.getContext("2d") : null;
let currentWaveFrequency = 0; // en Hz
let startTime = null;

function drawWater(timestamp) {
  if (!ctx || !canvas) return;

  if (!startTime) startTime = timestamp;
  const t = (timestamp - startTime) / 1000; // secondes

  const w = canvas.width;
  const h = canvas.height;

  // fond
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#020617");
  grad.addColorStop(1, "#050816");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // si aucune fréquence : juste une légère ondulation
  const freq = currentWaveFrequency || 120; // valeur de base
  const speed = freq / 90;
  const spatial = freq / 90;

  const baseY = h / 2;
  const amplitude = h * 0.22;

  ctx.beginPath();
  for (let x = 0; x <= w; x++) {
    const phase = (x / w) * Math.PI * 2 * spatial + t * speed;
    const y = baseY + Math.sin(phase) * amplitude;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "rgba(80, 180, 255, 0.9)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // reflet en dessous
  ctx.fillStyle = "rgba(80, 180, 255, 0.14)";
  ctx.fillRect(0, baseY, w, h - baseY);

  requestAnimationFrame(drawWater);
}

if (ctx) {
  requestAnimationFrame(drawWater);
}

// ==================== INIT ====================

applyFilters();
