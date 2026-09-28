import { useCallback, useEffect, useRef, useState } from 'react';
import { runCommand } from '../utils/terminalCommands.js';
import { utcClock } from '../utils/telemetry.js';
import { useTelemetry } from './useTelemetry.js';

const MAX_LINES = 400;
let lineId = 0;
const mk = (text, tone = 'text') => ({ id: ++lineId, ts: utcClock(), text, tone });

/**
 * Terminal state: output lines, command history, heartbeat stream.
 * `active` pauses the heartbeat stream when the console is off screen.
 */
export function useTerminal(active = true) {
  const { telemetry, patch } = useTelemetry();
  const telRef = useRef(telemetry);
  telRef.current = telemetry;

  const [lines, setLines] = useState(() => [
    mk('UDAN-TASHTARI MAVLINK CONSOLE', 'cyan'),
    mk('────────────────────────', 'muted'),
    mk('Simulated session · link TELEM2 @ 921600 baud · MAVLink v2', 'muted'),
    mk("Type 'help' for commands.", 'muted'),
  ]);
  const [history, setHistory] = useState([]);
  const [heartbeat, setHeartbeat] = useState(true);
  const timers = useRef([]);

  const push = useCallback((items) => {
    setLines((prev) => {
      const next = [...prev, ...items];
      return next.length > MAX_LINES ? next.slice(next.length - MAX_LINES) : next;
    });
  }, []);

  const execute = useCallback(
    (raw) => {
      const input = raw.trim();
      if (!input) return;
      setHistory((h) => [...h, input]);
      push([mk(`> ${input}`, 'prompt')]);

      const [cmd, arg] = input.split(/\s+/);
      if (cmd.toLowerCase() === 'hb') {
        const on = arg !== 'off';
        setHeartbeat(on);
        push([mk(`Heartbeat stream ${on ? 'enabled' : 'disabled'}`)]);
        return;
      }

      const res = runCommand(input, telRef.current);
      if (res.clear) {
        setLines([]);
        return;
      }
      if (res.stagger) {
        // Print pre-arm checks one by one for realism
        res.lines.forEach(([t, tone], i) => {
          const id = setTimeout(() => {
            push([mk(t, tone)]);
            if (i === res.lines.length - 1 && res.patch) patch(res.patch);
          }, 110 * (i + 1));
          timers.current.push(id);
        });
      } else {
        push(res.lines.map(([t, tone]) => mk(t, tone)));
        if (res.patch) patch(res.patch);
      }
    },
    [push, patch],
  );

  // Simulated heartbeat stream
  useEffect(() => {
    if (!heartbeat || !active) return undefined;
    const id = setInterval(() => {
      const t = telRef.current;
      push([mk(`[HB] sysid=1 compid=1 QUADROTOR PX4 mode=${t.mode} ${t.armed ? 'ACTIVE' : 'STANDBY'} batt=${t.battery.toFixed(2)}V`, 'hb')]);
    }, 3000);
    return () => clearInterval(id);
  }, [heartbeat, active, push]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return { lines, history, execute, heartbeat };
}
