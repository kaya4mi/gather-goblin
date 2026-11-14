import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { handleRooms } from '../worker/api.mjs';
import { handleLunch } from '../worker/maps.mjs';

mkdirSync('work', { recursive: true });
const database = new DatabaseSync('work/rooms.sqlite');
for (const file of readdirSync('drizzle').filter(file => file.endsWith('.sql')).sort()) {
  database.exec(readFileSync('drizzle/' + file, 'utf8'));
}
const store = {
  get: async code => database.prepare('SELECT data FROM rooms WHERE code=?').get(code),
  create: async (code, data) => database.prepare('INSERT INTO rooms (code,data) VALUES (?,?)').run(code, data),
  compareAndSwap: async (code, oldData, newData) => database.prepare('UPDATE rooms SET data=? WHERE code=? AND data=?').run(newData, code, oldData).changes > 0,
};
const environment = {
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_DAILY_SEARCH_LIMIT: process.env.GOOGLE_MAPS_DAILY_SEARCH_LIMIT,
  DB: {
    prepare(sql) {
      return { bind(...args) { return { first: async () => database.prepare(sql).get(...args) }; } };
    },
  },
};
const { default: worker } = await import('../dist/server/index.js');
const server = http.createServer(async (incoming, outgoing) => {
  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of incoming) {
      size += chunk.length;
      if (size > 16384) { outgoing.writeHead(413); outgoing.end(); return; }
      chunks.push(chunk);
    }
    const url = 'http://127.0.0.1:3000' + incoming.url;
    const method = incoming.method || 'GET';
    const options = { method, headers: incoming.headers };
    if (!['GET', 'HEAD'].includes(method)) options.body = Buffer.concat(chunks);
    const request = new Request(url, options);
    const path = new URL(url).pathname;
    let response;
    if (path === '/api/rooms') response = await handleRooms(request, store);
    else if (path === '/api/lunch') response = await handleLunch(request, environment);
    else response = await worker.fetch(request, environment);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error(error.message);
    outgoing.writeHead(500);
    outgoing.end('Server error');
  }
});
server.listen(3000, '127.0.0.1', () => console.log('Local: http://127.0.0.1:3000'));
process.on('SIGINT', () => { server.close(); database.close(); process.exit(0); });
