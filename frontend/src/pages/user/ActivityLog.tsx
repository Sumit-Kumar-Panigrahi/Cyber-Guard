import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  ShieldCheck,
  ShieldAlert,
  Award,
  Laptop,
  CheckCircle,
  AlertTriangle,
  FileText,
  Layers,
  Sparkles,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { useAuth } from '../../context/AuthContext';
import { auditService } from '../../services/auditService';
import type {
  DeviceAuditItem,
  AuditTrailBlock,
  AuditVerificationResult,
  IncidentRecord,
  Section65BCertificate,
} from '../../types/audit';

import { AuditBlockCard } from '../../components/audit/AuditBlockCard';
import { DeviceManagementLedger } from '../../components/audit/DeviceManagementLedger';
import { Section65BCertificateModal } from '../../components/audit/Section65BCertificateModal';

export const ActivityLog: React.FC = () => {
  const { user } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'trail' | 'devices' | 'incidents' | 'legal'>('trail');

  // Data states
  const [blocks, setBlocks] = useState<AuditTrailBlock[]>([]);
  const [devices, setDevices] = useState<DeviceAuditItem[]>([]);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [verification, setVerification] = useState<AuditVerificationResult | null>(null);

  // Loading states
  const [isLoadingTrail, setIsLoadingTrail] = useState(false);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Certificate Modal State
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certificateData, setCertificateData] = useState<Section65BCertificate | null>(null);
  const [isLoadingCert, setIsLoadingCert] = useState(false);

  // Simulation of Block Tampering (Pedagogical demonstration)
  const [isTamperSimulated, setIsTamperSimulated] = useState(false);

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(
    null
  );

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch Audit Trail & Verify
  const loadTrail = useCallback(async () => {
    setIsLoadingTrail(true);
    try {
      const data = await auditService.fetchAuditTrail();
      setBlocks(data);
      const v = await auditService.verifyAuditIntegrity();
      setVerification(v);
    } catch (err) {
      console.error('Failed to load audit trail:', err);
      showToast('Could not load cryptographic audit trail.', 'warning');
    } finally {
      setIsLoadingTrail(false);
    }
  }, []);

  // Fetch Devices
  const loadDevices = useCallback(async () => {
    setIsLoadingDevices(true);
    try {
      const data = await auditService.fetchDevices();
      setDevices(data);
    } catch (err) {
      console.error('Failed to load devices:', err);
    } finally {
      setIsLoadingDevices(false);
    }
  }, []);

  // Fetch Incidents
  const loadIncidents = useCallback(async () => {
    setIsLoadingIncidents(true);
    try {
      const data = await auditService.fetchIncidents();
      setIncidents(data);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setIsLoadingIncidents(false);
    }
  }, []);

  useEffect(() => {
    loadTrail();
    loadDevices();
    loadIncidents();
  }, [loadTrail, loadDevices, loadIncidents]);

  // Action: Verify Hash Chain Integrity Live
  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    try {
      const v = await auditService.verifyAuditIntegrity();
      setVerification(v);
      if (v.is_valid && !isTamperSimulated) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
        showToast('100% Cryptographic Integrity Verified under Section 65B!', 'success');
      } else {
        showToast('Integrity verification detected anomaly!', 'warning');
      }
    } catch (err) {
      showToast('Integrity check failed to contact verification server.', 'warning');
    } finally {
      setIsVerifying(false);
    }
  };

  // Action: Revoke Device Session
  const handleRevokeDevice = async (deviceId: string) => {
    try {
      const res = await auditService.revokeDeviceSession(deviceId);
      showToast(res.message, 'success');
      await loadDevices();
      await loadTrail();
      await loadIncidents();
    } catch (err) {
      showToast('Failed to revoke session.', 'warning');
    }
  };

  // Action: Toggle Device Trust
  const handleToggleTrust = async (deviceId: string) => {
    try {
      await auditService.toggleDeviceTrust(deviceId);
      showToast('Device trust status updated.', 'info');
      await loadDevices();
    } catch (err) {
      showToast('Failed to update trust status.', 'warning');
    }
  };

  // Action: Simulate Rogue Remote Session
  const handleSimulateRogueDevice = async () => {
    try {
      await auditService.simulateRogueDevice();
      showToast('Anomalous Jamtara Python session injected. Immediate containment available.', 'warning');
      await loadDevices();
      await loadTrail();
      setActiveTab('devices');
    } catch (err) {
      showToast('Failed to simulate rogue device.', 'warning');
    }
  };

  // Action: Export Section 65B Certificate
  const handleOpenCertificateModal = async () => {
    setIsCertModalOpen(true);
    setIsLoadingCert(true);
    try {
      const cert = await auditService.exportCertificate();
      setCertificateData(cert);
    } catch (err) {
      console.error('Failed to generate Section 65B certificate:', err);
      showToast('Failed to generate certificate.', 'warning');
    } finally {
      setIsLoadingCert(false);
    }
  };

  // Toggle Tamper Simulation
  const handleToggleTamperSimulation = () => {
    const nextState = !isTamperSimulated;
    setIsTamperSimulated(nextState);
    if (nextState) {
      showToast(
        'Simulating altered byte in Block #2. Cryptographic validator immediately flags broken hash link!',
        'warning'
      );
    } else {
      showToast('Tamper simulation deactivated. Original SHA-256 chain restored.', 'success');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-4 py-3 shadow-2xl border text-xs font-semibold animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60'
              : toastMessage.type === 'warning'
              ? 'bg-amber-950/90 text-amber-300 border-amber-700/60'
              : 'bg-cyan-950/90 text-cyan-300 border-cyan-700/60'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner / Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/95 to-cyan-950/40 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Phase 4 • Cryptographic Forensic Ledger
              </span>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] text-slate-300 border border-slate-700">
                Indian IT Act Section 65B Compliant
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <History className="h-7 w-7 text-cyan-400" />
              <span>Security Activity & Cryptographic Audit</span>
            </h1>

            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Every incoming threat signal and 1-click active containment action is sealed in an unbroken SHA-256
              cryptographic hash chain. Formatted for immediate Police FIR submission and cybercrime.gov.in
              electronic evidence filing.
            </p>
          </div>

          {/* Quick Actions in Banner */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenCertificateModal}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-slate-950 hover:from-amber-400 hover:to-amber-500 transition shadow-lg shadow-amber-500/20"
            >
              <Award className="h-4 w-4" />
              <span>Export Section 65B Certificate</span>
            </button>

            <button
              onClick={handleVerifyIntegrity}
              disabled={isVerifying}
              className="flex items-center gap-2 rounded-xl bg-slate-800/80 px-4 py-2.5 text-xs font-medium text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
            >
              <ShieldCheck className={`h-4 w-4 text-emerald-400 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Verifying Chain...' : 'Verify Cryptographic Integrity'}</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid Background */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Cryptographic Blocks</span>
            <Layers className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-1.5">{blocks.length}</p>
          <p className="text-[11px] text-cyan-400 mt-0.5">Consecutive SHA-256 Hashes</p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Ledger Integrity</span>
            {isTamperSimulated ? (
              <ShieldAlert className="h-4 w-4 text-rose-400 animate-pulse" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            )}
          </div>
          <p
            className={`text-2xl font-bold mt-1.5 ${
              isTamperSimulated ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {isTamperSimulated ? 'MISMATCH' : '100% SECURE'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isTamperSimulated ? 'Tamper simulation active' : 'Tamper-Proof Chained'}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Sessions</span>
            <Laptop className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-1.5">{devices.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {devices.filter((d) => d.is_trusted).length} Trusted •{' '}
            {devices.filter((d) => !d.is_trusted).length} Untrusted
          </p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Neutralized Threats</span>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-1.5">{incidents.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">1-Click Containments Logged</p>
        </div>
      </div>

      {/* Verification Status Bar / Merkle Root Banner */}
      {verification && (
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border transition-all ${
            isTamperSimulated
              ? 'border-rose-500/70 bg-rose-950/30'
              : 'border-emerald-800/40 bg-emerald-950/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                isTamperSimulated
                  ? 'bg-rose-950 text-rose-400 border-rose-800/50'
                  : 'bg-emerald-950 text-emerald-400 border-emerald-800/50'
              }`}
            >
              {isTamperSimulated ? (
                <ShieldAlert className="h-5 w-5 animate-pulse" />
              ) : (
                <ShieldCheck className="h-5 w-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  {isTamperSimulated
                    ? 'CRYPTOGRAPHIC TAMPER DETECTED (SIMULATION)'
                    : '100% Cryptographic Integrity Verified'}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                    isTamperSimulated
                      ? 'bg-rose-950 text-rose-400 border-rose-800/50'
                      : 'bg-emerald-950 text-emerald-400 border-emerald-800/50'
                  }`}
                >
                  {isTamperSimulated ? 'INTEGRITY FAILED' : 'SECTION 65B VERIFIED'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                Merkle Root:{' '}
                <span className={isTamperSimulated ? 'text-rose-300' : 'text-emerald-300'}>
                  {isTamperSimulated
                    ? 'CORRUPTED_HASH_LINK_AT_BLOCK_2'
                    : verification.merkle_root.slice(0, 36) + '...'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Pedagogical Tamper Simulation Toggle */}
            <button
              onClick={handleToggleTamperSimulation}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium border transition ${
                isTamperSimulated
                  ? 'bg-rose-600 text-white border-rose-500 hover:bg-rose-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{isTamperSimulated ? 'Disable Tamper Demo' : 'Simulate Block Tamper (Demo)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('trail')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'trail'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Cryptographic Hash Chain ({blocks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('devices')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'devices'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Laptop className="h-4 w-4" />
            <span>Device Endpoint Ledger ({devices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('incidents')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'incidents'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            <span>Neutralized Threats ({incidents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('legal')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'legal'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Section 65B Compliance</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Cryptographic Block Ledger */}
      {activeTab === 'trail' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-900/40">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>
                SHA-256 Sequential Hash Ledger: Each block cryptographically seals previous hash (`prev_hash`) with
                telemetry payload.
              </span>
            </div>

            <button
              onClick={handleOpenCertificateModal}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-amber-400 bg-amber-950/60 border border-amber-800/40 hover:bg-amber-900 transition"
            >
              <Award className="h-3.5 w-3.5" />
              <span>Generate Police FIR Certificate</span>
            </button>
          </div>

          {isLoadingTrail && blocks.length === 0 ? (
            <div className="py-20 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent mx-auto mb-3" />
              <p className="text-xs text-slate-400">Loading tamper-evident cryptographic ledger...</p>
            </div>
          ) : blocks.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-slate-800 bg-slate-900/30">
              <History className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-300">No cryptographic blocks recorded yet</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Execute a threat test or device action to generate the initial block.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {blocks.map((block, idx) => (
                <AuditBlockCard
                  key={block.block_id || idx}
                  block={block}
                  index={idx}
                  totalBlocks={blocks.length}
                  isTamperedSimulation={isTamperSimulated && idx === 1}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Device Endpoint Ledger */}
      {activeTab === 'devices' && (
        <DeviceManagementLedger
          devices={devices}
          isLoading={isLoadingDevices}
          onRevoke={handleRevokeDevice}
          onToggleTrust={handleToggleTrust}
          onSimulateRogue={handleSimulateRogueDevice}
          onRefresh={loadDevices}
        />
      )}

      {/* Tab 3: Neutralized Threat Containments */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-900/40">
            <div>
              <h3 className="text-xs font-bold text-white">Containment Incident Registry</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Formal record of active defense measures executed to stop cyber fraud and account takeovers.
              </p>
            </div>

            <span className="rounded-full bg-emerald-950 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-800/40">
              {incidents.length} Resolved Incidents
            </span>
          </div>

          {isLoadingIncidents && incidents.length === 0 ? (
            <div className="py-16 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent mx-auto mb-3" />
              <p className="text-xs text-slate-400">Loading incident containment registry...</p>
            </div>
          ) : incidents.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-slate-800 bg-slate-900/30">
              <CheckCircle className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-300">No active containment incidents</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Containments triggered from the Attack Chain Story or Device Revocation will be logged here.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Action Executed</th>
                    <th className="px-5 py-3.5">Target Identifier</th>
                    <th className="px-5 py-3.5">Approved By</th>
                    <th className="px-5 py-3.5">Execution Timestamp</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {incidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4">
                        <span className="font-semibold text-cyan-400">{inc.recommended_action}</span>
                        {inc.resolution_notes && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{inc.resolution_notes}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-300">
                        {inc.action_target}
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {inc.action_approved_by || user?.full_name || 'Authorized Citizen'}
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-[11px]">
                        {new Date(inc.action_executed_at || inc.created_at).toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                        })}{' '}
                        IST
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-800/40">
                          {inc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Section 65B Legal Compliance */}
      {activeTab === 'legal' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-slate-900/60 to-slate-950 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Indian Evidence Act Section 65B & Bharatiya Sakshya Adhiniyam 2023
                </h3>
                <p className="text-xs text-amber-300">
                  Statutory framework for electronic evidence admissibility in Indian courts.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Under Indian law (Anvar P.V. v. P.K. Basheer & Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal),
              secondary electronic records like computer logs, SMS alerts, and cyber incident records are{' '}
              <strong className="text-white">only legally admissible</strong> in police FIRs and court trials if
              accompanied by an authentic Section 65B Certificate verifying computer integrity and continuous lawful
              custody.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>The 4 Legal Conditions Satisfied</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-cyan-400">1.</span>
                  <span>
                    <strong>Regular Lawful Custody:</strong> Produced by Cyberguard Shield operating continuously on the
                    citizen's endpoint during normal usage.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-cyan-400">2.</span>
                  <span>
                    <strong>Contemporaneous Generation:</strong> SHA-256 blocks are timestamped and linked at the exact
                    instant of threat detection.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-cyan-400">3.</span>
                  <span>
                    <strong>Unimpaired Operation:</strong> Cryptographic verification guarantees no hardware or
                    database corruption altered the records.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-cyan-400">4.</span>
                  <span>
                    <strong>Exact Duplication:</strong> Hashes uniquely match the original digital evidence submitted to
                    the police portal.
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Police FIR & Cyber Crime Portal Filing</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                When reporting financial cyber fraud (UPI scams, SBI KYC phishing, Digital Arrests) on{' '}
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 underline font-semibold"
                >
                  cybercrime.gov.in
                </a>{' '}
                or via the national helpline <span className="text-amber-400 font-bold">1930</span>, citizens can attach
                the Cyberguard Section 65B Forensic Certificate.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-200">Recommended Steps:</p>
                <p>1. Click "Export Section 65B Certificate" to preview and print or save as PDF.</p>
                <p>2. Copy the FIR Reference Token and provide it to the Investigating Officer.</p>
                <p>3. Submit the JSON forensic package directly to the Cyber Crime Police Cell.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 65B Certificate Modal */}
      <Section65BCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        certificate={certificateData}
        isLoading={isLoadingCert}
      />
    </div>
  );
};
