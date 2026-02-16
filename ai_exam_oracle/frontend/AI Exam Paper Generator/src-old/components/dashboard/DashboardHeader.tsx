import { motion } from 'framer-motion';
import { Bell, Settings, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export function DashboardHeader({ searchQuery, setSearchQuery }: DashboardHeaderProps) {
    return (
        <div className="relative z-10 px-6 pt-8 pb-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#50fa7b] to-[#8be9fd] p-[2px] shadow-[0_0_20px_rgba(80,250,123,0.3)]"
                    >
                        <div className="w-full h-full rounded-[14px] bg-[#1a1b26] flex items-center justify-center overflow-hidden">
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Vinz&backgroundColor=transparent"
                                alt="Avatar"
                                className="w-10 h-10"
                            />
                        </div>
                    </motion.div>
                    <div>
                        <h2 className="text-[#f8f8f2] font-bold text-lg leading-tight">Welcome back, Vinz</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[#50fa7b] text-xs font-bold uppercase tracking-wider">Level 12</span>
                            <div className="w-1 h-1 rounded-full bg-[#44475a]" />
                            <span className="text-[#bd93f9] text-xs font-bold">Pro Educator</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link to="/notifications">
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-10 h-10 rounded-xl bg-[#1a1b26] border border-[#44475a] flex items-center justify-center text-[#f8f8f2] relative"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#ff5555] rounded-full border-2 border-[#1a1b26]" />
                        </motion.button>
                    </Link>
                    <Link to="/settings">
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: -5 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-10 h-10 rounded-xl bg-[#1a1b26] border border-[#44475a] flex items-center justify-center text-[#f8f8f2]"
                        >
                            <Settings className="w-5 h-5" />
                        </motion.button>
                    </Link>
                </div>
            </div>

            <div className="relative mb-8 pt-2">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-[#6272a4]" />
                </div>
                <input
                    type="text"
                    placeholder="Search exams, subjects, or rubrics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-14 bg-[#1a1b26] border-2 border-[#44475a] rounded-2xl pl-12 pr-4 text-[#f8f8f2] placeholder-[#6272a4] focus:border-[#50fa7b] focus:shadow-[0_0_20px_rgba(80,250,123,0.1)] outline-none transition-all"
                />
                <div className="absolute right-4 inset-y-0 flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-[#282a36] flex items-center justify-center">
                        <Filter className="w-4 h-4 text-[#6272a4]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
