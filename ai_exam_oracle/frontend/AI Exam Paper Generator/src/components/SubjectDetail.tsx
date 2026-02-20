import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Upload, FileText, BookOpen, ChevronDown, Plus, Sparkles, Trash2, AlertCircle, Loader2, X } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { subjectService, topicService, trainingService } from '../services/api';
import { Modal } from './Modal';
import { DEFAULT_SUBJECTS } from '../constants/defaultData';

interface Topic {
  id: string;
  name: string;
  questionCount: number;
  hasSyllabus: boolean;
}

const defaultSubjectsData: { [key: string]: any } = {
  'cs301': {
    code: 'CS101',
    name: 'Computer Science',
    color: '#C5B3E6',
    gradient: 'from-[#C5B3E6] to-[#9B86C5]',
    introduction: 'Introduction to Computer Science',
    totalQuestions: 228,
    syllabusCoverage: 100,
    topics: [
      { id: '1', name: 'Data Structures', questionCount: 21, hasSyllabus: true },
      { id: '2', name: 'Algorithms', questionCount: 11, hasSyllabus: true },
      { id: '3', name: 'Operating Systems', questionCount: 34, hasSyllabus: true },
      { id: '4', name: 'Computer Architecture', questionCount: 40, hasSyllabus: true },
      { id: '5', name: 'Database Management Systems', questionCount: 39, hasSyllabus: true },
      { id: '6', name: 'Software Engineering', questionCount: 27, hasSyllabus: true },
      { id: '7', name: 'Artificial Intelligence', questionCount: 26, hasSyllabus: true },
      { id: '8', name: 'Cyber Security', questionCount: 30, hasSyllabus: true },
    ]
  },
  'math101': {
    code: 'MA101',
    name: 'Mathematics',
    color: '#8BE9FD',
    gradient: 'from-[#8BE9FD] to-[#6FEDD6]',
    introduction: 'Introduction to Mathematics',
    totalQuestions: 194,
    syllabusCoverage: 100,
    topics: [
      { id: '1', name: 'Calculus', questionCount: 14, hasSyllabus: true },
      { id: '2', name: 'Linear Algebra', questionCount: 45, hasSyllabus: true },
      { id: '3', name: 'Probability', questionCount: 40, hasSyllabus: true },
      { id: '4', name: 'Statistics', questionCount: 42, hasSyllabus: true },
      { id: '5', name: 'Discrete Mathematics', questionCount: 18, hasSyllabus: true },
      { id: '6', name: 'Differential Equations', questionCount: 35, hasSyllabus: true },
    ]
  },
  'phys202': {
    code: 'PH101',
    name: 'Physics',
    color: '#FFB86C',
    gradient: 'from-[#FFB86C] to-[#FF6AC1]',
    introduction: 'Introduction to Physics',
    totalQuestions: 209,
    syllabusCoverage: 100,
    topics: [
      { id: '1', name: 'Mechanics', questionCount: 26, hasSyllabus: true },
      { id: '2', name: 'Thermodynamics', questionCount: 38, hasSyllabus: true },
      { id: '3', name: 'Electromagnetism', questionCount: 10, hasSyllabus: true },
      { id: '4', name: 'Optics', questionCount: 48, hasSyllabus: true },
      { id: '5', name: 'Quantum Physics', questionCount: 38, hasSyllabus: true },
      { id: '6', name: 'Nuclear Physics', questionCount: 49, hasSyllabus: true },
    ]
  },
  'chem201': {
    code: 'CH101',
    name: 'Chemistry',
    color: '#50FA7B',
    gradient: 'from-[#50FA7B] to-[#6FEDD6]',
    introduction: 'Introduction to Chemistry',
    totalQuestions: 100,
    syllabusCoverage: 100,
    topics: [
      { id: '1', name: 'Organic Chemistry', questionCount: 15, hasSyllabus: true },
      { id: '2', name: 'Inorganic Chemistry', questionCount: 40, hasSyllabus: true },
      { id: '3', name: 'Physical Chemistry', questionCount: 11, hasSyllabus: true },
      { id: '4', name: 'Analytical Chemistry', questionCount: 16, hasSyllabus: true },
      { id: '5', name: 'Biochemistry', questionCount: 18, hasSyllabus: true },
    ]
  },
  'eng101': {
    code: 'EN101',
    name: 'English',
    color: '#FF6AC1',
    gradient: 'from-[#FF6AC1] to-[#C5B3E6]',
    introduction: 'Introduction to English',
    totalQuestions: 164,
    syllabusCoverage: 100,
    topics: [
      { id: '1', name: 'Grammar', questionCount: 40, hasSyllabus: true },
      { id: '2', name: 'Literature', questionCount: 10, hasSyllabus: true },
      { id: '3', name: 'Communication Skills', questionCount: 49, hasSyllabus: true },
      { id: '4', name: 'Writing Skills', questionCount: 19, hasSyllabus: true },
      { id: '5', name: 'Poetry', questionCount: 10, hasSyllabus: true },
      { id: '6', name: 'Drama', questionCount: 36, hasSyllabus: true },
    ]
  },
  'bio301': {
    code: 'BIO101',
    name: 'Biology',
    color: '#F1FA8C',
    gradient: 'from-[#F1FA8C] to-[#50FA7B]',
    introduction: 'Introduction to Biology',
    totalQuestions: 187,
    syllabusCoverage: 100,
    topics: [
      { id: '1', name: 'Cell Biology', questionCount: 32, hasSyllabus: true },
      { id: '2', name: 'Genetics', questionCount: 28, hasSyllabus: true },
      { id: '3', name: 'Ecology', questionCount: 25, hasSyllabus: true },
      { id: '4', name: 'Evolution', questionCount: 22, hasSyllabus: true },
      { id: '5', name: 'Human Anatomy', questionCount: 45, hasSyllabus: true },
      { id: '6', name: 'Microbiology', questionCount: 35, hasSyllabus: true },
    ]
  }
};

