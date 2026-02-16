import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, Sparkles, CheckSquare, BarChart3, Settings, Bell, ChevronRight,
  Trophy, Flame, TrendingUp, Calendar, Clock, Star, Zap, Target, Award,
  Search, Filter, Download, Share2, Bookmark, History, Globe, CloudOff, Database, Cpu, Edit2, X
} from 'lucide-react';
import { Logo } from './Logo';
import { dashboardService, gamificationService, notificationService } from '../services/api';
import { toast } from 'sonner';
import { Modal } from './Modal';

export function Dashboard() {
  const navigate = useNavigate();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [engineMode, setEngineMode] = useState<'local' | 'cloud'>(() => {
    return (localStorage.getItem('ai_engine_mode') as 'local' | 'cloud') || 'local';
  });

  // Profile Edit State
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editUsername, setEditUsername] = useState('');

  // AI Generation State
  const [prompt, setPrompt] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleEngine = () => {
    const newMode = engineMode === 'local' ? 'cloud' : 'local';
    setEngineMode(newMode);
    localStorage.setItem('ai_engine_mode', newMode);
    toast.success(`Switched to ${newMode === 'local' ? 'Offline Local' : 'Online Cloud'} Engine`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await dashboardService.getStats();
        setStats(statsData);
        // Initialize edit username only if not already set or if explicitly different
        if (statsData?.username) {
          setEditUsername(statsData.username);
        }

        const activityData = await dashboardService.getActivity();
        setActivities(activityData);

        const notifications = await notificationService.getAll();
        setUnreadCount(notifications.filter((n: any) => n.unread).length);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error("Please describe what you want to generate!");
      return;
    }
    navigate('/generate', { state: { prompt } });
  };

  const handleSaveProfile = async () => {
    try {
      const updatedStats = await gamificationService.updateProfile(1, editUsername); // Assuming user ID 1 for now
      setStats(updatedStats);
      setShowProfileEdit(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  // XP and Level System
  const currentLevel = stats?.level || 1;
  const currentXP = stats?.xp || 0;
  const nextLevelXP = currentLevel * 1000;
  const xpProgress = (currentXP / nextLevelXP) * 100;
  const currentStreak = stats?.streak || 0;
  const todayProgress = stats?.approvalRate || 0;

  // Recent Activity
  const recentActivities = activities.length > 0 ? activities : [
    { action: 'Getting ready...', subject: 'System', time: 'Now', color: '#8BE9FD' }
  ];

  return (
    <div className="min-h-full relative overflow-hidden">
      {/* Enhanced Floating background elements - Changed to absolute to stay within frame */}
      <div className="absolute top-10 right-10 w-40 h-40 bg-[#C5B3E6]/10 rounded-full blur-3xl float-slow" />
      <div className="absolute bottom-40 left-10 w-36 h-36 bg-[#6FEDD6]/10 rounded-full blur-3xl float-slow float-delay-1" />
      <div className="absolute top-1/2 right-5 w-32 h-32 bg-[#FFB86C]/10 rounded-full blur-3xl float-slow float-delay-2" />
      <div className="absolute bottom-20 right-20 w-28 h-28 bg-[#FF6AC1]/10 rounded-full blur-3xl float-slow" />

      {/* Global Search Bar */}
      <div className="mx-6 mt-4 mb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0D2626] rounded-2xl px-4 py-3 border-2 border-[#0A1F1F] flex items-center gap-3"
        >
          <Search className="w-5 h-5 text-[#8B9E9E]" />
          <input
            type="text"
            placeholder="Search subjects, questions, exams..."
            className="flex-1 bg-transparent text-[#F5F1ED] placeholder:text-[#8B9E9E] text-sm outline-none"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 bg-[#C5B3E6]/20 rounded-lg flex items-center justify-center"
          >
            <Filter className="w-4 h-4 text-[#C5B3E6]" />
          </motion.button>
        </motion.div>
      </div>


      {/* Enhanced Header Card with Level System */}
      <div className="mx-6 mb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#F5F1ED] via-[#E5DED6] to-[#F5F1ED] rounded-[32px] p-6 border-4 border-[#E5DED6] relative overflow-hidden"
        >
          {/* Animated corner decorations */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-2 left-2 w-6 h-6 opacity-20 pointer-events-none"
          >
            <Sparkles className="w-6 h-6 text-[#C5B3E6]" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-2 right-2 w-6 h-6 opacity-20 pointer-events-none"
          >
            <Star className="w-6 h-6 text-[#FFB86C]" />
          </motion.div>

          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0 mr-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-[#0A1F1F]/40 uppercase tracking-widest">Global Engine Status</span>
                <div className={`w-2 h-2 rounded-full animate-pulse ${engineMode === 'local' ? 'bg-orange-400' : 'bg-green-400'}`} />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-black text-[#0A1F1F] leading-tight">
                  Hello, {stats?.username || 'Professor Vinz'}! 👋
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setEditUsername(stats?.username || 'Professor Vinz');
                    setShowProfileEdit(true);
                  }}
                  className="p-1.5 bg-[#0A1F1F]/5 rounded-full hover:bg-[#0A1F1F]/10 transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-[#0A1F1F]/60" />
                </motion.button>
              </div>

              <p className="text-xs text-[#8B9E9E] font-bold">You are {stats?.level || 1} Levels deep into your knowledge journey.</p>
            </div>

            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              {/* ENGINE TOGGLE SWITCH */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={toggleEngine}
                className="bg-[#0A1F1F]/5 rounded-[20px] p-1 flex items-center gap-1 cursor-pointer border-2 border-white/50 backdrop-blur-md shadow-sm"
              >
                <div className={`px-3 py-1.5 rounded-2xl flex items-center gap-2 transition-all ${engineMode === 'local' ? 'bg-[#FFB86C] text-white shadow-md' : 'text-[#8B9E9E]'}`}>
                  <Cpu className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase">Local</span>
                </div>
                <div className={`px-3 py-1.5 rounded-2xl flex items-center gap-2 transition-all ${engineMode === 'cloud' ? 'bg-[#4D76FD] text-white shadow-md' : 'text-[#8B9E9E]'}`}>
                  <Globe className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase">Cloud</span>
                </div>
              </motion.div>

              <div className="flex gap-2">
                <Link to="/notifications">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 bg-[#0D2626] rounded-2xl flex items-center justify-center relative shadow-lg"
                  >
                    <Bell className="w-4 h-4 text-[#F5F1ED]" />
                    {unreadCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6AC1] rounded-full border-2 border-[#F5F1ED] flex items-center justify-center"
                      >
                        <span className="text-[8px] font-bold text-white leading-none">{unreadCount}</span>
                      </motion.div>
                    )}
                  </motion.div>
                </Link>
                <Link to="/settings">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 bg-[#0D2626] rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <Settings className="w-4 h-4 text-[#F5F1ED]" />
                  </motion.div>
                </Link>
              </div>
            </div>
          </div>

          {/* Level & XP System - Compact & Clean */}
          <div className="bg-white rounded-2xl p-4 border-3 border-[#E5DED6] mb-4">
            <div className="flex items-center gap-4">
              {/* Trophy Icon */}
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 bg-gradient-to-br from-[#FFB86C] to-[#FF6AC1] rounded-2xl flex items-center justify-center flex-shrink-0"
              >
                <Trophy className="w-8 h-8 text-white" />
              </motion.div>

              {/* Level & Progress */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3 mb-2">
                  <div>
                    <p className="text-[8px] text-[#0A1F1F] opacity-50 font-bold uppercase mb-0.5">Professor Level</p>
                    <p className="text-3xl font-bold text-[#0A1F1F] leading-none">{currentLevel}</p>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <div>
                      <p className="text-[8px] text-[#0A1F1F] opacity-50 font-bold uppercase mb-0.5">Current XP</p>
                      <p className="text-base font-bold text-[#C5B3E6]">{currentXP.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-[#0A1F1F] opacity-50 font-bold uppercase mb-0.5">Next Level</p>
                      <p className="text-base font-bold text-[#8BE9FD]">{nextLevelXP.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* XP Progress Bar */}
                <div className="bg-[#E5DED6] rounded-full h-2.5 overflow-hidden relative mb-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#C5B3E6] via-[#8BE9FD] to-[#FFB86C] relative"
                  >
                    <motion.div
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    />
                  </motion.div>
                </div>

                <p className="text-[9px] text-[#0A1F1F] opacity-50 font-medium">
                  {(nextLevelXP - currentXP).toLocaleString()} XP to level {currentLevel + 1}
                </p>
              </div>
            </div>
          </div>

          {/* Streak & Today's Progress */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Link to="/streak">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-br from-[#FFB86C] to-[#FF6AC1] rounded-2xl p-4 border-3 border-white/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Flame className="w-5 h-5 text-white" />
                  </motion.div>
                  <span className="text-[10px] font-bold text-white uppercase leading-tight">Streak</span>
                </div>
                <p className="text-2xl font-bold text-white mb-1 leading-none">{currentStreak} days</p>
                <p className="text-[11px] text-white/80 leading-tight">Keep it going! 🔥</p>
              </motion.div>
            </Link>

            <Link to="/goals">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-br from-[#50FA7B] to-[#6FEDD6] rounded-2xl p-4 border-3 border-white/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-[#0A1F1F]" />
                  <span className="text-[10px] font-bold text-[#0A1F1F] uppercase leading-tight">Today's Goal</span>
                </div>
                <p className="text-2xl font-bold text-[#0A1F1F] mb-1.5 leading-none">{todayProgress}%</p>
                <div className="bg-white/30 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${todayProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-[#0A1F1F]"
                  />
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Enhanced Progress Section */}
          <div className="bg-[#0D2626] rounded-3xl p-4 mb-4 relative overflow-hidden">
            <motion.div
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                background: 'linear-gradient(45deg, #C5B3E6 0%, #8BE9FD 50%, #FFB86C 100%)',
                backgroundSize: '200% 200%',
              }}
            />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#8B9E9E] mb-1 font-semibold leading-tight">Overall Performance</p>
                <p className="text-[10px] text-[#8B9E9E] leading-tight">Last 30 days</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-2 bg-gradient-to-r from-[#C5B3E6] to-[#8BE9FD] rounded-xl text-[#0A1F1F] text-[10px] font-bold flex items-center gap-1.5 flex-shrink-0 leading-none"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">DETAILS</span>
              </motion.button>
            </div>

            <div className="flex items-end gap-2 mb-3 relative z-10">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="text-4xl font-bold text-[#F5F1ED] leading-none"
              >
                {stats?.approvalRate || 0}%
              </motion.span>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-1.5 flex items-center gap-1 px-2 py-1 bg-[#50FA7B]/20 rounded-lg"
              >
                <TrendingUp className="w-3 h-3 text-[#50FA7B]" />
                <span className="text-[10px] font-bold text-[#50FA7B] whitespace-nowrap leading-none">+12%</span>
              </motion.div>
            </div>

            {/* Segmented Progress Bar with Colors */}
            <div className="segmented-progress relative z-10 mb-3">
              {Array.from({ length: 25 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: i < 22 ? 1 : 0.3 }}
                  transition={{ delay: i * 0.02, duration: 0.3 }}
                  className="progress-segment"
                  style={{
                    backgroundColor: i < 22
                      ? ['#C5B3E6', '#8BE9FD', '#FFB86C', '#FF6AC1', '#50FA7B'][Math.floor(i / 5)]
                      : 'rgba(255, 255, 255, 0.2)'
                  }}
                />
              ))}
            </div>

            {/* Mini Stats */}
            <div className="grid grid-cols-3 gap-2 relative z-10">
              <div className="bg-[#0A1F1F] rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-[#8B9E9E] leading-tight mb-1">Questions</p>
                <p className="text-lg font-bold text-[#8BE9FD] leading-none">{stats?.totalQuestions || 0}</p>
              </div>
              <div className="bg-[#0A1F1F] rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-[#8B9E9E] leading-tight mb-1">Approval</p>
                <p className="text-lg font-bold text-[#50FA7B] leading-none">{stats?.approvalRate || 0}%</p>
              </div>
              <div className="bg-[#0A1F1F] rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-[#8B9E9E] leading-tight mb-1">Exams</p>
                <p className="text-lg font-bold text-[#FFB86C] leading-none">{stats?.examsThisWeek || 0}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-[#8BE9FD] to-[#6FEDD6] rounded-2xl p-3 text-center border-3 border-white/30"
            >
              <BookOpen className="w-5 h-5 mx-auto mb-2 text-[#0A1F1F]" />
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-xl font-bold text-[#0A1F1F] leading-none mb-1"
              >
                {stats?.subjectCount || 0}
              </motion.p>
              <p className="text-[9px] text-[#0A1F1F] opacity-70 uppercase font-bold leading-tight">Subjects</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-[#F1FA8C] to-[#50FA7B] rounded-2xl p-3 text-center border-3 border-white/30"
            >
              <CheckSquare className="w-5 h-5 mx-auto mb-2 text-[#0A1F1F]" />
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.45, type: "spring" }}
                className="text-xl font-bold text-[#0A1F1F] leading-none mb-1"
              >
                {stats?.pendingVetting || 0}
              </motion.p>
              <p className="text-[9px] text-[#0A1F1F] opacity-70 uppercase font-bold leading-tight">Pending</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-[#FFB86C] to-[#FF6AC1] rounded-2xl p-3 text-center border-3 border-white/30"
            >
              <Calendar className="w-5 h-5 mx-auto mb-2 text-[#0A1F1F]" />
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-xl font-bold text-[#0A1F1F] leading-none mb-1"
              >
                {stats?.examsThisWeek || 0}
              </motion.p>
              <p className="text-[9px] text-[#0A1F1F] opacity-70 uppercase font-bold leading-tight">This Week</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="mx-6 mb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0D2626] rounded-3xl p-5 border-4 border-[#0A1F1F]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#C5B3E6]" />
              <h3 className="text-sm font-bold text-[#F5F1ED]">Recent Activity</h3>
            </div>
            <button className="text-xs font-bold text-[#8B9E9E]">View all</button>
          </div>

          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3 bg-[#0A1F1F] rounded-2xl p-3"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${activity.color}30` }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activity.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#F5F1ED]">{activity.action}</p>
                  <p className="text-xs text-[#8B9E9E]">{activity.subject}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#8B9E9E]">
                  <Clock className="w-3 h-3" />
                  <span>{activity.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Access Grid */}
      <div className="px-6 pb-4 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          <Link to="/subjects">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-[#8BE9FD] to-[#6FEDD6] rounded-3xl p-6 border-4 border-white/30 relative overflow-hidden min-h-[140px] flex flex-col"
            >
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-tl-[80px] pointer-events-none" />
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-[#0D2626] rounded-2xl flex items-center justify-center mb-3 relative z-10 flex-shrink-0"
              >
                <BookOpen className="w-6 h-6 text-[#8BE9FD]" />
              </motion.div>
              <div className="relative z-10 flex-1">
                <h3 className="text-base font-bold text-[#0A1F1F] mb-1.5 leading-tight">Subject</h3>
                <h3 className="text-base font-bold text-[#0A1F1F] mb-2 leading-tight">Library</h3>
                <p className="text-xs text-[#0A1F1F] opacity-70 leading-tight">{stats?.subjectCount || 0} subjects</p>
              </div>
            </motion.div>
          </Link>

          <Link to="/vetting">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-[#FFB86C] to-[#FF6AC1] rounded-3xl p-6 border-4 border-white/30 relative overflow-hidden min-h-[140px] flex flex-col"
            >
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-tl-[80px] pointer-events-none" />
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-[#0D2626] rounded-2xl flex items-center justify-center mb-3 relative z-10 flex-shrink-0"
              >
                <CheckSquare className="w-6 h-6 text-[#FFB86C]" />
              </motion.div>
              <div className="relative z-10 flex-1">
                <h3 className="text-base font-bold text-[#0A1F1F] mb-1.5 leading-tight">Vetting</h3>
                <h3 className="text-base font-bold text-[#0A1F1F] mb-2 leading-tight">Center</h3>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-[#0A1F1F] opacity-70 leading-tight">{stats?.pendingVetting || 0} pending</p>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-[#FF6AC1] rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/reports">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-[#F1FA8C] to-[#50FA7B] rounded-3xl p-6 border-4 border-white/30 relative overflow-hidden min-h-[140px] flex flex-col"
            >
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-tl-[80px] pointer-events-none" />
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-[#0D2626] rounded-2xl flex items-center justify-center mb-3 relative z-10 flex-shrink-0"
              >
                <BarChart3 className="w-6 h-6 text-[#F1FA8C]" />
              </motion.div>
              <div className="relative z-10 flex-1">
                <h3 className="text-base font-bold text-[#0A1F1F] mb-2 leading-tight">Analytics</h3>
                <p className="text-xs text-[#0A1F1F] opacity-70 leading-tight">View reports</p>
              </div>
            </motion.div>
          </Link>

          <Link to="/generate">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-[#C5B3E6] to-[#9B86C5] rounded-3xl p-6 border-4 border-white/30 relative overflow-hidden min-h-[140px] flex flex-col"
            >
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-tl-[80px] pointer-events-none" />
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-[#0A1F1F] rounded-2xl flex items-center justify-center mb-3 relative z-10 flex-shrink-0"
              >
                <Sparkles className="w-6 h-6 text-[#C5B3E6]" />
              </motion.div>
              <div className="relative z-10 flex-1">
                <h3 className="text-base font-bold text-[#0A1F1F] mb-1.5 leading-tight">Generate</h3>
                <h3 className="text-base font-bold text-[#0A1F1F] mb-2 leading-tight">Exam</h3>
                <p className="text-xs text-[#0A1F1F] opacity-70 leading-tight">AI powered</p>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Achievements & Milestones */}
      <div className="px-6 pb-6 relative z-10">
        <Link to="/achievements">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-[#FF6AC1] via-[#FFB86C] to-[#F1FA8C] rounded-[32px] p-5 border-4 border-white/30 relative overflow-hidden shadow-xl"
          >
            {/* Animated background */}
            <motion.div
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute inset-0 opacity-20"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)',
                backgroundSize: '200% 200%',
              }}
            />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0"
                >
                  <Award className="w-5 h-5 text-[#0A1F1F]" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold text-[#0A1F1F] truncate">Latest Achievement</h2>
                  <p className="text-[10px] text-[#0A1F1F] opacity-80 truncate">Unlocked 2h ago</p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-2.5 py-1.5 bg-white/40 backdrop-blur-sm rounded-xl text-[10px] font-bold text-[#0A1F1F] border-2 border-white/50 flex-shrink-0 whitespace-nowrap"
              >
                View All
              </motion.div>
            </div>

            <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-3 border-2 border-white/40 relative z-10">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 bg-gradient-to-br from-[#C5B3E6] to-[#8BE9FD] rounded-2xl flex items-center justify-center flex-shrink-0"
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#0A1F1F] mb-1 truncate">Question Master</h3>
                  <p className="text-xs text-[#0A1F1F] opacity-80 truncate">Generated 1000+ questions</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-white/40 rounded-lg">
                      <Zap className="w-3 h-3 text-[#FFB86C]" />
                      <span className="text-[10px] font-bold text-[#0A1F1F] whitespace-nowrap">+500 XP</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-white/40 rounded-lg">
                      <Trophy className="w-3 h-3 text-[#FF6AC1]" />
                      <span className="text-[10px] font-bold text-[#0A1F1F] whitespace-nowrap">Rare</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.8, type: "spring" }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowQuickActions(!showQuickActions)}
        className="absolute bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-[#C5B3E6] to-[#9B86C5] rounded-full flex items-center justify-center shadow-2xl z-40 border-4 border-white/30"
      >
        <Zap className="w-8 h-8 text-white" />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-[#C5B3E6] rounded-full"
        />
      </motion.button>

      {/* Quick Actions Menu */}
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            transition={{ type: "spring" }}
            className="absolute bottom-44 right-6 bg-[#F5F1ED] rounded-3xl p-4 shadow-2xl z-40 border-4 border-[#E5DED6]"
          >
            <div className="space-y-2 w-48">
              {[
                { icon: Sparkles, label: 'Generate Exam', to: '/generate', color: '#C5B3E6' },
                { icon: Download, label: 'Reports & History', to: '/reports', color: '#8BE9FD' },
                { icon: CheckSquare, label: 'Vetting Center', to: '/vetting', color: '#FFB86C' },
                { icon: BookOpen, label: 'Subject Library', to: '/subjects', color: '#FF6AC1' },
              ].map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 5, scale: 1.02 }}
                  onClick={() => {
                    navigate(action.to);
                    setShowQuickActions(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white border-2 border-[#E5DED6] hover:border-[#C5B3E6]"
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${action.color}30` }}
                  >
                    <action.icon className="w-4 h-4" style={{ color: action.color }} />
                  </div>
                  <span className="text-sm font-semibold text-[#0A1F1F]">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Edit Modal */}
      <Modal
        isOpen={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
        title="Edit Profile"
        subtitle="UPDATE YOUR IDENTITY"
      >
        <div className="space-y-6">
          <div>
            <label className="text-[11px] font-bold text-[#8B9E9E] uppercase mb-3 block tracking-widest ml-1">Professor Name</label>
            <input
              type="text"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              className="w-full bg-white rounded-[20px] px-6 py-4 text-[#0A1F1F] font-bold outline-none shadow-sm border border-transparent focus:border-[#C5B3E6]/30 transition-all text-base"
              placeholder="Enter your name"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveProfile}
            className="w-full py-5 bg-[#0A1F1F] hover:bg-black rounded-[24px] text-white font-bold text-lg shadow-xl shadow-black/10 transition-all"
          >
            Save Changes
          </motion.button>
        </div>
      </Modal>

    </div>
  );
}
