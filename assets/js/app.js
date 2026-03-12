// =======================================================================
// CORE ENGINE - HACKATHON INOVA+ 2026
// =======================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, onValue, update, push, get, child } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// 1. CHAVES DO FIREBASE (⚠️ COLOQUE AS SUAS AQUI ANTES DE TESTAR)
const firebaseConfig = {
    apiKey: "AIzaSyDiTfSu2cv1l90ULrVbn71lFnBlGJXHMas",
    authDomain: "hackathon-inova-2026.firebaseapp.com",
    databaseURL: "https://hackathon-inova-2026-default-rtdb.firebaseio.com",
    projectId: "hackathon-inova-2026",
    storageBucket: "hackathon-inova-2026.firebasestorage.app",
    messagingSenderId: "293248722642",
    appId: "1:293248722642:web:0dea8f80a610b44c4d2f0b"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Exportando banco para o index.html (Cadastro) e área do Monitor
window.InovaDB = { db, ref, set, update, onValue };

// =======================================================================
// 2. SISTEMA DE AUTENTICAÇÃO (LOGIN E SESSÃO)
// =======================================================================
window.AUTH = {
    redirects: {
        'participante': 'area-prova.html',
        'monitor': 'area-monitor.html',
        'adm': 'area-adm.html'
    },
    
    // Função acionada pelo botão de Login
    login: async (role, pw, team) => {
        try {
            if (role === 'adm') {
                if (pw === 'adm123') { // Senha fixa do ADM
                    sessionStorage.setItem('inova_user', JSON.stringify({ role: 'adm' }));
                    return true;
                }
                return false;
            }
            
            if (role === 'monitor') {
                if (pw === 'mon123') { // Senha fixa do Monitor
                    sessionStorage.setItem('inova_user', JSON.stringify({ role: 'monitor' }));
                    return true;
                }
                return false;
            }

            if (role === 'participante') {
                const dbRef = ref(db);
                const snapshot = await get(child(dbRef, `equipes`));
                
                if (snapshot.exists()) {
                    const equipes = snapshot.val();
                    for (let key in equipes) {
                        const eq = equipes[key];
                        // Ignora maiúsculas/minúsculas no nome da equipe para facilitar o login
                        if (eq.nomeEquipe.toLowerCase() === team.toLowerCase() && eq.senha === pw) {
                            sessionStorage.setItem('inova_user', JSON.stringify({ role: 'participante' }));
                            sessionStorage.setItem('inova_equipe', eq.nomeEquipe);
                            sessionStorage.setItem('inova_vertente', eq.vertente);
                            return true;
                        }
                    }
                }
                return false; // Equipe não encontrada ou senha errada
            }
        } catch (error) {
            console.error("Erro no login:", error);
            return false;
        }
    },

    // Trava de Segurança nas páginas da Plataforma
    require: (role) => {
        const userData = sessionStorage.getItem('inova_user');
        if (!userData) {
            window.location.href = 'login.html';
            return;
        }
        const user = JSON.parse(userData);
        if (user.role !== role) {
            window.location.href = 'login.html';
        }
    },

    logout: () => {
        sessionStorage.clear();
        window.location.href = 'login.html';
    }
};

// =======================================================================
// 3. CRONÔMETRO MESTRE (GLOBAL TIMEBOXING)
// =======================================================================
const SPRINT_TIMES = [900, 900, 900, 1800, 900]; // 15m, 15m, 15m, 30m, 15m
let timerState = { sprint: 1, timeLeft: 900, running: false, lastUpdate: Date.now() };
const timerRef = ref(db, 'cronometro_mestre');

// Ouve o Firebase e atualiza o estado localmente
onValue(timerRef, (snapshot) => {
    const data = snapshot.val();
    if (data) timerState = data;
});

window.SprintTimer = {
    sprintTimes: SPRINT_TIMES,
    start: () => {
        timerState.running = true;
        timerState.lastUpdate = Date.now();
        set(timerRef, timerState); // Usamos 'set' para forçar a criação no banco
    },
    pause: () => {
        // Agora ele salva EXATAMENTE o tempo que sobrou
        timerState.timeLeft = window.SprintTimer.getRemaining();
        timerState.running = false;
        set(timerRef, timerState);
    },
    reset: () => {
        timerState.timeLeft = SPRINT_TIMES[timerState.sprint - 1];
        timerState.running = false;
        timerState.lastUpdate = Date.now();
        set(timerRef, timerState);
    },
    nextSprint: () => {
        if (timerState.sprint < 5) {
            timerState.sprint++;
            timerState.timeLeft = SPRINT_TIMES[timerState.sprint - 1];
            timerState.running = false;
            set(timerRef, timerState);
        }
    },
    setSprint: (n) => {
        timerState.sprint = n;
        timerState.timeLeft = SPRINT_TIMES[n - 1];
        timerState.running = false;
        set(timerRef, timerState);
    },
    getState: () => timerState,
    getRemaining: () => {
        if (!timerState.running) return timerState.timeLeft;
        const now = Date.now();
        const diff = Math.floor((now - timerState.lastUpdate) / 1000);
        return Math.max(0, timerState.timeLeft - diff);
    }
};

// Verificador de Fim de Sprint independente
setInterval(() => {
    if (timerState.running) {
        if (window.SprintTimer.getRemaining() <= 0) {
            window.SprintTimer.pause();
            if(window.location.pathname.includes('area-adm')) {
                window.toast("Sprint Finalizado!", "info");
            }
        }
    }
}, 1000);

// =======================================================================
// 4. MURAL DO JOTA E UTILITÁRIOS GERAIS
// =======================================================================
window.Mural = {
    dbRef: ref(db, 'mural_jota'),
    pushFirebase: (reference, data) => push(reference, data)
};

// Se a página atual possuir a função "renderNovoPost" (ex: Telão ou ADM), ela ouve o Firebase
onValue(ref(db, 'mural'), (snapshot) => {
    const data = snapshot.val();
    if (data && typeof window.renderNovoPost === 'function') {
        const keys = Object.keys(data);
        const lastKey = keys[keys.length - 1]; // Pega a última mensagem enviada
        window.renderNovoPost(data[lastKey]);
    }
});

window.fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${String(m).padStart(2, '0')}:${String(rs).padStart(2, '0')}`;
};

// Notificações flutuantes elegantes
window.toast = (msg, type = 'info') => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<strong>${type === 'error' ? 'ERRO' : 'AVISO'}:</strong> ${msg}`;
    container.appendChild(t);
    
    setTimeout(() => { 
        t.style.opacity = '0'; 
        t.style.transform = 'translateX(50px)';
        setTimeout(() => t.remove(), 400); 
    }, 4000);
};

// Relógio Regressivo da Landing Page
window.startCountdown = (targetDateStr, els, onEnd) => {
    const target = new Date(targetDateStr).getTime();
    const interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = target - now;
        
        if (diff <= 0) {
            clearInterval(interval);
            onEnd();
            return;
        }
        
        els.days.textContent = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
        els.hours.textContent = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        els.mins.textContent = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        els.secs.textContent = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
    }, 1000);
};