import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Search, Plus, ChevronRight, FileStack, ArrowLeft, Sparkles } from 'lucide-react';

const subjects = [
  { id: 'cs301', code: 'CS301', name: 'Computer Science', chapters: 15, questions: 450, color: '#C5B3E6', gradient: 'from-[#C5B3E6] to-[#9B86C5]' },
  { id: 'math101', code: 'MATH101', name: 'Mathematics', chapters: 12, questions: 380, color: '#8BE9FD', gradient: 'from-[#8BE9FD] to-[#6FEDD6]' },
  { id: 'phys202', code: 'PHYS202', name: 'Physics', chapters: 10, questions: 320, color: '#FFB86C', gradient: 'from-[#FFB86C] to-[#FF6AC1]' },
  { id: 'chem201', code: 'CHEM201', name: 'Chemistry', chapters: 11, questions: 290, color: '#50FA7B', gradient: 'from-[#50FA7B] to-[#6FEDD6]' },
  { id: 'eng101', code: 'ENG101', name: 'English Literature', chapters: 8, questions: 250, color: '#FF6AC1', gradient: 'from-[#FF6AC1] to-[#C5B3E6]' },
  { id: 'bio301', code: 'BIO301', name: 'Biology', chapters: 14, questions: 410, color: '#F1FA8C', gradient: 'from-[#F1FA8C] to-[#50FA7B]' },
];

export function SubjectLibrary() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-full">
      {/* Floating background elements */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-[#C5B3E6]/10 rounded-full blur-3xl float-slow" />
      <div className="fixed bottom-40 right-10 w-40 h-40 bg-[#6FEDD6]/10 rounded-full blur-3xl float-slow float-delay-1" />
      
      {/* Header */}
      <div className="mx-6 mt-4 mb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#0D2626] to-[#0A1F1F] rounded-[32px] p-6 border-4 border-[#0A1F1F] relative overflow-hidden"
        >
          {/* Animated corner sparkles */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-2 left-2 w-6 h-6 opacity-30"
          >
            <Sparkles className="w-6 h-6 text-[#C5B3E6]" />
          </motion.div>
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-2 right-2 w-6 h-6 opacity-30"
          >
            <Sparkles className="w-6 h-6 text-[#6FEDD6]" />
          </motion.div>
          
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
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs text-[#8B9E9E]"
              >
                {subjects.length} subjects available
              </motion.p>
            </div>
            <Link to="/add-subject">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-gradient-to-br from-[#C5B3E6] to-[#9B86C5] rounded-xl flex items-center justify-center glow-purple"
              >
                <Plus className="w-5 h-5 text-[#0A1F1F]" strokeWidth={3} />
              </motion.div>
            </Link>
          </div>

          {/* Search */}
          <div className="bg-[#0A1F1F] rounded-2xl px-4 py-3 flex items-center gap-3 border-2 border-[#0D2626]">
            <Search className="w-5 h-5 text-[#8B9E9E]" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[#F5F1ED] placeholder:text-[#8B9E9E] text-sm"
            />
          </div>
        </motion.div>
      </div>

      {/* Stats Overview */}
      <div className="mx-6 mb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#F5F1ED] to-[#E5DED6] rounded-3xl p-5 border-4 border-[#E5DED6]"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <div className="text-3xl font-bold text-[#0A1F1F] mb-1 scale-pulse">{subjects.length}</div>
              <div className="text-[10px] text-[#0A1F1F] opacity-60 uppercase font-bold">Subjects</div>
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <div className="text-3xl font-bold text-[#0A1F1F] mb-1 scale-pulse">
                {subjects.reduce((sum, s) => sum + s.chapters, 0)}
              </div>
              <div className="text-[10px] text-[#0A1F1F] opacity-60 uppercase font-bold">Chapters</div>
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <div className="text-3xl font-bold text-[#0A1F1F] mb-1 scale-pulse">
                {subjects.reduce((sum, s) => sum + s.questions, 0)}
              </div>
              <div className="text-[10px] text-[#0A1F1F] opacity-60 uppercase font-bold">Questions</div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Subject List */}
      <div className="px-6 pb-6 space-y-3 relative z-10">
        {filteredSubjects.map((subject, index) => (
          <Link key={subject.id} to={`/subjects/${subject.id}`}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-gradient-to-br ${subject.gradient} rounded-3xl p-5 border-4 border-white/20 relative overflow-hidden`}
            >
              {/* Animated shimmer overlay */}
              <div className="absolute inset-0 shimmer opacity-50" />
              
              {/* Decorative corner */}
              <div className="absolute bottom-0 right-0 w-24 h-24 rounded-tl-[96px]" style={{ backgroundColor: `${subject.color}40` }} />
              
              {/* Floating sparkles */}
              <motion.div 
                className="absolute top-3 right-3 opacity-40 float-animation"
                style={{ animationDelay: `${index * 0.3}s` }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              
              <div className="flex items-center gap-4 relative z-10">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center border-4 border-white/40 flex-shrink-0 bg-white/20 backdrop-blur-sm"
                >
                  <span className="text-lg font-bold text-[#0A1F1F]">{subject.code.slice(0, 2)}</span>
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-[#0A1F1F] font-bold text-base mb-1">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-[#0A1F1F] opacity-70 font-medium">
                    {subject.code} • {subject.chapters} Chapters
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end mb-1">
                      <FileStack className="w-4 h-4 text-[#0A1F1F] opacity-70" />
                      <motion.span 
                        className="text-xl font-bold text-[#0A1F1F]"
                        whileHover={{ scale: 1.2 }}
                      >
                        {subject.questions}
                      </motion.span>
                    </div>
                    <div className="text-[10px] text-[#0A1F1F] opacity-70 uppercase font-bold">Questions</div>
                  </div>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ChevronRight className="w-6 h-6 text-[#0A1F1F] opacity-60" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
