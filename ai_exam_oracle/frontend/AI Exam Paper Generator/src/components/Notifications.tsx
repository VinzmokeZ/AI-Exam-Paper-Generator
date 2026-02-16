import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Info, Sparkles, Clock, Flame, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { notificationService } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

const iconMap: any = {
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  Flame,
  Zap,
};

export function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    try {
      if (notification.unread) {
        await notificationService.markRead(notification.id);
        // Optimistic update
        setNotifications(prev => prev.map(n =>
          n.id === notification.id ? { ...n, unread: false } : n
        ));
      }

      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error("Failed to handle notification click:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    } catch (error) {
      console.error("Failed to mark all read:", error);
    }
  };

  const today = new Date();
  const todaysNotifications = notifications.filter(n => {
    const date = new Date(n.timestamp);
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  });

  const earlierNotifications = notifications.filter(n => {
    const date = new Date(n.timestamp);
    return date.getDate() !== today.getDate() ||
      date.getMonth() !== today.getMonth() ||
      date.getFullYear() !== today.getFullYear();
  });

  return (
    <div className="min-h-full">
      {/* Floating background elements */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-[#50FA7B]/10 rounded-full blur-3xl float-slow" />
      <div className="absolute bottom-20 right-10 w-36 h-36 bg-[#C5B3E6]/10 rounded-full blur-3xl float-slow float-delay-1" />
      <div className="absolute top-1/2 left-5 w-32 h-32 bg-[#8BE9FD]/10 rounded-full blur-3xl float-slow float-delay-2" />

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
              onClick={handleMarkAllRead}
              className="px-4 py-2 bg-[#C5B3E6]/20 rounded-xl text-xs font-bold text-[#C5B3E6] border-2 border-[#C5B3E6]/30"
            >
              Mark all read
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Today's Notifications */}
      <div className="px-6 mb-4 relative z-10">
        <p className="text-xs font-bold text-[#F5F1ED] uppercase mb-3 opacity-60">Latest</p>
        <div className="space-y-3">
          {todaysNotifications.length === 0 && (
            <p className="text-sm text-[#8B9E9E] italic">No new notifications today.</p>
          )}
          {todaysNotifications.map((notification, index) => {
            const Icon = iconMap[notification.icon_name] || Info;
            return (
              <motion.div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`rounded-3xl p-5 border-4 relative overflow-hidden cursor-pointer ${notification.unread ? 'bg-[#F5F1ED] border-[#E5DED6]' : 'bg-[#0D2626] border-[#0A1F1F]'
                  }`}
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
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border-3 ${notification.unread ? '' : 'border-[#0A1F1F]'
                      }`}
                    style={{
                      backgroundColor: `${notification.color}20`,
                      borderColor: notification.unread ? `${notification.color}40` : undefined
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: notification.color }} />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-bold mb-1 ${notification.unread ? 'text-[#0A1F1F]' : 'text-[#F5F1ED]'
                      }`}>
                      {notification.title}
                    </h3>
                    <p className={`text-xs mb-2 line-clamp-2 ${notification.unread ? 'text-[#0A1F1F] opacity-70' : 'text-[#8B9E9E]'
                      }`}>
                      {notification.message}
                    </p>
                    <div className={`flex items-center gap-1.5 text-[10px] ${notification.unread ? 'text-[#0A1F1F] opacity-50' : 'text-[#8B9E9E]'
                      }`}>
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Earlier Notifications */}
      {earlierNotifications.length > 0 && (
        <div className="px-6 pb-6 relative z-10">
          <p className="text-xs font-bold text-[#F5F1ED] uppercase mb-3 opacity-60">Earlier</p>
          <div className="space-y-3">
            {earlierNotifications.map((notification, index) => {
              const Icon = iconMap[notification.icon_name] || Info;
              return (
                <motion.div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
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
                        <span className="font-medium">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State Teaser */}
      {notifications.length > 0 && notifications.every(n => !n.unread) && (
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
      )}
    </div>
  );
}
