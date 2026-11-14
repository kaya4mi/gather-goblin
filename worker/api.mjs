import { activities, makePlans } from '../web/planner.mjs';

function json(data, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

function failure(code, status = 400) {
  return json({ error: code }, status);
}

// JSON records from the first prototype remain readable.
export function normalizeRoom(room) {
  room.members = room.members.map((member, index) => ({
    ...member,
    id: member.id || `legacy-${index}`,
    attendance: member.attendance || 'maybe',
  }));
  return room;
}

export function publicRoom(room, token) {
  const own = room.members.find(member => member.token === token);
  const target = room.members.find(member => member.id === own?.followId);
  const publicMembers = room.members.map(({ token: secret, followId, dependencyChanged, ...member }) => member);
  return {
    ...room,
    members: publicMembers,
    me: own ? {
      id: own.id,
      followId: own.followId || '',
      conditionReady: own.attendance === 'conditional' && target?.attendance === 'going',
      mutualWait: own.attendance === 'conditional' && target?.followId === own.id && target.attendance === 'conditional',
      dependencyChanged: Boolean(own.dependencyChanged),
    } : null,
  };
}

function resetDependents(room, changedId) {
  const pending = [changedId];
  const visited = new Set();
  while (pending.length) {
    const targetId = pending.shift();
    if (visited.has(targetId)) continue;
    visited.add(targetId);
    for (const member of room.members) {
      if (member.followId === targetId && member.attendance === 'going') {
        member.attendance = 'conditional';
        member.dependencyChanged = true;
        pending.push(member.id);
      }
    }
  }
}

function updatePreferences(room, payload) {
  const name = String(payload.name || '').trim().slice(0, 30);
  if (!name) return 'needName';
  if (!Number.isFinite(payload.budget) || payload.budget < 0 || payload.budget > 5000) return 'invalidBudget';
  const existing = room.members.find(member => member.token === payload.token);
  if (!existing && room.members.length >= 20) return 'roomFull';
  const member = {
    ...existing,
    id: existing?.id || crypto.randomUUID(),
    name,
    token: payload.token,
    picks: [...new Set(Array.isArray(payload.picks) ? payload.picks.filter(pick => activities.includes(pick)) : [])],
    budget: payload.budget,
    ready: true,
    avatar: Math.abs(Math.floor(Number(payload.avatar) || 0)) % 5,
    avoid: String(payload.avoid || '').slice(0, 200),
    attendance: existing?.attendance || 'maybe',
  };
  if (existing) room.members[room.members.indexOf(existing)] = member;
  else room.members.push(member);
  delete room.selected;
}

function updateAttendance(room, payload) {
  const member = room.members.find(person => person.token === payload.token);
  if (!member) return 'saveFirst';
  if (payload.action === 'confirmAttendance') {
    const target = room.members.find(person => person.id === member.followId);
    if (member.attendance !== 'conditional' || target?.attendance !== 'going') return 'notReady';
    member.attendance = 'going';
    member.dependencyChanged = false;
    return;
  }
  if (!['going', 'maybe', 'conditional'].includes(payload.attendance)) return 'errorGeneric';
  if (payload.attendance === 'conditional') {
    const target = room.members.find(person => person.id === payload.followId);
    if (!target || target.id === member.id) return 'invalidPerson';
    member.followId = target.id;
  } else {
    delete member.followId;
  }
  const wasGoing = member.attendance === 'going';
  member.attendance = payload.attendance;
  member.dependencyChanged = false;
  if (wasGoing && member.attendance !== 'going') resetDependents(room, member.id);
}

export async function handleRooms(request, store) {
  try {
    const url = new URL(request.url);
    const viewerToken = request.headers.get('X-Member-Token') || '';
    if (request.method === 'GET') {
      const code = (url.searchParams.get('code') || '').toUpperCase();
      if (!/^[A-F0-9]{8}$/.test(code)) return failure('invalidCode');
      const row = await store.get(code);
      if (!row) return failure('roomMissing', 404);
      return json(publicRoom(normalizeRoom(JSON.parse(row.data)), viewerToken));
    }
    if (request.method !== 'POST') return failure('errorGeneric', 405);
    if (+(request.headers.get('content-length') || 0) > 16384) return failure('errorGeneric', 413);
    let payload;
    try {
      const raw = await request.text();
      if (raw.length > 16384) return failure('errorGeneric', 413);
      payload = JSON.parse(raw);
    } catch {
      return failure('errorGeneric');
    }
    if (payload.action === 'create') {
      const title = String(payload.title || '').trim().slice(0, 80);
      if (!title) return failure('invalidName');
      const code = crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase();
      const room = {
        code, title,
        area: String(payload.area || 'Yoshida Campus').slice(0, 80),
        time: String(payload.time || 'Decide together').slice(0, 80),
        members: [],
      };
      await store.create(code, JSON.stringify(room));
      return json(publicRoom(room, viewerToken), 201);
    }
    const code = String(payload.code || '').toUpperCase();
    if (!/^[A-F0-9]{8}$/.test(code)) return failure('invalidCode');
    if (typeof payload.token !== 'string' || !/^[a-f0-9-]{36}$/.test(payload.token)) return failure('errorGeneric');
    for (let attempt = 0; attempt < 5; attempt++) {
      const row = await store.get(code);
      if (!row) return failure('roomMissing', 404);
      const room = normalizeRoom(JSON.parse(row.data));
      let error;
      if (payload.action === 'preferences') {
        error = updatePreferences(room, payload);
      } else if (['attendance', 'confirmAttendance'].includes(payload.action)) {
        error = updateAttendance(room, payload);
      } else if (payload.action === 'select') {
        if (!room.members.some(member => member.token === payload.token)) return failure('saveFirst', 403);
        if (!makePlans(room).some(plan => plan.id === payload.selected)) return failure('planChanged');
        room.selected = payload.selected;
      } else {
        return failure('errorGeneric');
      }
      if (error) return failure(error);
      if (await store.compareAndSwap(code, row.data, JSON.stringify(room))) {
        return json(publicRoom(room, payload.token));
      }
    }
    return failure('conflict', 409);
  } catch {
    return failure('errorGeneric', 500);
  }
}

export function d1Store(database) {
  return {
    get: code => database.prepare('SELECT data FROM rooms WHERE code = ?').bind(code).first(),
    create: (code, data) => database.prepare('INSERT INTO rooms (code,data) VALUES (?,?)').bind(code, data).run(),
    async compareAndSwap(code, oldData, newData) {
      const result = await database.prepare('UPDATE rooms SET data=? WHERE code=? AND data=?').bind(newData, code, oldData).run();
      return result.meta.changes > 0;
    },
  };
}
