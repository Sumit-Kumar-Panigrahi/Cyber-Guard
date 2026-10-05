import React, { useState } from 'react';
import {
  X,
  Share2,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Copy,
  Languages,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { analysisService, type AnalysisResult } from '../../services/analysisService';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
  initialLink?: string;
  initialPlatform?: 'WhatsApp' | 'SMS' | 'Instagram' | 'Telegram';
  onThreatDetected?: (result: AnalysisResult) => void;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  initialContent = '',
  initialLink = '',
  initialPlatform = 'WhatsApp',
  onThreatDetected,
}) => {
  const [platform, setPlatform] = useState<'WhatsApp' | 'SMS' | 'Instagram' | 'Telegram'>(initialPlatform);
  const [content, setContent] = useState(initialContent);
  const [link, setLink] = useState(initialLink);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [languageTab, setLanguageTab] = useState<'en' | 'hi'>('en');
  const [isCopied, setIsCopied] = useState(false);

  // Sync state if props change when opening
  React.useEffect(() => {
    if (isOpen) {
      if (initialContent) setContent(initialContent);
      if (initialLink) setLink(initialLink);
      if (initialPlatform) setPlatform(initialPlatform);
      setAnalysisResult(null);
    }
  }, [isOpen, initialContent, initialLink, initialPlatform]);

  if (!isOpen) return null;

  const presets = [
    {
      label: 'SBI YONO KYC Threat (Hinglish)',
      platform: 'WhatsApp' as const,
      content: 'Aapka SBI YONO khata block ho chuka hai. Turant KYC update karein warna khata permanent band ho jayega: https://sbi-kyc-update.online/login',
      link: 'https://sbi-kyc-update.online/login',
    },
    {
      label: 'Electricity Bill Disconnection Scam',
      platform: 'SMS' as const,
      content: 'Dear Consumer, Your electricity power will be disconnected tonight at 9:30 PM due to unpaid bill. Immediately contact power officer at 9876543210 or visit bit.ly/power-pay-bill',
      link: 'http://bit.ly/power-pay-bill',
    },
    {
      label: 'Part-Time Job UPI Scam',
      platform: 'Instagram' as const,
      content: 'Work from Home! Earn Rs 2,500 - 5,000 daily just by liking YouTube videos. Instant UPI withdrawal. Join official Telegram group: https://t.me/earn-fast-upi-india',
      link: 'https://t.me/earn-fast-upi-india',
    },
    {
      label: 'Digital Arrest / Police Threat',
      platform: 'WhatsApp' as const,
      content: 'ATTENTION: A contraband parcel containing narcotics has been intercepted in your name by Delhi Customs. You are placed under Digital Arrest. Join Skype court room immediately.',
      link: 'https://customs-delhi-police.live/case-verify',
    },
  ];

  const handleRunAnalysis = async () => {
    if (!content.trim() && !link.trim()) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await analysisService.analyzeSocialShare(content, link || undefined, platform);
      setAnalysisResult(res);

      if (res.risk_score >= 70) {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#3b82f6', '#ec4899'],
        });
      }

      if (onThreatDetected) {
        onThreatDetected(res);
      }
    } catch (err) {
      console.error('Share-to-CYBERGUARD analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyIndicators = () => {
    if (!analysisResult) return;
    const text = `CYBERGUARD Threat Report:\nRisk Score: ${analysisResult.risk_score}/100 (${analysisResult.verdict})\nIndicators: ${analysisResult.indicators.join(', ')}\nAdvice: ${analysisResult.recommended_action}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getRiskColor = (score: number) => {
    if (score >= 75) return 'text-rose-400 bg-rose-950/80 border-rose-800/60';
    if (score >= 40) return 'text-amber-400 bg-amber-950/80 border-amber-800/60';
    return 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header / Share Sheet Styling */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wide">Share-to-CYBERGUARD</span>
                <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800/50">
                  HYBRID INGESTION
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Instant AI inspection of forwarded messages, suspicious links & social posts
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Platform Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              Originating App / Source
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['WhatsApp', 'SMS', 'Instagram', 'Telegram'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                    platform === p
                      ? 'bg-cyan-950 text-cyan-400 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>{p}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Preset Indian Scams */}
          <div>
            <span className="text-[11px] font-medium text-slate-400 mb-1.5 block">
              Or load Indian Cyber Threat Sample:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPlatform(item.platform);
                    setContent(item.content);
                    setLink(item.link);
                  }}
                  className="rounded-lg bg-slate-950 px-2.5 py-1 text-[11px] text-cyan-400 border border-slate-800 hover:border-cyan-600/40 hover:bg-cyan-950/30 transition text-left"
                >
                  ⚡ {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Forwarded Message / Text Body
              </label>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste the received WhatsApp forward, SMS text, or social DM..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Extracted Link / Target URL (Optional)
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="e.g. https://sbi-kyc-update.online/pan-verify"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Action Trigger Button */}
          <button
            type="button"
            disabled={isAnalyzing || (!content.trim() && !link.trim())}
            onClick={handleRunAnalysis}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-xs font-bold transition shadow-lg ${
              isAnalyzing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/20'
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                <span>Running Multi-Engine Inspection...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Inspect With CYBERGUARD AI</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </button>

          {/* Analysis Result Card */}
          {analysisResult && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border font-bold text-sm ${getRiskColor(
                      analysisResult.risk_score
                    )}`}
                  >
                    {analysisResult.risk_score}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white tracking-wide">
                        {analysisResult.verdict.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({Math.round(analysisResult.confidence * 100)}% Confidence)
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Category: {analysisResult.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {analysisResult.mitre && (
                  <div className="text-right">
                    <span className="rounded-lg bg-indigo-950 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-800/40">
                      MITRE {analysisResult.mitre.technique_id}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {analysisResult.mitre.technique_name}
                    </p>
                  </div>
                )}
              </div>

              {/* Language Switcher for Bilingual XAI */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/90 p-3.5 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
                    <Languages className="h-3.5 w-3.5" />
                    <span>Explainable AI (XAI) Assessment</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-950 rounded-lg p-0.5 border border-slate-800">
                    <button
                      onClick={() => setLanguageTab('en')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                        languageTab === 'en'
                          ? 'bg-cyan-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setLanguageTab('hi')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                        languageTab === 'hi'
                          ? 'bg-cyan-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      हिन्दी (Hindi)
                    </button>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-200">
                  {languageTab === 'en'
                    ? analysisResult.explanation_en
                    : analysisResult.explanation_hi}
                </p>
              </div>

              {/* Indicators List */}
              {analysisResult.indicators.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Detected Threat Indicators ({analysisResult.indicators.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.indicators.map((ind, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-rose-950/40 border border-rose-800/30 px-2 py-0.5 text-[10px] font-medium text-rose-300 flex items-center gap-1"
                      >
                        <AlertTriangle className="h-2.5 w-2.5 text-rose-400" />
                        <span>{ind.replace(/_/g, ' ')}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Action */}
              <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-emerald-300">Action Recommendation:</span>
                  <p className="text-slate-300 mt-0.5">{analysisResult.recommended_action}</p>
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleCopyIndicators}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
                >
                  {isCopied ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{isCopied ? 'Report Copied' : 'Copy Forensic Summary'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-1.5 text-xs font-semibold text-white transition"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
