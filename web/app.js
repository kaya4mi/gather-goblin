import { monster, avatar, art } from './art.mjs';
import { activities, spots, makePlans, demo, directionsUrl } from './planner.mjs';
import { languages, translate } from './i18n.mjs';
import { meetingPlaces, locationQuery, lunchSearchUrl } from './locations.mjs';

const find = selector => document.querySelector(selector);
function escapeHtml(value) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
}
function readLocal(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function writeLocal(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { /* The app still works when browser storage is unavailable. */ }
}

const memberToken = readLocal('gg-token', null) || crypto.randomUUID();
writeLocal('gg-token', memberToken);
let language = readLocal('gg-language', 'en');
if (!Object.hasOwn(languages, language)) language = 'en';
const profile = {
  name: '', picks: ['Coffee'], budget: 2000, avatar: 3, avoid: '',
  ...readLocal('gg-profile', {}),
};
const state = {
  view: 'home', room: null, rooms: readLocal('gg-rooms', []),
  busy: false, rolling: false, error: '', lucky: null, showAllMembers: false, pollOptionCount: 3,
  lunch: { location: 'Yoshida Campus', customLocation: '', minutes: 60, budget: 1000, people: 2, maxWalk: 10, mealMinutes: 25, cuisine: 'any', preferences: '', vegetarian: false, returnToClass: true },
  lunchResult: null, lunchError: '', lunchBusy: false,
};
let dialog = '';
let dialogValues = {};
let previousFocus;
let noticeTimer;
let polling = false;
let demoRecord;

const t = (key, values) => translate(language, key, values);
const text = (key, values) => escapeHtml(t(key, values));
const activityText = activity => activity.startsWith('custom:') ? escapeHtml(activity.slice(7)) : text(activity);
const disabled = () => state.busy ? 'disabled' : '';
const ownMember = () => state.room?.members.find(member => member.id === state.room.me?.id);
function button(label, action, className = 'pink', attributes = '') {
  return `<button class="btn ${className}" data-action="${action}" ${attributes}>${label}</button>`;
}
function notify(key, values) {
  find('#messages').innerHTML = `<div class="toast">✦ ${text(key, values)}</div>`;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { find('#messages').innerHTML = ''; }, 4000);
}
function rememberRoom(room) {
  state.rooms = [{ code: room.code, title: room.title, count: room.members.length, avatars: room.members.slice(0, 5).map(member => member.avatar) }, ...state.rooms.filter(item => item.code !== room.code)].slice(0, 12);
  writeLocal('gg-rooms', state.rooms);
}
function capturePreferences() {
  if (find('#name')) profile.name = find('#name').value;
  if (find('#notes')) profile.avoid = find('#notes').value;
  if (find('#budget')) profile.budget = Number(find('#budget').value);
  if (find('#lunch-form')) captureLunch();
}
function captureDialog() {
  if (!dialog) return;
  for (const input of document.querySelectorAll('.modal input, .modal select, .modal textarea')) {
    dialogValues[input.id] = input.value;
  }
}
function restoreDialog() {
  for (const [id, value] of Object.entries(dialogValues)) {
    const input = document.getElementById(id);
    if (input) input.value = value;
  }
}

