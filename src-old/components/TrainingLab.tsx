import { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Zap, Brain, FileText, Download, Sparkles } from 'lucide-react';
import { trainingService } from '../services/api';
import { toast } from 'sonner';

const courseOutcomes = [
  { id: 'co1', label: 'Knowledge', color: 'from-[#6366f1] to-[#818cf8]' },
  { id: 'co2', label: 'Analyze', color: 'from-[#06b6d4] to-[#22d3ee]' },
  { id: 'co3', label: 'Apply', color: 'from-[#10b981] to-[#34d399]' },
  { id: 'co4', label: 'Evaluate', color: 'from-[#f59e0b] to-[#fbbf24]' },
  { id: 'co5', label: 'Create', color: 'from-[#8b5cf6] to-[#a78bfa]' },
];

const templates = [
  { type: 'MCQ', icon: '📝' },
  { type: 'Essay', icon: '📄' },
  { type: 'Short', icon: '✍️' },
];

export function TrainingLab() {
  const [trainingMode, setTrainingMode] = useState<'incremental' | 'deep'>('incremental');
  const [selectedCOs, setSelectedCOs] = useState<string[]>(['co1']);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleCO = (coId: string) => {
    setSelectedCOs(prev =>
      prev.includes(coId) ? prev.filter(id => id !== coId) : [...prev, coId]
    );
  };

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Training Lab</h1>
        <p className="text-gray-400 text-sm">Configure AI training data</p>
      </div>

      {/* Training Mode */}
      <div className="space-y-3">
        <button
          onClick={() => setTrainingMode('incremental')}
          className={`w-full p-4 rounded-2xl border-2 transition-all ${trainingMode === 'incremental'
            ? 'border-[#6366f1] bg-gradient-to-br from-[#6366f1]/20 to-[#818cf8]/20'
            : 'border-white/10 bg-white/5'
            }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#818cf8] flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-white font-bold text-sm mb-1">Instant Learning</h3>
              <p className="text-xs text-gray-400">Add files without retraining entire model</p>
              <div className="mt-2 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full" />
                <span className="text-[10px] text-[#10b981]">Fast • Efficient</span>
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setTrainingMode('deep')}
          className={`w-full p-4 rounded-2xl border-2 transition-all ${trainingMode === 'deep'
            ? 'border-[#06b6d4] bg-gradient-to-br from-[#06b6d4]/20 to-[#22d3ee]/20'
            : 'border-white/10 bg-white/5'
            }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#22d3ee] flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-white font-bold text-sm mb-1">Deep Training</h3>
              <p className="text-xs text-gray-400">Upload entire folders with full context</p>
              <div className="mt-2 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full" />
                <span className="text-[10px] text-[#f59e0b]">Comprehensive</span>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* OBE Mapping */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10">
        <h2 className="text-white font-bold text-sm mb-1">OBE Mapping</h2>
        <p className="text-xs text-gray-400 mb-4">Select Course Outcomes</p>

        <div className="grid grid-cols-5 gap-2">
          {courseOutcomes.map((co) => (
            <button
              key={co.id}
              onClick={() => toggleCO(co.id)}
              className={`p-3 rounded-xl border-2 transition-all ${selectedCOs.includes(co.id)
                ? `border-[#6366f1] bg-gradient-to-br ${co.color}`
                : 'border-white/10 bg-white/5'
                }`}
            >
              <p className="text-[10px] font-bold text-white mb-1">{co.id.toUpperCase()}</p>
              <p className="text-[9px] text-gray-300">{co.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Upload */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10">
        <h2 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#6366f1]" />
          Upload Files
        </h2>

        <div
          className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.docx,.txt"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              setIsProcessing(true);
              try {
                // Default subject ID 1 for now, or match selectedCOs logic if applicable
                await trainingService.uploadDocument(file, 1);
                toast.success(`Successfully uploaded ${file.name}`);
              } catch (error) {
                toast.error("Upload failed");
                console.error(error);
              } finally {
                setIsProcessing(false);
              }
            }}
          />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1]/20 to-[#06b6d4]/20 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-8 h-8 text-[#6366f1]" />
          </div>
          <p className="text-white font-medium text-sm mb-1">Drag & Drop Files</p>
          <p className="text-xs text-gray-400 mb-3">or tap to browse</p>
          <button className="px-6 py-2 bg-gradient-to-r from-[#6366f1] to-[#06b6d4] rounded-xl text-white text-sm font-bold active:scale-95 transition-transform">
            Browse
          </button>
        </div>

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-5 h-5 text-[#6366f1]" />
              </motion.div>
              <div className="flex-1">
                <p className="text-sm text-white font-medium mb-2">Processing...</p>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3 }}
                    className="h-full bg-gradient-to-r from-[#6366f1] to-[#06b6d4]"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Templates */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10">
        <h2 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
          <Download className="w-4 h-4 text-[#10b981]" />
          Templates
        </h2>

        <div className="space-y-2">
          {templates.map((template) => (
            <div
              key={template.type}
              className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{template.icon}</span>
                <span className="text-white font-medium text-sm">{template.type}</span>
              </div>
              <button className="px-4 py-1.5 bg-[#10b981]/10 text-[#10b981] rounded-lg text-xs font-medium active:scale-95 transition-transform">
                Download
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={() => setIsProcessing(!isProcessing)}
        className="w-full bg-gradient-to-r from-[#6366f1] to-[#06b6d4] rounded-2xl py-4 flex items-center justify-center gap-2 active:scale-95 transition-transform"
      >
        <Sparkles className="w-5 h-5 text-white" />
        <span className="text-white font-bold">Start Training</span>
      </button>
    </div>
  );
}
