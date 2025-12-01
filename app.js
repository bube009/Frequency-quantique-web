let currentOscillator = null;
let audioCtx = null;

function startFrequency(freq) {
  // Crée le contexte audio s'il n'existe pas
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Arrête automatiquement l'ancienne fréquence
  if (currentOscillator) {
    try {
      currentOscillator.stop();
    } catch (e) {}
  }

  // Crée un nouvel oscillateur
  const osc = audioCtx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = freq;

  // Connecte au haut-parleur
  osc.connect(audioCtx.destination);

  // Démarre
  osc.start();

  // Sauvegarde l'oscillateur actif
  currentOscillator = osc;
}

function renderList(data) {
  const list = document.getElementById('list');
  list.innerHTML = '';

  data.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${item.name}</strong><br>${item.category} — ${item.frequencyHz} Hz`;

    const btn = document.createElement('button');
    btn.textContent = 'Voir';
    btn.onclick = () => showDetail(item);

    li.appendChild(btn);
    list.appendChild(li);
  });
}

function showDetail(item) {
  currentFreq = item;

  document.getElementById('detail-name').textContent = item.name;
  document.getElementById('detail-category').textContent = `Catégorie : ${item.category}`;
  document.getElementById('detail-frequency').textContent = `Fréquence : ${item.frequencyHz} Hz`;
  document.getElementById('detail-duration').textContent = `Durée recommandée : ${item.durationSec} sec`;

  document.getElementById('detail').classList.remove('hidden');
}


  document.getElementById('play-btn').disabled = false;
  document.getElementById('stop-btn').disabled = true;
}

function startSound(freq, duration) {
  stopSound();

  const AC = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AC();
  osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = freq;
  osc.connect(audioCtx.destination);
  osc.start();

  document.getElementById('play-btn').disabled = true;
  document.getElementById('stop-btn').disabled = false;

  if (duration > 0) {
    stopTimeout = setTimeout(stopSound, duration * 1000);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadData();
  renderList(data);

  document.getElementById('play-btn').onclick = () => {
    if (currentFreq) startSound(currentFreq.frequencyHz, currentFreq.durationSec);
  };

  document.getElementById('stop-btn').onclick = stopSound;

  document.getElementById('search').oninput = e => {
    const q = e.target.value.toLowerCase();
    renderList(data.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
    ));
  };
});
