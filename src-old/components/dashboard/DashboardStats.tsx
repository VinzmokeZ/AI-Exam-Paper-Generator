import { motion } from 'framer-motion';
import { Flame, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardStats() {
    return (
        <div className="space-y-8">
            {/* Level XP Progress */}
            <Link to="/achievements">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1a1b26] border border-[#44475a] rounded-3xl p-5 shadow-xl cursor-pointer"
                >
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-[#6272a4] text-xs font-bold uppercase tracking-widest mb-1">XP Progress</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-[#f8f8f2]">4,250</span>
                                <span className="text-[#6272a4] text-sm">/ 5,000 XP</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[#50fa7b] font-bold text-sm">85%</span>
                        </div>
                    </div>
                    <div className="h-3 w-full bg-[#282a36] rounded-full overflow-hidden p-[2px]">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "85%" }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-[#50fa7b] to-[#8be9fd] rounded-full shadow-[0_0_10px_rgba(80,250,123,0.5)]"
                        />
                    </div>
                </motion.div>
            </Link>

            {/* Streak & Weekly Goal Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Link to="/streak">
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-[#1a1b26] border border-[#44475a] rounded-3xl p-5 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
                    >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#ffb86c]/5 rounded-bl-full transition-all group-hover:w-20 group-hover:h-20" />
                        <div className="w-12 h-12 rounded-2xl bg-[#ffb86c]/10 flex items-center justify-center mb-3">
                            <Flame className="w-6 h-6 text-[#ffb86c]" />
                        </div>
                        <span className="text-3xl font-black text-[#f8f8f2]">24</span>
                        <span className="text-[#6272a4] text-[10px] font-bold uppercase tracking-widest mt-1">Day Streak</span>
                    </motion.div>
                </Link>

                <Link to="/goals">
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-[#1a1b26] border border-[#44475a] rounded-3xl p-5 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
                    >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#bd93f9]/5 rounded-bl-full transition-all group-hover:w-20 group-hover:h-20" />
                        <div className="w-12 h-12 rounded-2xl bg-[#bd93f9]/10 flex items-center justify-center mb-3">
                            <Target className="w-6 h-6 text-[#bd93f9]" />
                        </div>
                        <span className="text-3xl font-black text-[#f8f8f2]">8/10</span>
                        <span className="text-[#6272a4] text-[10px] font-bold uppercase tracking-widest mt-1">Weekly Goal</span>
                    </motion.div>
                </Link>
            </div>

            {/* Activity Trend */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[#f8f8f2] font-bold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#50fa7b]" />
                        Activity Trend
                    </h3>
                    <Link to="/reports">
                        <button className="text-[#6272a4] text-xs font-bold uppercase hover:text-[#f8f8f2] transition-colors">
                            Details
                        </button>
                    </Link>
                </div>
                <div className="bg-[#1a1b26] border border-[#44475a] rounded-3xl p-6 h-48 flex items-end justify-between gap-2">
                    {[40, 70, 45, 90, 65, 80, 55].map((height, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ delay: i * 0.1, duration: 1 }}
                                className={`w-full rounded-t-lg bg-gradient-to-t ${i === 3 ? 'from-[#ff79c6] to-[#bd93f9]' : 'from-[#44475a] to-[#6272a4] opacity-50'}`}
                            />
                            <span className="text-[10px] text-[#6272a4] font-bold">
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                            </span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
