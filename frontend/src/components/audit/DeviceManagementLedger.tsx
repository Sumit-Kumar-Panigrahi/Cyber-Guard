import React, { useState } from 'react';
import {
  Smartphone,
  Laptop,
  Shield,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle,
  MapPin,
  Cpu,
} from 'lucide-react';
import type { DeviceAuditItem } from '../../types/audit';

interface DeviceManagementLedgerProps {
  devices: DeviceAuditItem[];
  isLoading: boolean;
  onRevoke: (deviceId: string) => Promise<void>;
  onToggleTrust: (deviceId: string) => Promise<void>;
  onSimulateRogue: () => Promise<void>;
  onRefresh: () => void;
}

export const DeviceManagementLedger: React.FC<DeviceManagementLedgerProps> = ({
  devices,
  isLoading,
  onRevoke,
  onToggleTrust,
  onSimulateRogue,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [trustingId, setTrustingId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const filteredDevices = devices.filter(
    (d) =>
      d.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.ip_address.includes(searchTerm) ||
      d.geo_location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRevoke = async (id: string) => {
    setRevokingId(id);
    try {
      await onRevoke(id);
    } finally {
      setRevokingId(null);
    }
  };

  const handleToggleTrust = async (id: string) => {
    setTrustingId(id);
    try {
      await onToggleTrust(id);
    } finally {
      setTrustingId(null);
    }
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      await onSimulateRogue();
    } finally {
      setIsSimulating(false);
    }
  };

  const isRogueDevice = (d: DeviceAuditItem) =>
    d.geo_location.toLowerCase().includes('jamtara') ||
    d.browser_agent.toLowerCase().includes('python') ||
    d.device_name.toLowerCase().includes('rogue');

  return (
    <div className="space-y-6">
      {/* Control Bar & Simulation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <Laptop className="h-4 w-4 text-cyan-400" />
              <span>Zero-Trust Endpoint Access Ledger</span>
            </span>
            <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800/40">
              {devices.length} Monitored Sessions
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Active browser sessions, continuous telemetry tokens, and instant remote containment switch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-950/80 to-amber-950/80 px-3.5 py-2 text-xs font-semibold text-rose-300 border border-rose-800/50 hover:bg-rose-900 transition shadow-sm disabled:opacity-50"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            <span>{isSimulating ? 'Injecting Attempt...' : 'Simulate Rogue Remote Attempt (Jamtara, JH)'}</span>
          </button>

          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Refresh Sessions"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by device name, IP address, or location (e.g. New Delhi, Jamtara)..."
          className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
        />
      </div>

      {/* Sessions Grid */}
      {isLoading && devices.length === 0 ? (
        <div className="py-16 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading authenticated device endpoints...</p>
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-slate-800 bg-slate-900/30">
          <Smartphone className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-300">No matching device sessions</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Try clearing the search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDevices.map((dev) => {
            const rogue = isRogueDevice(dev);
            const isRevoking = revokingId === dev.id;
            const isTrusting = trustingId === dev.id;

            return (
              <div
                key={dev.id}
                className={`relative rounded-2xl border p-5 transition-all ${
                  rogue
                    ? 'border-rose-500/60 bg-rose-950/20 shadow-lg shadow-rose-950/20'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                {/* Top Row: Device Name & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                        rogue
                          ? 'bg-rose-950 text-rose-400 border-rose-800/50'
                          : dev.is_trusted
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/40'
                          : 'bg-amber-950/80 text-amber-400 border-amber-800/40'
                      }`}
                    >
                      {rogue ? (
                        <Cpu className="h-5 w-5 text-rose-400" />
                      ) : dev.device_name.toLowerCase().includes('mobile') ? (
                        <Smartphone className="h-5 w-5" />
                      ) : (
                        <Laptop className="h-5 w-5" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{dev.device_name}</span>
                        {rogue && (
                          <span className="rounded bg-rose-900/60 text-rose-300 text-[10px] font-bold px-1.5 py-0.2 border border-rose-700">
                            ANOMALOUS
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-cyan-400" />
                        <span>{dev.geo_location}</span>
                        <span>•</span>
                        <span>{dev.ip_address}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border flex items-center gap-1 ${
                      rogue
                        ? 'bg-rose-950 text-rose-300 border-rose-800/60'
                        : dev.is_trusted
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800/40'
                        : 'bg-amber-950 text-amber-300 border-amber-800/40'
                    }`}
                  >
                    {dev.is_trusted ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    <span>{rogue ? 'Untrusted Origin' : dev.is_trusted ? 'Authorized Endpoint' : 'Pending Review'}</span>
                  </span>
                </div>

                {/* Details Section */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Session Fingerprint:</span>
                    <span className="font-mono text-slate-300">{dev.device_fingerprint}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Client Agent:</span>
                    <span className="text-slate-300 truncate max-w-[200px]" title={dev.browser_agent}>
                      {dev.browser_agent}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Authenticated At:</span>
                    <span className="text-slate-300">
                      {new Date(dev.logged_in_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleTrust(dev.id)}
                    disabled={isTrusting}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
                  >
                    <Shield className="h-3.5 w-3.5 text-cyan-400" />
                    <span>{dev.is_trusted ? 'Mark Untrusted' : 'Mark as Trusted'}</span>
                  </button>

                  <button
                    onClick={() => handleRevoke(dev.id)}
                    disabled={isRevoking}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      rogue
                        ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-900/30'
                        : 'bg-rose-950/70 text-rose-300 border border-rose-800/40 hover:bg-rose-900'
                    } disabled:opacity-50`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{isRevoking ? 'Terminating...' : rogue ? '1-Click Remote Kill' : 'Revoke Session'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
