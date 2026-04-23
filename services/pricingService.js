// Stockholm zone tariffs based on Trafikkontoret Stockholm.
// Zone is estimated from distance to T-Centralen — not a perfect substitute
// for the official zone map but accurate enough for most of the city.

const T_CENTRALEN = { lat: 59.3313, lng: 18.0583 };

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimateZone(lat, lng) {
  const km = haversineKm(lat, lng, T_CENTRALEN.lat, T_CENTRALEN.lng);
  if (km < 2) return 'A';
  if (km < 4) return 'B';
  if (km < 7) return 'C';
  return 'D';
}

// periods: day 0=sön, 1=mån … 6=lör
export const ZONE_TARIFFS = {
  A: {
    zoneName: 'Zon A – Innerstad',
    periods: [
      { label: 'Mån–fre  07:00–18:00', days: [1, 2, 3, 4, 5], from: 7, to: 18, price: 45 },
      { label: 'Mån–fre  18:00–22:00', days: [1, 2, 3, 4, 5], from: 18, to: 22, price: 25 },
      { label: 'Lördag   09:00–18:00', days: [6], from: 9, to: 18, price: 25 },
      { label: 'Övrig tid', days: null, price: 0 },
    ],
  },
  B: {
    zoneName: 'Zon B – Innerstadsnära',
    periods: [
      { label: 'Mån–fre  07:00–18:00', days: [1, 2, 3, 4, 5], from: 7, to: 18, price: 25 },
      { label: 'Mån–fre  18:00–21:00', days: [1, 2, 3, 4, 5], from: 18, to: 21, price: 15 },
      { label: 'Lördag   09:00–17:00', days: [6], from: 9, to: 17, price: 15 },
      { label: 'Övrig tid', days: null, price: 0 },
    ],
  },
  C: {
    zoneName: 'Zon C – Ytterstad',
    periods: [
      { label: 'Mån–fre  07:00–18:00', days: [1, 2, 3, 4, 5], from: 7, to: 18, price: 15 },
      { label: 'Övrig tid', days: null, price: 0 },
    ],
  },
  D: {
    zoneName: 'Zon D – Ytterstad',
    periods: [
      { label: 'Alltid', days: null, price: 0 },
    ],
  },
};

export function getCurrentRate(zone, now = new Date()) {
  const tariff = ZONE_TARIFFS[zone];
  if (!tariff) return 0;
  const day = now.getDay();
  const hour = now.getHours() + now.getMinutes() / 60;
  for (const p of tariff.periods) {
    if (!p.days) return p.price;
    if (p.days.includes(day) && hour >= p.from && hour < p.to) return p.price;
  }
  return 0;
}
