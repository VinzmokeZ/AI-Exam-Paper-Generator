import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Sparkles, FileText, Zap, ChevronRight, Check, Trash2, Brain, Loader2 } from 'lucide-react';
import { generationService, subjectService, api, connectionLogs, discoverConnectivity } from '../services/api';
import { toast } from 'sonner';
import { rubricService, RubricResponse } from '../services/rubricService';
import { DEFAULT_SUBJECTS } from '../constants/defaultData';
import { AIPromptBox } from './AIPromptBox';

// Define strict types for location state
interface LocationState {
  prompt?: string;
  method?: string;
  subjectId?: string | number;
  generatedQuestions?: any[];
  subjectName?: string;
  rubricName?: string;
}

export function GenerateExam() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  /* Backend State */
  const [savedRubrics, setSavedRubrics] = useState<RubricResponse[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  /* Core State */
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('CS301');
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);

  const [selectedRubric, setSelectedRubric] = useState<number | null>(null);
  const [generationStep, setGenerationStep] = useState<'selecting' | 'progress' | 'results'>('selecting');
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('Initializing...');
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    loadRubrics();
    loadSubjects();
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      await discoverConnectivity();
      const response = await api.get('/health');
      setIsBackendOnline(true);

      // Auto-select engine (Cloud > Local)
      if (response.data.cloud === 'online') {
        setActiveModel('cloud'); // Use 'cloud' as generic identifer for cloud provider
      } else if (response.data.ollama === 'online' && response.data.models?.length > 0) {
        setActiveModel(response.data.models[0]);
      }
    } catch {
      setIsBackendOnline(false);
    }
  };

  // Check for returned prompt from AIPromptPage
  useEffect(() => {
    if (state?.prompt && state?.method === 'ai' && !isGenerating && generationStep === 'selecting') {
      // Ensure subjects are loaded before starting AI generation
      if (subjects.length > 0) {
        handleAIGenerate(state.prompt);
        // Clear the location state to prevent double execution on re-mount or manual navigation
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, subjects, isGenerating, generationStep]);

  const loadSubjects = async () => {
    setIsLoadingSubjects(true);
    try {
      const data = await subjectService.getAll();

      // Merge logic: Combine DEFAULT_SUBJECTS with backend subjects
      const backendCodes = new Set(data.map(s => s.code.toUpperCase()));
      const uniqueDefaults = DEFAULT_SUBJECTS.filter(d => !backendCodes.has(d.code.toUpperCase()));
      const combined = [...uniqueDefaults, ...data];

      setSubjects(combined);

      if (combined.length > 0) {
        // If we have a returned subject ID, use it, otherwise default
        const returnedId = state?.subjectId;
        if (returnedId) {
          const sub = combined.find(s => s.id.toString() === returnedId.toString());
          if (sub) {
            setSelectedSubjectId(sub.id);
            setSelectedSubject(sub.code);
          }
        } else {
          setSelectedSubjectId(combined[0].id);
          setSelectedSubject(combined[0].code);
        }
      }
    } catch (error) {
      console.error('Failed to load subjects', error);
      setSubjects(DEFAULT_SUBJECTS);
      setSelectedSubjectId(DEFAULT_SUBJECTS[0].id);
      setSelectedSubject(DEFAULT_SUBJECTS[0].code);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const loadRubrics = async () => {
    try {
      const rubrics = await rubricService.listRubrics();
      setSavedRubrics(rubrics);
    } catch (error) {
      console.error('Failed to load rubrics:', error);
    }
  };

  const handleDeleteRubric = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this rubric?')) {
      try {
        await rubricService.deleteRubric(id);
        setSavedRubrics(prev => prev.filter(r => r.id !== id));
        if (selectedRubric === id) setSelectedRubric(null);
        toast.success('Rubric deleted successfully');
      } catch (error) {
        console.error('Failed to delete rubric:', error);
        toast.error('Failed to delete rubric');
      }
    }
  };

  const handleGenerateFromRubric = async () => {
    if (!selectedRubric) {
      toast.error('Please select a rubric first');
      return;
    }

    if (isBackendOnline === false) {
      toast.info("Waiting for AI Engine link...", {
        description: "Please ensure your PC Bridge is running to generate from rubrics."
      });
      return;
    }

    setIsGenerating(true);
    setGenerationStep('progress');
    setProgress(0);
    setCurrentStatus('Analyzing Rubric...');

    try {
      let localProgress = 0;
      const animateProgress = async (target: number, duration: number) => {
        const steps = 15;
        const increment = (target - localProgress) / steps;
        for (let i = 0; i < steps; i++) {
          localProgress += increment;
          setProgress(Math.min(Math.round(localProgress), 99));
          await new Promise(r => setTimeout(r, duration / steps));
        }
      };

      await animateProgress(40, 1000);
      const engineName = activeModel || 'AI Engine';
      setCurrentStatus(`Generating via ${engineName}...`);

      const result = await rubricService.generateFromRubric(selectedRubric);

      const questions = result.questions || result.all_questions || [];
      if (questions.length > 0) {
        setGeneratedQuestions(questions);
        await animateProgress(100, 500);
        toast.success(`Generated ${result.questions_generated} questions!`);
        setGenerationStep('results');
      } else {
        throw new Error("No questions returned from backend");
      }
    } catch (error: any) {
      toast.error(`Generation failed: ${error.message}`);
      setGenerationStep('selecting');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIGenerate = async (prompt: string, engineOverride?: string) => {
    // Find subject - check both state and list
    let subject = subjects.find(s => s.id.toString() === selectedSubjectId?.toString());

    if (!subject) {
      // Try getting from state if available (edge case)
      const stateSubjectId = state?.subjectId;
      if (stateSubjectId) {
        subject = subjects.find(s => s.id.toString() === stateSubjectId.toString());
      }
    }

    if (!subject && subjects.length === 0) {
      // Subjects might still be loading. Let's wait a bit or try to find it in the list again
      setCurrentStatus('Loading Subject Context...');
      await new Promise(r => setTimeout(r, 1000));
      // Try again
      subject = subjects.find(s => s.id.toString() === (selectedSubjectId || state?.subjectId)?.toString());
    }

    if (!subject) {
      toast.error("Subject context missing. Still loading or invalid ID.");
      setGenerationStep('selecting');
      return;
    }

    if (isBackendOnline === false) {
      toast.info("AI Parallel Link Dormant", {
        description: "Generation will resume once your PC Bridge is detected."
      });
      setGenerationStep('selecting');
      return;
    }

    setGenerationStep('progress');
    setProgress(0);
    setCurrentStatus('AI Processing Context...');

    // Determine effective engine
    const effectiveEngine = engineOverride || activeModel || 'local';

    // Update Active Model State if overridden
    if (engineOverride && engineOverride !== activeModel) {
      setActiveModel(engineOverride);
    }

    try {
      setProgress(10);
      const engineLabel = effectiveEngine === 'cloud' ? 'Gemini Cloud' : 'Ollama';
      setCurrentStatus(`${engineLabel} is thinking...`);

      const chatbotMessages = [
        "Analyzing your prompt structure...",
        `Crafting questions using ${engineLabel}...`,
        "Optimizing for requested complexity...",
        "Validating educational alignment...",
        "Finalizing exam draft..."
      ];

      let msgIndex = 0;
      const msgInterval = setInterval(() => {
        if (msgIndex < chatbotMessages.length) {
          setCurrentStatus(chatbotMessages[msgIndex]);
          msgIndex++;
        }
      }, 1500);

      const result = await generationService.generateQuestions(
        subject.name,
        prompt,
        "Mixed",
        parseInt(prompt.match(/\d+/)?.[0] || '5'), // Extract count from prompt or default to 5
        subject.id.toString(),
        undefined,
        effectiveEngine
      );

      clearInterval(msgInterval);

      setProgress(100);
      toast.success(`Generated ${result.length} questions successfully!`);

      setGeneratedQuestions(result);

      // Navigate to results but keep state for the "VET NOW" button
      setGenerationStep('results');

      // Store in location state as backup/legacy support
      location.state = {
        ...location.state,
        generatedQuestions: result,
        subjectName: subject.name,
        subjectId: subject.id
      };
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast.error("AI Generation failed. Check if Ollama is running.");
      setGenerationStep('selecting');
    }
  };

  if (generationStep === 'progress') {
    // SVG dimensions — circumference = 2 * π * r
    const R = 96;
    const SIZE = 240;
    const CX = SIZE / 2;     // 120
    const CY = SIZE / 2;     // 120
    const CIRC = 2 * Math.PI * R; // ≈ 603

    return (
      <div className="fixed inset-0 z-[100] flex flex-col bg-[#0A1F1F]">
        {/* Ambient radial background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,_#0D2E2E_0%,_#0A1F1F_70%)]" />

        {/* ── TOP HEADER (matches all other screens) ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 flex items-center px-5 pt-16 pb-3 flex-shrink-0"
        >
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setGenerationStep('selecting')}
            className="w-11 h-11 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>

          <div className="flex-1 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8B9E9E]/50">
              Generating Exam
            </span>
          </div>

          {/* Spacer identical width to button for centering */}
          <div className="w-11 h-11" />
        </motion.div>

        {/* ── MAIN CONTENT ── */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 gap-6 -mt-10">

          {/* ── PROGRESS RING (properly viewport-scaled SVG) ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'backOut' }}
            className="relative flex items-center justify-center"
            style={{ width: 220, height: 220 }}
          >
            {/* Glow behind ring */}
            <div
              className="absolute rounded-full animate-pulse"
              style={{ inset: 20, background: 'rgba(142,97,255,0.18)', filter: 'blur(28px)' }}
            />

            {/* SVG ring — viewBox ensures correct scaling on all screen sizes */}
            <svg
              width="220"
              height="220"
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              style={{ transform: 'rotate(-90deg)' }}
            >
              <defs>
                <linearGradient id="pgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C5B3E6" />
                  <stop offset="100%" stopColor="#8E61FF" />
                </linearGradient>
              </defs>

              {/* Track */}
              <circle
                cx={CX} cy={CY} r={R}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="12"
                fill="none"
              />

              {/* Progress arc */}
              <motion.circle
                cx={CX} cy={CY} r={R}
                stroke="url(#pgGrad)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                animate={{ strokeDashoffset: CIRC - (CIRC * progress) / 100 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
            </svg>

            {/* Centered overlay — percentage + engine badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <motion.span
                key={progress}
                initial={{ scale: 0.9, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl font-black text-white italic tracking-tighter leading-none"
              >
                {progress}%
              </motion.span>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#C5B3E6]/30 bg-[#C5B3E6]/10 -ml-1"
              >
                <Zap className="w-3 h-3 text-[#C5B3E6] fill-[#C5B3E6] animate-pulse flex-shrink-0" />
                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#C5B3E6] whitespace-nowrap">
                  {activeModel || 'AI Engine'} Active
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* ── TITLE + STATUS ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center w-full"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#8B9E9E]/40 mb-1">Creating</p>
            <h2 className="text-[28px] font-black text-white tracking-tight leading-tight mb-3">
              Your Exam Paper
            </h2>

            {/* Animated status line */}
            <div className="flex items-center justify-center gap-2">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentStatus}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm font-semibold text-[#8B9E9E]/70"
                >
                  {currentStatus}
                </motion.span>
              </AnimatePresence>
              <span className="flex gap-1 ml-0.5">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0.15, 1, 0.15] }}
                    transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.22 }}
                    className="w-1 h-1 rounded-full bg-[#8B9E9E]/50"
                  />
                ))}
              </span>
            </div>
          </motion.div>

          {/* ── STEP CHECKLIST ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="w-full bg-[#0D2626]/90 rounded-3xl p-5 border border-white/8 backdrop-blur-xl"
          >
            <div className="space-y-3">
              {[
                { label: 'Analyzing Context & Requirements', done: progress > 10 },
                { label: 'Drafting Questions via AI Model', done: progress > 40 },
                { label: "Validating Bloom's Taxonomy", done: progress > 70 },
                { label: 'Finalizing & Structuring Output', done: progress > 90 },
              ].map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    animate={step.done ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.35 }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-400 ${step.done
                      ? 'bg-[#50FA7B] shadow-[0_0_12px_rgba(80,250,123,0.5)]'
                      : 'bg-white/5 border border-white/10'
                      }`}
                  >
                    {step.done && (
                      <Check className="w-3.5 h-3.5 text-[#0A1F1F]" strokeWidth={3} />
                    )}
                  </motion.div>
                  <span className={`text-sm font-bold transition-colors duration-300 ${step.done ? 'text-white' : 'text-[#8B9E9E]/35'
                    }`}>
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    );
  }

  if (generationStep === 'results') {
    return (
      <div className="fixed inset-0 z-[100] p-6 flex flex-col justify-center items-center bg-[#0A1F1F]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-[#F5F1ED] rounded-[64px] p-12 w-full max-w-sm text-center shadow-[0_40px_80px_rgba(0,0,0,0.5)] border-4 border-[#071919]"
        >
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 bg-[#50FA7B] rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_15px_30px_rgba(80,250,123,0.3)] border-4 border-white"
          >
            <Check className="w-12 h-12 text-[#0A1F1F]" strokeWidth={5} />
          </motion.div>

          <h2 className="text-4xl font-black text-[#0A1F1F] mb-4 tracking-tighter italic">BOOM!</h2>
          <h3 className="text-2xl font-black text-[#0A1F1F] mb-10">Exam Paper Ready</h3>

          <p className="text-sm font-bold text-[#0A1F1F]/40 uppercase tracking-widest mb-12">
            Questions have been moved<br />to Vetting Center
          </p>

          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/vetting', {
              state: {
                questions: generatedQuestions,
                subjectName: state?.subjectName || selectedSubject,
                rubricName: savedRubrics.find(r => r.id === selectedRubric)?.name
              }
            })}
            className="w-full bg-[#0A1F1F] text-white rounded-[32px] py-7 font-black text-xl shadow-2xl flex items-center justify-center gap-4 group"
          >
            <span>VET NOW</span>
            <ChevronRight className="w-7 h-7 group-hover:translate-x-2 transition-transform" strokeWidth={3} />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (isLoadingSubjects) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-[#0A1F1F]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-[#C5B3E6]/20 border-t-[#C5B3E6] rounded-full mb-6"
        />
        <h2 className="text-xl font-bold text-white mb-2 italic tracking-tighter">INITIALIZING VAULT</h2>
        <p className="text-xs font-black text-[#8B9E9E] opacity-50 uppercase tracking-[0.2em]">Preparing subject context...</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0A1F1F] overflow-hidden">
      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
        <div className="pb-32 min-h-full">
          {/* Header */}
          <div className="mx-6 mt-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#0D2626] to-[#0A1F1F] rounded-[32px] p-6 border-4 border-[#0A1F1F] relative overflow-hidden shadow-xl"
            >
              <div className="absolute top-0 left-0 w-8 h-8 bg-[#0A2F2F] rounded-br-[32px]" />
              <div className="absolute top-0 right-0 w-8 h-8 bg-[#0A2F2F] rounded-bl-[32px]" />

              <div className="flex items-center gap-3 mb-4">
                <Link to="/">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 bg-[#0A1F1F] rounded-xl flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5 text-[#F5F1ED]" />
                  </motion.div>
                </Link>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-[#F5F1ED]">Generate Exam</h1>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-bold text-[#8B9E9E] uppercase tracking-widest">Bridge Link</p>
                    <div className={`w-1.5 h-1.5 rounded-full ${isBackendOnline ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-white/20'}`} />
                    <span className="text-[8px] font-bold text-white/40 uppercase tracking-tighter">
                      {isBackendOnline ? (activeModel || 'Link Active') : 'Link Dormant'}
                    </span>
                    <button
                      onClick={() => setShowDebug(!showDebug)}
                      className="ml-2 px-2 py-0.5 rounded-full bg-white/5 text-[7px] text-white/30 hover:bg-white/10 border border-white/5 transition-colors"
                    >
                      ENGINE STATUS
                    </button>
                  </div>
                </div>

                {/* Debug Console Overlay */}
                {showDebug && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-20 left-6 right-6 z-50 p-3 bg-black/90 rounded-xl border border-white/10 font-mono text-[10px] text-green-400 overflow-hidden shadow-2xl"
                  >
                    <div className="flex justify-between items-center mb-2 text-white/40 uppercase tracking-widest text-[8px]">
                      <span>Discovery Logs</span>
                      <button onClick={() => checkConnection()} className="text-blue-400 font-bold">Retry Probes</button>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {connectionLogs.map((log: string, i: number) => (
                        <div key={i} className={log.includes('✅') ? 'text-green-400' : log.includes('❌') ? 'text-red-400' : ''}>
                          {log}
                        </div>
                      ))}
                      {connectionLogs.length === 0 && (
                        <div className="text-white/20 italic">Initializing Signal Hunter...</div>
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="w-10 h-10 bg-[#C5B3E6]/20 rounded-xl flex items-center justify-center pulse-glow">
                  <Sparkles className="w-5 h-5 text-[#C5B3E6]" />
                </div>
              </div>

              {/* Subject Selection */}
              <div className="bg-[#0A1F1F] rounded-2xl p-4">
                <label className="text-[10px] font-bold text-[#8B9E9E] uppercase mb-2 block">
                  Select Subject
                </label>
                <select
                  value={selectedSubjectId || ''}
                  onChange={(e) => {
                    const id = e.target.value;
                    const sub = subjects.find(s => s.id.toString() === id.toString());
                    if (sub) {
                      setSelectedSubjectId(sub.id);
                      setSelectedSubject(sub.code);
                    }
                  }}
                  className="w-full bg-[#0D2626] rounded-xl px-4 py-3 text-[#F5F1ED] text-sm border-2 border-[#0A1F1F] outline-none transition-all focus:border-[#C5B3E6]"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                  {subjects.length === 0 && <option value="">No Subjects</option>}
                </select>
              </div>
            </motion.div>
          </div>

          {/* AI Prompt CTA */}
          <div className="mx-6 mb-6">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!selectedSubjectId) {
                  toast.error("Please select a subject first!");
                  return;
                }
                setShowAIPrompt(true);
              }}
              className="w-full bg-gradient-to-br from-[#C5B3E6] via-[#B8A5D9] to-[#C5B3E6] rounded-[32px] p-6 border-4 border-white/30 relative overflow-hidden z-20 cursor-pointer text-left shadow-lg hover:brightness-105 active:scale-[0.98] transition-all"
            >
              <div className="absolute top-0 left-0 w-12 h-12 bg-white/10 rounded-br-[48px] pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-black/10 rounded-tl-[96px] pointer-events-none" />

              <div className="relative z-10 flex items-center gap-4">
                <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-8 h-8 text-[#0A1F1F]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-[#0A1F1F] mb-1">Ask AI to Generate</h2>
                  <p className="text-xs text-[#0A1F1F] opacity-70">
                    Tell us what questions you want
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm px-3 py-2 rounded-xl border-2 border-white/50">
                  <Zap className="w-4 h-4 text-[#0A1F1F]" />
                  <span className="text-[10px] font-black text-[#0A1F1F] uppercase tracking-tighter">TRY NOW</span>
                </div>
              </div>
            </button>
          </div>

          {/* OR Divider */}
          <div className="mx-6 mb-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-[#8B9E9E]/20" />
            <span className="text-[10px] font-bold text-[#8B9E9E] opacity-60 uppercase tracking-widest whitespace-nowrap">Or use saved rubric</span>
            <div className="flex-1 h-px bg-[#8B9E9E]/20" />
          </div>

          {/* Saved Rubrics */}
          <div className="px-6 space-y-4">
            {savedRubrics.slice(0, 3).map((rubric, index) => (
              <motion.div
                key={rubric.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                onClick={() => setSelectedRubric(rubric.id)}
                className={`rounded-[32px] p-6 border-4 cursor-pointer transition-all ${selectedRubric === rubric.id
                  ? 'bg-[#C5B3E6] border-[#B8A5D9] shadow-inner'
                  : 'bg-[#F5F1ED] border-[#E5DED6] shadow-md'
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-4 ${selectedRubric === rubric.id
                    ? 'bg-[#0A1F1F] border-[#0D2626]'
                    : 'bg-[#0D2626] border-[#0A1F1F]'
                    }`}>
                    <FileText className="w-7 h-7 text-[#C5B3E6]" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-[#0A1F1F] text-lg mb-1">{rubric.name}</h3>
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase opacity-40 text-[#0A1F1F]">
                      <span className="bg-black/5 px-2 py-1 rounded-md">{rubric.total_marks} Marks</span>
                      <span>•</span>
                      <span className="bg-black/5 px-2 py-1 rounded-md">{(rubric.question_distributions || []).reduce((acc: number, q: any) => acc + q.count, 0) || 0} Questions</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleDeleteRubric(rubric.id, e)}
                    className="w-10 h-10 bg-[#FF6AC1]/10 rounded-xl flex items-center justify-center border border-[#FF6AC1]/20 hover:bg-[#FF6AC1]/20 transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-[#FF6AC1]" />
                  </motion.button>
                </div>

                {selectedRubric === rubric.id && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    onClick={(e) => { e.stopPropagation(); handleGenerateFromRubric(); }}
                    className="w-full bg-[#0A1F1F] rounded-2xl py-4 mt-4 text-[#C5B3E6] font-black text-xs flex items-center justify-center gap-3 shadow-2xl border-2 border-white/10"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>GENERATE NOW</span>
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Quick Generate Option (Create Rubric) */}
          <div className="px-6 pb-6 mt-6">
            <Link to="/create-rubric">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#0D2626] rounded-3xl p-5 border-4 border-[#0A1F1F] shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#C5B3E6]/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-[#C5B3E6]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#F5F1ED] mb-1">Create New Rubric</h3>
                    <p className="text-xs text-[#8B9E9E]">Design a custom exam template first</p>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>

      {/* AI Prompt Box Overlay */}
      <AnimatePresence>
        {showAIPrompt && (
          <AIPromptBox
            engine={activeModel || 'local'}
            onGenerate={(prompt, engine) => {
              setShowAIPrompt(false);
              handleAIGenerate(prompt, engine);
            }}
            onClose={() => setShowAIPrompt(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
