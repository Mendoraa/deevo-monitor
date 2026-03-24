# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [3.0.0] - 2026-03-25

### Added
- Full Cortex pipeline: Event → Classify → Route Agents → Causal Chain → Scenarios → Insurance → Graph → Decision Insight
- 5 economic sector agents: Oil Market, Shipping & Logistics, Insurance Risk, Banking & Liquidity, GCC Fiscal
- Graph-based BFS causal chain propagation with deterministic reasoning
- Insurance risk scoring engine with 5 composite scores (0–100 scale)
- Recommendation engine with 12 rules (R01–R12) mapping thresholds to executive actions
- Adaptive calibration system with EMA (α=0.3) weight updates
- Production API v1 with 24 endpoints across 8 routers
- Legacy Economic Layer API with 10 endpoints
- Next.js 14 dashboard with 6 screens: Command Center, World Monitor, Economic Layer, Kuwait Motor, Recommendations, Calibration
- Live frontend-to-backend API integration
- 5 preset event scenarios (Hormuz, Refinery, Sanctions, Banking, War)
- PostgreSQL schema with 10 tables and Alembic migrations
- Docker Compose setup (PostgreSQL + FastAPI + Next.js)
- 39 pytest tests (unit + E2E pipeline)
- Architecture documentation, data contracts, and scoring rules

### Scope
- Kuwait (KWT) market, motor_retail portfolio only
