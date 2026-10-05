import React, { useState } from 'react';
import {
  Grid,
  X,
} from 'lucide-react';
import type { MitreTacticGroupItem, MitreTechniqueItem } from '../../types/admin';

interface MitreMatrixTabProps {
  mitreMatrix: MitreTacticGroupItem[];
}

export const MitreMatrixTab: React.FC<MitreMatrixTabProps> = ({ mitreMatrix }) => {
  const [selectedTechnique, setSelectedTechnique] = useState<MitreTechniqueItem | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Grid className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">MITRE ATT&CK Enterprise Matrix (India Cybercrime)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Full enterprise kill-chain mapping for UPI scams, Jamtara OTP vishing, and banking typosquatting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-cyan-800 bg-cyan-950/80 px-3 py-1.5 text-xs font-semibold text-cyan-300">
            94.2% Fleet Technique Coverage
          </span>
        </div>
      </div>

      {/* MITRE Horizontal Tactics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {mitreMatrix.map((tactic) => (
          <div
            key={tactic.tactic_id}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-3 flex flex-col justify-between"
          >
            {/* Tactic Column Header */}
            <div className="border-b border-slate-800 pb-2">
              <span className="font-mono text-[9px] text-cyan-400 uppercase tracking-wider block">
                {tactic.tactic_id}
              </span>
              <h3 className="text-xs font-bold text-white mt-0.5 leading-snug">{tactic.tactic}</h3>
            </div>

            {/* Techniques List in this Tactic */}
            <div className="space-y-2 flex-1">
              {tactic.techniques.map((tech) => (
                <div
                  key={tech.id}
                  onClick={() => setSelectedTechnique(tech)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                    selectedTechnique?.id === tech.id
                      ? 'bg-cyan-950/90 border-cyan-500 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400 font-semibold">{tech.id}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                        tech.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                          : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                      }`}
                    >
                      {tech.detected_count} Hits
                    </span>
                  </div>

                  <p className="text-[11px] font-semibold text-slate-200 mt-1 line-clamp-2 leading-tight">
                    {tech.name}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/60 text-[9px]">
                    <span className="text-emerald-400 font-bold">● {tech.status}</span>
                    <span className="text-slate-500">Details ➔</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Technique Details Modal / Card */}
      {selectedTechnique && (
        <div className="rounded-3xl border border-cyan-800/60 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 p-6 shadow-2xl animate-in fade-in duration-300 relative">
          <button
            onClick={() => setSelectedTechnique(null)}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/50">
                {selectedTechnique.id}
              </span>
              <span className="rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                {selectedTechnique.status}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white">{selectedTechnique.name}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedTechnique.description ||
                'This MITRE technique represents adversary behavior observed targeting Indian digital payment infrastructure and mobile banking citizens.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Fleet Detections:</span>
                <span className="text-base font-bold text-white font-mono">{selectedTechnique.detected_count}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Threat Severity:</span>
                <span className="text-base font-bold text-rose-400 font-mono">
                  {selectedTechnique.severity || 'CRITICAL'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Active AI Engine:</span>
                <span className="text-xs font-bold text-cyan-300 truncate block">
                  TF-IDF + Markov DAG
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
