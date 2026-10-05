import React from 'react';
import { Sparkles, Clock, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import type { MarkovPrediction } from '../../types/attackChain';

interface MarkovPredictorCardProps {
  prediction: MarkovPrediction;
}

export const MarkovPredictorCard: React.FC<MarkovPredictorCardProps> = ({ prediction }) => {
  const confidencePct = Math.round((prediction.confidence || 0.85) * 100);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Markov Chain Next-Step Predictor</span>
              <span className="rounded bg-purple-950 px-1.5 py-0.2 text-[9px] font-bold text-purple-300 border border-purple-800/60">
                PROBABILISTIC AI
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">Forecasting attacker's next move based on Indian scam kill-chains</p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-purple-950/80 px-2.5 py-1 text-xs font-bold text-purple-300 border border-purple-700/60">
          <span>{confidencePct}% Confidence</span>
        </div>
      </div>

      {/* Primary Forecast Box */}
      <div className="rounded-xl border border-purple-900/40 bg-purple-950/20 p-3.5 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Current Kill-Chain Stage:</span>
          <span className="text-slate-200 font-semibold">{prediction.current_stage}</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <ArrowRight className="h-4 w-4 text-purple-400 flex-shrink-0 animate-pulse" />
          <span className="text-[11px] text-slate-300 font-semibold">Predicted Next Objective:</span>
          <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            {prediction.predicted_next_stage}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-purple-900/30 text-[10px] text-slate-400">
          <Clock className="h-3 w-3 text-amber-400" />
          <span>Expected Threat Window:</span>
          <span className="font-mono text-amber-300 font-bold">{prediction.threat_window}</span>
        </div>
      </div>

      {/* Probabilistic Kill-Chain Distribution Bars */}
      {prediction.stage_probabilities && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Activity className="h-3 w-3 text-cyan-400" />
            <span>State Transition Likelihood Matrix:</span>
          </p>

          <div className="space-y-1.5">
            {Object.entries(prediction.stage_probabilities)
              .filter(([_, prob]) => prob > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([stage, prob], idx) => {
                const pct = Math.round(prob * 100);
                const isTop = stage === prediction.predicted_next_stage;

                return (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={`truncate max-w-[210px] ${isTop ? 'font-bold text-purple-300' : 'text-slate-400'}`}>
                        {stage}
                      </span>
                      <span className={`font-mono ${isTop ? 'font-bold text-purple-300' : 'text-slate-500'}`}>
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isTop
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                            : 'bg-slate-700'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Recommended Pre-emptive Countermeasure */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 flex items-start gap-2.5">
        <ShieldCheck className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            Pre-emptive Countermeasure:
          </p>
          <p className="text-xs text-slate-300 leading-snug mt-0.5">
            {prediction.recommended_mitigation}
          </p>
        </div>
      </div>
    </div>
  );
};
