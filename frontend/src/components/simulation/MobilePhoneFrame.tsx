import React, { useState } from 'react';
import {
  MessageSquare,
  PhoneCall,
  Share2,
  Shield,
  ShieldAlert,
  Smartphone,
  Wifi,
  Battery,
  AlertTriangle,
  Sparkles,
  CheckCircle,
  Volume2,
} from 'lucide-react';
import { WhatsAppShareModal } from './WhatsAppShareModal';
import { analysisService, type AnalysisResult } from '../../services/analysisService';

interface MobilePhoneFrameProps {
  onEventCreated?: (result: AnalysisResult) => void;
}

export const MobilePhoneFrame: React.FC<MobilePhoneFrameProps> = ({ onEventCreated }) => {
  const [activeApp, setActiveApp] = useState<'whatsapp' | 'sms' | 'call' | 'social'>('whatsapp');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharePayload, setSharePayload] = useState<{
    content: string;
    link: string;
    platform: 'WhatsApp' | 'SMS' | 'Instagram' | 'Telegram';
  }>({
    content: '',
    link: '',
    platform: 'WhatsApp',
  });

  // Call simulation state
  const [isAnalyzingCall, setIsAnalyzingCall] = useState(false);
  const [callAnalysisResult, setCallAnalysisResult] = useState<AnalysisResult | null>(null);

  // Live Time for status bar
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Open Share Modal with predefined content from the simulated app
  const triggerShareToCyberguard = (
    content: string,
    link: string,
    platform: 'WhatsApp' | 'SMS' | 'Instagram' | 'Telegram'
  ) => {
    setSharePayload({ content, link, platform });
    setIsShareModalOpen(true);
  };

  const handleAnalyzeCall = async () => {
    setIsAnalyzingCall(true);
    setCallAnalysisResult(null);
    try {
      const transcript =
        'Hello, main State Bank of India Head Office Mumbai se Verification Manager bol raha hoon. Aapke account se abhi Rs 25,000 ka international transaction attempt hua hai. Agar aapne nahi kiya toh turant cancel karne ke liye registered mobile par aaya hua 6-digit OTP bataiye. Jaldi kijiye warna paise kat jayenge.';
      const res = await analysisService.analyzeCall(transcript, '+91 91234 56789');
      setCallAnalysisResult(res);
      if (onEventCreated) onEventCreated(res);
    } catch (err) {
      console.error('Call analysis error:', err);
    } finally {
      setIsAnalyzingCall(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 py-4">
      {/* Simulation Controls & Explanation Card */}
      <div className="w-full lg:w-80 space-y-4 text-left order-2 lg:order-1">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              Interactive Mobile Device
            </span>
          </div>
          <h3 className="text-base font-bold text-white">Simulated Mobile Sandbox</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Test how CYBERGUARD’s hybrid ingestion captures threats directly from mobile channels before they compromise the user.
          </p>

          {/* App Switcher Buttons */}
          <div className="mt-4 space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              Switch Mobile Scenario:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveApp('whatsapp')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                  activeApp === 'whatsapp'
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-600/50 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp Lure</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveApp('sms')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                  activeApp === 'sms'
                    ? 'bg-cyan-950/80 text-cyan-400 border-cyan-600/50 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="h-4 w-4" />
                <span>KYC SMS Alert</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveApp('call')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                  activeApp === 'call'
                    ? 'bg-rose-950/80 text-rose-400 border-rose-600/50 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <PhoneCall className="h-4 w-4" />
                <span>Jamtara Vishing</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveApp('social')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                  activeApp === 'social'
                    ? 'bg-purple-950/80 text-purple-400 border-purple-600/50 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Share2 className="h-4 w-4" />
                <span>Instagram Scam</span>
              </button>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                if (activeApp === 'whatsapp') {
                  triggerShareToCyberguard(
                    'Aapka SBI YONO khata block ho chuka hai. Turant KYC update karein: https://sbi-kyc-update.online/login',
                    'https://sbi-kyc-update.online/login',
                    'WhatsApp'
                  );
                } else if (activeApp === 'sms') {
                  triggerShareToCyberguard(
                    'Dear SBI User, KYC pending. Account frozen. Update at: http://sbi-kyc-update.online',
                    'http://sbi-kyc-update.online',
                    'SMS'
                  );
                } else if (activeApp === 'call') {
                  handleAnalyzeCall();
                } else {
                  triggerShareToCyberguard(
                    'Work from Home Rs 5000 daily via Telegram UPI payout.',
                    'https://t.me/earn-fast-upi-india',
                    'Instagram'
                  );
                }
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-2.5 px-4 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20 transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Simulate Share to CYBERGUARD</span>
            </button>
          </div>
        </div>

        {/* Privacy & Labelling Disclaimer */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-[11px] text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-300">Security Sandbox Architecture:</span> Mobile screen UI is an interactive sandbox environment simulating an Indian citizen’s smartphone. All threat extraction and NLP risk evaluations hit real backend FastAPI services.
        </div>
      </div>

      {/* Modern High-Fidelity Smartphone Chassis */}
      <div className="relative w-[340px] sm:w-[360px] h-[690px] rounded-[52px] bg-slate-950 border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col order-1 lg:order-2">
        {/* Dynamic Island / Speaker Notch Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 pt-3 pb-2 px-6 flex items-center justify-between bg-slate-950 text-white text-[11px] font-semibold">
          <span>{currentTime}</span>

          {/* Dynamic Island pill */}
          <div className="h-5 w-24 rounded-full bg-black border border-slate-800 flex items-center justify-center px-2 gap-1.5 shadow-inner">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] text-cyan-400 font-medium">CYBERGUARD</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-[9px] font-bold text-cyan-400">Jio 5G</span>
            <Wifi className="h-3 w-3" />
            <Battery className="h-3.5 w-3.5 text-emerald-400" />
          </div>
        </div>

        {/* Screen Content Wrapper */}
        <div className="flex-1 pt-12 pb-4 overflow-y-auto bg-slate-900 text-slate-100 flex flex-col justify-between">
          {/* App 1: WhatsApp Simulation */}
          {activeApp === 'whatsapp' && (
            <div className="flex-1 flex flex-col">
              {/* WhatsApp Header */}
              <div className="bg-[#075E54] text-white px-3 py-2 flex items-center gap-2.5 shadow">
                <div className="h-8 w-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs">
                  SBI
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold truncate">SBI Banking Support</p>
                    <CheckCircle className="h-3 w-3 text-cyan-300 flex-shrink-0" />
                  </div>
                  <p className="text-[10px] text-emerald-100 truncate">+91 98112 00192 • Official Notice</p>
                </div>
              </div>

              {/* Chat Canvas */}
              <div className="flex-1 p-3 bg-[#0b141a] space-y-3 overflow-y-auto">
                <div className="text-center">
                  <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[9px] text-slate-400 uppercase tracking-wider">
                    TODAY
                  </span>
                </div>

                {/* Phishing WhatsApp Bubble */}
                <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-[#202c33] p-3 text-xs text-slate-200 shadow-md space-y-2 border border-slate-700/40">
                  <p className="font-semibold text-rose-400 text-[11px]">⚠️ URGENT ACCOUNT NOTICE</p>
                  <p className="text-[11px] leading-relaxed">
                    Dear Customer, Your SBI YONO netbanking account has been suspended due to expired PAN KYC.
                    Please update immediately to prevent permanent deactivation:
                  </p>
                  <p className="text-[11px] font-mono text-cyan-400 underline break-all bg-slate-900/60 p-1 rounded border border-slate-800">
                    https://sbi-kyc-update.online/login
                  </p>
                  <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1">
                    <span>11:28 AM</span>
                    <span className="text-emerald-400">✓✓</span>
                  </div>

                  {/* 1-Click Share to CYBERGUARD Button */}
                  <button
                    type="button"
                    onClick={() =>
                      triggerShareToCyberguard(
                        'Aapka SBI YONO khata block ho chuka hai. Turant KYC update karein warna khata permanent band ho jayega: https://sbi-kyc-update.online/login',
                        'https://sbi-kyc-update.online/login',
                        'WhatsApp'
                      )
                    }
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 p-1.5 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-600/30 transition mt-2"
                  >
                    <Share2 className="h-3 w-3" />
                    <span>Share to CYBERGUARD</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* App 2: SMS / Messages Simulation */}
          {activeApp === 'sms' && (
            <div className="flex-1 flex flex-col">
              {/* SMS Header */}
              <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wider">VK-SBIINB</h4>
                  <p className="text-[10px] text-slate-400">Indian Bank SMS Route</p>
                </div>
                <span className="text-[10px] rounded bg-slate-700 px-2 py-0.5 text-slate-300">SMS</span>
              </div>

              {/* SMS Thread */}
              <div className="flex-1 p-3 bg-slate-950 space-y-4">
                <div className="max-w-[90%] rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 p-3.5 space-y-2 text-xs">
                  <p className="text-[11px] leading-relaxed text-slate-200">
                    Aapka State Bank account block hone se bachane ke liye turant KYC documents verify karein.
                    Click link below:
                  </p>
                  <div className="p-1.5 bg-slate-950 rounded border border-slate-800 text-[11px] text-cyan-400 font-mono underline break-all">
                    sbi-kyc-update.online/verify
                  </div>
                  <div className="text-right text-[9px] text-slate-500">10:45 AM</div>

                  <button
                    type="button"
                    onClick={() =>
                      triggerShareToCyberguard(
                        'Aapka State Bank account block hone se bachane ke liye turant KYC documents verify karein. Click link: sbi-kyc-update.online/verify',
                        'http://sbi-kyc-update.online/verify',
                        'SMS'
                      )
                    }
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-cyan-950 border border-cyan-700/50 p-1.5 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-900/40 transition mt-2"
                  >
                    <Shield className="h-3 w-3 text-cyan-400" />
                    <span>Verify with CYBERGUARD</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* App 3: Phone / Call Guard Simulation */}
          {activeApp === 'call' && (
            <div className="flex-1 flex flex-col justify-between p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-center">
              <div className="pt-4 space-y-2">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800/60 text-[10px] font-bold animate-pulse">
                  <AlertTriangle className="h-3 w-3" />
                  <span>SUSPECTED SCAM CALL</span>
                </div>
                <h4 className="text-sm font-bold text-white">Jamtara Telecom Node</h4>
                <p className="text-xs text-rose-300 font-mono">+91 91234 56789</p>
                <p className="text-[10px] text-slate-400">Caller ID: State Bank Customer Care (Spoofed)</p>
              </div>

              {/* Pulsing Avatar */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center animate-ping absolute" />
                <div className="h-20 w-20 rounded-full bg-rose-950 border border-rose-600 flex items-center justify-center text-rose-400 relative z-10">
                  <PhoneCall className="h-8 w-8 animate-bounce" />
                </div>
              </div>

              {/* Live Audio Transcript Box */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-left space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-cyan-400">
                    <Volume2 className="h-3 w-3" />
                    <span>Live Call Audio Transcript:</span>
                  </span>
                  <span className="animate-pulse text-rose-400">● Coercion detected</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300 italic">
                  "Sir, main SBI head office Mumbai se bol raha hoon... 25,000 deduct ho raha hai, turant OTP boliye cancel karne ke liye..."
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={isAnalyzingCall}
                  onClick={handleAnalyzeCall}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/20 hover:from-rose-500 hover:to-amber-500 transition"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>{isAnalyzingCall ? 'Analyzing Transcript...' : 'Intercept with Call Guard'}</span>
                </button>

                {callAnalysisResult && (
                  <div className="rounded-lg bg-rose-950/90 border border-rose-700/60 p-2 text-left text-[10px] text-rose-200 space-y-1">
                    <p className="font-bold text-rose-400">
                      🚨 Risk Score: {callAnalysisResult.risk_score}/100 (CRITICAL VISHING)
                    </p>
                    <p>{callAnalysisResult.explanation_en}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* App 4: Instagram / Social Scam */}
          {activeApp === 'social' && (
            <div className="flex-1 flex flex-col p-3 bg-slate-950 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                  Social Feed (Sponsored)
                </span>
                <span className="text-[10px] text-slate-500">Ad</span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 space-y-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600" />
                  <div>
                    <p className="text-[11px] font-bold">Fast_UPI_Jobs_India</p>
                    <p className="text-[9px] text-slate-400">Sponsored • Financial Services</p>
                  </div>
                </div>

                <div className="rounded-lg bg-gradient-to-r from-purple-950 to-indigo-950 p-3 border border-purple-800/40 text-center space-y-1">
                  <p className="text-xs font-extrabold text-amber-300">EARN ₹5,000 DAILY FROM HOME</p>
                  <p className="text-[10px] text-slate-300">Govt Approved Part Time Job • Immediate UPI Transfer</p>
                  <p className="text-[10px] text-cyan-400 underline font-mono">https://t.me/earn-fast-upi-india</p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    triggerShareToCyberguard(
                      'EARN ₹5,000 DAILY FROM HOME! Govt Approved Part Time Job. Immediate UPI Transfer. Click link: https://t.me/earn-fast-upi-india',
                      'https://t.me/earn-fast-upi-india',
                      'Instagram'
                    )
                  }
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-purple-950 border border-purple-700/50 p-1.5 text-[11px] font-semibold text-purple-300 hover:bg-purple-900/40 transition"
                >
                  <Share2 className="h-3 w-3" />
                  <span>Share to CYBERGUARD</span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Virtual Android/iOS Navigation Pill */}
          <div className="px-6 pt-2 pb-1 flex items-center justify-around border-t border-slate-800/80 bg-slate-950/80">
            <button
              onClick={() => setActiveApp('whatsapp')}
              className={`p-1.5 rounded-lg transition ${activeApp === 'whatsapp' ? 'text-emerald-400' : 'text-slate-500'}`}
              title="WhatsApp"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveApp('sms')}
              className={`p-1.5 rounded-lg transition ${activeApp === 'sms' ? 'text-cyan-400' : 'text-slate-500'}`}
              title="Messages"
            >
              <Smartphone className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveApp('call')}
              className={`p-1.5 rounded-lg transition ${activeApp === 'call' ? 'text-rose-400' : 'text-slate-500'}`}
              title="Call Guard"
            >
              <PhoneCall className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveApp('social')}
              className={`p-1.5 rounded-lg transition ${activeApp === 'social' ? 'text-purple-400' : 'text-slate-500'}`}
              title="Social Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal Triggered from Phone */}
      <WhatsAppShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        initialContent={sharePayload.content}
        initialLink={sharePayload.link}
        initialPlatform={sharePayload.platform}
        onThreatDetected={onEventCreated}
      />
    </div>
  );
};
