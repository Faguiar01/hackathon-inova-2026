// ==========================================
// HACKATHON INOVA+ 2026 - CORE SCRIPT (FIREBASE)
// ==========================================

// ===== AUTH (Login) =====
window.AUTH = {
  passwords: { monitor: 'monitor2026', adm: 'adm2026' },
  redirects: { participante: '../plataforma/area-prova.html', monitor: '../plataforma/area-monitor.html', adm: '../plataforma/area-adm.html' },
  
  async login(role, password, equipeNome = '') {
    if (role === 'monitor' || role === 'adm') {
      if (this.passwords[role] === password) {
        sessionStorage.setItem('inova_role', role);
        sessionStorage.setItem('inova_auth', '1');
        return true;
      }
      return false;
    } 
    
    if (role === 'participante') {
      if (!window.InovaDB) {
        window.toast("Conectando ao servidor, tente novamente em 1 segundo.", "warning");
        return false;
      }
      try {
        const teamKey = equipeNome.trim().toLowerCase().replace(/\s+/g, '_');
        const dbRef = window.InovaDB.ref(window.InovaDB.db);
        const snapshot = await window.InovaDB.get(window.InovaDB.child(dbRef, `equipes/${teamKey}`));
        
        if (snapshot.exists()) {
          const dadosEquipe = snapshot.val();
          if (dadosEquipe.senha === password) {
            sessionStorage.setItem('inova_role', role);
            sessionStorage.setItem('inova_auth', '1');
            sessionStorage.setItem('inova_equipe', dadosEquipe.nomeEquipe);
            sessionStorage.setItem('inova_vertente', dadosEquipe.vertente);
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error("Erro no login:", error);
        return false;
      }
    }
    return false;
  },
  logout() { sessionStorage.clear(); window.location.href = '../plataforma/login.html'; },
  require(role) {
    const auth = sessionStorage.getItem('inova_auth');
    const currentRole = sessionStorage.getItem('inova_role');
    if (!auth) { window.location.href = '../plataforma/login.html'; return false; }
    if (role && currentRole !== role) { window.location.href = '../plataforma/login.html'; return false; }
    return true;
  },
  getRole() { return sessionStorage.getItem('inova_role'); }
};

// ===== TOAST =====
window.toast = function(msg, type = 'info', duration = 5000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), duration);
};

// ===== MODAL BLINDADO =====
window.showModalAlert = function(title, text) {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed'; overlay.style.top = '0'; overlay.style.left = '0'; overlay.style.width = '100vw'; overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)'; overlay.style.backdropFilter = 'blur(4px)'; overlay.style.zIndex = '999999';
  overlay.style.display = 'flex'; overlay.style.alignItems = 'center'; overlay.style.justifyContent = 'center'; overlay.style.padding = '20px'; overlay.style.boxSizing = 'border-box';

  const modal = document.createElement('div');
  modal.style.backgroundColor = '#080c12'; modal.style.border = '1px solid rgba(213,0,249,0.4)'; modal.style.borderTop = '4px solid #d500f9'; 
  modal.style.borderRadius = '8px'; modal.style.padding = '32px 24px'; modal.style.maxWidth = '450px'; modal.style.width = '100%';
  modal.style.boxShadow = '0 15px 50px rgba(0,0,0,0.9), 0 0 30px rgba(213,0,249,0.15)'; modal.style.position = 'relative'; modal.style.textAlign = 'center'; modal.style.animation = 'fadeScale 0.3s ease';

  if (!document.getElementById('modal-anim')) {
    const style = document.createElement('style'); style.id = 'modal-anim';
    style.textContent = '@keyframes fadeScale { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }';
    document.head.appendChild(style);
  }
  
  modal.innerHTML = `
    <button class="modal-x" title="Fechar" style="position:absolute; top:12px; right:16px; background:none; border:none; color:#7a9bb5; font-size:1.8rem; cursor:pointer; line-height:1;">&times;</button>
    <div style="font-family:'Space Mono', monospace; font-size:0.75rem; color:#d500f9; letter-spacing:2px; margin-bottom:12px;">// AVISO GERAL DA COORDENAÇÃO</div>
    <h3 style="color:#fff; font-size:1.5rem; font-family:'Bebas Neue', sans-serif; letter-spacing:1px; margin-bottom:16px;">${title}</h3>
    <p style="font-size:1.05rem; line-height:1.6; color:#c8d8e8; margin-bottom: 28px; font-family:'Syne', sans-serif;">${text}</p>
    <button class="btn-close-modal" style="background:#d500f9; color:#fff; border:none; padding:14px 32px; font-family:'Bebas Neue', sans-serif; font-size:1.2rem; letter-spacing:1px; border-radius:4px; cursor:pointer; width:100%; transition:all 0.2s;">ENTENDIDO!</button>
  `;

  const closeFunc = () => { overlay.style.opacity = '0'; overlay.style.transition = 'opacity 0.2s ease'; setTimeout(() => overlay.remove(), 200); };
  modal.querySelector('.modal-x').addEventListener('click', closeFunc);
  modal.querySelector('.btn-close-modal').addEventListener('click', closeFunc);
  overlay.appendChild(modal); document.body.appendChild(overlay);
};

