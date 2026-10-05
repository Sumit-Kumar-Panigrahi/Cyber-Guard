import React from 'react';
import {
  BarChart3,
  Cpu,
} from 'lucide-react';
import type { ModelEvaluationMetrics } from '../../types/admin';

interface ModelEvaluationTabProps {
  evaluation: ModelEvaluationMetrics | null;
}

export const ModelEvaluationTab: React.FC<ModelEvaluationTabProps> = ({ evaluation }) => {
  if (!evaluation) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/40 text-cyan-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Loading AI Engine Benchmark Telemetry...
          </span>
        </div>
      </div>
    );
  }

  const { benchmark_summary, engines } = evaluation;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">Empirical Model Benchmarks & Telemetry</span>
              <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-800/50">
                OFFLINE BENCHMARKED
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Empirical evaluation results across 12,500 samples of the Indian Cyber Fraud Corpus (UPI scams, Jamtara vishing transcripts, Devanagari text, and banking typosquatting).
            </p>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Evaluation Corpus:</span>
          <span className="text-xs font-bold text-cyan-300">{benchmark_summary.test_dataset}</span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-[11px] text-slate-400">Overall Accuracy</p>
          <p className="text-2xl font-extrabold text-white mt-1">
            {(benchmark_summary.overall_accuracy * 100).toFixed(1)}%
          </p>
          <p className="text-[10px] text-emerald-400 mt-1 font-semibold">Empirical Cross-Validation</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-[11px] text-slate-400">Overall F1-Score</p>
          <p className="text-2xl font-extrabold text-cyan-400 mt-1">
            {(benchmark_summary.overall_f1 * 100).toFixed(1)}%
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Harmonic Precision/Recall</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-[11px] text-slate-400">Mean Inference Latency</p>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">
            {benchmark_summary.mean_inference_latency_ms} ms
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Real-Time Mobile Budget &lt; 50ms</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-[11px] text-slate-400">Benchmark Samples</p>
          <p className="text-2xl font-extrabold text-indigo-400 mt-1">
            {benchmark_summary.total_benchmark_samples.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Ground-truth Labeled</p>
        </div>
      </div>

      {/* 5 Core AI Detection Engines Deep-Dive */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="h-4 w-4 text-cyan-400" />
          <span>Detailed Performance Telemetry per AI Engine (5 Core Engines)</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {engines.map((engine) => (
            <div
              key={engine.id}
              className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-lg"
            >
              <div>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-mono text-cyan-300">
                  {engine.id.toUpperCase()}
                </span>
                <h4 className="text-sm font-bold text-white mt-1">{engine.name}</h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{engine.model_type}</p>
              </div>

              {/* Metric Badges */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 uppercase block">Precision</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {(engine.precision * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 uppercase block">Recall</span>
                  <span className="text-xs font-bold text-cyan-400 font-mono">
                    {(engine.recall * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 uppercase block">F1-Score</span>
                  <span className="text-xs font-bold text-indigo-400 font-mono">
                    {(engine.f1_score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 uppercase block">Latency</span>
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    {engine.latency_ms} ms
                  </span>
                </div>
              </div>

              {/* Extra stats */}
              <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
                <span>ROC-AUC: <strong className="text-slate-200 font-mono">{engine.roc_auc.toFixed(3)}</strong></span>
                <span>FPR: <strong className="text-slate-200 font-mono">{(engine.false_positive_rate * 100).toFixed(1)}%</strong></span>
                <span>Test Samples: <strong className="text-slate-200 font-mono">{engine.test_samples}</strong></span>
              </div>

              {/* Key Features */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Algorithmic Capabilities:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {engine.key_features.map((feat, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-slate-950 border border-slate-800 px-2 py-0.5 text-[10px] text-slate-300"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
