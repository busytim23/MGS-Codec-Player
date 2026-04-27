let DATA;
const audioMap = {};
let currentMusic = null;

// 🔥 cargar JSON externo
fetch('data.json')
  .then(res => res.json())
  .then(data => {
    DATA = data;
    init();
  });

function init() {
  // 🎧 cargar audios
  [...DATA.sources.music, ...DATA.sources.sounds].forEach(s => {
    const audio = new Audio(s.src);
    audio.volume = s.volume ?? 1;
    audio.preload = s.preload ? "auto" : "metadata";
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

  // 🔊 SFX BUTTONS
  const grid = document.getElementById('sfxGrid');

  DATA.sfx.forEach(s => {
    const btn = document.createElement('button');
    btn.className =
      "border border-green-500 p-2 hover:bg-green-500 hover:text-black transition";
    btn.textContent = s.label;
    btn.onclick = () => playSequence(s.play);
    grid.appendChild(btn);
  });

  // 🚨 BOTÓN ALERTA GLOBAL (override)
  const alertBtn = document.createElement('button');
  alertBtn.textContent = "🚨 ALERT";
  alertBtn.className =
    "border border-red-500 px-3 py-1 text-red-400 hover:bg-red-500 hover:text-black ml-2";

  alertBtn.onclick = () => runOverride("override-alert");

  document.querySelector("body").prepend(alertBtn);
}

---

# 🎵 MUSICA (NO SE CORTA CON SFX)

function playMusic(id) {
  stopMusic();

  const obj = audioMap[id];
  if (!obj) return;

  currentMusic = obj.audio;
  obj.audio.currentTime = 0;
  obj.audio.loop = false;
  obj.audio.play();

  document.getElementById('nowPlaying').textContent = id;

  // 🔁 loop avanzado tipo MGS
  if (obj.meta.loop_start !== undefined) {
    obj.audio.ontimeupdate = () => {
      if (obj.audio.currentTime >= obj.meta.loop_end) {
        obj.audio.currentTime = obj.meta.loop_start;
      }
    };
  }
}

function stopMusic() {
  if (currentMusic) {
    currentMusic.pause();
    currentMusic.currentTime = 0;
  }
}

---

# 🔊 SFX (SUPERPOSICIÓN REAL)

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

---

# 🚨 OVERRIDES (SISTEMA TIPO JUEGO)

👉 esto es lo que te da el “modo Metal Gear”

```javascript
function runOverride(id) {
  const ov = DATA["stage-overrides"]?.find(o => o.id === id);
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
