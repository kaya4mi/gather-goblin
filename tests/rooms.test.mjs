import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {handleRooms} from '../worker/api.mjs';
import {makePlans} from '../web/planner.mjs';
const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE rooms (code TEXT PRIMARY KEY,data TEXT NOT NULL)');
const store={get:async code=>db.prepare('SELECT data FROM rooms WHERE code=?').get(code),create:async(code,data)=>db.prepare('INSERT INTO rooms VALUES (?,?)').run(code,data),compareAndSwap:async(code,oldData,newData)=>db.prepare('UPDATE rooms SET data=? WHERE code=? AND data=?').run(newData,code,oldData).changes>0};
const post=async b=>{const r=await handleRooms(new Request('https://example.com/api/rooms',{method:'POST',body:JSON.stringify(b)}),store);return {status:r.status,data:await r.json()}};
test('shared room lifecycle: concurrent joins, private edit tokens, budget enforcement and confirmation',async()=>{const created=await post({action:'create',title:'Friday',area:'Yoshida'});assert.equal(created.status,201);const code=created.data.code;const alice=crypto.randomUUID(),bob=crypto.randomUUID();const [a,b]=await Promise.all([post({action:'preferences',code,token:alice,name:'Alice',picks:['Ramen'],budget:2000}),post({action:'preferences',code,token:bob,name:'Bob',picks:['Outdoors'],budget:500})]);assert.equal(a.status,200);assert.equal(b.status,200);const r=await handleRooms(new Request('https://example.com/api/rooms?code='+code),store);const data=await r.json();assert.equal(data.members.length,2);assert.ok(data.members.every(m=>!('token'in m)));const plans=makePlans(data);assert.ok(plans.length>=1);assert.ok(plans.every(plan=>plan.cost<=500));assert.equal(plans[0].cost,0);assert.equal((await post({action:'select',code,token:alice,selected:'ramen'})).status,400);assert.equal((await post({action:'select',code,token:crypto.randomUUID(),selected:'river'})).status,403);assert.equal((await post({action:'select',code,token:alice,selected:'river'})).data.selected,'river');const updated=await post({action:'preferences',code,token:bob,name:'Bob updated',picks:['Coffee'],budget:1000});assert.equal(updated.data.members.length,2);assert.equal(updated.data.selected,undefined);assert.equal(updated.data.members[1].name,'Bob updated');});
test('input validation and zero budget',async()=>{assert.equal((await post({action:'create',title:'  '})).status,400);const {data:r}=await post({action:'create',title:'Free hangout'});assert.equal((await post({action:'preferences',code:r.code,token:crypto.randomUUID(),name:'X',budget:-1})).status,400);const {data}=await post({action:'preferences',code:r.code,token:crypto.randomUUID(),name:'X',budget:0,picks:['Ramen']});assert.ok(makePlans(data).every(p=>p.cost===0));assert.equal((await handleRooms(new Request('https://example.com/api/rooms?code=bad'),store)).status,400)});
test('worker serves the UI and rejects unknown routes',async()=>{const {default:worker}=await import('../dist/server/index.js');const r=await worker.fetch(new Request('https://example.com/'),{});assert.equal(r.status,200);assert.match(await r.text(),/Gathering Gambling/);assert.equal((await worker.fetch(new Request('https://example.com/missing'),{})).status,404)});

