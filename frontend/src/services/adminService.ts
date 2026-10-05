import { apiRequest } from './api';
import type {
  FleetOverview,
  FleetIncident,
  ProtectedIdentity,
  ThreatIntelItem,
  MitreTacticGroupItem,
  ModelEvaluationMetrics
} from '../types/admin';

export const adminService = {
  // Fetch National Fleet Overview & SOC Metrics
  fetchFleetOverview: async (): Promise<FleetOverview> => {
    return apiRequest<FleetOverview>('/admin/overview');
  },

  // Fetch full fleet incident queue
  fetchFleetIncidents: async (statusFilter?: string): Promise<FleetIncident[]> => {
    const query = statusFilter ? `?status_filter=${statusFilter}` : '';
    return apiRequest<FleetIncident[]>(`/admin/incidents${query}`);
  },

  // Execute SOC containment or triage action
  executeIncidentAction: async (
    incidentId: string,
    action: 'CONTAIN' | 'RESOLVE' | 'DISMISS' | 'ESCALATE',
    notes?: string
  ): Promise<{ success: boolean; message: string; status: string }> => {
    return apiRequest<{ success: boolean; message: string; status: string }>(
      `/admin/incidents/${incidentId}/action`,
      {
        method: 'POST',
        body: JSON.stringify({
          action,
          notes: notes || `SOC Commander approved action ${action}`,
        }),
      }
    );
  },

  // Fetch all protected identities
  fetchProtectedIdentities: async (): Promise<ProtectedIdentity[]> => {
    return apiRequest<ProtectedIdentity[]>('/admin/identities');
  },

  // Emergency 1-Click Identity Quarantine / Revocation
  quarantineIdentity: async (
    userId: string,
    action: 'QUARANTINE' | 'UNFREEZE' = 'QUARANTINE'
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(
      `/admin/identities/${userId}/quarantine?action=${action}`,
      {
        method: 'POST',
      }
    );
  },

  // Fetch Live Indian Threat Intel Feed
  fetchThreatIntel: async (): Promise<ThreatIntelItem[]> => {
    return apiRequest<ThreatIntelItem[]>('/admin/threat-intel');
  },

  // Fetch MITRE ATT&CK Matrix tailored for India Cybercrime
  fetchMitreMatrix: async (): Promise<MitreTacticGroupItem[]> => {
    return apiRequest<MitreTacticGroupItem[]>('/admin/mitre');
  },

  // Fetch empirical model evaluation benchmarks for all 5 AI engines
  fetchModelEvaluation: async (): Promise<ModelEvaluationMetrics> => {
    return apiRequest<ModelEvaluationMetrics>('/metrics/evaluation');
  },
};
