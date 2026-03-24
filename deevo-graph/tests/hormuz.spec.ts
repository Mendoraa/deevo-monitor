/**
 * Test: Hormuz Disruption Scenario
 *
 * Validates the full Phase 2 pipeline:
 *   Signal → Normalize → Dynamic Weights → Propagation
 *   → Insurance Overlay → GCC Impacts → Explanation → Bundle
 */

import { bindSignalToEvent } from "../engine/signal-binding";
import { applyDynamicWeights } from "../engine/dynamic-weights";
import { buildGCCGraph, runEventPropagation } from "../engine/propagation";
import { runScenario, runFromSignal, runMultiScenario } from "../engine/scenario-runner";
import { claimsOverlay } from "../insurance/claims-overlay";
import { underwritingOverlay } from "../insurance/underwriting-overlay";
import { fraudOverlay } from "../insurance/fraud-overlay";
import { reinsuranceOverlay } from "../insurance/reinsurance-overlay";
import { validateBundle } from "../outputs/decision-bundle";
import { validateExplanation } from "../outputs/explanation-bundle";
import type { NormalizedEvent } from "../types";

// ─── Test Helpers ──────────────────────────────────────────────

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
}

function assertRange(value: number, min: number, max: number, label: string): void {
  assert(
    value >= min && value <= max,
    `${label} = ${value}, expected [${min}, ${max}]`
  );
}

// ─── Signal Binding Test ───────────────────────────────────────

function testSignalBinding(): void {
  console.log("  ▸ Signal Binding...");

  const event = bindSignalToEvent({
    title: "Oil tanker hit near Strait of Hormuz",
    description: "Confirmed explosion on VLCC tanker transiting Hormuz chokepoint",
    source: "Reuters",
    region: "GCC",
  });

  assert(event.eventClass === "hormuz_disruption", "Should classify as hormuz_disruption");
  assert(event.category === "shipping_disruption", "Should categorize as shipping_disruption");
  assertRange(event.severity, 0.7, 1.0, "Severity");
  assertRange(event.confidence, 0.6, 1.0, "Confidence");
  assert(event.region === "GCC", "Region should be GCC");

  console.log("    ✓ Event classified correctly");
  console.log(`    ✓ Severity: ${event.severity}, Confidence: ${event.confidence}`);
}

// ─── Dynamic Weights Test ──────────────────────────────────────

function testDynamicWeights(): void {
  console.log("  ▸ Dynamic Weights...");

  const graph = buildGCCGraph();
  const event: NormalizedEvent = {
    eventClass: "hormuz_disruption",
    category: "shipping_disruption",
    region: "GCC",
    severity: 0.85,
    confidence: 0.80,
    title: "Hormuz disruption",
    description: "",
    sources: ["Reuters", "Bloomberg"],
    timestamp: new Date().toISOString(),
  };

  const updatedEdges = applyDynamicWeights(graph.edges, event, 0);

  // All edges should have dynamicWeight set
  assert(updatedEdges.every((e) => e.dynamicWeight > 0), "All edges should have positive dynamic weight");

  // Dynamic weights should generally be higher than base (severity > 0)
  const amplified = updatedEdges.filter((e) => e.dynamicWeight > e.baseWeight);
  assert(amplified.length > updatedEdges.length * 0.5, "Most edges should be amplified");

  // No weight should exceed 1.0
  assert(updatedEdges.every((e) => e.dynamicWeight <= 1.0), "No weight should exceed 1.0");

  console.log(`    ✓ ${updatedEdges.length} edges updated`);
  console.log(`    ✓ ${amplified.length} edges amplified above base`);
}

// ─── Propagation Test ──────────────────────────────────────────

function testPropagation(): void {
  console.log("  ▸ Graph Propagation...");

  const graph = buildGCCGraph();
  const result = runEventPropagation(
    { eventClass: "hormuz_disruption", severity: 0.85 },
    graph
  );

  assert(result.totalSteps > 10, `Should have >10 steps, got ${result.totalSteps}`);
  assert(result.impactedNodes.length > 8, `Should impact >8 nodes, got ${result.impactedNodes.length}`);
  assert(result.maxDepthReached >= 2, `Should reach depth ≥2, got ${result.maxDepthReached}`);
  assertRange(result.systemicRiskScore, 0.2, 1.0, "Systemic risk");

  // Hormuz should be critical or disrupted
  const hormuzNode = result.impactedNodes.find((n) => n.id === "hormuz");
  assert(!!hormuzNode, "Hormuz should be impacted");
  assert(
    hormuzNode!.state === "critical" || hormuzNode!.state === "disrupted",
    `Hormuz should be critical/disrupted, got ${hormuzNode!.state}`
  );

  // Oil should be impacted
  const oilNode = result.impactedNodes.find((n) => n.id === "crude_oil");
  assert(!!oilNode, "Crude oil should be impacted");

  // Countries should be reached
  const countryNodes = result.impactedNodes.filter((n) => n.type === "country");
  assert(countryNodes.length >= 2, `Should reach ≥2 countries, got ${countryNodes.length}`);

  console.log(`    ✓ ${result.totalSteps} propagation steps`);
  console.log(`    ✓ ${result.impactedNodes.length} nodes impacted`);
  console.log(`    ✓ Systemic risk: ${(result.systemicRiskScore * 100).toFixed(1)}%`);
  console.log(`    ✓ Critical path: ${result.criticalPath.slice(0, 5).join(" → ")}`);
}

