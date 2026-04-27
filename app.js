let DATA;
const audioMap = {};
let currentMusic = null;

fetch('data.json')
  .then(res => {
    if (!res.ok) throw new Error("No se pudo cargar data.json");
    return res.json();
  })
  .then(data => {
    DATA = data;
    console.log("DATA cargada OK");
    init();
  })
  .catch(err => {
    console.error(err);
    alert("Error cargando data.json");
  });

---

function init() {
  if (!DATA) return;

  // 🎧 CARGA AUDIO
  [...DATA.sources.music, ...DATA.sources.sounds].forEach(s => {
    const audio = new Audio(s.src);
    audio.volume = s.volume ?? 1;
    audioMap[s.id] = { audio, meta: s };
  });

  // 🎮 STAGES
  const sel = document.getElementById('stageSelect');
  const grid = document.getElementById('sfxGrid');

  if (!sel || !grid) {
    console.error("Faltan elementos HTML (stageSelect o sfxGrid)");
    return;
  }

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
  DATA.sfx.forEach(s => {
    const btn = document.createElement('button');
    btn.className =
      "border border-green-500 p-2 hover:bg-green-500 hover:text-black";

    btn.textContent = s.label;
    btn.onclick = () => playSequence(s.play);

    grid.appendChild(btn);
  });

  // 🚨 OVERRIDE BUTTONS + ALERT
  buildOverrideButtons();
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

  const now = document.getElementById('nowPlaying');
  if (now) now.textContent = id;
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

# 🚨 OVERRIDES (ARREGLADO SIN '-' ERROR)

function runOverride(id) {
  const list = DATA["stage-overrides"] || [];
  const ov = list.find(o => o.id === id);
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

# 🧩 BOTONES OVERRIDE + ALERT

function buildOverrideButtons() {
  const list = DATA["stage-overrides"] || [];
  if (!list.length) return;

  const container = document.createElement('div');
  container.style.margin = "10px";
  container.style.display = "flex";
  container.style.gap = "8px";

  list.forEach(o => {
    const btn = document.createElement('button');

    btn.textContent = o.label;
    btn.style.border = "1px solid red";
    btn.style.color = "red";
    btn.style.padding = "5px";

    btn.onclick = () => runOverride(o.id);

    container.appendChild(btn);
  });

  // 🚨 BOTÓN ALERT GLOBAL EXTRA
  const alertBtn = document.createElement('button');
  alertBtn.textContent = "🚨 ALERT";

  alertBtn.style.border = "1px solid red";
  alertBtn.style.color = "red";
  alertBtn.style.padding = "5px";

  alertBtn.onclick = () => runOverride("override-alert");

  container.prepend(alertBtn);

  document.body.prepend(container);
}
