import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, FileText, Clock, Sliders } from 'lucide-react';
import { generationService } from '../services/api';
import { toast } from 'sonner';

const questionTypes = [
  { id: 'mcq', label: 'MCQ', icon: '📝', color: 'from-[#6366f1] to-[#818cf8]' },
  { id: 'short', label: 'Short', icon: '✍️', color: 'from-[#06b6d4] to-[#22d3ee]' },
  { id: 'essay', label: 'Essay', icon: '📄', color: 'from-[#10b981] to-[#34d399]' },
  { id: 'case', label: 'Case', icon: '🔍', color: 'from-[#f59e0b] to-[#fbbf24]' },
];

export function RubricEngine() {
  const [totalMarks, setTotalMarks] = useState(100);
  const [duration, setDuration] = useState(180);
  const [complexity, setComplexity] = useState(5);
  const [coverage, setCoverage] = useState(70);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['mcq', 'short']);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleQuestionType = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId) ? prev.filter(id => id !== typeId) : [...prev, typeId]
    );
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 3000);
  };

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Create Exam</h1>
        <p className="text-gray-400 text-sm">Configure your exam settings</p>
      </div>

      {/* Basic Config */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10 space-y-4">
        <h2 className="text-white font-bold text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#6366f1]" />
          Basic Settings
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Total Marks</label>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full bg-transparent border-none outline-none text-white text-lg font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-2 block">Duration (min)</label>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-transparent border-none outline-none text-white text-lg font-bold"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-2 block">Subject</label>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <select className="w-full bg-transparent border-none outline-none text-white text-sm font-medium">
              <option value="ds">Data Structures</option>
              <option value="os">Operating Systems</option>
              <option value="dbms">Database Management</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10 space-y-6">
        <h2 className="text-white font-bold text-sm flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#6366f1]" />
          Advanced Settings
        </h2>

        {/* Complexity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white font-medium text-sm">Complexity</p>
              <p className="text-xs text-gray-400">Question difficulty level</p>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#6366f1] to-[#06b6d4] bg-clip-text text-transparent">
              {complexity}
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="10"
            value={complexity}
            onChange={(e) => setComplexity(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #6366f1 0%, #06b6d4 ${complexity * 10}%, rgba(255,255,255,0.1) ${complexity * 10}%, rgba(255,255,255,0.1) 100%)`
            }}
          />
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-gray-500">Basic</span>
            <span className="text-[10px] text-gray-500">Advanced</span>
          </div>
        </div>

        {/* Coverage */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white font-medium text-sm">Coverage</p>
              <p className="text-xs text-gray-400">Syllabus percentage</p>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#10b981] to-[#34d399] bg-clip-text text-transparent">
              {coverage}%
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="100"
            step="10"
            value={coverage}
            onChange={(e) => setCoverage(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #34d399 ${coverage}%, rgba(255,255,255,0.1) ${coverage}%, rgba(255,255,255,0.1) 100%)`
            }}
          />
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-gray-500">10%</span>
            <span className="text-[10px] text-gray-500">100%</span>
          </div>
        </div>
      </div>

      {/* Question Types */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10">
        <h2 className="text-white font-bold text-sm mb-4">Question Types</h2>

        <div className="grid grid-cols-4 gap-2">
          {questionTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => toggleQuestionType(type.id)}
              className={`p-3 rounded-xl border-2 transition-all ${selectedTypes.includes(type.id)
                ? `border-[#6366f1] bg-gradient-to-br ${type.color}`
                : 'border-white/10 bg-white/5'
                }`}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <p className="text-[10px] font-bold text-white">{type.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={async () => {
          setIsGenerating(true);
          try {
            const level = complexity <= 3 ? 'Basic' : complexity <= 7 ? 'Intermediate' : 'Advanced';
            // Assuming generating 5 questions for now, using the selected subject
            const subject = document.querySelector('select')?.value || 'ds'; // getting value from select
            // We need a topic... RubricEngine doesn't seem to have topic selection? 
            // It might be a general exam. Let's assume a default topic or "General".

            await generationService.generateQuestions(subject, "General", level, 5);
            toast.success("Exam generated successfully!");
            // navigate('/exam'); // Need to check routes
          } catch (e) {
            toast.error("Generation failed");
            console.error(e);
          } finally {
            setIsGenerating(false);
          }
        }}
        disabled={isGenerating}
        className="w-full bg-gradient-to-r from-[#6366f1] to-[#06b6d4] rounded-2xl py-4 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-white font-bold">Generating...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white font-bold">Generate Exam</span>
          </>
        )}
      </button>

      {/* Progress */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#6366f1]/10 backdrop-blur-xl rounded-2xl p-4 border border-[#6366f1]/30"
        >
          <p className="text-white text-sm font-medium mb-2">Analyzing subject knowledge...</p>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3 }}
              className="h-full bg-gradient-to-r from-[#6366f1] to-[#06b6d4]"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
