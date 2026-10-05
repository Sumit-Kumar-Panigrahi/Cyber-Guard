import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  MessageSquare,
  Mail,
  Compass,
  Share2,
  PhoneCall,
  Fingerprint,
  Smartphone,
  CheckCircle,
  Trash2,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { useConsent } from '../../context/ConsentContext';
import { useAuth } from '../../context/AuthContext';
import type { ConsentUpdatePayload } from '../../types/consent';


interface PermissionCardProps {
  id: keyof ConsentUpdatePayload;
  title: string;
  description: string;
  protectionDetails: string;
  icon: React.ElementType;
  enabled: boolean;
  onToggle: (id: keyof ConsentUpdatePayload, val: boolean) => void;
  badge?: string;
}

const PermissionCard: React.FC<PermissionCardProps> = ({
  id,
  title,
  description,
  protectionDetails,
  icon: Icon,
  enabled,
  onToggle,
  badge,
}) => {
  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        enabled
          ? 'border-cyan-500/40 bg-slate-900/90 shadow-lg shadow-cyan-500/5'
          : 'border-slate-800 bg-slate-950/60 opacity-80 hover:opacity-100'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition ${
              enabled
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-800/80 text-slate-500 border border-slate-700/60'
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              {badge && (
                <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-[10px] font-medium text-cyan-400 border border-cyan-800/40">
                  {badge}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">{description}</p>
            <p className="mt-1.5 text-[11px] text-cyan-400/90 font-mono">
              🛡️ {protectionDetails}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <label className="relative inline-flex cursor-pointer items-center flex-shrink-0 mt-1">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(id, e.target.checked)}
            className="peer sr-only"
          />
          <div className="h-6 w-11 rounded-full bg-slate-800 peer-checked:bg-cyan-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
        </label>
      </div>
    </div>
  );
};

export const ConsentCenter: React.FC = () => {
  const { consent, updateToggle, purgeFaceData } = useConsent();
  const { user } = useAuth();

  const navigate = useNavigate();
  const [purgeMessage, setPurgeMessage] = useState<string | null>(null);

  const handleToggle = async (key: keyof ConsentUpdatePayload, val: boolean) => {
    try {
      await updateToggle(key, val);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePurgeBiometrics = async () => {
    try {
      await purgeFaceData();
      setPurgeMessage('Biometric face embeddings permanently purged from system.');
      setTimeout(() => setPurgeMessage(null), 4000);
    } catch (e) {
      setPurgeMessage('Failed to purge biometric embeddings.');
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Hero / Privacy Charter */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-800/60 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-400">
              <Lock className="h-3.5 w-3.5" />
              <span>Permission-First Architecture</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Your Protection Starts With Your Permission
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Hello <span className="font-semibold text-cyan-400">{user?.full_name}</span>. CYBERGUARD operates on strict zero-trust privacy. You hold full custody over which channels feed our AI Attack Chain Engine.
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition self-start md:self-auto"
          >
            <span>Enter Protection Center</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* 5 Core Privacy Guarantees */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2.5 rounded-xl bg-slate-950/60 p-3 border border-slate-800/60 text-xs text-slate-300">
            <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>Raw messages not stored</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl bg-slate-950/60 p-3 border border-slate-800/60 text-xs text-slate-300">
            <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>Call audio not stored</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl bg-slate-950/60 p-3 border border-slate-800/60 text-xs text-slate-300">
            <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>Face photos not stored</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl bg-slate-950/60 p-3 border border-slate-800/60 text-xs text-slate-300">
            <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>Only indicators/events kept</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl bg-slate-950/60 p-3 border border-slate-800/60 text-xs text-slate-300">
            <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>Opt-in & instantly deletable</span>
          </div>
        </div>
      </div>

      {/* Granular Source Controls */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <span>Per-Source Protection Controls</span>
          </h2>
          <span className="text-xs text-slate-400">
            Active Shields: {Object.values(consent || {}).filter(Boolean).length} of 7
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PermissionCard
            id="messages_enabled"
            title="SMS & Hinglish Scam Protection"
            description="Analyzes incoming SMS for urgent bank KYC threats, electricity bill suspension scams, and lookalike links."
            protectionDetails="Real NLP with Hindi, Hinglish & English token classification"
            icon={MessageSquare}
            enabled={!!consent?.messages_enabled}
            onToggle={handleToggle}
            badge="Essential"
          />

          <PermissionCard
            id="browser_protection_enabled"
            title="Browser & Pay-Safe Protection"
            description="Guards against deceptive lookalike banking domains, phishing landing pages, and credential harvesting forms."
            protectionDetails="Homograph, Levenshtein & SSL anomaly heuristics"
            icon={Compass}
            enabled={!!consent?.browser_protection_enabled}
            onToggle={handleToggle}
            badge="Pay-Safe"
          />

          <PermissionCard
            id="social_share_enabled"
            title="Social Media / Share-to-CYBERGUARD"
            description="Allows instant threat analysis when sharing suspicious WhatsApp, Instagram, or Telegram messages to CYBERGUARD."
            protectionDetails="Zero read of private chats; analyzes only explicitly shared content"
            icon={Share2}
            enabled={!!consent?.social_share_enabled}
            onToggle={handleToggle}
          />

          <PermissionCard
            id="call_guard_enabled"
            title="Call Guard (Scam Call & OTP Lure)"
            description="Identifies high-urgency call transcripts where callers impersonate bank managers or police demanding OTPs."
            protectionDetails="Transcript pressure analysis; raw telephony audio is NEVER recorded"
            icon={PhoneCall}
            enabled={!!consent?.call_guard_enabled}
            onToggle={handleToggle}
            badge="Audio Guard"
          />

          <PermissionCard
            id="login_security_enabled"
            title="Login & Unknown Device Security"
            description="Tracks device fingerprints and geographical leaps using Isolation Forest anomaly detection to catch Account Takeover."
            protectionDetails="Isolation Forest unsupervised behavioural model"
            icon={Smartphone}
            enabled={consent?.login_security_enabled ?? true}
            onToggle={handleToggle}
            badge="Recommended"
          />

          <PermissionCard
            id="email_enabled"
            title="Email Spearphishing Shield"
            description="Inspects sender domains, display name spoofing, and malicious attachments for targeted executive fraud."
            protectionDetails="SPF/DKIM inspection & payload token matching"
            icon={Mail}
            enabled={!!consent?.email_enabled}
            onToggle={handleToggle}
          />

          <PermissionCard
            id="identity_monitoring_enabled"
            title="Identity Monitoring & Face Consent Alert"
            description="Alerts you if your Aadhaar, PAN, phone number or registered biometric hash appears in unauthorized queries."
            protectionDetails="Cryptographic hash matching with opt-in biometric vector"
            icon={Fingerprint}
            enabled={!!consent?.identity_monitoring_enabled}
            onToggle={handleToggle}
          />
        </div>
      </div>

      {/* Biometric Opt-in & Purge Box */}
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-cyan-400" />
              <span>Face Embedding & Biometric Consent Management</span>
            </h4>
            <p className="text-xs text-slate-400">
              Biometric face representation is strictly opt-in. We never save raw face images. You can permanently wipe embeddings at any time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePurgeBiometrics}
              className="flex items-center gap-1.5 rounded-xl border border-rose-900/60 bg-rose-950/30 px-3.5 py-2 text-xs font-medium text-rose-300 hover:bg-rose-900/50 hover:text-white transition"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-400" />
              <span>Purge Biometric Data</span>
            </button>
          </div>
        </div>

        {purgeMessage && (
          <div className="mt-3 rounded-lg bg-emerald-950/60 border border-emerald-800/40 p-2.5 text-xs text-emerald-300">
            {purgeMessage}
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-xs font-bold text-white shadow-xl shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500 transition"
        >
          <span>Save & Proceed to Protection Center</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
