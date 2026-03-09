# 🚀 Plataforma Hackathon Inova+ 2026 | SENAI Joinville

Plataforma *Serverless* e gamificada desenvolvida para orquestrar o maior evento de Indústria 5.0 de Santa Catarina, voltado para jovens aprendizes. O sistema gerencia toda a jornada do evento ("Ponte Digital"), sincronizando tempo, dados e avaliações em tempo real sem a necessidade de recarregamento de página.

## 🛠️ Stack Tecnológico
* **Front-end:** HTML5, CSS3 (Custom Properties, CSS Grid/Flexbox) e Vanilla JavaScript.
* **Back-end/Database:** Firebase Realtime Database (BaaS).
* **Deploy/Hosting:** Vercel (CI/CD via GitHub).
* **UI/UX:** Design System "Dark/Cyberpunk", fontes *Bebas Neue* e *Space Mono*, totalmente responsivo.

## ✨ Core Features (Funcionalidades)

1. **Autenticação Descentralizada & Atrito Zero:** Líderes cadastram o Squad e criam a senha via UI principal. O login injeta credenciais no `SessionStorage`, direcionando a equipe direto para a área de prova.
2. **Cronômetro Mestre (*Global Timeboxing*):** Tempo controlado pelo Painel ADM sincronizado instantaneamente via Firebase para todas as telas (Participantes, Monitores e Telão). Arquitetura de Sprints individuais (15 a 30 minutos).
3. **Comunicação Full-Duplex (Mural do Jota):** O Administrador dispara alertas que ativam um "Modal Blindado" na tela dos participantes e um "Aviso Flash" em neon no Telão do auditório.
4. **Painel do Monitor (Avaliação Realtime):** Monitores acessam checklists metodológicos e lançam notas de *Soft Skills* (Liderança, Comunicação) que são enviadas dinamicamente para o banco de dados.
5. **Dashboard do Telão (Mission Control):** Interface autônoma para projeção no auditório. Consome o status global do evento, barra de progresso dinâmica e letreiro animado com mensagens da coordenação.

## 📂 Arquitetura do Projeto

```text
/
├── index.html                # Landing Page e Inscrição de Squads
├── README.md                 # Documentação
├── /assets
│   ├── /css/base.css         # Variáveis globais e estilos base
│   └── /js/app.js            # Core App (Firebase Config, Timer Engine, Auth)
└── /plataforma
    ├── login.html            # Gateway de Autenticação multiplexado
    ├── area-prova.html       # Dashboard do Participante (Roleta e Missões)
    ├── area-monitor.html     # Painel de Avaliação (Soft Skills e Checklist)
    ├── area-adm.html         # Centro de Comando (Admin, Timer, Engajamento)
    └── telao.html            # UI Autônoma para Projeção no Auditório