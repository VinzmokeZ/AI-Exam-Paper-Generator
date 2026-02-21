const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx.bak', 'utf8');

// Remove non-ASCII
content = content.replace(/[^\x00-\x7F]/g, "");

// Remove framer-motion import
content = content.replace(/import { motion, AnimatePresence } from 'framer-motion';/, "");

// Replace <motion.xxx with <xxx
content = content.replace(/<motion\.([a-zA-Z0-9]+)/g, "<$1");
// Replace </motion.xxx with </xxx
content = content.replace(/<\/motion\.([a-zA-Z0-9]+)/g, "</$1");

// Remove motion props (whileHover, animate, etc.)
// This is regex-heavy, let's just do a few common ones
content = content.replace(/whileHover={{[^}]+}}/g, "");
content = content.replace(/whileTap={{[^}]+}}/g, "");
content = content.replace(/initial={{[^}]+}}/g, "");
content = content.replace(/animate={{[^}]+}}/g, "");
content = content.replace(/transition={{[^}]+}}/g, "");
content = content.replace(/exit={{[^}]+}}/g, "");

fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log('Dashboard.tsx stripped of motion');
