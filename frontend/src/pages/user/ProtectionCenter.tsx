import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  Lock,
  Compass,
  MessageSquare,
  PhoneCall,
  Smartphone,
  Share2,
  GitBranch,
  Sparkles,
  AlertTriangle,
  Activity,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useConsent } from '../../context/ConsentContext';
import { ThreatTestbenchModal } from '../../components/threats/ThreatTestbenchModal';
import { MobilePhoneFrame } from '../../components/simulation/MobilePhoneFrame';
import { WhatsAppShareModal } from '../../components/simulation/WhatsAppShareModal';
import { analysisService, type SecurityEventItem, type AnalysisResult } from '../../services/analysisService';
import { attackChainService } from '../../services/attackChainService';
import type { AttackChainDetail } from '../../types/attackChain';

export const ProtectionCenter: React.FC = () => {
  const { user } = useAuth();
  const { consent } = useConsent();
  const navigate = useNavigate();

  // Active View Tab: 'overview' | 'simulator' | 'events'
  const [activeTab, setActiveTab] = useState<'overview' | 'simulator' | 'events'>('overview');

  // Modal States
  const [isTestbenchOpen, setIsTestbenchOpen] = useState(false);
  const [testbenchTab, setTestbenchTab] = useState<'message' | 'url' | 'call' | 'social'>('message');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Live Dynamic Data states
  const [recentEvents, setRecentEvents] = useState<SecurityEventItem[]>([]);
  const [activeChain, setActiveChain] = useState<AttackChainDetail | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingChain, setIsLoadingChain] = useState(false);

  // Notification Toast State
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'alert' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'alert' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Dynamic Time-of-Day Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Fetch real security events from backend
  const loadRecentEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    try {
      const events = await analysisService.fetchSecurityEvents(10);
      setRecentEvents(events);
    } catch (err) {
      console.error('Failed to load recent events:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  // Fetch active attack chain from backend
  const loadActiveChain = useCallback(async () => {
    setIsLoadingChain(true);
    try {
      const chain = await attackChainService.fetchActiveChain();
      setActiveChain(chain);
    } catch (err) {
      console.error('Failed to load active chain:', err);
    } finally {
      setIsLoadingChain(false);
    }
  }, []);

  useEffect(() => {
    loadRecentEvents();
    loadActiveChain();
  }, [loadRecentEvents, loadActiveChain]);

  // Compute live dynamic risk scores
  // If active chain has scores, bind to them. Otherwise calculate from recent events
  const computedHumanRisk = activeChain
    ? activeChain.human_risk_score
    : recentEvents.length > 0
    ? Math.min(100, Math.round(recentEvents.reduce((acc, e) => acc + (e.source.includes('SMS') || e.source.includes('WhatsApp') || e.source.includes('CALL') ? e.risk_score * 0.3 : 0), 12)))
    : 14;

  const computedTechRisk = activeChain
    ? activeChain.tech_risk_score
    : recentEvents.length > 0
    ? Math.min(100, Math.round(recentEvents.reduce((acc, e) => acc + (e.source.includes('URL') || e.source.includes('LOGIN') ? e.risk_score * 0.3 : 0), 8)))
    : 10;

  // Compute active shields count
  const activeShieldsCount = consent
    ? Object.entries(consent).filter(([k, v]) => k.endsWith('_enabled') && v === true).length
    : 7;

  const handleThreatIngested = (res: AnalysisResult) => {
    showNotification(`New security signal ingested: ${res.category.replace(/_/g, ' ')} (Risk: ${res.risk_score})`, res.risk_score >= 70 ? 'alert' : 'success');
    loadRecentEvents();
    loadActiveChain();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Dynamic Toast Notification */}
      {notification && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-top duration-300 ${
          notification.type === 'alert'
            ? 'bg-rose-950/90 border-rose-700/60 text-rose-200'
            : 'bg-emerald-950/90 border-emerald-700/60 text-emerald-200'
        }`}>
          {notification.type === 'alert' ? <AlertTriangle className="h-4 w-4 text-rose-400" /> : <CheckCircle className="h-4 w-4 text-emerald-400" />}
          <span className="text-xs font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Top Banner / Dynamic User Identity */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Zero-Trust Protection Active
              </span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                Session ID: {user?.id.slice(0, 8)}...
              </span>
            </div>

            {/* DYNAMIC USER GREETING - STRICTLY BOUND TO AUTHENTICATED USER */}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {getGreeting()},{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                {user?.full_name || 'Protected User'}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Your personalized multi-layered defence engine is analyzing live signals across messaging, web, and device sessions. All telemetry is filtered through your active privacy permissions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-cyan-800/80 bg-cyan-950/60 px-4 py-2.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/60 transition shadow-sm"
            >
              <Share2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Share to CYBERGUARD</span>
            </button>
            <button
              onClick={() => {
                setTestbenchTab('message');
                setIsTestbenchOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Threat Testbench</span>
            </button>
            <button
              onClick={() => navigate('/attack-chain')}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500 transition"
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span>Attack Chain Story</span>
            </button>
          </div>
        </div>

        {/* Ambient Decorative Glow */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Tab Selector: Overview / Mobile Simulator / Live Events */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'overview'
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-700/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Protection Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'simulator'
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-700/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Interactive Mobile Simulator</span>
            <span className="rounded-full bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 text-[9px]">PHASE 5</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'events'
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-700/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Live Security Signals ({recentEvents.length})</span>
          </button>
        </div>

        <button
          onClick={() => {
            loadRecentEvents();
            loadActiveChain();
          }}
          title="Refresh Telemetry"
          className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-900 rounded-lg transition"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingEvents || isLoadingChain ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Primary Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Human Risk Score Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Human Risk Score</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                  computedHumanRisk >= 70
                    ? 'bg-rose-950 text-rose-400 border-rose-800/40'
                    : computedHumanRisk >= 40
                    ? 'bg-amber-950 text-amber-400 border-amber-800/40'
                    : 'bg-emerald-950 text-emerald-400 border-emerald-800/40'
                }`}>
                  {computedHumanRisk >= 70 ? 'High Risk' : computedHumanRisk >= 40 ? 'Moderate' : 'Low Threat'}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{computedHumanRisk}</span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Calculated from scam susceptibility, Hindi/Hinglish message exposure, and OTP verification vigilance.
              </p>
              <div className="mt-3 h-1.5 w-full rounded-full bg-slate-800">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    computedHumanRisk >= 70 ? 'bg-rose-500' : computedHumanRisk >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.max(5, computedHumanRisk)}%` }}
                />
              </div>
            </div>

            {/* Technical Risk Score */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Technical Risk Score</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                  computedTechRisk >= 70
                    ? 'bg-rose-950 text-rose-400 border-rose-800/40'
                    : computedTechRisk >= 40
                    ? 'bg-amber-950 text-amber-400 border-amber-800/40'
                    : 'bg-cyan-950 text-cyan-400 border-cyan-800/40'
                }`}>
                  {computedTechRisk >= 70 ? 'Critical' : computedTechRisk >= 40 ? 'Elevated' : 'Secure'}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{computedTechRisk}</span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Based on device anomaly baseline, browser URL safety, and active session integrity.
              </p>
              <div className="mt-3 h-1.5 w-full rounded-full bg-slate-800">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    computedTechRisk >= 70 ? 'bg-rose-500' : computedTechRisk >= 40 ? 'bg-amber-500' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${Math.max(5, computedTechRisk)}%` }}
                />
              </div>
            </div>

            {/* Active Shields Count */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Active Protection Shields</span>
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{activeShieldsCount}</span>
                <span className="text-xs text-slate-500">/ 7 Active</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Controlled via your zero-trust permission center. Real-time telemetry ingestion active.
              </p>
              <button
                onClick={() => navigate('/consent')}
                className="mt-3 text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Configure Shields</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>

            {/* Attack Chain Status */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Attack Chain Status</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                  activeChain?.status === 'ACTIVE'
                    ? 'bg-rose-950 text-rose-400 border-rose-800/40 animate-pulse'
                    : activeChain?.status === 'CONTAINED'
                    ? 'bg-cyan-950 text-cyan-400 border-cyan-800/40'
                    : 'bg-emerald-950 text-emerald-400 border-emerald-800/40'
                }`}>
                  {activeChain?.status || 'Clear'}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-lg font-bold text-white truncate">
                  {activeChain ? activeChain.current_stage : 'No Active Chains'}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400 truncate">
                {activeChain ? activeChain.predicted_next_stage : 'All attack paths neutralized.'}
              </p>
              <button
                onClick={() => navigate('/attack-chain')}
                className="mt-3 text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Open Attack Chain Demo</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Quick Interactive Mobile Sandbox Preview Banner */}
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Interactive Mobile Threat Sandbox</span>
                  <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-800/50">
                    PHASE 5 LIVE
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Simulate receiving WhatsApp scam forwards, fake bank KYC SMS, Jamtara voice calls, and Instagram ads on a virtual smartphone. Experience the 1-Click "Share to CYBERGUARD" hybrid ingestion flow!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('simulator')}
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20 transition flex-shrink-0"
              >
                <Smartphone className="h-4 w-4" />
                <span>Launch Mobile Sandbox</span>
              </button>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition flex-shrink-0"
              >
                <Share2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Share Sheet</span>
              </button>
            </div>
          </div>

          {/* Live Protection Status Per Channel */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="h-4 w-4 text-cyan-400" />
                  <span>Multi-Source Defense Status</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Per-channel protection active in compliance with your privacy preferences
                </p>
              </div>
              <button onClick={() => navigate('/consent')} className="text-xs text-cyan-400 hover:underline">
                Edit Permissions
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              <div className={`p-3 rounded-xl border text-center transition ${
                consent?.messages_enabled ? 'bg-slate-900 border-cyan-500/30 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                <MessageSquare className="h-4 w-4 mx-auto mb-1.5 text-cyan-400" />
                <p className="text-[11px] font-semibold">SMS / Hinglish</p>
                <span className={`text-[10px] ${consent?.messages_enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {consent?.messages_enabled ? 'Guarded' : 'Disabled'}
                </span>
              </div>

              <div className={`p-3 rounded-xl border text-center transition ${
                consent?.browser_protection_enabled ? 'bg-slate-900 border-cyan-500/30 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                <Compass className="h-4 w-4 mx-auto mb-1.5 text-cyan-400" />
                <p className="text-[11px] font-semibold">Pay-Safe Web</p>
                <span className={`text-[10px] ${consent?.browser_protection_enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {consent?.browser_protection_enabled ? 'Guarded' : 'Disabled'}
                </span>
              </div>

              <div className={`p-3 rounded-xl border text-center transition ${
                consent?.social_share_enabled ? 'bg-slate-900 border-cyan-500/30 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                <Share2 className="h-4 w-4 mx-auto mb-1.5 text-cyan-400" />
                <p className="text-[11px] font-semibold">WhatsApp Share</p>
                <span className={`text-[10px] ${consent?.social_share_enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {consent?.social_share_enabled ? 'Guarded' : 'Disabled'}
                </span>
              </div>

              <div className={`p-3 rounded-xl border text-center transition ${
                consent?.call_guard_enabled ? 'bg-slate-900 border-cyan-500/30 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                <PhoneCall className="h-4 w-4 mx-auto mb-1.5 text-cyan-400" />
                <p className="text-[11px] font-semibold">Call Guard</p>
                <span className={`text-[10px] ${consent?.call_guard_enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {consent?.call_guard_enabled ? 'Guarded' : 'Disabled'}
                </span>
              </div>

              <div className={`p-3 rounded-xl border text-center transition ${
                consent?.login_security_enabled ? 'bg-slate-900 border-cyan-500/30 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                <Smartphone className="h-4 w-4 mx-auto mb-1.5 text-cyan-400" />
                <p className="text-[11px] font-semibold">Login / Device</p>
                <span className={`text-[10px] ${consent?.login_security_enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {consent?.login_security_enabled ? 'Guarded' : 'Disabled'}
                </span>
              </div>

              <div className={`p-3 rounded-xl border text-center transition ${
                consent?.email_enabled ? 'bg-slate-900 border-cyan-500/30 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                <Lock className="h-4 w-4 mx-auto mb-1.5 text-cyan-400" />
                <p className="text-[11px] font-semibold">Email Shield</p>
                <span className={`text-[10px] ${consent?.email_enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {consent?.email_enabled ? 'Guarded' : 'Disabled'}
                </span>
              </div>

              <div className={`p-3 rounded-xl border text-center transition ${
                consent?.identity_monitoring_enabled ? 'bg-slate-900 border-cyan-500/30 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                <ShieldAlert className="h-4 w-4 mx-auto mb-1.5 text-cyan-400" />
                <p className="text-[11px] font-semibold">Identity / Face</p>
                <span className={`text-[10px] ${consent?.identity_monitoring_enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {consent?.identity_monitoring_enabled ? 'Guarded' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE MOBILE SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl animate-in fade-in duration-300">
          <div className="border-b border-slate-800 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">Simulated Mobile Device Environment</span>
                <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-800/50">
                  REAL BACKEND API INTEGRATED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Interact with the phone below: switch apps, view realistic Indian scam lures, and tap "Share to CYBERGUARD" to execute instant ML inspection.
              </p>
            </div>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-800 bg-cyan-950/60 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/60 transition self-start sm:self-auto"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Open Share Intent Dialog</span>
            </button>
          </div>

          <MobilePhoneFrame onEventCreated={handleThreatIngested} />
        </div>
      )}

      {/* TAB 3: LIVE SECURITY SIGNALS */}
      {activeTab === 'events' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Live Ingested Security Signals</h3>
              <p className="text-xs text-slate-400">
                Threat events captured from mobile shares, text analysis, and device logins
              </p>
            </div>
            <button
              onClick={() => navigate('/activity')}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              <span>View Cryptographic Audit Trail</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {recentEvents.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <ShieldCheck className="h-10 w-10 mx-auto mb-2 text-slate-600" />
              <p className="text-xs font-semibold text-slate-400">No elevated security threats recorded yet</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Use the Mobile Simulator to share a scam message and watch it appear here live!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border font-bold text-xs ${
                      evt.risk_score >= 70
                        ? 'bg-rose-950 text-rose-400 border-rose-800/60'
                        : evt.risk_score >= 40
                        ? 'bg-amber-950 text-amber-400 border-amber-800/60'
                        : 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                    }`}>
                      {evt.risk_score}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {evt.category.replace(/_/g, ' ')}
                        </span>
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] text-slate-400">
                          {evt.source}
                        </span>
                        {evt.is_simulated && (
                          <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-[9px] font-semibold text-cyan-400 border border-cyan-800/40">
                            SIMULATED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {evt.indicators && evt.indicators.length > 0
                          ? `Indicators: ${evt.indicators.slice(0, 3).join(', ')}`
                          : 'Zero-trust perimeter telemetry recorded'}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right flex-shrink-0">
                    {evt.mitre_technique_id && (
                      <span className="rounded-lg bg-indigo-950 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-800/40">
                        MITRE {evt.mitre_technique_id}
                      </span>
                    )}
                    <p className="text-[10px] text-slate-500 mt-1">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Modals */}
      <ThreatTestbenchModal
        isOpen={isTestbenchOpen}
        onClose={() => setIsTestbenchOpen(false)}
        initialTab={testbenchTab}
      />

      <WhatsAppShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onThreatDetected={handleThreatIngested}
      />
    </div>
  );
};
