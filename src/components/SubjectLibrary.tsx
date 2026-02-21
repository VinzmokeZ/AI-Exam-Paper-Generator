import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Search, Plus, ChevronRight, FileStack, ArrowLeft, Sparkles, X, Palette, Check, Loader2, Trash2, Filter } from 'lucide-react';
import { subjectService, Subject, api, connectionLogs, generationService } from '../services/api';
import { Modal } from './Modal';
import { toast } from 'sonner';
import { DEFAULT_SUBJECTS } from '../constants/defaultData';
import { useNavigate } from 'react-router-dom';

const colorOptions = [
  { color: '#C5B3E6', gradient: 'from-[#C5B3E6] to-[#9B86C5]', name: 'Purple' },
  { color: '#8BE9FD', gradient: 'from-[#8BE9FD] to-[#6FEDD6]', name: 'Cyan' },
  { color: '#FFB86C', gradient: 'from-[#FFB86C] to-[#FF6AC1]', name: 'Orange' },
  { color: '#50FA7B', gradient: 'from-[#50FA7B] to-[#6FEDD6]', name: 'Green' },
  { color: '#FF6AC1', gradient: 'from-[#FF6AC1] to-[#C5B3E6]', name: 'Pink' },
  { color: '#F1FA8C', gradient: 'from-[#F1FA8C] to-[#50FA7B]', name: 'Yellow' },
];

