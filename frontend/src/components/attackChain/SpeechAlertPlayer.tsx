import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Square, Radio } from 'lucide-react';

interface SpeechAlertPlayerProps {
  speechTextEn: string;
  speechTextHi: string;
}

export const SpeechAlertPlayer: React.FC<SpeechAlertPlayerProps> = ({
  speechTextEn,
  speechTextHi,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [lang, setLang] = useState<'hi' | 'en'>('hi'); // Default Hindi for Indian citizen clarity
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const activeText = lang === 'hi' ? speechTextHi : speechTextEn;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (!window.speechSynthesis || isMuted) return;

    window.speechSynthesis.cancel(); // Cancel any existing speech

    const utterance = new SpeechSynthesisUtterance(activeText);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    // Pick suitable voice if available
    const voices = window.speechSynthesis.getVoices();
    if (lang === 'hi') {
      const hiVoice = voices.find((v) => v.lang.includes('hi') || v.lang.includes('IN'));
      if (hiVoice) utterance.voice = hiVoice;
      utterance.lang = 'hi-IN';
    } else {
      const enInVoice = voices.find((v) => v.lang.includes('en-IN') || v.name.includes('India'));
      if (enInVoice) utterance.voice = enInVoice;
      utterance.lang = 'en-IN';
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Radio className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Bilingual Voice Warning Engine</span>
              <span className="rounded bg-rose-950 px-1.5 py-0.2 text-[9px] font-bold text-rose-400 border border-rose-800/60">
                LIVE SPEECH
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">Speaks critical warnings in native Hindi & Indian English</p>
          </div>
        </div>

        {/* Language switch */}
        <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px]">
          <button
            onClick={() => {
              handleStop();
              setLang('hi');
            }}
            className={`px-2.5 py-1 rounded-md font-semibold transition ${
              lang === 'hi' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            हिंदी (Hindi)
          </button>
          <button
            onClick={() => {
              handleStop();
              setLang('en');
            }}
            className={`px-2.5 py-1 rounded-md font-semibold transition ${
              lang === 'en' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Spoken script text preview */}
      <div className="mt-3 rounded-xl bg-slate-950/80 p-3 border border-slate-800/80">
        <p className="text-xs text-slate-200 leading-relaxed font-sans italic">
          "{activeText}"
        </p>
      </div>

      {/* Audio controls & Visualizer */}
      <div className="mt-3 flex items-center justify-between gap-3">
        {/* Animated sound wave bars */}
        <div className="flex items-center gap-1 h-6 px-2">
          <span className={`w-1 rounded-full bg-cyan-400 ${isPlaying ? 'audio-bar-1' : 'h-1.5'}`} />
          <span className={`w-1 rounded-full bg-cyan-400 ${isPlaying ? 'audio-bar-2' : 'h-2'}`} />
          <span className={`w-1 rounded-full bg-cyan-400 ${isPlaying ? 'audio-bar-3' : 'h-1'}`} />
          <span className={`w-1 rounded-full bg-cyan-400 ${isPlaying ? 'audio-bar-4' : 'h-2.5'}`} />
          <span className={`w-1 rounded-full bg-cyan-400 ${isPlaying ? 'audio-bar-2' : 'h-1.5'}`} />
          <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
            {isPlaying ? 'Speaking Warning...' : 'Audio Ready'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-400 hover:text-white transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>

          {isPlaying ? (
            <button
              onClick={handleStop}
              className="flex items-center gap-1.5 rounded-xl border border-rose-800/80 bg-rose-950/80 px-3.5 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-900 transition"
            >
              <Square className="h-3.5 w-3.5" />
              <span>Stop Voice</span>
            </button>
          ) : (
            <button
              onClick={handleSpeak}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500 transition"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Speak Warning</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
