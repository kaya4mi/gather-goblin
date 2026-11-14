import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleLunch, recommendLunch } from '../worker/maps.mjs';

const form = { location: 'Yoshida Campus', language: 'en', cuisine: 'ramen', vegetarian: false,
  preferences: '', budget: 1000, minutes: 60, mealMinutes: 25, maxWalk: 10, people: 10, returnToClass: true };
const origin = { id: 'campus', displayName: { text: 'Campus' }, formattedAddress: 'Kyoto', location: { latitude: 35.026, longitude: 135.78 } };
const makePlace = (id, price, open = true) => ({ id, displayName: { text: id }, formattedAddress: 'Kyoto',
  location: { latitude: 35.027, longitude: 135.781 }, currentOpeningHours: { openNow: open },
  ...(price ? { priceRange: { startPrice: { currencyCode: 'JPY', units: String(price - 100) }, endPrice: { currencyCode: 'JPY', units: String(price) } } } : {}),
});

test('maps requires explicit credentials and does not substitute invented venues', async () => {
  const result = await handleLunch(new Request('https://example.com/api/lunch', { method: 'POST', body: JSON.stringify(form) }), {});
  const body = await result.json();
  assert.equal(result.status, 503);
  assert.equal(body.error, 'mapsNotConfigured');
  assert.equal(new URL(body.searchUrl).hostname, 'www.google.com');
  assert.equal(body.places, undefined);
});

test('lunch filters actual walking routes, closed shops and known over-budget prices', async () => {
  let calls = 0;
  const fetcher = async (url, options) => {
    calls++;
    const request = JSON.parse(options.body);
    assert.equal(options.headers['X-Goog-Api-Key'], 'test-key');
    if (url.includes('places:searchText')) {
      if (calls === 1) return Response.json({ places: [origin] });
      return Response.json({ places: [makePlace('Affordable', 900), makePlace('Too expensive', 2400), makePlace('Closed', 800, false), makePlace('Unknown price', null), makePlace('Too far', 800)] });
    }
    assert.equal(request.travelMode, 'WALK');
    assert.deepEqual(request.destination.location.latLng, origin.location);
    assert.equal(request.intermediates.length, 1);
    const seconds = calls === 5 ? '1800s' : '600s';
    return Response.json({ routes: [{ duration: seconds, distanceMeters: 800, legs: [{ duration: calls === 5 ? '900s' : '300s' }, { duration: '300s' }] }] });
  };
  const data = await recommendLunch(form, 'test-key', fetcher);
  assert.deepEqual(data.places.map(place => place.name), ['Affordable', 'Unknown price']);
  assert.equal(data.places[0].budgetVerified, true);
  assert.equal(data.places[1].budgetVerified, false);
  assert.equal(data.places[0].totalMinutes, 35);
  assert.equal(new URL(data.places[0].directionsUrl).searchParams.get('waypoint_place_ids'), 'Affordable');
});

test('a failed route service produces an error rather than fabricated travel times', async () => {
  let calls = 0;
  await assert.rejects(recommendLunch(form, 'test-key', async url => {
    calls++;
    if (calls === 1) return Response.json({ places: [origin] });
    if (url.includes('places:searchText')) return Response.json({ places: [makePlace('A', 900)] });
    return Response.json({ error: {} }, { status: 403 });
  }), /mapsRouteError/);
});
