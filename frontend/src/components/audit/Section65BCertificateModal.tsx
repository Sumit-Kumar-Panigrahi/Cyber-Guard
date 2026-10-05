import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Award,
  Hash,
  FileText,
  Lock,
  ExternalLink,
} from 'lucide-react';
import type { Section65BCertificate } from '../../types/audit';

interface Section65BCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: Section65BCertificate | null;
  isLoading: boolean;
}

export const Section65BCertificateModal: React.FC<Section65BCertificateModalProps> = ({
  isOpen,
  onClose,
  certificate,
  isLoading,
}) => {
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    if (!certificate) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(certificate, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `Section65B_Forensic_Certificate_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyToken = () => {
    if (!certificate) return;
    const token = `CYBERGUARD-SEC65B-${certificate.signature_hash.slice(0, 16).toUpperCase()}-${certificate.evidence_metadata.merkle_root_hash.slice(0, 8).toUpperCase()}`;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const handleCopySignature = () => {
    if (!certificate) return;
    navigator.clipboard.writeText(certificate.signature_hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl shadow-cyan-950/40 overflow-hidden text-slate-100">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  Indian Evidence Act Section 65B
                </span>
                <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-800/40">
                  LEGAL ADMISSIBILITY SEAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official electronic record certificate formatted for Police FIR & cybercrime.gov.in
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={isLoading || !certificate}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadJson}
              disabled={isLoading || !certificate}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-950/80 px-3 py-1.5 text-xs font-medium text-cyan-400 border border-cyan-800/40 hover:bg-cyan-900 transition disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>JSON Bundle</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 print:bg-white print:text-black">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Computing SHA-256 Merkle Root & Generating Section 65B Seal...
              </p>
            </div>
          ) : !certificate ? (
            <div className="py-16 text-center text-slate-400">
              <p>Failed to generate Section 65B certificate.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Certificate Letterhead Style */}
              <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/5 via-slate-900/60 to-slate-950 p-6 sm:p-8 space-y-6">
                {/* Government / Platform Crest Header */}
                <div className="text-center space-y-2 border-b border-slate-800/80 pb-6">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-wide text-white font-serif uppercase">
                    {certificate.certificate_title}
                  </h2>
                  <p className="text-xs text-amber-300 font-medium tracking-wide">
                    Read with Section 63 of Bharatiya Sakshya Adhiniyam, 2023 & Section 79A IT Act 2000
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 pt-1 text-[11px] text-slate-400">
                    <span className="rounded-md bg-slate-800/80 px-2.5 py-0.5 border border-slate-700">
                      Jurisdiction: {certificate.issued_to.jurisdiction}
                    </span>
                    <span className="rounded-md bg-slate-800/80 px-2.5 py-0.5 border border-slate-700">
                      Authority: {certificate.issued_to.telemetry_origin}
                    </span>
                    <span className="rounded-md bg-emerald-950/80 text-emerald-400 px-2.5 py-0.5 border border-emerald-800/50">
                      Status: {certificate.evidence_metadata.integrity_status}
                    </span>
                  </div>
                </div>

                {/* Section 1: Subject Citizen & Telemetry Provenance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                    <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                      Part A: Citizen Particulars
                    </p>
                    <div className="space-y-1">
                      <p className="text-slate-400">
                        Citizen Name:{' '}
                        <span className="font-semibold text-white">{certificate.issued_to.citizen_name}</span>
                      </p>
                      <p className="text-slate-400">
                        Registered Identity:{' '}
                        <span className="font-mono text-slate-300">{certificate.issued_to.email}</span>
                      </p>
                      <p className="text-slate-400">
                        Platform Origin:{' '}
                        <span className="text-slate-300">{certificate.issued_to.telemetry_origin}</span>
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                    <p className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                      Part B: Cryptographic Provenance
                    </p>
                    <div className="space-y-1">
                      <p className="text-slate-400">
                        Timestamp (UTC/IST):{' '}
                        <span className="font-mono text-slate-300">{certificate.evidence_metadata.generated_at}</span>
                      </p>
                      <p className="text-slate-400">
                        Verified Blocks in Chain:{' '}
                        <span className="font-semibold text-emerald-400">
                          {certificate.evidence_metadata.total_tamper_proof_blocks} Consecutive Blocks
                        </span>
                      </p>
                      <p className="text-slate-400">
                        Total Contained Incidents:{' '}
                        <span className="font-semibold text-amber-300">
                          {certificate.evidence_metadata.total_contained_incidents} Neutralized
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Merkle Root & Digital Attestation */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                      <Hash className="h-4 w-4 text-cyan-400" />
                      <span>Ledger Merkle Root Hash (SHA-256)</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800/40">
                      100% Unbroken Hash Chain
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 break-all select-all">
                    {certificate.evidence_metadata.merkle_root_hash}
                  </div>
                </div>

                {/* Section 3: Neutralized Threat Incidents */}
                {certificate.summary_of_threats_neutralized.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-amber-400" />
                      <span>Part C: Schedule of Neutralized Hostile Cyber Incidents</span>
                    </p>
                    <div className="rounded-xl border border-slate-800 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                          <tr>
                            <th className="px-4 py-2.5">Action Executed</th>
                            <th className="px-4 py-2.5">Target / Origin</th>
                            <th className="px-4 py-2.5">Authorized By</th>
                            <th className="px-4 py-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono text-[11px]">
                          {certificate.summary_of_threats_neutralized.map((inc, i) => (
                            <tr key={i} className="hover:bg-slate-800/40">
                              <td className="px-4 py-2.5 font-sans font-semibold text-cyan-400">
                                {inc.action}
                              </td>
                              <td className="px-4 py-2.5 text-slate-300">
                                {inc.target}
                              </td>
                              <td className="px-4 py-2.5 font-sans text-slate-300">
                                {inc.approved_by || 'User / Zero-Trust AI'}
                              </td>
                              <td className="px-4 py-2.5">
                                <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] text-emerald-400 border border-emerald-800/40">
                                  {inc.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Section 4: Forensic Hash Chain Compact Ledger */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-emerald-400" />
                    <span>Part D: Sequential SHA-256 Block Chain Ledger (Indian IT Act Sec 65B(2))</span>
                  </p>
                  <div className="rounded-xl border border-slate-800 overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                        <tr>
                          <th className="px-3 py-2">Block ID</th>
                          <th className="px-3 py-2">Event Type</th>
                          <th className="px-3 py-2">Previous Hash Link</th>
                          <th className="px-3 py-2">SHA-256 Block Hash</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-[10px]">
                        {certificate.forensic_hash_chain.map((blk, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="px-3 py-2 font-semibold text-white">{blk.block_id}</td>
                            <td className="px-3 py-2 text-cyan-400 font-sans">{blk.event_type}</td>
                            <td className="px-3 py-2 text-slate-500 truncate max-w-[120px]">
                              {blk.prev_hash.slice(0, 16)}...
                            </td>
                            <td className="px-3 py-2 text-emerald-300 font-semibold truncate max-w-[150px]">
                              {blk.block_hash.slice(0, 20)}...
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section 5: Statutory Legal Declaration */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2 text-xs">
                  <p className="font-semibold text-amber-400 uppercase tracking-wider text-[11px]">
                    Part E: Statutory Legal Declaration
                  </p>
                  <p className="text-slate-300 leading-relaxed text-[11px] italic">
                    "{certificate.legal_declaration}"
                  </p>
                  <p className="text-[10px] text-slate-400 pt-1">
                    Certified in compliance with Section 65B(4) of Indian Evidence Act, 1872 and Bharatiya Sakshya
                    Adhiniyam 2023 for admissibility in all Indian Criminal, Civil, and Cyber Appellate Tribunals.
                  </p>
                </div>

                {/* Section 6: Digital Signature Stamp */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                      Cryptographic Evidence Token (FIR Reference)
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        CYBERGUARD-SEC65B-{certificate.signature_hash.slice(0, 12).toUpperCase()}
                      </span>
                      <button
                        onClick={handleCopyToken}
                        className="rounded p-1 text-slate-400 hover:text-white transition"
                        title="Copy FIR Reference Token"
                      >
                        {copiedToken ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-left sm:text-right">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                      SHA-256 Digital Certificate Signature
                    </p>
                    <div className="flex items-center justify-start sm:justify-end gap-2">
                      <span className="font-mono text-[11px] text-cyan-400">
                        {certificate.signature_hash.slice(0, 24)}...
                      </span>
                      <button
                        onClick={handleCopySignature}
                        className="rounded p-1 text-slate-400 hover:text-white transition"
                        title="Copy Signature Hash"
                      >
                        {copiedHash ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Banner for National Cybercrime Portal */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl border border-cyan-800/40 bg-cyan-950/30 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <ExternalLink className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      File Official Complaint with National Cyber Crime Reporting Portal
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Submit this certificate and FIR token on cybercrime.gov.in or dial National Cyber Helpline 1930.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://cybercrime.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-medium text-white hover:bg-cyan-500 transition shadow-sm"
                  >
                    <span>Visit cybercrime.gov.in</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
