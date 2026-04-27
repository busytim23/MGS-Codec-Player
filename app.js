let DATA;
const audioMap = {};
let currentMusic = null;

fetch('data.json')
  .then(res => res.json())
  .then(data => {
    DATA = data;
    init();
  });

function init() {
  // 🎧 AUDIO
  [...DATA.sources.music, ...DATA.sources.sounds].forEach(s => {
    const audio = new Audio(s.src);
    audio.volume = s.volume ?? 1;
    audioMap[s.id] = { audio, meta: s };
  });

  // 🎮 STAGES
  const sel = document.getElementById('stageSelect');

  DATA.stages.forEach(st => {
    const opt = document.createElement('option');
    opt.value = st.id;
    opt.textContent = st.label;
    sel.appendChild(opt);
  });

  sel.onchange = () => {
    const st = DATA.stages.find(s => s.id === sel.value);
    if (st) playMusic(st.music);
  };

  // 🔊 SFX
  const grid = document.getElementById('sfxGrid');

  DATA.sfx.forEach(s => {
    const btn = document.createElement('button');
    btn.className = "border border-green-500 p-2 hover:bg-green-500 hover:text-black";
    btn.textContent = s.label;
    btn.onclick = () => playSequence(s.play);
    grid.appendChild(btn);
  });

  // 🚨 BOTONES OVERLAYS (AQUÍ ESTABA EL ERROR)
  buildOverrideButtons();
}

---

# 🚨 OVERRIDE BUTTONS (ARREGLADO)

function buildOverrideButtons() {
  const container = document.createElement('div');
  container.className = "mt-4 flex gap-2";

  const overrides = DATA["stage-overrides"] || [];

  overrides.forEach(o => {
    const btn = document.createElement('button');

    btn.textContent = o.label;
    btn.className =
      "border border-red-500 px-3 py-1 text-red-400 hover:bg-red-500 hover:text-black";

    btn.onclick = () => runOverride(o.id);

    container.appendChild(btn);
  });

  document.body.prepend(container);
}

---

# 🚨 EJECUCIÓN OVERLAY

function runOverride(id) {
  const ov = (DATA["stage-overrides"] || []).find(o => o.id === id);
  if (!ov) return;

  ov.play.forEach(step => {
    setTimeout(() => {
      const obj = audioMap[step.id];
      if (!obj) return;

      const a = obj.audio.cloneNode();
      a.volume = obj.meta.volume ?? 1;
      a.play();
    }, (step.delay ?? 0) * 1000);
  });
}

---

# 🎵 MUSICA

function playMusic(id) {
  stopMusic();

  const obj = audioMap[id];
  if (!obj) return;

  currentMusic = obj.audio;
  obj.audio.currentTime = 0;
  obj.audio.play();

  document.getElementById('nowPlaying').textContent = id;
}

function stopMusic() {
  if (currentMusic) {
    currentMusic.pause();
    currentMusic.currentTime = 0;
  }
}

---

# 🔊 SFX

function playSequence(seq) {
  seq.forEach(step => {
    setTimeout(() => {
      const obj = audioMap[step.id];
      if (!obj) return;

      const a = obj.audio.cloneNode();
      a.volume = obj.meta.volume ?? 1;
      a.play();
    }, (step.delay ?? 0) * 1000);
  });
}
