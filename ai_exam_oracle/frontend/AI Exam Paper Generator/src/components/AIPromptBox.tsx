import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Loader2, Mic, Lightbulb, Zap, Pencil, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from './Modal';

const promptSuggestions = [
  { text: 'Generate 10 MCQs on sorting algorithms', color: 'bg-[#F2F0FF]' },
  { text: 'Create essay questions about OOP', color: 'bg-[#E0F2FE]' },
  { text: 'Make coding problems for data structures', color: 'bg-[#FFEDD5]' },
];

interface AIPromptBoxProps {
  isOpen: boolean;
  onGenerate?: (prompt: string) => void;
  onClose: () => void;
  initialPrompt?: string;
}

export function AIPromptBox({ isOpen, onGenerate, onClose, initialPrompt = '' }: AIPromptBoxProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      if (onGenerate) {
        await onGenerate(prompt);
      }
    } catch (error) {
      toast.error('AI Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const charCount = prompt.length;
  const maxChars = 500;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Generator"
      subtitle="Describe your vision"
    >
      <div className="space-y-6">
        {/* Status Badge */}
        <div className="flex items-center -mt-2">
          <div className="bg-[#0A1F1F]/5 text-[#0A1F1F] rounded-full px-4 py-1.5 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest border border-black/5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Neural Engine Active
          </div>
        </div>

        {/* Input Area */}
        <div className="relative group">
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-transparent focus-within:border-[#C5B3E6]/30 transition-all relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your questions... e.g., MCQs on Binary Trees"
              className="w-full bg-transparent text-sm font-bold text-[#0A1F1F] placeholder:text-[#8B9E9E] outline-none resize-none h-28 leading-relaxed"
            />

            <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-[#FF8FA3] to-[#FF4D6D] rounded-full flex items-center justify-center shadow-lg transform rotate-[-10deg]">
              <Pencil className="w-4 h-4 text-white" />
            </div>

            <div className="text-right text-[8px] font-bold text-[#8B9E9E] uppercase tracking-widest pt-2">
              {charCount} / {maxChars}
            </div>
          </div>
        </div>

        {/* Try These Suggestions */}
        <div className="space-y-2">
          <p className="text-[9px] font-bold text-[#8B9E9E] uppercase tracking-widest ml-1">Example Prompts</p>
          <div className="space-y-2">
            {promptSuggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => setPrompt(suggestion.text)}
                className={`w-full text-left px-5 py-3 rounded-2xl ${suggestion.color} text-[11px] font-bold text-[#0A1F1F] border border-black/5 hover:scale-[1.02] transition-transform`}
              >
                {suggestion.text}
              </button>
            ))}
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Mic, label: 'Voice', color: '#8BE9FD' },
            { icon: Lightbulb, label: 'Ideas', color: '#FFB86C' },
            { icon: Zap, label: 'Quick', color: '#FF6AC1' }
          ].map((item, i) => (
            <button key={i} className="flex flex-col items-center justify-center py-3 rounded-2xl bg-[#0A1F1F]/5 border border-transparent hover:border-black/5 transition-all">
              <item.icon className="w-4 h-4 mb-1" style={{ color: item.color }} />
              <span className="text-[8px] font-bold uppercase tracking-widest text-[#0A1F1F]">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Primary Action */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full bg-[#0A1F1F] rounded-[24px] py-5 flex items-center justify-center gap-3 text-white font-bold text-base shadow-xl disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5 opacity-70" strokeWidth={3} />
              <span>Generate Questions</span>
            </>
          )}
        </motion.button>
      </div>
    </Modal>
  );
}
