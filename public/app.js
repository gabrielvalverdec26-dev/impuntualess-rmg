// --- 1. CONFIGURACIÓN DE TUS 72 IMÁGENES PROPIAS Y STICKERS ---
const RARITIES = [
  { id: "comun", label: "Común", reward: 25 },
  { id: "poco-comun", label: "Poco Común", reward: 50 },
  { id: "raro", label: "Raro", reward: 100 },
  { id: "epico", label: "Épico", reward: 200 },
  { id: "legendario", label: "Legendario", reward: 500 },
  { id: "mitico", label: "Mítico", reward: 1000 },
  { id: "secreto", label: "Secreto", reward: 2500 }
];

const ALL_ITEMS = [];
for (let i = 1; i <= 72; i++) {
  let rarityIndex = 0;
  if (i > 35) rarityIndex = 1;
  if (i > 50) rarityIndex = 2;
  if (i > 60) rarityIndex = 3;
  if (i > 67) rarityIndex = 4;
  if (i > 70) rarityIndex = 5;
  if (i === 72) rarityIndex = 6;
  
  ALL_ITEMS.push({
    id: `foto_${i}`,
    name: `Sticker #${i}`,
    rarity: RARITIES[rarityIndex].id,
    label: RARITIES[rarityIndex].label,
    reward: RARITIES[rarityIndex].reward,
    image: `stickers/foto${i}.webp`
  });
}

// --- 2. ESTADO DEL JUEGO ---
let state = {
  username: "",
  coins: 1250,
  pityEpic: 1,
  pityEpicMax: 35,
  pityLeg: 1,
  pityLegMax: 90,
  inventory: {},
  soundEnabled: true,
  musicEnabled: false,
  lastDailyClaim: null
};

let isRolling = false;

function loadProgress() {
  const saved = localStorage.getItem("impuntualess_save");
  if (saved) {
    state = { ...state, ...JSON.parse(saved) };
  }
  
  if (!state.username || state.username === "JugadorInvitado") {
    showWelcomeModal();
  } else {
    updateNameDisplay();
  }

  const nameInput = document.getElementById("input-new-name");
  if (nameInput) nameInput.value = state.username;

  // Actualizar botones de sonido y música al cargar
  const btnToggleSound = document.getElementById("btn-toggle-sound");
  if (btnToggleSound) btnToggleSound.textContent = state.soundEnabled ? "🔊 Sonido: ON" : "🔇 Sonido: OFF";
  
  const btnToggleMusic = document.getElementById("btn-toggle-music");
  if (btnToggleMusic) btnToggleMusic.textContent = state.musicEnabled ? "🎵 Música: ON" : "🎵 Música: OFF";
}

