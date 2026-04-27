let DATA = null;
const audioMap = {};
let currentMusic = null;

let currentStage = null;
let currentOverride = null;

document.addEventListener("DOMContentLoaded", () => {
  fetch("data.json")
    .then(r => r.json())
    .then(d => {
      DATA = d;
      init();
    })
    .catch(err => console.error("JSON ERROR", err));
});

function init() {
  const sel = document.getElementById("stageSelect");

  // AUDIO LOAD
  const all = [
    ...DATA.sources.music,
    ...DATA.sources.sounds
  ];

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
    currentStage = sel.value;

    const st = DATA.stages.find(x => x.id === currentStage);
    if (st) playMusic(st.music);

    renderOverrides();
    renderSFX();
  };

  currentStage = sel.value = DATA.stages[0].id;

  renderOverrides();
  renderSFX();

  const st = DATA.stages[0];
  playMusic(st.music);
}

function playMusic(id) {
  if (currentMusic) {
    currentMusic.pause();
    currentMusic.currentTime = 0;
  }

  const a = audioMap[id];
  if (!a) return;

  currentMusic = a;
  a.loop = true;
  a.play();
}

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

function runOverride(id) {
  const ov = DATA["stage-overrides"].find(o => o.id === id);
  if (!ov) return;

  currentOverride = id;

  playSequence(ov.play);
  renderSFX();
}

function renderOverrides() {
  const bar = document.getElementById("overrideBar");
  bar.innerHTML = "";

  const list = DATA["stage-overrides"];

  const alertBtn = document.createElement("button");
  alertBtn.textContent = "🚨 ALERT";
  alertBtn.className = "border border-red-500 px-2";
  alertBtn.onclick = () => runOverride("override-alert");
  bar.appendChild(alertBtn);

  list.forEach(o => {
    const b = document.createElement("button");
    b.textContent = o.label;
    b.className = "border border-green-500 px-2";
    b.onclick = () => runOverride(o.id);
    bar.appendChild(b);
  });
}

function renderSFX() {
  const grid = document.getElementById("sfxGrid");
  grid.innerHTML = "";

  DATA.sfx.forEach(s => {
    // filtro básico por override
    if (s.show_if?.override) {
      const ok = s.show_if.override.in?.includes(currentOverride) ||
                  s.show_if.override.not_in?.includes(currentOverride) === false;

      if (!ok && currentOverride) return;
    }

    const btn = document.createElement("button");
    btn.textContent = s.label;

    btn.onclick = () => playSequence(s.play);
    grid.appendChild(btn);
  });
}

function stopAll() {
  Object.values(audioMap).forEach(a => {
    a.pause();
    a.currentTime = 0;
  });
}
