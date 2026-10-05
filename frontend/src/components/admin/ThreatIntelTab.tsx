import React, { useState } from 'react';
import {
  Globe2,
  Search,
  ShieldAlert,
  Smartphone,
  Server,
  FileCode2,
  Send,
  Download,
} from 'lucide-react';
import type { ThreatIntelItem } from '../../types/admin';

interface ThreatIntelTabProps {
  threatIntel: ThreatIntelItem[];
  onRefresh?: () => void;
}

export const ThreatIntelTab: React.FC<ThreatIntelTabProps> = ({
  threatIntel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const filteredItems = threatIntel.filter((item) => {
    const matchesSearch =
      item.indicator_value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.threat_actor_or_hub.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.target_institution.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'ALL' || item.indicator_type === selectedType;
    return matchesSearch && matchesType;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'DOMAIN':
        return <Globe2 className="h-4 w-4 text-cyan-400" />;
      case 'PHONE':
        return <Smartphone className="h-4 w-4 text-rose-400" />;
      case 'IP':
        return <Server className="h-4 w-4 text-amber-400" />;
      case 'APK_HASH':
        return <FileCode2 className="h-4 w-4 text-purple-400" />;
      case 'SOCIAL_HANDLE':
        return <Send className="h-4 w-4 text-blue-400" />;
      default:
        return <ShieldAlert className="h-4 w-4 text-slate-400" />;
    }
  };

  const handleExportSTIX = () => {
    const stixBundle = {
      type: "bundle",
      id: `bundle--${Math.random().toString(36).substring(2, 10)}`,
      spec_version: "2.1",
      description: "CYBERGUARD India Threat Intelligence Feed & National IOC Repository",
      objects: filteredItems.map((item) => ({
        type: "indicator",
        id: `indicator--${item.id}`,
        created: item.first_detected,
        modified: new Date().toISOString(),
        name: item.indicator_value,
        description: `Target: ${item.target_institution} | Threat Actor: ${item.threat_actor_or_hub}`,
        indicator_types: [item.indicator_type.toLowerCase()],
        pattern: `[${item.indicator_type.toLowerCase()}:value = '${item.indicator_value}']`,
        pattern_type: "stix",
        confidence: Math.round(item.confidence * 100),
      }))
    };
    const blob = new Blob([JSON.stringify(stixBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CYBERGUARD_STIX_Threat_Feed_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">National Threat Intelligence & India IOC Feed</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time tactical intelligence on Jamtara vishing nodes, fake banking APK hashes, and scam domains.
          </p>
        </div>

        <button
          onClick={handleExportSTIX}
          className="flex items-center gap-1.5 self-start md:self-auto rounded-xl border border-cyan-800 bg-cyan-950/60 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/60 transition"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export STIX 2.1 IOCs</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by indicator (URL, phone number, APK hash, or target bank)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/90 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['ALL', 'DOMAIN', 'PHONE', 'APK_HASH', 'IP', 'SOCIAL_HANDLE'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold whitespace-nowrap transition ${
                  selectedType === t
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((ioc) => (
          <div
            key={ioc.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  {getIconForType(ioc.indicator_type)}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {ioc.indicator_type.replace('_', ' ')}
                  </span>
                  <span
                    className={`block rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase w-fit mt-0.5 ${
                      ioc.status === 'SINKHOLED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : ioc.status === 'BLOCKED'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                        : 'bg-amber-950 text-amber-400 border border-amber-800/60 animate-pulse'
                    }`}
                  >
                    {ioc.status}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Reports:</span>
                <span className="text-xs font-bold text-white">{ioc.total_reports}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <p className="font-mono text-xs text-cyan-300 break-all select-all font-semibold">
                {ioc.indicator_value}
              </p>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[10px]">Threat Hub / Cell:</span>
                <span className="font-semibold text-slate-300 text-right truncate max-w-[180px]">
                  {ioc.threat_actor_or_hub}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[10px]">Target Entity:</span>
                <span className="font-semibold text-amber-300">{ioc.target_institution}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[10px]">MITRE Technique:</span>
                <span className="text-[10px] font-mono text-slate-400 truncate max-w-[180px]">
                  {ioc.mitre_technique}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
              <span>Confidence: {Math.round(ioc.confidence * 100)}%</span>
              <span>
                Detected {new Date(ioc.first_detected).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
