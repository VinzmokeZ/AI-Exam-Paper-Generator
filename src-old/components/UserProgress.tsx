import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Star } from 'lucide-react';
import { gamificationService } from '../services/api';

interface UserStats {
    xp: number;
    level: number;
    streak: number;
}

export function UserProgress() {
    const [stats, setStats] = useState<UserStats>({ xp: 0, level: 1, streak: 0 });

    useEffect(() => {
        loadStats();
        // Poll for updates every 30s to keep sync
        const interval = setInterval(loadStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadStats = async () => {
        try {
            const data = await gamificationService.getStats();
            setStats(data);
        } catch (e) {
            console.error("Failed to load stats", e);
        }
    };

    const nextLevelXp = stats.level * 1000;
    const progress = (stats.xp / nextLevelXp) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-4 right-6 z-50 flex items-center gap-3 bg-[#0A1F1F]/90 backdrop-blur-md p-2 pl-4 rounded-full border border-[#C5B3E6]/20 shadow-lg"
        >
            <div className="flex items-center gap-2">
                <div className="flex flex-col items-end">
                    <span className="text-xs text-[#8B9E9E] font-bold">LEVEL {stats.level}</span>
                    <div className="w-24 h-1.5 bg-black/50 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-[#C5B3E6] to-[#9B86C5]"
                        />
                    </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center border-2 border-[#0A1F1F]">
                    <Trophy className="w-4 h-4 text-[#0A1F1F]" fill="currentColor" />
                </div>
            </div>

            <div className="h-6 w-[1px] bg-white/10" />

            <div className="flex items-center gap-1.5 pr-2">
                <Flame className={`w-4 h-4 ${stats.streak > 0 ? 'text-[#FF4500]' : 'text-[#8B9E9E]'}`} fill="currentColor" />
                <span className="text-sm font-bold text-[#F5F1ED]">{stats.streak}</span>
            </div>
        </motion.div>
    );
}
