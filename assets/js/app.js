// ==========================================
// HACKATHON INOVA+ 2026 - CORE SCRIPT (FIREBASE)
// ==========================================

// ===== AUTH (Login) =====
window.AUTH = {
  passwords: {
    participante: 'inova2026',
    monitor:      'monitor2026',
    adm:          'adm2026'
  },
  redirects: {
    participante: '../plataforma/area-prova.html',
    monitor:      '../plataforma/area-monitor.html',
    adm:          '../plataforma/area-adm.html'
  },
  login(role, password) {
    if (this.passwords[role] === password) {
      sessionStorage.setItem('inova_role', role);
      sessionStorage.setItem('inova_auth', '1');
      return true;
    }
    return false;
  },
  logout() {
    sessionStorage.removeItem('inova_role');
    sessionStorage.removeItem('inova_auth');
    window.location.href = '../plataforma/login.html';
  },
  require(role) {
    const auth = sessionStorage.getItem('inova_auth');
    const currentRole = sessionStorage.getItem('inova_role');
    if (!auth) { window.location.href = '../plataforma/login.html'; return false; }
    if (role && currentRole !== role) { window.location.href = '../plataforma/login.html'; return false; }
    return true;
  },
  getRole() { return sessionStorage.getItem('inova_role'); }
};

// ===== TOAST (Avisos rápidos no canto) =====
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

// ===== MODAL BLINDADO (Alerta Central do Jota) =====
window.showModalAlert = function(title, text) {
  // Cria o fundo escuro que bloqueia a tela
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
  overlay.style.backdropFilter = 'blur(4px)';
  overlay.style.zIndex = '999999';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.padding = '20px';
  overlay.style.boxSizing = 'border-box';

  // Cria a caixa central
  const modal = document.createElement('div');
  modal.style.backgroundColor = '#080c12'; 
  modal.style.border = '1px solid rgba(213,0,249,0.4)';
  modal.style.borderTop = '4px solid #d500f9'; 
  modal.style.borderRadius = '8px';
  modal.style.padding = '32px 24px';
  modal.style.maxWidth = '450px';
  modal.style.width = '100%';
  modal.style.boxShadow = '0 15px 50px rgba(0,0,0,0.9), 0 0 30px rgba(213,0,249,0.15)';
  modal.style.position = 'relative';
  modal.style.textAlign = 'center';
  modal.style.animation = 'fadeScale 0.3s ease';

  // Injeta a animação no navegador
  if (!document.getElementById('modal-anim')) {
    const style = document.createElement('style');
    style.id = 'modal-anim';
    style.textContent = '@keyframes fadeScale { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }';
    document.head.appendChild(style);
  }
  
  modal.innerHTML = `
    <button class="modal-x" title="Fechar" style="position:absolute; top:12px; right:16px; background:none; border:none; color:#7a9bb5; font-size:1.8rem; cursor:pointer; line-height:1;">&times;</button>
    
    <div style="font-family:'Space Mono', monospace; font-size:0.75rem; color:#d500f9; letter-spacing:2px; margin-bottom:12px;">
      // AVISO GERAL DA COORDENAÇÃO
    </div>
    
    <h3 style="color:#fff; font-size:1.5rem; font-family:'Bebas Neue', sans-serif; letter-spacing:1px; margin-bottom:16px;">
      ${title}
    </h3>
    
    <p style="font-size:1.05rem; line-height:1.6; color:#c8d8e8; margin-bottom: 28px; font-family:'Syne', sans-serif;">
      ${text}
    </p>
    
    <button class="btn-close-modal" style="background:#d500f9; color:#fff; border:none; padding:14px 32px; font-family:'Bebas Neue', sans-serif; font-size:1.2rem; letter-spacing:1px; border-radius:4px; cursor:pointer; width:100%; transition:all 0.2s;">
      ENTENDIDO!
    </button>
  `;

  const closeFunc = () => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.2s ease';
    setTimeout(() => overlay.remove(), 200);
  };
  
  modal.querySelector('.modal-x').addEventListener('click', closeFunc);
  modal.querySelector('.btn-close-modal').addEventListener('click', closeFunc);
  
  const btn = modal.querySelector('.btn-close-modal');
  btn.onmouseover = () => { btn.style.filter = 'brightness(1.2)'; btn.style.transform = 'translateY(-2px)'; };
  btn.onmouseout = () => { btn.style.filter = 'brightness(1)'; btn.style.transform = 'translateY(0)'; };

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
};