export function SubjectLibrary() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDebug, setShowDebug] = useState(false);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newIntroduction, setNewIntroduction] = useState('');
  const [selectedColor, setSelectedColor] = useState('#C5B3E6');
  const [selectedGradient, setSelectedGradient] = useState('from-[#C5B3E6] to-[#9B86C5]');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortOption, setSortOption] = useState<'name' | 'code' | 'questions' | 'newest'>('name');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Generation Modal State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedSubjectForGen, setSelectedSubjectForGen] = useState<Subject | null>(null);
  const [genFile, setGenFile] = useState<File | null>(null);
  const [genCount, setGenCount] = useState(5);
  const [genComplexity, setGenComplexity] = useState('Balanced');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadSubjects();
    checkConnection();
  }, []);

  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [activeModel, setActiveModel] = useState<string | null>(null);

  const checkConnection = async () => {
    try {
      // 1. Run Smart Discovery (for APK/Mobile)
      const { discoverConnectivity } = await import('../services/api');
      await discoverConnectivity();

      // 2. Verified Health Check
      const response = await api.get('/health');
      setIsBackendOnline(true);

      if (response.data.ollama === 'online' && response.data.models?.length > 0) {
        setActiveModel(response.data.models[0]);
      }
    } catch {
      setIsBackendOnline(false);
    }
  };

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      // The service now handles hybrid local/cloud logic and DEFAULT_SUBJECTS merging
      const data = await subjectService.getAll();
      setSubjects(data);
    } catch (error) {
      console.error("Failed to load subjects:", error);
      toast.error("Error loading subjects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim() || !newSubjectCode.trim()) {
      toast.error("Name and Code are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const newSubject = await subjectService.create({
        name: newSubjectName,
        code: newSubjectCode,
        introduction: newIntroduction || `Introduction to ${newSubjectName}`,
        color: selectedColor,
        gradient: selectedGradient
      });

      setSubjects([...subjects, { ...newSubject, chapters: 0, questions: 0 }]);
      toast.success("Subject created successfully!");
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create subject:", error);
      toast.error("Failed to create subject");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveToDB = async (subject: any) => {
    setIsSubmitting(true);
    try {
      const { id, chapters, questions, ...payload } = subject;
      await subjectService.create(payload);
      toast.success(`${subject.name} saved to database!`);
      loadSubjects();
    } catch (error) {
      toast.error("Failed to save subject to database");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = async (id: number | string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await subjectService.delete(id);
      toast.success("Subject deleted");
      loadSubjects();
    } catch (error) {
      toast.error("Delete failed. Default subjects cannot be deleted until saved to database.");
    }
  };

  const handleSmartGenerateSubmit = async () => {
    if (!genFile || !selectedSubjectForGen) {
      toast.error("Please upload a file first!");
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading("Analyzing content and generating questions...");

    try {
      const engine = localStorage.getItem('ai_engine_mode') || 'cloud';
      const results = await generationService.uploadGenerationFile(
        genFile,
        genCount,
        genComplexity,
        engine,
        selectedSubjectForGen.id.toString()
      );

      toast.success(`Successfully generated ${results.length || 0} questions!`, { id: toastId });
      setShowGenerateModal(false);
      setGenFile(null);

      // Navigate to Vetting Center to review
      navigate('/vetting');
    } catch (error: any) {
      console.error("Generation failed:", error);
      toast.error(error.response?.data?.error || "AI Generation failed. Check your connection.", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setNewSubjectName('');
    setNewSubjectCode('');
    setNewIntroduction('');
    setSelectedColor('#C5B3E6');
    setSelectedGradient('from-[#C5B3E6] to-[#9B86C5]');
  };

  const filteredSubjects = subjects
    .filter(
      (subject) =>
        subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.code.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'name': return a.name.localeCompare(b.name);
        case 'code': return a.code.localeCompare(b.code);
        case 'questions': return (b.questions || 0) - (a.questions || 0);
        case 'newest': return (b.id && a.id && typeof b.id === 'number' && typeof a.id === 'number') ? b.id - a.id : 0;
        default: return 0;
      }
    });

  return (
    <div className="min-h-full pb-32">
      {/* Create Subject Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="New Subject"
        subtitle="Add a new course"
      >
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-[28px] border-2 border-[#E5DED6]">
            <label className="text-[10px] font-bold text-[#8B9E9E] uppercase mb-3 block tracking-widest leading-none">Subject Name</label>
            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              className="w-full bg-[#F5F1ED] rounded-xl px-5 py-3.5 text-[#0A1F1F] font-bold border-2 border-transparent focus:border-[#C5B3E6]/30 outline-none transition-all text-base"
              placeholder="e.g. Computer Science"
            />
          </div>

          <div className="bg-white p-5 rounded-[28px] border-2 border-[#E5DED6]">
            <label className="text-[10px] font-bold text-[#8B9E9E] uppercase mb-3 block tracking-widest leading-none">Subject Code</label>
            <input
              type="text"
              value={newSubjectCode}
              onChange={(e) => setNewSubjectCode(e.target.value)}
              className="w-full bg-[#F5F1ED] rounded-xl px-5 py-3.5 text-[#0A1F1F] font-bold border-2 border-transparent focus:border-[#C5B3E6]/30 outline-none transition-all text-base"
              placeholder="e.g. CS101"
            />
          </div>

          <div className="bg-white p-5 rounded-[28px] border-2 border-[#E5DED6]">
            <label className="text-[10px] font-bold text-[#8B9E9E] uppercase mb-3 block tracking-widest leading-none">Choose Color</label>
            <div className="grid grid-cols-6 gap-2 pt-1">
              {colorOptions.map((option) => (
                <button
                  key={option.color}
                  onClick={() => {
                    setSelectedColor(option.color);
                    setSelectedGradient(option.gradient);
                  }}
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${option.gradient} border-2 transition-all flex items-center justify-center ${selectedColor === option.color ? 'border-[#0A1F1F] scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'}`}
                >
                  {selectedColor === option.color && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreateSubject}
            disabled={isSubmitting}
            className="w-full bg-[#0A1F1F] text-white rounded-[28px] py-5 font-bold uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" strokeWidth={3} />
                <span>Create Subject</span>
              </>
            )}
          </button>
        </div>
      </Modal>

      {/* Floating background elements */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-[#C5B3E6]/10 rounded-full blur-3xl float-slow pointer-events-none" />
      <div className="fixed bottom-40 right-10 w-40 h-40 bg-[#6FEDD6]/10 rounded-full blur-3xl float-slow float-delay-1 pointer-events-none" />

      {/* Header */}
      <div className="mx-6 mt-4 mb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#0D2626] to-[#0A1F1F] rounded-[32px] p-6 border-4 border-[#0A1F1F] relative overflow-hidden shadow-2xl"
        >
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
              <h1 className="text-xl font-bold text-[#F5F1ED]">Subject Library</h1>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold text-[#8B9E9E] uppercase tracking-widest">{subjects.length} subjects indexed</p>
                <div className={`w-1.5 h-1.5 rounded-full ${isBackendOnline ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-white/20'}`} />
                <span className="text-[8px] font-bold text-white/40 uppercase tracking-tighter">
                  {isBackendOnline ? (activeModel || 'AI Parallel Active') : 'AI Parallel Dormant'}
                </span>
                <button
                  onClick={() => setShowDebug(!showDebug)}
                  className="ml-2 px-2 py-0.5 rounded-full bg-white/5 text-[7px] text-white/30 hover:bg-white/10 border border-white/5 transition-colors"
                >
                  ENGINE STATUS
                </button>
              </div>
            </div>

            {/* Debug Console Overlay */}
            {showDebug && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-black/80 rounded-xl border border-white/10 font-mono text-[10px] text-green-400 overflow-hidden"
              >
                <div className="flex justify-between items-center mb-2 text-white/40 uppercase tracking-widest text-[8px]">
                  <span>Discovery Logs</span>
                  <button onClick={() => checkConnection()} className="text-blue-400">Retry</button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {connectionLogs.map((log: string, i: number) => (
                    <div key={i} className={log.includes('✅') ? 'text-green-400' : log.includes('❌') ? 'text-red-400' : ''}>
                      {log}
                    </div>
                  ))}
                  {connectionLogs.length === 0 && (
                    <div className="text-white/20 italic">No logs yet. Press DEBUG or Retry.</div>
                  )}
                </div>
              </motion.div>
            )}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowCreateModal(true)}
              className="w-10 h-10 bg-[#C5B3E6] rounded-xl flex items-center justify-center glow-purple"
            >
              <Plus className="w-5 h-5 text-[#0A1F1F]" strokeWidth={3} />
            </motion.button>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <div className="flex-1 bg-[#0A1F1F] rounded-2xl px-4 py-3 flex items-center gap-3 border-2 border-white/5 relative">
              <Search className="w-5 h-5 text-[#8B9E9E]" />
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[#F5F1ED] placeholder:text-[#8B9E9E] text-sm font-medium"
              />
            </div>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSortMenu(!showSortMenu)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${showSortMenu ? 'bg-[#C5B3E6] border-[#C5B3E6] text-[#0A1F1F]' : 'bg-[#0A1F1F] border-white/10 text-[#8B9E9E]'}`}
              >
                <Filter className="w-5 h-5" />
              </motion.button>

              <AnimatePresence>
                {showSortMenu && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowSortMenu(false)}
                      className="fixed inset-0 z-40"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-[#0D2626] border-2 border-[#0A1F1F] rounded-2xl p-2 z-50 shadow-2xl"
                    >
                      <div className="px-3 py-2 text-[8px] font-black text-[#8B9E9E] uppercase tracking-widest border-b border-white/5 mb-1">Sort By</div>
                      {[
                        { id: 'name', label: 'Alphabetical (A-Z)', icon: Palette },
                        { id: 'code', label: 'Subject Code', icon: FileStack },
                        { id: 'questions', label: 'Question Count', icon: Sparkles },
                        { id: 'newest', label: 'Recently Added', icon: Plus },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setSortOption(opt.id as any);
                            setShowSortMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${sortOption === opt.id ? 'bg-[#C5B3E6] text-[#0A1F1F]' : 'text-[#F5F1ED] hover:bg-white/5'}`}
                        >
                          <opt.icon className="w-4 h-4" />
                          <span className="text-xs font-bold">{opt.label}</span>
                          {sortOption === opt.id && <Check className="w-3 h-3 ml-auto" strokeWidth={4} />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Overview */}
      <div className="mx-6 mb-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#F5F1ED] to-[#E5DED6] rounded-[32px] p-6 border-4 border-[#E5DED6] shadow-lg"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-black text-[#0A1F1F] mb-1">{subjects.length}</div>
              <div className="text-[9px] text-[#0A1F1F] opacity-40 uppercase font-bold tracking-widest">Active</div>
            </div>
            <div>
              <div className="text-3xl font-black text-[#0A1F1F] mb-1">
                {subjects.reduce((sum, s) => sum + (s.chapters || 0), 0)}
              </div>
              <div className="text-[9px] text-[#0A1F1F] opacity-40 uppercase font-bold tracking-widest">Chapters</div>
            </div>
            <div>
              <div className="text-3xl font-black text-[#0A1F1F] mb-1">
                {subjects.reduce((sum, s) => sum + (s.questions || 0), 0)}
              </div>
              <div className="text-[9px] text-[#0A1F1F] opacity-40 uppercase font-bold tracking-widest">Questions</div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-6 pb-6 space-y-4 relative z-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-[#C5B3E6] animate-spin mb-4" />
            <p className="text-[#8B9E9E] font-bold uppercase tracking-widest text-xs">Syncing Knowledge Base...</p>
          </div>
        ) : (
          filteredSubjects.map((subject, index) => (
            <motion.div key={subject.id} layout>
              <Link to={`/subjects/${subject.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`bg-gradient-to-br ${subject.gradient} rounded-[32px] p-6 border-4 border-white/20 relative overflow-hidden shadow-xl`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[128px] pointer-events-none" />

                  <div className="flex items-center gap-5 relative z-10">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center border-4 border-white/40 flex-shrink-0 bg-white/10 backdrop-blur-md shadow-inner">
                      <span className="text-xl font-bold text-[#0A1F1F]">{subject.code.slice(0, 2).toUpperCase()}</span>
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-[#0A1F1F] font-bold text-lg mb-1 leading-tight truncate">
                        {subject.name}
                      </h3>
                      <p className="text-[10px] text-[#0A1F1F] opacity-60 font-bold uppercase tracking-widest">
                        {subject.code} • {subject.chapters || 0} Chapters
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-[#0A1F1F]">{subject.questions || 0}</span>
                          <span className="text-[10px] text-[#0A1F1F] opacity-40 font-bold uppercase">QA</span>
                        </div>
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <ChevronRight className="w-5 h-5 text-[#0A1F1F]" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 border-l border-white/10 pl-2 ml-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedSubjectForGen(subject);
                            setShowGenerateModal(true);
                          }}
                          className="w-8 h-8 bg-[#C5B3E6] rounded-lg flex items-center justify-center text-[#0A1F1F] border border-[#C5B3E6]/20"
                          title="Smart AI Generate"
                        >
                          <Sparkles className="w-4 h-4" />
                        </motion.button>

                        {(typeof subject.id === 'number' && subject.id > 100) ? (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSaveToDB(subject); }}
                            className="w-8 h-8 bg-[#0A1F1F]/20 rounded-lg flex items-center justify-center text-[#0A1F1F] border border-white/20"
                            title="Save to database to edit/delete"
                          >
                            <Plus className="w-4 h-4" />
                          </motion.button>
                        ) : (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/subjects/${subject.id}`); }}
                              className="w-8 h-8 bg-[#0A1F1F]/20 rounded-lg flex items-center justify-center text-[#0A1F1F] border border-white/20"
                            >
                              <Palette className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteSubject(subject.id, subject.name); }}
                              className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center text-red-600 border border-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
      {/* Smart AI Generation Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => !isGenerating && setShowGenerateModal(false)}
        title="Smart AI Generate"
        subtitle={`Analyzing ${selectedSubjectForGen?.name}`}
      >
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-[28px] border-2 border-[#E5DED6] relative overflow-hidden group">
            <label className="text-[10px] font-bold text-[#8B9E9E] uppercase mb-3 block tracking-widest leading-none">Upload Source Material (PDF/Docx)</label>
            <input
              type="file"
              onChange={(e) => setGenFile(e.target.files?.[0] || null)}
              accept=".pdf,.docx,.txt"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              disabled={isGenerating}
            />
            <div className="flex items-center gap-3 p-4 bg-[#F5F1ED] rounded-xl border-2 border-dashed border-[#E5DED6] group-hover:border-[#C5B3E6] transition-colors">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                {genFile ? <Check className="w-5 h-5 text-green-500" /> : <Plus className="w-5 h-5 text-[#8B9E9E]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#0A1F1F] truncate">
                  {genFile ? genFile.name : "Tap to select file"}
                </p>
                <p className="text-[10px] text-[#8B9E9E] font-bold uppercase tracking-tighter">
                  {genFile ? `${(genFile.size / 1024 / 1024).toFixed(2)} MB • Ready` : "PDF, DOCX, or Text up to 50MB"}
                </p>
              </div>
              {genFile && (
                <button
                  onClick={(e) => { e.stopPropagation(); setGenFile(null); }}
                  className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-[28px] border-2 border-[#E5DED6]">
              <label className="text-[9px] font-bold text-[#8B9E9E] uppercase mb-2 block tracking-widest leading-none text-center">Questions</label>
              <div className="flex items-center justify-between pointer-events-auto">
                <button onClick={() => setGenCount(Math.max(1, genCount - 1))} className="w-8 h-8 rounded-lg bg-[#F5F1ED] text-[#0A1F1F] font-black">-</button>
                <span className="text-xl font-black text-[#0A1F1F]">{genCount}</span>
                <button onClick={() => setGenCount(Math.min(20, genCount + 1))} className="w-8 h-8 rounded-lg bg-[#F5F1ED] text-[#0A1F1F] font-black">+</button>
              </div>
            </div>
            <div className="bg-white p-4 rounded-[28px] border-2 border-[#E5DED6]">
              <label className="text-[9px] font-bold text-[#8B9E9E] uppercase mb-2 block tracking-widest leading-none text-center">Complexity</label>
              <select
                value={genComplexity}
                onChange={(e) => setGenComplexity(e.target.value)}
                className="w-full bg-[#F5F1ED] rounded-lg px-2 py-1.5 text-xs font-bold text-[#0A1F1F] outline-none border-none"
              >
                <option>Balanced</option>
                <option>Recall</option>
                <option>Analyze</option>
                <option>Evaluate</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSmartGenerateSubmit}
            disabled={isGenerating || !genFile}
            className="w-full bg-[#0A1F1F] text-white rounded-[28px] py-5 font-bold uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-2 overflow-hidden relative"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>AI Processing...</span>
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-[#C5B3E6]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 30 }}
                />
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#C5B3E6]" strokeWidth={3} />
                <span>Begin Brainstorming</span>
              </>
            )}
          </button>

          <p className="text-[9px] text-center text-[#8B9E9E] font-bold uppercase tracking-tight opacity-60">
            Powered by Cloud AI • Context Window: 128k Tokens
          </p>
        </div>
      </Modal>
    </div>
  );
}
