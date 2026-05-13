# ShopSense — NLP Shopping RAG Assistant

AI-powered conversational product advisor for the Indian e-commerce market. Users describe what they want in plain English and receive semantically ranked products with a RAG-powered chat layer for follow-up questions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **API Server** | Node.js + Express + TypeScript |
| **RAG Pipeline** | LangChain + Google Gemini (embeddings + chat) |
| **Vector Store** | Qdrant (768-dim, Cosine) |
| **Database** | MongoDB (Mongoose) |
| **Cache** | Redis (ioredis) |
| **Monorepo** | npm workspaces |

## Architecture

```
shopsense/
├── apps/
│   └── api/              → Express REST server (Port 3001)
├── packages/
│   ├── rag-core/         → Embeddings, chunking, retrieval, RAG pipeline
│   ├── db/               → MongoDB schemas (Product, Session, ChatTurn)
│   └── cache/            → Redis wrapper, rate limiter, embedding cache
└── infra/
    └── docker-compose.yml → Qdrant + Redis + MongoDB containers
```

## Local Dev Setup (5 commands)

### Prerequisites
- Node.js ≥ 18
- Docker Desktop (for Qdrant, Redis, MongoDB)
- Google Gemini API key ([Get free key](https://aistudio.google.com/apikey))

### Steps

```bash
# 1. Clone and install
git clone <repo-url> && cd ShopSense
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env → add your GOOGLE_API_KEY

# 3. Start infrastructure (Qdrant + Redis + MongoDB)
docker-compose -f infra/docker-compose.yml up -d

# 4. Build packages
npm run build

# 5. Start API server
npm run dev:api
```

The API will be running at `http://localhost:3001`.

## API Endpoints

### Health Check
```
GET /api/health
```

### Chat (RAG Pipeline)
```
POST /api/chat
Content-Type: application/json

{
  "sessionId": "uuid",
  "message": "best laptop under ₹60k for video editing",
  "history": []
}
```
Supports SSE streaming with `Accept: text/event-stream` header.

### Products
```
GET  /api/products?query=best laptop under 60k
GET  /api/products/:id
POST /api/products/compare  { "productIds": ["id1", "id2"] }
```

### Sessions
```
POST   /api/sessions          → Create new session
GET    /api/sessions/:id      → Get session + chat history
DELETE /api/sessions/:id      → Cleanup session data
```

## RAG Pipeline Flow

1. **Intent Detection** → `new_search | follow_up | comparison | clarification`
2. **Product Fetch** → Mock data (15 products across 5 categories)
3. **Chunking** → metadata / specs / reviews chunks
4. **Embedding** → Gemini `text-embedding-004` (768-dim) with L2 cache
5. **Vector Search** → Qdrant similarity search (topK=8, threshold=0.72)
6. **LLM Response** → Gemini `gemini-2.0-flash` with grounded system prompt
7. **Streaming** → SSE token-by-token delivery

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_API_KEY` | ✅ | — | Gemini API key |
| `MONGODB_URI` | ✅ | `mongodb://localhost:27017/shopsense` | MongoDB connection |
| `REDIS_URL` | ❌ | `redis://localhost:6379` | Redis (app works without) |
| `QDRANT_URL` | ✅ | `http://localhost:6333` | Qdrant vector store |
| `PORT` | ❌ | `3001` | API server port |

## License

MIT
