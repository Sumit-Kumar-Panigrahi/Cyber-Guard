import React, { useState } from 'react';
import {
  X,
  Shield,

  MessageSquare,
  Globe,
  PhoneCall,
  Share2,
  Sparkles,
  ArrowRight,
  Languages,
  Check,
} from 'lucide-react';

import { analysisService, type AnalysisResult } from '../../services/analysisService';

interface ThreatTestbenchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: () => void;
  initialTab?: 'message' | 'url' | 'call' | 'social';
}

const PRESETS = [
  {
    type: 'message' as const,
    label: 'SBI YONO KYC Block (Hinglish/Urgent)',
    content: 'Dear customer your SBI account will be blocked today update your KYC immediately at sbi-kyc-update.online',
  },
  {
    type: 'message' as const,
    label: 'Bijli Vibhag Disconnection (Hindi)',
    content: 'Priye grahak aapka bijli connection aaj raat 9:30 baje kat diya jayega kyunki pichla bill jama nahi hai. Turant sampark karein: 9876543210',
  },
  {
    type: 'url' as const,
    label: 'Fake SBI Lookalike Domain',
    content: 'http://sbi-kyc-update.online/netbanking/login',
  },
  {
    type: 'call' as const,
    label: 'Scam Call Demanding OTP',
    content: 'Namaste sir, bank manager bol raha hoon SBI Mumbai branch se. Aapka account block ho gaya hai, turant 6 digit OTP bataiye nahi toh police FIR hogi.',
  },
  {
    type: 'message' as const,
    label: 'Legitimate Bank Alert (Safe)',
    content: 'Your SBI account has been credited with Rs 5000 via UPI from Rahul Sharma on 04-10-2026. Available balance Rs 24,190.',
  },
];

