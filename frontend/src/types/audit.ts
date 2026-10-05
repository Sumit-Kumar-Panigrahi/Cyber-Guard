export interface DeviceAuditItem {
  id: string;
  device_name: string;
  device_fingerprint: string;
  ip_address: string;
  geo_location: string;
  browser_agent: string;
  is_trusted: boolean;
  logged_in_at: string;
}

export interface AuditTrailBlock {
  block_id: string;
  event_id: string;
  event_type: string;
  timestamp: string;
  user_id: string;
  payload_summary: string;
  payload_hash: string;
  prev_hash: string;
  block_hash: string;
  is_tampered: boolean;
}

export interface AuditVerificationResult {
  is_valid: boolean;
  total_blocks: number;
  verified_at: string;
  merkle_root: string;
  status: string;
  message: string;
}

export interface IncidentRecord {
  id: string;
  chain_id: string;
  status: string;
  recommended_action: string;
  action_target: string;
  action_approved_by?: string;
  action_executed_at?: string;
  resolution_notes?: string;
  created_at: string;
}

export interface Section65BCertificate {
  certificate_title: string;
  compliance_standards: string[];
  issued_to: {
    citizen_name: string;
    email: string;
    jurisdiction: string;
    telemetry_origin: string;
  };
  evidence_metadata: {
    generated_at: string;
    total_tamper_proof_blocks: number;
    total_contained_incidents: number;
    merkle_root_hash: string;
    integrity_status: string;
  };
  summary_of_threats_neutralized: any[];
  forensic_hash_chain: AuditTrailBlock[];
  legal_declaration: string;
  signature_hash: string;
}
