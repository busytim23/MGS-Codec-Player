let DATA = null;
const audioMap = {};
let currentMusic = null;

document.addEventListener("DOMContentLoaded", () => {
  fetch("data.json")
    .then(r => r.json())
    .then(d => {
      DATA = d;
      console.log("DATA OK");
      startApp();
    })
    .catch(e => console.error("JSON ERROR", e));
});

function startApp() {
  const sel = document.getElementById("stageSelect");
  const grid = document.getElementById("sfxGrid");

  if (!sel || !grid) {
    console.error("Faltan elementos HTML");
    return;
  }

  // AUDIO MAP
  const all = [...DATA.sources.music, ...DATA.sources.sounds];

  all.forEach(s => {
    const a = new Audio(s.src);
    a.volume = s.volume ?? 1;
    audioMap[s.id] = a;
  });

  // STAGES
  DATA.stages.forEach(st => {
    const opt = document.createElement("option");
    opt.value = st.id;
    opt.textContent = st.label;
    sel.appendChild(opt);
  });

  sel.onchange = () => {
    const st = DATA.stages.find(x => x.id === sel.value);
    if (st) playMusic(st.music);
  };

  // SFX
  DATA.sfx.forEach(s => {
    const btn = document.createElement("button");
    btn.textContent = s.label;
    btn.onclick = () => playSequence(s.play);
    grid.appendChild(btn);
  });

  buildOverrides();
}

---

function playMusic(id) {
  if (currentMusic) {
    currentMusic.pause();
    currentMusic.currentTime = 0;
  }

  const a = audioMap[id];
  if (!a) return;

  currentMusic = a;
  a.play();
}

---

function playSequence(seq) {
  seq.forEach(x => {
    setTimeout(() => {
      const a = audioMap[x.id];
      if (!a) return;

      const c = a.cloneNode();
      c.play();
    }, (x.delay || 0) * 1000);
  });
}

---

function runOverride(id) {
  const list = DATA["stage-overrides"] || [];
  const ov = list.find(o => o.id === id);
  if (!ov) return;

  ov.play.forEach(x => {
    setTimeout(() => {
      const a = audioMap[x.id];
      if (!a) return;

      const c = a.cloneNode();
      c.play();
    }, (x.delay || 0) * 1000);
  });
}

---

function buildOverrides() {
  const list = DATA["stage-overrides"] || [];

  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.gap = "10px";
  container.style.margin = "10px";

  const alert = document.createElement("button");
  alert.textContent = "🚨 ALERT";
  alert.onclick = () => runOverride("override-alert");
  container.appendChild(alert);

  list.forEach(o => {
    const b = document.createElement("button");
    b.textContent = o.label;
    b.onclick = () => runOverride(o.id);
    container.appendChild(b);
  });

  document.body.prepend(container);
}
