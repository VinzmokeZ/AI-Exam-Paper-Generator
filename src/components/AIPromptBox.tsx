import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Mic, Zap, Wand2, Brain, X, Loader2, CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const promptSuggestions = [
  { text: 'Generate 10 MCQs on sorting algorithms', color: '#C5B3E6' },
  { text: 'Create essay questions about OOP', color: '#8BE9FD' },
  { text: 'Make coding problems for data structures', color: '#FFB86C' },
  { text: 'Build questions on time complexity', color: '#FF6AC1' },
  { text: 'Design scenario-based questions', color: '#50FA7B' },
];

interface AIPromptBoxProps {
  onGenerate?: (prompt: string, engine?: string) => void;
  onClose?: () => void;
  engine?: string;
}

export function AIPromptBox({ onGenerate, onClose, engine = 'local' }: AIPromptBoxProps) {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [complexity, setComplexity] = useState("Balanced");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileStatus, setFileStatus] = useState<'idle' | 'uploading' | 'ready'>('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileStatus('ready');
      setShowSuggestions(false);
    }
  };

  const handleGenerate = async () => {
    if (prompt.trim() || selectedFile) {
      // If parent component provided a handler, use it instead of internal logic
      if (onGenerate && !selectedFile) {
        // Pass engine state properly
        onGenerate(prompt, engine);
        return;
      }

      setIsGenerating(true);

      try {
        const { generationService } = await import('../services/api');
        let generatedQuestions;

        if (selectedFile) {
          // File-based generation (Now supports mixed dual prompts)
          setFileStatus('uploading');
          generatedQuestions = await generationService.uploadGenerationFile(
            selectedFile,
            parseInt(prompt.match(/\d+/)?.[0] || '5'),
            complexity,
            engine,
            undefined, // subjectId
            undefined, // topicId
            prompt.trim() !== '' ? prompt : undefined // Pass the prompt!
          );
        } else {
          // Normal prompt generation
          generatedQuestions = await generationService.generateQuestions(
            "General",
            prompt,
            complexity,
            5,
            undefined,
            undefined,
            engine
          );
        }

        if (generatedQuestions && generatedQuestions.length > 0) {
          setIsSuccess(true);
          setTimeout(() => {
            navigate('/vetting', { state: { questions: generatedQuestions } });
            if (onClose) onClose();
          }, 2000);
        } else {
          throw new Error("No questions generated");
        }

      } catch (error) {
        console.error("Generation failed:", error);
        setIsGenerating(false);
        setFileStatus('idle');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleVetNow = () => {
    // This function is now redundant as navigation happens automatically on success, 
    // but kept if we want a manual trigger from the success screen.
    // Ideally, the success screen should just be a transition state.
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    setShowSuggestions(false);
  };

  const maxChars = 500;
  const charCount = prompt.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-[#0A2F2F]/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      {/* Floating particles (Success Mode has more particles) */}
      {[...Array(isSuccess ? 12 : 8)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(i) * 20, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
          }}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 3) * 25}%`,
            backgroundColor: ['#C5B3E6', '#8BE9FD', '#FFB86C', '#FF6AC1', '#50FA7B', '#F1FA8C'][i % 6],
          }}
        />
      ))}

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success-box"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="w-full max-w-sm bg-[#F5F1ED] rounded-[32px] p-8 text-center border-4 border-[#50FA7B] shadow-2xl relative overflow-hidden"
          >
            {/* Success Confetti Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={`confetti-${i}`}
                  initial={{ y: -20, opacity: 1 }}
                  animate={{ y: 400, opacity: 0, rotate: 360 }}
                  transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                  className="absolute w-2 h-2"
                  style={{
                    left: `${Math.random() * 100}%`,
                    backgroundColor: ['#50FA7B', '#FF6AC1', '#FFB86C'][Math.floor(Math.random() * 3)],
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-24 h-24 bg-[#50FA7B] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10"
            >
              <CheckCircle2 className="w-12 h-12 text-[#0A1F1F]" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-black italic text-[#0A1F1F] mb-2 relative z-10"
            >
              BOOM!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg font-bold text-[#0A1F1F] mb-6 relative z-10"
            >
              Exam Paper Ready
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1F]/60 mb-8 relative z-10"
            >
              Questions have been moved<br />to vetting center
            </motion.p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVetNow}
              className="w-full py-4 bg-[#0A1F1F] text-[#F5F1ED] rounded-xl font-bold flex items-center justify-center gap-2 relative z-10 hover:bg-[#0D2626] transition-colors"
            >
              <span>VET NOW</span>
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="prompt-box"
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-full max-w-md relative"
          >
            {/* Main Container */}
            <div className="bg-gradient-to-br from-[#F5F1ED] to-[#E5DED6] rounded-[40px] p-5 border-4 border-[#E5DED6] relative overflow-hidden shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col">
              {/* Animated gradient overlay */}
              <motion.div
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  background: 'linear-gradient(45deg, #C5B3E6 0%, #8BE9FD 25%, #FFB86C 50%, #FF6AC1 75%, #C5B3E6 100%)',
                  backgroundSize: '400% 400%',
                }}
              />

              {/* Close button */}
              {onClose && (
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 bg-[#0D2626] rounded-xl flex items-center justify-center z-20 cursor-pointer hover:bg-[#1a3f3f] transition-colors shadow-sm"
                >
                  <X className="w-5 h-5 text-[#F5F1ED]" />
                </motion.button>
              )}

              {/* Header with Engine Indicator */}
              <div className="mb-4 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-[#0A1F1F] rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-[#50FA7B]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#0A1F1F] leading-tight">Ask AI</h3>

                    {/* Engine Indicator Badge */}
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${engine === 'gemini' || engine === 'cloud' || engine === 'openai'
                      ? 'bg-[#50FA7B]/10 border-[#50FA7B] text-[#0A1F1F]'
                      : 'bg-[#FFB86C]/10 border-[#FFB86C] text-[#0A1F1F]'
                      }`}>
                      {engine === 'gemini' || engine === 'cloud' || engine === 'openai' ? (
                        <>
                          <Zap className="w-3 h-3 fill-current" />
                          <span>Gemini Cloud (Fast)</span>
                        </>
                      ) : (
                        <>
                          <Brain className="w-3 h-3" />
                          <span>Local Model</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm font-bold text-[#8B9E9E]">Describe what you want to create:</p>
              </div>


              {/* Prompt Suggestions */}
              <AnimatePresence>
                {showSuggestions && !prompt && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 overflow-hidden relative z-10"
                  >
                    <p className="text-[10px] font-bold text-[#0A1F1F] opacity-60 uppercase mb-2">Try these:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {promptSuggestions.slice(0, 3).map((suggestion, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSuggestionClick(suggestion.text)}
                          className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border text-[#0A1F1F] truncate max-w-[150px]"
                          style={{
                            backgroundColor: `${suggestion.color}30`,
                            borderColor: `${suggestion.color}60`,
                          }}
                        >
                          {suggestion.text}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Prompt Input Area */}
              <div className="mb-4 relative z-10">
                <div className="relative">
                  {/* Glow effect */}
                  {prompt && (
                    <motion.div
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [0.98, 1.02, 0.98],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-[#C5B3E6] via-[#8BE9FD] to-[#FFB86C] rounded-3xl blur-xl"
                    />
                  )}

                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: Create 15 multiple choice questions about binary search trees with varying difficulty levels..."
                    maxLength={maxChars}
                    rows={4}
                    className="w-full bg-white rounded-3xl px-5 py-4 text-[#0A1F1F] placeholder:text-[#0A1F1F]/40 text-sm border-4 border-[#E5DED6] outline-none resize-none relative z-10 focus:border-[#C5B3E6] transition-colors"
                  />

                  {/* Character count */}
                  <div className="absolute bottom-3 right-4 z-20">
                    <motion.span
                      animate={{
                        color: charCount > maxChars * 0.9 ? '#FF6AC1' : '#0A1F1F',
                      }}
                      className="text-[10px] font-bold opacity-40"
                    >
                      {charCount}/{maxChars}
                    </motion.span>
                  </div>

                  {/* Magic wand button */}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-[#FFB86C] to-[#FF6AC1] rounded-xl flex items-center justify-center z-20 shadow-lg"
                  >
                    <Wand2 className="w-4 h-4 text-[#0A1F1F]" />
                  </motion.button>
                </div>

                {/* File Preview */}
                <AnimatePresence>
                  {selectedFile && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-3 p-3 bg-white/60 rounded-2xl border-2 border-[#50FA7B] flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-8 h-8 bg-[#50FA7B] rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-[#0A1F1F]" />
                        </div>
                        <span className="text-xs font-bold text-[#0A1F1F] truncate max-w-[200px]">
                          {selectedFile.name}
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedFile(null)}
                        className="w-6 h-6 bg-[#FF6AC1] rounded-lg flex items-center justify-center text-white"
                      >
                        <X className="w-3 h-3" />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3 mb-4 relative z-10">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => document.getElementById('adhoc-file-input')?.click()}
                  className={`py-3 rounded-2xl border-4 border-white/30 flex items-center justify-center gap-2 transition-all ${selectedFile ? 'bg-[#50FA7B] shadow-[0_0_15px_#50FA7B60]' : 'bg-gradient-to-br from-[#8BE9FD] to-[#6FEDD6]'}`}
                >
                  <FileText className="w-4 h-4 text-[#0A1F1F]" />
                  <span className="text-xs font-bold text-[#0A1F1F]">
                    {selectedFile ? 'Selected' : 'File'}
                  </span>
                </motion.button>

                <input
                  id="adhoc-file-input"
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                />

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="py-3 rounded-2xl bg-gradient-to-br from-[#F1FA8C] to-[#50FA7B] border-4 border-white/30 flex items-center justify-center gap-2"
                >
                  <Brain className="w-4 h-4 text-[#0A1F1F]" />
                  <span className="text-xs font-bold text-[#0A1F1F]">Ideas</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="py-3 rounded-2xl bg-gradient-to-br from-[#FFB86C] to-[#FF6AC1] border-4 border-white/30 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-[#0A1F1F]" />
                  <span className="text-xs font-bold text-[#0A1F1F]">Quick</span>
                </motion.button>
              </div>

              {/* Complexity Level Selector */}
              <div className="mb-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#0A1F1F] opacity-60 uppercase">Complexity Level</span>
                  <span className="text-[10px] font-bold text-[#FF6AC1]">{complexity}</span>
                </div>
                <div className="bg-white/40 rounded-xl p-1 flex gap-1 border-2 border-[#E5DED6]">
                  {['Simple', 'Balanced', 'Advanced'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setComplexity(level)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${complexity === level
                        ? 'bg-[#0A1F1F] text-[#F5F1ED] shadow-sm'
                        : 'text-[#0A1F1F] hover:bg-[#0A1F1F]/5'
                        }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <motion.button
                onClick={handleGenerate}
                disabled={(!prompt.trim() && !selectedFile) || isGenerating}
                whileHover={(prompt.trim() || selectedFile) && !isGenerating ? { scale: 1.02 } : {}}
                whileTap={(prompt.trim() || selectedFile) && !isGenerating ? { scale: 0.98 } : {}}
                className={`w-full py-5 rounded-[28px] font-bold text-lg flex items-center justify-center gap-3 border-4 relative overflow-hidden transition-all ${(prompt.trim() || selectedFile) && !isGenerating
                  ? 'bg-gradient-to-br from-[#C5B3E6] via-[#9B86C5] to-[#C5B3E6] border-white/30 text-[#0A1F1F]'
                  : 'bg-[#0D2626] border-[#0A1F1F] text-[#8B9E9E] cursor-not-allowed'
                  }`}
              >
                {/* Animated shimmer for active state */}
                {(prompt.trim() || selectedFile) && !isGenerating && (
                  <motion.div
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                  />
                )}

                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="w-6 h-6" />
                    </motion.div>
                    <span>Generating with AI...</span>

                    {/* Particle burst */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          x: [0, Math.cos((i * 60 * Math.PI) / 180) * 40],
                          y: [0, Math.sin((i * 60 * Math.PI) / 180) * 40],
                          opacity: [1, 0],
                          scale: [0, 1],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                        className="absolute w-2 h-2 bg-[#C5B3E6] rounded-full"
                        style={{
                          left: '50%',
                          top: '50%',
                        }}
                      />
                    ))}
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6 relative z-10" />
                    <span className="relative z-10">Generate Questions</span>
                  </>
                )}
              </motion.button>

              {/* AI Processing Indicator */}
              <AnimatePresence>
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden relative z-10"
                  >
                    <div className="bg-[#0D2626] rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          className="w-8 h-8 bg-gradient-to-br from-[#C5B3E6] to-[#8BE9FD] rounded-xl flex items-center justify-center"
                        >
                          <Brain className="w-5 h-5 text-[#0A1F1F]" />
                        </motion.div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[#F5F1ED]">AI is thinking...</p>
                          <p className="text-xs text-[#8B9E9E]">Analyzing requirements</p>
                        </div>
                      </div>

                      {/* Progress stages */}
                      <div className="space-y-2">
                        {[
                          { label: 'Understanding prompt', delay: 0 },
                          { label: 'Analyzing complexity', delay: 0.5 },
                          { label: 'Generating questions', delay: 1 },
                        ].map((stage, index) => (
                          <motion.div
                            key={stage.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: stage.delay }}
                            className="flex items-center gap-2"
                          >
                            <motion.div
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5],
                              }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: stage.delay }}
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: ['#8BE9FD', '#FFB86C', '#50FA7B'][index],
                              }}
                            />
                            <span className="text-xs text-[#8B9E9E]">{stage.label}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )
        }
      </AnimatePresence >
    </motion.div >
  );
}
