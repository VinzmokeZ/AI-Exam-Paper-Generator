import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, X, Edit2, Send, Target, ArrowLeft, CheckCircle2, Zap, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { historyService } from '../services/api';
import { ExamStructurePreview } from './ExamStructurePreview';

const defaultQuestions = [
  {
    id: 1,
    type: 'MCQ',
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correctAnswer: 1,
    subject: 'Computer Science',
    courseOutcomes: { co1: 1, co2: 3, co3: 2, co4: 1, co5: 3 },
  },
  {
    id: 2,
    type: 'ESSAY',
    question: 'Explain the concept of recursion with a real-world example.',
    subject: 'Computer Science',
    courseOutcomes: { co1: 1, co2: 2, co3: 3, co4: 1, co5: 1 },
  },
  {
    id: 3,
    type: 'MCQ',
    question: 'Which data structure uses LIFO principle?',
    options: ['Queue', 'Stack', 'Tree', 'Graph'],
    correctAnswer: 1,
    subject: 'Data Structures',
    courseOutcomes: { co1: 2, co2: 1, co3: 1, co4: 2, co5: 1 },
  },
];

const courseOutcomes = [
  { code: 'CO1', label: 'Analyze', color: '#8BE9FD' },
  { code: 'CO2', label: 'Knowledge', color: '#C5B3E6' },
  { code: 'CO3', label: 'Apply', color: '#FFB86C' },
  { code: 'CO4', label: 'Evaluate', color: '#FF6AC1' },
  { code: 'CO5', label: 'Create', color: '#50FA7B' },
];


interface VettingState {
  questions: any[];
  subjectName?: string;
  topicName?: string;
  duration?: number;
  rubricName?: string;
}

