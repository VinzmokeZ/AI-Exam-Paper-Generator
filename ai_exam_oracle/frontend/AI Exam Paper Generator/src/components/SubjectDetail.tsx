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

  const loadSubjectData = async () => {
    if (!id) return;
    setIsLoading(true);

    try {
      let subject: any = null;
      const defaultSubject = DEFAULT_SUBJECTS.find(s => s.id.toString() === id.toString() || s.code === id);

      try {
        subject = await subjectService.getById(id);
      } catch (backendError) {
        subject = defaultSubject;
      }

      if (subject) {
        setSubjectName(subject.name);
        setSubjectCode(subject.code);
        setSubjectColor(subject.color);
        setSubjectGradient(subject.gradient);
        setIntroduction(subject.introduction || `Study materials and topics for ${subject.name}`);

        const numericId = parseInt(id);
        if (!isNaN(numericId) && id.toString().length < 5) {
          try {
            const topicList = await topicService.getBySubject(id);
            const mappedTopics = topicList.map(t => ({
              id: t.id.toString(),
              name: t.name,
              questionCount: t.question_count || 0,
              hasSyllabus: t.has_syllabus
            }));
            setTopics(mappedTopics);

            const realQuestionCount = mappedTopics.reduce((sum, t) => sum + t.questionCount, 0);
            setTotalQuestions(realQuestionCount);
          } catch (e) {
            setTopics([]);
            setTotalQuestions(subject.questions || 0);
          }
        } else {
          setTopics([]);
          setTotalQuestions(subject.questions || 0);
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

  const handleAddTopic = async () => {
    if (newTopicName.trim() && id) {
      try {
        const newTopic = await topicService.create({
          name: newTopicName,
          subject_id: parseInt(id)
        });
        setTopics([...topics, {
          id: newTopic.id.toString(),
          name: newTopic.name,
          questionCount: 0,
          hasSyllabus: false
        }]);
        setNewTopicName('');
        setShowAddTopicForm(false);
        toast.success("Topic added");
      } catch (error) {
        toast.error("Default subjects are read-only until saved to database.");
      }
    }
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
      toast.error("Failed to update subject");
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
        className="absolute top-20 left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: subjectColor + '20' }}
      />

      <div className="relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mx-6 mt-4 mb-6">
          <div className={`bg-gradient-to-br ${subjectGradient} rounded-[32px] p-6 relative overflow-hidden border-4 border-white/20 shadow-xl`}>
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

        {/* Chapters */}
        <div className="mx-6 mb-6">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">Chapters ({topics.length})</h2>
            <button onClick={() => setShowAddTopicForm(!showAddTopicForm)} className="flex items-center gap-1 text-sm font-bold" style={{ color: subjectColor }}><Plus className="w-4 h-4" strokeWidth={3} /> ADD NEW</button>
          </div>

          <div className="space-y-3">
            {topics.map(t => (
              <div key={t.id} className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><BookOpen className="w-5 h-5 text-white/40" /></div>
                  <div>
                    <h3 className="font-bold text-white truncate max-w-[150px]">{t.name}</h3>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">{t.questionCount} Questions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate('/generate', { state: { subjectId: id, topicId: t.id, topicName: t.name, subjectName } })} className="p-2.5 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all active:scale-95"><Sparkles className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Library Modal */}
      <Modal
        isOpen={showTextbookModal}
        onClose={() => setShowTextbookModal(false)}
        title="Reference Library"
        subtitle="Knowledge Assets"
      >
        <div className="space-y-6">
          {isIndexing && (
            <div className="p-4 bg-[#C5B3E6]/10 rounded-2xl border-2 border-[#C5B3E6]/20 flex items-center gap-4">
              <Loader2 className="w-6 h-6 text-[#C5B3E6] animate-spin" />
              <div className="flex-1">
                <p className="text-[10px] font-black text-[#8B9E9E] uppercase tracking-widest">Indexing Assets...</p>
                <div className="h-2 bg-[#F5F1ED] rounded-full mt-2 overflow-hidden shadow-inner">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${indexProgress}%` }} className="h-full bg-[#C5B3E6]" />
                </div>
              </div>
            </div>
          )}
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {textbooks.map(t => (
              <div key={t.id} className="flex items-center gap-4 p-4 bg-white rounded-[24px] border-2 border-transparent hover:border-[#C5B3E6]/20 transition-all group">
                <div className="w-12 h-12 bg-[#F5F1ED] rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-[#8B9E9E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#0A1F1F] truncate leading-none mb-1">{t.name}</p>
                  <p className="text-[9px] font-bold text-[#8B9E9E] uppercase tracking-tighter">{t.size || '0.2MB'} • Verified</p>
                </div>
                <button onClick={() => handleRemoveTextbook(t.id)} className="p-2.5 hover:bg-red-50 rounded-xl text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" strokeWidth={3} />
                </button>
              </div>
            ))}
            {textbooks.length === 0 && !isIndexing && (
              <div className="text-center py-12 opacity-20">
                <AlertCircle className="w-12 h-12 mx-auto mb-3" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">No documents found</p>
              </div>
            )}
          </div>
          <div className="pt-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleTextbookUpload}
              multiple
              accept=".pdf,.doc,.docx"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-[#0A1F1F] hover:scale-[0.98] text-white rounded-[28px] py-5 flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-[0.2em] transition-all cursor-pointer shadow-xl"
            >
              <Upload className="w-5 h-5" strokeWidth={3} />
              <span>Upload Documents</span>
            </button>
            <p className="text-center text-[9px] font-black text-[#8B9E9E] uppercase mt-5 tracking-[0.3em]">PDF • DOCX • MAX 50MB</p>
          </div>
        </div>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal
        isOpen={showEditSubjectModal}
        onClose={() => setShowEditSubjectModal(false)}
        title="Edit Subject"
        subtitle="Update subject details"
      >
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-[28px] border-2 border-[#E5DED6]">
            <p className="text-[10px] font-bold text-[#8B9E9E] uppercase tracking-[0.2em] mb-3 ml-1">Subject Name</p>
            <input type="text" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className="w-full bg-[#F5F1ED] rounded-xl px-5 py-3.5 text-[#0A1F1F] font-bold text-base outline-none border-2 border-transparent focus:border-[#C5B3E6]/30 transition-all" />
          </div>
          <div className="bg-white p-5 rounded-[28px] border-2 border-[#E5DED6]">
            <p className="text-[10px] font-bold text-[#8B9E9E] uppercase tracking-[0.2em] mb-3 ml-1">Description</p>
            <textarea value={introduction} onChange={(e) => setIntroduction(e.target.value)} className="w-full bg-[#F5F1ED] rounded-xl px-5 py-3.5 text-[#0A1F1F] font-bold text-sm outline-none border-2 border-transparent focus:border-[#C5B3E6]/30 transition-all h-28 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleEditSubject} className="flex-1 bg-[#0A1F1F] text-white rounded-[28px] py-5 font-bold uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all">Save Changes</button>
            <button onClick={() => setShowDeleteConfirm(true)} className="w-16 bg-red-50 rounded-[22px] flex items-center justify-center text-red-400 hover:bg-red-100 transition-all group shadow-inner"><Trash2 className="w-6 h-6 group-hover:scale-110 transition-transform" strokeWidth={2.5} /></button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Subject"
        variant="dark"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 border-2 border-red-500/20">
            <Trash2 className="w-8 h-8 text-red-500" strokeWidth={2.5} />
          </div>
          <p className="text-sm font-bold text-white/60 mb-10 leading-relaxed">
            Are you sure you want to delete <span className="text-red-500 font-bold">"{subjectName}"</span>? This action cannot be undone.
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={handleDeleteSubject}
              className="w-full bg-red-500 py-5 rounded-[28px] text-white font-bold uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all"
            >
              Delete Subject
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="w-full py-2 text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
