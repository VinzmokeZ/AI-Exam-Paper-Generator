import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowLeft, Trophy, Star, Award, Target, Zap, Crown, Sparkles } from 'lucide-react';

const achievements = [
  {
    id: 1,
    title: 'Question Master',
    description: 'Generated 1000+ questions',
    icon: Trophy,
    color: '#FFB86C',
    progress: 100,
    unlocked: true,
    date: 'Unlocked Feb 10, 2026',
  },
  {
    id: 2,
    title: 'Perfect Streak',
    description: 'Maintained 30-day streak',
    icon: Zap,
    color: '#F1FA8C',
    progress: 100,
    unlocked: true,
    date: 'Unlocked Feb 5, 2026',
  },
  {
    id: 3,
    title: 'Quality Guardian',
    description: 'Vetted 500 questions',
    icon: Award,
    color: '#C5B3E6',
    progress: 100,
    unlocked: true,
    date: 'Unlocked Jan 28, 2026',
  },
  {
    id: 4,
    title: 'Professor Level 71',
    description: 'Reached level 71',
    icon: Crown,
    color: '#FF6AC1',
    progress: 100,
    unlocked: true,
    date: 'Unlocked Feb 12, 2026',
  },
  {
    id: 5,
    title: 'Rubric Architect',
    description: 'Create 50 custom rubrics',
    icon: Target,
    color: '#8BE9FD',
    progress: 68,
    unlocked: false,
    date: '34/50 rubrics',
  },
  {
    id: 6,
    title: 'AI Whisperer',
    description: 'Use AI prompt 100 times',
    icon: Sparkles,
    color: '#50FA7B',
    progress: 45,
    unlocked: false,
    date: '45/100 prompts',
  },
];

const stats = [
  { label: 'Total Achievements', value: '4/6', color: '#FFB86C' },
  { label: 'Completion Rate', value: '67%', color: '#50FA7B' },
  { label: 'Recent Unlocks', value: '2', color: '#C5B3E6' },
];

export function Achievements() {
  return (
    <div className="min-h-full pb-6">
      {/* Floating background elements */}
      <div className="fixed top-20 left-10 w-40 h-40 bg-[#FFB86C]/10 rounded-full blur-3xl float-slow" />
      <div className="fixed bottom-40 right-10 w-36 h-36 bg-[#C5B3E6]/10 rounded-full blur-3xl float-slow float-delay-1" />

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
              <h1 className="text-xl font-bold text-[#0A1F1F]">Achievements</h1>
              <p className="text-xs text-[#0A1F1F] opacity-70 font-medium">Your milestones & awards</p>
            </div>
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Trophy className="w-8 h-8 text-[#0A1F1F]" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="mx-6 mb-6 relative z-10">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-[#0A1F1F] rounded-2xl p-4 border-3 border-[#0D3D3D]"
            >
              <p className="text-2xl font-bold mb-1" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-[9px] text-[#8B9E9E] font-bold uppercase leading-tight">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="mx-6 mb-6 relative z-10">
        <div className="space-y-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`rounded-[28px] p-5 border-4 relative overflow-hidden ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-[#0D2626] to-[#0A1F1F] border-[#0A1F1F]'
                  : 'bg-[#0A1F1F] border-[#0D3D3D] opacity-60'
              }`}
            >
              {/* Glow effect for unlocked */}
              {achievement.unlocked && (
                <motion.div
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0"
                  style={{ boxShadow: `0 0 40px ${achievement.color}40` }}
                />
              )}

              <div className="flex items-start gap-4 mb-4 relative z-10">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: achievement.color }}
                >
                  <achievement.icon className="w-8 h-8 text-white" />
                </motion.div>

                <div className="flex-1">
                  <h3 className="text-base font-bold text-[#F5F1ED] mb-1">
                    {achievement.title}
                  </h3>
                  <p className="text-xs text-[#8B9E9E] mb-2">
                    {achievement.description}
                  </p>
                  <p className="text-[10px] font-semibold" style={{ color: achievement.color }}>
                    {achievement.date}
                  </p>
                </div>

                {achievement.unlocked && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring' }}
                    className="w-8 h-8 bg-[#50FA7B] rounded-full flex items-center justify-center"
                  >
                    <Star className="w-5 h-5 text-white fill-white" />
                  </motion.div>
                )}
              </div>

              {/* Progress Bar */}
              {!achievement.unlocked && (
                <div className="relative z-10">
                  <div className="bg-[#0D3D3D] rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${achievement.progress}%` }}
                      transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                      className="h-full"
                      style={{ backgroundColor: achievement.color }}
                    />
                  </div>
                  <p className="text-xs text-[#8B9E9E] mt-2 text-right">
                    {achievement.progress}% Complete
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
