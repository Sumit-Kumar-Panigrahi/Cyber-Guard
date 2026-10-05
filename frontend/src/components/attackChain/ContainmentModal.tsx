import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  ShieldAlert,
  X,
  CheckCircle2,
  Lock,
  Globe,
  Radio,
} from 'lucide-react';
import { attackChainService } from '../../services/attackChainService';
import type { ContainmentResult } from '../../types/attackChain';

interface ContainmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  chainId: string;
  onSuccess: (result: ContainmentResult) => void;
}

export const ContainmentModal: React.FC<ContainmentModalProps> = ({
  isOpen,
  onClose,
  chainId,
  onSuccess,
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<ContainmentResult | null>(null);

  if (!isOpen) return null;

  const handleExecuteContainment = async () => {
    setIsExecuting(true);
    try {
      const res = await attackChainService.containChain(
        chainId,
        'Authorized 1-click active isolation to prevent impending financial exfiltration'
      );
      setResult(res);

      // Trigger celebratory defense confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#3b82f6', '#10b981'],
      });

      onSuccess(res);
    } catch (err) {
      console.error('Failed to contain chain:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Execute 1-Click Attack Containment</h3>
              <p className="text-xs text-slate-400">Zero-Trust Pre-emptive Incident Response</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!result ? (
          <div className="mt-4 space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Confirming this action will immediately dispatch active defensive countermeasures across your identity perimeter to neutralize this attack chain:
            </p>

            {/* Actions List */}
            <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-xs">
              <div className="flex items-center gap-2.5 text-slate-200">
                <Lock className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                <span>Force terminate and revoke all active unauthorized login sessions.</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <Globe className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                <span>Push DNS sinkhole and firewall drop rule for malicious host.</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <Radio className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                <span>Enforce 24-hour enhanced 2FA biometric verification on banking operations.</span>
              </div>
            </div>

            <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-3 text-[11px] text-amber-300">
              <strong>Zero False-Positive Safety:</strong> Your genuine devices will remain authenticated. Only anomalous session tokens and unauthorized IP addresses are invalidated.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteContainment}
                disabled={isExecuting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/25 hover:from-rose-500 hover:to-red-500 transition disabled:opacity-50"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>{isExecuting ? 'Isolating Threat Perimeter...' : 'Confirm 1-Click Isolation'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4 animate-fade-in text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
              <ShieldCheck className="h-8 w-8" />
            </div>

            <h4 className="text-base font-bold text-white">Attack Chain Successfully Neutralized!</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              All unauthorized connections have been severed. Your bank accounts and personal identity are secured.
            </p>

            <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-4 text-left space-y-1.5 text-xs text-emerald-200">
              <p className="font-semibold text-emerald-300 mb-1">Actions Executed:</p>
              {result.actions_taken.map((action, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{action}</span>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-xl bg-cyan-600 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 transition"
            >
              Done & Return to Shield
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
