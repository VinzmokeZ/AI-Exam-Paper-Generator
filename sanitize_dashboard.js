const fs = require('fs');
const content = fs.readFileSync('src/components/Dashboard.tsx.bak', 'utf8');
// Remove non-ASCII characters
const sanitized = content.replace(/[^\x00-\x7F]/g, "");
fs.writeFileSync('src/components/Dashboard.tsx', sanitized);
console.log('Sanitized Dashboard.tsx created');
