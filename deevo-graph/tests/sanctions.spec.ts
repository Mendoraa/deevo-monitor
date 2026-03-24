/**
 * Test: Sanctions Escalation Scenario
 * Focuses on trade, banking, liquidity, and shipping.
 */

import { bindSignalToEvent } from "../engine/signal-binding";
import { buildGCCGraph, runEventPropagation } from "../engine/propagation";
import { runFromSignal } from "../engine/scenario-runner";
import { validateBundle } from "../outputs/decision-bundle";
import { validateExplanation } from "../outputs/explanation-bundle";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
}

function testSignalBinding(): void {
  console.log("  ▸ Signal Binding...");

  const event = bindSignalToEvent({
    title: "New OFAC sanctions on major GCC trade partner announced",
    description: "Comprehensive sanctions package including asset freeze and export controls.",
    source: "Bloomberg",
    region: "GCC",
  });

  assert(event.eventClass === "sanctions_escalation", `Expected sanctions_escalation, got ${event.eventClass}`);
  assert(event.category === "sanctions", `Expected sanctions, got ${event.category}`);

  console.log(`    ✓ Class: ${event.eventClass}, Severity: ${event.severity}`);
}

function testPropagation(): void {
  console.log("  ▸ Graph Propagation...");

  const graph = buildGCCGraph();
  const result = runEventPropagation(
    { eventClass: "sanctions_escalation", severity: 0.75 },
    graph
  );

  assert(result.totalSteps > 5, `Should have >5 steps, got ${result.totalSteps}`);

  // Trade finance and banking should be primary targets
  const tradeFin = result.impactedNodes.find((n) => n.id === "trade_finance");
  assert(!!tradeFin, "Trade finance should be impacted");

  const banking = result.impactedNodes.find((n) => n.id === "gcc_banking");
  assert(!!banking, "GCC banking should be impacted");

  // Credit risk should propagate
  const credit = result.impactedNodes.find((n) => n.id === "credit_risk");
  assert(!!credit, "Credit risk should be impacted");

  console.log(`    ✓ ${result.totalSteps} steps, ${result.impactedNodes.length} nodes`);
  console.log(`    ✓ Systemic risk: ${(result.systemicRiskScore * 100).toFixed(1)}%`);
}

function testFullPipeline(): void {
  console.log("  ▸ Full Pipeline...");

  const result = runFromSignal({
    title: "Widespread OFAC sanctions impose asset freeze on regional trade partners",
    description: "Export controls and embargo on key commodities. Banking sector on alert.",
    source: "Reuters",
    region: "GCC",
  });

  const bv = validateBundle(result.bundle);
  assert(bv.valid, `Bundle invalid: ${bv.errors.join(", ")}`);

  const ev = validateExplanation(result.explanation);
  assert(ev.valid, `Explanation invalid: missing ${ev.missing.join(", ")}`);

  // Bahrain should be more vulnerable (low fiscal buffer)
  const bahrain = result.gccImpacts.bahrain;
  assert(bahrain !== undefined, "Bahrain impact should exist");

  // UAE should show high trade exposure
  const uae = result.gccImpacts.uae;
  assert(uae.trade === "high exposure", `UAE trade should be high exposure, got ${uae.trade}`);

  console.log(`    ✓ Bundle valid (${result.bundle.auditHash})`);
  console.log(`    ✓ Insurance: ${result.insuranceOverlay.overallRiskLevel}`);
  console.log(`    ✓ UAE trade: ${uae.trade}`);
  console.log(`    ✓ Bahrain severity: ${bahrain.severity}/100`);
}

export function runSanctionsTests(): void {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║  SANCTIONS ESCALATION — Phase 2 Test Suite       ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  try {
    testSignalBinding();
    testPropagation();
    testFullPipeline();

    console.log("\n  ✅ ALL SANCTIONS TESTS PASSED\n");
  } catch (error) {
    console.error("\n  ❌ TEST FAILED:", (error as Error).message);
    process.exit(1);
  }
}

runSanctionsTests();