export function VettingCenter() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as VettingState;

  const [questions, setQuestions] = useState<any[]>(defaultQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [vettedQuestions, setVettedQuestions] = useState<Record<number, 'approved' | 'rejected'>>({});
  const [editMode, setEditMode] = useState(false);
  const [selectedCOLevels, setSelectedCOLevels] = useState(defaultQuestions[0].courseOutcomes);
  const [showStructurePreview, setShowStructurePreview] = useState(false);

  useEffect(() => {
    if (state?.questions) {
      setQuestions(state.questions);
      setSelectedCOLevels(state.questions[0]?.courseOutcomes || defaultQuestions[0].courseOutcomes);
    }
  }, [location.state]);

  const currentQuestion = questions[currentIndex];
  // Guard clause if questions array is empty or undefined
  if (!currentQuestion) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#F5F1ED] p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0A1F1F] mb-4">No Questions Found</h2>
          <p className="text-[#8B9E9E] mb-8">It seems the generation didn't return any questions to vet.</p>
          <button
            onClick={() => navigate('/generate')}
            className="bg-[#0A1F1F] text-white px-8 py-3 rounded-xl font-bold"
          >
            Back to Generator
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const totalQuestions = questions.length;

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setEditMode(false);
      setSelectedCOLevels(questions[nextIndex]?.courseOutcomes || defaultQuestions[0].courseOutcomes);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setEditMode(false);
      setSelectedCOLevels(questions[prevIndex]?.courseOutcomes || defaultQuestions[0].courseOutcomes);
    }
  };

  const handleApprove = () => {
    setVettedQuestions({ ...vettedQuestions, [currentQuestion.id]: 'approved' });
    handleSubmitNext();
  };

  const handleReject = () => {
    setVettedQuestions({ ...vettedQuestions, [currentQuestion.id]: 'rejected' });
    handleSubmitNext();
  };

  const handleComplete = async () => {
    const approved = questions.filter(q => vettedQuestions[q.id] === 'approved' || (!vettedQuestions[q.id] && q.id === currentQuestion.id));

    if (approved.length === 0) {
      toast.error("Please approve at least one question!");
      return;
    }

    // 1. Update statuses in backend
    try {
      const { vettingService, gamificationService } = await import('../services/api');
      await Promise.all(approved.map(q => vettingService.updateStatus(q.id, 'approved')));

      // 2. Create history record (Silent Save)
      await historyService.saveHistory({
        name: `${state?.subjectName || currentQuestion.subject_name || 'General'} Exam`,
        subject: state?.subjectName || currentQuestion.subject_name || currentQuestion.subject || 'General',
        subject_name: state?.subjectName || currentQuestion.subject_name || currentQuestion.subject || 'General',
        topic_name: state?.topicName || currentQuestion.topic_name || 'AI Generated',
        question_count: approved.length,
        qs: approved.length,
        total_marks: approved.reduce((acc, q) => acc + (q.marks || 0), 0) || (approved.length * 2),
        marks: approved.reduce((acc, q) => acc + (q.marks || 0), 0) || (approved.length * 2),
        duration: state?.duration || 60,
        questions: approved.map(q => ({ ...q, status: 'approved' })),
        created_at: new Date().toISOString(),
        date: new Date().toLocaleDateString()
      });

      // 3. Reward user
      await gamificationService.addXP(1, approved.length * 10);
      toast.success("Exam Saved! Opening Preview...");

      // 4. Show Structure Preview
      setShowStructurePreview(true);

    } catch (error) {
      console.error("Vetting completion failed:", error);
      toast.error("Failed to save history. Please try again.");
    }
  };

  const handleSubmitNext = () => {
    if (currentIndex === questions.length - 1) {
      handleComplete();
    } else {
      handleNext();
    }
  };

  const setCOLevel = (coKey: string, level: number) => {
    setSelectedCOLevels(prev => ({
      ...prev,
      [coKey]: level
    }));
  };

  const getDifficultyLabel = (level: number) => {
    if (level === 1) return 'Mild';
    if (level === 2) return 'Moderate';
    return 'High';
  };

  const getDifficultyColor = (level: number) => {
    if (level === 1) return '#F1FA8C';
    if (level === 2) return '#FFB86C';
    return '#FF6AC1';
  };

  if (showStructurePreview) {
    const approvedQuestions = questions.filter(q => vettedQuestions[q.id] === 'approved' || (!vettedQuestions[q.id]));
    return (
      <ExamStructurePreview
        questions={approvedQuestions}
        subjectName={currentQuestion.subject || 'Computer Science'}
        rubricName={state?.rubricName}
        onBack={() => setShowStructurePreview(false)}
      />
    );
  }

  return (
    <div className="min-h-full pb-6">
      {/* Floating background elements */}
      <div className="fixed top-20 left-10 w-40 h-40 bg-[#FFB86C]/10 rounded-full blur-3xl float-slow" />
      <div className="fixed bottom-40 right-10 w-36 h-36 bg-[#C5B3E6]/10 rounded-full blur-3xl float-slow float-delay-1" />

      {/* Header */}
      <div className="mx-6 mt-4 mb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#8BE9FD] to-[#6FEDD6] rounded-[32px] p-6 border-4 border-white/30 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link to="/">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-white/40"
                >
                  <ArrowLeft className="w-5 h-5 text-[#0A1F1F]" />
                </motion.div>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-[#0A1F1F]">Vetting</h1>
                <p className="text-xs text-[#0A1F1F] opacity-70 font-medium">
                  Step {currentIndex + 1} of {totalQuestions}
                </p>
              </div>
            </div>

            {/* Question Type Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="px-4 py-2 bg-white/30 backdrop-blur-sm rounded-2xl border-2 border-white/40"
            >
              <span className="text-sm font-bold text-[#0A1F1F]">{currentQuestion.question_type || currentQuestion.type || 'MCQ'}</span>
            </motion.div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/30 rounded-full h-2 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-[#0A1F1F] to-[#0D2626] relative"
            >
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Question Card */}
      <div className="mx-6 mb-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id || currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-[32px] p-6 border-4 border-[#E5DED6] relative overflow-hidden"
          >
            {/* Short Notes Badge - New Addition */}
            {(currentQuestion.type === 'Short' || currentQuestion.question_type === 'Short') && (
              <div className="absolute top-0 right-0 bg-[#FFB86C] px-4 py-1 rounded-bl-2xl font-bold text-[10px] text-[#0A1F1F] uppercase tracking-wider">
                Short Notes
              </div>
            )}

            <div className="mb-6 mt-2">
              {currentQuestion.type === 'Case Study' && currentQuestion.scenario_text ? (
                <div className="mb-4 p-4 bg-[#F5F1ED] rounded-2xl border-2 border-dashed border-[#E5DED6]">
                  <h4 className="text-[10px] font-black text-[#0A1F1F] uppercase mb-2">Case Scenario</h4>
                  <p className="text-sm text-[#0A1F1F] leading-relaxed italic">
                    {currentQuestion.scenario_text}
                  </p>
                </div>
              ) : null}
              <p className="text-base font-bold text-[#0A1F1F] leading-relaxed">
                {currentQuestion.question_text || currentQuestion.question}
              </p>
            </div>

            {/* MCQ Options */}
            {((currentQuestion.type === 'MCQ' || currentQuestion.question_type === 'MCQ') || currentQuestion.options) && (
              <div className="space-y-3 mb-6">
                {currentQuestion.options?.map((option: any, index: any) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className={`rounded-2xl p-4 border-3 ${(typeof currentQuestion.correctAnswer === 'number' ? index === currentQuestion.correctAnswer : option === currentQuestion.correct_answer || (currentQuestion.correct_answer && option && option.includes(currentQuestion.correct_answer)))
                      ? 'bg-[#50FA7B]/20 border-[#50FA7B]'
                      : 'bg-[#F5F1ED] border-[#E5DED6]'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${(typeof currentQuestion.correctAnswer === 'number' ? index === currentQuestion.correctAnswer : option === currentQuestion.correct_answer || (currentQuestion.correct_answer && option && option.includes(currentQuestion.correct_answer)))
                          ? 'bg-[#50FA7B] text-white'
                          : 'bg-[#E5DED6] text-[#0A1F1F]'
                          }`}
                      >
                        {String.fromCharCode(65 + index)}.
                      </div>
                      <span className="text-sm text-[#0A1F1F] flex-1">{option}</span>
                      {(typeof currentQuestion.correctAnswer === 'number' ? index === currentQuestion.correctAnswer : option === currentQuestion.correct_answer || (currentQuestion.correct_answer && option && option.includes(currentQuestion.correct_answer))) && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', delay: 0.3 }}
                        >
                          <CheckCircle2 className="w-5 h-5 text-[#50FA7B]" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Logic Keys & Explanations */}
            {(currentQuestion.explanation || currentQuestion.logic_key) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 pt-6 border-t-2 border-dashed border-[#E5DED6]"
              >
                <div className="bg-gradient-to-br from-[#8BE9FD]/10 to-[#C5B3E6]/10 rounded-2xl p-4 border-2 border-[#8BE9FD]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-[#8BE9FD] rounded-lg flex items-center justify-center">
                      <Zap className="w-3 h-3 text-[#0A1F1F]" />
                    </div>
                    <h4 className="text-[10px] font-black text-[#0A1F1F] uppercase tracking-wider">Logic Keys & Explanations</h4>
                  </div>
                  <p className="text-sm text-[#0A1F1F]/80 leading-relaxed font-medium">
                    {currentQuestion.logic_key && (
                      <span className="block mb-2 text-[#0A1F1F] font-bold">Key: {currentQuestion.logic_key}</span>
                    )}
                    {currentQuestion.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Course Outcome Mapping (Detailed List) */}
      <div className="mx-6 mb-6 relative z-10">
        <div className="flex items-center gap-2 mb-3 px-2">
          <Target className="w-4 h-4 text-[#0A1F1F]" />
          <h3 className="text-xs font-bold text-[#0A1F1F] uppercase">Course Outcome Mapping</h3>
        </div>

        <div className="bg-white rounded-[24px] overflow-hidden border-4 border-[#E5DED6] shadow-sm">
          {courseOutcomes.map((co) => {
            const coKey = co.code.toLowerCase(); // co1, co2...
            const level = selectedCOLevels && (selectedCOLevels as any)[coKey];

            if (!level) return null; // Show only mapped COs

            return (
              <div key={co.code} className="flex items-center justify-between p-4 border-b border-[#F5F1ED] last:border-0">
                <div className="flex items-center gap-3">
                  <div
                    className="px-2 py-1 rounded-lg text-xs font-bold border-2"
                    style={{
                      borderColor: co.color,
                      color: '#0A1F1F',
                      backgroundColor: `${co.color}20`
                    }}
                  >
                    {co.code}
                  </div>
                  <span className="text-sm font-semibold text-[#0A1F1F]">{co.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#8B9E9E]">Level {level}</span>
                </div>
              </div>
            );
          })}
          {(!selectedCOLevels || Object.values(selectedCOLevels).every(v => !v)) && (
            <div className="p-6 text-center text-xs text-[#8B9E9E] italic">
              No explicit CO mapping found for this question.
            </div>
          )}
        </div>
      </div>

      {/* Actions - RED/GREEN Buttons */}
      <div className="mx-6 mb-24 relative z-10">
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReject}
            className="flex-1 bg-[#FF6AC1] text-white rounded-[24px] py-6 font-black text-lg shadow-xl border-4 border-[#FF6AC1]/50 flex flex-col items-center justify-center gap-1"
          >
            <X className="w-8 h-8" strokeWidth={3} />
            <span className="text-xs opacity-80 uppercase tracking-widest">Reject</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleApprove}
            className="flex-1 bg-[#50FA7B] text-[#0A1F1F] rounded-[24px] py-6 font-black text-lg shadow-xl border-4 border-[#50FA7B]/50 flex flex-col items-center justify-center gap-1"
          >
            <Check className="w-8 h-8" strokeWidth={3} />
            <span className="text-xs opacity-60 uppercase tracking-widest">Approve</span>
          </motion.button>
        </div>
      </div>
    </div >
  );
}