test('conditional attendance stays private and requires explicit confirmation', async () => {
  const { data: room } = await post({ action: 'create', title: 'Conditional gathering' });
  const code = room.code;
  const alice = crypto.randomUUID();
  const bob = crypto.randomUUID();
  const aliceResponse = await post({ action: 'preferences', code, token: alice, name: 'Alice', budget: 2000, picks: ['Coffee'] });
  const aliceId = aliceResponse.data.me.id;
  const bobResponse = await post({ action: 'preferences', code, token: bob, name: 'Bob', budget: 2000, picks: ['Coffee'] });
  const bobId = bobResponse.data.me.id;
  assert.equal((await post({ action: 'attendance', code, token: bob, attendance: 'conditional', followId: bobId })).status, 400);
  const waiting = await post({ action: 'attendance', code, token: bob, attendance: 'conditional', followId: aliceId });
  assert.equal(waiting.data.me.conditionReady, false);
  assert.ok(waiting.data.members.every(member => !('followId' in member) && !('token' in member)));
  assert.equal((await post({ action: 'confirmAttendance', code, token: bob })).status, 400);
  await post({ action: 'attendance', code, token: alice, attendance: 'going' });
  const getAsBob = async () => {
    const response = await handleRooms(new Request(`https://example.com/api/rooms?code=${code}`, { headers: { 'X-Member-Token': bob } }), store);
    return response.json();
  };
  const ready = await getAsBob();
  assert.equal(ready.me.conditionReady, true);
  assert.equal(ready.members.find(member => member.id === bobId).attendance, 'conditional');
  const confirmed = await post({ action: 'confirmAttendance', code, token: bob });
  assert.equal(confirmed.data.members.find(member => member.id === bobId).attendance, 'going');
  await post({ action: 'attendance', code, token: alice, attendance: 'maybe' });
  const withdrawn = await getAsBob();
  assert.equal(withdrawn.members.find(member => member.id === bobId).attendance, 'conditional');
  assert.equal(withdrawn.me.dependencyChanged, true);
  await post({ action: 'attendance', code, token: alice, attendance: 'conditional', followId: bobId });
  assert.equal((await getAsBob()).me.mutualWait, true);
  const anonymous = await handleRooms(new Request(`https://example.com/api/rooms?code=${code}`), store);
  assert.equal((await anonymous.json()).me, null);
});

test('all visible interface keys exist in English, Chinese and Japanese', async () => {
  const { dictionaries } = await import('../web/i18n.mjs');
  const keys = Object.keys(dictionaries.en).sort();
  for (const language of ['zh', 'ja']) assert.deepEqual(Object.keys(dictionaries[language]).sort(), keys);
});

test('shared polls allow changing a vote without leaking voter capabilities', async () => {
  const { data: room } = await post({ action: 'create', title: 'Lunch?', purpose: 'poll', options: ['Ramen', 'Curry'], expectedSize: 10 });
  assert.equal(room.expectedSize, 10);
  const token = crypto.randomUUID();
  const poll = room.polls[0];
  const vote = async optionId => post({ action: 'vote', code: room.code, token, name: 'Voter', pollId: poll.id, optionId });
  assert.equal((await vote(poll.options[0].id)).data.polls[0].total, 1);
  const changed = (await vote(poll.options[1].id)).data;
  assert.equal(changed.members.length, 1);
  assert.deepEqual(changed.polls[0].options.map(option => option.count), [0, 1]);
  assert.equal(changed.polls[0].total, 1);
  const response = await handleRooms(new Request('https://example.com/api/rooms?code=' + room.code), store);
  const publicData = await response.json();
  assert.equal(publicData.polls[0].myVote, null);
  assert.ok(!JSON.stringify(publicData).includes(token));
});

test('custom preferences and exact shared routes are persisted', async () => {
  const { data: room } = await post({ action: 'create', title: 'Ten friends' });
  const token = crypto.randomUUID();
  const saved = await post({ action: 'preferences', code: room.code, token, name: 'Host', budget: 2000, picks: ['Card games', 'Cooking together', 'custom:Werewolf', 'invalid'] });
  assert.deepEqual(saved.data.members[0].picks, ['Card games', 'Cooking together', 'custom:Werewolf']);
  const route = await post({ action: 'saveRoute', code: room.code, token, origin: 'Kyoto University', stops: ['A shop, Kyoto', 'A park, Kyoto'], mode: 'walking' });
  assert.equal(route.data.routeStops.length, 2);
  assert.equal((await post({ action: 'saveRoute', code: room.code, token, origin: 'Kyoto University', stops: ['A', 'B'], mode: 'transit' })).status, 400);
  const { directionsUrl } = await import('../web/planner.mjs');
  const url = new URL(directionsUrl('Campus', ['First shop', 'Second shop'], 'walking'));
  assert.equal(url.searchParams.get('waypoints'), 'First shop');
  assert.equal(url.searchParams.get('destination'), 'Second shop');
});