const colorOptions = [
  { color: '#C5B3E6', gradient: 'from-[#C5B3E6] to-[#9B86C5]', name: 'Purple' },
  { color: '#8BE9FD', gradient: 'from-[#8BE9FD] to-[#6FEDD6]', name: 'Cyan' },
  { color: '#FFB86C', gradient: 'from-[#FFB86C] to-[#FF6AC1]', name: 'Orange' },
  { color: '#50FA7B', gradient: 'from-[#50FA7B] to-[#6FEDD6]', name: 'Green' },
  { color: '#FF6AC1', gradient: 'from-[#FF6AC1] to-[#C5B3E6]', name: 'Pink' },
  { color: '#F1FA8C', gradient: 'from-[#F1FA8C] to-[#50FA7B]', name: 'Yellow' },
];

export function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectColor, setSubjectColor] = useState('#C5B3E6');
  const [subjectGradient, setSubjectGradient] = useState('from-[#C5B3E6] to-[#9B86C5]');
  const [introduction, setIntroduction] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [topics, setTopics] = useState<Topic[]>([]);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [showAddTopicForm, setShowAddTopicForm] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  const [showEditSubjectModal, setShowEditSubjectModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [editTopicName, setEditTopicName] = useState('');
  const [deleteTopicId, setDeleteTopicId] = useState<string | null>(null);

  const [showTextbookModal, setShowTextbookModal] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexProgress, setIndexProgress] = useState(0);
  const [textbooks, setTextbooks] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadSubjectData();
    }
  }, [id]);

  useEffect(() => {
    if (subjectCode) {
      loadTextbooks();
    }
  }, [subjectCode]);

  const loadTextbooks = async () => {
    if (!subjectCode) return;
    try {
      const files = await trainingService.listFiles(subjectCode);
      setTextbooks(files);
    } catch (error) {
      console.error("Failed to load textbooks:", error);
    }
  };

  const getTopicsKey = (subjectId: string) => `ai_exam_topics_${subjectId}`;

  const loadSubjectData = async () => {
    if (!id) return;
    setIsLoading(true);

    try {
      let subject: any = null;
      const defaultSubject = defaultSubjectsData[id];

      try {
        subject = await subjectService.getById(id);
      } catch (backendError) {
        subject = defaultSubject || DEFAULT_SUBJECTS.find(s => s.id.toString() === id.toString() || s.code === id);
      }

      if (subject) {
        setSubjectName(subject.name);
        setSubjectCode(subject.code);
        setSubjectColor(subject.color);
        setSubjectGradient(subject.gradient);
        setIntroduction(subject.introduction || `Study materials and topics for ${subject.name}`);
        setTotalQuestions(subject.totalQuestions || subject.questions || 0);

        // Load topics from localStorage or fallback to defaults
        const savedTopics = localStorage.getItem(getTopicsKey(id));
        if (savedTopics) {
          setTopics(JSON.parse(savedTopics));
        } else if (subject.topics) {
          setTopics(subject.topics);
          localStorage.setItem(getTopicsKey(id), JSON.stringify(subject.topics));
        } else {
          setTopics([]);
        }
      } else {
        toast.error("Subject not found");
        navigate('/subjects');
      }
    } catch (error) {
      console.error("Failed to load subject data:", error);
      toast.error("Failed to load subject details");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopic(expandedTopic === topicId ? null : topicId);
  };

  const saveTopicsLocal = (updatedTopics: Topic[]) => {
    setTopics(updatedTopics);
    if (id) localStorage.setItem(getTopicsKey(id), JSON.stringify(updatedTopics));
  };

  const handleAddTopic = async () => {
    if (newTopicName.trim() && id) {
      const newTopic: Topic = {
        id: `${Date.now()}`,
        name: newTopicName,
        questionCount: 0,
        hasSyllabus: false
      };
      saveTopicsLocal([...topics, newTopic]);
      setNewTopicName('');
      setShowAddTopicForm(false);
      toast.success("Topic added");

      // Optional: sync to backend
      try {
        await topicService.create({ name: newTopicName, subject_id: id });
      } catch (e) {
        console.warn("Topic sync to backend failed, kept in local storage");
      }
    }
  };

  const handleEditTopic = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (topic) {
      setEditingTopic(topicId);
      setEditTopicName(topic.name);
    }
  };

  const handleSaveTopic = async () => {
    if (editingTopic && editTopicName.trim()) {
      const updated = topics.map(t =>
        t.id === editingTopic ? { ...t, name: editTopicName } : t
      );
      saveTopicsLocal(updated);
      setEditingTopic(null);
      setEditTopicName('');
      toast.success("Topic renamed");

      try {
        await topicService.update(editingTopic, { name: editTopicName });
      } catch (e) { }
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    const updated = topics.filter(t => t.id !== topicId);
    saveTopicsLocal(updated);
    setDeleteTopicId(null);
    toast.success("Topic removed");

    try {
      await topicService.delete(topicId);
    } catch (e) { }
  };

  const handleEditSubject = async () => {
    if (!id) return;
    try {
      await subjectService.update(id, {
        name: subjectName,
        code: subjectCode,
        color: subjectColor,
        gradient: subjectGradient,
        introduction: introduction
      });
      setShowEditSubjectModal(false);
      toast.success("Subject updated");
    } catch (error) {
      toast.error("Cloud sync pending (Local saved)");
      setShowEditSubjectModal(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!id) return;
    try {
      await subjectService.delete(id);
      toast.success("Subject deleted");
      navigate('/subjects');
    } catch (error) {
      toast.error("Failed to delete subject");
    }
  };

  const handleTextbookUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsIndexing(true);
    setIndexProgress(10);

    try {
      for (let i = 0; i < files.length; i++) {
        setIndexProgress(20 + (i / files.length) * 70);
        await trainingService.uploadDocument(id!, files[i]);
      }
      setIndexProgress(100);
      toast.success("Textbook(s) indexed successfully!");
      loadTextbooks();
    } catch (error) {
      console.error("Indexing failed:", error);
      toast.error("Failed to index textbook");
    } finally {
      setIsIndexing(false);
      setIndexProgress(0);
    }
  };

  const handleRemoveTextbook = async (fileName: string) => {
    if (!subjectCode) return;
    try {
      await trainingService.deleteFile(subjectCode, fileName);
      setTextbooks(textbooks.filter(t => t.name !== fileName));
      toast.success("Textbook removed");
    } catch (error) {
      toast.error("Failed to remove textbook");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center p-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-[#C5B3E6] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-full pb-32 overflow-x-hidden">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="fixed top-20 left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: subjectColor + '20' }}
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5]
        }}
        transition={{ duration: 5, repeat: Infinity }}
        className="fixed bottom-40 right-10 w-36 h-36 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: subjectColor + '15' }}
      />

      {/* Delete Topic Confirmation */}
      <AnimatePresence>
        {deleteTopicId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-6"
            onClick={() => setDeleteTopicId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#0D2626] to-[#0A1F1F] rounded-[32px] p-6 border-4 border-[#FF6AC1] max-w-sm w-full shadow-2xl"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6AC1] to-[#FFB86C] flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <Trash2 className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-[#F5F1ED] mb-2">Delete Topic?</h3>
                <p className="text-sm text-[#8B9E9E] mb-6">This will delete this topic and all its associated questions.</p>
                <div className="flex gap-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setDeleteTopicId(null)} className="flex-1 bg-[#0A1F1F] border-2 border-[#0D3D3D] rounded-xl py-3 font-bold text-[#8B9E9E] text-sm">Cancel</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleDeleteTopic(deleteTopicId)} className="flex-1 bg-gradient-to-br from-[#FF6AC1] to-[#FFB86C] rounded-xl py-3 font-bold text-white text-sm shadow-md">Delete</motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mx-6 mt-4 mb-6">
          <div className={`bg-gradient-to-br ${subjectGradient} rounded-[32px] p-6 relative overflow-hidden border-4 border-white/20 shadow-xl`}>
            <div className="absolute inset-0 shimmer opacity-30 pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <Link to="/subjects"><motion.button className="px-4 py-2 bg-[#0A1F1F]/80 rounded-xl text-white text-sm"><ArrowLeft className="w-4 h-4" /></motion.button></Link>
              <motion.button onClick={() => setShowEditSubjectModal(true)} className="px-4 py-2 bg-[#0A1F1F]/80 rounded-xl text-white text-sm font-bold">Edit</motion.button>
            </div>
            <div className="text-center relative z-10">
              <h1 className="text-2xl font-extrabold text-[#0A1F1F] leading-tight break-words">{subjectName}</h1>
              <p className="text-sm font-bold text-[#0A1F1F] opacity-70 uppercase tracking-widest">{subjectCode}</p>
            </div>
          </div>
        </motion.div>

        {/* Info Card */}
        <div className="mx-6 mb-8 space-y-6">
          <div className="bg-gradient-to-br from-[#F5F1ED] to-[#E5DED6] rounded-[32px] p-6 border-4 border-[#E5DED6] shadow-lg">
            <h2 className="text-base font-bold text-[#0A1F1F] mb-4 leading-relaxed">{introduction}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 border-2 border-[#0A1F1F]/10">
                <p className="text-xs text-[#8B9E9E] font-bold mb-1 uppercase tracking-tighter">Total Questions</p>
                <p className="text-3xl font-black text-[#0A1F1F]">{totalQuestions}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border-2 border-[#0A1F1F]/10">
                <p className="text-xs text-[#8B9E9E] font-bold mb-1 uppercase tracking-tighter">Syllabus Coverage</p>
                <p className="text-3xl font-black" style={{ color: subjectColor }}>{topics.length > 0 ? 100 : 0}%</p>
              </div>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowTextbookModal(true)} className="bg-gradient-to-br from-[#F5F1ED] to-[#E5DED6] rounded-[32px] p-5 border-4 border-[#E5DED6] flex items-center gap-4 cursor-pointer shadow-lg mt-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner" style={{ backgroundColor: subjectColor }}><BookOpen className="w-7 h-7 text-white" /></div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-[#0A1F1F]">Study Materials</h3>
              <p className="text-xs font-bold" style={{ color: subjectColor }}>{textbooks.length} documents indexed</p>
            </div>
            <button className="px-5 py-2.5 rounded-xl font-bold text-white text-sm shadow-md" style={{ backgroundColor: subjectColor }}>Manage</button>
          </motion.div>
        </div>

        {/* Chapters Section */}
        <div className="mx-6 mb-6">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">Chapters ({topics.length})</h2>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAddTopicForm(!showAddTopicForm)} className="flex items-center gap-1 text-sm font-bold" style={{ color: subjectColor }}><Plus className="w-4 h-4" strokeWidth={3} /> ADD NEW</motion.button>
          </div>

          {/* Add Topic Form */}
          <AnimatePresence>
            {showAddTopicForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                <div className="bg-[#0D2626] rounded-2xl p-4 border-4 border-[#0D3D3D] shadow-xl">
                  <input type="text" placeholder="Enter topic name..." value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()} className="w-full bg-[#0A1F1F] border-2 border-[#0D3D3D] rounded-xl px-4 py-3 text-[#F5F1ED] placeholder:text-[#8B9E9E] text-sm mb-3 outline-none focus:border-[#C5B3E6]" />
                  <div className="flex gap-2">
                    <button onClick={handleAddTopic} className="flex-1 bg-gradient-to-br from-[#C5B3E6] to-[#9B86C5] rounded-xl py-3 font-bold text-white text-xs shadow-md uppercase tracking-wider">Add Topic</button>
                    <button onClick={() => { setShowAddTopicForm(false); setNewTopicName(''); }} className="px-6 bg-[#0A1F1F] border-2 border-[#0D3D3D] rounded-xl py-3 font-bold text-[#8B9E9E] text-xs uppercase">Cancel</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {topics.map((t, idx) => (
              <motion.div key={t.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-sm">
                  <div className="p-5 flex items-center justify-between gap-4">
                    {editingTopic === t.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input type="text" value={editTopicName} onChange={(e) => setEditTopicName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveTopic()} className="flex-1 bg-white/10 border-2 border-white/20 rounded-xl px-4 py-2 text-white font-bold text-sm outline-none focus:border-white/40" autoFocus />
                        <button onClick={handleSaveTopic} className="w-10 h-10 rounded-xl bg-[#50FA7B] flex items-center justify-center shadow-lg"><Check className="w-5 h-5 text-white" strokeWidth={3} /></button>
                        <button onClick={() => { setEditingTopic(null); setEditTopicName(''); }} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><X className="w-5 h-5 text-white/40" /></button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 shadow-inner"><BookOpen className="w-6 h-6 text-white/40" /></div>
                          <div className="truncate">
                            <h3 className="font-bold text-white text-base truncate">{t.name}</h3>
                            <div className="flex items-center gap-2">
                              {t.hasSyllabus && <div className="flex items-center gap-1"><FileText className="w-3 h-3 text-[#50FA7B]" /><span className="text-[10px] font-bold text-[#50FA7B] uppercase tracking-tighter">Syllabus</span></div>}
                              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{t.questionCount} Questions</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEditTopic(t.id)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"><Edit className="w-4 h-4 text-white/60" /></motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setDeleteTopicId(t.id)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-red-500/20 transition-all"><Trash2 className="w-4 h-4 text-white/60" /></motion.button>
                          <button onClick={() => toggleTopic(t.id)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"><motion.div animate={{ rotate: expandedTopic === t.id ? 180 : 0 }}><ChevronDown className="w-5 h-5 text-white/40" /></motion.div></button>
                        </div>
                      </>
                    )}
                  </div>

                  <AnimatePresence>
                    {expandedTopic === t.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-5 pb-5 pt-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <button className="flex items-center justify-center gap-2 bg-white/10 rounded-2xl py-4 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all"><Upload className="w-4 h-4" /> Import</button>
                          <button className="flex items-center justify-center gap-2 bg-white/10 rounded-2xl py-4 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all"><FileText className="w-4 h-4" /> Syllabus</button>
                        </div>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/generate', { state: { subjectId: id, topicId: t.id, topicName: t.name, subjectName } })} className={`w-full py-5 rounded-[24px] font-black text-white text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg`} style={{ background: `linear-gradient(135deg, ${subjectColor}, ${subjectColor}CC)` }}>
                          <Sparkles className="w-5 h-5" />
                          <span>Generate Exam</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Library Modal */}
      <Modal isOpen={showTextbookModal} onClose={() => setShowTextbookModal(false)} title="Reference Library" subtitle="Knowledge Assets">
        <div className="space-y-6">
          {isIndexing && (
            <div className="p-4 bg-[#C5B3E6]/10 rounded-2xl border-2 border-[#C5B3E6]/20 flex items-center gap-4">
              <Loader2 className="w-6 h-6 text-[#C5B3E6] animate-spin" />
              <div className="flex-1">
                <p className="text-[10px] font-black text-[#8B9E9E] uppercase tracking-widest">Indexing Assets...</p>
                <div className="h-2 bg-[#F5F1ED] rounded-full mt-2 overflow-hidden shadow-inner"><motion.div initial={{ width: 0 }} animate={{ width: `${indexProgress}%` }} className="h-full bg-[#C5B3E6]" /></div>
              </div>
            </div>
          )}
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {textbooks.map(t => (
              <div key={t.id} className="flex items-center gap-4 p-4 bg-white rounded-[24px] border-2 border-transparent hover:border-[#C5B3E6]/20 transition-all group shadow-sm">
                <div className="w-12 h-12 bg-[#F5F1ED] rounded-xl flex items-center justify-center flex-shrink-0"><FileText className="w-6 h-6 text-[#8B9E9E]" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#0A1F1F] truncate leading-none mb-1">{t.name}</p>
                  <p className="text-[9px] font-bold text-[#8B9E9E] uppercase tracking-tighter">{t.size || '0.2MB'} • Verified</p>
                </div>
                <button onClick={() => handleRemoveTextbook(t.id)} className="p-2.5 hover:bg-red-50 rounded-xl text-red-400 transition-colors"><Trash2 className="w-4 h-4" strokeWidth={3} /></button>
              </div>
            ))}
            {textbooks.length === 0 && !isIndexing && <div className="text-center py-12 opacity-20"><AlertCircle className="w-12 h-12 mx-auto mb-3" /><p className="text-[10px] font-bold uppercase tracking-[0.2em]">No documents found</p></div>}
          </div>
          <div className="pt-2">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleTextbookUpload} multiple accept=".pdf,.doc,.docx" />
            <button onClick={() => fileInputRef.current?.click()} className="w-full bg-[#0A1F1F] hover:scale-[0.98] text-white rounded-[28px] py-5 flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-[0.2em] transition-all cursor-pointer shadow-xl"><Upload className="w-5 h-5" strokeWidth={3} /><span>Upload Documents</span></button>
            <p className="text-center text-[9px] font-black text-[#8B9E9E] uppercase mt-5 tracking-[0.3em]">PDF • DOCX • MAX 50MB</p>
          </div>
        </div>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal isOpen={showEditSubjectModal} onClose={() => setShowEditSubjectModal(false)} title="Edit Subject" subtitle="Update subject details">
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-[28px] border-2 border-[#E5DED6] shadow-sm">
            <p className="text-[10px] font-black text-[#8B9E9E] uppercase tracking-[0.2em] mb-3 ml-1">Subject Name</p>
            <input type="text" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className="w-full bg-[#F5F1ED] rounded-2xl px-5 py-4 text-[#0A1F1F] font-bold text-base outline-none border-2 border-transparent focus:border-[#C5B3E6]/30 transition-all shadow-inner" />
          </div>
          <div className="bg-white p-5 rounded-[28px] border-2 border-[#E5DED6] shadow-sm">
            <p className="text-[10px] font-black text-[#8B9E9E] uppercase tracking-[0.2em] mb-3 ml-1">Introduction</p>
            <textarea value={introduction} onChange={(e) => setIntroduction(e.target.value)} className="w-full bg-[#F5F1ED] rounded-2xl px-5 py-4 text-[#0A1F1F] font-bold text-sm outline-none border-2 border-transparent focus:border-[#C5B3E6]/30 transition-all h-28 resize-none shadow-inner" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleEditSubject} className="flex-1 bg-[#0A1F1F] text-white rounded-[28px] py-5 font-bold uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all">Save Changes</button>
            <button onClick={() => setShowDeleteConfirm(true)} className="w-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-100 transition-all group shadow-inner"><Trash2 className="w-6 h-6 group-hover:scale-110 transition-transform" strokeWidth={2.5} /></button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Subject" variant="dark">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 border-2 border-red-500/10"><Trash2 className="w-8 h-8 text-red-500" strokeWidth={2.5} /></div>
          <p className="text-sm font-bold text-white/60 mb-10 leading-relaxed">Are you sure you want to delete <span className="text-red-500 font-black italic">"{subjectName}"</span>? This action cannot be undone.</p>
          <div className="flex flex-col gap-4">
            <button onClick={handleDeleteSubject} className="w-full bg-red-500 py-5 rounded-[28px] text-white font-bold uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all">Destroy Subject</button>
            <button onClick={() => setShowDeleteConfirm(false)} className="w-full py-2 text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]">Abort</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
