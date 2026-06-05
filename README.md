<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shopping-bag.svg" width="80" alt="ShopSense Logo">
  
  # ShopSense 🛍️✨
  
  **AI-Powered Conversational Product Advisor**

  <p>
    <a href="https://github.com/microsoft/TypeScript"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React"></a>
    <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express.js-404D59?style=flat-square" alt="Express"></a>
    <a href="https://qdrant.tech/"><img src="https://img.shields.io/badge/Qdrant-Vector_DB-EA4335?style=flat-square" alt="Qdrant"></a>
    <a href="https://www.better-auth.com/"><img src="https://img.shields.io/badge/Better_Auth-000000?style=flat-square&logo=security" alt="Better Auth"></a>
    <a href="https://turbo.build/"><img src="https://img.shields.io/badge/Turborepo-EF4444?style=flat-square&logo=turborepo&logoColor=white" alt="Turborepo"></a>
    <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License"></a>
  </p>
  
  *ShopSense is a next-generation shopping assistant for the Indian e-commerce market. Users describe what they want in plain English, and receive semantically ranked products with a powerful RAG-backed chat layer for follow-up questions.*
</div>

---

## 🌟 Features

- **Semantic Search** — Powered by `text-embedding-004` and Qdrant vector store; finds products by *meaning*, not just keywords.
- **RAG Chat Layer** — Ask follow-up questions, compare specs, or clarify requirements via a streaming SSE LLM chat powered by Gemini.
- **Intent Detection** — Automatically classifies each query as `new_search`, `follow_up`, `comparison`, or `clarification` before pipeline execution.
- **Streaming UX** — Tokens stream directly to the browser over Server-Sent Events (SSE) — no waiting for the full response.
- **Dynamic Frontend** — A "Bright & Light" vibrant UI built with React + Vite, featuring magnetic cursors, text scrambling, and scroll reveals.
- **Robust Auth** — Powered by [Better Auth](https://better-auth.com/) (Email/Password + Google OAuth) with secure HttpOnly cookies.
- **Monorepo Architecture** — Turborepo workspaces cleanly separate core logic, database access, caching, and app code.
- **Docker-Ready** — One-command spin-up for local infra *and* production deployment via pre-built Docker images.

---

## 🖼️ Demo / Screenshot

🌐 **Live Demo:** `http://ec2-3-107-177-241.ap-southeast-2.compute.amazonaws.com/`

> [!IMPORTANT]
> The server runs on plain **HTTP**. Most browsers will automatically upgrade the URL to HTTPS, which will fail. Please **manually type** the full URL starting with `http://` in the address bar instead of clicking the link above.

---

## 🏗️ Architecture

```mermaid
graph TD
    User([User]) -->|HTTP / SSE| Web[Frontend React Vite SPA]
    
    subgraph "ShopSense Monorepo"
        Web -->|REST APIs| API[Express API Server]
        
        API --> Auth[Better Auth Module]
        API --> RAG[RAG Core Module]
        API --> CacheMod[Cache Module]
        API --> DBMod[DB Module]
        
        RAG --> LLM[(Google Gemini LLM)]
        RAG --> Qdrant[(Qdrant Vector DB)]
        
        Auth --> MongoDB[(MongoDB)]
        DBMod --> MongoDB
        CacheMod --> Redis[(Redis)]
    end
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript |
| **Backend** | Node.js, Express, TypeScript |
| **AI / RAG** | Google Gemini (`gemini-2.0-flash`, `text-embedding-004`) |
| **Vector Store** | Qdrant |
| **Database** | MongoDB (Mongoose) |
| **Cache** | Redis (`ioredis`) |
| **Auth** | Better Auth (Email/Password + Google OAuth) |
| **Monorepo** | Turborepo + npm workspaces |
| **Containerisation** | Docker + Docker Compose |

---

## 📁 Folder Structure

```text
shopsense/
├── apps/
│   ├── api/                        # Express API server (Port 3001)
│   │   ├── src/
│   │   │   ├── lib/                # Better Auth instance & helpers
│   │   │   ├── middleware/         # Auth guards & rate-limiting
│   │   │   ├── routes/             # chat.ts · products.ts · sessions.ts · auth.ts
│   │   │   ├── env.ts              # Validated environment variables
│   │   │   └── index.ts            # App entry point & server bootstrap
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── web/                        # React + Vite SPA (Port 5173)
│       ├── src/
│       │   ├── components/         # Chat, Products, Auth, Layout, Footer UI
│       │   ├── context/            # AuthContext & ChatContext providers
│       │   ├── hooks/              # Custom React hooks
│       │   ├── lib/                # API/SSE clients, formatters, interaction logic
│       │   ├── pages/              # Landing, Dashboard, Legal static pages
│       │   ├── App.tsx             # Router & top-level layout
│       │   └── index.css           # Design tokens & global styles
│       └── package.json
│
├── packages/
│   ├── rag-core/                   # Core RAG pipeline (shared library)
│   │   └── src/
│   │       ├── ragPipeline.ts      # Orchestrates the full search → generate flow
│   │       ├── intentDetector.ts   # Classifies query intent via LLM
│   │       ├── embedder.ts         # Gemini text-embedding-004 wrapper
│   │       ├── vectorStore.ts      # Qdrant upsert & query helpers
│   │       ├── chunker.ts          # Product metadata chunking strategy
│   │       ├── queryParser.ts      # Extracts budget / filters from raw query
│   │       ├── productFetcher.ts   # Retrieves product candidates
│   │       └── types.ts            # Shared TypeScript types & Zod schemas
│   │
│   ├── db/                         # Mongoose models & connection (shared library)
│   │   └── src/
│   │       ├── models/             # Product.ts · Session.ts · ChatTurn.ts
│   │       └── connection.ts       # MongoDB connect/disconnect helpers
│   │
│   └── cache/                      # Redis utilities (shared library)
│       └── src/
│           ├── redis.ts            # ioredis client singleton
│           ├── embeddingCache.ts   # Cache layer for embedding results
│           └── rateLimiter.ts      # Sliding-window rate-limiter middleware
│
├── infra/
│   └── docker-compose.yml          # Local dev services (Redis, MongoDB, Qdrant)
│
├── docker-compose.yml              # Full-stack Docker Compose (api + web + redis)
├── docker-compose.prod.yml         # Production compose using pre-built images
├── turbo.json                      # Turborepo pipeline configuration
├── tsconfig.json                   # Root TypeScript config (path aliases)
└── package.json                    # Root workspace manifest & scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18 (only for the local option)
- **Docker & Docker Compose** ≥ v2 (only for the Docker option)
- **Google API Key** for Gemini models — [get one free here](https://aistudio.google.com/apikey)
- **MongoDB** (Atlas or local instance)
- **Qdrant** instance (cloud or local Docker — see `infra/docker-compose.yml`)

### Step 0 — Clone & configure environment

```bash
git clone https://github.com/Shankhadeep25/shopsense.git
cd shopsense
cp .env.example .env
```

Open `.env` and fill in your keys:

```env
# ── AI / LLM ──────────────────────────────────────────────────────────────────
GOOGLE_API_KEY=your_gemini_api_key

# ── Databases ─────────────────────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/shopsense
REDIS_URL=redis://localhost:6379
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=shopsense_products

# ── Server ────────────────────────────────────────────────────────────────────
PORT=3001
NODE_ENV=development

# ── Better Auth ───────────────────────────────────────────────────────────────
# Generate: openssl rand -base64 32
BETTER_AUTH_SECRET=your_secret_min_32_chars
BETTER_AUTH_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173

# ── Google OAuth ──────────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

### Option 1 — Docker (recommended)

Spins up the full stack (API + Web + Redis) in isolated containers. No local Node.js required.

```bash
# Development build (builds images from source)
docker compose up --build

# Production — pulls pre-built images from Docker Hub
docker compose -f docker-compose.prod.yml up -d
```

| Service | URL |
|---|---|
| Web frontend | http://localhost:5173 |
| API server | http://localhost:3001 |
| Redis | `redis://localhost:6379` |

> **Note:** MongoDB and Qdrant are **not** included in the compose files — connect them via `MONGODB_URI` and `QDRANT_URL` in your `.env`.

---

### Option 2 — Local (manual)

Requires Node.js ≥ 18 installed on your machine.

```bash
# 1. Install all workspace dependencies
npm install

# 2. Build shared packages (rag-core, db, cache) first
npm run build

# 3. Start local infra (Redis + MongoDB + Qdrant) — optional helper
docker compose -f infra/docker-compose.yml up -d

# 4. Run both dev servers in parallel
npm run dev
# Or run them individually:
#   Terminal 1 → npm run dev:api   (Port 3001)
#   Terminal 2 → npm run dev:web   (Port 5173)
```

---

## 🔌 API Reference

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/health` | Service health check | ❌ |
| `POST` | `/api/auth/*` | Better Auth (sign-up, sign-in, OAuth) | ❌ |
| `POST` | `/api/chat` | RAG streaming chat endpoint (SSE) | ✅ |
| `GET` | `/api/products` | Semantic product search | ✅ |
| `POST` | `/api/sessions` | Create a new chat session | ✅ |
| `GET` | `/api/sessions/:id` | Fetch chat history for a session | ✅ |

### Key Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_API_KEY` | ✅ | Gemini LLM & embeddings |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `REDIS_URL` | ✅ | Redis connection URL |
| `QDRANT_URL` | ✅ | Qdrant instance URL |
| `QDRANT_COLLECTION` | ✅ | Qdrant collection name |
| `BETTER_AUTH_SECRET` | ✅ | ≥ 32-char random secret |
| `BETTER_AUTH_URL` | ✅ | API server public URL |
| `FRONTEND_URL` | ✅ | Frontend public URL (CORS) |
| `GOOGLE_CLIENT_ID` | ⚠️ | Required for Google OAuth |
| `GOOGLE_CLIENT_SECRET` | ⚠️ | Required for Google OAuth |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/your-feature`
3. **Commit** your changes: `git commit -m "feat: add your feature"`
4. **Push** to the branch: `git push origin feat/your-feature`
5. **Open** a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. Run `npm run lint` before submitting.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for full details.

---

<div align="center">
  <i>Built with ❤️ for AI-assisted shopping.</i>
</div>
