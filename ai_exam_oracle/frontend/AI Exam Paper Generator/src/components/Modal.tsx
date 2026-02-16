import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    subtitle?: string;
    variant?: 'white' | 'dark';
}

export function Modal({ isOpen, onClose, title, children, subtitle, variant = 'white' }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const modalRoot = document.getElementById('modal-root');
    if (!mounted || !modalRoot) return null;

    return createPortal(
        <AnimatePresence mode="wait">
            {isOpen && (
                <div className="absolute inset-0 z-[99999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm shadow-inner cursor-pointer"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                            mass: 0.8
                        }}
                        className={`w-full max-w-[320px] rounded-[32px] p-6 relative z-10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden ${variant === 'white'
                            ? 'bg-[#F5F1ED]'
                            : 'bg-[#0A1F1F] border-2 border-[#1A3A3A]'
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {variant === 'white' && (
                            <>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5B3E6]/10 rounded-bl-[100px] pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FFB86C]/10 rounded-tr-[100px] pointer-events-none" />
                            </>
                        )}
                        {variant === 'dark' && (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px] pointer-events-none" />
                        )}

                        <div className="flex items-start justify-between mb-6 relative z-20">
                            <div className="min-w-0 pr-4">
                                <h3 className={`text-xl font-black leading-tight italic ${variant === 'white' ? 'text-[#0A1F1F]' : 'text-white'
                                    }`}>
                                    {title}
                                </h3>
                                {subtitle && (
                                    <p className={`text-xs font-bold uppercase tracking-[0.2em] mt-2 ${variant === 'white' ? 'text-[#8B9E9E]' : 'text-white/40'
                                        }`}>
                                        {subtitle}
                                    </p>
                                )}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors z-50 cursor-pointer ${variant === 'white' ? 'bg-[#E5DED6]/50 hover:bg-[#E5DED6]' : 'bg-white/10 hover:bg-white/20'
                                    }`}
                            >
                                <X className={`w-5 h-5 ${variant === 'white' ? 'text-[#8B9E9E]' : 'text-white/60'
                                    }`} strokeWidth={3} />
                            </motion.button>
                        </div>

                        <div className="relative z-20">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        modalRoot
    );
}
