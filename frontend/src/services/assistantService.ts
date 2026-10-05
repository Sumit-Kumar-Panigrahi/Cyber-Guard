import { apiRequest } from './api';

export interface SecurityAnalysisData {
  risk_score: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  threat_type: string;
  summary: string;
  indicators: string[];
  evidence: Record<string, any>;
  recommended_actions: string[];
  explanation_en: string;
  explanation_hi: string;
  predicted_next_step: string | null;
}

export interface AssistantChatResponse {
  reply: string;
  reply_en: string;
  reply_hi: string;
  intent: string;
  language_detected: string;
  is_security_threat: boolean;
  analysis: SecurityAnalysisData | null;
  sensitive_data_warning: string | null;
  speech_text_en: string;
  speech_text_hi: string;
  saved_event_id: string | null;
}

export interface SuggestionCategory {
  label: string;
  prompts: string[];
}

export interface SuggestionResponse {
  categories: SuggestionCategory[];
}

export const assistantService = {
  sendMessage: async (message: string, preferredLanguage = 'auto'): Promise<AssistantChatResponse> => {
    return apiRequest<AssistantChatResponse>('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        preferred_language: preferredLanguage,
      }),
    });
  },

  fetchSuggestions: async (): Promise<SuggestionResponse> => {
    return apiRequest<SuggestionResponse>('/assistant/suggestions');
  },
};
