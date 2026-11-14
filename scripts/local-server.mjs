import http from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync} from 'node:fs';
import {handleRooms} from '../worker/api.mjs';
mkdirSync('work',{recursive:true});const db=new DatabaseSync('work/rooms.sqlite');db.exec(readFileSync('drizzle/0000_rooms.sql','utf8'));
const store={get:async code=>db.prepare('SELECT data FROM rooms WHERE code=?').get(code),create:async(code,data)=>db.prepare('INSERT INTO rooms (code,data) VALUES (?,?)').run(code,data),compareAndSwap:async(code,oldData,newData)=>db.prepare('UPDATE rooms SET data=? WHERE code=? AND data=?').run(newData,code,oldData).changes>0};
const {default:worker}=await import('../dist/server/index.js');
const server=http.createServer(async(req,res)=>{try{const chunks=[];for await(const chunk of req){chunks.push(chunk);if(chunks.reduce((n,c)=>n+c.length,0)>16384){res.writeHead(413);res.end();return}}const url='http://127.0.0.1:3000'+req.url;const method=req.method||'GET';const request=new Request(url,{method,headers:req.headers,...(!['GET','HEAD'].includes(method)?{body:Buffer.concat(chunks)}:{})});const response=new URL(url).pathname==='/api/rooms'?await handleRooms(request,store):await worker.fetch(request,{});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()))}catch(e){console.error(e.message);res.writeHead(500);res.end('Server error')}});server.listen(3000,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:3000'));process.on('SIGINT',()=>{server.close();db.close();process.exit(0)});
