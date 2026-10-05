import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Sparkles,
  Send,
  Play,
  Square,
  Lock,
  RefreshCw
} from 'lucide-react';
import { assistantService, type AssistantChatResponse, type SuggestionCategory } from '../../services/assistantService';

interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  replyHi?: string;
  replyEn?: string;
  speechTextEn?: string;
  speechTextHi?: string;
  intent?: string;
  analysis?: AssistantChatResponse['analysis'];
  sensitiveWarning?: string | null;
  timestamp: string;
}

interface SecurityAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSecurityEventCreated?: () => void;
  initialPrompt?: string;
}

export const SecurityAssistantModal: React.FC<SecurityAssistantModalProps> = ({
  isOpen,
  onClose,
  onSecurityEventCreated,
  initialPrompt
}) => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am CYBERGUARD AI, your interactive security defense assistant. You can ask me any cyber safety question, check suspicious messages, verify unexpected URLs, or report coercive calls. What would you like to inspect?",
      replyEn: "Hello! I am CYBERGUARD AI, your interactive security defense assistant. You can ask me any cyber safety question, check suspicious messages, verify unexpected URLs, or report coercive calls. What would you like to inspect?",
      replyHi: "नमस्ते! मैं साइबरगार्ड एआई (CYBERGUARD AI) हूँ, आपका इंटरैक्टिव सुरक्षा सहायक। आप मुझसे कोई भी साइबर सुरक्षा प्रश्न पूछ सकते हैं, संदिग्ध मैसेज की जांच करवा सकते हैं, या किसी अनजान लिंक का विश्लेषण कर सकते हैं।",
      speechTextEn: "Hello! I am Cyberguard AI. How can I assist with your cyber security today?",
      speechTextHi: "नमस्ते! मैं साइबरगार्ड एआई हूँ। मैं आज आपकी साइबर सुरक्षा में क्या सहायता कर सकता हूँ?",
      intent: 'WELCOME',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [selectedLang, setSelectedLang] = useState<'auto' | 'en' | 'hi'>('auto');
  const [displayLang, setDisplayLang] = useState<'en' | 'hi'>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Analyzing input...');
  const [suggestions, setSuggestions] = useState<SuggestionCategory[]>([]);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [hindiVoiceAvailable, setHindiVoiceAvailable] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load voices for speech
  const populateVoices = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const avail = window.speechSynthesis.getVoices();
    setVoices(avail);
    const hasHindi = avail.some(
      (v) =>
        v.lang === 'hi-IN' ||
        v.lang === 'hi_IN' ||
        v.lang.toLowerCase().startsWith('hi') ||
        v.name.toLowerCase().includes('hindi')
    );
    setHindiVoiceAvailable(hasHindi);
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

  // Load suggestions
  useEffect(() => {
    if (isOpen) {
      assistantService.fetchSuggestions()
        .then((res) => {
          if (res?.categories) setSuggestions(res.categories);
        })
        .catch((err) => console.warn('Suggestions load error:', err));
    }
  }, [isOpen]);

  // Handle initial prompt
  useEffect(() => {
    if (isOpen && initialPrompt) {
      setInputText(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  // Stop speech
  const handleStopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingId(null);
  }, []);

  // Speak message
  const handleSpeak = (msg: MessageItem) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    handleStopSpeech();

    const textToSpeak = displayLang === 'hi'
      ? (msg.speechTextHi || msg.replyHi || msg.text)
      : (msg.speechTextEn || msg.replyEn || msg.text);

    if (!textToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.94;
    utterance.pitch = 1.0;

    if (displayLang === 'hi') {
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
        setHindiVoiceAvailable(false);
        return;
      }
    } else {
      const enVoice =
        voices.find((v) => v.lang === 'en-IN' || v.name.toLowerCase().includes('india')) ||
        voices.find((v) => v.lang === 'en-US' || v.lang === 'en-GB') ||
        voices.find((v) => v.lang.toLowerCase().startsWith('en'));
      if (enVoice) {
        utterance.voice = enVoice;
        utterance.lang = enVoice.lang;
      }
    }

    utterance.onstart = () => setIsSpeakingId(msg.id);
    utterance.onend = () => setIsSpeakingId(null);
    utterance.onerror = () => setIsSpeakingId(null);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    handleStopSpeech();

    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // Multi-step loading progression
    setLoadingStep('Analyzing input...');
    const t1 = setTimeout(() => setLoadingStep('Extracting threat indicators...'), 350);
    const t2 = setTimeout(() => setLoadingStep('Assessing risk & intent...'), 700);
    const t3 = setTimeout(() => setLoadingStep('Generating bilingual explanation...'), 1050);

    try {
      const res = await assistantService.sendMessage(query, selectedLang);

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      const assistantMsg: MessageItem = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: displayLang === 'hi' ? res.reply_hi : res.reply_en,
        replyEn: res.reply_en,
        replyHi: res.reply_hi,
        speechTextEn: res.speech_text_en,
        speechTextHi: res.speech_text_hi,
        intent: res.intent,
        analysis: res.analysis,
        sensitiveWarning: res.sensitive_data_warning,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If language was explicitly detected as Hindi, switch active tab view
      if (res.language_detected === 'Hindi' && selectedLang === 'auto') {
        setDisplayLang('hi');
      }

      if (res.saved_event_id && onSecurityEventCreated) {
        onSecurityEventCreated();
      }
    } catch (err: any) {
      console.error('AI Assistant query failed:', err);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      const errorMsg: MessageItem = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "Unable to complete the analysis right now. Please try again in a moment.",
        replyEn: "Unable to complete the analysis right now. Please try again in a moment.",
        replyHi: "इस समय विश्लेषण पूरा करने में असमर्थ। कृपया कुछ क्षण बाद पुनः प्रयास करें।",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/80';
      case 'HIGH':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 'MEDIUM':
        return 'bg-yellow-950/80 text-yellow-300 border-yellow-800/80';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl h-[92vh] flex flex-col rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-400">
              <Sparkles className="h-5 w-5" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">CYBERGUARD AI Security Assistant</h3>
                <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-800/50">
                  REAL-TIME PIPELINE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Natural language threat analysis, arbitrary input inspection, and bilingual guidance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bilingual Display Language Switch */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                onClick={() => {
                  setDisplayLang('en');
                  setSelectedLang('en');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition ${
                  displayLang === 'en'
                    ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>English</span>
              </button>
              <button
                onClick={() => {
                  setDisplayLang('hi');
                  setSelectedLang('hi');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition ${
                  displayLang === 'hi'
                    ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>हिंदी</span>
              </button>
            </div>

            <button
              onClick={() => {
                handleStopSpeech();
                onClose();
              }}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Chat Thread Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const textToDisplay = isUser
              ? msg.text
              : (displayLang === 'hi' ? (msg.replyHi || msg.text) : (msg.replyEn || msg.text));

            const isSpeakingThis = isSpeakingId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
              >
                {/* Bubble Container */}
                <div
                  className={`relative rounded-3xl p-4 sm:p-5 shadow-lg max-w-[92%] sm:max-w-[85%] border leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-500/30'
                      : 'bg-slate-950/80 text-slate-200 border-slate-800'
                  }`}
                >
                  {/* Sensitive Data Alert Banner */}
                  {msg.sensitiveWarning && (
                    <div className="mb-3 flex items-start gap-2.5 rounded-2xl bg-amber-950/50 border border-amber-700/60 p-3 text-xs text-amber-200">
                      <Lock className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-400" />
                      <div>
                        <span className="font-bold block">Sensitive Data Redacted for Privacy</span>
                        <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">{msg.sensitiveWarning}</p>
                      </div>
                    </div>
                  )}

                  {/* Body Text */}
                  <div className="text-xs sm:text-sm whitespace-pre-wrap font-sans">
                    {textToDisplay}
                  </div>

                  {/* Rich Security Analysis Card if present */}
                  {msg.analysis && (
                    <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-xl px-2.5 py-1 text-xs font-bold border ${getSeverityBadge(msg.analysis.severity)}`}>
                            {msg.analysis.severity} SEVERITY
                          </span>
                          <span className="text-xs font-bold text-white">
                            Risk Score: <span className="font-mono text-cyan-400">{msg.analysis.risk_score}</span>/100
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          Confidence: {Math.round(msg.analysis.confidence * 100)}%
                        </span>
                      </div>

                      {/* Indicators Pills */}
                      {msg.analysis.indicators && msg.analysis.indicators.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                            Extracted Threat Indicators:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.analysis.indicators.map((ind, idx) => (
                              <span
                                key={idx}
                                className="rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-0.5 text-[10px] font-mono text-cyan-400"
                              >
                                {ind}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommended Actions */}
                      {msg.analysis.recommended_actions && msg.analysis.recommended_actions.length > 0 && (
                        <div className="rounded-xl bg-slate-950 p-3 border border-slate-800/80 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                            Recommended Action:
                          </span>
                          <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                            {msg.analysis.recommended_actions.map((act, idx) => (
                              <li key={idx}>{act}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Predicted Next Step */}
                      {msg.analysis.predicted_next_step && (
                        <div className="text-xs text-purple-300/90 bg-purple-950/20 border border-purple-900/40 p-2.5 rounded-xl">
                          <strong className="text-purple-200">Predicted Next Step: </strong>
                          {msg.analysis.predicted_next_step}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bubble Footer & Speech Button */}
                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/40">
                    <span>{msg.timestamp}</span>

                    {!isUser && (
                      <div className="flex items-center gap-2">
                        {isSpeakingThis ? (
                          <button
                            onClick={handleStopSpeech}
                            className="flex items-center gap-1 rounded-lg bg-rose-950 px-2 py-0.5 text-rose-300 border border-rose-800 hover:bg-rose-900 transition"
                          >
                            <Square className="h-3 w-3" />
                            <span>Stop</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSpeak(msg)}
                            disabled={displayLang === 'hi' && !hindiVoiceAvailable}
                            className="flex items-center gap-1 rounded-lg bg-cyan-950/80 px-2.5 py-1 text-cyan-300 border border-cyan-800/80 hover:bg-cyan-900/80 disabled:opacity-50 transition"
                          >
                            <Play className="h-3 w-3" />
                            <span>{displayLang === 'hi' ? '🔊 सुनें (Listen)' : '🔊 Speak'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-md animate-fade-in">
              <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
              <div>
                <span className="text-xs font-semibold text-white">{loadingStep}</span>
                <p className="text-[10px] text-slate-400">Processing input through zero-trust security pipeline</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {suggestions.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/40 overflow-x-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 min-w-max">
              <span className="text-[11px] font-semibold text-cyan-400 mr-1">Quick Prompts:</span>
              {suggestions.flatMap((c) => c.prompts).slice(0, 5).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-[11px] text-slate-300 hover:border-cyan-500 hover:text-cyan-300 transition truncate max-w-xs"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                displayLang === 'hi'
                  ? 'कोई भी सुरक्षा प्रश्न या संदिग्ध संदेश पूछें (e.g. बिजली कटने का मैसेज, अनजान कॉल)...'
                  : 'Ask a security question, paste a suspicious message, or enter a URL...'
              }
              disabled={isLoading}
              className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="flex items-center justify-center h-11 w-11 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 transition flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
