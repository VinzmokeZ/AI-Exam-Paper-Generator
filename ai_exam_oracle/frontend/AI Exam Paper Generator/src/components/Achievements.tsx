import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Star, Award, Target, Zap, Crown, Sparkles, Flame, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { achievementService } from '../services/api';

const iconMap: any = {
  Trophy,
  Zap,
  Award,
  Crown,
  Target,
  Sparkles,
  Flame,
  CheckCircle,
};

export function Achievements() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const [achData, statsData] = await Promise.all([
        achievementService.getAll(),
        import('../services/api').then(m => m.dashboardService.getStats())
      ]);

      // Calculate logical progress for each achievement
      const processed = achData.map((ach: any) => {
        let progress = 0;
        let target = 1;

        if (ach.name === "First Steps") {
          progress = statsData.totalQuestions > 0 ? 1 : 0;
          target = 1;
        } else if (ach.name === "Question Master") {
          progress = statsData.totalQuestions || 0;
          target = 1000;
        } else if (ach.name === "Streak Keeper") {
          progress = statsData.streak || 0;
          target = 7;
        } else if (ach.name === "Vetting Pro") {
          progress = statsData.approvedQuestions || 0;
          target = 50;
        }

        const isUnlocked = ach.unlocked || progress >= target;

        return {
          ...ach,
          progress: Math.min(Math.round((progress / target) * 100), 100),
          currentValue: progress,
          targetValue: target,
          unlocked: isUnlocked
        };
      });

      setAchievements(processed);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load achievements/stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionRate = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const topStats = [
    { label: 'Total Achievements', value: `${unlockedCount}/${totalCount}`, color: '#FFB86C' },
    { label: 'Completion Rate', value: `${completionRate}%`, color: '#50FA7B' },
    { label: 'Recent Unlocks', value: unlockedCount > 0 ? '1' : '0', color: '#C5B3E6' },
  ];

  return (
    <div className="min-h-full pb-6">
      {/* Floating background elements */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-[#FFB86C]/10 rounded-full blur-3xl float-slow" />
      <div className="absolute bottom-40 right-10 w-36 h-36 bg-[#C5B3E6]/10 rounded-full blur-3xl float-slow float-delay-1" />

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
          {topStats.map((stat, index) => (
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
          {loading ? (
            <div className="text-center text-[#8B9E9E] py-10">Loading achievements...</div>
          ) : (
            achievements.map((achievement, index) => {
              const Icon = iconMap[achievement.badge_icon] || Award;
              const cardColor = achievement.unlocked ? '#FFB86C' : '#8B9E9E'; // Use a default color if not provided by backend, or map based on type

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`rounded-[28px] p-5 border-4 relative overflow-hidden ${achievement.unlocked
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
                      style={{ boxShadow: `0 0 40px ${cardColor}40` }}
                    />
                  )}

                  <div className="flex items-start gap-4 mb-4 relative z-10">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: cardColor }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>

                    <div className="flex-1">
                      <h3 className="text-base font-bold text-[#F5F1ED] mb-1">
                        {achievement.name}
                      </h3>
                      <p className="text-xs text-[#8B9E9E] mb-2">
                        {achievement.description}
                      </p>
                      <p className="text-[10px] font-semibold" style={{ color: cardColor }}>
                        {achievement.unlocked ? 'Unlocked' : 'Locked'}
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

                  {/* Progress Bar (Mocked for now as backend doesn't store progress explicitly yet) */}
                  {!achievement.unlocked && (
                    <div className="relative z-10">
                      <div className="bg-[#0D3D3D] rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${achievement.progress}%` }}
                          className="h-full"
                          style={{ backgroundColor: cardColor }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-[9px] text-[#8B9E9E] font-bold uppercase tracking-widest leading-none">
                          {achievement.currentValue} / {achievement.targetValue}
                        </p>
                        <p className="text-[9px] text-[#8B9E9E] font-bold uppercase tracking-widest leading-none">
                          {achievement.progress}%
                        </p>
                      </div>
                    </div>
                  )}
                  {achievement.unlocked && (
                    <p className="text-[9px] text-[#50FA7B] font-bold uppercase tracking-widest mt-2 relative z-10">
                      Complete! Milestone Reached.
                    </p>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
