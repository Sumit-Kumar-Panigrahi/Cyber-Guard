export interface ConsentSettings {
  user_id: string;
  messages_enabled: boolean;
  email_enabled: boolean;
  browser_protection_enabled: boolean;
  social_share_enabled: boolean;
  call_guard_enabled: boolean;
  identity_monitoring_enabled: boolean;
  login_security_enabled: boolean;
  raw_storage_prohibited: boolean;
  opt_in_face_embedding: boolean;
  updated_at: string;
}

export interface ConsentUpdatePayload {
  messages_enabled?: boolean;
  email_enabled?: boolean;
  browser_protection_enabled?: boolean;
  social_share_enabled?: boolean;
  call_guard_enabled?: boolean;
  identity_monitoring_enabled?: boolean;
  login_security_enabled?: boolean;
  opt_in_face_embedding?: boolean;
}

export interface ConsentContextType {
  consent: ConsentSettings | null;
  isLoading: boolean;
  updateToggle: (key: keyof ConsentUpdatePayload, value: boolean) => Promise<void>;
  purgeFaceData: () => Promise<void>;
  reloadConsent: () => Promise<void>;
}
