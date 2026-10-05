import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  FileText,
  Volume2,
  VolumeX,
  Download,
  Copy,
  CheckCircle,
  ExternalLink,
  Send,
  Sparkles,
  Building2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { emergencyService } from '../../services/emergencyService';
import type {
  FIRResponse,
  BankFreezeResponse,
  AdvisoryBotResponse,
  EmergencyHelpline,
} from '../../types/emergency';

export const EmergencyDefenseHub: React.FC = () => {
  // Voice Advisor State
  const [query, setQuery] = useState('');
  const [advisoryResult, setAdvisoryResult] = useState<AdvisoryBotResponse | null>(null);
  const [isAdvising, setIsAdvising] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi'>('en');

  // FIR Generator State
  const [incidentType, setIncidentType] = useState('BANKING_FRAUD');
  const [suspectPhone, setSuspectPhone] = useState('+91 91234 56789');
  const [suspectUpi, setSuspectUpi] = useState('scam.mule99@ybl');
  const [suspectUrl, setSuspectUrl] = useState('https://sbi-kyc-update.online/login');
  const [lossAmount, setLossAmount] = useState(25000);
  const [bankName, setBankName] = useState('State Bank of India');
  const [accountLast4, setAccountLast4] = useState('4921');
  const [narrative, setNarrative] = useState(
    'Received fraudulent call from suspect impersonating bank verification manager threatening account suspension and extorting OTP.'
  );
  const [firResponse, setFirResponse] = useState<FIRResponse | null>(null);
  const [isGeneratingFIR, setIsGeneratingFIR] = useState(false);
  const [isCopiedFIR, setIsCopiedFIR] = useState(false);

  // Bank Freeze Notice State
  const [freezeBank, setFreezeBank] = useState('State Bank of India');
  const [freezeAcc, setFreezeAcc] = useState('39481029384');
  const [freezeDisputedAmount, setFreezeDisputedAmount] = useState(25000);
  const [freezeTxnRef, setFreezeTxnRef] = useState('UPI/20260404/99182746');
  const [freezeResponse, setFreezeResponse] = useState<BankFreezeResponse | null>(null);
  const [isGeneratingFreeze, setIsGeneratingFreeze] = useState(false);
  const [isCopiedFreeze, setIsCopiedFreeze] = useState(false);

  // Helplines Directory
  const [helplines, setHelplines] = useState<EmergencyHelpline[]>([]);

  useEffect(() => {
    emergencyService.fetchHelplines().then(setHelplines).catch(console.error);
    // Auto-load an initial advisory
    handleAskAdvisor('Maine OTP de diya, paise kat gaye');
  }, []);

  // Web Speech API Voice Narration ("Speaks the Warning")
  const speakWarning = (text: string, lang: 'en' | 'hi') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleAskAdvisor = async (questionText: string) => {
    const q = questionText || query;
    if (!q.trim()) return;
    setIsAdvising(true);
    try {
      const res = await emergencyService.askAdvisoryBot(q, selectedLang);
      setAdvisoryResult(res);
      // Auto speak warning
      const textToSpeak = selectedLang === 'hi' ? res.speech_text_hi : res.speech_text_en;
      speakWarning(textToSpeak, selectedLang);
    } catch (err) {
      console.error('Advisor query error:', err);
    } finally {
      setIsAdvising(false);
    }
  };

  const handleGenerateFIR = async () => {
    setIsGeneratingFIR(true);
    try {
      const res = await emergencyService.generateFIR({
        incident_type: incidentType,
        suspect_phone: suspectPhone,
        suspect_upi: suspectUpi,
        suspect_url: suspectUrl,
        loss_amount_inr: Number(lossAmount),
        bank_name: bankName,
        account_last4: accountLast4,
        narrative,
      });
      setFirResponse(res);
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#3b82f6', '#10b981'],
      });
    } catch (err) {
      console.error('FIR generation error:', err);
    } finally {
      setIsGeneratingFIR(false);
    }
  };

  const handleDownloadFIR = () => {
    if (!firResponse) return;
    const blob = new Blob([firResponse.formal_complaint_letter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${firResponse.fir_reference_id}_National_Cybercrime_Complaint.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyFIR = () => {
    if (!firResponse) return;
    navigator.clipboard.writeText(firResponse.formal_complaint_letter);
    setIsCopiedFIR(true);
    setTimeout(() => setIsCopiedFIR(false), 2000);
  };

  const handleGenerateBankFreeze = async () => {
    setIsGeneratingFreeze(true);
    try {
      const res = await emergencyService.generateBankFreeze({
        bank_name: freezeBank,
        account_number: freezeAcc,
        disputed_amount: Number(freezeDisputedAmount),
        transaction_ref: freezeTxnRef,
        suspect_upi_id: suspectUpi,
      });
      setFreezeResponse(res);
    } catch (err) {
      console.error('Bank freeze generation error:', err);
    } finally {
      setIsGeneratingFreeze(false);
    }
  };

  const handleCopyFreeze = () => {
    if (!freezeResponse) return;
    navigator.clipboard.writeText(freezeResponse.formal_notice_text);
    setIsCopiedFreeze(true);
    setTimeout(() => setIsCopiedFreeze(false), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Emergency 1930 Hero Direct Dial Banner */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-rose-500/60 bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-rose-500 animate-ping" />
              <span className="rounded-full bg-rose-950 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-rose-300 border border-rose-700/60">
                Phase 7 • National Emergency Cyber Defense Hub
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              National Cybercrime Helpline: Dial 1930
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              <strong>The Golden Hour Defense:</strong> If you lost money via UPI, netbanking, or OTP extortion, dialling <strong>1930</strong> immediately enables the Indian Cyber Crime Coordination Centre (I4C) to freeze fraudulent transfers across beneficiary accounts nationwide.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
            <a
              href="tel:1930"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 px-6 py-4 text-base font-extrabold text-white shadow-xl shadow-rose-600/30 hover:from-rose-500 hover:to-amber-500 transition animate-pulse"
            >
              <PhoneCall className="h-5 w-5" />
              <span>Call 1930 Now</span>
            </a>

            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-2xl border border-slate-700 bg-slate-800/90 px-5 py-4 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
            </a>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />
      </div>

      {/* Voice Defense Advisory Bot ("Speaks the Warning") */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-3 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Voice Defense Advisor ("Speaks the Warning")</h3>
              <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-800/50">
                BILINGUAL TTS AUDIO
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ask any scam scenario in Hindi or English — CYBERGUARD analyzes the threat and speaks out the exact immediate defense.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setSelectedLang(selectedLang === 'en' ? 'hi' : 'en')}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              {selectedLang === 'en' ? 'Switch to Hindi (हिन्दी)' : 'Switch to English'}
            </button>
            <button
              onClick={() => {
                if (advisoryResult) {
                  const txt = selectedLang === 'hi' ? advisoryResult.speech_text_hi : advisoryResult.speech_text_en;
                  speakWarning(txt, selectedLang);
                }
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                isSpeaking
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-cyan-950 border border-cyan-700/60 text-cyan-300 hover:bg-cyan-900/60'
              }`}
            >
              {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              <span>{isSpeaking ? 'Stop Audio' : 'Speak Warning'}</span>
            </button>
          </div>
        </div>

        {/* Quick Scenario Buttons */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Quick Emergency Scenarios:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { label: '🚨 Maine OTP de diya, paise kat gaye!', q: 'Maine OTP de diya, paise kat gaye' },
              { label: '👮 Digital Arrest call aaya hai police se', q: 'Digital arrest call aaya hai police se' },
              { label: '⚡ Electricity bill cut hone ka SMS', q: 'Electricity bill cut hone ka message aaya' },
              { label: '💼 Part-time job YouTube like scam', q: 'Part time job YouTube like karne se paise milenge?' },
            ].map((sc, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(sc.q);
                  handleAskAdvisor(sc.q);
                }}
                className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-cyan-500/50 hover:text-white transition"
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your situation (e.g. 'Received a parcel summons call from Delhi Customs')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskAdvisor(query)}
            className="flex-1 rounded-xl border border-slate-800 bg-slate-950 pl-4 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
          <button
            onClick={() => handleAskAdvisor(query)}
            disabled={isAdvising}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition flex-shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isAdvising ? 'Analyzing...' : 'Ask Advisory'}</span>
          </button>
        </div>

        {/* Advisory Response Display */}
        {advisoryResult && (
          <div
            className={`rounded-2xl border p-4 space-y-3 animate-in fade-in duration-300 ${
              advisoryResult.urgency_level === 'CRITICAL'
                ? 'bg-rose-950/40 border-rose-800/80'
                : 'bg-slate-950/80 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  advisoryResult.urgency_level === 'CRITICAL'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {advisoryResult.urgency_level} PROTOCOL ACTIVE
              </span>
              <button
                onClick={() => {
                  const txt = selectedLang === 'hi' ? advisoryResult.speech_text_hi : advisoryResult.speech_text_en;
                  speakWarning(txt, selectedLang);
                }}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>Listen Aloud</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {selectedLang === 'hi' ? advisoryResult.answer_hi : advisoryResult.answer_en}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1.5">
                  1. Immediate Defense Steps:
                </span>
                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                  {advisoryResult.immediate_actions.map((act, idx) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1.5">
                  2. Official Helpline Protocol:
                </span>
                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                  {advisoryResult.helpline_actions.map((act, idx) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Two Column Grid: FIR Dossier Generator & Immediate Bank Freeze Notice */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: 1-Click Law Enforcement FIR Dossier Generator */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">1-Click Cybercrime FIR Dossier Generator</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Creates formal complaint compliant with Section 66D IT Act for submission to cybercrime.gov.in.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Threat / Incident Modus:</label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                >
                  <option value="BANKING_FRAUD">Banking Phishing / KYC</option>
                  <option value="VISHING_OTP">Jamtara Vishing OTP Coercion</option>
                  <option value="DIGITAL_ARREST">Fake Digital Arrest Summons</option>
                  <option value="SEXTORTION">Mewat Video Call Sextortion</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Account Last 4 Digits:</label>
                <input
                  type="text"
                  value={accountLast4}
                  onChange={(e) => setAccountLast4(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Suspect Calling Number:</label>
                <input
                  type="text"
                  value={suspectPhone}
                  onChange={(e) => setSuspectPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Suspect Fraudulent UPI:</label>
                <input
                  type="text"
                  value={suspectUpi}
                  onChange={(e) => setSuspectUpi(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Malicious / Phishing URL:</label>
              <input
                type="text"
                value={suspectUrl}
                onChange={(e) => setSuspectUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Disputed Amount (INR):</label>
                <input
                  type="number"
                  value={lossAmount}
                  onChange={(e) => setLossAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Victim Bank Name:</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Modus Operandi Narrative:</label>
              <textarea
                rows={2}
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs text-white"
              />
            </div>

            <button
              onClick={handleGenerateFIR}
              disabled={isGeneratingFIR}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition shadow-md shadow-cyan-500/20"
            >
              <FileText className="h-4 w-4" />
              <span>{isGeneratingFIR ? 'Compiling Legal Dossier...' : 'Generate Official FIR Package'}</span>
            </button>
          </div>

          {firResponse && (
            <div className="mt-4 rounded-2xl bg-slate-950 p-4 border border-cyan-800/60 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-cyan-300 font-bold">{firResponse.fir_reference_id}</span>
                <span className="rounded bg-emerald-950 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                  CRYPTOGRAPHICALLY SIGNED
                </span>
              </div>

              <div className="max-h-36 overflow-y-auto rounded-xl bg-slate-900 p-2.5 text-[10px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-800">
                {firResponse.formal_complaint_letter}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleDownloadFIR}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-700 transition"
                >
                  <Download className="h-3 w-3" />
                  <span>Download .txt FIR</span>
                </button>
                <button
                  onClick={handleCopyFIR}
                  className="flex items-center gap-1.5 rounded-lg border border-cyan-800 bg-cyan-950/60 px-3 py-1.5 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-900/60 transition"
                >
                  {isCopiedFIR ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{isCopiedFIR ? 'Copied' : 'Copy Complaint'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Module 2: Immediate Bank Freeze & Transaction Reversal Notice */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Bank Freeze & Reversal Notice (RBI Circular)</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Generates legal debit freeze letter to bank nodal officer for zero-liability customer protection.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Select Indian Bank:</label>
                <select
                  value={freezeBank}
                  onChange={(e) => setFreezeBank(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                >
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Disputed UPI / UTR Ref:</label>
                <input
                  type="text"
                  value={freezeTxnRef}
                  onChange={(e) => setFreezeTxnRef(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Account Number:</label>
                <input
                  type="text"
                  value={freezeAcc}
                  onChange={(e) => setFreezeAcc(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Amount to Freeze (INR):</label>
                <input
                  type="number"
                  value={freezeDisputedAmount}
                  onChange={(e) => setFreezeDisputedAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateBankFreeze}
              disabled={isGeneratingFreeze}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition shadow-md shadow-amber-500/20"
            >
              <Building2 className="h-4 w-4" />
              <span>{isGeneratingFreeze ? 'Preparing Bank Notice...' : 'Generate Official Bank Freeze Notice'}</span>
            </button>
          </div>

          {freezeResponse && (
            <div className="mt-4 rounded-2xl bg-slate-950 p-4 border border-amber-800/60 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-amber-300 font-bold">{freezeResponse.notice_id}</span>
                <span className="text-[10px] text-slate-400">{freezeResponse.urgent_bank_email}</span>
              </div>

              <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/50 text-[11px] text-amber-300">
                <strong>Emergency SMS Command:</strong> <span className="font-mono">{freezeResponse.sms_freeze_code}</span>
              </div>

              <div className="max-h-28 overflow-y-auto rounded-xl bg-slate-900 p-2.5 text-[10px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-800">
                {freezeResponse.formal_notice_text}
              </div>

              <div className="flex items-center justify-end pt-1">
                <button
                  onClick={handleCopyFreeze}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-800 bg-amber-950/60 px-3 py-1.5 text-[11px] font-semibold text-amber-300 hover:bg-amber-900/60 transition"
                >
                  {isCopiedFreeze ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{isCopiedFreeze ? 'Copied' : 'Copy Notice Text'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official Indian Cyber Emergency Helplines Directory */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PhoneCall className="h-4 w-4 text-emerald-400" />
            <span>Official Government Cyber Emergency Directory (Republic of India)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Key national reporting agencies for instant account freezing, SIM blacklisting, and forensic escalation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {helplines.map((hl, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 flex flex-col justify-between space-y-2 hover:border-slate-700 transition"
            >
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 block">{hl.jurisdiction}</span>
                <h4 className="text-xs font-bold text-white mt-1">{hl.agency}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{hl.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="font-mono text-sm font-extrabold text-emerald-400">{hl.number}</span>
                <a
                  href={hl.portal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
                >
                  <span>Portal</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
