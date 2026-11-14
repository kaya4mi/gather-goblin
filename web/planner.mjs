export const activities = [
  'Card games', 'Board games', 'Cooking together', 'Potluck', 'Drinks',
  'Hiking', 'Picnic', 'Ramen', 'Coffee', 'Japanese food', 'Something sweet',
  'Hot pot', 'BBQ', 'Karaoke', 'Movies', 'Video games', 'Badminton',
  'Basketball', 'Cycling', 'Photography', 'Museum', 'Shopping',
  'Study together', 'Outdoors', 'Games',
];

export function normalizePicks(picks) {
  if (!Array.isArray(picks)) return [];
  return [...new Set(picks.filter(pick => typeof pick === 'string')
    .map(pick => pick.trim()).filter(pick => activities.includes(pick) ||
      (pick.startsWith('custom:') && pick.slice(7).trim().length > 0 && pick.length <= 67)))].slice(0, 12);
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
export function makePlans(room) {
  const members = room.members.filter(member => member.ready);
  if (!members.length) return [];
  const budget = Math.min(...members.map(member => member.budget));
  const picks = members.flatMap(member => member.picks);
  const recipes = [
    { id: 'cards', cost: 0, matches: ['Card games', 'Board games', 'Games', 'Video games'], kind: 'cafe' },
    { id: 'cooking', cost: 1000, matches: ['Cooking together', 'Hot pot', 'Japanese food'], kind: 'ramen' },
    { id: 'potluck', cost: 500, matches: ['Potluck', 'BBQ'], kind: 'cafe' },
    { id: 'picnic', cost: 500, matches: ['Picnic', 'Outdoors', 'Photography'], kind: 'river' },
    { id: 'hiking', cost: 0, matches: ['Hiking', 'Cycling'], kind: 'river' },
    { id: 'drinks', cost: 1500, matches: ['Drinks', 'Karaoke'], kind: 'cafe' },
    { id: 'river', cost: 0, matches: ['Outdoors'], kind: 'river' },
    { id: 'ramen', cost: 1200, matches: ['Ramen', 'Japanese food'], kind: 'ramen' },
    { id: 'cafe', cost: 700, matches: ['Coffee', 'Something sweet', 'Study together'], kind: 'cafe' },
    { id: 'custom', cost: 0, matches: [], kind: 'cafe' },
  ];
  const customPicks = [...new Set(picks.filter(pick => pick.startsWith('custom:')))];
  return recipes.map(recipe => ({
    ...recipe,
    score: recipe.id === 'custom' ? picks.filter(pick => pick.startsWith('custom:')).length
      : picks.filter(pick => recipe.matches.includes(pick)).length,
    customPicks,
    budget,
    stops: recipe.id === 'ramen' ? ['Ramen stop', 'Kamogawa walk'] :
      recipe.id === 'river' ? ['Kamogawa walk'] : ['Coffee break'],
    query: spots.find(spot => spot.id === recipe.id)?.query || 'Kyoto University Yoshida Campus',
  })).filter(plan => plan.cost <= budget && plan.score > 0)
    .sort((left, right) => right.score - left.score || left.cost - right.cost).slice(0, 3);
}
export const demo = {
  code: 'DEMO', title: 'Friday after class', time: 'Friday · 16:30', area: 'Yoshida Campus', expectedSize: 10,
  members: [
    { name: 'Yuki', picks: ['Card games', 'Potluck'], budget: 2000, ready: true, avatar: 0 },
    { name: 'Alex', picks: ['Cooking together', 'Drinks'], budget: 1500, ready: true, avatar: 1 },
    { name: 'Mei', picks: ['Card games', 'Picnic'], budget: 2000, ready: true, avatar: 2 },
    { name: 'Haru', picks: ['Hiking', 'Picnic'], budget: 2000, ready: true, avatar: 3 },
    { name: 'Sam', picks: ['Board games', 'Potluck'], budget: 1500, ready: true, avatar: 4 },
    { name: 'Lin', picks: ['Cooking together', 'Card games'], budget: 2000, ready: true, avatar: 0 },
    { name: 'Rin', picks: ['Drinks', 'Karaoke'], budget: 3000, ready: true, avatar: 1 },
    { name: 'Leo', picks: ['Hiking', 'Photography'], budget: 2000, ready: true, avatar: 2 },
    { name: 'Aya', picks: ['Card games', 'Potluck'], budget: 1500, ready: true, avatar: 3 },
    { name: 'Noah', picks: ['Cooking together', 'Movies'], budget: 2000, ready: true, avatar: 4 },
  ],
};
