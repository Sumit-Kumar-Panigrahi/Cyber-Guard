import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Clock,
  Compass,
  MessageSquare,
  PhoneCall,
  Smartphone,
  Share2,
} from 'lucide-react';
import { analysisService, type SecurityEventItem } from '../../services/analysisService';
import { ThreatTestbenchModal } from '../../components/threats/ThreatTestbenchModal';

export const ThreatFeed: React.FC = () => {
  const [events, setEvents] = useState<SecurityEventItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTestbenchOpen, setIsTestbenchOpen] = useState<boolean>(false);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await analysisService.fetchSecurityEvents(25);
      setEvents(data);
    } catch (err) {
      console.error('Failed to load security events:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);


  const getSourceIcon = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes('sms') || s.includes('message')) return MessageSquare;
    if (s.includes('browser') || s.includes('url')) return Compass;
    if (s.includes('call') || s.includes('vishing')) return PhoneCall;
    if (s.includes('login') || s.includes('device')) return Smartphone;
    if (s.includes('share') || s.includes('whatsapp')) return Share2;
    return AlertTriangle;
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-rose-400 bg-rose-950/60 border-rose-800/60';
    if (score >= 35) return 'text-amber-400 bg-amber-950/60 border-amber-800/60';
    return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-cyan-950 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800/50">
              TELEMETRY & DETECTION FEEDS
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <span>Live Threat Monitoring & Signal Ingestion</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time security events captured across permitted sources. Raw messages/audio are purged; only indicators are retained.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadEvents()}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsTestbenchOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500 transition"
          >
            <Sparkles className="h-4 w-4" />
            <span>Launch Threat Testbench</span>
          </button>
        </div>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent mb-3" />
          <p className="text-xs font-medium">Querying cryptographically sanitized security events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <ShieldCheck className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-white">No Active Threats Ingested</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Your telemetry stream is clear. You can simulate or test real Indian scam scenarios (SBI KYC, Electricity disconnection, Lookalike URLs) using the Threat Testbench.
          </p>
          <button
            onClick={() => setIsTestbenchOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Test a Threat Sample Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((evt) => {
            const Icon = getSourceIcon(evt.source);

            return (

              <div
                key={evt.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg hover:border-slate-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-cyan-400 border border-slate-700 flex-shrink-0 mt-0.5">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-white">{evt.category}</span>
                        <span className="text-xs text-slate-400">• {evt.source}</span>
                        {evt.is_simulated && (
                          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-semibold text-slate-400 border border-slate-700">
                            Simulated Environment
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(evt.timestamp).toLocaleString()}</span>
                        <span>• Event ID: {evt.id.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className={`flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-bold ${getRiskColor(evt.risk_score)}`}>
                      <span>Risk: {evt.risk_score}/100</span>
                    </div>
                  </div>
                </div>

                {/* MITRE ATT&CK Tag if present */}
                {evt.mitre_technique_id && (
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="text-slate-400 text-[11px]">MITRE ATT&CK:</span>
                    <span className="rounded-md bg-indigo-950/80 border border-indigo-800/60 px-2 py-0.5 text-indigo-300 font-mono text-[10px] font-semibold">
                      {evt.mitre_technique_id} • {evt.mitre_technique_name || 'Phishing Technique'} ({evt.mitre_tactic || 'Initial Access'})
                    </span>
                  </div>
                )}

                {/* Indicators Pills */}
                {evt.indicators && evt.indicators.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {evt.indicators.map((ind, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-slate-950 border border-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-400"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                )}

                {/* Sanitized Evidence Preview */}
                {evt.evidence && (
                  <div className="mt-3 rounded-xl bg-slate-950/60 p-3 border border-slate-800/60 text-xs text-slate-400 font-mono text-[11px]">
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] block mb-1 font-sans">
                      Sanitized Telemetry Evidence:
                    </span>
                    {evt.evidence.matched_keywords && (
                      <p>Matched Keywords: <span className="text-amber-300">{evt.evidence.matched_keywords.join(', ')}</span></p>
                    )}
                    {evt.evidence.domain && (
                      <p>Domain: <span className="text-rose-300">{evt.evidence.domain}</span> (Entropy: {evt.evidence.entropy})</p>
                    )}
                    {evt.evidence.device_name && (
                      <p>Device: <span className="text-cyan-300">{evt.evidence.device_name}</span> from {evt.evidence.current_geo}</p>
                    )}
                    {evt.evidence.matched_otp_triggers && (
                      <p>OTP Requests: <span className="text-rose-300">{evt.evidence.matched_otp_triggers.join(', ')}</span></p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Threat Testbench Modal */}
      <ThreatTestbenchModal
        isOpen={isTestbenchOpen}
        onClose={() => setIsTestbenchOpen(false)}
        onEventCreated={loadEvents}
      />
    </div>
  );
};
