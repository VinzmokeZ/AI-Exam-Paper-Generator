import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowLeft, CheckCircle, AlertCircle, Info, Sparkles, Clock } from 'lucide-react';

const notifications = [
  {
    id: 1,
    type: 'success',
    title: 'Exam Generated Successfully',
    message: 'Your Computer Science final exam has been generated with 27 questions',
    time: '2 min ago',
    color: '#50FA7B',
    icon: CheckCircle,
    unread: true,
  },
  {
    id: 2,
    type: 'info',
    title: 'Training Complete',
    message: 'AI model training completed for Mathematics (MATH101)',
    time: '15 min ago',
    color: '#8BE9FD',
    icon: Sparkles,
    unread: true,
  },
  {
    id: 3,
    type: 'warning',
    title: 'Vetting Required',
    message: '50 questions are pending review in your vetting center',
    time: '1 hour ago',
    color: '#FFB86C',
    icon: AlertCircle,
    unread: true,
  },
  {
    id: 4,
    type: 'info',
    title: 'New Achievement',
    message: 'You unlocked "Question Master" badge!',
    time: '3 hours ago',
    color: '#C5B3E6',
    icon: Sparkles,
    unread: false,
  },
  {
    id: 5,
    type: 'info',
    title: 'Weekly Report Ready',
    message: 'Your weekly analytics report is now available',
    time: '1 day ago',
    color: '#FF6AC1',
    icon: Info,
    unread: false,
  },
];

export function Notifications() {
  return (
    <div className="min-h-full">
      {/* Floating background elements */}
      <div className="fixed top-20 left-10 w-40 h-40 bg-[#50FA7B]/10 rounded-full blur-3xl float-slow" />
      <div className="fixed bottom-20 right-10 w-36 h-36 bg-[#C5B3E6]/10 rounded-full blur-3xl float-slow float-delay-1" />
      <div className="fixed top-1/2 left-5 w-32 h-32 bg-[#8BE9FD]/10 rounded-full blur-3xl float-slow float-delay-2" />

      {/* Header */}
      <div className="mx-6 mt-4 mb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#0D2626] to-[#0A1F1F] rounded-[32px] p-6 border-4 border-[#0A1F1F] relative overflow-hidden"
        >
          {/* Animated particles */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -15, 0],
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2.5 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${15 + i * 20}%`,
                top: `${20 + i * 15}%`,
                backgroundColor: ['#50FA7B', '#8BE9FD', '#FFB86C', '#C5B3E6'][i],
              }}
            />
          ))}

          <div className="flex items-center gap-3 relative z-10">
            <Link to="/">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-[#0A1F1F] rounded-xl flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 text-[#F5F1ED]" />
              </motion.div>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-[#F5F1ED]">Notifications</h1>
              <p className="text-xs text-[#8B9E9E]">
                {notifications.filter(n => n.unread).length} unread
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-[#C5B3E6]/20 rounded-xl text-xs font-bold text-[#C5B3E6] border-2 border-[#C5B3E6]/30"
            >
              Mark all read
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Today's Notifications */}
      <div className="px-6 mb-4 relative z-10">
        <p className="text-xs font-bold text-[#F5F1ED] uppercase mb-3 opacity-60">Today</p>
        <div className="space-y-3">
          {notifications.filter((_, i) => i < 3).map((notification, index) => {
            const Icon = notification.icon;
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#F5F1ED] rounded-3xl p-5 border-4 border-[#E5DED6] relative overflow-hidden cursor-pointer"
              >
                {/* Unread indicator */}
                {notification.unread && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-5 right-5 w-3 h-3 rounded-full"
                    style={{ backgroundColor: notification.color }}
                  />
                )}

                {/* Colored accent */}
                <div 
                  className="absolute bottom-0 right-0 w-24 h-24 rounded-tl-[96px] opacity-20"
                  style={{ backgroundColor: notification.color }}
                />

                <div className="flex gap-4 relative z-10">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border-3"
                    style={{ 
                      backgroundColor: `${notification.color}20`,
                      borderColor: `${notification.color}40`
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: notification.color }} />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[#0A1F1F] mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-xs text-[#0A1F1F] opacity-70 mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#0A1F1F] opacity-50">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">{notification.time}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Earlier Notifications */}
      <div className="px-6 pb-6 relative z-10">
        <p className="text-xs font-bold text-[#F5F1ED] uppercase mb-3 opacity-60">Earlier</p>
        <div className="space-y-3">
          {notifications.filter((_, i) => i >= 3).map((notification, index) => {
            const Icon = notification.icon;
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#0D2626] rounded-3xl p-5 border-4 border-[#0A1F1F] relative overflow-hidden cursor-pointer"
              >
                {/* Colored accent */}
                <div 
                  className="absolute bottom-0 right-0 w-20 h-20 rounded-tl-[80px] opacity-10"
                  style={{ backgroundColor: notification.color }}
                />

                <div className="flex gap-4 relative z-10">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border-3 border-[#0A1F1F]"
                    style={{ backgroundColor: `${notification.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: notification.color }} />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[#F5F1ED] mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-xs text-[#8B9E9E] mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#8B9E9E]">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">{notification.time}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Empty State Teaser */}
      <div className="px-6 pb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#C5B3E6] to-[#9B86C5] rounded-[32px] p-6 text-center border-4 border-white/30 relative overflow-hidden"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-4 right-4 opacity-20"
          >
            <Sparkles className="w-12 h-12 text-white" />
          </motion.div>

          <div className="relative z-10">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 mx-auto mb-4 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            >
              <CheckCircle className="w-8 h-8 text-[#0A1F1F]" />
            </motion.div>
            <p className="text-sm font-bold text-[#0A1F1F] mb-1">All caught up!</p>
            <p className="text-xs text-[#0A1F1F] opacity-80">You've seen all notifications</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
