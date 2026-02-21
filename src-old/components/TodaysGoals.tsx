import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowLeft, Target, CheckCircle2, Circle, Plus, Trash2, Sparkles } from 'lucide-react';

interface Goal {
  id: number;
  text: string;
  completed: boolean;
  category: 'generate' | 'vetting' | 'rubric' | 'other';
}

export function TodaysGoals() {
  const [goals, setGoals] = useState<Goal[]>([
    { id: 1, text: 'Generate 10 MCQ questions', completed: true, category: 'generate' },
    { id: 2, text: 'Vet 5 pending questions', completed: true, category: 'vetting' },
    { id: 3, text: 'Create new rubric for Math 101', completed: false, category: 'rubric' },
    { id: 4, text: 'Review analytics report', completed: false, category: 'other' },
    { id: 5, text: 'Update subject files', completed: false, category: 'other' },
  ]);

  const [newGoalText, setNewGoalText] = useState('');
  const [showAddGoal, setShowAddGoal] = useState(false);

  const completedCount = goals.filter(g => g.completed).length;
  const totalCount = goals.length;
  const progressPercent = (completedCount / totalCount) * 100;

  const toggleGoal = (id: number) => {
    setGoals(goals.map(g => 
      g.id === id ? { ...g, completed: !g.completed } : g
    ));
  };

  const deleteGoal = (id: number) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const addGoal = () => {
    if (newGoalText.trim()) {
      const newGoal: Goal = {
        id: Date.now(),
        text: newGoalText,
        completed: false,
        category: 'other',
      };
      setGoals([...goals, newGoal]);
      setNewGoalText('');
      setShowAddGoal(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'generate': return '#8BE9FD';
      case 'vetting': return '#C5B3E6';
      case 'rubric': return '#FFB86C';
      default: return '#50FA7B';
    }
  };

  return (
    <div className="min-h-full pb-6">
      {/* Floating background elements */}
      <div className="fixed top-20 left-10 w-40 h-40 bg-[#50FA7B]/10 rounded-full blur-3xl float-slow" />
      <div className="fixed bottom-40 right-10 w-36 h-36 bg-[#8BE9FD]/10 rounded-full blur-3xl float-slow float-delay-1" />

      {/* Header */}
      <div className="mx-6 mt-4 mb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#50FA7B] to-[#6FEDD6] rounded-[32px] p-6 border-4 border-white/30 relative overflow-hidden"
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
              <h1 className="text-xl font-bold text-[#0A1F1F]">Today's Goals</h1>
              <p className="text-xs text-[#0A1F1F] opacity-70 font-medium">Friday, February 13, 2026</p>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <Target className="w-8 h-8 text-[#0A1F1F]" />
            </motion.div>
          </div>

          {/* Progress */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-[#0A1F1F]">Overall Progress</span>
              <span className="text-2xl font-bold text-[#0A1F1F]">
                {completedCount}/{totalCount}
              </span>
            </div>
            <div className="bg-white/30 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[#0A1F1F] to-[#0D2626] relative"
              >
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Goals List */}
      <div className="mx-6 mb-6 relative z-10">
        <div className="space-y-3">
          {goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className={`rounded-2xl p-4 border-3 ${
                goal.completed
                  ? 'bg-[#0D3D3D] border-[#50FA7B]'
                  : 'bg-[#0A1F1F] border-[#0D3D3D]'
              }`}
            >
              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleGoal(goal.id)}
                  className="flex-shrink-0"
                >
                  {goal.completed ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring' }}
                    >
                      <CheckCircle2 className="w-6 h-6 text-[#50FA7B]" />
                    </motion.div>
                  ) : (
                    <Circle className="w-6 h-6 text-[#8B9E9E]" />
                  )}
                </motion.button>

                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    goal.completed ? 'text-[#8B9E9E] line-through' : 'text-[#F5F1ED]'
                  }`}>
                    {goal.text}
                  </p>
                </div>

                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getCategoryColor(goal.category) }}
                />

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => deleteGoal(goal.id)}
                  className="p-2 hover:bg-[#0D3D3D] rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-[#FF6AC1]" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add New Goal */}
      <div className="mx-6 mb-6 relative z-10">
        {!showAddGoal ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddGoal(true)}
            className="w-full bg-[#0A1F1F] border-4 border-[#0D3D3D] rounded-2xl py-4 font-bold text-[#F5F1ED] flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Goal
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0A1F1F] rounded-2xl p-4 border-4 border-[#0D3D3D]"
          >
            <input
              type="text"
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addGoal()}
              placeholder="Enter your goal..."
              className="w-full bg-[#0D3D3D] rounded-xl px-4 py-3 text-[#F5F1ED] text-sm outline-none font-medium placeholder:text-[#8B9E9E] mb-3"
              autoFocus
            />
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addGoal}
                className="flex-1 bg-gradient-to-br from-[#50FA7B] to-[#6FEDD6] rounded-xl py-3 font-bold text-[#0A1F1F]"
              >
                Add Goal
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowAddGoal(false);
                  setNewGoalText('');
                }}
                className="px-5 bg-[#0D3D3D] rounded-xl py-3 font-bold text-[#F5F1ED]"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Motivation */}
      {completedCount === totalCount && totalCount > 0 && (
        <div className="mx-6 mb-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' }}
            className="bg-gradient-to-br from-[#FFB86C] to-[#FF6AC1] rounded-2xl p-5 border-4 border-white/30 text-center"
          >
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 mx-auto mb-3 bg-white/30 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-lg font-bold text-white mb-2">
              🎉 All Goals Completed!
            </h3>
            <p className="text-sm text-white opacity-90">
              Amazing work! You've crushed all your goals for today.
            </p>
          </motion.div>
        </div>
      )}

      {/* Stats */}
      <div className="mx-6 relative z-10">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#0A1F1F] rounded-2xl p-4 border-3 border-[#0D3D3D]">
            <p className="text-2xl font-bold text-[#50FA7B] mb-1">{completedCount}</p>
            <p className="text-[9px] text-[#8B9E9E] font-bold uppercase leading-tight">Completed</p>
          </div>
          <div className="bg-[#0A1F1F] rounded-2xl p-4 border-3 border-[#0D3D3D]">
            <p className="text-2xl font-bold text-[#FFB86C] mb-1">{totalCount - completedCount}</p>
            <p className="text-[9px] text-[#8B9E9E] font-bold uppercase leading-tight">Remaining</p>
          </div>
          <div className="bg-[#0A1F1F] rounded-2xl p-4 border-3 border-[#0D3D3D]">
            <p className="text-2xl font-bold text-[#8BE9FD] mb-1">{Math.round(progressPercent)}%</p>
            <p className="text-[9px] text-[#8B9E9E] font-bold uppercase leading-tight">Progress</p>
          </div>
        </div>
      </div>
    </div>
  );
}
