import { motion } from 'motion/react';
import { Sparkles, Brain, GraduationCap } from 'lucide-react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  animate?: boolean;
}

export function Logo({ size = 'medium', showText = true, animate = true }: LogoProps) {
  const sizes = {
    small: { container: 'h-10', icon: 'w-5 h-5', text: 'text-sm', badge: 'text-[8px] px-1.5 py-0.5' },
    medium: { container: 'h-16', icon: 'w-7 h-7', text: 'text-xl', badge: 'text-[9px] px-2 py-1' },
    large: { container: 'h-24', icon: 'w-10 h-10', text: 'text-3xl', badge: 'text-xs px-3 py-1' },
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${currentSize.container}`}>
      {/* Logo Icon */}
      <motion.div
        animate={animate ? {
          rotate: [0, 360],
        } : {}}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className={`relative ${size === 'small' ? 'w-10 h-10' : size === 'medium' ? 'w-16 h-16' : 'w-24 h-24'}`}
      >
        {/* Outer Ring */}
        <motion.div
          animate={animate ? {
            rotate: [0, -360],
            scale: [1, 1.05, 1],
          } : {}}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full bg-gradient-to-br from-[#8BE9FD] via-[#C5B3E6] to-[#FFB86C] p-[3px]"
        >
          <div className="w-full h-full rounded-full bg-[#0A1F1F] flex items-center justify-center">
            {/* Inner glow */}
            <motion.div
              animate={animate ? {
                opacity: [0.5, 1, 0.5],
              } : {}}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-2 rounded-full bg-gradient-to-br from-[#C5B3E6]/30 via-[#8BE9FD]/30 to-[#FFB86C]/30 blur-md"
            />
            
            {/* Center icon stack */}
            <div className="relative z-10 flex items-center justify-center">
              <motion.div
                animate={animate ? {
                  y: [0, -2, 0],
                } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Brain className={`${currentSize.icon} text-[#8BE9FD]`} />
              </motion.div>
              
              {/* Sparkle accents */}
              <motion.div
                animate={animate ? {
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                } : {}}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className={`${size === 'small' ? 'w-3 h-3' : size === 'medium' ? 'w-4 h-4' : 'w-5 h-5'} text-[#FFB86C]`} />
              </motion.div>
              
              <motion.div
                animate={animate ? {
                  rotate: [360, 0],
                  scale: [1, 1.2, 1],
                } : {}}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-1 -left-1"
              >
                <Sparkles className={`${size === 'small' ? 'w-2.5 h-2.5' : size === 'medium' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-[#C5B3E6]`} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Orbiting particles */}
        {animate && (
          <>
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
            >
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-[#50FA7B] rounded-full -translate-x-1/2" />
            </motion.div>
            <motion.div
              animate={{
                rotate: [120, 480],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
            >
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-[#FF6AC1] rounded-full -translate-x-1/2" />
            </motion.div>
            <motion.div
              animate={{
                rotate: [240, 600],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
            >
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-[#F1FA8C] rounded-full -translate-x-1/2" />
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <motion.h1
              animate={animate ? {
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              } : {}}
              transition={{ duration: 5, repeat: Infinity }}
              className={`${currentSize.text} font-bold bg-gradient-to-r from-[#8BE9FD] via-[#C5B3E6] to-[#FFB86C] bg-clip-text text-transparent leading-none`}
              style={{ backgroundSize: '200% 200%' }}
            >
              AI Exam Oracle
            </motion.h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <motion.span
              animate={animate ? {
                opacity: [0.7, 1, 0.7],
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={`${currentSize.badge} bg-gradient-to-r from-[#C5B3E6] to-[#8BE9FD] text-white font-bold rounded-full`}
            >
              AI POWERED
            </motion.span>
            <GraduationCap className={`${size === 'small' ? 'w-3 h-3' : size === 'medium' ? 'w-4 h-4' : 'w-5 h-5'} text-[#FFB86C]`} />
          </div>
        </div>
      )}
    </div>
  );
}
