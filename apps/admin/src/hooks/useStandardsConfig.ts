/**
 * P10-08: Standards & Configuration data hook.
 *
 * Fetches resolved config items and version history from the admin API.
 * Provides publish, revert, and diff actions for live-editable items.
 *
 * Follows the useWhiteGloveConnections pattern: useState + useEffect + useCallback
 * with session-token-based auth against the admin control plane API.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCurrentSession } from '@hbc/auth';
import { createSessionTokenFactory } from '../utils/resolveSessionToken.js';

// ─── Types ──────────────────────────────────────────────────────────────────────

export type ConfigValueSource = 'code-default' | 'live-override' | 'infrastructure';

export interface IResolvedConfigItemView {
  readonly key: string;
  readonly effectiveValue: unknown;
  readonly source: ConfigValueSource;
  readonly version: number | null;
  readonly lastChangedBy: string | null;
  readonly lastChangedAt: string | null;
  readonly codeDefault: unknown;
  readonly domain: string;
  readonly liveEditable: boolean;
  readonly infrastructureControlled: boolean;
  readonly secret: boolean;
}

export interface IConfigVersionView {
  readonly version: number;
  readonly value: unknown;
  readonly eventType: string;
  readonly actor: string;
  readonly timestamp: string;
  readonly reason: string;
}

export interface IConfigDiffView {
  readonly fromVersion: number | null;
  readonly toVersion: number;
  readonly fromValue: unknown;
  readonly toValue: unknown;
  readonly unchanged: boolean;
  readonly summary: string;
}

export interface UseStandardsConfigResult {
  readonly items: readonly IResolvedConfigItemView[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly activeDomain: string | null;
  readonly setActiveDomain: (domain: string | null) => void;
  readonly selectedItem: IResolvedConfigItemView | null;
  readonly setSelectedItem: (item: IResolvedConfigItemView | null) => void;
  readonly history: readonly IConfigVersionView[];
  readonly historyLoading: boolean;
  readonly diff: IConfigDiffView | null;
  readonly publishOverride: (key: string, value: unknown, reason: string) => Promise<void>;
  readonly revertOverride: (key: string, reason: string) => Promise<void>;
  readonly loadHistory: (key: string) => Promise<void>;
  readonly loadDiff: (key: string, fromVersion: number | null, toVersion: number) => Promise<void>;
  readonly refreshItems: () => Promise<void>;
}

// ─── Taxonomy domains for navigation ────────────────────────────────────────────

export const CONFIG_DOMAINS = [
  { id: 'access-control', label: 'Access Control' },
  { id: 'rollout', label: 'Rollout' },
  { id: 'sharepoint', label: 'SharePoint' },
  { id: 'identity', label: 'Identity' },
  { id: 'notification', label: 'Notification' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'app-binding', label: 'App Binding' },
  { id: 'validation-policy', label: 'Validation' },
] as const;

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useStandardsConfig(): UseStandardsConfigResult {
  const session = useCurrentSession();
  const [items, setItems] = useState<IResolvedConfigItemView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<IResolvedConfigItemView | null>(null);
  const [history, setHistory] = useState<IConfigVersionView[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [diff, setDiff] = useState<IConfigDiffView | null>(null);

  const sessionRef = useCallback(() => session, [session]);
  const getToken = useMemo(() => createSessionTokenFactory(sessionRef), [sessionRef]);
  const functionAppUrl = (import.meta.env as Record<string, string | undefined>).VITE_FUNCTION_APP_URL ?? '';

  // ── Fetch resolved items ────────────────────────────────────────────────

  const fetchItems = useCallback(async (): Promise<void> => {
    if (!session || !functionAppUrl) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const domainParam = activeDomain ? `?domain=${encodeURIComponent(activeDomain)}` : '';
      const response = await fetch(`${functionAppUrl}/api/admin/standards-config/resolve${domainParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Failed to load config: ${response.status}`);
      const data = (await response.json()) as { items: IResolvedConfigItemView[] };
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  }, [session, getToken, functionAppUrl, activeDomain]);

  useEffect(() => {
    fetchItems().catch(() => {});
  }, [fetchItems]);

  // ── Load history for a specific item ────────────────────────────────────

  const loadHistory = useCallback(async (key: string): Promise<void> => {
    if (!session || !functionAppUrl) return;
    setHistoryLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(
        `${functionAppUrl}/api/admin/standards-config/history/${encodeURIComponent(key)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) throw new Error(`Failed to load history: ${response.status}`);
      const data = (await response.json()) as { versions: IConfigVersionView[] };
      setHistory(data.versions);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [session, getToken, functionAppUrl]);

  // ── Load diff between versions ──────────────────────────────────────────

  const loadDiff = useCallback(async (
    key: string,
    fromVersion: number | null,
    toVersion: number,
  ): Promise<void> => {
    if (!session || !functionAppUrl) return;
    try {
      const token = await getToken();
      const fromParam = fromVersion !== null ? `&from=${fromVersion}` : '';
      const response = await fetch(
        `${functionAppUrl}/api/admin/standards-config/diff/${encodeURIComponent(key)}?to=${toVersion}${fromParam}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) throw new Error(`Failed to load diff: ${response.status}`);
      const data = (await response.json()) as IConfigDiffView;
      setDiff(data);
    } catch {
      setDiff(null);
    }
  }, [session, getToken, functionAppUrl]);

  // ── Publish override ────────────────────────────────────────────────────

  const publishOverride = useCallback(async (
    key: string,
    value: unknown,
    reason: string,
  ): Promise<void> => {
    if (!session || !functionAppUrl) return;
    const token = await getToken();
    const current = items.find((i) => i.key === key);
    const response = await fetch(`${functionAppUrl}/api/admin/standards-config/publish`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key,
        domain: current?.domain ?? '',
        value,
        reason,
        expectedVersion: current?.version ?? null,
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || `Publish failed: ${response.status}`);
    }
    await fetchItems();
  }, [session, getToken, functionAppUrl, items, fetchItems]);

  // ── Revert override ─────────────────────────────────────────────────────

  const revertOverride = useCallback(async (key: string, reason: string): Promise<void> => {
    if (!session || !functionAppUrl) return;
    const token = await getToken();
    const current = items.find((i) => i.key === key);
    if (!current?.version) throw new Error('No override to revert');
    const response = await fetch(`${functionAppUrl}/api/admin/standards-config/revert`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key,
        reason,
        expectedVersion: current.version,
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || `Revert failed: ${response.status}`);
    }
    await fetchItems();
  }, [session, getToken, functionAppUrl, items, fetchItems]);

  return {
    items,
    loading,
    error,
    activeDomain,
    setActiveDomain,
    selectedItem,
    setSelectedItem,
    history,
    historyLoading,
    diff,
    publishOverride,
    revertOverride,
    loadHistory,
    loadDiff,
    refreshItems: fetchItems,
  };
}
