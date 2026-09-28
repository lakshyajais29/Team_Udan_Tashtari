/**
 * Simulated vehicle telemetry. Every value produced here is synthetic demo data.
 */
export const rand = (a, b) => a + Math.random() * (b - a);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const FLIGHT_MODES = ['STABILIZE', 'ALTHOLD', 'LOITER', 'GUIDED', 'AUTO', 'RTL', 'LAND'];

export const INITIAL_TELEMETRY = {
  latency: 18,
  battery: 16.4,
  sats: 14,
  mode: 'AUTO',
  armed: false,
  hdop: 0.8,
};

/** Advance the simulated telemetry by one tick (~1 s). */
export function stepTelemetry(t) {
  let battery = t.battery - rand(0.001, 0.005);
  if (battery < 14.9) battery = 16.7; // simulated pack swap
  let sats = t.sats;
  if (Math.random() < 0.15) sats = clamp(sats + (Math.random() < 0.5 ? -1 : 1), 10, 18);
  return {
    ...t,
    latency: clamp(t.latency + rand(-4, 4), 12, 42),
    battery,
    sats,
    hdop: clamp(t.hdop + rand(-0.05, 0.05), 0.6, 1.2),
  };
}

export const utcClock = (d = new Date()) => d.toISOString().slice(11, 19);

/** Battery voltage → rough percentage for a 4S LiPo (14.8 V empty-ish, 16.8 V full). */
export const batteryPct = (v) => Math.round(clamp(((v - 14.8) / 2.0) * 100, 0, 100));
