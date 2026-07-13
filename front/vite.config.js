import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

const base = process.env.VITE_BASE_URL || '/';

var runtimeFixScript = [
'(function(){',
'var b = document.querySelector(\'meta[name="base-url"]\')?.getAttribute(\'content\') || \'/\';',
'if (b === \'/\' || b === \'\') return;',
'b = b.replace(/[/]+$/, \'\');',
'function p(u) {',
'if (!u || typeof u !== \'string\') return u;',
'if (u.indexOf(\'://\') > -1 || u.indexOf(\'//\') === 0 || u.indexOf(\'data:\') === 0 || u.indexOf(\'#\') === 0 || u.indexOf(\'blob:\') === 0) return u;',
'while (u.indexOf(\'./\') === 0 || u.indexOf(\'../\') === 0) {',
'  u = u.indexOf(\'../\') === 0 ? u.substring(3) : u.substring(2);',
'}',
'if (u.indexOf(b) === 0) {',
'  while (u.indexOf(\'//\') > -1) u = u.replace(\'//\', \'/\');',
'  return u;',
'}',
'if (u === \'/\') return b;',
'u = (u.indexOf(\'/\') === 0) ? b + u : b + \'/\' + u;',
'while (u.indexOf(\'//\') > -1) u = u.replace(\'//\', \'/\');',
'return u;',
'}',
'var _setAttr = Element.prototype.setAttribute;',
'Element.prototype.setAttribute = function(n, v) {',
'if (typeof v === \'string\' && (n === \'src\' || n === \'href\')) v = p(v);',
'_setAttr.call(this, n, v);',
'};',
'var srcProp = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, \'src\');',
'if (srcProp && srcProp.set) {',
'Object.defineProperty(HTMLImageElement.prototype, \'src\', { get: srcProp.get, set: function(v) { srcProp.set.call(this, p(v)); }, configurable: true });',
'}',
'var hrefProp = Object.getOwnPropertyDescriptor(HTMLAnchorElement.prototype, \'href\');',
'if (hrefProp && hrefProp.set) {',
'Object.defineProperty(HTMLAnchorElement.prototype, \'href\', { get: hrefProp.get, set: function(v) { hrefProp.set.call(this, p(v)); }, configurable: true });',
'}',
'var linkHref = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, \'href\');',
'if (linkHref && linkHref.set) {',
'Object.defineProperty(HTMLLinkElement.prototype, \'href\', { get: linkHref.get, set: function(v) { linkHref.set.call(this, p(v)); }, configurable: true });',
'}',
'var _locHref = Object.getOwnPropertyDescriptor(window.Location.prototype, \'href\');',
'if (_locHref && _locHref.set) {',
'Object.defineProperty(window.Location.prototype, \'href\', { get: _locHref.get, set: function(v) { _locHref.set.call(this, typeof v === \'string\' ? p(v) : v); }, configurable: true });',
'}',
'function scan(n) {',
'if (n.nodeType !== 1) return;',
'if (n.tagName === \'A\' && n.getAttribute(\'href\')) n.href = n.getAttribute(\'href\');',
'if (n.tagName === \'IMG\' && n.getAttribute(\'src\')) n.src = n.getAttribute(\'src\');',
'if (n.tagName === \'LINK\' && n.getAttribute(\'href\')) n.href = n.getAttribute(\'href\');',
'for (var i = 0; i < n.children.length; i++) scan(n.children[i]);',
'}',
'scan(document.documentElement);',
'new MutationObserver(function(m) {',
'for (var i = 0; i < m.length; i++) {',
'  if (m[i].type === \'childList\') {',
'    for (var j = 0; j < m[i].addedNodes.length; j++) scan(m[i].addedNodes[j]);',
'  }',
'}',
'}).observe(document, { childList: true, subtree: true });',
'})();'
].join('\n');

export default defineConfig({
  define: {
    'import.meta.env.VITE_BASE_URL': JSON.stringify(process.env.VITE_BASE_URL || ''),
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || ''),
    'import.meta.env.VITE_DOMAIN': JSON.stringify(process.env.VITE_DOMAIN || ''),
    'import.meta.env.VITE_API_SECRET': JSON.stringify(process.env.VITE_API_SECRET || ''),
    'import.meta.env.VITE_ENV': JSON.stringify(process.env.VITE_ENV || 'development'),
  },
  plugins: [
    react(),
    {
      name: 'gh-pages-spa',
      closeBundle() {
        const buildDir = path.resolve(__dirname, 'build');
        const indexHtml = path.join(buildDir, 'index.html');
        const notFoundHtml = path.join(buildDir, '404.html');
        if (fs.existsSync(indexHtml) && !fs.existsSync(notFoundHtml)) {
          fs.copyFileSync(indexHtml, notFoundHtml);
        }
      },
    },
    {
      name: 'base-path-fix',
      transformIndexHtml() {
        return [
          { tag: 'meta', attrs: { name: 'base-url', content: base }, injectTo: 'head-prepend' },
          { tag: 'script', attrs: { type: 'module' }, children: runtimeFixScript, injectTo: 'head-prepend' },
        ];
      },
    },
  ],
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: base,
  build: {
    outDir: 'build',
    cssMinify: false,
  },
});
