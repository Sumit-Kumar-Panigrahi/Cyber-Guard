export interface AttackChainNode {
  id: string;
  title: string;
  source: string;
  category: string;
  stage: string;
  risk_score: number;
  confidence: number;
  timestamp: string;
  mitre_technique_id?: string;
  mitre_technique_name?: string;
  mitre_tactic?: string;
  indicators: string[];
  evidence: Record<string, any>;
  is_predicted: boolean;
  is_contained: boolean;
  position: { x: number; y: number };
}

export interface AttackChainEdge {
  id: string;
  source: string;
  target: string;
  relation_type: string;
  confidence: number;
  is_predicted: boolean;
}

export interface MarkovPrediction {
  current_stage: string;
  predicted_next_stage: string;
  confidence: floatNumber;
  threat_window: string;
  stage_probabilities: Record<string, number>;
  recommended_mitigation: string;
  mitre_prediction_id?: string;
  mitre_prediction_name?: string;
}

type floatNumber = number;

export interface AttackStoryStep {
  step_number: number;
  total_steps: number;
  title: string;
  stage: string;
  severity: string;
  summary_en: string;
  summary_hi: string;
  attacker_action: string;
  victim_impact: string;
  mitre_id: string;
  mitre_technique: string;
  mitre_tactic: string;
  speech_text_en: string;
  speech_text_hi: string;
  human_risk_score: number;
  tech_risk_score: number;
  node_id: string;
  source: string;
}

export interface AttackStoryState {
  current_step: number;
  total_steps: number;
  is_completed: boolean;
  step_detail: AttackStoryStep;
  nodes: AttackChainNode[];
  edges: AttackChainEdge[];
  prediction: MarkovPrediction;
  overall_human_risk: number;
  overall_tech_risk: number;
  status: string;
  explanation_en: string;
  explanation_hi: string;
}

export interface AttackChainDetail {
  id: string;
  user_id: string;
  title: string;
  status: string;
  severity: string;
  human_risk_score: number;
  tech_risk_score: number;
  current_stage: string;
  predicted_next_stage: string;
  prediction_confidence: number;
  explanation_en: string;
  explanation_hi: string;
  nodes: AttackChainNode[];
  edges: AttackChainEdge[];
  prediction?: MarkovPrediction;
  created_at: string;
  updated_at: string;
}

export interface ContainmentResult {
  chain_id: string;
  incident_id: string;
  status: string;
  actions_taken: string[];
  executed_at: string;
  message: string;
}
