import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import { 
  ArrowLeft, BarChart3, FileText, CheckCircle2, XCircle, Clock, 
  TrendingUp, Target, Brain, BookOpen, Users, Download, ChevronDown, 
  ChevronUp, AlertTriangle, Sparkles
} from 'lucide-react';

export function Reports() {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    learningOutcomes: true,
    blooms: true,
    syllabus: false,
    reviewer: false,
    bySubject: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  // Analytics Data
  const overviewStats = [
    { label: 'Questions Generated', value: '1,020', icon: FileText, color: '#8BE9FD', bg: '#8BE9FD20' },
    { label: 'Questions Approved', value: '892', icon: CheckCircle2, color: '#50FA7B', bg: '#50FA7B20' },
    { label: 'Questions Rejected', value: '78', icon: XCircle, color: '#FF6AC1', bg: '#FF6AC120' },
    { label: 'Pending Review', value: '50', icon: Clock, color: '#FFB86C', bg: '#FFB86C20' },
  ];

  const learningOutcomes = [
    { code: 'LO1', name: 'Understand fundamentals', current: 245, total: 250, percentage: 98, status: 'On track', color: '#8BE9FD' },
    { code: 'LO2', name: 'Apply knowledge', current: 198, total: 200, percentage: 99, status: 'On track', color: '#C5B3E6' },
    { code: 'LO3', name: 'Analyze problems', current: 156, total: 180, percentage: 87, status: 'On track', color: '#FFB86C' },
    { code: 'LO4', name: 'Design solutions', current: 89, total: 120, percentage: 74, status: 'Needs more questions', color: '#50FA7B' },
    { code: 'LO5', name: 'Evaluate approaches', current: 62, total: 100, percentage: 62, status: 'Needs more questions', color: '#FF6AC1' },
  ];

  const bloomsData = [
    { level: 'Knowledge', count: 285, percentage: 28, color: '#8BE9FD', shortName: 'Know' },
    { level: 'Comprehension', count: 220, percentage: 22, color: '#C5B3E6', shortName: 'Comp' },
    { level: 'Application', count: 195, percentage: 19, color: '#8BE9FD', shortName: 'Appl' },
    { level: 'Analysis', count: 165, percentage: 16, color: '#FFB86C', shortName: 'Anal' },
    { level: 'Synthesis', count: 95, percentage: 9, color: '#50FA7B', shortName: 'Synt' },
    { level: 'Evaluation', count: 60, percentage: 6, color: '#FF6AC1', shortName: 'Eval' },
  ];

  const syllabusTopics = [
    { name: 'Introduction to Algorithms', questions: 120, percentage: 95, color: '#50FA7B' },
    { name: 'Sorting & Searching', questions: 98, percentage: 88, color: '#50FA7B' },
    { name: 'Data Structures', questions: 85, percentage: 75, color: '#FFB86C' },
    { name: 'Graph Algorithms', questions: 45, percentage: 62, color: '#FFB86C' },
    { name: 'Dynamic Programming', questions: 32, percentage: 45, color: '#FF6AC1', alert: true },
    { name: 'Hashing', questions: 70, percentage: 80, color: '#50FA7B' },
  ];

  const maxCount = Math.max(...bloomsData.map(d => d.count));

  return (
    <div className="min-h-full pb-6">
      {/* Floating background elements */}
      <div className="fixed top-20 left-10 w-40 h-40 bg-[#8BE9FD]/10 rounded-full blur-3xl float-slow" />
      <div className="fixed bottom-40 right-10 w-36 h-36 bg-[#C5B3E6]/10 rounded-full blur-3xl float-slow float-delay-1" />

      {/* Header */}
      <div className="mx-6 mt-4 mb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#0D2626] to-[#0A1F1F] rounded-[32px] p-6 border-4 border-[#0A1F1F] relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link to="/">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-[#0A1F1F] rounded-xl flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 text-[#F5F1ED]" />
                </motion.div>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-[#F5F1ED]">Reports & Analytics</h1>
                <p className="text-xs text-[#8B9E9E]">Comprehensive insights</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-[#8BE9FD]/20 rounded-xl flex items-center justify-center"
            >
              <Download className="w-5 h-5 text-[#8BE9FD]" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Filter by Subject */}
      <div className="mx-6 mb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#F5F1ED] rounded-2xl p-4 border-4 border-[#E5DED6]"
        >
          <label className="text-[10px] font-bold text-[#0A1F1F] uppercase mb-2 block">
            Filter by Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-white rounded-xl px-4 py-3 text-[#0A1F1F] text-sm border-3 border-[#E5DED6] outline-none font-medium"
          >
            <option value="all">All Subjects</option>
            <option value="cs301">Computer Science (CS301)</option>
            <option value="math101">Mathematics (MATH101)</option>
            <option value="phys202">Physics (PHYS202)</option>
          </select>
        </motion.div>
      </div>

      {/* Overview Statistics Section */}
      <div className="mx-6 mb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-[#8BE9FD] to-[#6FEDD6] rounded-[32px] border-4 border-white/30 overflow-hidden"
        >
          <motion.button
            onClick={() => toggleSection('overview')}
            className="w-full p-5 flex items-center justify-between"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-[#0A1F1F]" />
              <h2 className="text-base font-bold text-[#0A1F1F]">Overview Statistics</h2>
            </div>
            <motion.div
              animate={{ rotate: expandedSections.overview ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-[#0A1F1F]" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {expandedSections.overview && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {overviewStats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="rounded-2xl p-4 border-3 border-white/40 relative overflow-hidden"
                        style={{ backgroundColor: stat.bg }}
                      >
                        <stat.icon className="w-6 h-6 mb-2" style={{ color: stat.color }} />
                        <p className="text-2xl font-bold text-[#0A1F1F] mb-1">{stat.value}</p>
                        <p className="text-[9px] text-[#0A1F1F] opacity-70 font-bold uppercase leading-tight">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Approval Rate */}
                  <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border-3 border-white/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-[#0A1F1F]">Approval Rate</span>
                      <span className="text-2xl font-bold text-[#50FA7B]">87.5%</span>
                    </div>
                    <div className="bg-white/30 rounded-full h-3 overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '87.5%' }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-[#50FA7B] to-[#6FEDD6] relative"
                      >
                        <motion.div
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        />
                      </motion.div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#0A1F1F] opacity-70">
                      <TrendingUp className="w-3 h-3 text-[#50FA7B]" />
                      <span className="font-semibold">+5.2% from last month</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Learning Outcomes Analysis */}
      <div className="mx-6 mb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#50FA7B] to-[#6FEDD6] rounded-[32px] border-4 border-white/30 overflow-hidden"
        >
          <motion.button
            onClick={() => toggleSection('learningOutcomes')}
            className="w-full p-5 flex items-center justify-between"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-[#0A1F1F]" />
              <h2 className="text-base font-bold text-[#0A1F1F]">Learning Outcomes Analysis</h2>
            </div>
            <motion.div
              animate={{ rotate: expandedSections.learningOutcomes ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-[#0A1F1F]" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {expandedSections.learningOutcomes && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5">
                  <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border-3 border-white/40 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#0A1F1F]">Overall LO Coverage</span>
                      <span className="text-2xl font-bold text-[#0A1F1F]">88%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {learningOutcomes.map((lo, index) => (
                      <motion.div
                        key={lo.code}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + index * 0.05 }}
                        className="bg-white rounded-2xl p-3 border-3 border-[#E5DED6]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="px-2 py-1 rounded-lg font-bold text-xs text-white"
                              style={{ backgroundColor: lo.color }}
                            >
                              {lo.code}
                            </div>
                            <span className="text-sm font-medium text-[#0A1F1F]">{lo.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold" style={{ color: lo.color }}>
                              {lo.current}/{lo.total}
                            </p>
                          </div>
                        </div>

                        <div className="bg-[#E5DED6] rounded-full h-2 overflow-hidden mb-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${lo.percentage}%` }}
                            transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                            className="h-full"
                            style={{ backgroundColor: lo.color }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {lo.status === 'On track' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-[#50FA7B]" />
                                <span className="text-[10px] font-semibold text-[#50FA7B]">{lo.status}</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3 h-3 text-[#FFB86C]" />
                                <span className="text-[10px] font-semibold text-[#FFB86C]">{lo.status}</span>
                              </>
                            )}
                          </div>
                          <span className="text-[10px] text-[#0A1F1F] opacity-60">{lo.percentage}% of target</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Cognitive Level Analysis (Bloom's) */}
      <div className="mx-6 mb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-br from-[#C5B3E6] to-[#9B86C5] rounded-[32px] border-4 border-white/30 overflow-hidden"
        >
          <motion.button
            onClick={() => toggleSection('blooms')}
            className="w-full p-5 flex items-center justify-between"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-[#0A1F1F]" />
              <h2 className="text-base font-bold text-[#0A1F1F]">Cognitive Level Analysis (Bloom's)</h2>
            </div>
            <motion.div
              animate={{ rotate: expandedSections.blooms ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-[#0A1F1F]" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {expandedSections.blooms && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5">
                  <p className="text-xs text-[#0A1F1F] opacity-80 mb-4">
                    Distribution of questions across Bloom's Taxonomy levels
                  </p>

                  {/* Bar Chart */}
                  <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border-3 border-white/40 mb-4">
                    <div className="flex items-end justify-between gap-2 h-32 mb-2">
                      {bloomsData.map((item, index) => (
                        <div key={item.level} className="flex-1 flex flex-col items-center gap-1">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(item.count / maxCount) * 100}%` }}
                            transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                            className="w-full rounded-t-lg relative"
                            style={{ backgroundColor: item.color }}
                          >
                            <div className="absolute -top-6 left-0 right-0 text-center">
                              <span className="text-[10px] font-bold text-[#0A1F1F]">{item.percentage}%</span>
                            </div>
                          </motion.div>
                          <span className="text-[9px] font-bold text-[#0A1F1F]">{item.shortName}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detailed List */}
                  <div className="space-y-2">
                    {bloomsData.map((item, index) => (
                      <motion.div
                        key={item.level}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + index * 0.05 }}
                        className="bg-white rounded-xl p-3 border-2 border-[#E5DED6] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-semibold text-[#0A1F1F]">{item.level}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold" style={{ color: item.color }}>
                            {item.count}
                          </span>
                          <span className="text-xs text-[#0A1F1F] opacity-60">({item.percentage}%)</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Syllabus Coverage by Topic */}
      <div className="mx-6 mb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#FFB86C] to-[#FF6AC1] rounded-[32px] border-4 border-white/30 overflow-hidden"
        >
          <motion.button
            onClick={() => toggleSection('syllabus')}
            className="w-full p-5 flex items-center justify-between"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-[#0A1F1F]" />
              <h2 className="text-base font-bold text-[#0A1F1F]">Syllabus Coverage by Topic</h2>
            </div>
            <motion.div
              animate={{ rotate: expandedSections.syllabus ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-[#0A1F1F]" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {expandedSections.syllabus && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-3">
                  {syllabusTopics.map((topic, index) => (
                    <motion.div
                      key={topic.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + index * 0.05 }}
                      className="bg-white rounded-2xl p-3 border-3 border-[#E5DED6]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#0A1F1F] flex-1">{topic.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#0A1F1F] opacity-60">{topic.questions} Q</span>
                          <span className="text-sm font-bold" style={{ color: topic.color }}>
                            {topic.percentage}%
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#E5DED6] rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${topic.percentage}%` }}
                          transition={{ duration: 1, delay: 0.4 + index * 0.1 }}
                          className="h-full"
                          style={{ backgroundColor: topic.color }}
                        />
                      </div>
                    </motion.div>
                  ))}

                  {/* Low Coverage Alert */}
                  <div className="bg-[#FFB86C]/20 border-3 border-[#FFB86C] rounded-2xl p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-[#FFB86C] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-[#0A1F1F] mb-1">Low Coverage Alert</p>
                        <p className="text-[10px] text-[#0A1F1F] opacity-80 leading-tight">
                          Dynamic Programming (45%) needs more questions to meet coverage targets.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Reviewer Accuracy & Agreement */}
      <div className="mx-6 mb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-to-br from-[#8BE9FD] to-[#6FEDD6] rounded-[32px] border-4 border-white/30 overflow-hidden"
        >
          <motion.button
            onClick={() => toggleSection('reviewer')}
            className="w-full p-5 flex items-center justify-between"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-[#0A1F1F]" />
              <h2 className="text-base font-bold text-[#0A1F1F]">Reviewer Accuracy & Agreement</h2>
            </div>
            <motion.div
              animate={{ rotate: expandedSections.reviewer ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-[#0A1F1F]" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>

      {/* Questions by Subject */}
      <div className="mx-6 mb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#F5F1ED] rounded-[32px] border-4 border-[#E5DED6] overflow-hidden"
        >
          <motion.button
            onClick={() => toggleSection('bySubject')}
            className="w-full p-5 flex items-center justify-between"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-[#0A1F1F]" />
              <h2 className="text-base font-bold text-[#0A1F1F]">Questions by Subject</h2>
            </div>
            <motion.div
              animate={{ rotate: expandedSections.bySubject ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-[#0A1F1F]" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>

      {/* Export Button */}
      <div className="mx-6 mb-6 relative z-10">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-br from-[#8BE9FD] to-[#6FEDD6] rounded-2xl py-5 font-bold text-[#0A1F1F] flex items-center justify-center gap-3 border-4 border-white/30 relative overflow-hidden"
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Download className="w-6 h-6" />
          </motion.div>
          <span className="text-base">Export Full Report (PDF)</span>
        </motion.button>
      </div>
    </div>
  );
}
