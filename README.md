# Hackathon Inova+ 2026 — Plataforma Completa

## Estrutura
```
hackathon-inova-2026/
├── index.html                 ← Landing Page Pública
├── assets/
│   ├── css/base.css           ← Estilos globais
│   └── js/app.js              ← Auth, timer, utilitários
├── plataforma/
│   ├── login.html             ← Login (3 perfis)
│   ├── area-prova.html        ← Área do Participante
│   ├── area-monitor.html      ← Área do Monitor
│   └── area-adm.html          ← Centro de Comando
└── README.md
```

## Senhas
| Perfil | Senha |
|---|---|
| Participante | `inova2026` |
| Monitor | `monitor2026` |
| Coordenação (ADM) | `adm2026` |

Altere em: `assets/js/app.js` → `AUTH.passwords`

## Como rodar localmente
1. Abra no VS Code → instale extensão **Live Server**
2. Clique em **Go Live** no rodapé

## GitHub Pages
```bash
git init && git add . && git commit -m "inova+ 2026"
git remote add origin https://github.com/SEU-USUARIO/hackathon-inova-2026.git
git push -u origin main
```
Settings → Pages → Deploy from branch: main

## Cores
- Cyan `#00e5ff` = Participante
- Amber `#ffb300` = Monitor  
- Purple `#d500f9` = ADM
