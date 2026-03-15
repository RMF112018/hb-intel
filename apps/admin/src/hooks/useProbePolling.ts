import { useEffect, useMemo, useRef } from 'react';
import { useCurrentSession } from '@hbc/auth';
import { createProvisioningApiClient } from '@hbc/provisioning';
import {
  createDefaultProbeScheduler,
  InfrastructureProbeApi,
  PROBE_SCHEDULER_DEFAULT_MS,
} from '@hbc/features-admin';
import { resolveSessionToken } from '../utils/resolveSessionToken.js';

/**
 * G6-T06: Initializes the probe polling service when the admin session is available.
 *
 * Creates a probe scheduler with real network connections to Azure Functions
 * and SharePoint endpoints, runs probes every `PROBE_SCHEDULER_DEFAULT_MS` (15 min),
 * and saves snapshots to an in-memory `InfrastructureProbeApi`.
 *
 * The polling loop is cleaned up on unmount.
 */
export function useProbePolling(): void {
  const session = useCurrentSession();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const authToken = useMemo(() => resolveSessionToken(session), [session]);
  const functionAppUrl =
    (import.meta.env as Record<string, string | undefined>).VITE_FUNCTION_APP_URL ?? '';

  useEffect(() => {
    if (!session || !functionAppUrl) return;

    const scheduler = createDefaultProbeScheduler({
      baseUrl: functionAppUrl,
      getToken: async () => authToken,
    });
    const api = new InfrastructureProbeApi();

    const runProbes = async (): Promise<void> => {
      try {
        const nowIso = new Date().toISOString();
        const results = await scheduler.runAll(nowIso);
        const snapshot = scheduler.buildSnapshot(
          results,
          `probe-${nowIso}`,
          nowIso,
        );
        api.saveSnapshot(snapshot);
      } catch (err) {
        console.error('[useProbePolling] probe cycle failed:', err);
      }
    };

    // Run immediately, then on interval
    runProbes();
    intervalRef.current = setInterval(runProbes, PROBE_SCHEDULER_DEFAULT_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [session, authToken, functionAppUrl]);
}
