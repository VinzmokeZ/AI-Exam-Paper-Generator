import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Mic, Zap, Wand2, Brain, X, Loader2 } from 'lucide-react';

const promptSuggestions = [
  { text: 'Generate 10 MCQs on sorting algorithms', color: '#C5B3E6' },
  { text: 'Create essay questions about OOP', color: '#8BE9FD' },
  { text: 'Make coding problems for data structures', color: '#FFB86C' },
  { text: 'Build questions on time complexity', color: '#FF6AC1' },
  { text: 'Design scenario-based questions', color: '#50FA7B' },
];

interface AIPromptBoxProps {
  onGenerate?: (prompt: string) => void;
  onClose?: () => void;
}

export function AIPromptBox({ onGenerate, onClose }: AIPromptBoxProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const handleGenerate = () => {
    if (prompt.trim()) {
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        if (onGenerate) onGenerate(prompt);
      }, 3000);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    setShowSuggestions(false);
  };

  const charCount = prompt.length;
  const maxChars = 500;

  return (
    <div className="fixed inset-0 bg-[#0A2F2F]/80 backdrop-blur-sm z-50 flex items-end justify-center p-6">
      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
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
          className="fixed w-2 h-2 rounded-full"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 3) * 25}%`,
            backgroundColor: ['#C5B3E6', '#8BE9FD', '#FFB86C', '#FF6AC1', '#50FA7B', '#F1FA8C'][i % 6],
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-md relative"
      >
        {/* Main Container */}
        <div className="bg-gradient-to-br from-[#F5F1ED] to-[#E5DED6] rounded-[40px] p-6 border-4 border-[#E5DED6] relative overflow-hidden">
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
              className="absolute top-4 right-4 w-10 h-10 bg-[#0D2626] rounded-xl flex items-center justify-center z-20"
            >
              <X className="w-5 h-5 text-[#F5F1ED]" />
            </motion.button>
          )}

          {/* Header */}
          <div className="mb-6 relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-12 h-12 bg-gradient-to-br from-[#C5B3E6] to-[#9B86C5] rounded-2xl flex items-center justify-center relative"
              >
                <Sparkles className="w-6 h-6 text-[#0A1F1F]" />
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-[#C5B3E6] rounded-2xl"
                />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-[#0A1F1F]">AI Question Generator</h2>
                <p className="text-xs text-[#0A1F1F] opacity-60">Describe what you want to create</p>
              </div>
            </div>

            {/* AI Status Indicator */}
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D2626] rounded-xl w-fit"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 bg-[#50FA7B] rounded-full"
              />
              <span className="text-xs font-bold text-[#50FA7B]">AI Ready</span>
            </motion.div>
          </div>

          {/* Prompt Suggestions */}
          <AnimatePresence>
            {showSuggestions && !prompt && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden relative z-10"
              >
                <p className="text-[10px] font-bold text-[#0A1F1F] opacity-60 uppercase mb-3">Try these:</p>
                <div className="flex flex-wrap gap-2">
                  {promptSuggestions.slice(0, 3).map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold border-2 text-[#0A1F1F]"
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
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-4 relative z-10">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="py-3 rounded-2xl bg-gradient-to-br from-[#8BE9FD] to-[#6FEDD6] border-4 border-white/30 flex items-center justify-center gap-2"
            >
              <Mic className="w-4 h-4 text-[#0A1F1F]" />
              <span className="text-xs font-bold text-[#0A1F1F]">Voice</span>
            </motion.button>

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

          {/* Generate Button */}
          <motion.button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            whileHover={prompt.trim() && !isGenerating ? { scale: 1.02 } : {}}
            whileTap={prompt.trim() && !isGenerating ? { scale: 0.98 } : {}}
            className={`w-full py-5 rounded-[28px] font-bold text-lg flex items-center justify-center gap-3 border-4 relative overflow-hidden transition-all ${
              prompt.trim() && !isGenerating
                ? 'bg-gradient-to-br from-[#C5B3E6] via-[#9B86C5] to-[#C5B3E6] border-white/30 text-[#0A1F1F]'
                : 'bg-[#0D2626] border-[#0A1F1F] text-[#8B9E9E] cursor-not-allowed'
            }`}
          >
            {/* Animated shimmer for active state */}
            {prompt.trim() && !isGenerating && (
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

        {/* Floating sparkles around the box */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="absolute"
            style={{
              left: `${-5 + i * 20}%`,
              top: `${-10 + (i % 2) * 20}%`,
            }}
          >
            <Sparkles
              className="w-5 h-5"
              style={{
                color: ['#C5B3E6', '#8BE9FD', '#FFB86C', '#FF6AC1', '#50FA7B', '#F1FA8C'][i],
              }}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
