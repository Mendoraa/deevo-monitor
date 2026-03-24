"use client";

interface Props {
  chain: string[];
}

export default function CausalChainPanel({ chain }: Props) {
  return (
    <div className="panel">
      <h3 className="text-xs font-semibold text-cortex-muted uppercase tracking-wider mb-3">
        Causal Chain
      </h3>
      <p className="text-xs text-cortex-muted mb-3">
        Step-by-step economic propagation path
      </p>
      <div className="space-y-0">
        {chain.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            {/* Vertical line connector */}
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                ${i === 0
                  ? "bg-cortex-accent text-white"
                  : i === chain.length - 1
                    ? "bg-cortex-green/20 text-cortex-green"
                    : "bg-cortex-border text-cortex-muted"
                }`}>
                {i + 1}
              </div>
              {i < chain.length - 1 && (
                <div className="w-px h-6 bg-cortex-border" />
              )}
            </div>
            <p className={`text-sm pt-0.5 pb-3 ${i === 0 ? "text-white font-medium" : "text-cortex-text"}`}>
              {step}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
