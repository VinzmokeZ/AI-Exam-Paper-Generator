import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Save, X, Target, BookOpen, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

export function CreateRubric() {
  const navigate = useNavigate();
  const [showExceedPopup, setShowExceedPopup] = useState(false);
  
  // Rubric metadata
  const [rubricName, setRubricName] = useState('');
  const [duration, setDuration] = useState(180); // minutes
  const [selectedSubject, setSelectedSubject] = useState('');

  // MAP 1: Question Types Distribution
  const [mcqCount, setMcqCount] = useState(10);
  const [mcqMarks, setMcqMarks] = useState(2);
  const [essayCount, setEssayCount] = useState(5);
  const [essayMarks, setEssayMarks] = useState(10);
  const [shortAnswerCount, setShortAnswerCount] = useState(8);
  const [shortAnswerMarks, setShortAnswerMarks] = useState(5);
  const [caseStudyCount, setCaseStudyCount] = useState(2);
  const [caseStudyMarks, setCaseStudyMarks] = useState(15);

  // MAP 2: Learning Outcomes Distribution (percentages)
  const [co1Percent, setCo1Percent] = useState(25);
  const [co2Percent, setCo2Percent] = useState(25);
  const [co3Percent, setCo3Percent] = useState(20);
  const [co4Percent, setCo4Percent] = useState(20);
  const [co5Percent, setCo5Percent] = useState(10);

  const totalQuestions = mcqCount + essayCount + shortAnswerCount + caseStudyCount;
  const totalMarks = (mcqCount * mcqMarks) + (essayCount * essayMarks) + (shortAnswerCount * shortAnswerMarks) + (caseStudyCount * caseStudyMarks);
  const totalLOPercentage = co1Percent + co2Percent + co3Percent + co4Percent + co5Percent;

  // Check if total exceeds 100% and show popup
  const handleCOPercentChange = (setter: (val: number) => void, value: number) => {
    setter(value);
    // Check after state update
    setTimeout(() => {
      const newTotal = co1Percent + co2Percent + co3Percent + co4Percent + co5Percent;
      if (newTotal > 100 && !showExceedPopup) {
        setShowExceedPopup(true);
        // Auto-hide after 3 seconds
        setTimeout(() => setShowExceedPopup(false), 3000);
      }
    }, 0);
  };

  const handleSaveRubric = () => {
    // Navigate to generate page after saving
    navigate('/generate');
  };

  const handleCancel = () => {
    navigate('/generate');
  };

  const handleExceedPopupClose = () => {
    setShowExceedPopup(false);
  };

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
          <div className="flex items-center gap-3 mb-4">
            <Link to="/generate">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-[#0A1F1F] rounded-xl flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 text-[#F5F1ED]" />
              </motion.div>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-[#F5F1ED]">Create Rubric</h1>
              <p className="text-xs text-[#8B9E9E] font-medium">Design your exam template</p>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Save className="w-8 h-8 text-[#C5B3E6]" />
            </motion.div>
          </div>

          {/* Rubric Name Input */}
          <div className="bg-[#0A1F1F] rounded-2xl p-4 border-2 border-[#0D3D3D]">
            <label className="text-[10px] font-bold text-[#8B9E9E] uppercase mb-2 block">
              Rubric Name
            </label>
            <input
              type="text"
              value={rubricName}
              onChange={(e) => setRubricName(e.target.value)}
              placeholder="E.g., Final Exam Template"
              className="w-full bg-[#0D3D3D] rounded-xl px-4 py-3 text-[#F5F1ED] text-sm outline-none font-medium placeholder:text-[#8B9E9E]"
            />
          </div>
        </motion.div>
      </div>

      {/* MAP 1: Question Types Distribution */}
      <div className="mx-6 mb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#0D2626] to-[#0A1F1F] rounded-[32px] border-4 border-[#0A1F1F] overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 flex items-center gap-3 border-b-2 border-[#0D3D3D]">
            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <BookOpen className="w-6 h-6 text-[#8BE9FD]" />
            </motion.div>
            <h2 className="text-base font-bold text-[#F5F1ED]">MAP 1: Question Types Distribution</h2>
          </div>

          {/* Question Types */}
          <div className="px-5 pb-5 pt-4 space-y-4">
            {/* MCQ */}
            <motion.div
              key="MCQ"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-[#0A1F1F] rounded-2xl p-4 border-3 border-[#0D3D3D] relative overflow-hidden"
            >
              {/* Subtle glow effect */}
              <motion.div
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl"
                style={{ boxShadow: `0 0 30px #8BE9FD30` }}
              />
              
              {/* Type Header */}
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    style={{ backgroundColor: '#8BE9FD' }}
                  >
                    ≋
                  </motion.div>
                  <span className="text-sm font-bold text-[#F5F1ED]">MCQ</span>
                </div>
                <motion.span 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-base font-bold" 
                  style={{ color: '#8BE9FD' }}
                >
                  {mcqCount * mcqMarks} marks
                </motion.span>
              </div>

              {/* Sliders */}
              <div className="space-y-3 relative z-10">
                {/* Count Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] text-[#8B9E9E] font-bold uppercase">Count</label>
                    <motion.span 
                      key={mcqCount}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="text-sm font-bold px-2 py-0.5 rounded-lg"
                      style={{ color: '#8BE9FD', backgroundColor: '#8BE9FD20' }}
                    >
                      {mcqCount}
                    </motion.span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={mcqCount}
                      onChange={(e) => setMcqCount(parseInt(e.target.value))}
                      className="w-full h-2.5 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #8BE9FD 0%, #8BE9FD ${(mcqCount / 50) * 100}%, #0D3D3D ${(mcqCount / 50) * 100}%, #0D3D3D 100%)`
                      }}
                    />
                  </div>
                </div>

                {/* Marks Each */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] text-[#8B9E9E] font-bold uppercase">Marks Each</label>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={mcqMarks}
                    onChange={(e) => setMcqMarks(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#0D3D3D] rounded-xl px-4 py-2 text-sm text-[#F5F1ED] font-bold border-2 border-[#0A1F1F] outline-none text-center focus:border-opacity-50"
                    style={{ borderColor: '#8BE9FD40' }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Essay */}
            <motion.div
              key="Essay"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#0A1F1F] rounded-2xl p-4 border-3 border-[#0D3D3D] relative overflow-hidden"
            >
              {/* Subtle glow effect */}
              <motion.div
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl"
                style={{ boxShadow: `0 0 30px #C5B3E630` }}
              />
              
              {/* Type Header */}
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    style={{ backgroundColor: '#C5B3E6' }}
                  >
                    📄
                  </motion.div>
                  <span className="text-sm font-bold text-[#F5F1ED]">Essay</span>
                </div>
                <motion.span 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-base font-bold" 
                  style={{ color: '#C5B3E6' }}
                >
                  {essayCount * essayMarks} marks
                </motion.span>
              </div>

              {/* Sliders */}
              <div className="space-y-3 relative z-10">
                {/* Count Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] text-[#8B9E9E] font-bold uppercase">Count</label>
                    <motion.span 
                      key={essayCount}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="text-sm font-bold px-2 py-0.5 rounded-lg"
                      style={{ color: '#C5B3E6', backgroundColor: '#C5B3E620' }}
                    >
                      {essayCount}
                    </motion.span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={essayCount}
                      onChange={(e) => setEssayCount(parseInt(e.target.value))}
                      className="w-full h-2.5 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #C5B3E6 0%, #C5B3E6 ${(essayCount / 50) * 100}%, #0D3D3D ${(essayCount / 50) * 100}%, #0D3D3D 100%)`
                      }}
                    />
                  </div>
                </div>

                {/* Marks Each */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] text-[#8B9E9E] font-bold uppercase">Marks Each</label>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={essayMarks}
                    onChange={(e) => setEssayMarks(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#0D3D3D] rounded-xl px-4 py-2 text-sm text-[#F5F1ED] font-bold border-2 border-[#0A1F1F] outline-none text-center focus:border-opacity-50"
                    style={{ borderColor: '#C5B3E640' }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Short Answer */}
            <motion.div
              key="Short Answer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-[#0A1F1F] rounded-2xl p-4 border-3 border-[#0D3D3D] relative overflow-hidden"
            >
              {/* Subtle glow effect */}
              <motion.div
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl"
                style={{ boxShadow: `0 0 30px #50FA7B30` }}
              />
              
              {/* Type Header */}
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    style={{ backgroundColor: '#50FA7B' }}
                  >
                    ✎
                  </motion.div>
                  <span className="text-sm font-bold text-[#F5F1ED]">Short Answer</span>
                </div>
                <motion.span 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-base font-bold" 
                  style={{ color: '#50FA7B' }}
                >
                  {shortAnswerCount * shortAnswerMarks} marks
                </motion.span>
              </div>

              {/* Sliders */}
              <div className="space-y-3 relative z-10">
                {/* Count Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] text-[#8B9E9E] font-bold uppercase">Count</label>
                    <motion.span 
                      key={shortAnswerCount}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="text-sm font-bold px-2 py-0.5 rounded-lg"
                      style={{ color: '#50FA7B', backgroundColor: '#50FA7B20' }}
                    >
                      {shortAnswerCount}
                    </motion.span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={shortAnswerCount}
                      onChange={(e) => setShortAnswerCount(parseInt(e.target.value))}
                      className="w-full h-2.5 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #50FA7B 0%, #50FA7B ${(shortAnswerCount / 50) * 100}%, #0D3D3D ${(shortAnswerCount / 50) * 100}%, #0D3D3D 100%)`
                      }}
                    />
                  </div>
                </div>

                {/* Marks Each */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] text-[#8B9E9E] font-bold uppercase">Marks Each</label>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={shortAnswerMarks}
                    onChange={(e) => setShortAnswerMarks(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#0D3D3D] rounded-xl px-4 py-2 text-sm text-[#F5F1ED] font-bold border-2 border-[#0A1F1F] outline-none text-center focus:border-opacity-50"
                    style={{ borderColor: '#50FA7B40' }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Case Study */}
            <motion.div
              key="Case Study"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#0A1F1F] rounded-2xl p-4 border-3 border-[#0D3D3D] relative overflow-hidden"
            >
              {/* Subtle glow effect */}
              <motion.div
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl"
                style={{ boxShadow: `0 0 30px #FFB86C30` }}
              />
              
              {/* Type Header */}
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    style={{ backgroundColor: '#FFB86C' }}
                  >
                    📚
                  </motion.div>
                  <span className="text-sm font-bold text-[#F5F1ED]">Case Study</span>
                </div>
                <motion.span 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-base font-bold" 
                  style={{ color: '#FFB86C' }}
                >
                  {caseStudyCount * caseStudyMarks} marks
                </motion.span>
              </div>

              {/* Sliders */}
              <div className="space-y-3 relative z-10">
                {/* Count Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] text-[#8B9E9E] font-bold uppercase">Count</label>
                    <motion.span 
                      key={caseStudyCount}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="text-sm font-bold px-2 py-0.5 rounded-lg"
                      style={{ color: '#FFB86C', backgroundColor: '#FFB86C20' }}
                    >
                      {caseStudyCount}
                    </motion.span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={caseStudyCount}
                      onChange={(e) => setCaseStudyCount(parseInt(e.target.value))}
                      className="w-full h-2.5 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #FFB86C 0%, #FFB86C ${(caseStudyCount / 50) * 100}%, #0D3D3D ${(caseStudyCount / 50) * 100}%, #0D3D3D 100%)`
                      }}
                    />
                  </div>
                </div>

                {/* Marks Each */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] text-[#8B9E9E] font-bold uppercase">Marks Each</label>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={caseStudyMarks}
                    onChange={(e) => setCaseStudyMarks(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#0D3D3D] rounded-xl px-4 py-2 text-sm text-[#F5F1ED] font-bold border-2 border-[#0A1F1F] outline-none text-center focus:border-opacity-50"
                    style={{ borderColor: '#FFB86C40' }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Total Summary */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-[#0A1F1F]/60 backdrop-blur-sm rounded-2xl p-4 border-3 border-[#8BE9FD]/30 relative overflow-hidden"
            >
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 w-20 h-full bg-gradient-to-r from-transparent via-[#8BE9FD]/10 to-transparent"
              />
              <div className="flex items-center justify-between relative z-10">
                <span className="text-sm font-bold text-[#8BE9FD]">Total</span>
                <span className="text-base font-bold text-[#F5F1ED]">
                  {totalQuestions} Questions • {totalMarks} Marks
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* MAP 2: Learning Outcomes Distribution */}
      <div className="mx-6 mb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#0D2626] to-[#0A1F1F] rounded-[32px] border-4 border-[#0A1F1F] overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 flex items-center justify-between border-b-2 border-[#0D3D3D]">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                <Target className="w-6 h-6 text-[#50FA7B]" />
              </motion.div>
              <h2 className="text-base font-bold text-[#F5F1ED]">MAP 2: Learning Outcomes Distribution</h2>
            </div>
            <motion.div
              animate={{ scale: totalLOPercentage === 100 ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.5 }}
              className={`px-3 py-1.5 rounded-xl font-bold text-sm ${
                totalLOPercentage === 100 ? 'bg-[#50FA7B] text-[#0A1F1F]' : 'bg-[#0D3D3D] text-[#F5F1ED]'
              }`}
            >
              {totalLOPercentage}%
            </motion.div>
          </div>

          {/* Description */}
          <div className="px-5 py-4">
            <p className="text-xs text-[#8B9E9E]">
              Define what percentage of questions should assess each Learning Outcome
            </p>
          </div>

          {/* Learning Outcomes */}
          <div className="px-5 pb-5 space-y-4">
            {/* CO1 */}
            <motion.div
              key="CO1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-[#0A1F1F] rounded-2xl p-4 border-3 border-[#0D3D3D] relative overflow-hidden"
            >
              {/* Subtle glow */}
              <motion.div
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                className="absolute inset-0 rounded-2xl"
                style={{ boxShadow: `0 0 30px #8BE9FD30` }}
              />

              {/* LO Header */}
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-2">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs text-white shadow-lg"
                    style={{ backgroundColor: '#8BE9FD' }}
                  >
                    CO1
                  </motion.div>
                  <span className="text-sm font-semibold text-[#F5F1ED]">Understand fundamental concepts</span>
                </div>
                <motion.span 
                  key={co1Percent}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-bold" 
                  style={{ color: '#8BE9FD' }}
                >
                  {co1Percent}%
                </motion.span>
              </div>

              {/* Description */}
              <p className="text-[10px] text-[#8B9E9E] mb-3 italic relative z-10">Recall and comprehend basic principles</p>

              {/* Slider */}
              <div className="relative z-10">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={co1Percent}
                  onChange={(e) => handleCOPercentChange(setCo1Percent, parseInt(e.target.value))}
                  className="w-full h-2.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #8BE9FD 0%, #8BE9FD ${co1Percent}%, #0D3D3D ${co1Percent}%, #0D3D3D 100%)`
                  }}
                />
              </div>
            </motion.div>

            {/* CO2 */}
            <motion.div
              key="CO2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#0A1F1F] rounded-2xl p-4 border-3 border-[#0D3D3D] relative overflow-hidden"
            >
              {/* Subtle glow */}
              <motion.div
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                className="absolute inset-0 rounded-2xl"
                style={{ boxShadow: `0 0 30px #C5B3E630` }}
              />

              {/* LO Header */}
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-2">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs text-white shadow-lg"
                    style={{ backgroundColor: '#C5B3E6' }}
                  >
                    CO2
                  </motion.div>
                  <span className="text-sm font-semibold text-[#F5F1ED]">Apply theoretical knowledge</span>
                </div>
                <motion.span 
                  key={co2Percent}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-bold" 
                  style={{ color: '#C5B3E6' }}
                >
                  {co2Percent}%
                </motion.span>
              </div>

              {/* Description */}
              <p className="text-[10px] text-[#8B9E9E] mb-3 italic relative z-10">Use concepts in practical scenarios</p>

              {/* Slider */}
              <div className="relative z-10">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={co2Percent}
                  onChange={(e) => handleCOPercentChange(setCo2Percent, parseInt(e.target.value))}
                  className="w-full h-2.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #C5B3E6 0%, #C5B3E6 ${co2Percent}%, #0D3D3D ${co2Percent}%, #0D3D3D 100%)`
                  }}
                />
              </div>
            </motion.div>

            {/* CO3 */}
            <motion.div
              key="CO3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-[#0A1F1F] rounded-2xl p-4 border-3 border-[#0D3D3D] relative overflow-hidden"
            >
              {/* Subtle glow */}
              <motion.div
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                className="absolute inset-0 rounded-2xl"
                style={{ boxShadow: `0 0 30px #FFB86C30` }}
              />

              {/* LO Header */}
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-2">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs text-white shadow-lg"
                    style={{ backgroundColor: '#FFB86C' }}
                  >
                    CO3
                  </motion.div>
                  <span className="text-sm font-semibold text-[#F5F1ED]">Analyze and solve problems</span>
                </div>
                <motion.span 
                  key={co3Percent}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-bold" 
                  style={{ color: '#FFB86C' }}
                >
                  {co3Percent}%
                </motion.span>
              </div>

              {/* Description */}
              <p className="text-[10px] text-[#8B9E9E] mb-3 italic relative z-10">Break down complex problems</p>

              {/* Slider */}
              <div className="relative z-10">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={co3Percent}
                  onChange={(e) => handleCOPercentChange(setCo3Percent, parseInt(e.target.value))}
                  className="w-full h-2.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #FFB86C 0%, #FFB86C ${co3Percent}%, #0D3D3D ${co3Percent}%, #0D3D3D 100%)`
                  }}
                />
              </div>
            </motion.div>

            {/* CO4 */}
            <motion.div
              key="CO4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#0A1F1F] rounded-2xl p-4 border-3 border-[#0D3D3D] relative overflow-hidden"
            >
              {/* Subtle glow */}
              <motion.div
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
                className="absolute inset-0 rounded-2xl"
                style={{ boxShadow: `0 0 30px #50FA7B30` }}
              />

              {/* LO Header */}
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-2">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs text-white shadow-lg"
                    style={{ backgroundColor: '#50FA7B' }}
                  >
                    CO4
                  </motion.div>
                  <span className="text-sm font-semibold text-[#F5F1ED]">Design and implement solutions</span>
                </div>
                <motion.span 
                  key={co4Percent}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-bold" 
                  style={{ color: '#50FA7B' }}
                >
                  {co4Percent}%
                </motion.span>
              </div>

              {/* Description */}
              <p className="text-[10px] text-[#8B9E9E] mb-3 italic relative z-10">Create new approaches</p>

              {/* Slider */}
              <div className="relative z-10">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={co4Percent}
                  onChange={(e) => handleCOPercentChange(setCo4Percent, parseInt(e.target.value))}
                  className="w-full h-2.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #50FA7B 0%, #50FA7B ${co4Percent}%, #0D3D3D ${co4Percent}%, #0D3D3D 100%)`
                  }}
                />
              </div>
            </motion.div>

            {/* CO5 */}
            <motion.div
              key="CO5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-[#0A1F1F] rounded-2xl p-4 border-3 border-[#0D3D3D] relative overflow-hidden"
            >
              {/* Subtle glow */}
              <motion.div
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.0 }}
                className="absolute inset-0 rounded-2xl"
                style={{ boxShadow: `0 0 30px #FF6AC130` }}
              />

              {/* LO Header */}
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-2">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs text-white shadow-lg"
                    style={{ backgroundColor: '#FF6AC1' }}
                  >
                    CO5
                  </motion.div>
                  <span className="text-sm font-semibold text-[#F5F1ED]">Evaluate and optimize</span>
                </div>
                <motion.span 
                  key={co5Percent}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-bold" 
                  style={{ color: '#FF6AC1' }}
                >
                  {co5Percent}%
                </motion.span>
              </div>

              {/* Description */}
              <p className="text-[10px] text-[#8B9E9E] mb-3 italic relative z-10">Assess and improve solutions</p>

              {/* Slider */}
              <div className="relative z-10">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={co5Percent}
                  onChange={(e) => handleCOPercentChange(setCo5Percent, parseInt(e.target.value))}
                  className="w-full h-2.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #FF6AC1 0%, #FF6AC1 ${co5Percent}%, #0D3D3D ${co5Percent}%, #0D3D3D 100%)`
                  }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Rubric Summary */}
      <div className="mx-6 mb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0A1F1F] rounded-2xl p-5 border-4 border-[#0D3D3D]"
        >
          <h3 className="text-sm font-bold text-[#8B9E9E] uppercase mb-4">Rubric Summary</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#8B9E9E] mb-1">Total Questions:</p>
              <p className="text-2xl font-bold text-[#F5F1ED]">{totalQuestions}</p>
            </div>
            <div>
              <p className="text-xs text-[#8B9E9E] mb-1">Total Marks:</p>
              <p className="text-2xl font-bold text-[#F5F1ED]">{totalMarks}</p>
            </div>
            <div>
              <p className="text-xs text-[#8B9E9E] mb-1">Duration:</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  className="w-20 bg-[#0D3D3D] rounded-lg px-3 py-1.5 text-sm font-bold text-[#F5F1ED] border-2 border-[#0A1F1F] outline-none"
                />
                <span className="text-sm font-bold text-[#8B9E9E]">min</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-[#8B9E9E] mb-1">Subject:</p>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-[#0D3D3D] rounded-lg px-3 py-1.5 text-sm font-bold text-[#F5F1ED] border-2 border-[#0A1F1F] outline-none"
              >
                <option value="CS301">CS301</option>
                <option value="MATH101">MATH101</option>
                <option value="PHYS202">PHYS202</option>
              </select>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="mx-6 space-y-3 relative z-10">
        {/* Save Rubric */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSaveRubric}
          className="w-full bg-gradient-to-br from-[#50FA7B] to-[#6FEDD6] rounded-2xl py-5 font-bold text-[#0A1F1F] text-base flex items-center justify-center gap-3 border-4 border-[#50FA7B]/30 shadow-lg relative overflow-hidden"
        >
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 w-20 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
          <Save className="w-6 h-6 relative z-10" />
          <span className="relative z-10">Save Rubric</span>
        </motion.button>

        {/* Cancel */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCancel}
          className="w-full bg-[#0A1F1F] rounded-2xl py-4 font-bold text-[#F5F1ED] text-base border-4 border-[#0D3D3D]"
        >
          Cancel
        </motion.button>
      </div>

      {/* Exceed Percentage Popup */}
      <AnimatePresence>
        {showExceedPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-6"
            onClick={handleExceedPopupClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#0D2626] to-[#0A1F1F] rounded-[32px] p-6 border-4 border-[#FF6AC1] relative overflow-hidden max-w-sm w-full shadow-2xl"
            >
              {/* Animated background glow */}
              <motion.div
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-br from-[#FF6AC1]/20 to-[#FFB86C]/20 rounded-[32px]"
              />
              
              {/* Floating particles */}
              <motion.div
                animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-4 right-4 w-16 h-16 bg-[#FF6AC1]/10 rounded-full blur-2xl"
              />
              <motion.div
                animate={{ y: [10, -10, 10], x: [5, -5, 5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-4 left-4 w-20 h-20 bg-[#FFB86C]/10 rounded-full blur-2xl"
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Icon and Close Button */}
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    className="w-14 h-14 bg-gradient-to-br from-[#FF6AC1] to-[#FFB86C] rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleExceedPopupClose}
                    className="w-10 h-10 bg-[#0A1F1F] rounded-xl flex items-center justify-center border-2 border-[#0D3D3D] hover:border-[#FF6AC1]"
                  >
                    <X className="w-5 h-5 text-[#F5F1ED]" />
                  </motion.button>
                </div>

                {/* Message */}
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-[#F5F1ED] mb-2">Not Allowed!</h3>
                  <p className="text-sm text-[#8B9E9E] leading-relaxed">
                    The total percentage of Learning Outcomes cannot exceed <span className="text-[#FF6AC1] font-bold">100%</span>. 
                    Currently at <span className="text-[#FFB86C] font-bold">{totalLOPercentage}%</span>. 
                    Please adjust your distribution.
                  </p>
                </div>

                {/* Current Distribution */}
                <div className="bg-[#0A1F1F]/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-[#0D3D3D] mb-5">
                  <p className="text-[10px] font-bold text-[#8B9E9E] uppercase mb-3">Current Distribution</p>
                  <div className="space-y-2">
                    {[
                      { label: 'CO1', value: co1Percent, color: '#8BE9FD' },
                      { label: 'CO2', value: co2Percent, color: '#C5B3E6' },
                      { label: 'CO3', value: co3Percent, color: '#FFB86C' },
                      { label: 'CO4', value: co4Percent, color: '#50FA7B' },
                      { label: 'CO5', value: co5Percent, color: '#FF6AC1' },
                    ].map((co) => (
                      <div key={co.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: co.color }}
                          />
                          <span className="text-xs font-semibold text-[#F5F1ED]">{co.label}</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: co.color }}>
                          {co.value}%
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 mt-2 border-t-2 border-[#0D3D3D] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#F5F1ED]">Total</span>
                      <motion.span 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-base font-bold"
                        style={{ color: totalLOPercentage > 100 ? '#FF6AC1' : '#50FA7B' }}
                      >
                        {totalLOPercentage}%
                      </motion.span>
                    </div>
                  </div>
                </div>

                {/* OK Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExceedPopupClose}
                  className="w-full bg-gradient-to-br from-[#FF6AC1] to-[#FFB86C] rounded-2xl py-4 font-bold text-white text-base shadow-lg relative overflow-hidden"
                >
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 w-20 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                  <span className="relative z-10">Got it!</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}