import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowLeft, User, Bell, Palette, Database, Lock, HelpCircle, LogOut, ChevronRight, Sparkles } from 'lucide-react';

const settingsSections = [
  {
    title: 'Account',
    icon: User,
    color: '#C5B3E6',
    items: [
      { label: 'Profile Settings', description: 'Edit your personal info' },
      { label: 'Email Preferences', description: 'Manage notifications' },
    ],
  },
  {
    title: 'Appearance',
    icon: Palette,
    color: '#8BE9FD',
    items: [
      { label: 'Theme', description: 'Dark mode enabled' },
      { label: 'Color Scheme', description: 'Customize colors' },
    ],
  },
  {
    title: 'AI & Training',
    icon: Database,
    color: '#FFB86C',
    items: [
      { label: 'Model Settings', description: 'Configure AI parameters' },
      { label: 'Training Data', description: 'Manage uploaded files' },
    ],
  },
  {
    title: 'Privacy & Security',
    icon: Lock,
    color: '#FF6AC1',
    items: [
      { label: 'Data Privacy', description: 'Control your data' },
      { label: 'Export Data', description: 'Download all content' },
    ],
  },
];

export function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [aiAssist, setAiAssist] = useState(true);

  return (
    <div className="min-h-full">
      {/* Floating background elements */}
      <div className="fixed top-10 left-10 w-40 h-40 bg-[#C5B3E6]/10 rounded-full blur-3xl float-slow" />
      <div className="fixed bottom-20 right-10 w-36 h-36 bg-[#8BE9FD]/10 rounded-full blur-3xl float-slow float-delay-1" />

      {/* Header */}
      <div className="mx-6 mt-4 mb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#0D2626] to-[#0A1F1F] rounded-[32px] p-6 border-4 border-[#0A1F1F] relative overflow-hidden"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-3 right-3 opacity-20"
          >
            <Sparkles className="w-8 h-8 text-[#C5B3E6]" />
          </motion.div>

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
              <h1 className="text-xl font-bold text-[#F5F1ED]">Settings</h1>
              <p className="text-xs text-[#8B9E9E]">Customize your experience</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Profile Card */}
      <div className="px-6 mb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#C5B3E6] to-[#9B86C5] rounded-[32px] p-6 border-4 border-white/30 relative overflow-hidden"
        >
          <motion.div
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute inset-0 opacity-20"
            style={{
              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
              backgroundSize: '200% 200%',
            }}
          />

          <div className="flex items-center gap-4 relative z-10">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center border-3 border-white/50"
            >
              <User className="w-8 h-8 text-[#0A1F1F]" />
            </motion.div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-[#0A1F1F] mb-1">Professor Name</h2>
              <p className="text-sm text-[#0A1F1F] opacity-80">professor@university.edu</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-white/30 backdrop-blur-sm rounded-xl text-sm font-bold text-[#0A1F1F] border-2 border-white/40"
            >
              Edit
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Quick Toggles */}
      <div className="px-6 mb-6 relative z-10">
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNotifications(!notifications)}
            className={`rounded-3xl p-5 border-4 cursor-pointer transition-all ${
              notifications
                ? 'bg-gradient-to-br from-[#8BE9FD] to-[#6FEDD6] border-white/30'
                : 'bg-[#F5F1ED] border-[#E5DED6]'
            }`}
          >
            <Bell className={`w-6 h-6 mb-3 ${notifications ? 'text-[#0A1F1F]' : 'text-[#0A1F1F] opacity-40'}`} />
            <p className={`text-sm font-bold ${notifications ? 'text-[#0A1F1F]' : 'text-[#0A1F1F] opacity-60'}`}>
              Notifications
            </p>
            <p className={`text-xs ${notifications ? 'text-[#0A1F1F] opacity-80' : 'text-[#0A1F1F] opacity-40'}`}>
              {notifications ? 'Enabled' : 'Disabled'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAiAssist(!aiAssist)}
            className={`rounded-3xl p-5 border-4 cursor-pointer transition-all ${
              aiAssist
                ? 'bg-gradient-to-br from-[#FFB86C] to-[#FF6AC1] border-white/30'
                : 'bg-[#F5F1ED] border-[#E5DED6]'
            }`}
          >
            <Sparkles className={`w-6 h-6 mb-3 ${aiAssist ? 'text-[#0A1F1F]' : 'text-[#0A1F1F] opacity-40'}`} />
            <p className={`text-sm font-bold ${aiAssist ? 'text-[#0A1F1F]' : 'text-[#0A1F1F] opacity-60'}`}>
              AI Assist
            </p>
            <p className={`text-xs ${aiAssist ? 'text-[#0A1F1F] opacity-80' : 'text-[#0A1F1F] opacity-40'}`}>
              {aiAssist ? 'Active' : 'Inactive'}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="px-6 pb-6 space-y-3 relative z-10">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + sectionIndex * 0.05 }}
            className="bg-[#F5F1ED] rounded-[28px] border-4 border-[#E5DED6] overflow-hidden"
          >
            <div className="p-4 flex items-center gap-3" style={{ backgroundColor: `${section.color}20` }}>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: section.color }}
              >
                <section.icon className="w-5 h-5 text-[#0A1F1F]" />
              </div>
              <h3 className="text-sm font-bold text-[#0A1F1F]">{section.title}</h3>
            </div>

            <div className="bg-white">
              {section.items.map((item, itemIndex) => (
                <motion.button
                  key={item.label}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-5 py-4 flex items-center justify-between border-b-2 border-[#E5DED6] last:border-b-0"
                >
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[#0A1F1F] mb-0.5">{item.label}</p>
                    <p className="text-xs text-[#0A1F1F] opacity-60">{item.description}</p>
                  </div>
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: itemIndex * 0.2 }}
                  >
                    <ChevronRight className="w-5 h-5 text-[#0A1F1F] opacity-40" />
                  </motion.div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Help & Support */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-br from-[#50FA7B] to-[#6FEDD6] rounded-3xl p-5 border-4 border-white/30 flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-[#0A1F1F]" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-base font-bold text-[#0A1F1F]">Help & Support</p>
            <p className="text-sm text-[#0A1F1F] opacity-80">Get assistance</p>
          </div>
          <ChevronRight className="w-6 h-6 text-[#0A1F1F]" />
        </motion.button>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[#0D2626] rounded-3xl p-5 border-4 border-[#0A1F1F] flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-[#FF6AC1]/20 rounded-2xl flex items-center justify-center">
            <LogOut className="w-6 h-6 text-[#FF6AC1]" />
          </div>
          <p className="flex-1 text-left text-base font-bold text-[#FF6AC1]">Logout</p>
        </motion.button>
      </div>
    </div>
  );
}
