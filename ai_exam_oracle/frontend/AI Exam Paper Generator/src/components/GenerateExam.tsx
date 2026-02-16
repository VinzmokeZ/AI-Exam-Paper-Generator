import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Sparkles, FileText, Zap, ChevronRight, Check } from 'lucide-react';
import { generationService, subjectService } from '../services/api';
import { toast } from 'sonner';
import { rubricService, RubricResponse } from '../services/rubricService';
import { DEFAULT_SUBJECTS } from '../constants/defaultData';

export function GenerateExam() {
  const navigate = useNavigate();
  const location = useLocation();

  /* Backend State */
  const [savedRubrics, setSavedRubrics] = useState<RubricResponse[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  /* Core State */
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('CS301');

  const [selectedRubric, setSelectedRubric] = useState<number | null>(null);
  const [generationStep, setGenerationStep] = useState<'selecting' | 'progress' | 'results'>('selecting');
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('Initializing...');

  useEffect(() => {
    loadRubrics();
    loadSubjects();
  }, []);

  // Check for returned prompt from AIPromptPage
  useEffect(() => {
    if (location.state?.prompt && location.state?.method === 'ai' && !isGenerating && generationStep === 'selecting') {
      const prompt = location.state.prompt;
      // Verify we are in 'selecting' step to avoid double triggers.
      handleAIGenerate(prompt);

      // Clear the location state history to prevent re-run
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const loadSubjects = async () => {
    try {
      const data = await subjectService.getAll();

      // Merge logic: Combine DEFAULT_SUBJECTS with backend subjects
      const backendCodes = new Set(data.map(s => s.code.toUpperCase()));
      const uniqueDefaults = DEFAULT_SUBJECTS.filter(d => !backendCodes.has(d.code.toUpperCase()));
      const combined = [...uniqueDefaults, ...data];

      setSubjects(combined);

      if (combined.length > 0) {
        // If we have a returned subject ID, use it, otherwise default
        const returnedId = location.state?.subjectId;
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

  const handleGenerateFromRubric = async () => {
    if (!selectedRubric) {
      toast.error('Please select a rubric first');
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
      setCurrentStatus('Generating via Ollama...');

      const result = await rubricService.generateFromRubric(selectedRubric);

      await animateProgress(100, 500);
      toast.success(`Generated ${result.questions_generated} questions!`);
      setGenerationStep('results');
    } catch (error: any) {
      toast.error(`Generation failed: ${error.message}`);
      setGenerationStep('selecting');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIGenerate = async (prompt: string) => {
    // Find subject - check both state and list
    let subject = subjects.find(s => s.id.toString() === selectedSubjectId?.toString());

    if (!subject) {
      // Try getting from state if available (edge case)
      const stateSubjectId = location.state?.subjectId;
      if (stateSubjectId) {
        subject = subjects.find(s => s.id.toString() === stateSubjectId.toString());
      }
    }

    if (!subject) {
      toast.error("Subject context missing. Please try again.");
      return;
    }

    setGenerationStep('progress');
    setProgress(0);
    setCurrentStatus('AI Processing Context...');

    try {
      await new Promise(r => setTimeout(r, 1000));
      setProgress(30);
      setCurrentStatus('Ollama Generating Questions...');

      const result = await generationService.generateQuestions(
        subject.name,
        prompt,
        "Mixed",
        5,
        subject.id.toString()
      );

      setProgress(100);
      toast.success(`Generated ${result.length} questions successfully!`);
      setGenerationStep('results');
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast.error("AI Generation failed. Check if Ollama is running.");
      setGenerationStep('selecting');
    }
  };

  if (generationStep === 'progress') {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-[#0A1F1F]">
        <div className="absolute top-12 left-8">
          <button onClick={() => setGenerationStep('selecting')} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center w-full max-w-xs"
        >
          <div className="relative w-64 h-64 mb-12">
            <div className="absolute inset-4 bg-[#8E61FF]/10 rounded-full blur-2xl animate-pulse" />
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="128" cy="128" r="110" stroke="rgba(255,255,255,0.05)" strokeWidth="16" fill="transparent" />
              <motion.circle
                cx="128" cy="128" r="110"
                stroke="#8E61FF" strokeWidth="16"
                fill="transparent"
                strokeDasharray={691}
                strokeLinecap="round"
                animate={{ strokeDashoffset: 691 - (691 * progress) / 100 }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-white italic">{progress}%</span>
              <div className="flex items-center gap-2 text-[#8B9E9E] mt-2 group">
                <Zap className="w-4 h-4 fill-[#C5B3E6] text-[#C5B3E6]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ollama active</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-black mb-4 tracking-tight text-white">Paper Creation<br />in Progress</h2>
            <p className="text-sm font-bold text-[#8B9E9E] opacity-60 px-8">
              {currentStatus}
            </p>
          </div>
        </motion.div>
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
          <div className="w-24 h-24 bg-[#50FA7B] rounded-[36px] flex items-center justify-center mx-auto mb-10 shadow-[0_15px_30px_rgba(80,250,123,0.3)] border-4 border-white rotate-12">
            <Check className="w-12 h-12 text-[#0A1F1F]" strokeWidth={5} />
          </div>

          <h2 className="text-4xl font-black text-[#0A1F1F] mb-4 tracking-tighter italic">BOOM!</h2>
          <h3 className="text-2xl font-black text-[#0A1F1F] mb-10">Exam Paper Ready</h3>

          <p className="text-sm font-bold text-[#0A1F1F]/40 uppercase tracking-widest mb-12">
            Questions have been moved<br />to Vetting Center
          </p>

          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/vetting')}
            className="w-full bg-[#0A1F1F] text-white rounded-[32px] py-7 font-black text-xl shadow-2xl flex items-center justify-center gap-4 group"
          >
            <span>VET NOW</span>
            <ChevronRight className="w-7 h-7 group-hover:translate-x-2 transition-transform" strokeWidth={3} />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-full pb-32">
      {/* Header */}
      <div className="mx-6 mt-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#0D2626] to-[#0A1F1F] rounded-[32px] p-6 border-4 border-[#0A1F1F] relative overflow-hidden"
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
              <p className="text-xs text-[#8B9E9E]">AI-powered exam creation</p>
            </div>
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
              className="w-full bg-[#0D2626] rounded-xl px-4 py-3 text-[#F5F1ED] text-sm border-2 border-[#0A1F1F] outline-none"
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
        <div
          onClick={() => {
            if (!selectedSubjectId) {
              toast.error("Please select a subject first!");
              return;
            }
            navigate('/ai-prompt', { state: { subjectId: selectedSubjectId } });
          }}
          className="w-full bg-gradient-to-br from-[#C5B3E6] via-[#9B86C5] to-[#C5B3E6] rounded-[32px] p-6 border-4 border-white/30 relative overflow-hidden z-20 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {/* Animated gradient overlay */}
          <motion.div
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: 'linear-gradient(45deg, #C5B3E6 0%, #8BE9FD 50%, #FFB86C 100%)',
              backgroundSize: '200% 200%',
            }}
          />

          <div className="absolute top-0 left-0 w-12 h-12 bg-white/10 rounded-br-[48px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-black/10 rounded-tl-[96px] pointer-events-none" />

          <div className="relative z-10 flex items-center gap-4">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0"
            >
              <Sparkles className="w-8 h-8 text-[#0A1F1F]" />
            </motion.div>
            <div className="flex-1 text-left">
              <h2 className="text-xl font-bold text-[#0A1F1F] mb-2">Ask AI to Generate</h2>
              <p className="text-sm text-[#0A1F1F] opacity-70">
                Describe what questions you want and let AI create them
              </p>
            </div>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-2 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-xl border-2 border-white/50"
            >
              <span className="text-xs font-bold text-[#0A1F1F] uppercase">Try Now</span>
              <Zap className="w-4 h-4 text-[#0A1F1F]" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* OR Divider */}
      <div className="mx-6 mb-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-[#8B9E9E]/30" />
        <span className="text-xs font-bold text-[#8B9E9E] uppercase">Or use saved rubric</span>
        <div className="flex-1 h-px bg-[#8B9E9E]/30" />
      </div>

      {/* Saved Rubrics */}
      <div className="px-6 pb-6">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-[#F5F1ED] mb-1">Saved Rubrics</h2>
          <p className="text-xs text-[#8B9E9E]">Select a rubric to generate exam</p>
        </div>

        <div className="space-y-3">
          {savedRubrics.slice(0, 3).map((rubric, index) => (
            <motion.div
              key={rubric.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              onClick={() => setSelectedRubric(rubric.id)}
              className={`rounded-3xl p-5 border-4 cursor-pointer transition-all ${selectedRubric === rubric.id
                ? 'bg-[#C5B3E6] border-[#B8A5D9]'
                : 'bg-[#F5F1ED] border-[#E5DED6]'
                }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-4 ${selectedRubric === rubric.id
                  ? 'bg-[#0A1F1F] border-[#0D2626]'
                  : 'bg-[#0D2626] border-[#0A1F1F]'
                  }`}>
                  <FileText className={`w-6 h-6 ${selectedRubric === rubric.id ? 'text-[#C5B3E6]' : 'text-[#C5B3E6]'
                    }`} />
                </div>

                <div className="flex-1">
                  <h3 className={`font-bold text-base mb-1 ${selectedRubric === rubric.id ? 'text-[#0A1F1F]' : 'text-[#0A1F1F]'
                    }`}>
                    {rubric.name}
                  </h3>
                  <p className={`text-sm mb-2 ${selectedRubric === rubric.id ? 'text-[#0A1F1F] opacity-70' : 'text-[#0A1F1F] opacity-60'
                    }`}>
                    {rubric.subject_name || rubric.subject_id}
                  </p>

                  <div className="flex items-center gap-3 text-xs">
                    <span className={selectedRubric === rubric.id ? 'text-[#0A1F1F] opacity-80' : 'text-[#0A1F1F] opacity-60'}>
                      {(rubric.question_distributions || []).reduce((acc: number, q: any) => acc + q.count, 0) || 0} Questions
                    </span>
                    <span className={selectedRubric === rubric.id ? 'text-[#0A1F1F] opacity-60' : 'text-[#0A1F1F] opacity-40'}>•</span>
                    <span className={selectedRubric === rubric.id ? 'text-[#0A1F1F] opacity-80' : 'text-[#0A1F1F] opacity-60'}>
                      {rubric.total_marks} Marks
                    </span>
                  </div>
                </div>
              </div>

              {selectedRubric === rubric.id && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={(e) => { e.stopPropagation(); handleGenerateFromRubric(); }}
                  className="w-full bg-[#0A1F1F] rounded-2xl py-4 text-[#C5B3E6] font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  {isGenerating ? 'Generating...' : 'Generate with AI'}
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Generate Option */}
      <div className="px-6 pb-6 mb-20">
        <Link to="/create-rubric">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#0D2626] rounded-3xl p-5 border-4 border-[#0A1F1F]"
          >
            <div className="flex items-start gap-3 mb-3">
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
  );
}
