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
  // cargar audios
  [...DATA.sources.music, ...DATA.sources.sounds].forEach(s => {
    const audio = new Audio(s.src);
    audio.volume = s.volume ?? 1;
    audioMap[s.id] = { audio, meta: s };
  });

  // stages
  const sel = document.getElementById('stageSelect');
  DATA.stages.forEach(st => {
    const opt = document.createElement('option');
    opt.value = st.id;
    opt.textContent = st.label;
    sel.appendChild(opt);
  });

  sel.onchange = () => {
    const st = DATA.stages.find(s => s.id === sel.value);
    playMusic(st.music);
  };

  // sfx
  const grid = document.getElementById('sfxGrid');
  DATA.sfx.forEach(s => {
    const btn = document.createElement('button');
    btn.className = "border border-green-500 p-2 hover:bg-green-500 hover:text-black";
    btn.textContent = s.label;
    btn.onclick = () => playSequence(s.play);
    grid.appendChild(btn);
  });
}

function playMusic(id) {
  stopMusic();
  const obj = audioMap[id];
  if (!obj) return;

  currentMusic = obj.audio;
  obj.audio.currentTime = 0;
  obj.audio.play();

  document.getElementById('nowPlaying').textContent = id;

  // loop custom
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

function playSequence(seq) {
  seq.forEach(step => {
    setTimeout(() => {
      const obj = audioMap[step.id];
      if (!obj) return;

      const a = obj.audio.cloneNode();
      a.volume = obj.meta.volume ?? 1;
      a.play();
    }, step.delay * 1000);
  });
}

function stopAll() {
  Object.values(audioMap).forEach(o => {
    o.audio.pause();
    o.audio.currentTime = 0;
  });
}