import React, { useState } from 'react';
import {
  Zap,
  CheckCircle,
  Clock,
  ShieldCheck,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { FleetIncident } from '../../types/admin';

interface IncidentResponseTabProps {
  incidents: FleetIncident[];
  onExecuteAction: (
    incidentId: string,
    action: 'CONTAIN' | 'RESOLVE' | 'DISMISS' | 'ESCALATE',
    notes?: string
  ) => void;
}

export const IncidentResponseTab: React.FC<IncidentResponseTabProps> = ({
  incidents,
  onExecuteAction,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const filteredIncidents = incidents.filter((inc) => {
    const matchesStatus = filterStatus === 'ALL' || inc.status === filterStatus;
    const matchesSearch =
      inc.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.chain_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.action_target.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleActionClick = (
    id: string,
    action: 'CONTAIN' | 'RESOLVE' | 'DISMISS' | 'ESCALATE'
  ) => {
    setResolvingId(id);
    onExecuteAction(id, action);

    if (action === 'CONTAIN') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#6366f1', '#10b981'],
      });
    }

    setTimeout(() => {
      setResolvingId(null);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">SOC Incident Response & Active Containment</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            1-Click active defense: Session token invalidation, DNS sinkholing, and automated isolation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-emerald-800/80 bg-emerald-950/60 px-3 py-1.5 text-xs font-semibold text-emerald-300">
            Mean Time to Contain (MTTC): &lt; 42s
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search incidents by user, target domain, or attack title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/90 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['ALL', 'NEW', 'INVESTIGATING', 'CONTAINED', 'RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                  filterStatus === st
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {filteredIncidents.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500">
            <ShieldCheck className="h-10 w-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-slate-400">No incidents matching the selected filter</p>
          </div>
        ) : (
          filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 hover:border-slate-700 transition shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      inc.status === 'CONTAINED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : inc.status === 'NEW'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800/60 animate-pulse'
                        : inc.status === 'RESOLVED'
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                    }`}
                  >
                    {inc.status}
                  </span>
                  <h3 className="text-sm font-bold text-white">{inc.chain_title}</h3>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>{new Date(inc.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                </div>
              </div>

              {/* Target & Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Affected Citizen / Identity:</span>
                  <span className="font-semibold text-slate-200">{inc.user_name}</span>
                  {inc.user_email && (
                    <span className="text-[11px] text-slate-500 block font-mono">{inc.user_email}</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block">Recommended Defense Action:</span>
                  <span className="font-mono text-cyan-400 font-bold">{inc.recommended_action}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block">Hostile Target / Indicator:</span>
                  <span className="font-mono text-amber-300 truncate block font-semibold">
                    {inc.action_target}
                  </span>
                </div>
              </div>

              {inc.resolution_notes && (
                <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  Notes: {inc.resolution_notes}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800/80 gap-3">
                <div className="text-[11px] text-slate-500">
                  Incident ID: <span className="font-mono text-slate-400">{inc.id.slice(0, 12)}</span>
                </div>

                <div className="flex items-center gap-2">
                  {inc.status !== 'CONTAINED' && inc.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleActionClick(inc.id, 'CONTAIN')}
                      disabled={resolvingId === inc.id}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-4 py-2 text-xs font-bold text-white hover:from-rose-500 hover:to-amber-500 transition shadow-lg shadow-rose-600/20"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      <span>{resolvingId === inc.id ? 'Containing...' : 'Approve 1-Click Containment'}</span>
                    </button>
                  )}

                  {inc.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleActionClick(inc.id, 'RESOLVE')}
                      className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                    >
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Mark Resolved</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleActionClick(inc.id, 'ESCALATE')}
                    className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
                  >
                    <span>Escalate to CERT-In</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
