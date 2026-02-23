import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AIPromptBox } from './AIPromptBox';

export function AIPromptPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve passed subjectId if available
    const subjectId = location.state?.subjectId;
    const subjectName = location.state?.subjectName;

    return (
        <div className="absolute inset-0 bg-[#0A2F2F]/95 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl bg-[#F5F1ED] rounded-[40px] shadow-2xl overflow-hidden"
            >
                <div className="p-1">
                    <AIPromptBox
                        onClose={() => navigate(-1)}
                        subjectId={subjectId}
                        subjectName={subjectName}
                        engine="cloud" // Default to cloud for the pure prompt page
                    />
                </div>
            </motion.div>
        </div>
    );
}
