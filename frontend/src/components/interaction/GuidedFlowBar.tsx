"use client";

import { Check, ChevronRight } from "lucide-react";

/**
 * GuidedFlowBar — Step-by-step thinking flow.
 * Guides: Event → Economic → GCC → Insurance → Decision
 * User always knows where they are in the reasoning process.
 */

export type FlowStep = "event" | "economic" | "gcc" | "insurance" | "decision";

interface GuidedFlowBarProps {
  currentStep: FlowStep;
  completedSteps: FlowStep[];
  onStepClick: (step: FlowStep) => void;
}

const STEPS: { key: FlowStep; label: string; num: string }[] = [
  { key: "event", label: "Event", num: "01" },
  { key: "economic", label: "Economic Impact", num: "02" },
  { key: "gcc", label: "GCC Impact", num: "03" },
  { key: "insurance", label: "Insurance Risk", num: "04" },
  { key: "decision", label: "Decision", num: "05" },
];

export default function GuidedFlowBar({
  currentStep,
  completedSteps,
  onStepClick,
}: GuidedFlowBarProps) {
  return (
    <div className="guided-flow-bar">
      <div className="flex items-center gap-1">
        <span className="text-[9px] uppercase tracking-widest text-neutral-600 font-semibold mr-3">
          Reasoning Flow
        </span>

        {STEPS.map((step, i) => {
          const isCurrent = currentStep === step.key;
          const isCompleted = completedSteps.includes(step.key);
          const isLast = i === STEPS.length - 1;

          return (
            <div key={step.key} className="flex items-center">
              <button
                onClick={() => onStepClick(step.key)}
                className={`flow-step ${
                  isCurrent
                    ? "flow-step-active"
                    : isCompleted
                    ? "flow-step-completed"
                    : "flow-step-pending"
                }`}
              >
                <span className="flow-step-num">
                  {isCompleted && !isCurrent ? (
                    <Check className="w-2.5 h-2.5" />
                  ) : (
                    step.num
                  )}
                </span>
                <span className="text-[10px]">{step.label}</span>
              </button>
              {!isLast && (
                <ChevronRight className="w-3 h-3 text-neutral-700 mx-0.5 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
