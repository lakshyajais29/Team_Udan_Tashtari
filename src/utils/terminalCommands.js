/**
 * Simulated MAVLink console commands. Pure functions: each returns lines to print
 * and, optionally, a telemetry patch to apply. No real vehicle is contacted.
 */
import { FLIGHT_MODES, rand } from './telemetry.js';

export const VERSION = 'Team Udan-Tashtari GCS 2.0.0 · PX4 v1.14 (simulated) · MAVLink v2';

const row = (k, v) => `${k.padEnd(18, '.')} ${v}`;

export const COMMANDS = {
  help: {
    desc: 'List available commands',
    run: () => ({
      lines: [
        ['Available commands:', 'cyan'],
        ...Object.entries(COMMANDS).map(([k, c]) => [`  ${(k + (c.usage ? ' ' + c.usage : '')).padEnd(18)} ${c.desc}`, 'text']),
        ['Use ↑ / ↓ for command history.', 'muted'],
      ],
    }),
  },
  heartbeat: {
    desc: 'Request a HEARTBEAT summary',
    run: (_a, t) => ({
      lines: [
        ['SYSTEM ONLINE', 'green'],
        ['AUTOPILOT: PX4 on NuttX RTOS', 'text'],
        [`MODE: ${t.mode}`, 'text'],
        [`GPS: ${t.sats} SAT`, 'text'],
        [`BATTERY: ${t.battery.toFixed(1)}V`, 'text'],
      ],
    }),
  },
  status: {
    desc: 'System status summary',
    run: (_a, t) => ({
      lines: [
        [row('SYS_STATUS', 'NOMINAL'), 'green'],
        [row('ARMING', t.armed ? 'ARMED' : 'DISARMED'), t.armed ? 'red' : 'text'],
        [row('FLIGHT MODE', t.mode), 'text'],
        [row('GPS', `3D FIX · ${t.sats} sats · HDOP ${t.hdop.toFixed(2)}`), 'text'],
        [row('BATTERY', `${t.battery.toFixed(2)} V`), 'text'],
        [row('LINK LATENCY', `${Math.round(t.latency)} ms`), 'text'],
        [row('EKF', 'HEALTHY'), 'text'],
        [row('COMPANION', 'ONLINE (vision + planner)'), 'text'],
      ],
    }),
  },
  telemetry: {
    desc: 'Latest telemetry snapshot',
    run: (_a, t) => ({
      lines: [
        [`ATTITUDE         roll=${rand(-4, 4).toFixed(2)}° pitch=${rand(-3, 3).toFixed(2)}° yaw=${rand(0, 359).toFixed(1)}°`, 'text'],
        [`LOCAL_POSITION   x=${rand(0, 16).toFixed(2)} y=${rand(0, 10).toFixed(2)} z=${(-rand(2, 12)).toFixed(2)} m`, 'text'],
        [`VFR_HUD          gs=${rand(0, 4).toFixed(2)} m/s climb=${rand(-0.4, 0.4).toFixed(2)} m/s thr=${Math.round(rand(35, 60))}%`, 'text'],
        [`SYS_STATUS       voltage=${t.battery.toFixed(2)} V current=${rand(8, 18).toFixed(1)} A`, 'text'],
        [`GPS_RAW_INT      fix=3D sats=${t.sats} hdop=${t.hdop.toFixed(2)}`, 'text'],
        [`DISTANCE_SENSOR  tof[E,S,W,N]=${[0, 0, 0, 0].map(() => rand(0.4, 4).toFixed(2)).join(', ')} m`, 'text'],
      ],
    }),
  },
  arm: {
    desc: 'Arm motors (runs pre-arm checks)',
    run: (_a, t) => {
      if (t.armed) return { lines: [['Vehicle already ARMED', 'amber']] };
      return {
        lines: [
          ['Running pre-arm checks...', 'muted'],
          ['  IMU calibration ....... OK', 'text'],
          ['  Compass ............... OK', 'text'],
          [`  GPS lock .............. OK (${t.sats} sats)`, 'text'],
          [`  Battery ............... OK (${t.battery.toFixed(2)} V)`, 'text'],
          ['  RC / failsafe ......... OK', 'text'],
          ['  Geofence .............. OK', 'text'],
          ['COMMAND_ACK: MAV_CMD_COMPONENT_ARM_DISARM → ACCEPTED', 'green'],
          ['VEHICLE ARMED', 'red'],
        ],
        patch: { armed: true },
        stagger: true,
      };
    },
  },
  disarm: {
    desc: 'Disarm motors',
    run: (_a, t) =>
      t.armed
        ? { lines: [['COMMAND_ACK: MAV_CMD_COMPONENT_ARM_DISARM → ACCEPTED', 'green'], ['VEHICLE DISARMED', 'text']], patch: { armed: false } }
        : { lines: [['Vehicle already DISARMED', 'amber']] },
  },
  mode: {
    usage: '[name]',
    desc: 'Show or set flight mode',
    run: (args, t) => {
      if (!args[0]) return { lines: [[`Current mode: ${t.mode}`, 'text'], [`Available: ${FLIGHT_MODES.join(', ')}`, 'muted']] };
      const m = args[0].toUpperCase();
      if (!FLIGHT_MODES.includes(m)) return { lines: [[`Unknown mode '${args[0]}'. Available: ${FLIGHT_MODES.join(', ')}`, 'red']] };
      return { lines: [[`COMMAND_ACK: MAV_CMD_DO_SET_MODE → ACCEPTED (${m})`, 'green']], patch: { mode: m } };
    },
  },
  mission: {
    desc: 'Show the loaded search mission',
    run: (_a, t) => ({
      lines: [
        ['MISSION: SAR-GRID-01 (search & rescue sweep)', 'cyan'],
        ['  WP0  TAKEOFF        alt 2.5 m', 'text'],
        ['  WP1  SURVEY_GRID    area 16 × 10 m · spacing 0.5 m', 'text'],
        ['  WP2  DETECT         on-board survivor detection', 'text'],
        ['  WP3  REPORT         push detections to local GCS', 'text'],
        ['  WP4  RTL            return to launch', 'text'],
        [`State: ${t.armed ? (t.mode === 'AUTO' ? 'EXECUTING' : 'ARMED · waiting for AUTO') : 'LOADED · vehicle disarmed'}`, t.armed ? 'green' : 'muted'],
      ],
    }),
  },
  version: {
    desc: 'Firmware and console version',
    run: () => ({ lines: [[VERSION, 'text'], ['Build: demo / simulated vehicle', 'muted']] }),
  },
  clear: {
    desc: 'Clear the console',
    run: () => ({ clear: true, lines: [] }),
  },
};

export function runCommand(input, telemetry) {
  const [cmd, ...args] = input.trim().split(/\s+/);
  const c = COMMANDS[cmd.toLowerCase()];
  if (!c) return { lines: [[`command not found: ${cmd} — type 'help'`, 'red']] };
  return c.run(args, telemetry);
}
