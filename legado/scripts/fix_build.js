const fs = require('fs');
const path = require('path');

// 1. Fix Pagination.jsx
let pagPath = path.join(__dirname, 'front', 'src', 'admin', 'components', 'Pagination.jsx');
if (fs.existsSync(pagPath)) {
    let content = fs.readFileSync(pagPath, 'utf8');
    content = content.replace(/useHistory,\s*/g, '');
    fs.writeFileSync(pagPath, content, 'utf8');
    console.log('Fixed Pagination.jsx');
}

// 2. Fix Navegacao.jsx
let navPath = path.join(__dirname, 'front', 'src', 'components', 'Navegacao.jsx');
if (fs.existsSync(navPath)) {
    let content = fs.readFileSync(navPath, 'utf8');
    content = content.replace(/from "bootstrap";/g, 'from "react-bootstrap";');
    fs.writeFileSync(navPath, content, 'utf8');
    console.log('Fixed Navegacao.jsx');
}

// 3. Fix index.css imports
let cssPath = path.join(__dirname, 'front', 'src', 'index.css');
if (fs.existsSync(cssPath)) {
    let content = fs.readFileSync(cssPath, 'utf8');
    // Remove all @import
    let imports = content.match(/@import\s+[^;]+;/g) || [];
    content = content.replace(/@import\s+[^;]+;/g, '');
    // Put them at the very top
    content = imports.join('\n') + '\n' + content;
    fs.writeFileSync(cssPath, content, 'utf8');
    console.log('Fixed index.css');
}

// 4. Update vite.config.js for tailwindcss v4 compat (if using postcss)
let viteConfigPath = path.join(__dirname, 'front', 'vite.config.js');
let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
if (!viteConfig.includes('css:')) {
    viteConfig = viteConfig.replace('plugins: [react()],', "plugins: [react()],\n  css: {\n    postcss: './postcss.config.js',\n  },");
    fs.writeFileSync(viteConfigPath, viteConfig, 'utf8');
    console.log('Fixed vite.config.js');
}

