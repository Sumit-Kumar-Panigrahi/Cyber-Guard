import React, { useState } from 'react';
import {
  Users,
  Search,
} from 'lucide-react';
import type { ProtectedIdentity } from '../../types/admin';

interface ProtectedIdentitiesTabProps {
  identities: ProtectedIdentity[];
  onQuarantine: (userId: string, action: 'QUARANTINE' | 'UNFREEZE') => void;
}

export const ProtectedIdentitiesTab: React.FC<ProtectedIdentitiesTabProps> = ({
  identities,
  onQuarantine,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [quarantinedUsers, setQuarantinedUsers] = useState<Record<string, boolean>>({});

  const filteredIdentities = identities.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleQuarantine = (userId: string) => {
    const isCurrentlyQuarantined = !!quarantinedUsers[userId];
    const newAction = isCurrentlyQuarantined ? 'UNFREEZE' : 'QUARANTINE';
    onQuarantine(userId, newAction);
    setQuarantinedUsers((prev) => ({
      ...prev,
      [userId]: !isCurrentlyQuarantined,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Protected Fleet Identities & Zero-Trust Posture</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            100% Opt-in compliance under the Digital Personal Data Protection (DPDP) Act 2023.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search citizens / employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Identities Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Identity / Citizen</th>
                <th className="py-3.5 px-4">Role / Designation</th>
                <th className="py-3.5 px-4">Zero-Trust Shield Channels</th>
                <th className="py-3.5 px-4">Threat State</th>
                <th className="py-3.5 px-4 text-center">Active Chains</th>
                <th className="py-3.5 px-4 text-center">Signals Ingested</th>
                <th className="py-3.5 px-4 text-right">Emergency Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredIdentities.map((user) => {
                const isQuarantined = !!quarantinedUsers[user.id];
                return (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-white">{user.full_name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          title={`SMS Shield: ${user.sms_guard ? 'Enabled' : 'Disabled'}`}
                          className={`p-1 rounded-md border text-[10px] ${
                            user.sms_guard
                              ? 'bg-emerald-950 border-emerald-700/60 text-emerald-400'
                              : 'bg-slate-950 border-slate-800 text-slate-600'
                          }`}
                        >
                          SMS
                        </span>
                        <span
                          title={`Call Guard: ${user.call_guard ? 'Enabled' : 'Disabled'}`}
                          className={`p-1 rounded-md border text-[10px] ${
                            user.call_guard
                              ? 'bg-emerald-950 border-emerald-700/60 text-emerald-400'
                              : 'bg-slate-950 border-slate-800 text-slate-600'
                          }`}
                        >
                          Call
                        </span>
                        <span
                          title={`Device Guard: ${user.login_guard ? 'Enabled' : 'Disabled'}`}
                          className={`p-1 rounded-md border text-[10px] ${
                            user.login_guard
                              ? 'bg-emerald-950 border-emerald-700/60 text-emerald-400'
                              : 'bg-slate-950 border-slate-800 text-slate-600'
                          }`}
                        >
                          Device
                        </span>
                        <span
                          title={`Identity Guard: ${user.identity_guard ? 'Enabled' : 'Disabled'}`}
                          className={`p-1 rounded-md border text-[10px] ${
                            user.identity_guard
                              ? 'bg-emerald-950 border-emerald-700/60 text-emerald-400'
                              : 'bg-slate-950 border-slate-800 text-slate-600'
                          }`}
                        >
                          Face/ID
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isQuarantined ? (
                        <span className="rounded-full bg-rose-950 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-800/60">
                          QUARANTINED
                        </span>
                      ) : user.status === 'CRITICAL_ATTACK' ? (
                        <span className="rounded-full bg-rose-950 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-800/60 animate-pulse">
                          CRITICAL ATTACK
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800/60">
                          GUARDED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono">
                      {user.active_chains_count > 0 ? (
                        <span className="text-amber-400">{user.active_chains_count}</span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono text-cyan-300">
                      {user.signals_count}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleQuarantine(user.id)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                          isQuarantined
                            ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                            : 'bg-rose-950 border border-rose-700/60 text-rose-300 hover:bg-rose-900/60'
                        }`}
                      >
                        {isQuarantined ? 'Unfreeze Token' : 'Emergency Lock'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
