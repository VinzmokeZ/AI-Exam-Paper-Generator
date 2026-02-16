const fs = require('fs');
const path = require('path');

const directory = process.argv[2] || './src/components/ui';

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ?
            walk(dirPath, callback) : callback(path.join(dir, f));
    });
};

walk(directory, (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        // Regex to match imports with version suffix
        // Examples: from "@radix-ui/react-slot@1.1.2", from "class-variance-authority@0.7.1"
        const newContent = content.replace(/(from\s+["'])(@?[^"']+?)@[0-9.]+(["'])/g, '$1$2$3');

        if (content !== newContent) {
            console.log(`Fixing: ${filePath}`);
            fs.writeFileSync(filePath, newContent, 'utf8');
        }
    }
});
