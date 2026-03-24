-- Deevo Cortex — Database Initialization
-- This runs automatically when the PostgreSQL container starts for the first time.

-- ═══════════════════════════════════════════════════════
-- Schema: economic_layer
-- ═══════════════════════════════════════════════════════
CREATE SCHEMA IF NOT EXISTS economic_layer;

-- ─── Events Table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS economic_layer.events (
    event_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    category        TEXT NOT NULL,
    subtype         TEXT DEFAULT 'general',
    region          TEXT DEFAULT 'Middle East',
    severity        NUMERIC(3,2) NOT NULL CHECK (severity >= 0 AND severity <= 1),
    source_confidence NUMERIC(3,2) CHECK (source_confidence >= 0 AND source_confidence <= 1),
    schema_version  TEXT DEFAULT '1.0.0',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Analysis Bundles Table ─────────────────────────────
CREATE TABLE IF NOT EXISTS economic_layer.analysis_bundles (
    bundle_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID REFERENCES economic_layer.events(event_id),
    event_summary   TEXT NOT NULL,
    causal_chain    JSONB NOT NULL,
    sector_impacts  JSONB NOT NULL,
    gcc_breakdown   JSONB NOT NULL,
    scenarios       JSONB NOT NULL,
    decision_insight TEXT NOT NULL,
    agent_trace     JSONB NOT NULL,
    audit_hash      TEXT NOT NULL,
    schema_version  TEXT DEFAULT '1.0.0',
    duration_ms     INTEGER,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Audit Log Table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS economic_layer.audit_log (
    log_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id       UUID REFERENCES economic_layer.analysis_bundles(bundle_id),
    event_id        UUID REFERENCES economic_layer.events(event_id),
    agents_invoked  TEXT[] NOT NULL,
    duration_ms     INTEGER,
    audit_hash      TEXT NOT NULL,
    schema_version  TEXT DEFAULT '1.0.0',
    logged_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_events_category ON economic_layer.events(category);
CREATE INDEX IF NOT EXISTS idx_events_created ON economic_layer.events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bundles_event ON economic_layer.analysis_bundles(event_id);
CREATE INDEX IF NOT EXISTS idx_bundles_created ON economic_layer.analysis_bundles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_bundle ON economic_layer.audit_log(bundle_id);

-- ─── Comments ───────────────────────────────────────────
COMMENT ON SCHEMA economic_layer IS 'Deevo Cortex Economic Intelligence Layer';
COMMENT ON TABLE economic_layer.events IS 'Normalized geopolitical/economic events';
COMMENT ON TABLE economic_layer.analysis_bundles IS 'Full analysis output — immutable after creation';
COMMENT ON TABLE economic_layer.audit_log IS 'SHA-256 audit trail for every analysis run';
