import { motion } from 'framer-motion';
import { Zap, BookOpen, CheckSquare, LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Feature {
    title: string;
    desc: string;
    icon: LucideIcon;
    color: string;
    bg: string;
    path: string;
}

const features: Feature[] = [
    {
        title: 'Generate Exam',
        desc: 'AI-powered question generation from syllabus or topics.',
        icon: Zap,
        color: 'text-[#50fa7b]',
        bg: 'bg-[#50fa7b]/5 hover:bg-[#50fa7b]/10',
        path: '/generate'
    },
    {
        title: 'Question Library',
        desc: 'Browse and manage your bank of vetted questions.',
        icon: BookOpen,
        color: 'text-[#8be9fd]',
        bg: 'bg-[#8be9fd]/5 hover:bg-[#8be9fd]/10',
        path: '/subjects'
    },
    {
        title: 'Create Rubric',
        desc: 'Define custom grading standards for your exams.',
        icon: CheckSquare,
        color: 'text-[#ff79c6]',
        bg: 'bg-[#ff79c6]/5 hover:bg-[#ff79c6]/10',
        path: '/create-rubric'
    }
];

export function DashboardFeatures() {
    return (
        <section className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
                <Link key={feature.title} to={feature.path} className="block">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className={`p-5 rounded-3xl border border-[#44475a] relative overflow-hidden group cursor-pointer h-full ${feature.bg}`}
                    >
                        <div className="relative z-10">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-[#1a1b26]/80 backdrop-blur-sm`}>
                                <feature.icon className={`w-5 h-5 ${feature.color}`} />
                            </div>
                            <h4 className="text-[#f8f8f2] font-bold text-sm mb-1 leading-tight">{feature.title}</h4>
                            <p className="text-[#6272a4] text-[11px] leading-relaxed line-clamp-2">{feature.desc}</p>
                        </div>
                        <div className="absolute -right-2 -bottom-2 opacity-10 transition-transform group-hover:scale-110 group-hover:rotate-12">
                            <feature.icon className="w-16 h-16 text-[#f8f8f2]" />
                        </div>
                    </motion.div>
                </Link>
            ))}
        </section>
    );
}