// Demo requests use the same state transitions as the shared-room API.
async function demoRequest(payload) {
  const { handleRooms } = await import('./demo-api.mjs');
  const store = {
    async get() { return { data: JSON.stringify(demoRecord) }; },
    async compareAndSwap(code, before, after) { demoRecord = JSON.parse(after); return true; },
  };
  const request = new Request('https://demo.local/api/rooms', {
    method: 'POST', body: JSON.stringify({ ...payload, code: 'DE000001' }),
  });
  const response = await handleRooms(request, store);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return { ...data, code: 'DEMO' };
}
async function post(payload) {
  const body = { ...payload, token: memberToken };
  if (state.room?.code === 'DEMO' && payload.action !== 'create') return demoRequest(body);
  let response;
  for (let attempt = 0; attempt < 6; attempt++) {
    response = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Member-Token': memberToken },
      body: JSON.stringify(body),
    });
    if (response.status !== 409 || attempt === 5) break;
    await response.arrayBuffer();
    await new Promise(resolve => setTimeout(resolve, 80 * (attempt + 1) + Math.random() * 100));
  }
  let data;
  try { data = await response.json(); }
  catch { throw new Error('errorGeneric'); }
  if (!response.ok) throw new Error(data.error || 'errorGeneric');
  return data;
}
async function fetchRoom(code) {
  const response = await fetch(`/api/rooms?code=${encodeURIComponent(code)}`, {
    headers: { 'X-Member-Token': memberToken },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'errorGeneric');
  return data;
}
function setRoomUrl(code = '') {
  history.replaceState(null, '', location.pathname + (code ? `?room=${encodeURIComponent(code)}` : ''));
}
function showHome() {
  capturePreferences();
  state.view = 'home';
  state.room = null;
  state.error = '';
  state.lucky = null;
  setRoomUrl();
  render();
  window.scrollTo(0, 0);
}
async function loadRoom(code) {
  state.busy = true;
  state.error = '';
  try {
    const room = await fetchRoom(code.trim().toUpperCase());
    state.room = room;
    state.view = state.room.purpose === 'poll' ? 'poll' : 'room';
    state.lucky = null;
    const me = ownMember();
    if (me) Object.assign(profile, { name: me.name, picks: me.picks, budget: me.budget, avatar: me.avatar, avoid: me.avoid || '' });
    rememberRoom(room);
    closeDialog();
    setRoomUrl(room.code);
    window.scrollTo(0, 0);
  } catch (error) {
    state.error = error.message;
  } finally {
    state.busy = false;
    render();
    if (dialog) { captureDialog(); renderDialog(); }
  }
}
function openDemo() {
  demoRecord = JSON.parse(JSON.stringify(demo));
  demoRecord.code = 'DE000001';
  demoRecord.members = demoRecord.members.map((member, index) => ({
    ...member, id: `demo-${index}`, token: crypto.randomUUID(), attendance: index === 0 ? 'going' : 'maybe',
  }));
  state.room = { ...JSON.parse(JSON.stringify(demoRecord)), code: 'DEMO', me: null };
  state.room.members = state.room.members.map(({ token, ...member }) => member);
  state.view = 'room';
  state.error = '';
  state.lucky = null;
  render();
  window.scrollTo(0, 0);
}

function languageSelect() {
  return `<label class="language-picker"><span class="sr-only">${text('language')}</span><select id="language" aria-label="${text('language')}">${Object.entries(languages).map(([code, name]) => `<option value="${code}" ${code === language ? 'selected' : ''}>${name}</option>`).join('')}</select></label>`;
}
function header() {
  return `<header class="header">
    <button class="brand" data-action="home">${monster(44)}<span>gathering gambling<span class="brand-dot">.</span></span></button>
    <nav aria-label="${text('myRooms')}">
      <button class="nav active" data-action="home">${text('myRooms')}</button>
      <button class="nav" data-action="dialog:explore">${text('explore')} <small>${text('soon')}</small></button>
    </nav>
    ${languageSelect()}
    <button class="profile-btn" aria-label="${text('profileTitle')}" data-action="dialog:profile">${avatar(profile.avatar)}</button>
  </header>`;
}
function homeContent() {
  const first = state.rooms[0];
  return `<section class="hero">
    <div><h1>${text('hero')}</h1><div class="hero-actions">${button('+ ' + text('create'), 'dialog:create')}${button(text('join') + ' ↗', 'dialog:join', 'white')}</div></div>
    <div class="mascot-stage"><span class="pixel-spark s1">✦</span><span class="speech">${text('monsterSpeech')}</span>${monster(285)}<span class="pixel-spark s2">✧</span></div>
  </section>
  <section class="rooms-section">
    <div class="section-title"><h2>${text('yourRooms')} <span class="count">${state.rooms.length || '01'}</span></h2>${first ? `<button class="text-button" data-action="demo">${text('demo')}</button>` : ''}</div>
    <div class="room-grid">
      <article class="room-card"><div class="room-card-top"><span class="label yellow">${text(first ? 'latest' : 'demo')}</span></div>
        <h3>${first ? escapeHtml(first.title) : text('demoTitle')}</h3><p class="muted">${text(first ? 'latestDescription' : 'demoDescription')}</p>
        <div class="room-bottom">${first && !Number.isFinite(first.count) ? '' : avatarStack(first ? (first.avatars || []) : demo.members.slice(0, 5).map(member => member.avatar), first ? first.count : demo.members.length)}${button(text('openRoom') + ' ↗', first ? `load:${first.code}` : 'demo', 'small pink')}</div>
      </article>
      <button class="new-room" data-action="dialog:create"><span class="plus">+</span><strong>${text('startSomething')}</strong><span>${text('roomDescription')}</span></button>
    </div>
    ${state.rooms.length > 1 ? `<div class="saved-rooms">${state.rooms.slice(1).map(room => button(escapeHtml(room.title) + ' ↗', `load:${room.code}`, 'white small')).join('')}</div>` : ''}
  </section>
  <section class="campus-section"><div class="section-title"><h2>${text('quickTools')}</h2></div>
    <div class="quick-grid">${[
      ['lunch', 'lunchTool', 'lunchHint', '✦', 'yellow'],
      ['vote', 'voteTool', 'voteHint', '✓', 'pink-light'],
      ['route', 'routeTool', 'routeHint', '↗', 'tool-blue'],
    ].map(([id, title, description, icon, color]) => `<button class="quick-card ${color}" data-action="dialog:${id}"><span class="tool-icon">${icon}</span><h3>${text(title)}</h3><p>${text(description)}</p><span class="tool-arrow">↗</span></button>`).join('')}</div>
  </section>`;

}
function groupContent() {
  const room = state.room;
  const totals = { going: 0, maybe: 0, conditional: 0 };
  for (const member of room.members) totals[member.attendance || 'maybe']++;
  return `<div class="section-title"><h2>${text('gang')}</h2><span class="count">${room.members.length}</span></div>
    <p class="attendance-tally">${text('tally', totals)}</p>
    ${avatarStack(room.members.slice(0, 5).map(member => member.avatar), room.members.length)}
    ${room.members.length ? (state.showAllMembers ? room.members : room.members.slice(0, 5)).map(member => `<div class="member">${avatar(member.avatar)}<div><strong>${escapeHtml(member.name)}</strong><p>${member.picks.map(activityText).join(' · ')} · ¥${member.budget.toLocaleString()}</p>${member.avoid ? `<p class="member-note">${escapeHtml(member.avoid)}</p>` : ''}<span class="member-status ${member.attendance === 'going' ? 'is-going' : ''}">${text(member.attendance || 'maybe')}</span></div></div>`).join('') : `<p class="muted empty">${text('emptyGroup')}</p>`}
    ${room.members.length > 5 ? `<button class="text-button member-toggle" data-action="toggle-members">${text(state.showAllMembers ? 'showLess' : 'showEveryone', { count: room.members.length })}</button>` : ''}`;
}
function avatarStack(avatars, total) {
  return `<div class="member-summary"><div class="avatars">${avatars.slice(0, 5).map(avatar).join('')}${total > 5 ? `<span class="avatar-overflow">+${total - 5}</span>` : ''}</div><span>${text('people', { count: total })}</span></div>`;
}
function avatarPicker(action) {
  return `<div class="avatar-picker">${[0, 1, 2, 3, 4].map(number => `<button aria-label="${text('avatar')} ${number + 1}" aria-pressed="${profile.avatar === number}" class="${profile.avatar === number ? 'chosen' : ''}" data-action="${action}:${number}">${avatar(number)}</button>`).join('')}</div>`;
}
function attendanceContent() {
  const room = state.room;
  const member = ownMember();
  if (!member) return `<h2>${text('attendanceTitle')}</h2><p class="muted">${text('saveFirst')}</p>`;
  const peers = room.members.filter(person => person.id !== member.id);
  const follow = room.members.find(person => person.id === room.me?.followId);
  return `<h2>${text('attendanceTitle')}</h2><p class="muted">${text('attendanceHint')}</p>
    <label for="attendance">${text('attendance')}</label>
    <select id="attendance">${['maybe', 'going', 'conditional'].map(status => `<option value="${status}" ${member.attendance === status ? 'selected' : ''} ${status === 'conditional' && !peers.length ? 'disabled' : ''}>${text(status)}</option>`).join('')}</select>
    ${peers.length ? `<div id="follow-field" ${member.attendance === 'conditional' ? '' : 'hidden'}><label for="follow-person">${text('followWho')}</label><select id="follow-person"><option value="">${text('choosePerson')}</option>${peers.map(person => `<option value="${escapeHtml(person.id)}" ${room.me?.followId === person.id ? 'selected' : ''}>${escapeHtml(person.name)}</option>`).join('')}</select></div>` : `<p class="footnote">${text('noPeople')}</p>`}
    ${room.me?.dependencyChanged ? `<p class="condition-notice">${text('dependencyChanged')}</p>` : ''}
    ${member.attendance === 'conditional' && follow ? `<p class="condition-notice">${text(room.me?.conditionReady ? 'conditionReady' : 'waiting', { name: follow.name })}</p>` : ''}
    ${room.me?.mutualWait ? `<p class="condition-notice">${text('mutualWait')}</p>` : ''}
    ${room.me?.conditionReady ? button(text('confirmAttendance'), 'confirm-attendance', 'yellow full', disabled()) : ''}
    ${button(text('save'), 'save-attendance', 'white full', disabled())}`;
}
function preferences() {
  return `<div class="room-layout"><section class="panel preferences">
    <div class="section-title"><h2>${text('yourPicks')}</h2><span class="label pink-light">${text(ownMember() ? 'saved' : 'yourTurn')}</span></div>
    <label for="name">${text('name')}</label><input id="name" maxlength="30" value="${escapeHtml(profile.name)}" placeholder="${text('namePlaceholder')}">
    <label>${text('avatar')}</label>${avatarPicker('avatar')}
    <label>${text('mood')}</label><div class="chips">${activities.map((activity, index) => `<button aria-pressed="${profile.picks.includes(activity)}" class="chip c${index % 3} ${profile.picks.includes(activity) ? 'checked' : ''}" data-action="pick:${index}">${text(activity)}${profile.picks.includes(activity) ? ' ✓' : ''}</button>`).join('')}</div>
    <div class="custom-chips">${profile.picks.filter(pick => pick.startsWith('custom:')).map((pick, index) => `<button class="chip checked c1" data-action="remove-custom:${index}" aria-label="${text('removeActivity')}">${activityText(pick)} ×</button>`).join('')}</div>
    <label for="custom-activity">${text('customActivity')}</label><div class="inline-fields"><input id="custom-activity" maxlength="60" placeholder="${text('activityPlaceholder')}">${button(text('addActivity'), 'add-custom', 'white small')}</div>
    <label class="budget-label" for="budget">${text('budget')} <strong id="budget-value">¥${profile.budget.toLocaleString()}</strong></label><input id="budget" type="range" min="0" max="5000" step="100" value="${profile.budget}"><div class="range-labels"><span>¥0</span><span>${text('perPerson')}</span><span>¥5,000</span></div>
    <label for="notes">${text('notes')} <span class="muted">(${text('optional')})</span></label><input id="notes" maxlength="200" value="${escapeHtml(profile.avoid)}" placeholder="${text('notesPlaceholder')}"><p class="footnote">${text('notesHint')}</p>
    ${button(text(state.busy ? 'saving' : ownMember() ? 'update' : 'save'), 'save', 'pink full', disabled())}
  </section><aside><section class="panel group-panel" id="group-panel">${groupContent()}</section>
    <section class="panel attendance-panel" id="attendance-panel">${attendanceContent()}</section>
    <section class="roll-panel">${monster(165)}<h3>${text('readyRoll')}</h3><p>${text('rollDescription')}</p>${button('⚄ ' + text('roll'), 'roll', 'yellow full')}<span class="micro">${text('rulesPreview')}</span></section>
  </aside></div>`;
}
function plansContent() {
  const room = state.room;
  const plans = makePlans(room);
  return `<section class="plans-section"><div class="section-title"><h2>${text(room.selected ? 'confirmedTitle' : 'plans')}</h2>${button('⚄ ' + text('lucky'), 'lucky', 'small white', state.rolling ? 'disabled' : '')}</div><p class="muted">${text('plansHint')}</p>
    ${state.rolling ? `<div class="rolling-state">${monster(220, 'rolling')}<h2>${text('rolling')}</h2></div>` : plans.length ? `<div class="plan-grid">${plans.map((plan, index) => `<article class="plan-card ${room.selected === plan.id ? 'confirmed' : ''} ${state.lucky === plan.id ? 'lucky-plan' : ''}"><span class="label yellow">${text(room.selected === plan.id ? 'confirmed' : state.lucky === plan.id ? 'luckyPick' : index === 0 ? 'bestMatch' : 'anotherWay')}</span>${art(plan.kind)}<h3>${text(plan.id + 'Title')}</h3><p>${text(plan.id + 'Reason')}</p>${plan.id === 'custom' ? `<p>${plan.customPicks.map(activityText).join(' · ')}</p>` : ''}<div class="plan-cost"><strong>~¥${plan.cost.toLocaleString()}</strong><span>${text('perPerson')}</span></div><p class="micro">${text('planningBudget')}</p>${button(text(room.selected === plan.id ? 'seeYou' : 'choose'), `choose:${plan.id}`, 'pink full', state.busy || room.selected === plan.id ? 'disabled' : '')}<button class="map-link" data-action="tab:route">${text('addRoute')} ↗</button></article>`).join('')}</div>` : `<div class="empty panel">${monster(140)}<h3>${text('noPlans')}</h3>${button(text('addPicks'), 'tab:room')}</div>`}
    <p class="footnote">${text('rulesHint')}</p></section>`;
}
function pollsContent() {
  const polls = state.room.polls || [];
  const icons = { food: '✦', activity: '✚', time: '◷', other: '✓' };
  return `<section id="poll-panel"><div class="vote-page-heading"><div><div class="dialog-kicker">${text('voteStep')}</div><h2>${text('voteTool')}</h2><p class="muted">${text('voteIntro')}</p></div>${button('+ ' + text('editVote'), 'dialog:vote', 'white small')}</div>
    ${!ownMember() ? `<div class="voter-identity"><label for="vote-name">${text('voteName')}</label><input id="vote-name" maxlength="30" value="${escapeHtml(profile.name)}" placeholder="${text('namePlaceholder')}"></div>` : ''}
    ${polls.length ? `<div class="ballot-grid">${polls.map((poll, index) => {
      const leading = Math.max(...poll.options.map(option => option.count));
      return `<article class="ballot-card"><div class="ballot-top"><span class="ballot-icon">${icons[poll.kind || 'other']}</span><span class="label">${text((poll.kind || 'other') + 'Poll')}</span><span class="ballot-number">${String(index + 1).padStart(2, '0')}</span></div><h3>${escapeHtml(poll.question)}</h3><p class="ballot-instruction">${text('chooseVote')}</p><div class="poll-options">${poll.options.map((option, optionIndex) => {
        const percent = poll.total ? Math.round(option.count / poll.total * 100) : 0;
        return `<button class="poll-option ${poll.myVote === option.id ? 'voted' : ''}" aria-pressed="${poll.myVote === option.id}" data-action="vote:${poll.id}:${option.id}"><span class="option-index">${String(optionIndex + 1).padStart(2, '0')}</span><span class="option-main"><span>${escapeHtml(option.label)}</span><small>${poll.myVote === option.id ? text('yourChoice') : option.count && option.count === leading ? text('voteLeading') : text('voteCount', { count: option.count })}</small></span><strong>${percent}%</strong><span class="vote-bar" style="width:${percent}%"></span></button>`;
      }).join('')}</div><div class="ballot-footer"><span>${text('voteTotal', { count: poll.total })}</span><span class="voted-dot ${poll.myVote ? 'has-voted' : ''}">${poll.myVote ? '✓ ' + text('saved') : text('optional')}</span></div><p class="footnote">${text('pollRules')}</p></article>`;
    }).join('')}</div>` : `<div class="empty-vote">${monster(100)}<h3>${text('pollEmptyTitle')}</h3>${button('+ ' + text('createVote'), 'dialog:vote')}</div>`}</section>`;
}
function routeContent() {
  const room = state.room;
  const origin = room?.routeOrigin || 'Kyoto University Yoshida Campus, Kyoto';
  const stops = room?.routeStops || [];
  const mode = room?.routeMode || 'walking';
  const url = directionsUrl(origin, stops, mode);
  return `<section class="panel route-panel"><h2>${text('routeTool')}</h2><p class="muted">${text('routeHint')}</p>
    <label for="route-preset">${text('where')}</label><select id="route-preset"><option value="custom">${text('customLocation')}</option>${meetingPlaces.filter(place => place.query).map(place => `<option value="${escapeHtml(place.id)}">${text(place.id)}</option>`).join('')}</select><label for="route-origin">${text('routeOrigin')}</label><input id="route-origin" maxlength="160" value="${escapeHtml(origin)}">
    <label for="route-stops">${text('routeStops')}</label><textarea id="route-stops" rows="4" placeholder="${text('routePlaceholder')}">${escapeHtml(stops.join('\n'))}</textarea><p class="footnote">${text('routeExample')}</p>
    <label for="route-mode">${text('routeMode')}</label><select id="route-mode">${['walking', 'bicycling', 'transit', 'driving'].map(value => `<option value="${value}" ${mode === value ? 'selected' : ''}>${text(value)}</option>`).join('')}</select>
    <a id="route-link" class="btn blue full ${url ? '' : 'disabled-link'}" ${url ? `href="${escapeHtml(url)}"` : 'aria-disabled="true"'} target="_blank" rel="noreferrer">${text('openRoute')} ↗</a>
    ${ownMember() ? button(text('saveRoute'), 'save-route', 'white full', disabled()) : ''}<p class="footnote">${text('routeHonesty')}</p>
    ${room?.routeUpdatedBy ? `<p class="footnote">${text('routeUpdatedBy', { name: room.routeUpdatedBy })}</p>` : ''}</section>`;
}
function readRoute() {
  return { origin: find('#route-origin').value.trim(), stops: find('#route-stops').value.split('\n').map(value => value.trim()).filter(Boolean), mode: find('#route-mode').value };
}
function updateRouteLink() {
  const values = readRoute();
  const link = find('#route-link');
  const valid = values.origin && values.stops.length > 0 && values.stops.length <= 4 && !(values.mode === 'transit' && values.stops.length > 1);
  if (valid) { link.href = directionsUrl(values.origin, values.stops, values.mode); link.removeAttribute('aria-disabled'); }
  else { link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true'); }
  link.classList.toggle('disabled-link', !valid);
}
function addCustomActivity() {
  capturePreferences();
  const value = find('#custom-activity').value.trim().slice(0, 60);
  if (!value) return;
  if (profile.picks.length >= 12) { notify('pickLimit'); return; }
  const pick = 'custom:' + value;
  if (!profile.picks.includes(pick)) profile.picks.push(pick);
  render();
}
async function castVote(pollId, optionId) {
  if (state.busy) return;
  if (find('#vote-name')) profile.name = find('#vote-name').value.trim();
  if (!profile.name) { state.error = 'needName'; render(); find('#vote-name')?.focus(); return; }
  state.busy = true;
  state.error = '';
  try {
    state.room = await post({ action: 'vote', code: state.room.code, pollId, optionId, name: profile.name, avatar: profile.avatar });
    writeLocal('gg-profile', profile);
    if (state.room.code !== 'DEMO') rememberRoom(state.room);
    notify('voteSaved');
  } catch (error) { state.error = error.message; }
  finally { state.busy = false; render(); }
}
async function submitPoll(fields) {
  const question = String(fields.get('question') || '').trim();
  const options = fields.getAll('pollOption').map(value => String(value).trim()).filter(Boolean);
  if (!question || new Set(options).size < 2 || options.length > 12) { state.error = 'invalidPoll'; renderDialog(); return; }
  state.busy = true;
  state.error = '';
  renderDialog();
  try {
    if (state.room) {
      state.room = await post({ action: 'createPoll', code: state.room.code, question, options, kind: fields.get('kind') });
    } else {
      state.room = await post({ action: 'create', title: question, purpose: 'poll', options, kind: fields.get('kind'), expectedSize: 10 });
      rememberRoom(state.room);
      setRoomUrl(state.room.code);
    }
    state.view = 'poll';
    closeDialog();
  } catch (error) { state.error = error.message; }
  finally { state.busy = false; render(); if (dialog) renderDialog(); }
}
async function saveSharedRoute() {
  const route = readRoute();
  capturePreferences();
  state.busy = true;
  state.error = '';
  try {
    state.room = await post({ action: 'saveRoute', code: state.room.code, ...route });
    notify('routeSaved');
    if (dialog) closeDialog();
  } catch (error) { state.error = error.message; }
  finally { state.busy = false; render(); if (dialog) renderDialog(); }
}

function locationFields(id, value, customValue = '', includeUndecided = false) {
  const options = meetingPlaces.filter(place => includeUndecided || place.query);
  const isCustom = !options.some(place => place.id === value);
  return `<select id="${id}" name="${id}" data-location-select>${options.map(place => `<option value="${escapeHtml(place.id)}" ${place.id === value ? 'selected' : ''}>${text(place.id)}</option>`).join('')}<option value="custom" ${isCustom ? 'selected' : ''}>${text('customLocation')}</option></select>
    <input id="${id}-custom" name="${id}-custom" maxlength="180" aria-label="${text('customLocation')}" placeholder="${text('locationPlaceholder')}" value="${escapeHtml(customValue || (isCustom && value !== 'custom' ? value : ''))}" ${isCustom ? 'required' : 'hidden'}>`;
}
function captureLunch() {
  const form = find('#lunch-form');
  if (!form) return;
  const fields = new FormData(form);
  Object.assign(state.lunch, {
    location: String(fields.get('lunch-location') || 'Yoshida Campus'),
    customLocation: String(fields.get('lunch-location-custom') || ''),
    minutes: Number(fields.get('minutes')), budget: Number(fields.get('budget')),
    people: Number(fields.get('people')), maxWalk: Number(fields.get('maxWalk')),
    mealMinutes: Number(fields.get('mealMinutes')), cuisine: String(fields.get('cuisine') || 'any'),
    preferences: String(fields.get('preferences') || ''),
    vegetarian: fields.has('vegetarian'), returnToClass: fields.has('returnToClass'),
  });
}
function lunchPayload() {
  return { ...state.lunch, location: state.lunch.location === 'custom' ? state.lunch.customLocation : state.lunch.location,
    language: language === 'zh' ? 'zh-CN' : language };
}
function lunchContent() {
  const form = state.lunch;
  const cuisines = ['any', 'ramen', 'curry', 'udon', 'soba', 'japanese', 'chinese', 'western', 'cafe'];
  const cuisineKey = value => 'cuisine' + value.charAt(0).toUpperCase() + value.slice(1);
  return `<section class="lunch-workspace"><button class="text-button" data-action="home">← ${text('back')}</button>
    <div class="lunch-heading"><div><div class="dialog-kicker">${text('lunchEyebrow')}</div><h1>${text('lunchTitle')}</h1><p>${text('lunchIntro')}</p></div><div class="lunch-mascot">${monster(120)}<span>✦</span></div></div>
    <div class="lunch-layout"><form id="lunch-form" class="lunch-form"><section class="lunch-form-section"><div class="section-step"><span>01</span><h2>${text('whereNow')}</h2></div>
      <label class="sr-only" for="lunch-location">${text('whereNow')}</label>${locationFields('lunch-location', form.location, form.customLocation)}
      <div class="lunch-form-grid"><div><label for="lunch-minutes">${text('breakMinutes')}</label><div class="number-suffix"><input id="lunch-minutes" name="minutes" type="number" min="20" max="180" value="${form.minutes}" required><span>${text('minuteUnit')}</span></div></div>
      <div><label for="lunch-people">${text('lunchPeople')}</label><input id="lunch-people" name="people" type="number" min="1" step="1" value="${form.people}" required></div></div>
      </section><section class="lunch-form-section"><div class="section-step"><span>02</span><h2>${text('cuisineLabel')}</h2></div>
      <div class="cuisine-selector" role="group" aria-label="${text('cuisineLabel')}">${cuisines.map(value => `<label class="cuisine-choice"><input type="radio" name="cuisine" value="${value}" ${form.cuisine === value ? 'checked' : ''}><span>${text(cuisineKey(value))}</span></label>`).join('')}</div>
      <label for="lunch-preferences">${text('lunchPreferences')}</label><textarea id="lunch-preferences" name="preferences" rows="2" maxlength="200" placeholder="${text('lunchPreferencesPlaceholder')}">${escapeHtml(form.preferences)}</textarea>
      <label class="check-row"><input type="checkbox" name="vegetarian" ${form.vegetarian ? 'checked' : ''}><span>${text('vegetarianOnly')}</span></label>
      </section><section class="lunch-form-section"><div class="section-step"><span>03</span><h2>${text('lunchSummaryTitle')}</h2></div>
      <div class="lunch-form-grid"><div><label for="lunch-budget">${text('lunchBudget')}</label><div class="number-suffix"><input id="lunch-budget" name="budget" type="number" min="0" max="30000" step="100" value="${form.budget}" required><span>¥</span></div></div><div><label for="lunch-walk">${text('maxWalk')}</label><div class="number-suffix"><input id="lunch-walk" name="maxWalk" type="number" min="1" max="45" value="${form.maxWalk}" required><span>${text('minuteUnit')}</span></div></div></div>
      <label for="lunch-meal">${text('mealMinutes')}</label><div class="number-suffix"><input id="lunch-meal" name="mealMinutes" type="number" min="10" max="90" value="${form.mealMinutes}" required><span>${text('minuteUnit')}</span></div>
      <label class="check-row"><input type="checkbox" name="returnToClass" ${form.returnToClass ? 'checked' : ''}><span>${text('returnToClass')}</span></label>
      ${button(text(state.lunchBusy ? 'findingLunch' : 'findLunch') + ' ↗', 'submit-lunch', 'pink full', `type="submit" ${state.lunchBusy ? 'disabled' : ''}`)}</section></form>
      <aside class="lunch-output" aria-live="polite">${lunchResultsContent()}</aside></div></section>`;
}
function lunchResultsContent() {
  const payload = lunchPayload();
  if (state.lunchBusy) return `<div class="lunch-waiting">${monster(120, 'rolling')}<h2>${text('findingLunch')}</h2></div>`;
  const result = state.lunchResult;
  if (state.lunchError) return `<div class="lunch-search-status"><span class="status-icon">⌖</span><h2>${text('lunchSummaryTitle')}</h2><p class="lunch-brief">${text('lunchSummary', { people: payload.people, budget: payload.budget, minutes: payload.minutes })}</p><p class="service-note">${text(state.lunchError)}</p><a class="btn blue full" href="${escapeHtml(lunchSearchUrl(payload))}" target="_blank" rel="noreferrer">${text('searchOnMaps')} ↗</a></div>`;
  if (!result) return `<div class="lunch-empty-output"><div class="pixel-lunch-icon">✦</div><h2>${text('lunchTitle')}</h2><p>${text('lunchIntro')}</p><div class="lunch-brief"><span>⌖</span><span>${text(payload.location || 'Yoshida Campus')}</span></div><div class="brief-chips"><span>¥${payload.budget}</span><span>${payload.minutes} ${text('minuteUnit')}</span><span>${text('people', { count: payload.people })}</span></div></div>`;
  return `<div class="lunch-results-heading"><h2>${text('lunchReady')}</h2><p>${escapeHtml(result.origin?.name)}</p><p class="footnote">${escapeHtml(result.origin?.address)}</p><span class="maps-attribution" translate="no">Google Maps</span>${googleAttributions(result.origin?.attributions)}</div>
    ${result.places.length ? result.places.map((place, index) => `<article class="lunch-place-card"><div class="place-rank">${String(index + 1).padStart(2, '0')}</div><div class="place-heading"><h3>${escapeHtml(place.name)}</h3><span class="place-open">${text(place.openNow ? 'openNow' : 'hoursUnknown')}</span></div><p class="place-address">${escapeHtml(place.address)}</p><div class="place-metrics"><strong>${text('walkTime', { count: place.walkMinutes })}</strong><span>${text('wholeLunchTime', { count: place.totalMinutes })}</span>${payload.returnToClass ? `<small>${text('returnIncluded')}</small>` : ''}</div><div class="price-status ${place.budgetVerified ? 'verified' : ''}">${text(place.budgetVerified ? 'budgetConfirmed' : 'budgetUnknown')}${place.priceLow !== null ? ` · ¥${place.priceLow.toLocaleString()}${place.priceHigh !== null ? '–' + place.priceHigh.toLocaleString() : '+'}` : ''}</div><a class="btn ${index ? 'white' : 'pink'} full" href="${escapeHtml(place.directionsUrl)}" target="_blank" rel="noreferrer">${text('goEat')} ↗</a><p class="footnote">${text('groupCheck')}</p>${payload.vegetarian ? `<p class="footnote">${text('dietCheck')}</p>` : ''}${googleAttributions(place.attributions)}</article>`).join('') : `<div class="no-lunch-results"><h3>${text('noLunchMatch')}</h3></div>`}`;
}
function googleAttributions(attributions = []) {
  return attributions.map(attribution => {
    let url;
    try { url = new URL(attribution.providerUri); } catch { return ''; }
    if (url.protocol !== 'https:') return '';
    return `<a class="footnote" target="_blank" rel="noreferrer" href="${escapeHtml(url.href)}">${escapeHtml(attribution.provider || 'Map data')}</a>`;
  }).join('');
}
async function searchLunch() {
  captureLunch();
  state.lunchBusy = true;
  state.lunchError = '';
  state.lunchResult = null;
  render();
  try {
    const response = await fetch('/api/lunch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lunchPayload()) });
    const data = await response.json();
    if (!response.ok) state.lunchError = data.error || 'mapsServiceError';
    else state.lunchResult = data;
  } catch { state.lunchError = 'mapsServiceError'; }
  finally { state.lunchBusy = false; if (state.view === 'lunch') render(); }
}

function roomContent() {
  const room = state.room;
  return `<div class="room-heading"><div><button class="text-button" data-action="home">← ${text('back')}</button><h1 class="room-title">${room.code === 'DEMO' ? text('demoTitle') : escapeHtml(room.title)}</h1><p class="muted">${text(room.code === 'DEMO' ? 'demoTime' : room.time)} <span class="pink-text">✦</span> ${text(room.area)}</p></div>${monster(150, room.selected ? 'matched' : 'idle')}</div>
    ${room.code === 'DEMO' ? `<div class="demo-banner"><span class="label yellow">${text('demo')}</span>${text('demoBanner')}<button class="text-button" data-action="dialog:create">${text('createReal')} ↗</button></div>` : `<div class="invite-bar"><div><span class="micro">${text('roomCode')}</span> <strong>${escapeHtml(room.code)}</strong></div>${button(text('copyInvite') + ' ↗', 'invite', 'small white')}</div>`}
    <div class="room-tabs"><button class="tab ${state.view === 'room' ? 'selected' : ''}" data-action="tab:room">${text('groupTab')}</button><button class="tab ${state.view === 'plans' ? 'selected' : ''}" data-action="tab:plans">${text('planTab')} ${room.selected ? '✓' : ''}</button><button class="tab ${state.view === 'poll' ? 'selected' : ''}" data-action="tab:poll">${text('votesTab')}</button><button class="tab ${state.view === 'route' ? 'selected' : ''}" data-action="tab:route">${text('routesTab')}</button></div>
    ${state.view === 'room' ? preferences() : state.view === 'poll' ? pollsContent() : state.view === 'route' ? routeContent() : plansContent()}`;
}
function render() {
  const focusedAction = document.activeElement?.dataset.action;
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
  find('#app').innerHTML = `${header()}<main><div class="topline"><span class="location"><span class="pink-text">⌖</span> ${text('location')}</span></div>${state.view === 'home' ? homeContent() : state.view === 'lunch' ? lunchContent() : roomContent()}
    ${state.error ? `<div class="inline-error" role="alert">${text(state.error)}<button aria-label="${text('close')}" data-action="clear-error">×</button></div>` : ''}
    <footer><div class="footer-brand">${monster(28)} gathering gambling.</div><span>${text('footer')}</span><div class="footer-links"><a href="/privacy" target="_blank" rel="noreferrer">${text('privacyLink')}</a><a href="/terms" target="_blank" rel="noreferrer">${text('termsLink')}</a></div></footer></main>`;
  if (focusedAction) document.querySelector(`[data-action="${CSS.escape(focusedAction)}"]`)?.focus({ preventScroll: true });
  const offlineNotice = find('.offline-notice');
  if (offlineNotice) offlineNotice.textContent = t('offline');
}

function openDialog(type) {
  capturePreferences();
  if (type === 'lunch') {
    state.view = 'lunch';
    state.error = '';
    render();
    window.scrollTo(0, 0);
    return;
  }
  if (type === 'vote') state.pollOptionCount = 3;
  previousFocus = document.activeElement;
  dialog = type;
  dialogValues = {};
  state.error = '';
  renderDialog();
  document.body.style.overflow = 'hidden';
  find('#close-dialog')?.focus();
}
function closeDialog() {
  dialog = '';
  dialogValues = {};
  find('#dialogs').innerHTML = '';
  document.body.style.overflow = '';
  if (previousFocus?.isConnected) previousFocus.focus();
}
function renderDialog() {
  if (!dialog) return;
  const spot = spots.find(item => item.id === dialog);
  let content = '';
  if (dialog === 'route') {
    content = `<h2 id="dialog-title">${text('routeTool')}</h2>${routeContent()}`;
  } else if (dialog === 'vote') {
    content = `<div class="dialog-kicker">${text('voteStep')}</div><h2 id="dialog-title">${text('voteTool')}</h2><p class="muted">${text('voteIntro')}</p><form id="poll-form">
      <label for="poll-kind">${text('voteKind')}</label><select id="poll-kind" name="kind">${['food', 'activity', 'time', 'other'].map(kind => `<option value="${kind}" ${kind === 'other' ? 'selected' : ''}>${text(kind + 'Poll')}</option>`).join('')}</select>
      <label for="poll-question">${text('pollQuestion')}</label><input id="poll-question" name="question" maxlength="120" required placeholder="${text('pollQuestionPlaceholder')}">
      <label>${text('pollOptions')}</label><div class="poll-option-editor">${Array.from({ length: state.pollOptionCount }, (_, index) => `<div class="poll-edit-row"><span>${String(index + 1).padStart(2, '0')}</span><input id="poll-option-${index}" name="pollOption" maxlength="80" required aria-label="${text('pollOptionPlaceholder', { number: index + 1 })}" placeholder="${text('pollOptionPlaceholder', { number: index + 1 })}">${state.pollOptionCount > 2 ? `<button type="button" data-action="remove-option:${index}" aria-label="${text('removeOption')}">×</button>` : ''}</div>`).join('')}</div>
      ${state.pollOptionCount < 12 ? `<button type="button" class="add-option" data-action="add-option">+ ${text('addOption')}</button>` : ''}
      <div class="poll-rule-note">${text('pollRules')}</div>${button(text('createVote') + ' ↗', 'submit-vote', 'pink full', `type="submit" ${disabled()}`)}</form>`;
  } else if (dialog === 'create') {
    content = `<span class="label yellow">${text('newRoom')}</span><h2 id="dialog-title">${text('startSomething')}</h2>
      <form id="create-form"><label for="room-title">${text('nameRoom')}</label><input id="room-title" name="title" required maxlength="80" placeholder="${text('demoTitle')}">
      <label for="room-time">${text('when')} <span class="muted">${text('optional')} · ${text('kyotoTime')}</span></label><input id="room-time" type="datetime-local" name="time">
      <label for="group-size">${text('groupSize')}</label><input id="group-size" name="expectedSize" type="number" min="1" step="1" value="10" required><p class="footnote">${text('groupSizeHint')}</p><label for="room-area">${text('where')}</label>${locationFields('room-area', 'Yoshida Campus', '', true)}
      ${button(text(state.busy ? 'creating' : 'create') + ' ↗', 'submit-create', 'pink full', `type="submit" ${disabled()}`)}</form>`;
  } else if (dialog === 'join') {
    content = `<h2 id="dialog-title">${text('joinTitle')}</h2><form id="join-form"><label for="room-code">${text('roomCode')}</label><input id="room-code" name="code" maxlength="8" required pattern="[A-Fa-f0-9]{8}" placeholder="${text('enterCode')}" autocomplete="off" style="text-transform:uppercase">
      ${button(text(state.busy ? 'joining' : 'join') + ' ↗', 'submit-join', 'blue full', `type="submit" ${disabled()}`)}</form>`;
  } else if (dialog === 'explore') {
    content = `${monster(180)}<span class="label yellow">${text('soon')}</span><h2 id="dialog-title">${text('exploreTitle')}</h2><p>${text('exploreHint')}</p>${button(text('forNow') + ' ↗', 'dialog:create', 'pink full')}`;
  } else if (dialog === 'profile') {
    content = `<h2 id="dialog-title">${text('profileTitle')}</h2><p class="muted">${text('profileHint')}</p><label for="profile-name">${text('name')}</label><input id="profile-name" maxlength="30" value="${escapeHtml(profile.name)}">${avatarPicker('profile-avatar')}${button(text('saveProfile'), 'save-profile', 'pink full')}`;
  } else if (spot) {
    content = `${art(spot.kind)}<h2 id="dialog-title">${text(spot.id)}</h2><p>${text(spot.id + 'Description')}</p><p class="muted">${text(spot.area)} · ${spot.price ? text('estimated') + ' ¥' + spot.price : text('free')}</p><p class="footnote">${text('examplePrices')}</p><a class="btn blue full" target="_blank" rel="noreferrer" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.query)}">${text('maps')} ↗</a>`;
  }
  find('#dialogs').innerHTML = `<div class="overlay"><section class="modal ${dialog === 'vote' ? 'vote-dialog' : ''}" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button class="close" id="close-dialog" aria-label="${text('close')}" data-action="close-dialog">×</button>${content}${state.error ? `<p class="error" role="alert">${text(state.error)}</p>` : ''}</section></div>`;
  restoreDialog();
  if (dialog === 'route') updateRouteLink();
  document.querySelectorAll('[data-location-select]').forEach(select => { const custom = document.getElementById(select.id + '-custom'); custom.hidden = select.value !== 'custom'; custom.required = select.value === 'custom'; });
}
async function savePreferences() {
  capturePreferences();
  if (!profile.name.trim()) {
    state.error = 'needName';
    render();
    find('#name')?.focus();
    return;
  }
  state.busy = true;
  state.error = '';
  render();
  try {
    state.room = await post({ action: 'preferences', code: state.room.code, ...profile });
    if (state.room.code !== 'DEMO') rememberRoom(state.room);
    writeLocal('gg-profile', profile);
    state.lucky = null;
    notify('picksSaved');
  } catch (error) {
    state.error = error.message;
  } finally {
    state.busy = false;
    render();
  }
}
async function saveAttendance(confirm = false) {
  capturePreferences();
  const payload = {
    action: confirm ? 'confirmAttendance' : 'attendance',
    code: state.room.code,
    attendance: find('#attendance')?.value,
    followId: find('#follow-person')?.value,
  };
  state.busy = true;
  state.error = '';
  try {
    state.room = await post(payload);
    notify('statusSaved');
  } catch (error) {
    state.error = error.message;
  } finally {
    state.busy = false;
    render();
  }
}
async function choosePlan(id) {
  capturePreferences();
  if (!ownMember()) { state.error = 'saveFirst'; render(); return; }
  state.busy = true;
  state.error = '';
  render();
  try {
    state.room = await post({ action: 'select', code: state.room.code, selected: id });
    notify('planConfirmed');
  } catch (error) {
    state.error = error.message;
  } finally {
    state.busy = false;
    render();
  }
}
function rollPlan(lucky = false) {
  capturePreferences();
  const plans = makePlans(state.room);
  if (!plans.length) { state.error = 'needPicks'; render(); return; }
  state.view = 'plans';
  state.error = '';
  state.rolling = true;
  render();
  const roomCode = state.room.code;
  setTimeout(() => {
    state.rolling = false;
    if (state.room?.code !== roomCode) return;
    if (lucky) state.lucky = plans[Math.floor(Math.random() * plans.length)].id;
    render();
    notify(lucky ? 'luckyReady' : 'plansReady');
  }, 900);
}
async function copyInvite() {
  const url = new URL(location.href);
  url.search = '';
  url.searchParams.set('room', state.room.code);
  try {
    await navigator.clipboard.writeText(url.href);
    notify('inviteCopied');
  } catch {
    notify('shareCode', { code: state.room.code });
  }
}
function switchLanguage(nextLanguage) {
  capturePreferences();
  captureDialog();
  const attendanceDraft = find('#attendance')?.value;
  const followDraft = find('#follow-person')?.value;
  language = nextLanguage;
  writeLocal('gg-language', language);
  render();
  if (dialog) renderDialog();
  if (attendanceDraft && find('#attendance')) {
    find('#attendance').value = attendanceDraft;
    if (find('#follow-person')) find('#follow-person').value = followDraft;
    if (find('#follow-field')) find('#follow-field').hidden = attendanceDraft !== 'conditional';
  }
  find('#language')?.focus();
}

document.addEventListener('input', event => {
  if (['route-origin', 'route-stops', 'route-mode'].includes(event.target.id)) updateRouteLink();
  if (event.target.id === 'budget') {
    profile.budget = Number(event.target.value);
    find('#budget-value').textContent = '¥' + profile.budget.toLocaleString();
  }
});
document.addEventListener('change', event => {
  if (event.target.matches('[data-location-select]')) {
    const customField = document.getElementById(event.target.id + '-custom');
    customField.hidden = event.target.value !== 'custom';
    customField.required = event.target.value === 'custom';
  }
  if (event.target.id === 'route-preset' && event.target.value !== 'custom') {
    find('#route-origin').value = locationQuery(event.target.value);
    updateRouteLink();
  }
  if (event.target.id === 'route-mode') updateRouteLink();
  if (event.target.id === 'language') switchLanguage(event.target.value);
  if (event.target.id === 'attendance' && find('#follow-field')) {
    find('#follow-field').hidden = event.target.value !== 'conditional';
  }
});
const actions = {
  home: showHome,
  'toggle-members': () => { capturePreferences(); state.showAllMembers = !state.showAllMembers; render(); },
  'add-custom': addCustomActivity,
  'save-route': saveSharedRoute,
  'add-option': () => { captureDialog(); if (state.pollOptionCount < 12) state.pollOptionCount++; renderDialog(); },
  demo: openDemo,
  'close-dialog': closeDialog,
  save: savePreferences,
  'save-attendance': () => saveAttendance(),
  'confirm-attendance': () => saveAttendance(true),
  roll: () => rollPlan(),
  lucky: () => rollPlan(true),
  invite: copyInvite,
  'clear-error': () => { state.error = ''; render(); },
  'save-profile': () => {
    profile.name = find('#profile-name').value;
    writeLocal('gg-profile', profile);
    closeDialog(); render(); notify('profileSaved');
  },
};
document.addEventListener('click', async event => {
  const control = event.target.closest('[data-action]');
  if (!control) {
    if (event.target.classList.contains('overlay')) closeDialog();
    return;
  }
  const action = control.dataset.action;
  if (actions[action]) { await actions[action](); return; }
  const [kind, value, optionId] = action.split(':');
  if (kind === 'remove-option') {
    captureDialog();
    const values = Array.from(document.querySelectorAll('[name="pollOption"]'), input => input.value);
    values.splice(Number(value), 1);
    for (let index = 0; index < state.pollOptionCount; index++) delete dialogValues['poll-option-' + index];
    state.pollOptionCount = values.length;
    values.forEach((entry, index) => { dialogValues['poll-option-' + index] = entry; });
    renderDialog(); return;
  }
  if (kind === 'vote') { await castVote(value, optionId); return; }
  if (kind === 'remove-custom') { capturePreferences(); const custom = profile.picks.filter(pick => pick.startsWith('custom:')); profile.picks = profile.picks.filter(pick => pick !== custom[Number(value)]); render(); return; }
  if (kind === 'dialog') openDialog(value);
  if (kind === 'load') await loadRoom(value);
  if (kind === 'choose') await choosePlan(value);
  if (kind === 'tab') { capturePreferences(); state.view = value; state.error = ''; render(); }
  if (kind === 'pick') {
    capturePreferences();
    const activity = activities[Number(value)];
    if (!profile.picks.includes(activity) && profile.picks.length >= 12) { notify('pickLimit'); return; }
    profile.picks = profile.picks.includes(activity) ? profile.picks.filter(pick => pick !== activity) : [...profile.picks, activity];
    render();
  }
  if (kind === 'avatar') { capturePreferences(); profile.avatar = Number(value); render(); }
  if (kind === 'profile-avatar') {
    captureDialog();
    profile.avatar = Number(value);
    renderDialog();
    document.querySelector(`[data-action="${action}"]`)?.focus();
  }
});
document.addEventListener('submit', async event => {
  if (event.target.id === 'lunch-form') { event.preventDefault(); await searchLunch(); return; }
  if (!['create-form', 'join-form', 'poll-form'].includes(event.target.id)) return;
  event.preventDefault();
  captureDialog();
  const fields = new FormData(event.target);
  if (event.target.id === 'poll-form') { await submitPoll(fields); return; }
  if (event.target.id === 'join-form') { await loadRoom(String(fields.get('code'))); return; }
  state.busy = true;
  state.error = '';
  renderDialog();
  try {
    const time = String(fields.get('time') || '').replace('T', ' · ');
    state.room = await post({
      action: 'create', title: fields.get('title'),
      time: time ? time + ' JST' : 'Decide together', area: fields.get('room-area') === 'custom' ? fields.get('room-area-custom') : fields.get('room-area'), expectedSize: Number(fields.get('expectedSize')),
    });
    rememberRoom(state.room);
    state.view = state.room.purpose === 'poll' ? 'poll' : 'room';
    state.lucky = null;
    setRoomUrl(state.room.code);
    closeDialog();
  } catch (error) {
    state.error = error.message;
  } finally {
    state.busy = false;
    render();
    if (dialog) renderDialog();
  }
});
document.addEventListener('keydown', event => {
  if (!dialog) return;
  if (event.key === 'Escape') { closeDialog(); return; }
  if (event.key !== 'Tab') return;
  const controls = [...document.querySelectorAll('.modal button:not(:disabled), .modal input, .modal select, .modal textarea, .modal a')];
  const first = controls[0];
  const last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
});
setInterval(async () => {
  if (!state.room || state.view === 'lunch' || state.room.code === 'DEMO' || polling || state.busy || dialog) return;
  polling = true;
  const code = state.room.code;
  try {
    const room = await fetchRoom(code);
    if (state.room?.code !== code || JSON.stringify(room) === JSON.stringify(state.room)) return;
    const attendanceFocused = find('#attendance-panel')?.contains(document.activeElement);
    state.room = room;
    if (state.view === 'room') {
      find('#group-panel').innerHTML = groupContent();
      if (!attendanceFocused) find('#attendance-panel').innerHTML = attendanceContent();
    } else if (state.view === 'poll') {
      if (find('#poll-panel')?.contains(document.activeElement) && document.activeElement.matches('input,textarea,select')) return;
      const draftName = find('#vote-name')?.value; find('#poll-panel').outerHTML = pollsContent(); if (draftName && find('#vote-name')) find('#vote-name').value = draftName;
    } else if (state.view === 'plans' && !state.rolling) render();
  } catch { /* Transient network failures are retried on the next poll. */ }
  finally { polling = false; }
}, 4000);
render();
const initialCode = new URLSearchParams(location.search).get('room');
if (initialCode) loadRoom(initialCode);
