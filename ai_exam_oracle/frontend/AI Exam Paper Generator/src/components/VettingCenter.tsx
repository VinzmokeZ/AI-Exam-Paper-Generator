import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, CheckCircle2, Sparkles, FileText, ChevronRight, Loader2, Database, Trash2, Zap, Trophy, ShieldCheck, AlertCircle, Target } from 'lucide-react';
import { vettingService, gamificationService } from '../services/api';
import { toast } from 'sonner';
import { courseOutcomeService, CourseOutcome } from '../services/courseOutcomeService';

interface Question {
  id: number;
  type: string;
  question_text: string;
  options?: string[];
  correct_answer?: string;
  subject_name: string;
  topic_name?: string;
  course_outcome?: string;
  bloom_level?: string;
}

export function VettingCenter() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [courseOutcomes, setCourseOutcomes] = useState<CourseOutcome[]>([]);
  const [selectedCO, setSelectedCO] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const outcomes = await courseOutcomeService.listCourseOutcomes();
      setCourseOutcomes(outcomes);

      const data = await vettingService.getDrafts();
      if (data && data.length > 0) {
        setQuestions(data);
        if (data[0].course_outcome) {
          setSelectedCO(data[0].course_outcome);
        } else if (outcomes.length > 0) {
          setSelectedCO(outcomes[0].code);
        }
      }
    } catch (error) {
      toast.error('Failed to load vetting data');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleApprove = async () => {
    try {
      const selectedOutcome = courseOutcomes.find(co => co.code === selectedCO);
      await vettingService.updateQuestion(currentQuestion.id, {
        course_outcome: selectedCO,
        bloom_level: selectedOutcome?.bloom_level || 1,
        status: 'approved'
      });

      try { await gamificationService.addXP(1, 50); } catch (e) { }

      toast.success('Question Approved! (+50 XP)');
      handleNext();
    } catch (error) {
      toast.error('Approval failed');
    }
  };

  const handleReject = async () => {
    try {
      await vettingService.updateStatus(currentQuestion.id, 'rejected');
      toast.error('Question Rejected');
      handleNext();
    } catch (error) {
      toast.error('Rejection failed');
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setQuestions([]);
      toast.success('All questions reviewed!');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0A1F1F]">
        <Loader2 className="w-12 h-12 text-[#C5B3E6] animate-spin mb-4" />
        <p className="text-[#8B9E9E] font-black uppercase tracking-widest text-xs">Accessing Vault...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0A1F1F] flex flex-col overflow-hidden">
      {/* Premium Header */}
      <div className="px-8 pb-6 pt-16 shrink-0 relative overflow-hidden bg-[#0A1F1F]">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#C5B3E6]/10 rounded-full blur-[80px] -translate-y-24 translate-x-24" />

        <div className="flex items-center gap-4 relative z-10">
          <Link to="/">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-8 h-8 bg-[#0D2626] rounded-xl flex items-center justify-center border-2 border-[#1A3A3A] shadow-md">
              <ArrowLeft className="w-4 h-4 text-white" strokeWidth={3} />
            </motion.button>
          </Link>

          <div className="flex-1">
            <h1 className="text-2xl font-black text-white leading-none italic">Vetting Center</h1>
            <p className="text-[10px] font-black text-[#8B9E9E] uppercase tracking-[0.2em] mt-2 opacity-60">Quality Assurance Protocol</p>
          </div>

          <div className="flex items-center gap-2 bg-[#1A3A3A] px-4 py-2 rounded-2xl border-2 border-[#2D4E4E]">
            <ShieldCheck className="w-4 h-4 text-[#50FA7B]" />
            <span className="text-xs font-black text-white">{questions.length} DRAFTS</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-40 space-y-6">
        <AnimatePresence mode="wait">
          {!currentQuestion ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center -mt-20">
              <div className="w-20 h-20 bg-gradient-to-br from-[#1A3A3A] to-[#0A1F1F] rounded-[24px] flex items-center justify-center mb-6 shadow-2xl border-2 border-[#C5B3E6]/20">
                <Trophy className="w-8 h-8 text-[#C5B3E6]" />
              </div>
              <h2 className="text-xl font-black text-white mb-2 italic">Queue Empty!</h2>
              <p className="text-[#8B9E9E] font-bold text-[10px] max-w-[200px] mb-8 leading-relaxed">All generated questions have been processed into the knowledge base.</p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/generate')}
                className="bg-[#C5B3E6]/10 border-2 border-[#C5B3E6]/30 text-[#C5B3E6] px-6 py-3 rounded-[20px] font-black uppercase tracking-widest text-[10px] hover:bg-[#C5B3E6] hover:text-[#0A1F1F] transition-all mb-4 backdrop-blur-sm"
              >
                Generate More
              </motion.button>

              <Link to="/" className="text-[9px] font-black text-[#8B9E9E]/60 uppercase tracking-[0.2em] hover:text-white transition-colors">Return to base</Link>
            </motion.div>
          ) : (
            <motion.div key={currentQuestion.id} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="space-y-6">

              {/* Question Card */}
              <div className="bg-[#0D2626] border-4 border-[#1A3A3A] rounded-[48px] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8">
                  <span className="bg-[#1A3A3A] text-[#C5B3E6] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-[#2D4E4E]">
                    {currentQuestion.type}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-[#1A3A3A] rounded-2xl flex items-center justify-center shadow-inner"><Zap className="w-6 h-6 text-[#C5B3E6]" /></div>
                  <div>
                    <p className="text-[10px] font-black text-[#8B9E9E] uppercase tracking-widest leading-none mb-1">{currentQuestion.subject_name}</p>
                    <p className="text-xs font-black text-white/40">PROTOCOL ID: #{currentQuestion.id}</p>
                  </div>
                </div>

                <h2 className="text-2xl font-black text-white leading-tight mb-10 italic">"{currentQuestion.question_text}"</h2>

                {currentQuestion.options && (
                  <div className="space-y-4">
                    {currentQuestion.options.map((opt, i) => (
                      <div key={i} className={`p-5 rounded-[28px] flex items-center gap-5 border-4 transition-all ${opt === currentQuestion.correct_answer ? 'bg-[#50FA7B]/5 border-[#50FA7B]/40' : 'bg-[#0A1F1F] border-[#1A3A3A]'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${opt === currentQuestion.correct_answer ? 'bg-[#50FA7B] text-[#0A1F1F]' : 'bg-[#1A3A3A] text-[#8B9E9E]'}`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className={`text-base font-bold flex-1 ${opt === currentQuestion.correct_answer ? 'text-white' : 'text-[#8B9E9E]'}`}>{opt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Taxonomy Card */}
              <div className="bg-[#1A3A3A] rounded-[40px] p-8 border-4 border-[#2D4E4E] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8E61FF]/5 rounded-bl-[100px] pointer-events-none" />

                <div className="flex items-center gap-3 mb-8 relative z-10">
                  <Target className="w-6 h-6 text-[#C5B3E6]" />
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Taxonomy Alignment</h3>
                </div>

                <div className="space-y-8 relative z-10">
                  <div>
                    <p className="text-[10px] font-black text-[#8B9E9E] uppercase tracking-widest mb-4 ml-1">Course Outcome (CO)</p>
                    <div className="relative">
                      <select
                        value={selectedCO}
                        onChange={(e) => setSelectedCO(e.target.value)}
                        className="w-full bg-[#0D2626] border-4 border-[#2D4E4E] rounded-[24px] p-6 text-white font-black text-sm outline-none focus:border-[#C5B3E6]/40 transition-all appearance-none cursor-pointer"
                      >
                        {courseOutcomes.map(co => <option key={co.id} value={co.code}>{co.code}: {co.label}</option>)}
                      </select>
                      <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B9E9E] rotate-90" />
                    </div>
                  </div>

                  {selectedCO && (
                    <div className="bg-[#0A1F1F]/60 p-6 rounded-[28px] border-4 border-[#2D4E4E] flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-[#8B9E9E] uppercase tracking-widest mb-1">Bloom Level</p>
                        <p className="text-lg font-black text-white italic">Understanding</p>
                      </div>
                      <div className="w-14 h-14 bg-[#C5B3E6]/10 rounded-2xl flex items-center justify-center border-2 border-[#C5B3E6]/20">
                        <span className="text-xl font-black text-[#C5B3E6]">0{courseOutcomes.find(c => c.code === selectedCO)?.bloom_level || 2}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decision Footer */}
      {currentQuestion && (
        <div className="shrink-0 bg-[#0A1F1F]/80 backdrop-blur-xl p-8 pb-12 border-t-8 border-[#1A3A3A] shadow-[0_-30px_60px_rgba(0,0,0,0.6)] z-50">
          <div className="flex gap-4 max-w-md mx-auto">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleReject}
              className="flex-1 bg-[#1A3A3A] border-4 border-red-500/20 text-red-500 rounded-[32px] py-6 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3"
            >
              <X className="w-6 h-6 stroke-[3]" /> NO
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleApprove}
              className="flex-1 bg-[#C5B3E6] text-[#0A1F1F] rounded-[32px] py-6 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(197,179,230,0.3)]"
            >
              <CheckCircle2 className="w-6 h-6" /> OKAY
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