// ===== SPRINT TIMER (Individual por Sprint) =====
window.SprintTimer = {
  // Sprints: 1=15m, 2=15m, 3=15m, 4=30m, 5=15m (Em segundos)
  sprintTimes: [900, 900, 900, 1800, 900], 
  state: { sprint: 1, running: false, startedAt: null, remaining: 900 },
  dbRef: null,
  setFirebase: null,

  getState() { return this.state; },

  setState(s) {
    this.state = s;
    if (window.AUTH.getRole() === 'adm' && this.setFirebase && this.dbRef) {
      this.setFirebase(this.dbRef, s);
    }
  },
  start() {
    const s = this.getState();
    s.running = true; s.startedAt = Date.now();
    this.setState(s);
  },
  pause() {
    const s = this.getState();
    if (s.running && s.startedAt) {
      const elapsed = Math.floor((Date.now() - s.startedAt) / 1000);
      s.remaining = Math.max(0, s.remaining - elapsed);
    }
    s.running = false; s.startedAt = null;
    this.setState(s);
  },
  reset() {
    const s = this.getState();
    // Zera o tempo para o máximo DO SPRINT ATUAL
    s.remaining = this.sprintTimes[s.sprint - 1];
    s.running = false; s.startedAt = null;
    this.setState(s);
  },
  nextSprint() {
    const s = this.getState();
    if (s.sprint < 5) {
      s.sprint++;
      s.remaining = this.sprintTimes[s.sprint - 1]; // Puxa o tempo específico do novo sprint
      s.running = false; // Começa pausado para o admin dar as instruções
      s.startedAt = null;
      this.setState(s);
    }
  },
  setSprint(num) {
    const s = this.getState();
    s.sprint = num;
    s.remaining = this.sprintTimes[num - 1]; // Puxa o tempo específico
    s.running = false; s.startedAt = null;
    this.setState(s);
  },
  getRemaining() {
    const s = this.getState();
    if (!s.running || !s.startedAt) return s.remaining;
    const elapsed = Math.floor((Date.now() - s.startedAt) / 1000);
    return Math.max(0, s.remaining - elapsed);
  }
};

// ===== CONEXÃO FIREBASE =====
import("https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js").then(({ initializeApp }) => {
  import("https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js").then(({ getDatabase, ref, onValue, set, get, child, push, onChildAdded }) => {

    const firebaseConfig = {
      apiKey: "AIzaSyDiTfSu2cv1l9OUlRvbn71lFnBlGJXHMas",
      authDomain: "hackathon-inova-2026.firebaseapp.com",
      projectId: "hackathon-inova-2026",
      storageBucket: "hackathon-inova-2026.firebasestorage.app",
      messagingSenderId: "293248722642",
      appId: "1:293248722642:web:0dea8f80a610b44c4d2f0b"
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    window.InovaDB = { db, ref, set, get, child };

    const timerRef = ref(db, 'cronometro_mestre');
    window.SprintTimer.dbRef = timerRef;
    window.SprintTimer.setFirebase = set;

    onValue(timerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) window.SprintTimer.state = data;
    });

    const muralRef = ref(db, 'mural_jota');
    window.Mural = { dbRef: muralRef, pushFirebase: push };

    let isInitialLoad = true;
    onChildAdded(muralRef, (snapshot) => {
      const msg = snapshot.val();
      if (msg) {
        const role = window.AUTH.getRole();
        if (typeof window.renderNovoPost === 'function') {
          window.renderNovoPost(msg);
        }
        if (!isInitialLoad) {
          if (role === 'participante') {
            window.showModalAlert(msg.author, msg.text);
          } else if (role === 'monitor') {
            window.toast(`📢 ${msg.author}: ${msg.text}`, 'info', 6000);
          }
        }
      }
    });

    setTimeout(() => { isInitialLoad = false; }, 2000);
  });
}).catch(err => console.error("Erro ao conectar no Firebase:", err));

// ===== UTILS =====
window.fmtTime = function(secs) {
  const m = Math.floor(Math.max(0, secs) / 60);
  const s = Math.max(0, secs) % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
};