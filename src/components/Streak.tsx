import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Flame, Calendar, TrendingUp, Award, CheckCircle2, Loader2 } from 'lucide-react';
import { dashboardService } from '../services/api';

const streakMilestones = [
  { days: 7, label: 'Week Warrior', unlocked: true, color: '#8BE9FD' },
  { days: 14, label: 'Fortnight Fighter', unlocked: true, color: '#C5B3E6' },
  { days: 30, label: 'Monthly Master', unlocked: true, color: '#FFB86C' },
  { days: 60, label: 'Bimonthly Beast', unlocked: false, color: '#FF6AC1' },
  { days: 100, label: 'Centurion', unlocked: false, color: '#50FA7B' },
];

const activityHistory = [
  { date: 'Feb 13, 2026', activity: 'Generated 14 questions', type: 'generate' },
  { date: 'Feb 12, 2026', activity: 'Vetted 10 questions', type: 'vetting' },
  { date: 'Feb 11, 2026', activity: 'Created 2 rubrics', type: 'rubric' },
  { date: 'Feb 10, 2026', activity: 'Generated 15 questions', type: 'generate' },
  { date: 'Feb 9, 2026', activity: 'Vetted 8 questions', type: 'vetting' },
];

export function Streak() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch streak stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#FFB86C] animate-spin mb-4" />
        <p className="text-[#8B9E9E] font-bold text-sm">Syncing your stats...</p>
      </div>
    );
  }

  const currentStreak = stats?.streak ?? 0;
  const longestStreak = stats?.longestStreak ?? 0;
  const totalDays = stats?.totalDaysActive ?? 0;
  const currentWeek = stats?.activityWeek ?? [];

  return (
    <div className="min-h-full pb-6">
      {/* Floating background elements */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-[#FFB86C]/10 rounded-full blur-3xl float-slow" />
      <div className="absolute bottom-40 right-10 w-36 h-36 bg-[#FF6AC1]/10 rounded-full blur-3xl float-slow float-delay-1" />

      {/* Header */}
      <div className="mx-6 mt-4 mb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#FFB86C] to-[#FF6AC1] rounded-[32px] p-6 border-4 border-white/30 relative overflow-hidden"
        >
          <div className="flex items-center gap-3 mb-4">
            <Link to="/">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-white/40"
              >
                <ArrowLeft className="w-5 h-5 text-[#0A1F1F]" />
              </motion.div>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-[#0A1F1F]">Streak</h1>
              <p className="text-xs text-[#0A1F1F] opacity-70 font-medium">Keep the momentum going!</p>
            </div>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Flame className="w-8 h-8 text-[#0A1F1F]" />
            </motion.div>
          </div>

          {/* Current Streak Counter */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 border-2 border-white/30">
            <div className="text-center">
              <motion.p
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl font-bold text-[#0A1F1F] mb-2"
              >
                {currentStreak}
              </motion.p>
              <p className="text-sm font-bold text-[#0A1F1F] opacity-80">Day Streak 🔥</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="mx-6 mb-6 relative z-10">
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0A1F1F] rounded-2xl p-4 border-3 border-[#0D3D3D]"
          >
            <p className="text-2xl font-bold text-[#FFB86C] mb-1">{currentStreak}</p>
            <p className="text-[9px] text-[#8B9E9E] font-bold uppercase leading-tight">Current</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#0A1F1F] rounded-2xl p-4 border-3 border-[#0D3D3D]"
          >
            <p className="text-2xl font-bold text-[#FF6AC1] mb-1">{longestStreak}</p>
            <p className="text-[9px] text-[#8B9E9E] font-bold uppercase leading-tight">Longest</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0A1F1F] rounded-2xl p-4 border-3 border-[#0D3D3D]"
          >
            <p className="text-2xl font-bold text-[#50FA7B] mb-1">{totalDays}</p>
            <p className="text-[9px] text-[#8B9E9E] font-bold uppercase leading-tight">Total Days</p>
          </motion.div>
        </div>
      </div>

      {/* This Week */}
      <div className="mx-6 mb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-br from-[#0D2626] to-[#0A1F1F] rounded-[32px] p-5 border-4 border-[#0A1F1F]"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[#8BE9FD]" />
            <h2 className="text-base font-bold text-[#F5F1ED]">This Week</h2>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {currentWeek.map((day: any, index: number) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className={`rounded-xl p-2 text-center ${day.active
                  ? 'bg-gradient-to-br from-[#FFB86C] to-[#FF6AC1]'
                  : 'bg-[#0A1F1F] border-2 border-[#0D3D3D]'
                  }`}
              >
                <p className={`text-[9px] font-bold mb-1 ${day.active ? 'text-[#0A1F1F]' : 'text-[#8B9E9E]'}`}>
                  {day.day}
                </p>
                {day.active && (
                  <motion.p
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className="text-base font-bold text-[#0A1F1F]"
                  >
                    {day.count}
                  </motion.p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Streak Milestones */}
      <div className="mx-6 mb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0A1F1F] rounded-[32px] p-5 border-4 border-[#0D3D3D]"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-[#C5B3E6]" />
            <h2 className="text-base font-bold text-[#F5F1ED]">Milestones</h2>
          </div>

          <div className="space-y-3">
            {streakMilestones.map((milestone, index) => (
              <motion.div
                key={milestone.days}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + index * 0.05 }}
                className={`rounded-2xl p-4 border-3 ${milestone.unlocked
                  ? 'bg-[#0D3D3D] border-[#0A1F1F]'
                  : 'bg-[#0A1F1F] border-[#0D3D3D] opacity-60'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white"
                      style={{ backgroundColor: milestone.color }}
                    >
                      {milestone.days}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#F5F1ED]">{milestone.label}</p>
                      <p className="text-xs text-[#8B9E9E]">{milestone.days} day streak</p>
                    </div>
                  </div>
                  {milestone.unlocked && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring' }}
                    >
                      <CheckCircle2 className="w-6 h-6 text-[#50FA7B]" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Activity History */}
      <div className="mx-6 mb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#0A1F1F] rounded-[32px] p-5 border-4 border-[#0D3D3D]"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#50FA7B]" />
            <h2 className="text-base font-bold text-[#F5F1ED]">Recent Activity</h2>
          </div>

          <div className="space-y-3">
            {activityHistory.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + index * 0.05 }}
                className="bg-[#0D3D3D] rounded-xl p-3 border-2 border-[#0A1F1F]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#F5F1ED] mb-1">{item.activity}</p>
                    <p className="text-xs text-[#8B9E9E]">{item.date}</p>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${item.type === 'generate'
                      ? 'bg-[#8BE9FD]'
                      : item.type === 'vetting'
                        ? 'bg-[#C5B3E6]'
                        : 'bg-[#FFB86C]'
                      }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
