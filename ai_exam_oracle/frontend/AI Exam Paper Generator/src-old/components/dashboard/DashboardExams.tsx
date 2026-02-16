import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const recentExams = [
    { title: 'Mid-term DSA', subject: 'CS301', month: 'Oct', day: '12', vetted: 45, score: 88 },
    { title: 'Final Calculus', subject: 'MAT101', month: 'Oct', day: '10', vetted: 32, score: 92 },
    { title: 'Intro to Physics', subject: 'PHY201', month: 'Oct', day: '08', vetted: 28, score: 85 }
];

export function DashboardExams() {
    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#f8f8f2] font-bold">Recent Exams</h3>
                <Link to="/history">
                    <button className="text-[#6272a4] text-xs font-bold uppercase hover:text-[#f8f8f2] transition-colors underline decoration-[#50fa7b]">
                        View All
                    </button>
                </Link>
            </div>
            <div className="space-y-4">
                {recentExams.map((exam, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ x: 5 }}
                        className="bg-[#1a1b26] border border-[#44475a] rounded-2xl p-4 flex items-center justify-between group cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#282a36] flex flex-col items-center justify-center text-[#ff79c6]">
                                <span className="text-[10px] font-bold uppercase">{exam.month}</span>
                                <span className="text-lg font-black leading-none">{exam.day}</span>
                            </div>
                            <div>
                                <h5 className="text-[#f8f8f2] font-bold text-sm">{exam.title}</h5>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[#6272a4] text-[10px] font-bold">{exam.subject}</span>
                                    <div className="w-1 h-1 rounded-full bg-[#44475a]" />
                                    <span className="text-[#6272a4] text-[10px] font-bold">{exam.vetted} Vetted</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[#50fa7b] font-black text-lg">{exam.score}%</div>
                            <div className="text-[#6272a4] text-[10px] font-bold uppercase tracking-tighter">Avg Score</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
