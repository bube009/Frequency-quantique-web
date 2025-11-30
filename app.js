let audioCtx = null;
let osc = null;
let currentFreq = null;
let stopTimeout = null;

async function loadData() {
  const res = await fetch('frequencies.json');
  return await res.json();
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

function stopSound() {
  if (osc) {
    osc.stop();
    osc.disconnect();
    osc = null;
  }
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
  if (stopTimeout) clearTimeout(stopTimeout);

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
