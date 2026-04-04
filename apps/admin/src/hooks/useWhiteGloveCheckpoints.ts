/**
 * P9.1-09: Hook for active white-glove checkpoints.
 *
 * Fetches package runs with pending checkpoints and provides
 * approve/reject actions for device-level checkpoints.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCurrentSession } from '@hbc/auth';
import { createSessionTokenFactory } from '../utils/resolveSessionToken.js';

export interface IActiveCheckpoint {
  readonly instanceId: string;
  readonly checkpointType: string;
  readonly label: string;
  readonly status: string;
  readonly createdAt: string;
  readonly deviceRunId: string;
}

export interface IActivePackageRun {
  readonly packageRunId: string;
  readonly packageFamily: string;
  readonly packageStatus: string;
  readonly employeeDisplayName: string;
  readonly launchedAt: string;
  readonly activeCheckpoints: readonly IActiveCheckpoint[];
  readonly devices: readonly {
    readonly deviceRunId: string;
    readonly platform: string;
    readonly serialNumber: string;
    readonly deviceStatus: string;
    readonly checkpoints: readonly IActiveCheckpoint[];
  }[];
}

export interface UseWhiteGloveCheckpointsResult {
  readonly activeRuns: readonly IActivePackageRun[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly resolveCheckpoint: (
    deviceRunId: string,
    checkpointId: string,
    decision: 'approve' | 'reject',
    comment?: string,
  ) => Promise<void>;
  readonly refresh: () => Promise<void>;
}

export function useWhiteGloveCheckpoints(): UseWhiteGloveCheckpointsResult {
  const session = useCurrentSession();
  const [activeRuns, setActiveRuns] = useState<IActivePackageRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useCallback(() => session, [session]);
  const getToken = useMemo(() => createSessionTokenFactory(sessionRef), [sessionRef]);
  const functionAppUrl = (import.meta.env as Record<string, string | undefined>).VITE_FUNCTION_APP_URL ?? '';

  const fetchActiveRuns = useCallback(async (): Promise<void> => {
    if (!session || !functionAppUrl) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch(
        `${functionAppUrl}/api/admin/white-glove/runs?status=AwaitingCheckpoint`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) throw new Error(`Failed to fetch runs: ${response.status}`);
      const data = (await response.json()) as { items: IActivePackageRun[] };
      setActiveRuns(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load checkpoints');
    } finally {
      setLoading(false);
    }
  }, [session, getToken, functionAppUrl]);

  useEffect(() => {
    fetchActiveRuns().catch(() => {});
  }, [fetchActiveRuns]);

  const resolveCheckpoint = useCallback(
    async (
      deviceRunId: string,
      checkpointId: string,
      decision: 'approve' | 'reject',
      comment?: string,
    ): Promise<void> => {
      const token = await getToken();
      const response = await fetch(
        `${functionAppUrl}/api/admin/white-glove/devices/${deviceRunId}/checkpoint/${checkpointId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ decision, comment }),
        },
      );
      if (!response.ok) throw new Error(`Checkpoint resolution failed: ${response.status}`);
      await fetchActiveRuns();
    },
    [getToken, functionAppUrl, fetchActiveRuns],
  );

  return { activeRuns, loading, error, resolveCheckpoint, refresh: fetchActiveRuns };
}
