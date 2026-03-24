# Deevo Cortex

**Economic Intelligence Layer for GCC Insurance Markets**

Transforms geopolitical events into explainable economic intelligence — causal chains, sector impact analysis, scenario scoring, and executive decision insights focused on the Gulf Cooperation Council region.

> **Status**: MVP / Applied Intelligence Platform. Backend core is production-tested (39/39 tests passing). Frontend dashboard is functional and wired to live API. Not yet deployed to production.

---

## Overview

Deevo Cortex is a decision-intelligence platform that takes real-world events (oil supply disruptions, sanctions, regional conflicts) and runs them through an economic reasoning pipeline to produce actionable intelligence for insurance executives operating in GCC markets.

The system routes events to specialized economic agents, builds deterministic causal chains using graph-based BFS propagation, scores scenarios across severity tiers, and outputs GCC-specific impact assessments with insurance-grade risk signals.

## Core Capabilities

- **Event Classification** — Categorizes geopolitical events by type, severity, and affected sectors
- **Multi-Agent Economic Analysis** — 5 specialized agents (Oil Market, Shipping & Logistics, Insurance Risk, Banking & Liquidity, GCC Fiscal) analyze events from their domain perspective
- **Causal Chain Construction** — Deterministic graph-based reasoning that traces cause → effect propagation across economic sectors
- **Scenario Scoring** — Base / Elevated / Severe scenarios with probability ranges and confidence intervals
- **GCC Country Impact** — Per-country breakdown for all 6 GCC states with oil dependency weighting
- **Insurance Risk Scoring** — 5 composite scores (Market Stress, Claims Pressure, Fraud Exposure, Underwriting Risk, Portfolio Stability) on a 0–100 scale
- **Recommendation Engine** — 12 rule-based recommendations (R01–R12) mapping score thresholds to executive actions
- **Adaptive Calibration** — Prediction → Outcome → Error analysis → Weight update cycle (EMA α=0.3)
- **Decision Insights** — Plain-language executive summaries explaining what happens, why, and what to do

## Architecture

```
Event Input
    │
    ▼
Classify Event ─────► Route to Agents (5 domain experts)
    │                       │
    ▼                       ▼
Build Causal Chain    Agent Outputs (sector impacts)
    │                       │
    ▼                       ▼
Score Scenarios ◄──── GCC Breakdown (6 countries)
    │
    ▼
Insurance Analysis ──► Graph Simulation ──► Decision Insight
    │                                            │
    ▼                                            ▼
5 Risk Scores ──► 12 Recommendations      Explanation Bundle
```

### 7-Layer Intelligence Stack

| Layer | Component | Purpose |
|-------|-----------|---------|
| Data | Signal Ingestion | Raw market signals and event feeds |
| Features | Event Classification | Normalize and categorize inputs |
| Models | Economic Agents | Domain-specific impact modeling |
| Agents | Causal Chain + Scenarios | Graph reasoning and scenario generation |
| APIs | FastAPI v1 + Legacy | 34 endpoints across 2 API versions |
| UI | Next.js Dashboard | 6 screens with live API integration |
| Governance | Calibration + Audit | SHA-256 audit trails, adaptive weights |

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14, React 18, Tailwind CSS, Lucide Icons |
| Backend | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0 |
| Database | PostgreSQL 16 |
| Containerization | Docker Compose |
| Package Manager | npm (frontend), pip (backend) |

## Repository Structure

```
deevo-cortex/
├── backend/
│   ├── app/
│   │   ├── agents/            # 5 economic sector agents
│   │   ├── api/               # v1 production API routes (8 routers)
│   │   ├── core/              # Enums and constants
│   │   ├── db/                # SQLAlchemy models (10 tables)
│   │   ├── engines/           # Core pipeline: classify, route, chain,
│   │   │   ├── calibration/   #   score, insight, calibration,
│   │   │   ├── graph/         #   graph simulation,
│   │   │   ├── insurance/     #   insurance analysis,
│   │   │   └── scoring/       #   and scoring engine
│   │   ├── mocks/             # 5 preset scenario payloads
│   │   ├── prompts/           # LLM prompt templates
│   │   ├── routes/            # Legacy economic-layer endpoints
│   │   ├── schemas/           # Pydantic data contracts (11 schemas)
│   │   └── services/          # Business logic services (10 services)
│   ├── migrations/            # Alembic database migrations
│   ├── scripts/               # Seed data scripts
│   ├── tests/                 # pytest suite (39 tests)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js pages (6 screens)
│   │   │   ├── economic/      # Economic Layer analysis
│   │   │   ├── world/         # World Monitor — GCC regions
│   │   │   ├── kuwait-motor/  # Kuwait Motor portfolio detail
│   │   │   ├── recommendations/ # 12-rule recommendation engine
│   │   │   └── calibration/   # Adaptive calibration dashboard
│   │   ├── components/        # Reusable UI components
│   │   │   └── ui/            # ScoreGauge, RiskBadge, StatCard, etc.
│   │   ├── lib/               # API clients, presets, mock data
│   │   └── types/             # TypeScript type definitions
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── data/
│   └── init.sql               # PostgreSQL schema initialization
├── docs/                      # Architecture and design documents
│   ├── DATA_CONTRACT.md
│   ├── PRODUCT_SCOPE.md
│   ├── SCORING_RULES.md
│   ├── RECOMMENDATION_RULEBOOK.md
│   ├── SYSTEM_ARCHITECTURE.md
│   └── README_PROJECT_HANDOFF.md
├── specs/                     # Graph and seed data specifications
├── docker-compose.yml
└── .env.example
```

