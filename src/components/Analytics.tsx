import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Download, BarChart3, Target, BookOpen, Users, AlertTriangle, CheckCircle, FileText, TrendingUp, Loader2 } from 'lucide-react';
import { dashboardService } from '../services/api';

type Section = 'overview' | 'outcomes' | 'blooms' | 'coverage' | 'reviewers' | 'subjects';

export function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<Section>>(new Set(['overview']));
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportData = await dashboardService.getReports();
        setData(reportData);
      } catch (err) {
        console.error("Failed to fetch analytics reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const toggleSection = (section: Section) => {
    const newSections = new Set(expandedSections);
    if (newSections.has(section)) {
      newSections.delete(section);
    } else {
      newSections.add(section);
    }
    setExpandedSections(newSections);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#4A4A4A] animate-spin mb-4" />
        <p className="text-[#999999] font-bold text-sm">Generating Performance Reports...</p>
      </div>
    );
  }

  // Map backend data to local structure
  const overviewStats = [
    { label: 'Questions Generated', value: data?.overview?.generated?.toLocaleString() || '0', icon: FileText },
    { label: 'Questions Approved', value: data?.overview?.approved?.toLocaleString() || '0', icon: CheckCircle },
    { label: 'Questions Rejected', value: data?.overview?.rejected?.toLocaleString() || '0', icon: AlertTriangle },
    { label: 'Pending Review', value: data?.overview?.pending?.toLocaleString() || '0', icon: BookOpen },
  ];

  const learningOutcomes = data?.learningOutcomes || [];
  const bloomsData = data?.blooms || [];

  // Keep some mock data for sections not yet fully implemented in backend
  const topicCoverage = [
    { name: 'Introduction to Algorithms', questions: 120, percent: 95, status: 'good' },
    { name: 'Sorting & Searching', questions: 98, percent: 88, status: 'good' },
    { name: 'Data Structures', questions: 85, percent: 75, status: 'warning' },
    { name: 'Graph Algorithms', questions: 45, percent: 62, status: 'warning' },
    { name: 'Dynamic Programming', questions: 32, percent: 45, status: 'alert' },
  ];

  const reviewers = [
    { name: 'Dr. Smith', reviewed: 245, approved: 220, rejected: 25, rate: 90 },
    { name: 'Prof. Johnson', reviewed: 198, approved: 172, rejected: 26, rate: 87 },
  ];

  const subjectQuestions = [
    { name: 'Computer Science (CS301)', generated: 380, vetted: 420, total: 450 },
  ];

  const approvalRate = data?.overview?.approvalRate || 0;

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b-2 border-[#D0D0D0]">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#333333]">Reports & Analytics</h1>
          <button className="w-10 h-10 border-2 border-[#D0D0D0] rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-[#666666]" />
          </button>
        </div>
      </div>

      <div className="px-6 py-4 space-y-3">
        {/* Filter */}
        <div className="bg-white rounded-lg p-4 border-2 border-[#D0D0D0]">
          <label className="text-[10px] font-bold text-[#999999] uppercase mb-2 block tracking-wide">
            Filter by Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-[#F5F5F5] rounded-lg px-3 py-2.5 text-[#333333] text-sm border-2 border-[#D0D0D0] outline-none"
          >
            <option value="all">All Subjects</option>
            <option value="cs301">Computer Science (CS301)</option>
            <option value="math101">Mathematics (MAT101)</option>
            <option value="phys202">Physics (PHY201)</option>
          </select>
        </div>

        {/* Overview Statistics */}
        <CollapsibleSection
          title="Overview Statistics"
          icon={BarChart3}
          isExpanded={expandedSections.has('overview')}
          onToggle={() => toggleSection('overview')}
        >
          <div className="grid grid-cols-2 gap-3 mb-4">
            {overviewStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-[#F5F5F5] rounded-lg p-3 border-2 border-[#D0D0D0]"
                >
                  <Icon className="w-5 h-5 text-[#666666] mb-2" />
                  <div className="text-2xl font-bold text-[#333333]">{stat.value}</div>
                  <div className="text-[10px] text-[#999999] mt-1">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>

          <div className="bg-[#F5F5F5] rounded-lg p-4 border-2 border-[#D0D0D0]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-[#333333]">Approval Rate</span>
              <span className="text-xl font-bold text-[#333333]">87.5%</span>
            </div>
            <div className="h-3 bg-[#E8E8E8] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '87.5%' }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-[#4A4A4A] rounded-full"
              />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-[#666666]" />
              <span className="text-xs text-[#666666]">+5.2% from last month</span>
            </div>
          </div>
        </CollapsibleSection>

        {/* Learning Outcomes Analysis */}
        <CollapsibleSection
          title="Learning Outcomes Analysis"
          icon={Target}
          isExpanded={expandedSections.has('outcomes')}
          onToggle={() => toggleSection('outcomes')}
        >
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-[#333333]">Overall LO Coverage</span>
              <span className="text-lg font-bold text-[#333333]">88%</span>
            </div>
          </div>

          <div className="space-y-3">
            {learningOutcomes.map((lo: any, index: number) => (
              <motion.div
                key={lo.code}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#F5F5F5] rounded-lg p-3 border-2 border-[#D0D0D0]"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-[#4A4A4A] text-white rounded text-xs font-bold">
                      {lo.code}
                    </span>
                    <span className="text-xs font-medium text-[#333333]">{lo.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#333333]">
                      {lo.current}/{lo.target}
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-[#E8E8E8] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${lo.percent}%` }}
                    transition={{ duration: 1, delay: 0.2 + index * 0.05 }}
                    className="h-full bg-[#666666] rounded-full"
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className={`text-[10px] ${lo.percent >= 90 ? 'text-[#666666]' : 'text-[#999999]'}`}>
                    {lo.percent >= 90 ? '✓ On track' : lo.percent >= 70 ? '⚠ Needs attention' : '⚠ Needs more questions'}
                  </span>
                  <span className="text-[10px] text-[#999999]">{lo.percent}% of target</span>
                </div>
              </motion.div>
            ))}
          </div>

          {learningOutcomes.some((lo: any) => lo.percent < 70) && (
            <div className="mt-3 bg-[#FFF8E1] border-2 border-[#FFB74D] rounded-lg p-3">
              <div className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-[#F57C00] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[#E65100] mb-1">Critical Alert</p>
                  <p className="text-[10px] text-[#E65100] leading-relaxed">
                    LO4 & LO5 critically low. Generate more high-level cognitive questions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CollapsibleSection>

        {/* Cognitive Level Analysis (Bloom's) */}
        <CollapsibleSection
          title="Cognitive Level Analysis (Bloom's)"
          icon={BookOpen}
          isExpanded={expandedSections.has('blooms')}
          onToggle={() => toggleSection('blooms')}
        >
          <p className="text-xs text-[#999999] mb-4">Distribution of questions across Bloom's Taxonomy levels</p>

          <div className="mb-4">
            <div className="flex items-end justify-between gap-2 h-32 mb-2">
              {bloomsData.map((item: any, index: number) => (
                <div key={item.level} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col justify-end" style={{ height: '100%' }}>
                    <div className="text-xs font-bold text-[#333333] mb-1 text-center">
                      {item.percent}%
                    </div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${item.percent * 3}px` }}
                      transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                      className="w-full bg-[#666666] rounded-t"
                    />
                  </div>
                  <div className="text-[9px] text-[#999999] mt-2 text-center">
                    {item.level.slice(0, 4)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {bloomsData.map((item: any, index: number) => (
              <div key={item.level} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#666666] rounded-sm" />
                  <span className="text-xs text-[#333333]">{item.level}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#999999]">{item.count}</span>
                  <span className="text-sm font-bold text-[#333333] w-10 text-right">
                    {item.percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 bg-[#FFF8E1] border-2 border-[#FFB74D] rounded-lg p-3">
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F57C00] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[#E65100] mb-1">Balance Alert</p>
                <p className="text-[10px] text-[#E65100]">
                  Heavy focus on lower-level questions. Add more Evaluation and Synthesis.
                </p>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Syllabus Coverage by Topic */}
        <CollapsibleSection
          title="Syllabus Coverage by Topic"
          icon={FileText}
          isExpanded={expandedSections.has('coverage')}
          onToggle={() => toggleSection('coverage')}
        >
          <div className="space-y-3">
            {topicCoverage.map((topic, index) => (
              <motion.div
                key={topic.name}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#F5F5F5] rounded-lg p-3 border-2 border-[#D0D0D0]"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-[#333333] flex-1">{topic.name}</span>
                  <div className="text-right ml-3">
                    <div className="text-sm font-bold text-[#333333]">{topic.questions} Q</div>
                    <div className="text-xs text-[#666666]">{topic.percent}%</div>
                  </div>
                </div>
                <div className="h-2 bg-[#E8E8E8] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${topic.percent}%` }}
                    transition={{ duration: 1, delay: 0.2 + index * 0.05 }}
                    className={`h-full rounded-full ${topic.status === 'good' ? 'bg-[#666666]' :
                      topic.status === 'warning' ? 'bg-[#999999]' : 'bg-[#CCCCCC]'
                      }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {topicCoverage.some(t => t.status === 'alert') && (
            <div className="mt-3 bg-[#FFF8E1] border-2 border-[#FFB74D] rounded-lg p-3">
              <div className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-[#F57C00] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[#E65100] mb-1">Low Coverage Alert</p>
                  <p className="text-[10px] text-[#E65100]">
                    Dynamic Programming (45%) needs more questions to meet coverage targets.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CollapsibleSection>

        {/* Reviewer Accuracy & Agreement */}
        <CollapsibleSection
          title="Reviewer Accuracy & Agreement"
          icon={Users}
          isExpanded={expandedSections.has('reviewers')}
          onToggle={() => toggleSection('reviewers')}
        >
          <div className="bg-[#F5F5F5] rounded-lg p-3 border-2 border-[#D0D0D0] mb-4">
            <p className="text-xs text-[#666666] leading-relaxed">
              Agreement rate when multiple reviewers grade the same question
            </p>
            <div className="h-2 bg-[#E8E8E8] rounded-full overflow-hidden mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '91%' }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-[#666666] rounded-full"
              />
            </div>
            <div className="text-right mt-1">
              <span className="text-sm font-bold text-[#333333]">91% Agreement</span>
            </div>
          </div>

          <h3 className="text-xs font-bold text-[#999999] uppercase mb-3 tracking-wide">
            Individual Reviewer Stats
          </h3>

          <div className="space-y-3">
            {reviewers.map((reviewer, index) => (
              <motion.div
                key={reviewer.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#F5F5F5] rounded-lg p-3 border-2 border-[#D0D0D0]"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-sm text-[#333333]">{reviewer.name}</span>
                  <span className="text-xs text-[#666666]">{reviewer.rate}% agreement</span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-2">
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#333333]">{reviewer.reviewed}</div>
                    <div className="text-[9px] text-[#999999]">Reviewed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#333333]">{reviewer.approved}</div>
                    <div className="text-[9px] text-[#999999]">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#333333]">{reviewer.rejected}</div>
                    <div className="text-[9px] text-[#999999]">Rejected</div>
                  </div>
                </div>

                <div className="h-2 bg-[#E8E8E8] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${reviewer.rate}%` }}
                    transition={{ duration: 1, delay: 0.3 + index * 0.05 }}
                    className="h-full bg-[#666666] rounded-full"
                  />
                </div>
                <div className="text-right mt-1">
                  <span className="text-xs text-[#999999]">Approval Rate: {reviewer.rate}%</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-3 bg-[#E8F5E9] border-2 border-[#81C784] rounded-lg p-3">
            <div className="flex gap-2">
              <CheckCircle className="w-4 h-4 text-[#388E3C] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[#1B5E20] mb-1">High Consistency</p>
                <p className="text-[10px] text-[#1B5E20]">
                  Reviewer agreement is above 90%, indicating consistent grading standards.
                </p>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Questions by Subject */}
        <CollapsibleSection
          title="Questions by Subject"
          icon={BarChart3}
          isExpanded={expandedSections.has('subjects')}
          onToggle={() => toggleSection('subjects')}
        >
          <div className="space-y-3">
            {subjectQuestions.map((subject, index) => (
              <motion.div
                key={subject.name}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#F5F5F5] rounded-lg p-3 border-2 border-[#D0D0D0]"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-[#333333]">{subject.name}</span>
                  <span className="text-xl font-bold text-[#333333]">{subject.total}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#999999]">Generated:</span>
                    <span className="font-semibold text-[#333333]">{subject.generated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#999999]">Vetted:</span>
                    <span className="font-semibold text-[#333333]">{subject.vetted}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CollapsibleSection>

        {/* Export Button */}
        <button className="w-full bg-[#4A4A4A] rounded-lg py-4 text-white font-bold flex items-center justify-center gap-2 border-2 border-[#333333]">
          <Download className="w-5 h-5" />
          Export Full Report (PDF)
        </button>
      </div>
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  icon: any;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ title, icon: Icon, isExpanded, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="bg-white rounded-lg border-2 border-[#D0D0D0] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-[#E8E8E8] border-b-2 border-[#D0D0D0]"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-[#666666]" />
          <span className="font-semibold text-sm text-[#333333]">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[#666666]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#666666]" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
