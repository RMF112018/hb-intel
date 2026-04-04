/**
 * P9.1-10: Hook for a single white-glove package run detail with recovery actions.
 *
 * Fetches the full package run result including device runs, checkpoints,
 * evidence, and audit events. Provides retry, cancel, and device-retry actions.
 */

import { useState, useCallback, useMemo } from 'react';
import { useCurrentSession } from '@hbc/auth';
import { createSessionTokenFactory } from '../utils/resolveSessionToken.js';

export interface IDeviceRunDetail {
  readonly deviceRunId: string;
  readonly slotOrdinal: number;
  readonly platform: string;
  readonly serialNumber: string;
  readonly assetTag: string | null;
  readonly hostname: string | null;
  readonly deviceStatus: string;
  readonly checkpoints: readonly {
    readonly instanceId: string;
    readonly checkpointType: string;
    readonly label: string;
    readonly status: string;
    readonly createdAt: string;
    readonly decidedAt: string | null;
  }[];
  readonly evidence: readonly {
    readonly evidenceId: string;
    readonly evidenceType: string;
    readonly label: string;
    readonly capturedAt: string;
    readonly adapterSource: string;
    readonly summary: string;
  }[];
  readonly failure: {
    readonly failureClass: string;
    readonly failureMessage: string;
    readonly retryEligible: boolean;
    readonly retryCount: number;
  } | null;
  readonly progress: { readonly currentStep: number; readonly totalSteps: number } | null;
}

export interface IPackageRunDetail {
  readonly packageRunId: string;
  readonly packageFamily: string;
  readonly packageStatus: string;
  readonly employeeDisplayName: string;
  readonly employeeUpn: string;
  readonly templateVersion: number;
  readonly launchedAt: string;
  readonly completedAt: string | null;
  readonly devices: readonly IDeviceRunDetail[];
  readonly activeCheckpoints: readonly { readonly instanceId: string; readonly label: string; readonly status: string }[];
  readonly recentAuditEvents: readonly { readonly auditId: string; readonly eventType: string; readonly summary: string; readonly timestamp: string }[];
  readonly totalDevices: number;
  readonly completedDevices: number;
  readonly failedDevices: number;
}

export interface UseWhiteGloveRunDetailResult {
  readonly run: IPackageRunDetail | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly fetchRun: (runId: string) => Promise<void>;
  readonly retryPackageRun: (runId: string) => Promise<void>;
  readonly retryDeviceRun: (deviceRunId: string) => Promise<void>;
  readonly cancelPackageRun: (runId: string, reason?: string) => Promise<void>;
  readonly refresh: () => Promise<void>;
}

export function useWhiteGloveRunDetail(): UseWhiteGloveRunDetailResult {
  const session = useCurrentSession();
  const [run, setRun] = useState<IPackageRunDetail | null>(null);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useCallback(() => session, [session]);
  const getToken = useMemo(() => createSessionTokenFactory(sessionRef), [sessionRef]);
  const functionAppUrl = (import.meta.env as Record<string, string | undefined>).VITE_FUNCTION_APP_URL ?? '';

  const fetchRun = useCallback(async (runId: string): Promise<void> => {
    if (!session || !functionAppUrl) return;
    setLoading(true);
    setError(null);
    setCurrentRunId(runId);
    try {
      const token = await getToken();
      const response = await fetch(`${functionAppUrl}/api/admin/white-glove/runs/${runId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Failed to fetch run: ${response.status}`);
      setRun((await response.json()) as IPackageRunDetail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load run detail');
    } finally {
      setLoading(false);
    }
  }, [session, getToken, functionAppUrl]);

  const refresh = useCallback(async (): Promise<void> => {
    if (currentRunId) await fetchRun(currentRunId);
  }, [currentRunId, fetchRun]);

  const retryPackageRun = useCallback(async (runId: string): Promise<void> => {
    const token = await getToken();
    const response = await fetch(`${functionAppUrl}/api/admin/white-glove/runs/${runId}/retry`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Retry failed: ${response.status}`);
    await refresh();
  }, [getToken, functionAppUrl, refresh]);

  const retryDeviceRun = useCallback(async (deviceRunId: string): Promise<void> => {
    const token = await getToken();
    const response = await fetch(`${functionAppUrl}/api/admin/white-glove/devices/${deviceRunId}/retry`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Device retry failed: ${response.status}`);
    await refresh();
  }, [getToken, functionAppUrl, refresh]);

  const cancelPackageRun = useCallback(async (runId: string, reason?: string): Promise<void> => {
    const token = await getToken();
    const response = await fetch(`${functionAppUrl}/api/admin/white-glove/runs/${runId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) throw new Error(`Cancel failed: ${response.status}`);
    await refresh();
  }, [getToken, functionAppUrl, refresh]);

  return { run, loading, error, fetchRun, retryPackageRun, retryDeviceRun, cancelPackageRun, refresh };
}
