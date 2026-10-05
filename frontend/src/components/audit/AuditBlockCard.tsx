import React, { useState } from 'react';
import {
  Link2,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Clock,
  Layers,
  FileCode,
  AlertTriangle,
} from 'lucide-react';
import type { AuditTrailBlock } from '../../types/audit';

interface AuditBlockCardProps {
  block: AuditTrailBlock;
  index: number;
  totalBlocks: number;
  isTamperedSimulation?: boolean;
}

export const AuditBlockCard: React.FC<AuditBlockCardProps> = ({
  block,
  index,
  totalBlocks,
  isTamperedSimulation = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedPrev, setCopiedPrev] = useState(false);

  const handleCopy = (text: string, type: 'block' | 'prev') => {
    navigator.clipboard.writeText(text);
    if (type === 'block') {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else {
      setCopiedPrev(true);
      setTimeout(() => setCopiedPrev(false), 2000);
    }
  };

  // Determine badge styling based on event type
  const getEventTypeMeta = (type: string) => {
    switch (type) {
      case 'CONTAINMENT_INCIDENT_RESOLVED':
        return {
          label: 'Containment Action Resolved',
          color: 'bg-emerald-950 text-emerald-400 border-emerald-800/50',
          icon: ShieldCheck,
        };
      case 'SECURITY_SIGNAL_INGESTION':
        return {
          label: 'Security Signal Telemetry',
          color: 'bg-amber-950 text-amber-400 border-amber-800/50',
          icon: AlertTriangle,
        };
      case 'ZERO_TRUST_ENROLLMENT':
        return {
          label: 'Zero-Trust Identity Enrollment',
          color: 'bg-cyan-950 text-cyan-400 border-cyan-800/50',
          icon: ShieldCheck,
        };
      case 'DEVICE_REVOKED':
        return {
          label: 'Session Revocation Containment',
          color: 'bg-rose-950 text-rose-400 border-rose-800/50',
          icon: ShieldAlert,
        };
      default:
        return {
          label: type.replace(/_/g, ' '),
          color: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: Layers,
        };
    }
  };

  const meta = getEventTypeMeta(block.event_type);
  const EventIcon = meta.icon;

  const isGenesis = index === 0 && block.prev_hash.startsWith('0000000000');
  const isCorrupted = isTamperedSimulation || block.is_tampered;

  return (
    <div className="relative group">
      {/* Visual Linker to Next Block */}
      {index < totalBlocks - 1 && (
        <div className="absolute left-8 top-full h-6 w-0.5 -translate-x-1/2 bg-gradient-to-b from-cyan-500/60 to-slate-700 z-10" />
      )}

      <div
        className={`relative overflow-hidden rounded-2xl border transition-all ${
          isCorrupted
            ? 'border-rose-500/80 bg-rose-950/20 shadow-lg shadow-rose-950/30'
            : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900/90 shadow-md'
        }`}
      >
        {/* Card Header */}
        <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            {/* Block Sequence Badge */}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold border ${
                isCorrupted
                  ? 'bg-rose-900/40 text-rose-300 border-rose-500/40'
                  : 'bg-cyan-950/80 text-cyan-400 border-cyan-800/50'
              }`}
            >
              #{index + 1}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-white tracking-wide">
                  {block.block_id}
                </span>

                <span
                  className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${meta.color}`}
                >
                  <EventIcon className="h-3 w-3" />
                  <span>{meta.label}</span>
                </span>

                {isGenesis && (
                  <span className="rounded-full bg-indigo-950 text-indigo-400 px-2 py-0.5 text-[10px] font-semibold border border-indigo-800/40">
                    GENESIS BLOCK
                  </span>
                )}

                {isCorrupted && (
                  <span className="rounded-full bg-rose-950 text-rose-400 px-2 py-0.5 text-[10px] font-bold border border-rose-800/50 flex items-center gap-1 animate-pulse">
                    <ShieldAlert className="h-3 w-3" />
                    TAMPERED HASH MISMATCH
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                <span>{new Date(block.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</span>
                <span>•</span>
                <span className="font-mono text-[10px] text-slate-500">
                  Event: {block.event_id.slice(0, 13)}...
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <FileCode className="h-3.5 w-3.5 text-cyan-400" />
              <span>{isExpanded ? 'Hide Payload' : 'Inspect Payload'}</span>
              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Cryptographic Linkage Display */}
        <div className="p-4 sm:p-5 space-y-3 bg-slate-950/40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs">
            {/* Previous Hash Link */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Link2 className="h-3.5 w-3.5 text-slate-400" />
                  <span>Previous Hash (Chain Parent)</span>
                </span>
                <button
                  onClick={() => handleCopy(block.prev_hash, 'prev')}
                  className="rounded p-1 text-slate-500 hover:text-slate-300 transition"
                  title="Copy Previous Hash"
                >
                  {copiedPrev ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <div className="font-mono text-[11px] text-slate-300 break-all select-all">
                {block.prev_hash}
              </div>
            </div>

            {/* Current Block Hash */}
            <div
              className={`rounded-xl border p-3 space-y-1 ${
                isCorrupted
                  ? 'border-rose-500/40 bg-rose-950/30'
                  : 'border-cyan-800/30 bg-cyan-950/20'
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span
                  className={`flex items-center gap-1.5 font-medium ${
                    isCorrupted ? 'text-rose-400' : 'text-cyan-400'
                  }`}
                >
                  {isCorrupted ? (
                    <ShieldAlert className="h-3.5 w-3.5" />
                  ) : (
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                  <span>Block Hash (SHA-256 Sealed)</span>
                </span>
                <button
                  onClick={() => handleCopy(block.block_hash, 'block')}
                  className="rounded p-1 text-slate-400 hover:text-white transition"
                  title="Copy Block Hash"
                >
                  {copiedHash ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <div
                className={`font-mono text-[11px] font-semibold break-all select-all ${
                  isCorrupted ? 'text-rose-300' : 'text-emerald-300'
                }`}
              >
                {isCorrupted ? '4f99b28a... [HASH CORRUPTED BY TAMPER SIMULATION]' : block.block_hash}
              </div>
            </div>
          </div>

          {/* Payload Summary Quick View */}
          <div className="text-xs text-slate-400">
            <span className="text-[11px] font-semibold uppercase text-slate-500 mr-2">
              Payload Summary:
            </span>
            <span className="font-mono text-[11px] text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
              {block.payload_summary}
            </span>
          </div>

          {/* Expanded JSON Drawer */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-300 uppercase tracking-wider">
                  Raw Canonical Telemetry JSON (Section 65B Preserved)
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  Payload SHA-256: {block.payload_hash.slice(0, 16)}...
                </span>
              </div>
              <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300/90 overflow-x-auto max-h-48 leading-relaxed">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(block.payload_summary.replace(/\.\.\.$/, '')), null, 2);
                  } catch {
                    return block.payload_summary;
                  }
                })()}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
