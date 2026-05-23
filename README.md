# 🤖 CHATBOT FACTORY

> **Plateforme SaaS de création, configuration et déploiement de chatbots intelligents**  
> Permettez à n'importe quelle entreprise de déployer son propre assistant IA en quelques minutes.

---

## 📋 Table des matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Variables d'environnement](#-variables-denvironnement)
- [Lancement](#-lancement)
- [Structure du projet](#-structure-du-projet)
- [API Reference](#-api-reference)
- [Méthodologie](#-méthodologie)

---

## 🌟 Aperçu

**CHATBOT FACTORY** est une application full-stack multi-tenant qui permet aux entreprises de :

1. **Créer** des chatbots personnalisés selon leur domaine d'activité
2. **Alimenter** la base de connaissances (upload PDF, PPTX, FAQ)
3. **Tester** les chatbots en temps réel avant déploiement
4. **Déployer** via un widget intégrable ou une API

Le moteur de réponse repose sur un pipeline **RAG (Retrieval Augmented Generation)** combinant des embeddings vectoriels locaux et une recherche sémantique dans PostgreSQL via `pgvector`.

---

## ✨ Fonctionnalités

### Pour l'entreprise
- ✅ Inscription / Connexion sécurisée (JWT + bcrypt)
- ✅ Création et gestion de plusieurs chatbots
- ✅ Upload de documents **PDF** et **PPTX** → indexation automatique
- ✅ Ajout de **FAQ** → vectorisation et indexation RAG
- ✅ Interface de **test en temps réel** avec historique de conversation
- ✅ Tableau de bord avec statistiques d'utilisation
- ✅ Paramètres de profil et de configuration

### Pour l'administrateur
- ✅ Vue globale de toutes les entreprises inscrites
- ✅ Validation / suspension des comptes entreprises
- ✅ Supervision des chatbots créés sur la plateforme

### Moteur IA
- ✅ Embeddings locaux **gratuits** (Sentence-Transformers `all-MiniLM-L6-v2`)
- ✅ Recherche vectorielle via **pgvector** (similarité cosinus)
- ✅ Priorité FAQ > Documents dans les réponses
- ✅ Seuil de similarité configurable pour éviter les réponses hors contexte
- ✅ Chunking intelligent avec chevauchement (overlap) pour conserver le contexte

---

## 🛠 Stack technique

| Couche | Technologie | Rôle |
|--------|-------------|------|
| **Frontend** | Next.js 14 (App Router) | Interface utilisateur, SSR, routage |
| **Styling** | Tailwind CSS | Design system, responsive |
| **Backend** | FastAPI (Python) | API REST, logique métier |
| **IA / Embeddings** | Sentence-Transformers | Vectorisation locale, gratuite |
| **Base de données** | PostgreSQL via Supabase | Stockage relationnel + vectoriel |
| **Vecteurs** | pgvector | Recherche sémantique (similarité cosinus) |
| **Auth** | JWT + bcrypt | Authentification sécurisée, gestion des rôles |
| **Extraction PDF** | PyPDF2 | Extraction de texte depuis les PDFs |
| **Extraction PPT** | python-pptx | Extraction de texte depuis les présentations |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│              Next.js 14 + Tailwind CSS                      │
│   /login  /register  /dashboard  /admin  /chatbots          │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTP REST (JWT Bearer Token)
┌──────────────────────▼──────────────────────────────────────┐
│                        BACKEND                              │
│                  FastAPI (Python)                           │
│  /auth  /chatbot  /documents  /faq  /chat  /dashboard       │
└─────────┬───────────────────────────────────┬───────────────┘
          │                                   │
┌─────────▼──────────┐             ┌──────────▼──────────────┐
│   PostgreSQL       │             │     Module IA           │
│   via Supabase     │             │  Sentence-Transformers  │
│                    │             │  all-MiniLM-L6-v2       │
│  ┌──────────────┐  │             │  (384 dimensions)       │
│  │  pgvector    │◄─┼─────────────┤  Embeddings locaux      │
│  │  (vecteurs)  │  │             └─────────────────────────┘
│  └──────────────┘  │
│  Tables :          │
│  - entreprise      │
│  - chatbots        │
│  - documents       │
│  - faq             │
│  - knowledge_chunks│
│  - conversations   │
└────────────────────┘
```

### Pipeline RAG

```
Question utilisateur
       │
       ▼
  Embedding (Sentence-Transformers)
       │
       ▼
  Recherche vectorielle pgvector
  (fonction RPC match_knowledge_chunks)
       │
       ▼
  Filtrage par similarité > 0.45
  Priorité : FAQ > Documents
       │
       ▼
  Scoring des phrases du chunk
       │
       ▼
  Réponse + Sauvegarde historique
```

---

## 🚀 Installation

### Prérequis

- Node.js 18+
- Python 3.10+
- Un projet [Supabase](https://supabase.com) avec l'extension `pgvector` activée

### 1. Cloner le repo

```bash
git clone https://github.com/votre-username/chatbot-factory.git
cd chatbot-factory
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Frontend

```bash
cd frontend
npm install
```

---

## 🔧 Variables d'environnement

### Backend — créer `backend/.env`

```env
# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=your_supabase_anon_key

# JWT
SECRET_KEY=your_super_secret_key_here

# Admin (credentials en dur, pas en base)
ADMIN_EMAIL=admin@chatbotfactory.com
ADMIN_PASSWORD=your_admin_password
```

### Frontend — créer `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Supabase — Fonction RPC pgvector

Exécuter dans l'éditeur SQL de Supabase :

```sql
create or replace function match_knowledge_chunks (
  query_embedding vector(384),
  match_chatbot_id uuid,
  match_count int
)
returns table (
  id uuid,
  content text,
  source_type text,
  source_id uuid,
  similarity float
)
language sql stable
as $$
  select
    id,
    content,
    source_type,
    source_id,
    1 - (embedding <=> query_embedding) as similarity
  from knowledge_chunks
  where chatbot_id = match_chatbot_id
  order by embedding <=> query_embedding
  limit match_count;
$$;
```

---

## ▶️ Lancement

### Backend

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

API disponible sur `http://localhost:8000`  
Documentation Swagger : `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm run dev
```

Application disponible sur `http://localhost:3000`

---

## 📁 Structure du projet

```
chatbot-factory/
│
├── backend/
│   ├── main.py                  # Point d'entrée FastAPI
│   ├── auth.py                  # Authentification JWT
│   ├── database.py              # Client Supabase
│   ├── models/                  # Modèles Pydantic
│   │   ├── chatbot.py
│   │   ├── entreprise.py
│   │   ├── document.py
│   │   ├── faq.py
│   │   └── conversation.py
│   ├── schemas/                 # Schémas de création/update
│   │   ├── chatbot.py
│   │   ├── document.py
│   │   └── faq.py
│   ├── routes/                  # Routers FastAPI
│   │   ├── chatbot.py
│   │   ├── document.py
│   │   ├── faq.py
│   │   ├── chat.py              # Endpoint principal RAG
│   │   ├── conversation.py
│   │   ├── dashboard.py
│   │   └── base_connaissance.py
│   └── services/                # Logique métier
│       ├── rag_service.py       # Pipeline RAG complet
│       ├── embedding_service.py # Sentence-Transformers
│       ├── document_service.py  # Upload + chunking
│       ├── faq_service.py       # Gestion FAQ + indexation
│       └── file_service.py      # Extraction PDF/PPTX
│
└── frontend/
    └── app/
        ├── page.tsx             # Landing page
        ├── login/page.tsx
        ├── register/page.tsx
        ├── dashboard/
        │   ├── layout.tsx       # Sidebar collapsible
        │   ├── page.tsx         # Tableau de bord
        │   ├── chatbots/
        │   │   ├── page.tsx     # Liste des chatbots
        │   │   ├── create/page.tsx
        │   │   └── [chatbotId]/
        │   │       ├── base-de-connaissance/page.tsx
        │   │       └── test/page.tsx
        │   ├── stats/page.tsx
        │   └── settings/page.tsx
        └── admin/
            ├── layout.tsx
            └── page.tsx
```

---

## 📡 API Reference

### Authentification

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/register` | Inscription entreprise |
| `POST` | `/login` | Connexion (admin ou entreprise) |

### Chatbots

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/chatbot/` | 🔒 Entreprise | Créer un chatbot |
| `GET` | `/chatbot/` | 🔒 Entreprise | Lister mes chatbots |
| `GET` | `/chatbot/{id}` | 🔒 Entreprise | Détail d'un chatbot |
| `PUT` | `/chatbot/{id}` | 🔒 Entreprise | Modifier un chatbot |
| `DELETE` | `/chatbot/{id}` | 🔒 Entreprise | Supprimer un chatbot |

### Base de connaissances

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/documents/` | 🔒 Entreprise | Upload PDF/PPTX (multipart) |
| `POST` | `/faq/` | 🔒 Entreprise | Ajouter une FAQ |
| `GET` | `/base/{chatbot_id}` | Public | Documents + FAQ d'un chatbot |

### Chat

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/chat/` | Envoyer une question → réponse RAG |
| `GET` | `/conversations/{chatbot_id}` | Historique de conversation |
| `DELETE` | `/conversations/{chatbot_id}` | Effacer l'historique |

### Administration

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/admin/entreprises` | 🔒 Admin | Lister toutes les entreprises |
| `PUT` | `/admin/validate/{id}` | 🔒 Admin | Valider une entreprise |

---

## 📐 Méthodologie

Ce projet a été développé selon la méthode **Scrum Lean** en 7 sprints de 2 semaines :

| Sprint | Focus |
|--------|-------|
| 1 | Architecture, BDD, configuration |
| 2 | Authentification JWT + bcrypt |
| 3 | CRUD Chatbots multi-tenant |
| 4 | Upload documents, chunking, embeddings |
| 5 | Pipeline RAG + interface de chat |
| 6 | Dashboard, statistiques, admin |
| 7 | Tests, optimisations, landing page |

---

## 👥 Auteurs

Projet de Fin d'Études — 2025/2026

---

## 📄 Licence

Ce projet est développé dans le cadre d'un PFE académique.
