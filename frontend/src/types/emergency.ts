export interface FIRRequest {
  incident_type: string;
  suspect_phone?: string;
  suspect_upi?: string;
  suspect_url?: string;
  loss_amount_inr?: number;
  bank_name?: string;
  account_last4?: string;
  narrative?: string;
}

export interface FIRResponse {
  fir_reference_id: string;
  timestamp: string;
  statutory_sections: string[];
  cybercrime_portal_url: string;
  helpline_number: string;
  complainant_name: string;
  suspect_profile: {
    phone?: string;
    upi_id?: string;
    phishing_url?: string;
    suspected_hub?: string;
  };
  evidence_bundle: {
    sha256_hash: string;
    recorded_timestamp: string;
    audit_ledger_status: string;
  };
  formal_complaint_letter: string;
}

export interface BankFreezeRequest {
  bank_name: string;
  account_number?: string;
  ifsc_code?: string;
  suspect_mule_account?: string;
  suspect_upi_id?: string;
  disputed_amount: number;
  transaction_ref?: string;
}

export interface BankFreezeResponse {
  notice_id: string;
  generated_at: string;
  urgent_bank_email: string;
  sms_freeze_code: string;
  bank_nodal_officer: string;
  formal_notice_text: string;
}

export interface AdvisoryBotResponse {
  answer_en: string;
  answer_hi: string;
  speech_text_en: string;
  speech_text_hi: string;
  urgency_level: 'CRITICAL' | 'WARNING' | 'ADVISORY';
  immediate_actions: string[];
  helpline_actions: string[];
}

export interface EmergencyHelpline {
  agency: string;
  number: string;
  description: string;
  portal: string;
  jurisdiction: string;
}
