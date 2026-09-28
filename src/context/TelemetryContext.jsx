import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { INITIAL_TELEMETRY, stepTelemetry } from '../utils/telemetry.js';

/**
 * Global simulated vehicle state shared by the status bar, Mission Control and the
 * MAVLink terminal (so `arm` / `mode` in the terminal show up in the status bar).
 */
export const TelemetryContext = createContext(null);

export function TelemetryProvider({ children }) {
  const [telemetry, setTelemetry] = useState(INITIAL_TELEMETRY);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setTelemetry((t) => stepTelemetry(t));
      setNow(new Date());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const patch = useCallback((p) => setTelemetry((t) => ({ ...t, ...p })), []);

  const value = useMemo(() => ({ telemetry, now, patch }), [telemetry, now, patch]);
  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
}
