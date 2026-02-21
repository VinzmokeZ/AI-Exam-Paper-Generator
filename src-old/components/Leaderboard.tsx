import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Star, ArrowUp, Zap, Coins, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { leaderboardService } from '../services/api';

export function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [localRank, setLocalRank] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [global, local] = await Promise.all([
                leaderboardService.getGlobal(),
                leaderboardService.getLocal()
            ]);
            setLeaderboard(global);
            setLocalRank(local);
        } catch (err) {
            console.error("Failed to fetch leaderboard:", err);
        } finally {
            setLoading(false);
        }
    };

    const colors = ['text-[#FFD700]', 'text-[#C0C0C0]', 'text-[#CD7F32]'];

    return (
        <div className="min-h-full bg-[#0A1F1F] p-6 pb-20 overflow-x-hidden">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Link to="/">
                        <div className="w-10 h-10 bg-[#0D2626] rounded-xl flex items-center justify-center border border-white/10">
                            <ArrowLeft className="w-5 h-5 text-[#F5F1ED]" />
                        </div>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-[#F5F1ED]">Leaderboard</h1>
                        <p className="text-xs text-[#8B9E9E]">Top examiners this week</p>
                    </div>
                    <div className="ml-auto w-10 h-10 bg-gradient-to-br from-[#FFD700] to-[#CD7F32] rounded-xl flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-[#0A1F1F]" />
                    </div>
                </div>

                {/* Local Rank Card */}
                {localRank && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-[#C5B3E6] to-[#9B86C5] rounded-[32px] p-6 border-4 border-white/30 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-[96px]" />
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-[#0A1F1F] uppercase opacity-60 mb-1">Your Ranking</p>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-4xl font-black text-[#0A1F1F]">#{localRank.rank}</h2>
                                    <span className="text-xs font-bold text-[#0A1F1F] opacity-70">Top {localRank.percentile}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 justify-end">
                                    <ArrowUp className="w-3 h-3 text-[#50FA7B]" strokeWidth={3} />
                                    <span className="text-xs font-bold text-[#0A1F1F]">2 spots up</span>
                                </div>
                                <p className="text-[10px] text-[#0A1F1F] opacity-50 mt-1">vs yesterday</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* List */}
            <div className="space-y-3">
                {leaderboard.map((user, index) => (
                    <motion.div
                        key={user.user_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-[#0D2626] rounded-3xl p-4 border border-white/5 flex items-center gap-4"
                    >
                        <div className="w-8 flex justify-center">
                            {index < 3 ? (
                                <Medal className={`w-6 h-6 ${colors[index]}`} />
                            ) : (
                                <span className="text-sm font-bold text-[#8B9E9E]">#{index + 1}</span>
                            )}
                        </div>

                        <div className="w-12 h-12 rounded-2xl bg-[#0A1F1F] border border-white/10 flex items-center justify-center overflow-hidden">
                            <div className="text-xs font-bold text-[#8B9E9E]">U{user.user_id}</div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-[#F5F1ED] truncate">User {user.user_id}</h3>
                            <div className="flex items-center gap-2 text-[10px] text-[#8B9E9E]">
                                <span className="font-bold text-[#C5B3E6]">Level {user.level}</span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5">
                                    <Coins className="w-2 h-2 text-[#FFB86C]" />
                                    {user.coins}
                                </span>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-sm font-bold text-[#F5F1ED]">{user.xp}</div>
                            <div className="text-[9px] font-bold text-[#8B9E9E] uppercase">XP</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
