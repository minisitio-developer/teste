import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const base = process.env.VITE_BASE_URL || '/';

const runtimeFixScript = `
(function(){
  var b = document.querySelector('meta[name="base-url"]')?.getAttribute('content') || '/';
  if (b === '/' || b === '') return;
  function p(u) {
    if (!u || typeof u !== 'string' || u.indexOf('://') > -1 || u.indexOf('//') === 0 || u.indexOf('data:') === 0 || u.indexOf('#') === 0 || u.indexOf('blob:') === 0) return u;
    if (u.indexOf(b) === 0) return u;
    if (u === '/') return b.replace(/\\/+$/, '');
    return (u.indexOf('/') === 0) ? b.replace(/\\/+$/, '') + u : b.replace(/\\/+$/, '') + '/' + u;
  }
  var srcProp = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  if (srcProp && srcProp.set) {
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      get: srcProp.get,
      set: function(v) { srcProp.set.call(this, p(v)); },
      configurable: true
    });
  }
  var hrefProp = Object.getOwnPropertyDescriptor(HTMLAnchorElement.prototype, 'href');
  if (hrefProp && hrefProp.set) {
    Object.defineProperty(HTMLAnchorElement.prototype, 'href', {
      get: hrefProp.get,
      set: function(v) { hrefProp.set.call(this, p(v)); },
      configurable: true
    });
  }
  var linkHref = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, 'href');
  if (linkHref && linkHref.set) {
    Object.defineProperty(HTMLLinkElement.prototype, 'href', {
      get: linkHref.get,
      set: function(v) { linkHref.set.call(this, p(v)); },
      configurable: true
    });
  }
  (function scan(n) {
    if (n.nodeType !== 1) return;
    if (n.tagName === 'A' && n.getAttribute('href')) n.href = n.getAttribute('href');
    if (n.tagName === 'IMG' && n.getAttribute('src')) n.src = n.getAttribute('src');
    if (n.tagName === 'LINK' && n.getAttribute('href')) n.href = n.getAttribute('href');
    var c = n.children;
    for (var i = 0; i < c.length; i++) scan(c[i]);
  })(document);
  var o = new MutationObserver(function(m) {
    for (var i = 0; i < m.length; i++) {
      if (m[i].type === 'childList') {
        for (var j = 0; j < m[i].addedNodes.length; j++) scan(m[i].addedNodes[j]);
      }
    }
  });
  o.observe(document, { childList: true, subtree: true });
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
