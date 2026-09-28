import { useContext } from 'react';
import { TelemetryContext } from '../context/TelemetryContext.jsx';

/** Access the shared simulated telemetry: { telemetry, now, patch }. */
export function useTelemetry() {
  const ctx = useContext(TelemetryContext);
  if (!ctx) throw new Error('useTelemetry must be used inside <TelemetryProvider>');
  return ctx;
}
