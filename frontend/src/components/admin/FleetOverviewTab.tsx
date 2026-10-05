import React from 'react';
import {
  ShieldAlert,
  Radio,
  Zap,
  CheckCircle,
  ExternalLink,
  Download,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { FleetOverview, FleetIncident } from '../../types/admin';

interface FleetOverviewTabProps {
  overview: FleetOverview | null;
  onContainIncident: (incidentId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const FleetOverviewTab: React.FC<FleetOverviewTabProps> = ({
  overview,
  onContainIncident,
  onNavigateTab,
}) => {
  const navigate = useNavigate();

  const handleExportForensicReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      facility: "National Cyber Threat Command Center (CERT-In Telemetry Node)",
      fleet_overview: overview,
      jurisdiction: "Republic of India - Ministry of Home Affairs Cyber Division",
      compliance: "DPDP Act 2023 & RBI Digital Payment Security Guidelines",
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CYBERGUARD_SOC_Fleet_Report_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Real-time Ticker / Alert Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-900/60 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 p-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex-shrink-0">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live National Threat Grid • Active Correlation Stream
                </span>
                <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-800/50">
                  REAL-TIME SYNCED
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Monitoring 1,248 identities across banking, telecom, and corporate vectors. Zero-trust DAG active.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={handleExportForensicReport}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-700/60 bg-indigo-950/80 px-3.5 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-900/60 transition shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Forensics JSON</span>
            </button>
            <button
              onClick={() => onNavigateTab('response')}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:from-indigo-400 hover:to-cyan-400 transition shadow-lg shadow-indigo-500/20"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Incident Response Queue</span>
            </button>
          </div>
        </div>
      </div>

      {/* Indian Cybercrime Telemetry Hotspots */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Active Indian Scam Hubs & Telemetry Heatmap</h3>
          </div>
          <button
            onClick={() => onNavigateTab('intel')}
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition"
          >
            <span>View All Threat Indicators</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {overview?.geo_threat_hotspots.map((spot, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl border border-slate-800 bg-slate-900/70 p-4 hover:border-indigo-500/40 transition hover:shadow-lg hover:shadow-indigo-500/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      spot.risk_level === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                        : spot.risk_level === 'HIGH'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                        : 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                    }`}
                  >
                    {spot.risk_level}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {spot.active_nodes} Nodes
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                  {spot.region}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {spot.threat_type}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Intercept Rate:</span>
                  <span className="font-bold text-emerald-400">{spot.intercepted_rate}</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-1 italic">
                  Lure: "{spot.top_lure}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Active Correlated Chains & Urgent Containment Triage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Correlated Attack Chains */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-cyan-400" />
                <span>Active Correlated Chains Across Fleet</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Stochastic Markov predictions and NetworkX DAG multi-stage progressions
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('chains')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              View Full Graph
            </button>
          </div>

          <div className="space-y-3">
            {overview?.active_chains_summary.map((chain) => (
              <div
                key={chain.id}
                className="rounded-2xl border border-slate-800/90 bg-slate-950/70 p-4 hover:border-slate-700 transition space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        chain.severity === 'CRITICAL' ? 'bg-rose-500 animate-ping' : 'bg-amber-400'
                      }`}
                    />
                    <h4 className="text-xs font-bold text-white truncate max-w-[240px]">
                      {chain.title}
                    </h4>
                  </div>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[9px] font-bold ${
                      chain.severity === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                        : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                    }`}
                  >
                    {chain.severity}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/60 rounded-xl p-2.5 border border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Target Identity:</span>
                    <span className="font-semibold text-slate-200 truncate block">
                      {chain.user_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Current Kill-Chain Stage:</span>
                    <span className="font-semibold text-cyan-300 truncate block">
                      {chain.current_stage}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-slate-500 text-[10px]">Human Risk: </span>
                      <span className="font-bold text-amber-400">{chain.human_risk}/100</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Tech Risk: </span>
                      <span className="font-bold text-rose-400">{chain.tech_risk}/100</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/attack-chain')}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    <span>Investigate DAG</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Urgent Containment Triage Queue */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-indigo-400" />
                <span>1-Click Containment Triage</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pending authorized actions on hostile IPs, domains, and hijacked sessions
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('response')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Triage All
            </button>
          </div>

          <div className="space-y-3">
            {overview?.recent_incidents.slice(0, 4).map((inc: FleetIncident) => (
              <div
                key={inc.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate max-w-[200px]">
                    {inc.user_name}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      inc.status === 'CONTAINED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : inc.status === 'NEW'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800/60 animate-pulse'
                        : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                    }`}
                  >
                    {inc.status}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800/80 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px]">Action:</span>
                    <span className="font-mono text-cyan-400 font-semibold">{inc.recommended_action}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px]">Target:</span>
                    <span className="font-mono text-slate-300 truncate max-w-[190px]">{inc.action_target}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">
                    {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {inc.status !== 'CONTAINED' && inc.status !== 'RESOLVED' ? (
                    <button
                      onClick={() => onContainIncident(inc.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-rose-500 transition shadow-sm"
                    >
                      <Zap className="h-3 w-3" />
                      <span>Approve Containment</span>
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Zero-Trust Contained</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
