# 🖥️ Portfolio — Corbiat Florentin

> **Un voyage dans le passé de l'informatique.**
> Portfolio interactif inspiré de Windows 95, avec une scène parallax immersive, un fond carte mère animé, et quelques surprises nostalgiques.

---

```
  ██████╗ ██████╗ ██████╗ ██████╗ ██╗ █████╗ ████████╗
  ██╔════╝██╔═══██╗██╔══██╗██╔══██╗██║██╔══██╗╚══██╔══╝
  ██║     ██║   ██║██████╔╝██████╔╝██║███████║   ██║
  ██║     ██║   ██║██╔══██╗██╔══██╗██║██╔══██║   ██║
  ╚██████╗╚██████╔╝██║  ██║██████╔╝██║██║  ██║   ██║
   ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝╚═╝  ╚═╝   ╚═╝
                  F L O R E N T I N
```

---

## ✨ Fonctionnalités

| 🎨 | Feature |
|----|---------|
| 🖱️ | **Scène parallax** — moniteur, bureau bois, clavier, souris qui suivent le curseur |
| 🖥️ | **Moniteur Windows 95** — fond d'écran flag, clic pour entrer dans le bureau |
| 🔌 | **Fond carte mère animé** — PCB style ASUS PRIME B250M-C avec signaux électriques |
| 😴 | **Chat endormi** — sur le bureau, avec ses Zzz qui s'envolent |
| 📎 | **Clippy** — sort de l'écran au chargement, présente le portfolio |
| 🌍 | **i18n** — switcher de langue intégré |
| 📁 | **Fenêtres Windows 95** — projets, PDF, terminal de contact |
| 📨 | **Formulaire de contact** — via Resend API |

---

## 🛠️ Stack technique

### Frontend

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square&logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff?style=flat-square&logo=vite&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-3.12-88ce02?style=flat-square&logo=greensock&logoColor=white)

```
client/
├── src/
│   ├── components/
│   │   ├── ParallaxMonitorDive.vue   ← Scène d'intro + carte mère
│   │   ├── ClippyHelper.vue          ← Clippy animé
│   │   ├── DesktopOS.vue             ← Bureau Windows 95
│   │   ├── ContactTerminalWindow.vue ← Terminal de contact
│   │   ├── ProjectWindow.vue         ← Fenêtre projets
│   │   └── ...
│   ├── composables/
│   │   ├── useParallax.ts
│   │   ├── useWindowManager.ts
│   │   └── useI18n.ts
│   └── i18n/
│       └── messages.ts
```

### Backend

![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Resend](https://img.shields.io/badge/Resend-Email_API-000000?style=flat-square)

```
server/
├── src/
│   └── index.ts    ← API Express + route contact
├── .env            ← RESEND_API_KEY
└── tsconfig.json
```

---

## 🚀 Lancer le projet

### Prérequis

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation & démarrage

**Terminal 1 — API backend**

```bash
cd server
npm install
npm run dev
```

> Démarre sur `http://localhost:3001`

**Terminal 2 — Frontend Vue**

```bash
cd client
npm install
npm run dev
```

> Démarre sur `http://localhost:5173`

### Variables d'environnement

Créer un fichier `server/.env` :

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
```

---

## 📦 Build production

```bash
# Frontend
cd client && npm run build

# Backend
cd server && npm run build && npm start
```

---

## 🎮 Easter eggs cachés

- 🐱 Caresse le chat sur le bureau (clique dessus !)
- 📎 Clippy sort de l'écran au démarrage
- ⚡ Les signaux électriques sur la carte mère sont générés dynamiquement
- 🕹️ Le bureau est entièrement interactif (fenêtres déplaçables, minimisables)

---

## 📁 Architecture

```
portfollio_cursor/
├── client/          ← Vue 3 + Vite + TypeScript
├── server/          ← Express + TypeScript + Resend
├── README.md
└── CHANGES.md
```

---

## 👤 Auteur

**Corbiat Florentin**

> *"Préparez-vous à une expérience dans le passé de l'informatique."*

---

<div align="center">

Made with ❤️, nostalgie et beaucoup de café ☕

**`C:\> _`**

</div>
