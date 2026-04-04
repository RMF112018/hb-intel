/**
 * P9.1-08: Hook for white-glove connector list, health, and test actions.
 *
 * Fetches connector records from the backend connection registry,
 * filters to white-glove connector classes, and provides test/refresh actions.
 * Credentials are never exposed — only health status and metadata are shown.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCurrentSession } from '@hbc/auth';
import { createSessionTokenFactory } from '../utils/resolveSessionToken.js';

/** White-glove connector classes. */
const WHITE_GLOVE_CLASSES = new Set([
  'microsoft-intune',
  'microsoft-autopilot',
  'apple-abm',
  'apple-ade',
  'apple-apns',
  'ninjaone-api',
]);

export interface IConnectionRecord {
  readonly connectorId: string;
  readonly connectorClass: string;
  readonly displayName: string;
  readonly hasCredential: boolean;
  readonly healthStatus: 'healthy' | 'unhealthy' | 'untested';
  readonly configVersion: number;
  readonly policyToggles: {
    readonly enabled: boolean;
    readonly dryRunOnly: boolean;
    readonly productionLaunchAllowed: boolean;
    readonly highRiskCheckpointRequired: boolean;
  };
  readonly lastTestedAt: string | null;
  readonly lastTestResult: 'success' | 'failure' | null;
  readonly lastTestError: string | null;
  readonly lastTestedBy: string | null;
  readonly lastSuccessfulTestAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface IConnectionTestResult {
  readonly success: boolean;
  readonly error: string | null;
  readonly testedAt: string;
}

export interface UseWhiteGloveConnectionsResult {
  readonly connections: readonly IConnectionRecord[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly testConnection: (connectorId: string) => Promise<IConnectionTestResult>;
  readonly refreshConnections: () => Promise<void>;
}

export function useWhiteGloveConnections(): UseWhiteGloveConnectionsResult {
  const session = useCurrentSession();
  const [connections, setConnections] = useState<IConnectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useCallback(() => session, [session]);
  const getToken = useMemo(() => createSessionTokenFactory(sessionRef), [sessionRef]);
  const functionAppUrl = (import.meta.env as Record<string, string | undefined>).VITE_FUNCTION_APP_URL ?? '';

  const fetchConnections = useCallback(async (): Promise<void> => {
    if (!session || !functionAppUrl) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch(`${functionAppUrl}/api/admin/connections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Failed to fetch connections: ${response.status}`);
      const data = (await response.json()) as { connections: IConnectionRecord[] };
      setConnections(data.connections.filter((c) => WHITE_GLOVE_CLASSES.has(c.connectorClass)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  }, [session, getToken, functionAppUrl]);

  useEffect(() => {
    fetchConnections().catch(() => {});
  }, [fetchConnections]);

  const testConnection = useCallback(
    async (connectorId: string): Promise<IConnectionTestResult> => {
      const token = await getToken();
      const response = await fetch(`${functionAppUrl}/api/admin/connections/${connectorId}/test`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Test failed: ${response.status}`);
      const result = (await response.json()) as IConnectionTestResult;
      await fetchConnections();
      return result;
    },
    [getToken, functionAppUrl, fetchConnections],
  );

  return {
    connections,
    loading,
    error,
    testConnection,
    refreshConnections: fetchConnections,
  };
}
