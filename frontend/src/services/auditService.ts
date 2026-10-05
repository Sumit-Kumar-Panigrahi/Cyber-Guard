import { apiRequest } from './api';
import type {
  DeviceAuditItem,
  AuditTrailBlock,
  AuditVerificationResult,
  IncidentRecord,
  Section65BCertificate,
} from '../types/audit';

export const auditService = {
  // Fetch active and logged devices
  fetchDevices: async (): Promise<DeviceAuditItem[]> => {
    return apiRequest<DeviceAuditItem[]>('/audit/devices');
  },

  // Terminate / revoke a device session
  revokeDeviceSession: async (deviceId: string): Promise<{ status: string; message: string }> => {
    return apiRequest<{ status: string; message: string }>(`/audit/devices/${deviceId}/revoke`, {
      method: 'POST',
    });
  },

  // Toggle trusted status
  toggleDeviceTrust: async (deviceId: string): Promise<any> => {
    return apiRequest<any>(`/audit/devices/${deviceId}/trust`, {
      method: 'POST',
    });
  },

  // Simulate an unauthorized rogue login attempt to demo remote containment
  simulateRogueDevice: async (): Promise<DeviceAuditItem> => {
    return apiRequest<DeviceAuditItem>('/audit/devices/simulate-rogue', {
      method: 'POST',
    });
  },

  // Fetch SHA-256 cryptographic audit trail
  fetchAuditTrail: async (): Promise<AuditTrailBlock[]> => {
    return apiRequest<AuditTrailBlock[]>('/audit/trail');
  },

  // Verify hash chain integrity
  verifyAuditIntegrity: async (): Promise<AuditVerificationResult> => {
    return apiRequest<AuditVerificationResult>('/audit/verify');
  },

  // Export Section 65B electronic certificate
  exportCertificate: async (): Promise<Section65BCertificate> => {
    return apiRequest<Section65BCertificate>('/audit/export-certificate', {
      method: 'POST',
    });
  },

  // Fetch incident containment records
  fetchIncidents: async (): Promise<IncidentRecord[]> => {
    return apiRequest<IncidentRecord[]>('/audit/incidents');
  },
};
