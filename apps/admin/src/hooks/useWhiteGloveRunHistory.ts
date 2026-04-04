/**
 * P9.1-10: Hook for paginated white-glove package run history.
 *
 * Fetches package run summaries with pagination and optional status filter.
 */

import { useState, useCallback, useMemo } from 'react';
import { useCurrentSession } from '@hbc/auth';
import { createSessionTokenFactory } from '../utils/resolveSessionToken.js';

export interface IPackageRunSummary {
  readonly packageRunId: string;
  readonly packageFamily: string;
  readonly packageStatus: string;
  readonly employeeDisplayName: string;
  readonly launchedAt: string;
  readonly completedAt: string | null;
  readonly totalDevices: number;
  readonly completedDevices: number;
  readonly failedDevices: number;
}

export interface UseWhiteGloveRunHistoryResult {
  readonly runs: readonly IPackageRunSummary[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly loading: boolean;
  readonly error: string | null;
  readonly fetchRuns: (page?: number, pageSize?: number, status?: string) => Promise<void>;
}

export function useWhiteGloveRunHistory(): UseWhiteGloveRunHistoryResult {
  const session = useCurrentSession();
  const [runs, setRuns] = useState<IPackageRunSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useCallback(() => session, [session]);
  const getToken = useMemo(() => createSessionTokenFactory(sessionRef), [sessionRef]);
  const functionAppUrl = (import.meta.env as Record<string, string | undefined>).VITE_FUNCTION_APP_URL ?? '';

  const fetchRuns = useCallback(async (p?: number, ps?: number, status?: string): Promise<void> => {
    if (!session || !functionAppUrl) return;
    const targetPage = p ?? 1;
    const targetPageSize = ps ?? 25;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const params = new URLSearchParams({ page: String(targetPage), pageSize: String(targetPageSize) });
      if (status) params.set('status', status);

      const response = await fetch(`${functionAppUrl}/api/admin/white-glove/runs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Failed to fetch runs: ${response.status}`);
      const data = (await response.json()) as { items: IPackageRunSummary[]; pagination: { total: number; page: number; pageSize: number } };
      setRuns(data.items);
      setTotal(data.pagination.total);
      setPage(data.pagination.page);
      setPageSize(data.pagination.pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load run history');
    } finally {
      setLoading(false);
    }
  }, [session, getToken, functionAppUrl]);

  return { runs, total, page, pageSize, loading, error, fetchRuns };
}
