import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  ShieldCheck,
  Sparkles,
  MessageSquare,
  Globe,
  PhoneCall,
  Smartphone,
  Flame,
  Binary,
} from 'lucide-react';
import type { AttackChainNode } from '../../types/attackChain';

export const CyberGraphNode: React.FC<NodeProps> = memo(({ data, selected }) => {
  const node = data as unknown as AttackChainNode;

  const isPredicted = node.is_predicted;
  const isContained = node.is_contained;

  const getSourceIcon = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes('sms')) return MessageSquare;
    if (s.includes('web') || s.includes('browser') || s.includes('url')) return Globe;
    if (s.includes('call') || s.includes('vishing')) return PhoneCall;
    if (s.includes('login') || s.includes('device')) return Smartphone;
    if (s.includes('markov') || s.includes('ai')) return Sparkles;
    return Binary;
  };

  const Icon = getSourceIcon(node.source || '');

  // Dynamic Border & Background styling based on risk and state
  const getCardStyle = () => {
    if (isContained) {
      return 'border-emerald-500/80 bg-emerald-950/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]';
    }
    if (isPredicted) {
      return 'border-purple-500/90 border-dashed bg-purple-950/40 text-purple-200 shadow-[0_0_25px_rgba(168,85,247,0.3)] animate-pulse';
    }
    if (node.risk_score >= 85) {
      return 'border-rose-500/80 bg-slate-900/95 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.25)]';
    }
    if (node.risk_score >= 60) {
      return 'border-amber-500/80 bg-slate-900/95 text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.2)]';
    }
    return 'border-cyan-500/70 bg-slate-900/95 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]';
  };

  const getRiskBadge = (score: number) => {
    if (isContained) {
      return 'bg-emerald-900/80 text-emerald-300 border-emerald-700/60';
    }
    if (score >= 85) return 'bg-rose-950 text-rose-300 border-rose-800/80';
    if (score >= 60) return 'bg-amber-950 text-amber-300 border-amber-800/80';
    return 'bg-cyan-950 text-cyan-300 border-cyan-800/80';
  };

  return (
    <div
      className={`relative w-72 rounded-2xl border-2 p-3.5 backdrop-blur-md transition-all duration-300 ${getCardStyle()} ${
        selected ? 'ring-2 ring-cyan-400 scale-[1.02]' : 'hover:scale-[1.01]'
      }`}
    >
      {/* React Flow Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !rounded-full !border-2 !border-slate-950 !bg-cyan-400"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !rounded-full !border-2 !border-slate-950 !bg-cyan-400"
      />

      {/* Top Header Tag */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/80 text-[10px]">
        <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider">
          <Icon className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate max-w-[130px]">{node.source}</span>
        </div>

        {isPredicted ? (
          <span className="flex items-center gap-1 rounded-full bg-purple-900/80 px-2 py-0.5 font-bold text-purple-300 border border-purple-600/60">
            <Sparkles className="h-2.5 w-2.5" />
            <span>FORECAST</span>
          </span>
        ) : isContained ? (
          <span className="flex items-center gap-1 rounded-full bg-emerald-900/80 px-2 py-0.5 font-bold text-emerald-300 border border-emerald-600/60">
            <ShieldCheck className="h-2.5 w-2.5" />
            <span>NEUTRALIZED</span>
          </span>
        ) : (
          <span className={`rounded-full px-2 py-0.5 font-bold border ${getRiskBadge(node.risk_score)}`}>
            Risk {node.risk_score}/100
          </span>
        )}
      </div>

      {/* Title & Stage */}
      <div className="mt-2 space-y-1">
        <h4 className="text-xs font-bold text-white leading-tight line-clamp-2">
          {node.title || node.category}
        </h4>
        <p className="text-[10px] text-slate-400 font-medium">
          Stage: <span className="text-slate-200">{node.stage}</span>
        </p>
      </div>

      {/* MITRE ATT&CK Technique Pill */}
      {node.mitre_technique_id && (
        <div className="mt-2.5 flex items-center gap-1.5 text-[10px]">
          <span className="rounded bg-indigo-950 px-1.5 py-0.5 font-mono font-bold text-indigo-300 border border-indigo-800/60">
            {node.mitre_technique_id}
          </span>
          <span className="text-slate-400 truncate text-[10px]">
            {node.mitre_technique_name || node.mitre_tactic}
          </span>
        </div>
      )}

      {/* Indicators preview */}
      {node.indicators && node.indicators.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {node.indicators.slice(0, 2).map((ind, i) => (
            <span
              key={i}
              className="rounded bg-slate-950/80 px-1.5 py-0.5 text-[9px] font-mono text-cyan-400 border border-slate-800"
            >
              {ind}
            </span>
          ))}
          {node.indicators.length > 2 && (
            <span className="text-[9px] text-slate-500 self-center">
              +{node.indicators.length - 2} more
            </span>
          )}
        </div>
      )}

      {/* Timestamp / Threat status footer */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[9px] text-slate-500">
        <span className="truncate max-w-[180px]">{node.timestamp}</span>
        {node.risk_score >= 85 && !isContained && (
          <span className="flex items-center gap-0.5 text-rose-400 font-semibold">
            <Flame className="h-3 w-3" />
            <span>High Threat</span>
          </span>
        )}
      </div>
    </div>
  );
});

CyberGraphNode.displayName = 'CyberGraphNode';
