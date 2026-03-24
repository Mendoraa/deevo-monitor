-- Deevo Cortex Phase 3 — Database Migration 001
-- Kuwait Motor Adaptive Risk Engine
-- 11 tables with indexes

-- ─── 1. Markets ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS markets (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(3) UNIQUE NOT NULL,
    name            VARCHAR(100) NOT NULL,
    active          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_markets_code ON markets(code);

-- ─── 2. Nodes ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nodes (
    id              SERIAL PRIMARY KEY,
    node_key        VARCHAR(100) UNIQUE NOT NULL,
    label           VARCHAR(200) NOT NULL,
    node_type       VARCHAR(50) NOT NULL,
    market_code     VARCHAR(3),
    sector          VARCHAR(100),
    base_value      FLOAT DEFAULT 0.0,
    current_value   FLOAT DEFAULT 0.0,
    normalized_value FLOAT DEFAULT 0.0,
    confidence_score FLOAT DEFAULT 0.7,
    metadata_json   JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nodes_key ON nodes(node_key);
CREATE INDEX idx_nodes_type ON nodes(node_type);
CREATE INDEX idx_nodes_market ON nodes(market_code);

-- ─── 3. Edges ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS edges (
    id                  SERIAL PRIMARY KEY,
    edge_key            VARCHAR(200) UNIQUE NOT NULL,
    source_node_id      VARCHAR(100) NOT NULL,
    target_node_id      VARCHAR(100) NOT NULL,
    relationship_type   VARCHAR(50) NOT NULL,
    base_weight         FLOAT NOT NULL,
    current_weight      FLOAT NOT NULL,
    min_weight          FLOAT DEFAULT 0.05,
    max_weight          FLOAT DEFAULT 1.50,
    confidence_score    FLOAT DEFAULT 0.7,
    time_decay_factor   FLOAT DEFAULT 1.0,
    volatility_factor   FLOAT DEFAULT 1.0,
    lag_days            INTEGER DEFAULT 0,
    active              BOOLEAN DEFAULT TRUE,
    metadata_json       JSONB DEFAULT '{}',
    last_calibrated_at  TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_edges_source_target ON edges(source_node_id, target_node_id);
CREATE INDEX idx_edges_key ON edges(edge_key);

-- ─── 4. Market Edge Profiles ──────────────────────────────────
CREATE TABLE IF NOT EXISTS market_edge_profiles (
    id                   SERIAL PRIMARY KEY,
    edge_id              INTEGER NOT NULL REFERENCES edges(id),
    market_code          VARCHAR(3) NOT NULL,
    regional_sensitivity FLOAT DEFAULT 1.0,
    override_weight      FLOAT,
    confidence_modifier  FLOAT DEFAULT 1.0,
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(edge_id, market_code)
);

CREATE INDEX idx_mep_edge_market ON market_edge_profiles(edge_id, market_code);

-- ─── 5. Signal Snapshots ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS signal_snapshots (
    id              SERIAL PRIMARY KEY,
    market_code     VARCHAR(3) NOT NULL,
    signal_key      VARCHAR(100) NOT NULL,
    signal_category VARCHAR(50) DEFAULT 'macro',
    signal_value    FLOAT NOT NULL,
    normalized_value FLOAT,
    source_name     VARCHAR(200),
    source_type     VARCHAR(50) DEFAULT 'manual',
    observed_at     TIMESTAMPTZ NOT NULL,
    ingested_at     TIMESTAMPTZ DEFAULT NOW(),
    metadata_json   JSONB DEFAULT '{}'
);

CREATE INDEX idx_signals_market_key_date ON signal_snapshots(market_code, signal_key, observed_at);

-- ─── 6. Prediction Records ───────────────────────────────────
CREATE TABLE IF NOT EXISTS prediction_records (
    id                  SERIAL PRIMARY KEY,
    assessment_id       VARCHAR(100) UNIQUE NOT NULL,
    market_code         VARCHAR(3) NOT NULL,
    portfolio_key       VARCHAR(100) NOT NULL,
    product_key         VARCHAR(100),
    run_type            VARCHAR(50) NOT NULL,
    prediction_date     TIMESTAMPTZ NOT NULL,
    overall_risk_level  VARCHAR(20) NOT NULL,
    confidence_score    FLOAT,
    top_drivers_json    JSONB DEFAULT '[]',
    graph_summary_json  JSONB DEFAULT '{}',
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_predictions_market_portfolio ON prediction_records(market_code, portfolio_key, prediction_date);

-- ─── 7. Score Records ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS score_records (
    id                          SERIAL PRIMARY KEY,
    prediction_id               INTEGER NOT NULL REFERENCES prediction_records(id),
    market_stress_score         INTEGER NOT NULL CHECK (market_stress_score BETWEEN 0 AND 100),
    claims_pressure_score       INTEGER NOT NULL CHECK (claims_pressure_score BETWEEN 0 AND 100),
    fraud_exposure_score        INTEGER NOT NULL CHECK (fraud_exposure_score BETWEEN 0 AND 100),
    underwriting_risk_score     INTEGER NOT NULL CHECK (underwriting_risk_score BETWEEN 0 AND 100),
    portfolio_stability_score   INTEGER NOT NULL CHECK (portfolio_stability_score BETWEEN 0 AND 100),
    score_version               VARCHAR(20) DEFAULT '3.0.0',
    created_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 8. Recommendation Records ────────────────────────────────
CREATE TABLE IF NOT EXISTS recommendation_records (
    id                  SERIAL PRIMARY KEY,
    prediction_id       INTEGER NOT NULL REFERENCES prediction_records(id),
    action_type         VARCHAR(50) NOT NULL,
    priority            VARCHAR(20) NOT NULL,
    title               VARCHAR(500) NOT NULL,
    rationale           TEXT NOT NULL,
    action_payload_json JSONB DEFAULT '{}',
    status              VARCHAR(20) DEFAULT 'pending',
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 9. Outcome Records ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS outcome_records (
    id                          SERIAL PRIMARY KEY,
    prediction_id               INTEGER NOT NULL REFERENCES prediction_records(id),
    actual_loss_ratio           FLOAT,
    actual_claims_frequency     FLOAT,
    actual_claims_severity      FLOAT,
    actual_fraud_findings       FLOAT,
    actual_lapse_rate           FLOAT,
    actual_underwriting_shift   FLOAT,
    observed_start_date         DATE NOT NULL,
    observed_end_date           DATE NOT NULL,
    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    metadata_json               JSONB DEFAULT '{}'
);

CREATE INDEX idx_outcomes_prediction ON outcome_records(prediction_id);

-- ─── 10. Calibration Records ─────────────────────────────────
CREATE TABLE IF NOT EXISTS calibration_records (
    id                  SERIAL PRIMARY KEY,
    edge_id             INTEGER NOT NULL REFERENCES edges(id),
    market_code         VARCHAR(3) NOT NULL,
    previous_weight     FLOAT NOT NULL,
    new_weight          FLOAT NOT NULL,
    previous_confidence FLOAT NOT NULL,
    new_confidence      FLOAT NOT NULL,
    error_metrics_json  JSONB DEFAULT '{}',
    calibration_reason  TEXT,
    approved_by         VARCHAR(100),
    calibration_mode    VARCHAR(20) DEFAULT 'semi_auto',
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calibrations_edge_date ON calibration_records(edge_id, created_at);

-- ─── 11. Audit Events ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_events (
    id                  SERIAL PRIMARY KEY,
    entity_type         VARCHAR(50) NOT NULL,
    entity_id           VARCHAR(100) NOT NULL,
    event_type          VARCHAR(50) NOT NULL,
    actor_type          VARCHAR(20) NOT NULL,
    actor_id            VARCHAR(100),
    event_payload_json  JSONB DEFAULT '{}',
    trace_id            VARCHAR(100),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_events(entity_type, entity_id);
CREATE INDEX idx_audit_trace ON audit_events(trace_id);

-- ─── Seed GCC Markets ────────────────────────────────────────
INSERT INTO markets (code, name) VALUES
    ('KWT', 'Kuwait'),
    ('SAU', 'Saudi Arabia'),
    ('UAE', 'UAE'),
    ('QAT', 'Qatar'),
    ('BHR', 'Bahrain'),
    ('OMN', 'Oman')
ON CONFLICT (code) DO NOTHING;
