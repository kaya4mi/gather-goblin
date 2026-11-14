import { locationQuery, lunchSearchUrl } from '../web/locations.mjs';

const mapResponse = (data, status = 200) => Response.json(data, {
  status, headers: { 'Cache-Control': 'no-store' },
});
const parseDuration = value => Number(String(value || '0s').replace(/s$/, ''));
function bounded(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
}
function normalizeLunch(input) {
  return {
    location: String(input.location || '').trim().slice(0, 180),
    minutes: bounded(input.minutes, 20, 180, 60),
    budget: bounded(input.budget, 0, 30000, 1000),
    maxWalk: bounded(input.maxWalk, 1, 45, 10),
    mealMinutes: bounded(input.mealMinutes, 10, 90, 25),
    people: Math.max(1, Math.round(bounded(input.people, 1, Number.MAX_SAFE_INTEGER, 2))),
    cuisine: ['any', 'ramen', 'curry', 'udon', 'soba', 'japanese', 'chinese', 'western', 'cafe'].includes(input.cuisine) ? input.cuisine : 'any',
    preferences: String(input.preferences || '').trim().slice(0, 200),
    vegetarian: input.vegetarian === true,
    returnToClass: input.returnToClass !== false,
    language: ['en', 'zh-CN', 'ja'].includes(input.language) ? input.language : 'en',
  };
}
async function googleRequest(url, body, mask, key, fetcher) {
  const response = await fetcher(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': mask },
    body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(response.status === 429 ? 'mapsQuota' : 'mapsServiceError');
  return response.json();
}
async function reserveSearch(database, limit) {
  if (!database) throw new Error('mapsServiceError');
  const day = new Date().toISOString().slice(0, 10);
  const key = 'google-lunch:' + day;
  const row = await database.prepare(`INSERT INTO service_usage (key, count) VALUES (?, 1)
    ON CONFLICT(key) DO UPDATE SET count = count + 1 WHERE count < ? RETURNING count`).bind(key, limit).first();
  return Boolean(row);
}
function routeLink(origin, place, returnToClass) {
  const url = new URL('https://www.google.com/maps/dir/');
  url.searchParams.set('api', '1');
  url.searchParams.set('origin', `${origin.location.latitude},${origin.location.longitude}`);
  url.searchParams.set('origin_place_id', origin.id);
  url.searchParams.set('travelmode', 'walking');
  const destination = returnToClass ? origin : place;
  url.searchParams.set('destination', `${destination.location.latitude},${destination.location.longitude}`);
  url.searchParams.set('destination_place_id', destination.id);
  if (returnToClass) {
    url.searchParams.set('waypoints', `${place.location.latitude},${place.location.longitude}`);
    url.searchParams.set('waypoint_place_ids', place.id);
  }
  return url.href;
}
function priceAmount(price) {
  if (!price || price.currencyCode !== 'JPY') return null;
  return Number(price.units || 0) + Number(price.nanos || 0) / 1e9;
}
export async function recommendLunch(form, key, fetcher = fetch) {
  const originResult = await googleRequest('https://places.googleapis.com/v1/places:searchText', {
    textQuery: locationQuery(form.location), pageSize: 1, languageCode: form.language, regionCode: 'JP',
  }, 'places.id,places.displayName,places.formattedAddress,places.location,places.attributions', key, fetcher);
  const origin = originResult.places?.[0];
  if (!origin?.location) throw new Error('locationNotFound');
  // Keep this Kyoto tool within its supported city instead of silently routing in another country.
  if (origin.location.latitude < 34.8 || origin.location.latitude > 35.3 || origin.location.longitude < 135.5 || origin.location.longitude > 135.95) throw new Error('kyotoOnly');
  const query = ['lunch restaurant', form.cuisine === 'any' ? '' : form.cuisine,
    form.vegetarian ? 'vegetarian' : '', form.preferences, `near ${origin.displayName?.text || form.location}, Kyoto, Japan`].filter(Boolean).join(' ');
  const restaurants = await googleRequest('https://places.googleapis.com/v1/places:searchText', {
    textQuery: query, pageSize: 5, languageCode: form.language, regionCode: 'JP',
    locationBias: { circle: { center: origin.location, radius: Math.min(3500, form.maxWalk * 100) } },
  }, 'places.id,places.displayName,places.formattedAddress,places.location,places.googleMapsUri,places.currentOpeningHours,places.priceRange,places.servesVegetarianFood,places.attributions', key, fetcher);
  let routeFailures = 0;
  const candidates = await Promise.all((restaurants.places || []).map(async place => {
    if (!place.location || place.currentOpeningHours?.openNow === false) return null;
    if (form.vegetarian && place.servesVegetarianFood === false) return null;
    const low = priceAmount(place.priceRange?.startPrice);
    const high = priceAmount(place.priceRange?.endPrice);
    if (low !== null && low > form.budget) return null;
    const routeBody = {
      origin: { location: { latLng: origin.location } },
      destination: { location: { latLng: form.returnToClass ? origin.location : place.location } },
      travelMode: 'WALK', languageCode: form.language, units: 'METRIC',
    };
    if (form.returnToClass) routeBody.intermediates = [{ location: { latLng: place.location } }];
    try {
      const routeData = await googleRequest('https://routes.googleapis.com/directions/v2:computeRoutes', routeBody,
        'routes.duration,routes.distanceMeters,routes.legs.duration', key, fetcher);
      const route = routeData.routes?.[0];
      if (!route) return null;
      const walkMinutes = Math.ceil(parseDuration(route.legs?.[0]?.duration || route.duration) / 60);
      const totalMinutes = Math.ceil(parseDuration(route.duration) / 60) + form.mealMinutes;
      if (walkMinutes > form.maxWalk || totalMinutes > form.minutes) return null;
      return {
        id: place.id, name: place.displayName?.text || place.id, address: place.formattedAddress || '',
        walkMinutes, totalMinutes, distanceMeters: route.distanceMeters,
        priceLow: low, priceHigh: high, budgetVerified: high !== null && high <= form.budget,
        openNow: place.currentOpeningHours?.openNow ?? null,
        vegetarianVerified: place.servesVegetarianFood === true,
        directionsUrl: routeLink(origin, place, form.returnToClass),
        attributions: place.attributions || [],
      };
    } catch { routeFailures++; return null; }
  }));
  if (candidates.every(candidate => candidate === null) && routeFailures) throw new Error('mapsRouteError');
  return {
    source: 'Google Maps', origin: { name: origin.displayName?.text, address: origin.formattedAddress, attributions: origin.attributions || [] },
    places: candidates.filter(Boolean).sort((a, b) => Number(b.budgetVerified) - Number(a.budgetVerified) || a.totalMinutes - b.totalMinutes),
    preferences: form, routeFailures,
  };
}
export async function handleLunch(request, env, fetcher = fetch) {
  const key = env.GOOGLE_MAPS_API_KEY;
  if (request.method === 'GET') return mapResponse({ configured: Boolean(key), source: 'Google Maps' });
  if (request.method !== 'POST') return mapResponse({ error: 'errorGeneric' }, 405);
  try {
    const raw = await request.text();
    if (raw.length > 4096) return mapResponse({ error: 'errorGeneric' }, 413);
    const form = normalizeLunch(JSON.parse(raw));
    if (!form.location) return mapResponse({ error: 'locationRequired' }, 400);
    if (!key) return mapResponse({ error: 'mapsNotConfigured', searchUrl: lunchSearchUrl(form) }, 503);
    const limit = Math.max(1, Math.min(1000, Number(env.GOOGLE_MAPS_DAILY_SEARCH_LIMIT) || 30));
    if (!await reserveSearch(env.DB, limit)) return mapResponse({ error: 'mapsQuota' }, 429);
    return mapResponse(await recommendLunch(form, key, fetcher));
  } catch (error) {
    const allowed = ['mapsQuota', 'mapsServiceError', 'mapsRouteError', 'locationNotFound', 'kyotoOnly'];
    return mapResponse({ error: allowed.includes(error.message) ? error.message : 'mapsServiceError' }, 502);
  }
}
