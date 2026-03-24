/** Economic Graph types. */

export interface GraphNode {
  node_id: string;
  node_type: string;
  label: string;
  current_state: string;
  impact_score: number;
  metadata: Record<string, unknown>;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  weight: number;
  propagation_delay_hours: number;
  description: string;
}

export interface PropagationStep {
  step: number;
  source_node: string;
  target_node: string;
  relation: string;
  impact_transmitted: number;
  resulting_state: string;
  explanation: string;
}

export interface GraphPropagationResult {
  event_id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  propagation_trace: PropagationStep[];
  total_steps: number;
  max_depth_reached: number;
  critical_path: string[];
  systemic_risk_score: number;
}
