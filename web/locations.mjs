export const meetingPlaces = [
  { id: 'Yoshida Campus', query: 'Kyoto University Yoshida Campus, Kyoto, Japan' },
  { id: 'Hyakumanben', query: 'Hyakumanben, Sakyo Ward, Kyoto, Japan' },
  { id: 'Demachiyanagi', query: 'Demachiyanagi Station, Kyoto, Japan' },
  { id: 'Shugakuin Dorm', query: 'Kyoto University Shugakuin International House, 1 Yamabana Icchoda-cho, Kyoto, Japan' },
  { id: 'Decide together', query: '' },
];
export function locationQuery(value) {
  return meetingPlaces.find(place => place.id === value)?.query || String(value || '').trim();
}
export function lunchSearchUrl(form) {
  const query = ['lunch restaurant', form.cuisine === 'any' ? '' : form.cuisine,
    form.vegetarian ? 'vegetarian' : '', `near ${locationQuery(form.location)}`,
    `budget ${form.budget} JPY`, form.preferences || ''].filter(Boolean).join(' ');
  const url = new URL('https://www.google.com/maps/search/');
  url.searchParams.set('api', '1');
  url.searchParams.set('query', query);
  return url.href;
}
