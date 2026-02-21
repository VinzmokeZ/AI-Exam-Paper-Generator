const fs = require('fs');
const path = require('path');

const directory = './src';

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
        const newContent = content.replace(/from\s+["']motion\/react["']/g, 'from "framer-motion"');

        if (content !== newContent) {
            console.log(`Updating: ${filePath}`);
            fs.writeFileSync(filePath, newContent, 'utf8');
        }
    }
});
