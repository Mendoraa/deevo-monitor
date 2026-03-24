/**
 * Test: Refinery Attack Scenario
 * Focuses on energy supply + insurance + inflation propagation.
 */

import { bindSignalToEvent } from "../engine/signal-binding";
import { buildGCCGraph, runEventPropagation } from "../engine/propagation";
import { runScenario, runFromSignal } from "../engine/scenario-runner";
import { validateBundle } from "../outputs/decision-bundle";
import { validateExplanation } from "../outputs/explanation-bundle";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
}

function testSignalBinding(): void {
  console.log("  ▸ Signal Binding...");

  const event = bindSignalToEvent({
    title: "Drone strike on Ras Tanura oil facility confirmed",
    description: "Abqaiq-style attack on major export terminal. Reuters confirmed.",
    source: "Bloomberg",
    region: "GCC",
  });

  assert(event.eventClass === "refinery_attack", `Expected refinery_attack, got ${event.eventClass}`);
  assert(event.category === "energy_supply", `Expected energy_supply, got ${event.category}`);
  assert(event.severity >= 0.7, `Severity should be ≥0.7, got ${event.severity}`);

  console.log(`    ✓ Class: ${event.eventClass}, Severity: ${event.severity}`);
}

function testPropagation(): void {
  console.log("  ▸ Graph Propagation...");

  const graph = buildGCCGraph();
  const result = runEventPropagation(
    { eventClass: "refinery_attack", severity: 0.80 },
    graph
  );

  assert(result.totalSteps > 5, `Should have >5 steps, got ${result.totalSteps}`);

  // Ras Tanura and crude oil should be heavily impacted
  const rasTanura = result.impactedNodes.find((n) => n.id === "ras_tanura");
  assert(!!rasTanura, "Ras Tanura should be impacted");

  const oil = result.impactedNodes.find((n) => n.id === "crude_oil");
  assert(!!oil, "Crude oil should be impacted");

  // Energy insurance should be hit
  const energyIns = result.impactedNodes.find((n) => n.id === "energy_insurance");
  assert(!!energyIns, "Energy insurance should be impacted");

  console.log(`    ✓ ${result.totalSteps} steps, ${result.impactedNodes.length} nodes`);
  console.log(`    ✓ Systemic risk: ${(result.systemicRiskScore * 100).toFixed(1)}%`);
}

function testFullPipeline(): void {
  console.log("  ▸ Full Pipeline...");

  const result = runFromSignal({
    title: "Major refinery attack at Ras Tanura confirmed by official statement",
    description: "Multiple fires, production halted. Oil supply severely constrained.",
    source: "Reuters",
    region: "GCC",
  });

  const bv = validateBundle(result.bundle);
  assert(bv.valid, `Bundle invalid: ${bv.errors.join(", ")}`);

  const ev = validateExplanation(result.explanation);
  assert(ev.valid, `Explanation invalid: missing ${ev.missing.join(", ")}`);

  // Saudi should have high severity (oil producer)
  const saudi = result.gccImpacts.saudi;
  assert(saudi.severity > 30, `Saudi severity should be >30, got ${saudi.severity}`);

  // Insurance should be elevated
  assert(
    result.insuranceOverlay.overallRiskLevel !== "low",
    `Insurance risk should be elevated, got ${result.insuranceOverlay.overallRiskLevel}`
  );

  console.log(`    ✓ Bundle valid (${result.bundle.auditHash})`);
  console.log(`    ✓ Insurance: ${result.insuranceOverlay.overallRiskLevel}`);
  console.log(`    ✓ Saudi severity: ${saudi.severity}/100`);
}

export function runRefineryTests(): void {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║  REFINERY ATTACK — Phase 2 Test Suite            ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  try {
    testSignalBinding();
    testPropagation();
    testFullPipeline();

    console.log("\n  ✅ ALL REFINERY TESTS PASSED\n");
  } catch (error) {
    console.error("\n  ❌ TEST FAILED:", (error as Error).message);
    process.exit(1);
  }
}

runRefineryTests();
