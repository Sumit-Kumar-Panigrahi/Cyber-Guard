import { apiRequest } from './api';
import type {
  AttackChainDetail,
  AttackStoryState,
  ContainmentResult
} from '../types/attackChain';

export const attackChainService = {
  // Fetch user's existing attack chains
  fetchChains: async (): Promise<AttackChainDetail[]> => {
    return apiRequest<AttackChainDetail[]>('/chains');
  },

  // Fetch active attack chain
  fetchActiveChain: async (): Promise<AttackChainDetail | null> => {
    try {
      return await apiRequest<AttackChainDetail | null>('/chains/active');
    } catch {
      return null;
    }
  },

  // Fetch full details of an attack chain
  fetchChainDetail: async (chainId: string): Promise<AttackChainDetail> => {
    return apiRequest<AttackChainDetail>(`/chains/${chainId}`);
  },

  // Trigger NetworkX DAG correlation over user's logged security events
  correlateEvents: async (): Promise<AttackChainDetail> => {
    return apiRequest<AttackChainDetail>('/chains/correlate', {
      method: 'POST',
    });
  },

  // Advance or jump to a specific step in the 15-step attack story
  getStoryStep: async (step: number): Promise<AttackStoryState> => {
    return apiRequest<AttackStoryState>(`/chains/simulate-story/step?step=${step}`, {
      method: 'POST',
    });
  },

  // Reset 15-step story back to step 1
  resetStory: async (): Promise<AttackStoryState> => {
    return apiRequest<AttackStoryState>('/chains/simulate-story/reset', {
      method: 'POST',
    });
  },

  // Execute 1-click active containment action
  containChain: async (chainId: string, notes?: string): Promise<ContainmentResult> => {
    return apiRequest<ContainmentResult>(`/chains/${chainId}/contain`, {
      method: 'POST',
      body: JSON.stringify({
        chain_id: chainId,
        action_type: 'REVOKE_SESSION_AND_BLOCK_ORIGIN',
        notes: notes || 'Immediate 1-click user authorized containment',
      }),
    });
  },
};
