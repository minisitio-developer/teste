const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

walk(path.join(__dirname, 'front', 'src'), function(filePath) {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // Replace explicit .js imports
        if (content.includes('.js"')) {
            content = content.replace(/\.js"/g, '.jsx"');
            updated = true;
        }
        if (content.includes(".js'")) {
            content = content.replace(/\.js'/g, ".jsx'");
            updated = true;
        }

        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
        }
    }
});
console.log('Fixed explicit imports');

// Fix CSS @import issue
let cssPath = path.join(__dirname, 'front', 'src', 'index.css');
if (fs.existsSync(cssPath)) {
    let cssContent = fs.readFileSync(cssPath, 'utf8');
    // Mover @import para o topo
    const importRegex = /@import\s+[^;]+;/g;
    let imports = cssContent.match(importRegex);
    if (imports) {
        cssContent = cssContent.replace(importRegex, '');
        cssContent = imports.join('\n') + '\n\n' + cssContent;
        fs.writeFileSync(cssPath, cssContent, 'utf8');
        console.log('Fixed index.css imports');
    }
}
