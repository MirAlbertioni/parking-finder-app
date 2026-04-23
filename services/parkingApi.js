const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const RADIUS_METERS = 2000;

let _cache = null;
let _cacheKey = null;

function parseMaxHours(maxstay) {
  if (!maxstay) return null;
  const h = maxstay.match(/(\d+)\s*h/i);
  const m = maxstay.match(/(\d+)\s*min/i);
  if (h) return parseInt(h[1], 10);
  if (m) return Math.round(parseInt(m[1], 10) / 60) || 1;
  const n = parseInt(maxstay, 10);
  return isNaN(n) ? null : n;
}

function normalizeElement(el) {
  const tags = el.tags || {};
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (!lat || !lng) return null;

  const isFree = tags.fee === 'no' || (!tags.fee && tags.access !== 'private');
  const name = tags.name || tags['name:sv'] || 'Parkering';
  const addressParts = [tags['addr:street'], tags['addr:housenumber'], tags['addr:city']].filter(Boolean);

  return {
    id: String(el.id),
    name,
    address: addressParts.join(' '),
    lat,
    lng,
    isFree,
    pricePerHour: isFree ? 0 : null,
    maxHours: parseMaxHours(tags.maxstay),
    description: tags.parking ? tags.parking.replace(/_/g, ' ') : '',
  };
}

export async function fetchParkingsNearby(lat, lng) {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  if (_cache && _cacheKey === key) return _cache;

  const query = `[out:json][timeout:25];(node["amenity"="parking"](around:${RADIUS_METERS},${lat},${lng});way["amenity"="parking"](around:${RADIUS_METERS},${lat},${lng}););out center;`;

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'ParkingFinderApp/1.0',
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) throw new Error(`Overpass error: ${res.status}`);

  const json = await res.json();
  const results = json.elements.map(normalizeElement).filter(Boolean);

  _cache = results;
  _cacheKey = key;
  return results;
}
