const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

let count = 0;
walk(path.join(__dirname, 'front', 'src'), function(filePath) {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // Fix bootstrap.bundle.min.jsx -> .js (it's a real JS file, not JSX)
        if (content.includes('bootstrap.bundle.min.jsx')) {
            content = content.replace(/bootstrap\.bundle\.min\.jsx/g, 'bootstrap.bundle.min.js');
            updated = true;
        }
        
        // Fix any imports from node_modules that were incorrectly .jsx-ified
        // Pattern: import ... from 'something/dist/.../file.jsx' where it should be .js
        const nodeModulesPattern = /from ['"]([^'"]+\/node_modules\/[^'"]+)\.jsx['"]/g;
        const nodeModulesPattern2 = /import ['"]([^'"]+\/node_modules\/[^'"]+)\.jsx['"]/g;
        if (nodeModulesPattern.test(content) || nodeModulesPattern2.test(content)) {
            content = content.replace(/(['"])((?:\.\.\/)*node_modules\/[^'"]+)\.jsx(['"])/g, '$1$2.js$3');
            updated = true;
        }

        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            count++;
        }
    }
});
console.log(`Fixed ${count} files`);
