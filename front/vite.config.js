import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const base = process.env.VITE_BASE_URL || '/';

const runtimeFixScript = `
(function(){
  var b = document.querySelector('meta[name="base-url"]')?.getAttribute('content') || '/';
  if (b === '/') return;
  function p(u) {
    if (!u || u.indexOf('://') > -1 || u.indexOf('//') === 0 || u.indexOf('data:') === 0 || u.indexOf('#') === 0) return u;
    if (u.indexOf(b) === 0) return u;
    return (u.indexOf('/') === 0) ? b.replace(/\\/+$/, '') + u : b.replace(/\\/+$/, '') + '/' + u;
  }
  function fix(el) {
    if (el.tagName === 'A' && el.getAttribute('href')) el.href = p(el.getAttribute('href'));
    if (el.tagName === 'IMG' && el.getAttribute('src')) el.src = p(el.getAttribute('src'));
    if (el.tagName === 'LINK' && el.getAttribute('href')) el.href = p(el.getAttribute('href'));
    el.querySelectorAll('a[href], img[src], link[href]').forEach(function(c) {
      if (c.tagName === 'A' && c.getAttribute('href')) c.href = p(c.getAttribute('href'));
      if (c.tagName === 'IMG' && c.getAttribute('src')) c.src = p(c.getAttribute('src'));
      if (c.tagName === 'LINK' && c.getAttribute('href')) c.href = p(c.getAttribute('href'));
    });
  }
  fix(document);
  var o = new MutationObserver(function(m) {
    m.forEach(function(mut) {
      if (mut.type === 'attributes') {
        fix(mut.target);
      } else if (mut.type === 'childList') {
        mut.addedNodes.forEach(function(n) { if (n.nodeType === 1) fix(n); });
      }
    });
  });
  o.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'href'] });
})();
`;

export default defineConfig({
  plugins: [
    react(),
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
