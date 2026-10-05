export interface FleetOverview {
  total_identities: number;
  active_chains: number;
  critical_threats: number;
  contained_incidents: number;
  mttc_seconds: number;
  zero_trust_compliance_percent: number;
  mitre_coverage_percent: number;
  total_security_signals: number;
  recent_incidents: FleetIncident[];
  active_chains_summary: ActiveChainSummary[];
  geo_threat_hotspots: GeoThreatHotspot[];
}

export interface FleetIncident {
  id: string;
  chain_id: string;
  user_id: string;
  user_name: string;
  user_email?: string;
  chain_title: string;
  current_stage?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'NEW' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED';
  recommended_action: string;
  action_target: string;
  action_approved_by?: string | null;
  action_executed_at?: string | null;
  resolution_notes?: string | null;
  created_at: string;
}

export interface ActiveChainSummary {
  id: string;
  user_id: string;
  user_name: string;
  title: string;
  status: string;
  severity: string;
  human_risk: number;
  tech_risk: number;
  current_stage: string;
  predicted_next_stage: string;
  prediction_confidence: number;
  created_at: string;
}

export interface GeoThreatHotspot {
  region: string;
  threat_type: string;
  active_nodes: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  intercepted_rate: string;
  top_lure: string;
}

export interface ProtectedIdentity {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: 'NORMAL' | 'ELEVATED' | 'CRITICAL_ATTACK';
  active_chains_count: number;
  total_incidents_count: number;
  signals_count: number;
  sms_guard: boolean;
  call_guard: boolean;
  login_guard: boolean;
  identity_guard: boolean;
  created_at: string;
}

export interface ThreatIntelItem {
  id: string;
  indicator_type: 'DOMAIN' | 'PHONE' | 'IP' | 'APK_HASH' | 'SOCIAL_HANDLE';
  indicator_value: string;
  threat_actor_or_hub: string;
  target_institution: string;
  mitre_technique: string;
  confidence: number;
  status: 'ACTIVE' | 'SINKHOLED' | 'BLOCKED';
  first_detected: string;
  total_reports: number;
}

export interface MitreTechniqueItem {
  id: string;
  name: string;
  detected_count: number;
  status: string;
  description?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface MitreTacticGroupItem {
  tactic: string;
  tactic_id: string;
  description: string;
  techniques: MitreTechniqueItem[];
}

export interface EngineMetric {
  id: string;
  name: string;
  model_type: string;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  latency_ms: number;
  test_samples: number;
  false_positive_rate: number;
  key_features: string[];
}

export interface ModelEvaluationMetrics {
  benchmark_summary: {
    overall_accuracy: number;
    overall_f1: number;
    mean_inference_latency_ms: number;
    total_benchmark_samples: number;
    mitre_technique_coverage: number;
    mitre_coverage_percentage: number;
    test_dataset: string;
  };
  engines: EngineMetric[];
  mitre_matrix: {
    tactic: string;
    tactic_id: string;
    techniques: {
      id: string;
      name: string;
      detected_count: number;
      status: string;
    }[];
  }[];
}
