import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  User,
  Zap,
} from 'lucide-react';
import type { AttackStoryStep } from '../../types/attackChain';

interface StoryControllerProps {
  currentStep: number;
  totalSteps: number;
  stepDetail: AttackStoryStep;
  onStepChange: (step: number) => void;
  onReset: () => void;
  isCompleted: boolean;
}

export const StoryController: React.FC<StoryControllerProps> = ({
  currentStep,
  totalSteps,
  stepDetail,
  onStepChange,
  onReset,
  isCompleted,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Auto-play timer
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isPlaying) {
      if (currentStep >= totalSteps) {
        setIsPlaying(false);
      } else {
        const intervalMs = playbackSpeed === 1 ? 3000 : 1500;
        timer = setTimeout(() => {
          onStepChange(currentStep + 1);
        }, intervalMs);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, totalSteps, playbackSpeed, onStepChange]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      onStepChange(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl space-y-4">
      {/* Top Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-cyan-950 px-2.5 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-800/60">
              15-STEP CONNECTED CYBER ATTACK STORY
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <h2 className="text-base font-extrabold text-white mt-1 flex items-center gap-2">
            <span>{stepDetail.title}</span>
          </h2>
        </div>

        {/* Playback Button Group */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrev}
            disabled={currentStep <= 1 || isPlaying}
            className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-300 hover:text-white disabled:opacity-40 transition"
            title="Previous Step"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500 transition"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>{isCompleted ? 'Replay Simulation' : 'Auto Play'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            disabled={currentStep >= totalSteps || isPlaying}
            className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-300 hover:text-white disabled:opacity-40 transition"
            title="Next Step"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              onReset();
            }}
            className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-400 hover:text-white transition"
            title="Reset Simulation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Speed toggle */}
          <button
            onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 2 : 1)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-[11px] font-mono font-bold text-cyan-400 hover:bg-slate-800 transition"
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>

      {/* 15-Step Progress Scrubber */}
      <div>
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => {
            const isCurrent = s === currentStep;
            const isPassed = s < currentStep;

            return (
              <button
                key={s}
                onClick={() => {
                  setIsPlaying(false);
                  onStepChange(s);
                }}
                className={`flex-1 min-w-[20px] h-3 rounded-full transition-all duration-300 ${
                  isCurrent
                    ? 'bg-cyan-400 ring-2 ring-cyan-300 ring-offset-2 ring-offset-slate-950 scale-110'
                    : isPassed
                    ? s === 15
                      ? 'bg-emerald-500'
                      : s >= 9
                      ? 'bg-rose-500'
                      : s >= 4
                      ? 'bg-amber-500'
                      : 'bg-cyan-600'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
                title={`Step ${s}`}
              />
            );
          })}
        </div>
      </div>

      {/* Dual Perspective: Attacker Action vs Victim Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Attacker View */}
        <div className="rounded-2xl border border-rose-900/40 bg-rose-950/20 p-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-rose-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <Zap className="h-3.5 w-3.5 text-rose-400" />
              <span>Attacker Action (Kill-Chain)</span>
            </span>
            <span className="rounded bg-rose-950 px-2 py-0.5 font-mono text-[9px] font-bold text-rose-300 border border-rose-800/60">
              {stepDetail.mitre_id} • {stepDetail.mitre_technique}
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {stepDetail.attacker_action}
          </p>
        </div>

        {/* Victim Impact View */}
        <div className="rounded-2xl border border-cyan-900/40 bg-cyan-950/20 p-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <User className="h-3.5 w-3.5 text-cyan-400" />
              <span>Citizen / Victim Experience</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Source: <strong className="text-slate-200">{stepDetail.source}</strong>
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {stepDetail.victim_impact}
          </p>
        </div>
      </div>
    </div>
  );
};
