# Smart NDC Pro

Système de gestion intégré (ERP) pour **Nouvelles Ducasses Confiserie Maroc** — couvrant la gestion des employés, des présences, des stocks, de la production et de la paie.

## Architecture

| Couche | Technologie |
|--------|-------------|
| **Frontend Web** | React 19 + TypeScript + Vite + Tailwind CSS 4 + Zustand |
| **Mobile** | React Native + Expo + Expo Router |
| **Backend API** | Node.js + Express + TypeScript |
| **Base de données** | PostgreSQL 15 (Prisma ORM) |
| **Cache** | Redis |
| **File d'attente** | RabbitMQ |
| **Stockage fichiers** | MinIO (S3-compatible) |
| **Realtime** | Socket.io |
| **Reverse Proxy** | Nginx (intégré au conteneur frontend) |
| **Conteneurisation** | Docker Compose (6 services) |

## Services Docker

| Service | Rôle |
|---------|------|
| `postgres` | Base de données principale |
| `backend` | API REST (Express + Prisma) |
| `frontend` | SPA React servie par Nginx |
| `redis` | Cache et sessions |
| `rabbitmq` | Files d'attente asynchrones |
| `minio` | Stockage de fichiers |

## Fonctionnalités

- **Dashboard** — KPIs, graphiques (ApexCharts), cartes vectorielles
- **Gestion des employés** — CRUD, congés, certificats de travail
- **Pointage / Présences** — Horaires, feuilles de temps
- **Gestion des stocks** — Produits, mouvements, alertes de stock
- **Paie** — Fiches de paie, rapports
- **Auth & Rôles** — JWT, 4 rôles (admin, manager, employé, magasinier)
- **Mobile** — Scan code-barres, NFC, appareil photo (Expo Camera)
- **Realtime** — Notifications, mise à jour dashboard (Socket.io)
- **Files d'attente** — Génération PDF, emails, alertes (RabbitMQ)

## Configuration requise

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15 (ou via Docker)

## Installation

```bash
# Cloner le dépôt
git clone <url-du-depot>
cd smart-ndc-pro

# Variables d'environnement (backend)
cp backend/.env.example backend/.env

# Installer les dépendances
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd mobile && npm install && cd ..

# Lancer avec Docker
docker compose up --build
```

Le frontend sera accessible sur `http://localhost:80` et l'API sur `http://localhost:3001`.

### Commandes utiles

```bash
npm run dev:backend    # Backend en mode dev
npm run dev:frontend   # Frontend en mode dev
npm run dev:mobile     # Mobile (Expo)
npm run docker:up      # Tout lancer avec Docker
npm run docker:down    # Arrêter Docker
```

## Structure du projet

```
smart-ndc-pro/
├── backend/           # API Express + Prisma
│   ├── prisma/        # Schéma et migrations
│   └── src/
│       ├── routes/    # Routes REST (auth, employees, products, etc.)
│       ├── services/  # Logique métier (RabbitMQ, MinIO, etc.)
│       ├── socket/    # WebSocket (Socket.io)
│       └── middlewares/# Auth, validation
├── frontend/          # SPA React (TailAdmin)
│   └── src/
│       ├── pages/     # Pages de l'application
│       ├── components/# Composants réutilisables
│       ├── store/     # Zustand stores
│       └── layout/    # Layout principal
├── mobile/            # App React Native / Expo
│   ├── app/           # Pages Expo Router
│   └── services/      # API client, Socket.io client
├── docker/            # Dockerfiles (backend, frontend, nginx)
└── docs/              # Documentation
```

## Aperçu

![Dashboard Web](screenshot-dashboard.png)

![Application Mobile](screenshot-mobile.png)

---

Projet développé dans le cadre du stage **Smart NDC Pro** — Nouvelles Ducasses Confiserie Maroc.