export const ThreatTestbenchModal: React.FC<ThreatTestbenchModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
  initialTab = 'message',
}) => {
  const [tab, setTab] = useState<'message' | 'url' | 'call' | 'social'>(initialTab);
  const [inputVal, setInputVal] = useState(PRESETS[0].content);
  const [urlLinkVal, setUrlLinkVal] = useState('http://sbi-kyc-update.online');
  const [platformVal, setPlatformVal] = useState('WhatsApp');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [langTab, setLangTab] = useState<'en' | 'hi'>('en');

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    setTab(preset.type);
    setInputVal(preset.content);
    setResult(null);
  };

  const handleRunAnalysis = async () => {
    if (!inputVal.trim()) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      let res: AnalysisResult;
      if (tab === 'message') {
        res = await analysisService.analyzeMessage(inputVal.trim());
      } else if (tab === 'url') {
        res = await analysisService.analyzeURL(inputVal.trim());
      } else if (tab === 'call') {
        res = await analysisService.analyzeCall(inputVal.trim());
      } else {
        res = await analysisService.analyzeSocialShare(inputVal.trim(), urlLinkVal.trim(), platformVal);
      }

      setResult(res);
      if (onEventCreated && res.saved_event_id) {
        onEventCreated();
      }
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskBadgeColor = (score: number) => {
    if (score >= 70) return 'text-rose-400 bg-rose-950/60 border-rose-800/60';
    if (score >= 35) return 'text-amber-400 bg-amber-950/60 border-amber-800/60';
    return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Live Threat Detection Testbench</h2>
              <p className="text-xs text-slate-400">
                Run real multi-layered heuristic & ML models against Indian phishing, lookalike URLs, and scam calls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1-Click Demo Presets Bar */}
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Quick 1-Click Indian Threat Presets:
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPreset(p)}
                className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Type Tabs */}
        <div className="mt-5 flex gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => { setTab('message'); setInputVal(PRESETS[0].content); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              tab === 'message'
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>SMS / Text</span>
          </button>
          <button
            onClick={() => { setTab('url'); setInputVal(PRESETS[2].content); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              tab === 'url'
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Pay-Safe URL</span>
          </button>
          <button
            onClick={() => { setTab('call'); setInputVal(PRESETS[3].content); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              tab === 'call'
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PhoneCall className="h-4 w-4" />
            <span>Call Guard Transcript</span>
          </button>
          <button
            onClick={() => { setTab('social'); setInputVal(PRESETS[0].content); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              tab === 'social'
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Share2 className="h-4 w-4" />
            <span>WhatsApp / Social Share</span>
          </button>
        </div>

        {/* Input Form */}
        <div className="mt-4 space-y-3">
          {tab === 'social' && (
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Source Platform</label>
                <select
                  value={platformVal}
                  onChange={(e) => setPlatformVal(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="WhatsApp">WhatsApp Message Forward</option>
                  <option value="Instagram">Instagram Direct Message</option>
                  <option value="Telegram">Telegram Channel / DM</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Embedded Link (Optional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={urlLinkVal}
                  onChange={(e) => setUrlLinkVal(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <label className="block text-xs font-medium text-slate-300">
            {tab === 'message' && 'Paste SMS, Email Snippet, or Hinglish Notification:'}
            {tab === 'url' && 'Enter Target Website URL to Inspect:'}
            {tab === 'call' && 'Paste Call Transcript (Simulated Voice-to-Text):'}
            {tab === 'social' && 'Shared Message Body:'}
          </label>

          <textarea
            rows={3}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type or paste threat text..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
          />

          <div className="flex justify-end">
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !inputVal.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 transition"
            >
              <span>{isAnalyzing ? 'Running AI Detection Pipeline...' : 'Run Security Inspection'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Results Card */}
        {result && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/90 p-5 space-y-4 animate-fade-in">
            {/* Top Score Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className={`flex flex-col items-center justify-center rounded-2xl border px-4 py-2 ${getRiskBadgeColor(result.risk_score)}`}>
                  <span className="text-2xl font-black">{result.risk_score}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Risk Score</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{result.category}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${getRiskBadgeColor(result.risk_score)}`}>
                      {result.verdict}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Source: <span className="text-slate-200 font-medium">{result.source}</span> • Confidence: <span className="text-slate-200 font-medium">{(result.confidence * 100).toFixed(0)}%</span>
                  </p>
                </div>
              </div>

              {result.saved_event_id && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 rounded-lg bg-emerald-950/40 px-3 py-1.5 border border-emerald-800/40 self-start sm:self-auto">
                  <Check className="h-4 w-4" />
                  <span>Logged to Active Threat Feed</span>
                </div>
              )}
            </div>

            {/* MITRE ATT&CK Pill */}
            {result.mitre && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">MITRE ATT&CK:</span>
                <span className="rounded-lg bg-indigo-950/70 border border-indigo-800/60 px-2.5 py-1 text-indigo-300 font-mono text-[11px] font-semibold">
                  {result.mitre.technique_id} • {result.mitre.technique_name} ({result.mitre.tactic})
                </span>
              </div>
            )}

            {/* Bilingual Explanation Box */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Languages className="h-4 w-4 text-cyan-400" />
                  <span>Explainable AI Reason (Why Detected)</span>
                </div>
                <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-[11px]">
                  <button
                    onClick={() => setLangTab('en')}
                    className={`px-2 py-0.5 rounded ${langTab === 'en' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLangTab('hi')}
                    className={`px-2 py-0.5 rounded ${langTab === 'hi' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400'}`}
                  >
                    हिंदी (Hindi)
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {langTab === 'en' ? result.explanation_en : result.explanation_hi}
              </p>
            </div>

            {/* Indicators & Evidence */}
            {result.indicators.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Extracted Security Indicators:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.indicators.map((ind, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-slate-900 border border-slate-800 px-2.5 py-1 text-[11px] font-mono text-cyan-400"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Action */}
            <div className="flex items-center gap-2 rounded-xl bg-slate-900/90 p-3 border border-slate-800 text-xs">
              <Shield className="h-4 w-4 text-cyan-400 flex-shrink-0" />
              <span className="text-slate-300">
                <strong className="text-white font-semibold">Recommended Response:</strong> {result.recommended_action}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