// ─── Insurance Overlay Test ────────────────────────────────────

function testInsuranceOverlay(): void {
  console.log("  ▸ Insurance Overlay...");

  const graph = buildGCCGraph();
  runEventPropagation({ eventClass: "hormuz_disruption", severity: 0.85 }, graph);

  const claims = claimsOverlay(graph);
  const uw = underwritingOverlay(graph);
  const fraud = fraudOverlay(graph);
  const reins = reinsuranceOverlay(graph);

  assertRange(claims.claimsProbability, 0.0, 1.0, "Claims probability");
  assert(claims.rationale.length > 0, "Should have claims rationale");

  assertRange(uw.tighteningScore, 0.0, 1.0, "Underwriting tightening");
  assert(uw.newBusinessRisk.length > 0, "Should have UW posture");

  assertRange(fraud.fraudPressure, 0.0, 1.0, "Fraud pressure");
  assert(fraud.monitoringLevel.length > 0, "Should have monitoring level");

  assertRange(reins.treatyStress, 0.0, 1.0, "Treaty stress");

  console.log(`    ✓ Claims: ${(claims.claimsProbability * 100).toFixed(1)}%`);
  console.log(`    ✓ UW Tightening: ${(uw.tighteningScore * 100).toFixed(1)}% — ${uw.newBusinessRisk}`);
  console.log(`    ✓ Fraud: ${(fraud.fraudPressure * 100).toFixed(1)}% — ${fraud.monitoringLevel}`);
  console.log(`    ✓ Reinsurance: ${(reins.treatyStress * 100).toFixed(1)}%, Cat reserve: ${reins.catastropheReserveTrigger}`);
}

// ─── Full Scenario Test ────────────────────────────────────────

function testFullScenario(): void {
  console.log("  ▸ Full Scenario Pipeline...");

  const result = runFromSignal({
    title: "Confirmed attack on VLCC tanker in Strait of Hormuz",
    description: "Multiple sources confirm explosion. Strait passage partially blocked.",
    source: "Reuters",
    region: "GCC",
  });

  // Validate bundle
  const bundleValidation = validateBundle(result.bundle);
  assert(bundleValidation.valid, `Bundle invalid: ${bundleValidation.errors.join(", ")}`);

  // Validate explanation
  const explValidation = validateExplanation(result.explanation);
  assert(explValidation.valid, `Explanation invalid: missing ${explValidation.missing.join(", ")}`);

  // Check GCC coverage
  const gccCountries = Object.keys(result.gccImpacts);
  assert(gccCountries.length === 6, `Should have 6 GCC countries, got ${gccCountries.length}`);

  // Check watchpoints
  assert(result.explanation.watchpoints.length >= 2, "Should have ≥2 watchpoints");

  console.log(`    ✓ Bundle valid (hash: ${result.bundle.auditHash})`);
  console.log(`    ✓ Explanation: ${explValidation.completeness}% complete`);
  console.log(`    ✓ GCC coverage: ${gccCountries.join(", ")}`);
  console.log(`    ✓ Insurance: ${result.insuranceOverlay.overallRiskLevel} risk`);
}

// ─── Multi-Scenario Test ───────────────────────────────────────

function testMultiScenario(): void {
  console.log("  ▸ Multi-Scenario (Base/Elevated/Severe)...");

  const event: NormalizedEvent = {
    eventClass: "hormuz_disruption",
    category: "shipping_disruption",
    region: "GCC",
    severity: 0.75,
    confidence: 0.80,
    title: "Hormuz disruption",
    description: "Maritime incident near Hormuz",
    sources: ["Reuters"],
    timestamp: new Date().toISOString(),
  };

  const scenarios = runMultiScenario(event);
  assert(scenarios.length === 3, "Should have 3 tiers");

  // Severity should increase across tiers
  const risks = scenarios.map((s) => s.result.propagation.systemicRiskScore);
  assert(risks[1] >= risks[0], "Elevated risk should be ≥ base");
  assert(risks[2] >= risks[1], "Severe risk should be ≥ elevated");

  for (const scenario of scenarios) {
    console.log(
      `    ✓ ${scenario.tier}: systemic=${(scenario.result.propagation.systemicRiskScore * 100).toFixed(1)}%, ` +
      `insurance=${scenario.result.insuranceOverlay.overallRiskLevel}, ` +
      `steps=${scenario.result.propagation.totalSteps}`
    );
  }
}

// ─── Run All Tests ─────────────────────────────────────────────

export function runHormuzTests(): void {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║  HORMUZ DISRUPTION — Phase 2 Test Suite          ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  try {
    testSignalBinding();
    testDynamicWeights();
    testPropagation();
    testInsuranceOverlay();
    testFullScenario();
    testMultiScenario();

    console.log("\n  ══════════════════════════════════════════");
    console.log("  ✅ ALL HORMUZ TESTS PASSED");
    console.log("  ══════════════════════════════════════════\n");
  } catch (error) {
    console.error("\n  ❌ TEST FAILED:", (error as Error).message);
    process.exit(1);
  }
}

// Run if executed directly
runHormuzTests();
