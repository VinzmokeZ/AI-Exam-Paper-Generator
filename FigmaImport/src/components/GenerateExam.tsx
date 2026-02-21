import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowLeft, Sparkles, Clock, FileText, Target, Zap } from 'lucide-react';
import { AIPromptBox } from './AIPromptBox';

const savedRubrics = [
  {
    id: 1,
    name: 'Final Exam 2024',
    subject: 'Computer Science',
    code: 'CS301',
    questions: 27,
    marks: 100,
    duration: 180,
  },
  {
    id: 2,
    name: 'Mid-term Assessment',
    subject: 'Computer Science',
    code: 'CS301',
    questions: 19,
    marks: 50,
    duration: 90,
  },
];

export function GenerateExam() {
  const [selectedSubject, setSelectedSubject] = useState('cs301');
  const [selectedRubric, setSelectedRubric] = useState<number | null>(null);
  const [showAIPrompt, setShowAIPrompt] = useState(false);

  const handleAIGenerate = (prompt: string) => {
    console.log('Generating with prompt:', prompt);
    // Handle generation logic here
    setTimeout(() => {
      setShowAIPrompt(false);
    }, 500);
  };

  return (
    <div className="min-h-full">
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
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-[#0D2626] rounded-xl px-4 py-3 text-[#F5F1ED] text-sm border-2 border-[#0A1F1F] outline-none"
            >
              <option value="cs301">Computer Science (CS301)</option>
              <option value="math101">Mathematics (MATH101)</option>
              <option value="phys202">Physics (PHYS202)</option>
            </select>
          </div>
        </motion.div>
      </div>

      {/* AI Prompt CTA */}
      <div className="mx-6 mb-6">
        <motion.button
          onClick={() => setShowAIPrompt(true)}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-br from-[#C5B3E6] via-[#9B86C5] to-[#C5B3E6] rounded-[32px] p-6 border-4 border-white/30 relative overflow-hidden"
        >
          {/* Animated gradient overlay */}
          <motion.div
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(45deg, #C5B3E6 0%, #8BE9FD 50%, #FFB86C 100%)',
              backgroundSize: '200% 200%',
            }}
          />

          <div className="absolute top-0 left-0 w-12 h-12 bg-white/10 rounded-br-[48px]" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-black/10 rounded-tl-[96px]" />
          
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
        </motion.button>
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
          {savedRubrics.map((rubric, index) => (
            <motion.div
              key={rubric.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              onClick={() => setSelectedRubric(rubric.id)}
              className={`rounded-3xl p-5 border-4 cursor-pointer transition-all ${
                selectedRubric === rubric.id
                  ? 'bg-[#C5B3E6] border-[#B8A5D9]'
                  : 'bg-[#F5F1ED] border-[#E5DED6]'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-4 ${
                  selectedRubric === rubric.id
                    ? 'bg-[#0A1F1F] border-[#0D2626]'
                    : 'bg-[#0D2626] border-[#0A1F1F]'
                }`}>
                  <FileText className={`w-6 h-6 ${
                    selectedRubric === rubric.id ? 'text-[#C5B3E6]' : 'text-[#C5B3E6]'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-bold text-base mb-1 ${
                    selectedRubric === rubric.id ? 'text-[#0A1F1F]' : 'text-[#0A1F1F]'
                  }`}>
                    {rubric.name}
                  </h3>
                  <p className={`text-sm mb-2 ${
                    selectedRubric === rubric.id ? 'text-[#0A1F1F] opacity-70' : 'text-[#0A1F1F] opacity-60'
                  }`}>
                    {rubric.subject} ({rubric.code})
                  </p>
                  
                  <div className="flex items-center gap-3 text-xs">
                    <span className={selectedRubric === rubric.id ? 'text-[#0A1F1F] opacity-80' : 'text-[#0A1F1F] opacity-60'}>
                      {rubric.questions} Questions
                    </span>
                    <span className={selectedRubric === rubric.id ? 'text-[#0A1F1F] opacity-60' : 'text-[#0A1F1F] opacity-40'}>•</span>
                    <span className={selectedRubric === rubric.id ? 'text-[#0A1F1F] opacity-80' : 'text-[#0A1F1F] opacity-60'}>
                      {rubric.marks} Marks
                    </span>
                    <span className={selectedRubric === rubric.id ? 'text-[#0A1F1F] opacity-60' : 'text-[#0A1F1F] opacity-40'}>•</span>
                    <span className={selectedRubric === rubric.id ? 'text-[#0A1F1F] opacity-80' : 'text-[#0A1F1F] opacity-60'}>
                      {rubric.duration} min
                    </span>
                  </div>
                </div>
              </div>

              {selectedRubric === rubric.id && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full bg-[#0A1F1F] rounded-2xl py-4 text-[#C5B3E6] font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate with AI
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Generate Option */}
      <div className="px-6 pb-6">
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

      {/* AI Prompt Modal */}
      {showAIPrompt && (
        <AIPromptBox
          onGenerate={handleAIGenerate}
          onClose={() => setShowAIPrompt(false)}
        />
      )}
    </div>
  );
}