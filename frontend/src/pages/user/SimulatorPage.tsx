import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobilePhoneFrame } from '../../components/simulation/MobilePhoneFrame';

export const SimulatorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold mb-2 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Protection Center</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Phase 5 • Mobile Simulation Sandbox
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
              Mobile Threat Simulator & Share Intent
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Experience CYBERGUARD from the perspective of an everyday citizen. Test WhatsApp forwards, KYC SMS lures, Jamtara voice vishing calls, and social scams with instant AI analysis.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-cyan-800/80 bg-cyan-950/60 px-3.5 py-2 text-xs font-semibold text-cyan-300">
              Live FastAPI Hybrid Ingestion Active
            </span>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Embedded Mobile Phone Component */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl">
        <MobilePhoneFrame />
      </div>
    </div>
  );
};
