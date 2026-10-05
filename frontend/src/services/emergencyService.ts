import { apiRequest } from './api';
import type {
  FIRRequest,
  FIRResponse,
  BankFreezeRequest,
  BankFreezeResponse,
  AdvisoryBotResponse,
  EmergencyHelpline,
} from '../types/emergency';

export const emergencyService = {
  // Fetch Indian Cybercrime Helplines
  fetchHelplines: async (): Promise<EmergencyHelpline[]> => {
    return apiRequest<EmergencyHelpline[]>('/emergency/helplines');
  },

  // Generate Formal Cyber Crime FIR Dossier
  generateFIR: async (payload: FIRRequest): Promise<FIRResponse> => {
    return apiRequest<FIRResponse>('/emergency/generate-fir', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Generate Bank Freeze & Transaction Reversal Notice
  generateBankFreeze: async (payload: BankFreezeRequest): Promise<BankFreezeResponse> => {
    return apiRequest<BankFreezeResponse>('/emergency/bank-freeze-notice', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Query Interactive Cyber Defense Advisory Bot ("Speaks the Warning")
  askAdvisoryBot: async (query: string, language: 'en' | 'hi' = 'en'): Promise<AdvisoryBotResponse> => {
    return apiRequest<AdvisoryBotResponse>('/emergency/advisory-bot', {
      method: 'POST',
      body: JSON.stringify({ query, language }),
    });
  },
};
