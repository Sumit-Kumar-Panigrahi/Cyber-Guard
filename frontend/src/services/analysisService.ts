import { apiRequest } from './api';

export interface AnalysisResult {
  source: string;
  category: string;
  verdict: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL_THREAT';
  risk_score: number;
  confidence: number;
  indicators: string[];
  evidence: Record<string, any>;
  mitre?: {
    technique_id: string;
    technique_name: string;
    tactic: string;
  };
  explanation_en: string;
  explanation_hi: string;
  recommended_action: string;
  saved_event_id?: string;
  language_detected?: string;
}

export interface SecurityEventItem {
  id: string;
  user_id: string;
  timestamp: string;
  source: string;
  category: string;
  risk_score: number;
  confidence: number;
  indicators: string[];
  evidence: Record<string, any>;
  mitre_technique_id?: string;
  mitre_technique_name?: string;
  mitre_tactic?: string;
  is_simulated: boolean;
}

export const analysisService = {
  analyzeMessage: async (text: string, senderId?: string): Promise<AnalysisResult> => {
    return apiRequest<AnalysisResult>('/analyze/message', {
      method: 'POST',
      body: JSON.stringify({ text, sender_id: senderId || 'Unknown' }),
    });
  },

  analyzeURL: async (url: string): Promise<AnalysisResult> => {
    return apiRequest<AnalysisResult>('/analyze/url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },

  analyzeCall: async (transcript: string, callerId?: string): Promise<AnalysisResult> => {
    return apiRequest<AnalysisResult>('/analyze/call', {
      method: 'POST',
      body: JSON.stringify({ transcript, caller_id: callerId || '+91 9876543210' }),
    });
  },

  analyzeSocialShare: async (content: string, link?: string, platform = 'WhatsApp'): Promise<AnalysisResult> => {
    return apiRequest<AnalysisResult>('/analyze/social-share', {
      method: 'POST',
      body: JSON.stringify({ platform, content, link }),
    });
  },

  analyzeMedia: async (filename: string, isSynthetic = false): Promise<AnalysisResult> => {
    return apiRequest<AnalysisResult>('/analyze/media', {
      method: 'POST',
      body: JSON.stringify({
        filename,
        file_size_bytes: 48000,
        content_type: 'image/jpeg',
        is_synthetic_marker: isSynthetic,
      }),
    });
  },

  fetchSecurityEvents: async (limit = 20): Promise<SecurityEventItem[]> => {
    return apiRequest<SecurityEventItem[]>(`/analyze/events?limit=${limit}`);
  },
};