function showWelcomeModal() {
  let modal = document.getElementById("welcome-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "welcome-modal";
    modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;justify-content:center;align-items:center;z-index:9999;";
    modal.innerHTML = `
      <div style="background:#12121c;border:2px solid #00f0ff;padding:30px;border-radius:15px;text-align:center;max-width:350px;width:90%;box-shadow:0 0 25px rgba(0,240,255,0.4);">
        <h2 style="color:#00f0ff;margin-top:0;font-family:sans-serif;">¡BIENVENID@ AL RNG!</h2>
        <p style="color:#ccc;font-size:14px;">Introduce tu nombre de jugador para entrar al ranking:</p>
        <input type="text" id="modal-username-input" placeholder="Tu nombre..." style="width:100%;padding:10px;background:#1a1a2e;border:1px solid #444;color:#fff;border-radius:8px;font-size:16px;box-sizing:border-box;margin-bottom:15px;text-align:center;">
        <button id="modal-save-btn" style="background:#00f0ff;color:#000;border:none;padding:10px 20px;font-weight:bold;border-radius:8px;cursor:pointer;width:100%;font-size:15px;">¡Empezar a Jugar!</button>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("modal-save-btn").addEventListener("click", () => {
      const val = document.getElementById("modal-username-input").value.trim();
      if (val !== "") {
        state.username = val;
        saveProgress();
        updateNameDisplay();
        modal.remove();
      } else {
        alert("Por favor, escribe un nombre válido.");
      }
    });
  }
}

function updateNameDisplay() {
  const el = document.getElementById("username-display");
  if (el) el.textContent = state.username;
}

function saveProgress() {
  localStorage.setItem("impuntualess_save", JSON.stringify(state));
}

function changePlayerName() {
  const input = document.getElementById("input-new-name");
  if (!input) return;
  const newName = input.value.trim();
  
  if (newName !== "") {
    state.username = newName;
    updateNameDisplay();
    saveProgress();
    alert(`¡Nombre actualizado correctamente a "${state.username}"!`);
    if (document.getElementById("tab-ranking") && document.getElementById("tab-ranking").classList.contains("active")) {
      renderRanking();
    }
  } else {
    alert("Por favor, introduce un nombre válido.");
  }
}

// --- 3. MÚSICA MP3 EN BUCLE (ARCHIVO LOCAL) ---
// Aquí cambias "mimusica.mp3" por el nombre exacto de tu canción si es distinto
const bgMusic = new Audio("mimusica.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.4;

function toggleMusic() {
  const btnMusic = document.getElementById("btn-toggle-music");
  
  if (!state.musicEnabled) {
    bgMusic.play().then(() => {
      state.musicEnabled = true;
      if (btnMusic) btnMusic.textContent = "🎵 Música: ON";
      saveProgress();
    }).catch(e => {
      console.log("Reproducción bloqueada:", e);
      alert("El navegador bloqueó el audio. Haz clic en 'Tirar' primero para darle permisos al juego y vuelve a intentarlo.");
    });
  } else {
    bgMusic.pause();
    state.musicEnabled = false;
    if (btnMusic) btnMusic.textContent = "🎵 Música: OFF";
    saveProgress();
  }
}

// --- 4. EFECTOS DE SONIDO ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (!state.soundEnabled) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  if (type === "roll") {
    osc.frequency.setValueAtTime(250, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
  } else if (type === "legendary") {
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(900, audioCtx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  }
}

// --- 5. RENDERIZADO Y LÓGICA DE TIRADA ---
const mainCard = document.getElementById("main-card");
const stickerAvatar = document.getElementById("sticker-avatar");
const stickerRarity = document.getElementById("sticker-rarity");
const stickerName = document.getElementById("sticker-name");
const isNewBadge = document.getElementById("is-new-badge");
const rewardBadge = document.getElementById("reward-badge");
const coinCountEl = document.getElementById("coin-count");

function updateUI() {
  if (coinCountEl) coinCountEl.textContent = state.coins.toLocaleString();
  const epicCurr = document.getElementById("pity-epic-curr");
  const epicBar = document.getElementById("pity-epic-bar");
  const legCurr = document.getElementById("pity-leg-curr");
  const legBar = document.getElementById("pity-leg-bar");

  if (epicCurr) epicCurr.textContent = state.pityEpic;
  if (epicBar) epicBar.style.width = `${(state.pityEpic / state.pityEpicMax) * 100}%`;
  if (legCurr) legCurr.textContent = state.pityLeg;
  if (legBar) legBar.style.width = `${(state.pityLeg / state.pityLegMax) * 100}%`;
  saveProgress();
}

function renderAlbum() {
  const albumGrid = document.getElementById("album-grid");
  if (!albumGrid) return;
  albumGrid.innerHTML = "";

  ALL_ITEMS.forEach(s => {
    const count = state.inventory[s.id] || 0;
    const item = document.createElement("div");
    item.className = `album-item ${count > 0 ? 'unlocked' : 'locked'}`;
    
    let iconContent = '🔒';
    if (count > 0 && s.image) {
      iconContent = `<img src="${s.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%;">`;
    }

    item.innerHTML = `
      <div class="album-icon">${iconContent}</div>
      <div class="album-name">${s.name}</div>
      <div class="album-count">${count > 0 ? `×${count}` : 'Bloqueado'}</div>
    `;
    albumGrid.appendChild(item);
  });
}

function setButtonsState(disabled) {
  const btn1 = document.getElementById("btn-roll-1");
  const btn10 = document.getElementById("btn-roll-10");
  if (btn1) btn1.disabled = disabled;
  if (btn10) btn10.disabled = disabled;
}

function performRoll() {
  if (isRolling) return;
  isRolling = true;
  setButtonsState(true);

  state.pityEpic++;
  state.pityLeg++;
  if (state.pityEpic > state.pityEpicMax) state.pityEpic = 1;
  if (state.pityLeg > state.pityLegMax) state.pityLeg = 1;

  const randomItem = ALL_ITEMS[Math.floor(Math.random() * ALL_ITEMS.length)];
  const isNew = !state.inventory[randomItem.id];
  
  state.inventory[randomItem.id] = (state.inventory[randomItem.id] || 0) + 1;

  let animDuration = 400;
  if (isNewBadge) isNewBadge.style.display = "none";
  if (rewardBadge) rewardBadge.style.display = "none";

  if (!isNew) {
    state.coins += randomItem.reward;
    if (rewardBadge) {
      rewardBadge.textContent = `+${randomItem.reward} 🪙`;
      rewardBadge.style.display = "block";
    }
  } else {
    if (isNewBadge) isNewBadge.style.display = "block";
  }

  // FOTO GRANDE (140px) EN LAS TIRADAS
  if (randomItem.image) {
    stickerAvatar.innerHTML = `<img src="${randomItem.image}" style="width: 140px; height: 140px; object-fit: cover; border-radius: 12px; box-shadow: 0 0 15px rgba(0,240,255,0.4);">`;
  } else {
    stickerAvatar.textContent = "🎮";
  }

  stickerRarity.textContent = randomItem.label;
  stickerName.textContent = randomItem.name;
  
  if (mainCard) {
    mainCard.className = `cyber-card rarity-${randomItem.rarity}`;

    if (["legendario", "mitico", "secreto"].includes(randomItem.rarity)) {
      playSound("legendary");
      mainCard.classList.add("anim-legendary-entrance");
      animDuration = 1500;
    } else {
      playSound("roll");
      mainCard.classList.add("card-roll-anim");
      animDuration = 400;
    }
  }

  setTimeout(() => {
    if (mainCard) {
      mainCard.classList.remove("anim-legendary-entrance");
      mainCard.classList.remove("card-roll-anim");
    }
    isRolling = false;
    setButtonsState(false);
  }, animDuration);

  updateUI();
}

// --- 6. EVENTOS Y BOTONES ---
const btnRoll1 = document.getElementById("btn-roll-1");
if (btnRoll1) {
  btnRoll1.addEventListener("click", () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    performRoll();
  });
}

const btnRoll10 = document.getElementById("btn-roll-10");
if (btnRoll10) {
  btnRoll10.addEventListener("click", () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (state.coins >= 500) {
      state.coins -= 500;
      performRoll();
    } else {
      alert("¡No tienes suficientes monedas!");
    }
  });
}

const btnSaveName = document.getElementById("btn-save-name");
if (btnSaveName) btnSaveName.addEventListener("click", changePlayerName);

const btnDaily = document.getElementById("btn-daily-claim");
if (btnDaily) {
  btnDaily.addEventListener("click", () => {
    const today = new Date().toDateString();
    if (state.lastDailyClaim !== today) {
      state.coins += 200;
      state.lastDailyClaim = today;
      alert("¡Recompensa diaria reclamada! +200 monedas.");
      updateUI();
    } else {
      alert("Ya reclamaste tu recompensa de hoy.");
    }
  });
}

function renderRanking() {
  const leaderboardList = document.getElementById("leaderboard-list");
  if (!leaderboardList) return;
  
  const uniqueUnlocked = Object.keys(state.inventory).length;
  const totalDuplicates = Object.values(state.inventory).reduce((a, b) => a + b, 0) - uniqueUnlocked;
  
  const players = [
    { name: `${state.username || "Jugador"} (Tú)`, score: uniqueUnlocked, duplicates: totalDuplicates }
  ];

  leaderboardList.innerHTML = "";
  players.forEach((p, index) => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    li.style.padding = "8px 0";
    li.innerHTML = `
      <span>#${index + 1} ${p.name}</span> 
      <div style="text-align:right;">
        <strong style="color:#00f0ff; font-size:16px;">${p.score}/72</strong>
        <div style="font-size:11px; color:#aaa;">Repetidos: +${p.duplicates}</div>
      </div>
    `;
    leaderboardList.appendChild(li);
  });
}

document.querySelectorAll(".nav-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    if (isRolling) return;
    document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    tab.classList.add("active");
    
    const targetTab = document.getElementById(`tab-${tab.dataset.tab}`);
    if (targetTab) targetTab.classList.add("active");

    if (tab.dataset.tab === "album") renderAlbum();
    if (tab.dataset.tab === "ranking") renderRanking();
  });
});

const btnToggleSound = document.getElementById("btn-toggle-sound");
if (btnToggleSound) {
  btnToggleSound.addEventListener("click", () => {
    state.soundEnabled = !state.soundEnabled;
    btnToggleSound.textContent = state.soundEnabled ? "🔊 Sonido: ON" : "🔇 Sonido: OFF";
    saveProgress();
  });
}

const btnToggleMusic = document.getElementById("btn-toggle-music");
if (btnToggleMusic) btnToggleMusic.addEventListener("click", toggleMusic);

// FONDO DE PARTÍCULAS
const canvas = document.getElementById("bg-particles");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1;
      this.speedY = -(Math.random() * 0.5 + 0.2);
      this.opacity = Math.random() * 0.5 + 0.2;
      this.color = Math.random() > 0.5 ? "#c77dff" : "#00f0ff";
    }
    update() {
      this.y += this.speedY;
      if (this.y < 0) {
        this.y = canvas.height;
        this.x = Math.random() * canvas.width;
      }
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < 30; i++) particles.push(new Particle());

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

loadProgress();
updateUI();