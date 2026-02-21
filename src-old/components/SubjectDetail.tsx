import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Edit, Upload, FileText, BookOpen, ChevronDown, Plus, Sparkles, FileEdit, Trash2, X, Check, Palette } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router';

interface Topic {
  id: string;
  name: string;
  questionCount: number;
  hasSyllabus: boolean;
}

interface SubjectData {
  code: string;
  name: string;
  color: string;
  gradient: string;
  introduction: string;
  totalQuestions: number;
  syllabusCoverage: number;
  topics: Topic[];
}

const subjectsData: { [key: string]: SubjectData } = {
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
  
  const subjectData = id ? subjectsData[id] : null;
  
  if (!subjectData) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <p className="text-[#F5F1ED]">Subject not found</p>
      </div>
    );
  }

  const [subjectName, setSubjectName] = useState(subjectData.name);
  const [subjectCode, setSubjectCode] = useState(subjectData.code);
  const [subjectColor, setSubjectColor] = useState(subjectData.color);
  const [subjectGradient, setSubjectGradient] = useState(subjectData.gradient);
  const [introduction, setIntroduction] = useState(subjectData.introduction);
  
  const [topics, setTopics] = useState<Topic[]>(subjectData.topics);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [showAddTopicForm, setShowAddTopicForm] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  
  // Edit modals
  const [showEditSubjectModal, setShowEditSubjectModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [editTopicName, setEditTopicName] = useState('');
  const [deleteTopicId, setDeleteTopicId] = useState<string | null>(null);

  const toggleTopic = (topicId: string) => {
    setExpandedTopic(expandedTopic === topicId ? null : topicId);
  };

  const handleAddTopic = () => {
    if (newTopicName.trim()) {
      const newTopic: Topic = {
        id: `${Date.now()}`,
        name: newTopicName,
        questionCount: 0,
        hasSyllabus: false
      };
      setTopics([...topics, newTopic]);
      setNewTopicName('');
      setShowAddTopicForm(false);
    }
  };

  const handleEditSubject = () => {
    // Save changes
    setShowEditSubjectModal(false);
  };

  const handleDeleteSubject = () => {
    // Delete subject and navigate back
    navigate('/subjects');
  };

  const handleEditTopic = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (topic) {
      setEditingTopic(topicId);
      setEditTopicName(topic.name);
    }
  };

  const handleSaveTopic = () => {
    if (editingTopic && editTopicName.trim()) {
      setTopics(topics.map(t => 
        t.id === editingTopic ? { ...t, name: editTopicName } : t
      ));
      setEditingTopic(null);
      setEditTopicName('');
    }
  };

  const handleDeleteTopic = (topicId: string) => {
    setTopics(topics.filter(t => t.id !== topicId));
    setDeleteTopicId(null);
  };

  return (
    <div className="min-h-full pb-6">
      {/* Floating background elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="fixed top-20 left-10 w-40 h-40 rounded-full blur-3xl"
        style={{ backgroundColor: subjectColor + '20' }}
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5]
        }}
        transition={{ duration: 5, repeat: Infinity }}
        className="fixed bottom-40 right-10 w-36 h-36 rounded-full blur-3xl"
        style={{ backgroundColor: subjectColor + '15' }}
      />

      {/* Edit Subject Modal */}
      <AnimatePresence>
        {showEditSubjectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowEditSubjectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#0D2626] to-[#0A1F1F] rounded-[32px] p-6 border-4 border-[#0D3D3D] max-w-md w-full relative overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 shimmer opacity-10" />
              
              {/* Header */}
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h2 className="text-xl font-bold text-[#F5F1ED]">Edit Subject</h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowEditSubjectModal(false)}
                  className="w-8 h-8 rounded-lg bg-[#0A1F1F] flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-[#8B9E9E]" />
                </motion.button>
              </div>

              {/* Form */}
              <div className="space-y-4 relative z-10">
                {/* Subject Name */}
                <div>
                  <label className="text-xs font-bold text-[#8B9E9E] uppercase mb-2 block">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full bg-[#0A1F1F] border-2 border-[#0D3D3D] rounded-xl px-4 py-3 text-[#F5F1ED] text-sm outline-none focus:border-[#C5B3E6] transition-colors"
                    placeholder="e.g., Computer Science"
                  />
                </div>

                {/* Subject Code */}
                <div>
                  <label className="text-xs font-bold text-[#8B9E9E] uppercase mb-2 block">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full bg-[#0A1F1F] border-2 border-[#0D3D3D] rounded-xl px-4 py-3 text-[#F5F1ED] text-sm outline-none focus:border-[#C5B3E6] transition-colors"
                    placeholder="e.g., CS101"
                  />
                </div>

                {/* Introduction */}
                <div>
                  <label className="text-xs font-bold text-[#8B9E9E] uppercase mb-2 block">
                    Introduction
                  </label>
                  <input
                    type="text"
                    value={introduction}
                    onChange={(e) => setIntroduction(e.target.value)}
                    className="w-full bg-[#0A1F1F] border-2 border-[#0D3D3D] rounded-xl px-4 py-3 text-[#F5F1ED] text-sm outline-none focus:border-[#C5B3E6] transition-colors"
                    placeholder="e.g., Introduction to Computer Science"
                  />
                </div>

                {/* Color Picker */}
                <div>
                  <label className="text-xs font-bold text-[#8B9E9E] uppercase mb-2 block flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Color Theme
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {colorOptions.map((option) => (
                      <motion.button
                        key={option.color}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSubjectColor(option.color);
                          setSubjectGradient(option.gradient);
                        }}
                        className={`h-12 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center border-4 transition-all ${
                          subjectColor === option.color ? 'border-white scale-105' : 'border-transparent'
                        }`}
                      >
                        {subjectColor === option.color && (
                          <Check className="w-5 h-5 text-white" strokeWidth={3} />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEditSubject}
                    className="flex-1 bg-gradient-to-br from-[#C5B3E6] to-[#9B86C5] rounded-xl py-3 font-bold text-white glow-purple"
                  >
                    Save Changes
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-5 bg-gradient-to-br from-[#FF6AC1] to-[#FFB86C] rounded-xl py-3 font-bold text-white glow-pink"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Subject Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-6"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#0D2626] to-[#0A1F1F] rounded-[32px] p-6 border-4 border-[#FF6AC1] max-w-sm w-full"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6AC1] to-[#FFB86C] flex items-center justify-center mx-auto mb-4 glow-pink"
                >
                  <Trash2 className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-[#F5F1ED] mb-2">Delete Subject?</h3>
                <p className="text-sm text-[#8B9E9E] mb-6">
                  This will permanently delete "{subjectName}" and all its topics. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-[#0A1F1F] border-2 border-[#0D3D3D] rounded-xl py-3 font-bold text-[#8B9E9E]"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeleteSubject}
                    className="flex-1 bg-gradient-to-br from-[#FF6AC1] to-[#FFB86C] rounded-xl py-3 font-bold text-white glow-pink"
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="bg-gradient-to-br from-[#0D2626] to-[#0A1F1F] rounded-[32px] p-6 border-4 border-[#FF6AC1] max-w-sm w-full"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6AC1] to-[#FFB86C] flex items-center justify-center mx-auto mb-4 glow-pink"
                >
                  <Trash2 className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-[#F5F1ED] mb-2">Delete Topic?</h3>
                <p className="text-sm text-[#8B9E9E] mb-6">
                  This will delete this topic and all its associated questions.
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDeleteTopicId(null)}
                    className="flex-1 bg-[#0A1F1F] border-2 border-[#0D3D3D] rounded-xl py-3 font-bold text-[#8B9E9E]"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDeleteTopic(deleteTopicId)}
                    className="flex-1 bg-gradient-to-br from-[#FF6AC1] to-[#FFB86C] rounded-xl py-3 font-bold text-white glow-pink"
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-6 mt-4 mb-6 relative z-10"
      >
        <div 
          className={`bg-gradient-to-br ${subjectGradient} rounded-[32px] p-6 relative overflow-hidden border-4 border-white/20`}
        >
          {/* Animated shimmer */}
          <div className="absolute inset-0 shimmer opacity-30" />
          
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <Link to="/subjects">
              <motion.button
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-[#0A1F1F]/80 backdrop-blur-sm rounded-xl flex items-center gap-2 text-[#F5F1ED] font-semibold text-sm border-2 border-white/20"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEditSubjectModal(true)}
              className="px-4 py-2 bg-[#0A1F1F]/80 backdrop-blur-sm rounded-xl flex items-center gap-2 text-[#F5F1ED] font-semibold text-sm border-2 border-white/20"
            >
              Edit
              <Edit className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Subject Name */}
          <div className="text-center relative z-10">
            <motion.h1 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold text-[#0A1F1F] mb-1"
            >
              {subjectName}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-semibold text-[#0A1F1F] opacity-70"
            >
              {subjectCode}
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Introduction Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-6 mb-6 relative z-10"
      >
        <div className="bg-gradient-to-br from-[#F5F1ED] to-[#E5DED6] rounded-[32px] p-6 border-4 border-[#E5DED6]">
          <h2 className="text-base font-bold text-[#0A1F1F] mb-4">{introduction}</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Total Questions */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl p-4 border-2 border-[#0A1F1F]/10"
            >
              <p className="text-xs text-[#8B9E9E] font-semibold mb-1">Total Questions</p>
              <motion.p 
                className="text-3xl font-bold text-[#0A1F1F]"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {subjectData.totalQuestions}
              </motion.p>
            </motion.div>

            {/* Syllabus Coverage */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl p-4 border-2 border-[#0A1F1F]/10"
            >
              <p className="text-xs text-[#8B9E9E] font-semibold mb-1">Syllabus Coverage</p>
              <motion.p 
                className="text-3xl font-bold"
                style={{ color: subjectColor }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                {subjectData.syllabusCoverage}%
              </motion.p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Textbook Reference */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-6 mb-6 relative z-10"
      >
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-[#F5F1ED] to-[#E5DED6] rounded-[32px] p-5 border-4 border-[#E5DED6] flex items-center gap-4"
        >
          {/* Icon */}
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 glow"
            style={{ backgroundColor: subjectColor }}
          >
            <BookOpen className="w-7 h-7 text-white" />
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-[#0A1F1F]">Textbook Reference</h3>
            <p className="text-xs font-medium" style={{ color: subjectColor }}>
              Improve AI accuracy using units
            </p>
          </div>

          {/* Upload Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 rounded-xl font-bold text-white text-sm flex-shrink-0 glow"
            style={{ backgroundColor: subjectColor }}
          >
            Upload
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Topics Section */}
      <div className="mx-6 mb-6 relative z-10">
        {/* Topics Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#F5F1ED] uppercase">
            Topics ({topics.length})
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddTopicForm(!showAddTopicForm)}
            className="flex items-center gap-1 text-sm font-bold glow"
            style={{ color: subjectColor }}
          >
            <Plus className="w-4 h-4" />
            Add
          </motion.button>
        </div>

        {/* Add Topic Form */}
        <AnimatePresence>
          {showAddTopicForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 overflow-hidden"
            >
              <div className="bg-gradient-to-br from-[#0D2626] to-[#0A1F1F] rounded-2xl p-4 border-4 border-[#0D3D3D]">
                <input
                  type="text"
                  placeholder="Enter topic name..."
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                  className="w-full bg-[#0A1F1F] border-2 border-[#0D3D3D] rounded-xl px-4 py-3 text-[#F5F1ED] placeholder:text-[#8B9E9E] text-sm mb-3 outline-none focus:border-[#C5B3E6]"
                />
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddTopic}
                    className="flex-1 bg-gradient-to-br from-[#C5B3E6] to-[#9B86C5] rounded-xl py-3 font-bold text-white text-sm glow-purple"
                  >
                    Add Topic
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowAddTopicForm(false);
                      setNewTopicName('');
                    }}
                    className="px-6 bg-[#0A1F1F] border-2 border-[#0D3D3D] rounded-xl py-3 font-bold text-[#8B9E9E] text-sm"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Topics List */}
        <div className="space-y-3">
          {topics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              {/* Topic Card */}
              <div className="bg-gradient-to-br from-[#F5F1ED] to-[#E5DED6] rounded-2xl border-4 border-[#E5DED6] overflow-hidden">
                {/* Topic Header */}
                <div className="p-4 flex items-center gap-3">
                  {/* Icon */}
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 glow"
                    style={{ backgroundColor: '#50FA7B' }}
                  >
                    <BookOpen className="w-6 h-6 text-white" />
                  </motion.div>

                  {/* Topic Info - Editable */}
                  {editingTopic === topic.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editTopicName}
                        onChange={(e) => setEditTopicName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveTopic()}
                        className="flex-1 bg-white border-2 border-[#50FA7B] rounded-lg px-3 py-2 text-[#0A1F1F] text-sm font-bold outline-none"
                        autoFocus
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleSaveTopic}
                        className="w-8 h-8 rounded-lg bg-[#50FA7B] flex items-center justify-center glow-green"
                      >
                        <Check className="w-5 h-5 text-white" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setEditingTopic(null);
                          setEditTopicName('');
                        }}
                        className="w-8 h-8 rounded-lg bg-[#8B9E9E] flex items-center justify-center"
                      >
                        <X className="w-5 h-5 text-white" />
                      </motion.button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 text-left min-w-0">
                        <h3 className="text-base font-bold text-[#0A1F1F]">{topic.name}</h3>
                        <div className="flex items-center gap-2 text-xs">
                          {topic.hasSyllabus && (
                            <>
                              <FileText className="w-3 h-3 text-[#50FA7B]" />
                              <span className="font-semibold text-[#50FA7B]">Syllabus</span>
                              <span className="text-[#8B9E9E]">•</span>
                            </>
                          )}
                          <span className="text-[#8B9E9E] font-medium">
                            {topic.questionCount} Questions
                          </span>
                        </div>
                      </div>

                      {/* Topic Actions */}
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditTopic(topic.id)}
                          className="w-8 h-8 rounded-lg bg-[#8BE9FD] flex items-center justify-center glow-blue"
                        >
                          <Edit className="w-4 h-4 text-white" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setDeleteTopicId(topic.id)}
                          className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6AC1] to-[#FFB86C] flex items-center justify-center glow-pink"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </motion.button>
                        <motion.button
                          whileHover={{ backgroundColor: 'rgba(139, 158, 158, 0.2)' }}
                          onClick={() => toggleTopic(topic.id)}
                          className="w-8 h-8 rounded-lg bg-[#0A1F1F]/10 flex items-center justify-center"
                        >
                          <motion.div
                            animate={{ rotate: expandedTopic === topic.id ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="w-5 h-5 text-[#8B9E9E]" />
                          </motion.div>
                        </motion.button>
                      </div>
                    </>
                  )}
                </div>

                {/* Expanded Actions */}
                <AnimatePresence>
                  {expandedTopic === topic.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-2">
                        {/* Upload Questions */}
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-br from-[#8BE9FD] to-[#6FEDD6] rounded-2xl py-4 font-bold text-white flex items-center justify-center gap-2 shadow-lg glow-blue"
                        >
                          <Upload className="w-5 h-5" />
                          Upload Questions
                        </motion.button>

                        {/* Update Syllabus */}
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-br from-[#50FA7B] to-[#6FEDD6] rounded-2xl py-4 font-bold text-white flex items-center justify-center gap-2 shadow-lg glow-green"
                        >
                          <FileEdit className="w-5 h-5" />
                          Update Syllabus
                        </motion.button>

                        {/* Generate Questions */}
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate('/generate')}
                          className="w-full bg-gradient-to-br from-[#C5B3E6] to-[#9B86C5] rounded-2xl py-4 font-bold text-white flex items-center justify-center gap-2 shadow-lg glow-purple"
                        >
                          <Sparkles className="w-5 h-5" />
                          Generate Questions
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
