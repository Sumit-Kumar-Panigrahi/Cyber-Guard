import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Play, Square, Radio, AlertCircle } from 'lucide-react';

interface SpeechAlertPlayerProps {
  speechTextEn: string;
  speechTextHi: string;
  autoPlay?: boolean;
}

export const SpeechAlertPlayer: React.FC<SpeechAlertPlayerProps> = ({
  speechTextEn,
  speechTextHi,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [lang, setLang] = useState<'hi' | 'en'>('hi'); // Default to Hindi
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [hindiVoiceAvailable, setHindiVoiceAvailable] = useState<boolean>(true);
  const [englishVoiceAvailable, setEnglishVoiceAvailable] = useState<boolean>(true);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const activeText = lang === 'hi' ? speechTextHi : speechTextEn;

  // Detect and catalog available browser voices
  const populateVoices = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setHindiVoiceAvailable(false);
      setEnglishVoiceAvailable(false);
      return;
    }

    const available = window.speechSynthesis.getVoices();
    setVoices(available);

    const hasHindi = available.some(
      (v) =>
        v.lang === 'hi-IN' ||
        v.lang === 'hi_IN' ||
        v.lang.toLowerCase().startsWith('hi') ||
        v.name.toLowerCase().includes('hindi')
    );

    const hasEnglish = available.some(
      (v) => v.lang.toLowerCase().startsWith('en')
    );

    setHindiVoiceAvailable(hasHindi);
    setEnglishVoiceAvailable(hasEnglish);
  }, []);

  useEffect(() => {
    populateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [populateVoices]);

  // Clean stop
  const handleStop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis || isMuted) return;

    handleStop(); // Stop any active speech

    if (!activeText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(activeText);
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    if (lang === 'hi') {
      // Find true Hindi voice
      const hiVoice = voices.find(
        (v) =>
          v.lang === 'hi-IN' ||
          v.lang === 'hi_IN' ||
          v.lang.toLowerCase().startsWith('hi') ||
          v.name.toLowerCase().includes('hindi')
      );

      if (hiVoice) {
        utterance.voice = hiVoice;
        utterance.lang = hiVoice.lang;
      } else {
        // Fallback: Hindi voice is not available in browser.
        // Never speak Hindi using an English voice, show graceful notice
        setHindiVoiceAvailable(false);
        return;
      }
    } else {
      // Prefer Indian English, then standard English
      const enVoice =
        voices.find((v) => v.lang === 'en-IN' || v.name.toLowerCase().includes('india')) ||
        voices.find((v) => v.lang === 'en-US' || v.lang === 'en-GB') ||
        voices.find((v) => v.lang.toLowerCase().startsWith('en'));

      if (enVoice) {
        utterance.voice = enVoice;
        utterance.lang = enVoice.lang;
      } else {
        utterance.lang = 'en-US';
      }
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (e) => {
      console.warn('Speech synthesis playback error:', e);
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const isCurrentVoiceUnavailable = lang === 'hi' ? !hindiVoiceAvailable : !englishVoiceAvailable;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Radio className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Bilingual Voice Warning Engine</span>
              <span className="rounded bg-rose-950 px-1.5 py-0.5 text-[9px] font-bold text-rose-400 border border-rose-800/60">
                LIVE SPEECH
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">Speaks critical warnings in native Hindi & Indian English</p>
          </div>
        </div>

        {/* Language switch */}
        <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px] self-start sm:self-auto">
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
        <p className="text-xs text-slate-200 leading-relaxed font-sans">
          "{activeText}"
        </p>
      </div>

      {/* Voice Status Alert if unavailable on device */}
      {isCurrentVoiceUnavailable && (
        <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-amber-950/40 border border-amber-800/40 px-3 py-1.5 text-[11px] text-amber-300">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>
            {lang === 'hi'
              ? 'आपके ब्राउज़र में हिंदी टीटीएस वॉयस (hi-IN) उपलब्ध नहीं है। टेक्स्ट मोड सक्रिय है।'
              : 'English voice synthesizer unavailable in browser. Text mode active.'}
          </span>
        </div>
      )}

      {/* Audio controls & Visualizer */}
      <div className="mt-3 flex items-center justify-between gap-3">
        {/* Animated sound wave bars */}
        <div className="flex items-center gap-1 h-6 px-1">
          <span className={`w-1 rounded-full bg-cyan-400 ${isPlaying ? 'audio-bar-1' : 'h-1.5'}`} />
          <span className={`w-1 rounded-full bg-cyan-400 ${isPlaying ? 'audio-bar-2' : 'h-2'}`} />
          <span className={`w-1 rounded-full bg-cyan-400 ${isPlaying ? 'audio-bar-3' : 'h-1'}`} />
          <span className={`w-1 rounded-full bg-cyan-400 ${isPlaying ? 'audio-bar-4' : 'h-2.5'}`} />
          <span className={`w-1 rounded-full bg-cyan-400 ${isPlaying ? 'audio-bar-2' : 'h-1.5'}`} />
          <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
            {isPlaying ? 'Speaking Warning...' : (isCurrentVoiceUnavailable ? 'Text Mode' : 'Audio Ready')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isPlaying) handleStop();
              setIsMuted(!isMuted);
            }}
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
              <span>{lang === 'hi' ? 'रोकें (Stop)' : 'Stop Voice'}</span>
            </button>
          ) : (
            <button
              onClick={handleSpeak}
              disabled={isCurrentVoiceUnavailable || isMuted}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 transition"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{lang === 'hi' ? '🔊 सुनें (Listen)' : '🔊 Speak Warning'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