## Getting Started

### Prerequisites

- Docker and Docker Compose (recommended)
- Or: Node.js 18+, Python 3.11+, PostgreSQL 16

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/PyBADR/deevo-monitor.git
cd deevo-monitor

# Copy environment file
cp .env.example .env

# Start all services
docker compose up --build

# Frontend:  http://localhost:3000
# Backend:   http://localhost:8000
# API Docs:  http://localhost:8000/docs
```

### Manual Setup

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # Edit with your database URL
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
cp .env.example .env.local     # Set NEXT_PUBLIC_API_URL
npm run dev
```

**Database:**

```bash
# Using Docker for database only
docker compose up db -d

# Or use your own PostgreSQL and run:
psql -U deevo -d deevo_cortex -f data/init.sql
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL async connection string | See `.env.example` |
| `DATABASE_URL_SYNC` | PostgreSQL sync connection string | See `.env.example` |
| `OLLAMA_BASE_URL` | Ollama LLM endpoint (optional) | `http://localhost:11434` |
| `APP_ENV` | Environment mode | `development` |
| `NEXT_PUBLIC_API_URL` | Backend URL for frontend | `http://localhost:8000` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |
| `CALIBRATION_MODE` | Calibration strategy | `semi_auto` |
| `DEFAULT_MARKET` | Target market | `KWT` |
| `DEFAULT_PORTFOLIO` | Target portfolio | `motor_retail` |

## API Reference

### Legacy Economic Layer

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/economic-layer/cortex` | Full Cortex pipeline (economic + insurance + graph + explanation) |
| POST | `/api/economic-layer/analyze` | Economic analysis only |
| POST | `/api/economic-layer/classify` | Event classification |
| POST | `/api/economic-layer/scenario` | Scenario scoring |
| POST | `/api/economic-layer/insurance` | Insurance analysis |
| POST | `/api/economic-layer/graph` | Graph simulation |
| POST | `/api/economic-layer/scorecard` | GCC scorecards |
| GET | `/api/economic-layer/health` | Health check |

### Production API v1

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Service health and readiness |
| POST | `/api/v1/signals/ingest` | Signal ingestion |
| GET | `/api/v1/graph/nodes` | Graph node registry |
| POST | `/api/v1/scoring/run` | Run scoring engine |
| GET | `/api/v1/predictions/{id}` | Get prediction by ID |
| POST | `/api/v1/feedback/outcomes` | Submit outcome feedback |
| POST | `/api/v1/calibration/run` | Run calibration cycle |
| GET | `/api/v1/recommendations/{id}` | Get recommendations |

Full interactive documentation available at `http://localhost:8000/docs` when the backend is running.

## Testing

```bash
cd backend
pip install pytest pytest-asyncio httpx
pytest -v                      # Run all 39 tests
pytest tests/test_e2e_pipeline.py -v   # End-to-end pipeline tests
```

## Deployment

### Frontend (Vercel)

The Next.js frontend can be deployed to Vercel:

1. Import the GitHub repository in Vercel
2. Set **Root Directory** to `frontend`
3. Framework Preset: **Next.js**
4. Add environment variable: `NEXT_PUBLIC_API_URL` = your production backend URL
5. Deploy

### Backend

The FastAPI backend should be deployed separately (Render, Railway, Fly.io, or any container platform):

1. Deploy the `backend/` directory with the included Dockerfile
2. Set environment variables (see `.env.example`)
3. Ensure PostgreSQL is accessible
4. Update frontend's `NEXT_PUBLIC_API_URL` to point to the deployed backend

## Roadmap

- [x] Economic analysis pipeline with 5 agents
- [x] Graph-based causal chain reasoning
- [x] Scenario scoring (Base / Elevated / Severe)
- [x] GCC country impact breakdown
- [x] Insurance risk scoring (5 composite scores)
- [x] Recommendation engine (12 rules)
- [x] Adaptive calibration with EMA
- [x] Next.js dashboard with 6 screens
- [x] Live API integration (frontend ↔ backend)
- [ ] Production deployment (Vercel + backend hosting)
- [ ] Real-time signal ingestion from market feeds
- [ ] LLM-enhanced agent reasoning (Ollama integration)
- [ ] Multi-tenant data isolation
- [ ] PDPL / IFRS 17 compliance layer

## Scope

This MVP focuses exclusively on the **Kuwait (KWT)** market and the **motor_retail** portfolio. Expansion to additional GCC markets and portfolio types is planned but not yet implemented.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines and contribution workflow.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting and security practices.

## Maintainer

**BDRAI** — [bader.marketing.39@gmail.com](mailto:bader.marketing.39@gmail.com)

Built with the [Deevo Analytics](https://github.com/PyBADR) platform.