// ===== COUNTDOWN ENGINE =====
window.startCountdown = function(targetDate, els, onEnd) {
  function tick() {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) { onEnd && onEnd(); return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (els.days)  els.days.textContent  = String(d).padStart(2,'0');
    if (els.hours) els.hours.textContent = String(h).padStart(2,'0');
    if (els.mins)  els.mins.textContent  = String(m).padStart(2,'0');
    if (els.secs)  els.secs.textContent  = String(s).padStart(2,'0');
  }
  tick();
  return setInterval(tick, 1000);
};

// ===== SPRINT TIMER (Sincronizado via Firebase) =====
window.SprintTimer = {
  state: { sprint: 1, running: false, startedAt: null, remaining: 5400 },
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
    s.running = true;
    s.startedAt = Date.now();
    this.setState(s);
  },
  pause() {
    const s = this.getState();
    if (s.running && s.startedAt) {
      const elapsed = Math.floor((Date.now() - s.startedAt) / 1000);
      s.remaining = Math.max(0, s.remaining - elapsed);
    }
    s.running = false;
    s.startedAt = null;
    this.setState(s);
  },
  reset() {
    this.setState({ sprint: 1, running: false, startedAt: null, remaining: 5400 });
  },
  nextSprint() {
    const s = this.getState();
    s.sprint = Math.min(s.sprint + 1, 5);
    s.remaining = 5400;
    s.running = false;
    s.startedAt = null;
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
  import("https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js").then(({ getDatabase, ref, onValue, set, push, onChildAdded }) => {

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

    // --- 1. CRONÔMETRO MESTRE ---
    const timerRef = ref(db, 'cronometro_mestre');
    window.SprintTimer.dbRef = timerRef;
    window.SprintTimer.setFirebase = set;

    onValue(timerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) window.SprintTimer.state = data;
    });

    // --- 2. MURAL DO JOTA ---
    const muralRef = ref(db, 'mural_jota');
    window.Mural = { dbRef: muralRef, pushFirebase: push };

    let isInitialLoad = true;
    onChildAdded(muralRef, (snapshot) => {
      const msg = snapshot.val();
      if (msg) {
        
        const role = window.AUTH.getRole();

        // 1. Atualiza a lista na tela do Admin (silenciosamente)
        if (typeof window.renderNovoPost === 'function') {
          window.renderNovoPost(msg);
        }
        
        // 2. A LÓGICA MESTRA DE EXIBIÇÃO:
        if (!isInitialLoad) {
          if (role === 'participante') {
            // O Participante recebe o Modal bloqueando a tela
            window.showModalAlert(msg.author, msg.text);
          } 
          else if (role === 'monitor') {
            // O Monitor recebe apenas um Toast discreto no canto
            window.toast(`📢 ${msg.author}: ${msg.text}`, 'info', 6000);
          }
        }
      }
    });

    setTimeout(() => { isInitialLoad = false; }, 2000);

  });
}).catch(err => console.error("Erro ao conectar no Firebase:", err));

// ===== TABS & UI =====
window.fmtTime = function(secs) {
  const m = Math.floor(Math.max(0, secs) / 60);
  const s = Math.max(0, secs) % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
};

window.initTabs = function(containerSelector) {
  document.querySelectorAll(`${containerSelector} [data-tab]`).forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.tab;
      document.querySelectorAll(`${containerSelector} [data-tab]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll(`${containerSelector} [data-panel]`).forEach(p => {
        p.style.display = p.dataset.panel === key ? '' : 'none';
      });
    });
  });
  const first = document.querySelector(`${containerSelector} [data-tab]`);
  if (first) first.click();
};

window.initReveal = function(selector = '[data-reveal]') {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll(selector).forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
    obs.observe(el);
  });
  const style = document.createElement('style');
  style.textContent = '[data-reveal].revealed { opacity:1 !important; transform:none !important; }';
  document.head.appendChild(style);
};