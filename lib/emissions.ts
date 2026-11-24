import type { Airport } from './data/airports';

/**
 * Transparent, illustrative flight-emissions estimate.
 *
 * Method (structure follows the UK Government GHG conversion-factor approach):
 *   1. Great-circle distance between the two airports (haversine, Earth radius 6,371 km).
 *   2. Add an 8% uplift for indirect routing, holding patterns and connections.
 *   3. Multiply by a per-passenger-kilometre factor for the cabin class.
 *      Cabin multipliers reflect the floor space a seat occupies (economy = 1.0).
 *   4. Multiply by the number of passengers.
 *
 * The base factor is an ILLUSTRATIVE demonstration value. It excludes non-CO2 effects
 * (radiative forcing), which are shown separately as an optional sensitivity.
 * Before any public use, factors must be replaced with a methodology agreed with
 * the relevant national authorities.
 */
export const METHOD = {
  earthRadiusKm: 6371,
  routingUplift: 0.08,
  baseFactorKgPerPkm: 0.115, // long-haul economy (illustrative)
  cabinMultiplier: { economy: 1.0, premium: 1.6, business: 2.9, first: 4.0 } as Record<Cabin, number>,
  nonCo2Multiplier: 1.7,
  version: 'Demo method v1 (illustrative)',
};

export type Cabin = 'economy' | 'premium' | 'business' | 'first';
export const CABINS: { id: Cabin; label: string; sw: string }[] = [
  { id: 'economy', label: 'Economy', sw: 'Daraja la kawaida' },
  { id: 'premium', label: 'Premium economy', sw: 'Daraja la kawaida bora' },
  { id: 'business', label: 'Business', sw: 'Daraja la biashara' },
  { id: 'first', label: 'First', sw: 'Daraja la kwanza' },
];

const rad = (d: number) => (d * Math.PI) / 180;

export function greatCircleKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * METHOD.earthRadiusKm * Math.asin(Math.sqrt(h));
}

/** Illustrative factors by flight length: shorter flights burn more fuel per km (take-off and climb). */
export const HAULS = [
  { id: 'short', label: 'Short-haul', range: 'under 1,500 km', maxKm: 1500, factor: 0.155 },
  { id: 'medium', label: 'Medium-haul', range: '1,500–3,700 km', maxKm: 3700, factor: 0.13 },
  { id: 'long', label: 'Long-haul', range: 'over 3,700 km', maxKm: Infinity, factor: 0.115 },
] as const;
export const haulOf = (km: number) => HAULS.find((h) => km < h.maxKm)!;

export type Estimate = {
  haul: (typeof HAULS)[number];
  baseFactor: number;
  greatCircleKm: number;
  routedKm: number;
  factor: number;
  perPassengerKg: number;
  totalKg: number;
  withNonCo2PerPassengerKg: number;
  passengers: number;
  cabin: Cabin;
};

export function estimate(from: Airport, to: Airport, cabin: Cabin, passengers: number): Estimate {
  const gc = greatCircleKm(from, to);
  return fromDistance(gc, cabin, passengers);
}

/** Estimate from a great-circle distance (km). */
export function fromDistance(gc: number, cabin: Cabin, passengers: number): Estimate {
  const haul = haulOf(gc);
  const routed = gc * (1 + METHOD.routingUplift);
  const factor = haul.factor * METHOD.cabinMultiplier[cabin];
  const per = routed * factor;
  return {
    haul,
    baseFactor: haul.factor,
    greatCircleKm: gc,
    routedKm: routed,
    factor,
    perPassengerKg: per,
    totalKg: per * passengers,
    withNonCo2PerPassengerKg: per * METHOD.nonCo2Multiplier,
    passengers,
    cabin,
  };
}

/** Points along the great circle, for drawing the route. */
export function greatCirclePoints(a: { lat: number; lon: number }, b: { lat: number; lon: number }, n = 64) {
  const φ1 = rad(a.lat), λ1 = rad(a.lon), φ2 = rad(b.lat), λ2 = rad(b.lon);
  const d = 2 * Math.asin(Math.sqrt(Math.sin((φ2 - φ1) / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2));
  const pts: { lat: number; lon: number }[] = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    if (d === 0) { pts.push(a); continue; }
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    pts.push({ lat: (Math.atan2(z, Math.sqrt(x * x + y * y)) * 180) / Math.PI, lon: (Math.atan2(y, x) * 180) / Math.PI });
  }
  return pts;
}

export type Leg = { from: Airport; to: Airport };
export type LegEstimate = Leg & { est: Estimate; returnLeg?: boolean };
export type TripEstimate = { legs: LegEstimate[]; perPassengerKg: number; totalKg: number; km: number; passengers: number; nonCo2PerPassengerKg: number };

/** Multi-leg trip. A return trip repeats every leg in reverse order. */
export function estimateTrip(legs: Leg[], cabin: Cabin, passengers: number, isReturn: boolean): TripEstimate {
  const out: LegEstimate[] = legs.map((l) => ({ ...l, est: estimate(l.from, l.to, cabin, passengers) }));
  const all = isReturn ? [...out, ...[...out].reverse().map((l) => ({ from: l.to, to: l.from, est: l.est, returnLeg: true }))] : out;
  const per = all.reduce((s, l) => s + l.est.perPassengerKg, 0);
  return { legs: all, perPassengerKg: per, totalKg: per * passengers, km: all.reduce((s, l) => s + l.est.routedKm, 0), passengers, nonCo2PerPassengerKg: per * METHOD.nonCo2Multiplier };
}

/** Rough distance from scheduled flight time: about 800 km per hour, less 100 km for taxi, climb and descent. */
export const hoursToKm = (h: number) => Math.max(150, h * 800 - 100);

/** Reference values used for comparisons (sources shown in the interface). */
export const REF = {
  tzPerCapitaT: 0.29, tzYear: 2024, // CO₂ per person, Tanzania (Global Carbon Budget via Our World in Data)
  globalPerCapitaT: 4.7, globalYear: 2023, // CO₂ per person, world average (Global Carbon Project)
  carKgPerKm: 0.17, // average petrol car, illustrative
};
export function equivalents(kg: number) {
  const t = kg / 1000;
  return { tzYears: t / REF.tzPerCapitaT, globalMonths: (t / REF.globalPerCapitaT) * 12, carKm: kg / REF.carKgPerKm };
}

/** Optional contribution guide: an illustrative US$15 per estimated tonne, rounded to US$5 (minimum US$10). Not an offset price. */
export const GUIDE_USD_PER_T = 15;
export const suggestedContribution = (kg: number) => Math.max(10, Math.round(((kg / 1000) * GUIDE_USD_PER_T) / 5) * 5);
