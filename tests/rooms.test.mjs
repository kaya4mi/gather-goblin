import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {handleRooms} from '../worker/api.mjs';
import {consensusSummary, preferenceCategory, preferenceLabel} from '../web/planner.mjs';
const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE rooms (code TEXT PRIMARY KEY,data TEXT NOT NULL)');
const store={get:async code=>db.prepare('SELECT data FROM rooms WHERE code=?').get(code),create:async(code,data)=>db.prepare('INSERT INTO rooms VALUES (?,?)').run(code,data),compareAndSwap:async(code,oldData,newData)=>db.prepare('UPDATE rooms SET data=? WHERE code=? AND data=?').run(newData,code,oldData).changes>0};
const post=async b=>{const r=await handleRooms(new Request('https://example.com/api/rooms',{method:'POST',body:JSON.stringify(b)}),store);return {status:r.status,data:await r.json()}};
test('shared room preferences, concurrent joins and private edit tokens', async () => {
  const {data:room,status}=await post({action:'create',title:'Friday',area:'Yoshida'}); assert.equal(status,201);
  const alice=crypto.randomUUID(),bob=crypto.randomUUID();
  const results=await Promise.all([post({action:'preferences',code:room.code,token:alice,name:'Alice',picks:['Karaoke','Indian food'],budget:2000}),post({action:'preferences',code:room.code,token:bob,name:'Bob',picks:['Karaoke','Japanese food'],budget:500})]);
  assert.ok(results.every(result=>result.status===200));
  const response=await handleRooms(new Request('https://example.com/api/rooms?code='+room.code),store); const data=await response.json();
  assert.equal(data.members.length,2);assert.ok(data.members.every(member=>!('token' in member)));
  const summary=consensusSummary(data); assert.equal(summary[1].options[0].pick,'Karaoke'); assert.equal(summary[1].options[0].count,2);
  assert.deepEqual(summary[0].options.map(option=>option.count),[1,1]);
  const updated=await post({action:'preferences',code:room.code,token:bob,name:'Bob updated',picks:['Coffee'],budget:1000});
  assert.equal(updated.data.members.length,2);assert.equal(updated.data.members[1].name,'Bob updated');
});
test('input validation and zero budget remain valid without invented price estimates', async () => {
  assert.equal((await post({action:'create',title:'  '})).status,400);
  const {data:room}=await post({action:'create',title:'Free hangout'});
  assert.equal((await post({action:'preferences',code:room.code,token:crypto.randomUUID(),name:'X',budget:-1})).status,400);
  const {data}=await post({action:'preferences',code:room.code,token:crypto.randomUUID(),name:'X',budget:0,picks:['Karaoke']});
  assert.equal(consensusSummary(data)[1].options[0].pick,'Karaoke');
  assert.equal(data.members[0].budget,0);
  assert.equal((await handleRooms(new Request('https://example.com/api/rooms?code=bad'),store)).status,400);
});
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

test('rooms accept more than fifty members and concurrent joins do not overwrite votes', async () => {
  const { data: room } = await post({ action: 'create', title: 'Large collaborative room', expectedSize: 120, purpose: 'poll', options: ['A', 'B'] });
  assert.equal(room.expectedSize, 120);
  const tokens = Array.from({ length: 60 }, () => crypto.randomUUID());
  for (let batch = 0; batch < 6; batch++) {
    const results = await Promise.all(tokens.slice(batch * 10, batch * 10 + 10).map(async (token, offset) => {
      const payload = { action: 'vote', code: room.code, token, name: 'Member ' + (batch * 10 + offset), pollId: room.polls[0].id, optionId: room.polls[0].options[offset % 2].id };
      for (let attempt = 0; attempt < 6; attempt++) {
        const response = await post(payload);
        if (response.status !== 409) return response;
      }
      throw Error('Concurrent update did not settle');
    }));
    assert.ok(results.every(result => result.status === 200));
  }
  const response = await handleRooms(new Request('https://example.com/api/rooms?code=' + room.code), store);
  const saved = await response.json();
  assert.equal(saved.members.length, 60);
  assert.equal(saved.polls[0].total, 60);
  assert.deepEqual(saved.polls[0].options.map(option => option.count), [30, 30]);
});

test('poll creator can add another ballot before voting and creator token stays private', async () => {
  const token = crypto.randomUUID();
  const { data: room } = await post({ action: 'create', token, title: 'First ballot', purpose: 'poll', options: ['A', 'B'], kind: 'activity' });
  assert.equal(room.creatorToken, undefined);
  const result = await post({ action: 'createPoll', token, code: room.code, question: 'Second ballot', options: ['X', 'Y'], kind: 'time' });
  assert.equal(result.status, 200);
  assert.equal(result.data.polls[1].kind, 'time');
  assert.equal(result.data.creatorToken, undefined);
});


