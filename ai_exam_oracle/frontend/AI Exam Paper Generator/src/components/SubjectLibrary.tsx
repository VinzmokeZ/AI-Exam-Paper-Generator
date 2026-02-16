import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Search, Plus, ChevronRight, FileStack, ArrowLeft, Sparkles, X, Palette, Check, Loader2 } from 'lucide-react';
import { subjectService, Subject } from '../services/api';
import { Modal } from './Modal';
import { toast } from 'sonner';
import { DEFAULT_SUBJECTS } from '../constants/defaultData';

const colorOptions = [
  { color: '#C5B3E6', gradient: 'from-[#C5B3E6] to-[#9B86C5]', name: 'Purple' },
  { color: '#8BE9FD', gradient: 'from-[#8BE9FD] to-[#6FEDD6]', name: 'Cyan' },
  { color: '#FFB86C', gradient: 'from-[#FFB86C] to-[#FF6AC1]', name: 'Orange' },
  { color: '#50FA7B', gradient: 'from-[#50FA7B] to-[#6FEDD6]', name: 'Green' },
  { color: '#FF6AC1', gradient: 'from-[#FF6AC1] to-[#C5B3E6]', name: 'Pink' },
  { color: '#F1FA8C', gradient: 'from-[#F1FA8C] to-[#50FA7B]', name: 'Yellow' },
];

export function SubjectLibrary() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newIntroduction, setNewIntroduction] = useState('');
  const [selectedColor, setSelectedColor] = useState('#C5B3E6');
  const [selectedGradient, setSelectedGradient] = useState('from-[#C5B3E6] to-[#9B86C5]');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      const data = await subjectService.getAll();
      const backendCodes = new Set(data.map(s => s.code.toUpperCase()));
      const uniqueDefaults = DEFAULT_SUBJECTS.filter(d => !backendCodes.has(d.code.toUpperCase()));
      const combined = [...uniqueDefaults, ...data];
      setSubjects(combined);
    } catch (error) {
      console.error("Failed to load subjects:", error);
      setSubjects(DEFAULT_SUBJECTS);
      toast.error("Using offline default subjects");
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

  const resetForm = () => {
    setNewSubjectName('');
    setNewSubjectCode('');
    setNewIntroduction('');
    setSelectedColor('#C5B3E6');
    setSelectedGradient('from-[#C5B3E6] to-[#9B86C5]');
  };

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <p className="text-[10px] font-bold text-[#899E9E] uppercase tracking-widest">{subjects.length} subjects indexed</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowCreateModal(true)}
              className="w-10 h-10 bg-[#C5B3E6] rounded-xl flex items-center justify-center glow-purple"
            >
              <Plus className="w-5 h-5 text-[#0A1F1F]" strokeWidth={3} />
            </motion.button>
          </div>

          <div className="bg-[#0A1F1F] rounded-2xl px-4 py-3 flex items-center gap-3 border-2 border-white/5">
            <Search className="w-5 h-5 text-[#8B9E9E]" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[#F5F1ED] placeholder:text-[#8B9E9E] text-sm font-medium"
            />
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
            <p className="text-[#8B9E9E] font-bold uppercase tracking-widest text-xs">Loading Knowledge Base...</p>
          </div>
        ) : (
          filteredSubjects.map((subject, index) => (
            <Link key={subject.id} to={`/subjects/${subject.id}`}>
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

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-[#0A1F1F]">{subject.questions || 0}</span>
                      <span className="text-[10px] text-[#0A1F1F] opacity-40 font-bold uppercase">QA</span>
                    </div>
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <ChevronRight className="w-5 h-5 text-[#0A1F1F]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
