import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, Download, Filter, Search, Calendar, ChevronRight } from 'lucide-react';
import { historyService } from '../services/api';

export function ExamHistory() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const data = await historyService.getHistory();
            setHistory(data);
        } catch (err) {
            console.error("Failed to fetch history:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-full bg-[#0A1F1F] p-6 pb-20">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <Link to="/">
                        <div className="w-10 h-10 bg-[#0D2626] rounded-xl flex items-center justify-center border border-white/10">
                            <ArrowLeft className="w-5 h-5 text-[#F5F1ED]" />
                        </div>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-[#F5F1ED]">Exam History</h1>
                        <p className="text-xs text-[#8B9E9E]">Review and export past papers</p>
                    </div>
                    <div className="ml-auto w-10 h-10 bg-[#BB95B8]/20 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-[#BB95B8]" />
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex gap-2">
                    <div className="flex-1 bg-[#0D2626] rounded-2xl px-4 py-3 border border-white/5 flex items-center gap-2">
                        <Search className="w-4 h-4 text-[#8B9E9E]" />
                        <input
                            type="text"
                            placeholder="Search history..."
                            className="bg-transparent border-none outline-none text-sm text-[#F5F1ED] w-full"
                        />
                    </div>
                    <button className="bg-[#0D2626] p-4 rounded-2xl border border-white/5">
                        <Filter className="w-4 h-4 text-[#F5F1ED]" />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {history.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-[#0D2626] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                            <FileText className="w-8 h-8 text-[#8B9E9E]" />
                        </div>
                        <p className="text-[#8B9E9E] text-sm">No exam history found yet.</p>
                        <Link to="/generate">
                            <button className="mt-4 text-[#C5B3E6] font-bold text-sm">Generate your first exam &rarr;</button>
                        </Link>
                    </div>
                )}

                {history.map((exam, index) => (
                    <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-[#0D2626] rounded-3xl p-5 border border-white/5 relative overflow-hidden group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-[#C5B3E6]/10 px-3 py-1 rounded-lg border border-[#C5B3E6]/20">
                                <span className="text-[10px] font-bold text-[#C5B3E6] uppercase tracking-wider">
                                    {exam.subject_name.split(' ')[0]}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-[#8B9E9E]">
                                <Calendar className="w-3 h-3" />
                                <span className="text-[10px]">{new Date(exam.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-[#F5F1ED] mb-1">{exam.topic_name}</h3>
                        <p className="text-xs text-[#8B9E9E] mb-4">
                            {exam.questions_count} Questions • {exam.marks} Marks • {exam.duration} mins
                        </p>

                        <div className="flex gap-2">
                            <button className="flex-1 bg-[#F5F1ED]/5 hover:bg-[#F5F1ED]/10 rounded-2xl py-3 text-[#F5F1ED] text-xs font-bold transition-colors flex items-center justify-center gap-2">
                                <FileText className="w-3.5 h-3.5" /> View
                            </button>
                            <button className="flex-1 bg-gradient-to-br from-[#8BE9FD] to-[#6FEDD6] rounded-2xl py-3 text-[#0A1F1F] text-xs font-bold transition-transform active:scale-95 flex items-center justify-center gap-2">
                                <Download className="w-3.5 h-3.5" /> PDF
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
