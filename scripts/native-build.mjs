import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';

const apiSource = readFileSync('worker/api.mjs', 'utf8');
const bundledApi = apiSource.replace(/^import .*?;\n/gm, '');
const planner = readFileSync('web/planner.mjs', 'utf8') + '\n' + readFileSync('web/polls.mjs', 'utf8');
const assets = {};
const files = [
  ['/', 'web/index.html', 'text/html'],
  ['/style.css', 'web/style.css', 'text/css'],
  ['/app.js', 'web/app.js', 'text/javascript'],
  ['/art.mjs', 'web/art.mjs', 'text/javascript'],
  ['/planner.mjs', 'web/planner.mjs', 'text/javascript'],
  ['/i18n.mjs', 'web/i18n.mjs', 'text/javascript'],
  ['/polls.mjs', 'web/polls.mjs', 'text/javascript'],
  ['/favicon.svg', 'public/favicon.svg', 'image/svg+xml'],
];
for (const [url, file, mime] of files) {
  assets[url] = { body: readFileSync(file, 'utf8'), mime };
}
assets['/demo-api.mjs'] = {
  body: apiSource.replace("'../web/planner.mjs'", "'./planner.mjs'").replace("'../web/polls.mjs'", "'./polls.mjs'"),
  mime: 'text/javascript',
};
const handler = `
const assets = ${JSON.stringify(assets)};
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/rooms') return handleRooms(request, d1Store(env.DB));
    const asset = assets[url.pathname];
    if (!asset) return new Response('Not found', { status: 404 });
    return new Response(request.method === 'HEAD' ? null : asset.body, {
      headers: {
        'Content-Type': asset.mime + '; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache',
        'Referrer-Policy': 'same-origin',
      },
    });
  },
};
`;
mkdirSync('dist/server', { recursive: true });
mkdirSync('dist/.openai', { recursive: true });
writeFileSync('dist/server/index.js', planner + '\n' + bundledApi + '\n' + handler);
cpSync('.openai/hosting.json', 'dist/.openai/hosting.json');
console.log('Built the app and server.');
