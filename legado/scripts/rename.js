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
    if (filePath.endsWith('.js')) {
        const newPath = filePath.replace(/\.js$/, '.jsx');
        fs.renameSync(filePath, newPath);
    }
});
console.log('Renamed all .js to .jsx in src/');

// Also update index.html to point to .jsx
let htmlPath = path.join(__dirname, 'front', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace('src="/src/index.js"', 'src="/src/index.jsx"');
fs.writeFileSync(htmlPath, html);
