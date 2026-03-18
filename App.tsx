
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Mic, 
  Square, 
  Upload, 
  AlertTriangle, 
  Loader2, 
  Activity, 
  CheckCircle2, 
  XCircle,
  Volume2,
  Info,
  ChevronRight,
  Globe,
  RefreshCw,
  Zap,
  Layers,
  History,
  Trash2,
  Clock,
  FileAudio
} from 'lucide-react';
import { analyzeAudio } from './services/geminiService';
import { AppState, DetectionResult, SupportedLanguage, VoiceClassification, HistoryItem } from './types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { LiveWaveform } from './components/LiveWaveform';
import { ErrorDisplay } from './components/ErrorDisplay';
import { Header } from './components/Header';

const LANGUAGES: SupportedLanguage[] = ['English', 'Tamil', 'Hindi', 'Malayalam', 'Telugu'];



const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isProcessing: false,
    result: null,
    error: null,
    selectedLanguage: 'English',
    history: []
  });

  const [autoDetect, setAutoDetect] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('audio/mp3');
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setState(prev => ({ ...prev, error: "Please upload a valid audio file (MP3, WAV, etc.)" }));
      return;
    }

    try {
      const base64 = await blobToBase64(file);
      setBase64Data(base64);
      setMimeType(file.type);
      setAudioUrl(URL.createObjectURL(file));
      setFileName(file.name);
      setState(prev => ({ ...prev, error: null, result: null }));
    } catch (err) {
      setState(prev => ({ ...prev, error: "Error reading audio file" }));
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setActiveStream(stream);
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const base64 = await blobToBase64(audioBlob);
        setBase64Data(base64);
        setMimeType('audio/webm');
        setAudioUrl(URL.createObjectURL(audioBlob));
        setFileName(`Recording_${new Date().toLocaleTimeString()}.webm`);
        setActiveStream(null);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setState(prev => ({ ...prev, error: null, result: null }));
    } catch (err) {
      setState(prev => ({ ...prev, error: "Microphone access denied or not available." }));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleRunAnalysis = async () => {
    if (!base64Data) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    try {
      const lang = autoDetect ? 'Auto-Detect' : state.selectedLanguage;
      const result = await analyzeAudio(base64Data, mimeType, lang);
      
      const historyItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        result,
        language: result.detectedLanguage || lang,
        audioName: fileName || 'Unknown Sample'
      };

      setState(prev => ({ 
        ...prev, 
        result, 
        isProcessing: false,
        history: [historyItem, ...prev.history]
      }));
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, isProcessing: false }));
    }
  };

  const reset = () => {
    setAudioUrl(null);
    setBase64Data(null);
    setFileName(null);
    setState(prev => ({
      ...prev,
      isProcessing: false,
      result: null,
      error: null,
      selectedLanguage: 'English'
    }));
    setAutoDetect(true);
  };

  const clearHistory = () => {
    setState(prev => ({ ...prev, history: [] }));
  };

  const deleteHistoryItem = (id: string) => {
    setState(prev => ({ ...prev, history: prev.history.filter(item => item.id !== id) }));
  };



  const chartData = useMemo(() => state.result ? [
    { name: 'Confidence', value: state.result.confidenceScore },
    { name: 'Remaining', value: 100 - state.result.confidenceScore }
  ] : [], [state.result]);

  const COLORS = [state.result?.classification === VoiceClassification.AI_GENERATED ? '#ef4444' : '#22c55e', '#1e293b'];

  return (
    <div className="min-h-screen pb-20 selection:bg-indigo-500/30">
      {/* Header */}
      <Header 
        showHistory={showHistory} 
        setShowHistory={setShowHistory} 
        historyLength={state.history.length} 
      />

      <main className="max-w-6xl mx-auto px-6 pt-12">
        <AnimatePresence mode="wait">
          {showHistory ? (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <History className="w-6 h-6 text-indigo-400" />
                  <h2 className="text-2xl font-bold text-white">Scan History</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowHistory(false)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all"
                  >
                    Scan New
                  </button>
                  <button 
                    onClick={clearHistory}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-xs font-bold transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> Clear All
                  </button>
                </div>
              </div>

              {state.history.length === 0 ? (
                <div className="bg-slate-800/20 border border-slate-800 rounded-3xl p-20 text-center">
                  <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500">No forensic scans recorded yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {state.history.map((item) => (
                    <motion.div 
                      layout
                      key={item.id}
                      className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:border-indigo-500/50 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${item.result.classification === VoiceClassification.AI_GENERATED ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {item.result.classification === VoiceClassification.AI_GENERATED ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white truncate max-w-[150px]">{item.audioName}</h4>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{new Date(item.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteHistoryItem(item.id)}
                          className="text-slate-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter">
                        <span className="text-slate-400">Confidence: {item.result.confidenceScore}%</span>
                        <span className="text-indigo-400">{item.language}</span>
                      </div>
                      <button 
                        onClick={() => {
                          setState(prev => ({ ...prev, result: item.result }));
                          setShowHistory(false);
                        }}
                        className="w-full mt-4 py-2 bg-slate-900/60 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                      >
                        View Report
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Language Context</h2>
                </div>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Auto-Detect</span>
                  <div 
                    onClick={() => setAutoDetect(!autoDetect)}
                    className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${autoDetect ? 'bg-indigo-600' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-200 ${autoDetect ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </label>
              </div>

              <div className={`grid grid-cols-3 gap-2 mb-6 transition-opacity duration-300 ${autoDetect ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    disabled={autoDetect}
                    onClick={() => setState(prev => ({ ...prev, selectedLanguage: lang }))}
                    className={`px-2 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 border uppercase tracking-wider ${
                      state.selectedLanguage === lang && !autoDetect
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-100'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-600'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div 
                  onClick={() => !isRecording && fileInputRef.current?.click()}
                  className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
                    base64Data ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-700 hover:border-slate-600 bg-slate-900/20'
                  } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept="audio/*"
                  />
                  {base64Data ? (
                    <div className="text-center animate-in fade-in zoom-in duration-300">
                      <Zap className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-200">Sample Loaded</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); reset(); }}
                        className="text-xs text-slate-500 hover:text-red-400 mt-2 underline flex items-center gap-1 mx-auto"
                      >
                        <RefreshCw className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-300">Drop Audio Sample</p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Tamil • Hindi • English • Telugu • Malayalam</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-slate-800" />
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Live Capture Mode</span>
                  <div className="h-[1px] flex-1 bg-slate-800" />
                </div>

                <div className="relative">
                  {isRecording && (
                    <div className="absolute -top-12 left-0 right-0 animate-in fade-in slide-in-from-top-2">
                      <LiveWaveform stream={activeStream} />
                    </div>
                  )}
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
                    {isRecording ? 'Terminate Recording' : 'Initiate Voice Capture'}
                  </button>
                </div>
              </div>

              {audioUrl && (
                <div className="mt-6 p-4 bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Spectrogram Preview</p>
                    <Volume2 className="w-3 h-3 text-slate-600" />
                  </div>
                  <audio src={audioUrl} controls className="w-full h-8 brightness-90 filter invert opacity-80" />
                </div>
              )}

              <button
                disabled={!base64Data || state.isProcessing}
                onClick={handleRunAnalysis}
                className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed py-5 rounded-2xl text-white font-black text-lg shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 overflow-hidden group"
              >
                {state.isProcessing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Neural Processing...
                  </>
                ) : (
                  <>
                    <Activity className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    Run Forensic Analysis
                  </>
                )}
              </button>

              <ErrorDisplay error={state.error} />
            </section>
          </div>

          {/* Result Column */}
          <div className="lg:col-span-7 space-y-6 min-h-[600px]">
            {!state.result && !state.isProcessing && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-800/10 border border-slate-800 rounded-3xl group transition-colors hover:border-slate-700 relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
                </div>
                
                <div className="bg-slate-800/50 p-6 rounded-full mb-6 border border-slate-700 group-hover:scale-105 transition-transform relative z-10">
                  <Layers className="w-12 h-12 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-300 mb-2 relative z-10">Diagnostic Console</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed relative z-10">
                  Advanced detection of AI voice manipulation, synthetic cloning, and deepfake speech patterns.
                </p>
                
                <div className="flex gap-4 mt-8 relative z-10">
                  <div className="flex flex-col items-center">
                    <motion.div 
                      animate={{ height: [4, 12, 4] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-10 bg-indigo-500/30 rounded-full mb-2" 
                    />
                    <span className="text-[9px] font-bold text-slate-600 uppercase">Input Node</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <motion.div 
                      animate={{ height: [4, 12, 4] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                      className="w-10 bg-slate-800 rounded-full mb-2" 
                    />
                    <span className="text-[9px] font-bold text-slate-600 uppercase">Analysis</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <motion.div 
                      animate={{ height: [4, 12, 4] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: 1 }}
                      className="w-10 bg-slate-800 rounded-full mb-2" 
                    />
                    <span className="text-[9px] font-bold text-slate-600 uppercase">Verdict</span>
                  </div>
                </div>

                <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-md relative z-10">
                  <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-3 h-3 text-indigo-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Real-time Scan</span>
                    </div>
                    <p className="text-[10px] text-slate-600">Active monitoring of spectral anomalies and neural artifacts.</p>
                  </div>
                  <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Secure Layer</span>
                    </div>
                    <p className="text-[10px] text-slate-600">End-to-end encrypted forensic analysis for sensitive data.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {state.isProcessing && (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="relative w-32 h-32 mb-10">
                  <div className="absolute inset-0 border-[6px] border-indigo-500/10 rounded-full" />
                  <div className="absolute inset-0 border-[6px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-10 h-10 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 rounded-full">
                    <span className="text-[9px] font-black text-white uppercase tracking-widest whitespace-nowrap">Scanning Peaks</span>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Analyzing Voiceprint</h3>
                <p className="text-slate-500 text-sm mb-8">Matching linguistic artifacts against synthetic patterns...</p>
                
                <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500/50 animate-[progress_2s_ease-in-out_infinite]"
                        style={{ animationDelay: `${i * 0.2}s`, width: '100%' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {state.result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="animate-in fade-in slide-in-from-bottom-6 duration-700"
              >
                <div className={`rounded-3xl border shadow-2xl p-8 backdrop-blur-sm ${
                  state.result.classification === VoiceClassification.AI_GENERATED 
                    ? 'bg-red-500/5 border-red-500/20 shadow-red-500/5' 
                    : 'bg-emerald-500/5 border-emerald-500/20 shadow-emerald-500/5'
                }`}>
                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="relative w-40 h-40 mx-auto md:mx-0 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                            startAngle={90}
                            endAngle={450}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-black text-white leading-none">{state.result.confidenceScore}%</span>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mt-1">Accuracy</span>
                      </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        {state.result.classification === VoiceClassification.AI_GENERATED ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        )}
                        <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${
                          state.result.classification === VoiceClassification.AI_GENERATED ? 'text-red-500' : 'text-emerald-500'
                        }`}>
                          Verification Verdict
                        </span>
                      </div>
                      <h3 className="text-5xl font-black text-white mb-4 tracking-tight">
                        {state.result.classification}
                      </h3>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <span className="px-3 py-1.5 bg-slate-900/60 rounded-lg text-[10px] font-bold text-slate-400 border border-slate-800 flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-indigo-400" />
                          DETECTED: {state.result.detectedLanguage.toUpperCase()}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                        <span className="text-[10px] font-bold text-slate-500">ENGINE: VEO-3.1 HYPERION</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-slate-800/50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Info className="w-4 h-4 text-indigo-400" />
                      </div>
                      <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest">Technician's Summary</h4>
                    </div>
                    <p className="text-slate-400 leading-relaxed text-sm md:text-base font-medium">
                      {state.result.explanation}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                      <h5 className="text-[10px] font-black text-indigo-400 uppercase mb-4 flex items-center justify-between">
                        <span>Acoustic Markers</span>
                        <Activity className="w-3 h-3" />
                      </h5>
                      <div className="space-y-3">
                        {state.result.artifacts.map((a, i) => (
                          <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-slate-900/20">
                            <div className="w-1 h-4 bg-indigo-500/40 rounded-full mt-1 shrink-0" />
                            <span className="text-xs text-slate-400 font-medium leading-tight">{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                      <h5 className="text-[10px] font-black text-indigo-400 uppercase mb-4 flex items-center justify-between">
                        <span>Spectral Analysis</span>
                        <Zap className="w-3 h-3" />
                      </h5>
                      <div className="space-y-3">
                        {state.result.spectralAnomalies.map((s, i) => (
                          <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-slate-900/20">
                            <div className="w-1 h-4 bg-indigo-500/40 rounded-full mt-1 shrink-0" />
                            <span className="text-xs text-slate-400 font-medium leading-tight">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                            <Activity className="w-3 h-3 text-slate-500" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Verified by Multi-layer scan</span>
                    </div>
                    <button 
                      onClick={reset}
                      className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                      Process New Sample
                    </button>
                  </div>
                </div>
              </motion.div>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800/50 py-3 px-6 z-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em]">
            VoxVeritas Forensic OS • Secure Analysis Layer
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[9px] font-bold text-slate-600 uppercase">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" /> API: STABLE
            </span>
            <span className="text-[9px] font-bold text-slate-600">AES-256</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
