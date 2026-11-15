export const activities = [
  'Card games', 'Board games', 'Cooking together', 'Potluck', 'Drinks',
  'Indian food', 'Chinese food', 'Italian food', 'McDonald’s',
  'Hiking', 'Picnic', 'Ramen', 'Coffee', 'Japanese food', 'Something sweet',
  'Hot pot', 'BBQ', 'Karaoke', 'Movies', 'Video games', 'Badminton',
  'Basketball', 'Cycling', 'Photography', 'Museum', 'Shopping',
  'Study together', 'Outdoors', 'Games',
];

export function normalizePicks(picks) {
  if (!Array.isArray(picks)) return [];
  return [...new Set(picks.filter(pick => typeof pick === 'string')
    .map(pick => pick.trim()).filter(pick => activities.includes(pick) ||
      (pick.startsWith('custom:') && preferenceLabel(pick).trim().length > 0 && pick.length <= 80)))].slice(0, 12);
}

export function directionsUrl(origin, stops, mode = 'walking') {
  const cleanStops = stops.map(stop => String(stop).trim()).filter(Boolean).slice(0, 4);
  if (!String(origin).trim() || !cleanStops.length) return null;
  const allowedModes = ['walking', 'bicycling', 'transit', 'driving'];
  const url = new URL('https://www.google.com/maps/dir/');
  url.searchParams.set('api', '1');
  url.searchParams.set('origin', String(origin).trim());
  url.searchParams.set('destination', cleanStops.at(-1));
  url.searchParams.set('travelmode', allowedModes.includes(mode) ? mode : 'walking');
  // Transit directions do not support intermediate waypoints.
  if (cleanStops.length > 1 && mode !== 'transit') url.searchParams.set('waypoints', cleanStops.slice(0, -1).join('|'));
  return url.href;
}
export const spots=[{id:'river',name:'Kamogawa walk',area:'Demachiyanagi',price:0,tag:'Outdoors',kind:'river',color:'blue',description:'A riverside catch-up near the stepping stones.',query:'Kamogawa Delta Kyoto'}, {id:'ramen',name:'Ramen stop',area:'Hyakumanben',price:1200,tag:'Ramen',kind:'ramen',color:'pink',description:'Find a ramen spot around Hyakumanben.',query:'ramen Hyakumanben Kyoto'}, {id:'cafe',name:'Coffee break',area:'Yoshida area',price:700,tag:'Coffee',kind:'cafe',color:'yellow',description:'A coffee and conversation stop near campus.',query:'cafe Kyoto University Yoshida'}];
export const consensusCategories = ['food', 'activity', 'after'];
const mealPicks = new Set(['Cooking together', 'Potluck', 'Ramen', 'Japanese food', 'Indian food', 'Chinese food', 'Italian food', 'McDonald’s', 'Hot pot', 'BBQ', 'Picnic']);
const extraPicks = new Set(['Drinks', 'Coffee', 'Something sweet']);
export function preferenceLabel(pick) {
  return String(pick).replace(/^custom:(?:(?:food|activity|after):)?/, '');
}
export function preferenceCategory(pick) {
  const explicit = String(pick).match(/^custom:(food|activity|after):/);
  if (explicit) return explicit[1];
  return mealPicks.has(pick) ? 'food' : extraPicks.has(pick) ? 'after' : 'activity';
}
export function consensusSignature(room, category) {
  return JSON.stringify(room.members.filter(member => member.ready).map(member => [member.id,
    [...new Set((member.picks || []).filter(pick => preferenceCategory(pick) === category))].sort(),
  ]).sort((a, b) => String(a[0]).localeCompare(String(b[0]))));
}
export function pollSignature(poll) {
  const votes = Object.values(poll.votes || {});
  return JSON.stringify(poll.options.map(option => [option.id, votes.filter(id => id === option.id).length]));
}
export function consensusSummary(room) {
  const members = room.members.filter(member => member.ready);
  return consensusCategories.map(category => {
    const counts = new Map();
    for (const member of members) for (const pick of new Set(member.picks || [])) {
      if (preferenceCategory(pick) !== category) continue;
      if (!counts.has(pick)) counts.set(pick, { pick, count: 0, names: [] });
      const option = counts.get(pick); option.count++; option.names.push(member.name);
    }
    const signature = consensusSignature(room, category);
    const decisions = (room.decisions?.[category] || []).map(decision => {
      const poll = (room.polls || []).find(item => item.id === decision.pollId);
      // Public poll results omit voter identities. Match the same count signature on both surfaces.
      const voteSignature = poll && (poll.votes ? pollSignature(poll) : JSON.stringify(poll.options.map(option => [option.id, option.count])));
      return { ...decision, stale: decision.signature !== signature || Boolean(decision.pollId && (!poll || decision.pollSignature !== voteSignature)) };
    });
    const options = [...counts.values()].sort((a, b) => b.count - a.count || a.pick.localeCompare(b.pick));
    return { category, signature, options, decisions, saved: members.length,
      answered: members.filter(member => member.picks.some(pick => preferenceCategory(pick) === category)).length,
      highest: options[0]?.count || 0 };
  });
}
export const demo = {
  code: 'DEMO', title: 'Friday after class', time: 'Friday · 16:30', area: 'Yoshida Campus', expectedSize: 10,
  members: [
    { name: 'Yuta', picks: ['Karaoke', 'Indian food'], budget: 2000, ready: true, avatar: 0 },
    { name: 'Fardin', picks: ['Karaoke', 'Japanese food'], budget: 1500, ready: true, avatar: 1 },
    { name: 'Anta', picks: ['Karaoke', 'Indian food', 'Drinks'], budget: 2000, ready: true, avatar: 3 },
    { name: 'Kaya', picks: ['Card games', 'McDonald’s'], budget: 1000, ready: true, avatar: 2 },
    { name: 'Sam', picks: ['Karaoke', 'Indian food'], budget: 1500, ready: true, avatar: 4 },
    { name: 'Lin', picks: ['Karaoke', 'Japanese food'], budget: 2000, ready: true, avatar: 0 },
    { name: 'Rin', picks: ['Drinks', 'Karaoke'], budget: 3000, ready: true, avatar: 1 },
    { name: 'Leo', picks: ['Card games', 'Photography'], budget: 2000, ready: true, avatar: 2 },
    { name: 'Aya', picks: ['Karaoke', 'McDonald’s'], budget: 1500, ready: true, avatar: 3 },
    { name: 'Noah', picks: ['Karaoke', 'Indian food'], budget: 2000, ready: true, avatar: 4 },
  ],
};
