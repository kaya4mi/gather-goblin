import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const outputDirectory = new URL('../outputs/', import.meta.url);
mkdirSync(outputDirectory, { recursive: true });
function stripModuleSyntax(source) {
  return source.replace(/^import .*?;\n/gm, '').replace(/\bexport /g, '');
}
const files = ['web/art.mjs', 'web/planner.mjs', 'web/i18n.mjs', 'web/polls.mjs', 'worker/api.mjs'];
const sharedCode = files.map(file => stripModuleSyntax(readFileSync(file, 'utf8'))).join('\n');
const offlineAdapter = `
const offlineKey = 'gg-offline-room-records';
function readOfflineRooms() { return JSON.parse(localStorage.getItem(offlineKey) || '{}'); }
const offlineStore = {
  async get(code) { const records = readOfflineRooms(); return records[code] ? { data: records[code] } : null; },
  async create(code, data) { const records = readOfflineRooms(); records[code] = data; localStorage.setItem(offlineKey, JSON.stringify(records)); },
  async compareAndSwap(code, before, after) {
    const records = readOfflineRooms();
    if (records[code] !== before) return false;
    records[code] = after;
    localStorage.setItem(offlineKey, JSON.stringify(records));
    return true;
  },
};
window.fetch = async (url, options = {}) => {
  const request = new Request(new URL(url, 'https://offline-preview.local'), options);
  return handleRooms(request, offlineStore);
};
`;
let app = stripModuleSyntax(readFileSync('web/app.js', 'utf8'));
app = app.replace("await import('./demo-api.mjs')", '{ handleRooms }');
const script = (sharedCode + '\n' + offlineAdapter + '\n' + app).replaceAll('</script', '<\\/script');
const css = readFileSync('web/style.css', 'utf8');
let html = readFileSync('web/index.html', 'utf8');
html = html.replace('<link rel="icon" href="/favicon.svg">', '');
html = html.replace('<link rel="stylesheet" href="/style.css">', `<style>${css}\n.offline-notice { background: #ffe83c; text-align: center; padding: 10px; font: 15px sans-serif; }</style>`);
html = html.replace('<body>', '<body><div class="offline-notice"></div>');
html = html.replace('<script type="module" src="/app.js"></script>', `<script type="module">${script}</script>`);
writeFileSync(new URL('gathering-gambling-preview.html', outputDirectory), html);
console.log('Saved the offline preview.');
