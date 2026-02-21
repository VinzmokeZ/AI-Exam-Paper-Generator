import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, BarChart3, FileText, CheckCircle2, XCircle, Clock,
  TrendingUp, Target, Brain, BookOpen, Users, Download, ChevronDown,
  ChevronUp, AlertTriangle, Sparkles, Loader2, Trash2, Eye, Search, X
} from 'lucide-react';
import { dashboardService, historyService, subjectService } from '../services/api';
import { toast } from 'sonner';
import { DEFAULT_SUBJECTS } from '../constants/defaultData';
import { ExamStructurePreview } from './ExamStructurePreview';

export function Reports() {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    learningOutcomes: true,
    blooms: true,
    syllabus: false,
    reviewer: false,
    bySubject: false,
    history: true,
  });
  const [reportData, setReportData] = useState<any>(null);
  const [paperHistory, setPaperHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [viewingPaper, setViewingPaper] = useState<any | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reports, history, backendSubjects] = await Promise.all([
          dashboardService.getReports(),
          historyService.getHistory(),
          subjectService.getAll()
        ]);
        setReportData(reports);
        if (Array.isArray(history)) {
          setPaperHistory(history);
        }

        // Merge logic: Combine DEFAULT_SUBJECTS with backend subjects
        const backendCodes = new Set(backendSubjects.map((s: any) => s.code.toUpperCase()));
        const uniqueDefaults = DEFAULT_SUBJECTS.filter(d => !backendCodes.has(d.code.toUpperCase()));
        const combined = [...uniqueDefaults, ...backendSubjects];
        setSubjects(combined);

      } catch (error) {
        console.error("Failed to fetch reports/history/subjects:", error);
        toast.error("Failed to load analytics data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  // Analytics Data (Fallback to static if loading or error)
  const overviewStats = [
    { label: 'Questions Generated', value: reportData?.overview?.generated?.toLocaleString() || '0', icon: FileText, color: '#8BE9FD', bg: '#8BE9FD20' },
    { label: 'Questions Approved', value: reportData?.overview?.approved?.toLocaleString() || '0', icon: CheckCircle2, color: '#50FA7B', bg: '#50FA7B20' },
    { label: 'Questions Rejected', value: reportData?.overview?.rejected?.toLocaleString() || '0', icon: XCircle, color: '#FF6AC1', bg: '#FF6AC120' },
    { label: 'Pending Review', value: reportData?.overview?.pending?.toLocaleString() || '0', icon: Clock, color: '#FFB86C', bg: '#FFB86C20' },
  ];

  const LO_META: Record<string, any> = {
    'LO1': { name: 'Understand fundamentals', color: '#8BE9FD' },
    'LO2': { name: 'Apply knowledge', color: '#C5B3E6' },
    'LO3': { name: 'Analyze problems', color: '#FFB86C' },
    'LO4': { name: 'Design solutions', color: '#50FA7B' },
    'LO5': { name: 'Evaluate approaches', color: '#FF6AC1' }
  };

  const learningOutcomes = (reportData?.learningOutcomes || []).map((lo: any) => ({
    ...lo,
    name: LO_META[lo.code]?.name || 'Unknown LO',
    color: LO_META[lo.code]?.color || '#8B9E9E',
    status: lo.percent >= 80 ? 'On track' : (lo.percent >= 50 ? 'Needs review' : 'Needs more questions'),
    percentage: lo.percent
  }));

  const BLOOMS_META: Record<string, any> = {
    'Knowledge': { shortName: 'Know', color: '#8BE9FD' },
    'Comprehension': { shortName: 'Comp', color: '#C5B3E6' },
    'Application': { shortName: 'Appl', color: '#8BE9FD' },
    'Analysis': { shortName: 'Anal', color: '#FFB86C' },
    'Synthesis': { shortName: 'Synt', color: '#50FA7B' },
    'Evaluation': { shortName: 'Eval', color: '#FF6AC1' }
  };

  const bloomsData = (reportData?.blooms || []).map((b: any) => ({
    ...b,
    shortName: BLOOMS_META[b.level]?.shortName || b.level.substring(0, 4),
    color: BLOOMS_META[b.level]?.color || '#8B9E9E'
  }));

  const syllabusTopics = [
    { name: 'Introduction to Algorithms', questions: 120, percentage: 95, color: '#50FA7B' },
    { name: 'Sorting & Searching', questions: 98, percentage: 88, color: '#50FA7B' },
    { name: 'Data Structures', questions: 85, percentage: 75, color: '#FFB86C' },
    { name: 'Graph Algorithms', questions: 45, percentage: 62, color: '#FFB86C' },
    { name: 'Dynamic Programming', questions: 32, percentage: 45, color: '#FF6AC1', alert: true },
    { name: 'Hashing', questions: 70, percentage: 80, color: '#50FA7B' },
  ];

  const maxCount = reportData?.blooms ? Math.max(...reportData.blooms.map((d: any) => d.count)) : 0;

  const handleDeleteHistory = async (id: number) => {
    try {
      await historyService.deleteHistory(id);
      setPaperHistory(prev => prev.filter(p => p.id !== id));
      toast.success("History deleted successfully");
    } catch (error) {
      console.error("Failed to delete history:", error);
      toast.error("Failed to delete history");
    }
  };

  /*
   * PDF Download Handler
   */
  const handlePhysicalDownload = (paper: any) => {
    try {
      const subjectName = paper.subject_name || paper.subject || 'Exam';
      const topicName = paper.topic_name || `Exam_${paper.id}`;
      const questionsData = Array.isArray(paper.questions) ? paper.questions : [];

      import('../services/pdfGenerator').then(({ generateExamPDF }) => {
        generateExamPDF({
          subject_name: subjectName,
          topic_name: topicName,
          questions: questionsData,
          total_marks: paper.marks || paper.total_marks || 0,
          duration: paper.duration || 60,
          generated_date: paper.created_at || paper.date
        });
        toast.success("Exam PDF downloading...");
      });
    } catch (e) {
      console.error("PDF Generation failed:", e);
      toast.error("Failed to generate PDF");
    }
  };


  const handleExportFullReport = () => {
    try {
      const data = {
        overview: reportData?.overview || {
          generated: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          approvalRate: 0
        },
        learningOutcomes: learningOutcomes,
        blooms: bloomsData,
        syllabus: syllabusTopics
      };

      import('../services/reportGenerator').then(({ generateReportPDF }) => {
        generateReportPDF(data);
        toast.success("Generating Analytics Report PDF...");
      });
    } catch (e) {
      console.error("Report export failed:", e);
      toast.error("Failed to export report");
    }
  };

  if (viewingPaper) {
    return (
      <ExamStructurePreview
        questions={viewingPaper.questions || []}
        subjectName={viewingPaper.subject_name || viewingPaper.subject || 'Exam'}
        rubricName={viewingPaper.rubric_name || viewingPaper.topic_name}
        onBack={() => setViewingPaper(null)}
      />
    );
  }

  return (
    <div className="min-h-full pb-6">
      {/* Floating background elements */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-[#8BE9FD]/10 rounded-full blur-3xl float-slow" />
      <div className="absolute bottom-40 right-10 w-36 h-36 bg-[#C5B3E6]/10 rounded-full blur-3xl float-slow float-delay-1" />

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
              onClick={() => window.print()}
              className="w-10 h-10 bg-[#8BE9FD]/20 rounded-xl flex items-center justify-center print:hidden"
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
          <div className="relative">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-white rounded-xl px-4 py-3 text-[#0A1F1F] text-sm border-3 border-[#E5DED6] outline-none font-bold appearance-none cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.code.toLowerCase()}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-5 h-5 text-[#8B9E9E]" />
            </div>
          </div>
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
                      <span className="text-2xl font-bold text-[#50FA7B]">{reportData?.overview?.approvalRate || 0}%</span>
                    </div>
                    <div className="bg-white/30 rounded-full h-3 overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${reportData?.overview?.approvalRate || 0}%` }}
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

      {/* Question Paper History */}
      <div className="mx-6 mb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-gradient-to-br from-[#8BE9FD] to-[#C5B3E6] rounded-[32px] border-4 border-white/30 overflow-hidden"
        >
          <motion.button
            onClick={() => toggleSection('history')}
            className="w-full p-5 flex items-center justify-between"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-[#0A1F1F]" />
              <h2 className="text-base font-bold text-[#0A1F1F]">Question Paper History</h2>
            </div>
            <motion.div
              animate={{ rotate: expandedSections.history ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-[#0A1F1F]" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {expandedSections.history && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-3">
                  {/* History Search Bar */}
                  <div className="bg-white/40 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-3 border-2 border-white/40 mb-2">
                    <Search className="w-4 h-4 text-[#0A1F1F]/60" />
                    <input
                      type="text"
                      placeholder="Search history..."
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-[#0A1F1F] placeholder:text-[#0A1F1F]/40 text-xs font-bold"
                    />
                    {historySearchQuery && (
                      <button onClick={() => setHistorySearchQuery('')}>
                        <X className="w-4 h-4 text-[#0A1F1F]/40" />
                      </button>
                    )}
                  </div>

                  {paperHistory
                    .filter(paper =>
                      historySearchQuery === '' ||
                      (paper.topic_name || paper.name || '').toLowerCase().includes(historySearchQuery.toLowerCase()) ||
                      (paper.subject_name || paper.subject || '').toLowerCase().includes(historySearchQuery.toLowerCase())
                    )
                    .length === 0 ? (
                    <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 text-center text-[#0A1F1F]/60 text-sm">
                      {historySearchQuery ? 'No matching papers found.' : 'No generated papers found.'}
                    </div>
                  ) : (
                    paperHistory
                      .filter(paper =>
                        historySearchQuery === '' ||
                        (paper.topic_name || paper.name || '').toLowerCase().includes(historySearchQuery.toLowerCase()) ||
                        (paper.subject_name || paper.subject || '').toLowerCase().includes(historySearchQuery.toLowerCase())
                      )
                      .map((paper: any, index: number) => (
                        <motion.div
                          key={paper.id || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                          className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/40 group overflow-hidden relative"
                        >
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex-1 min-w-0 pr-3">
                              <h3 className="font-black text-[#0A1F1F] text-sm mb-1 truncate" title={paper.topic_name || paper.name || `Exam ${paper.id}`}>
                                {paper.topic_name || paper.name || `Exam ${paper.id}`}
                              </h3>
                              <p className="text-[10px] text-[#0A1F1F] opacity-60 font-bold uppercase truncate" title={paper.subject_name || paper.subject || 'Subject'}>
                                {paper.subject_name || paper.subject || 'Subject'} • {paper.questions_count || paper.question_count || paper.qs || 0} QS • {paper.marks || paper.total_marks || 0} MARKS
                              </p>
                              <p className="text-[9px] text-[#0A1F1F] opacity-40 font-medium truncate">
                                Generated on {paper.created_at ? new Date(paper.created_at).toLocaleDateString() : (paper.date || 'Unknown Date')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  handlePhysicalDownload(paper);
                                  setViewingPaper(paper);
                                  // Small delay to allow render before printing
                                  setTimeout(() => window.print(), 1000);
                                }}
                                className="w-8 h-8 bg-[#50FA7B]/20 rounded-lg flex items-center justify-center"
                                title="Download PDF"
                              >
                                <Download className="w-4 h-4 text-[#50FA7B]" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setViewingPaper(paper)}
                                className="w-8 h-8 bg-[#8BE9FD]/20 rounded-lg flex items-center justify-center"
                                title="View"
                              >
                                <Eye className="w-4 h-4 text-[#8BE9FD]" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteHistory(paper.id)}
                                className="w-8 h-8 bg-[#FF6AC1]/20 rounded-lg flex items-center justify-center"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-[#FF6AC1]" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                  )}
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
                    {learningOutcomes.map((lo: any, index: number) => (
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
                              {lo.current}/{lo.target}
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
                      {bloomsData.map((item: any, index: number) => (
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
                    {bloomsData.map((item: any, index: number) => (
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

      <div className="mx-6 mb-6 relative z-10 print:hidden">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExportFullReport}
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

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white !important; color: black !important; }
          .bg-gradient-to-br { background: none !important; border: 1px solid #ccc !important; }
          .text-white, .text-\\[\\#F5F1ED\\] { color: black !important; }
        }
      `}</style>
    </div>
  );
}
