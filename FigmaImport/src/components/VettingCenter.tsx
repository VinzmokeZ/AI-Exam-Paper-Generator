import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight, Check, X, Edit2, Send, Target, ArrowLeft, CheckCircle2 } from 'lucide-react';

const sampleQuestions = [
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

export function VettingCenter() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [vettedQuestions, setVettedQuestions] = useState<Record<number, 'approved' | 'rejected'>>({});
  const [editMode, setEditMode] = useState(false);
  const [selectedCOLevels, setSelectedCOLevels] = useState(sampleQuestions[0].courseOutcomes);

  const currentQuestion = sampleQuestions[currentIndex];
  const progressPercent = ((currentIndex + 1) / sampleQuestions.length) * 100;
  const totalQuestions = sampleQuestions.length;

  const handleNext = () => {
    if (currentIndex < sampleQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setEditMode(false);
      setSelectedCOLevels(sampleQuestions[currentIndex + 1].courseOutcomes);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setEditMode(false);
      setSelectedCOLevels(sampleQuestions[currentIndex - 1].courseOutcomes);
    }
  };

  const handleApprove = () => {
    setVettedQuestions({ ...vettedQuestions, [currentQuestion.id]: 'approved' });
  };

  const handleReject = () => {
    setVettedQuestions({ ...vettedQuestions, [currentQuestion.id]: 'rejected' });
  };

  const handleSubmitNext = () => {
    if (!vettedQuestions[currentQuestion.id]) {
      handleApprove(); // Auto-approve if not decided
    }
    handleNext();
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
                  {currentIndex + 1} of {totalQuestions}
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
              <span className="text-sm font-bold text-[#0A1F1F]">{currentQuestion.type}</span>
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
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-[32px] p-6 border-4 border-[#E5DED6]"
          >
            <div className="mb-6">
              <p className="text-base text-[#0A1F1F] leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>

            {/* MCQ Options */}
            {currentQuestion.type === 'MCQ' && currentQuestion.options && (
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className={`rounded-2xl p-4 border-3 ${
                      index === currentQuestion.correctAnswer
                        ? 'bg-[#50FA7B]/20 border-[#50FA7B]'
                        : 'bg-[#F5F1ED] border-[#E5DED6]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                          index === currentQuestion.correctAnswer
                            ? 'bg-[#50FA7B] text-white'
                            : 'bg-[#E5DED6] text-[#0A1F1F]'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}.
                      </div>
                      <span className="text-sm text-[#0A1F1F] flex-1">{option}</span>
                      {index === currentQuestion.correctAnswer && (
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
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Course Outcome Mapping */}
      <div className="mx-6 mb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#F5F1ED] rounded-[32px] p-5 border-4 border-[#E5DED6]"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-[#0A1F1F]" />
            <h3 className="text-sm font-bold text-[#0A1F1F] uppercase">Course Outcome Mapping</h3>
          </div>

          <div className="space-y-3">
            {courseOutcomes.map((co, index) => {
              const coKey = `co${index + 1}`;
              const currentLevel = selectedCOLevels[coKey as keyof typeof selectedCOLevels] || 1;
              
              return (
                <motion.div
                  key={co.code}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + index * 0.05 }}
                  className="bg-white rounded-2xl p-4 border-3 border-[#E5DED6]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="px-3 py-1.5 rounded-xl font-bold text-xs text-white"
                        style={{ backgroundColor: co.color }}
                      >
                        {co.code}
                      </div>
                      <span className="text-sm font-medium text-[#0A1F1F]">{co.label}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3].map((level) => (
                        <motion.button
                          key={level}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setCOLevel(coKey, level)}
                          className={`w-10 h-10 rounded-lg font-bold text-sm flex items-center justify-center border-2 transition-all ${
                            currentLevel === level
                              ? 'text-white border-transparent shadow-lg'
                              : 'bg-white text-[#0A1F1F] border-[#E5DED6]'
                          }`}
                          style={{
                            backgroundColor: currentLevel === level ? getDifficultyColor(level) : undefined,
                          }}
                        >
                          {level}
                        </motion.button>
                      ))}
                    </div>
                    {currentLevel > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold"
                        style={{
                          backgroundColor: `${getDifficultyColor(currentLevel)}30`,
                          color: getDifficultyColor(currentLevel),
                        }}
                      >
                        {getDifficultyLabel(currentLevel)}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="mx-6 mb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[32px] p-5 border-4 border-[#E5DED6]"
        >
          <p className="text-[10px] font-bold text-[#0A1F1F] uppercase mb-3 opacity-60">Actions</p>
          
          <div className="flex gap-3 mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReject}
              className={`flex-1 rounded-2xl py-4 font-bold text-white flex items-center justify-center gap-2 border-4 ${
                vettedQuestions[currentQuestion.id] === 'rejected'
                  ? 'bg-gradient-to-br from-[#FF6AC1] to-[#FF5A9E] border-[#FF6AC1]/50'
                  : 'bg-gradient-to-br from-[#FF6AC1] to-[#FF5A9E] border-white/30'
              }`}
            >
              <X className="w-5 h-5" />
              <span>Reject</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setEditMode(!editMode)}
              className="px-5 bg-[#F5F1ED] border-4 border-[#E5DED6] rounded-2xl py-4 flex items-center justify-center"
            >
              <Edit2 className="w-5 h-5 text-[#0A1F1F]" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleApprove}
              className={`flex-1 rounded-2xl py-4 font-bold text-white flex items-center justify-center gap-2 border-4 ${
                vettedQuestions[currentQuestion.id] === 'approved'
                  ? 'bg-gradient-to-br from-[#50FA7B] to-[#6FEDD6] border-[#50FA7B]/50'
                  : 'bg-gradient-to-br from-[#50FA7B] to-[#6FEDD6] border-white/30'
              }`}
            >
              <Check className="w-5 h-5" />
              <span>Approve</span>
            </motion.button>
          </div>

          {/* Submit & Next */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmitNext}
            disabled={currentIndex === totalQuestions - 1}
            className={`w-full rounded-2xl py-5 font-bold text-white flex items-center justify-center gap-3 border-4 border-white/30 relative overflow-hidden ${
              currentIndex === totalQuestions - 1
                ? 'bg-[#8B9E9E] cursor-not-allowed'
                : 'bg-gradient-to-br from-[#8BE9FD] to-[#6FEDD6]'
            }`}
          >
            {currentIndex === totalQuestions - 1 ? (
              <>
                <Check className="w-6 h-6" />
                <span className="text-base">Complete Review</span>
              </>
            ) : (
              <>
                <Send className="w-6 h-6" />
                <span className="text-base">Submit & Next</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute right-4"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.div>
              </>
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="mx-6 mb-6 relative z-10">
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: currentIndex > 0 ? 1.02 : 1 }}
            whileTap={{ scale: currentIndex > 0 ? 0.98 : 1 }}
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`rounded-2xl py-4 font-bold flex items-center justify-center gap-2 border-4 ${
              currentIndex === 0
                ? 'bg-[#F5F1ED] border-[#E5DED6] text-[#8B9E9E] cursor-not-allowed'
                : 'bg-white border-[#E5DED6] text-[#0A1F1F]'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: currentIndex < totalQuestions - 1 ? 1.02 : 1 }}
            whileTap={{ scale: currentIndex < totalQuestions - 1 ? 0.98 : 1 }}
            onClick={handleNext}
            disabled={currentIndex === totalQuestions - 1}
            className={`rounded-2xl py-4 font-bold flex items-center justify-center gap-2 border-4 ${
              currentIndex === totalQuestions - 1
                ? 'bg-[#F5F1ED] border-[#E5DED6] text-[#8B9E9E] cursor-not-allowed'
                : 'bg-white border-[#E5DED6] text-[#0A1F1F]'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="mx-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#0D2626] rounded-2xl p-4 border-4 border-[#0A1F1F]"
        >
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#50FA7B] rounded-full" />
              <span className="text-[#F5F1ED] font-medium">
                Approved: {Object.values(vettedQuestions).filter(v => v === 'approved').length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#FF6AC1] rounded-full" />
              <span className="text-[#F5F1ED] font-medium">
                Rejected: {Object.values(vettedQuestions).filter(v => v === 'rejected').length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#FFB86C] rounded-full" />
              <span className="text-[#F5F1ED] font-medium">
                Pending: {totalQuestions - Object.keys(vettedQuestions).length}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}