test('timeline confirms food separately and retains multiple activities, with stale changes and membership checks', async () => {
  const {data:room}=await post({action:'create',title:'Friday decisions'}); const code=room.code; const a=crypto.randomUUID(),b=crypto.randomUUID();
  await post({action:'preferences',code,token:a,name:'Yuta',budget:2000,picks:['Karaoke','Card games','Indian food','custom:activity:Karting','custom:food:Thai food']});
  let saved=(await post({action:'preferences',code,token:b,name:'Fardin',budget:1500,picks:['Karaoke','Japanese food']})).data;
  const confirm=async(category,pick,token=a,signature=consensusSummary(saved).find(step=>step.category===category).signature)=>post({action:'confirmDecision',code,token,category,pick,signature});
  assert.equal((await confirm('activity','Karaoke',crypto.randomUUID())).status,403);
  assert.equal((await confirm('activity','Karaoke',a,'old')).status,409);
  assert.equal((await confirm('activity','not a choice')).status,400);
  assert.equal((await confirm('food','Karaoke')).status,400);
  const [karaoke,cards]=await Promise.all([confirm('activity','Karaoke'),confirm('activity','Card games')]);
  assert.equal(karaoke.status,200);assert.equal(cards.status,200);
  saved=(await confirm('food','Indian food')).data;
  assert.equal(saved.decisions.activity.length,2);assert.equal(saved.decisions.food[0].pick,'Indian food');
  saved=(await confirm('food','Japanese food')).data;
  assert.equal(saved.decisions.food.length,1);assert.equal(saved.decisions.food[0].pick,'Japanese food');
  assert.equal(preferenceCategory('custom:food:Thai food'),'food');assert.equal(preferenceLabel('custom:food:Thai food'),'Thai food');
  assert.equal(preferenceCategory('custom:Werewolf'),'activity');assert.equal(preferenceLabel('custom:Werewolf'),'Werewolf');
  saved=(await post({action:'preferences',code,token:b,name:'Fardin',budget:1500,picks:['Karaoke','Japanese food','Movies']})).data;
  assert.ok(consensusSummary(saved)[1].decisions.every(decision=>decision.stale));
  assert.equal(consensusSummary(saved)[0].decisions[0].stale,false);
  saved=(await confirm('activity','Karaoke')).data;
  assert.equal(consensusSummary(saved)[1].decisions.find(decision=>decision.pick==='Karaoke').stale,false);
  saved=(await post({action:'removeDecision',code,token:a,category:'activity',pick:'Karaoke'})).data;
  assert.deepEqual(saved.decisions.activity.map(item=>item.pick),['Card games']);
});

test('linked ballot confirms a unique result explicitly, rejects ties, and tracks later vote changes', async () => {
  const {data:room}=await post({action:'create',title:'Dinner first'}); const code=room.code;const a=crypto.randomUUID(),b=crypto.randomUUID();
  await post({action:'preferences',code,token:a,name:'Yuta',budget:2000,picks:['Karaoke','Indian food']});
  await post({action:'preferences',code,token:b,name:'Fardin',budget:1500,picks:['Karaoke','Japanese food']});
  const {data:created}=await post({action:'createPoll',code,token:a,question:'Dinner?',kind:'food',consensusCategory:'food',options:['Indian food','Japanese food','Thai food'],optionPicks:['Indian food','Japanese food','']});
  let poll=created.polls[0]; assert.equal(poll.consensusCategory,'food'); assert.equal(poll.options[2].pick,'custom:food:Thai food');
  let saved=created;
  const confirm=async pick=>post({action:'confirmDecision',code,token:a,category:'food',pick,signature:consensusSummary(saved)[0].signature,pollId:poll.id,pollSignature:JSON.stringify(poll.options.map(option=>[option.id,option.count]))});
  assert.equal((await confirm('Indian food')).status,400);
  const vote=async(token,index)=>{saved=(await post({action:'vote',code,token,name:'Member',pollId:poll.id,optionId:poll.options[index].id})).data;poll=saved.polls[0];};
  await vote(a,0); await vote(b,1); assert.equal((await confirm('Indian food')).status,400);
  await vote(b,0);
  assert.equal(saved.decisions,undefined);
  saved=(await confirm('Indian food')).data; assert.equal(consensusSummary(saved)[0].decisions[0].stale,false);
  assert.ok(!JSON.stringify(saved).includes(a));assert.ok(!JSON.stringify(saved).includes(b));
  await vote(b,1); assert.equal(consensusSummary(saved)[0].decisions[0].stale,true);
  await vote(a,2);await vote(b,2);
  saved=(await confirm('custom:food:Thai food')).data;
  assert.equal(saved.decisions.food[0].pick,'custom:food:Thai food');
  assert.equal(consensusSummary(saved)[0].decisions[0].stale,false);
});
