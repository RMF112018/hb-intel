/**
 * SF26-T04 — Primary saved views lifecycle hook.
 *
 * Governing: SF26-T04, L-01
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ISavedViewDefinition, ISavedViewScopePermissions, ISavedViewContext } from '../types/index.js';
import type { ISavedViewsStorageAdapter } from '../storage/ISavedViewsStorageAdapter.js';
import { createSavedView } from '../model/lifecycle.js';

export interface UseSavedViewsOptions {
  moduleKey: string;
  workspaceKey: string;
  adapter: ISavedViewsStorageAdapter;
  permissions: ISavedViewScopePermissions;
}

export interface UseSavedViewsResult {
  views: ISavedViewDefinition[];
  activeView: ISavedViewDefinition | undefined;
  defaultView: ISavedViewDefinition | undefined;
  isLoading: boolean;
  error: string | undefined;
  applyView: (viewId: string) => void;
  saveCurrentView: (patch: Partial<ISavedViewDefinition>) => Promise<void>;
  saveAsNew: (definition: Omit<ISavedViewDefinition, 'viewId' | 'createdAtIso' | 'updatedAtIso'>) => Promise<void>;
  setDefault: (viewId: string) => Promise<void>;
  clearDefault: () => Promise<void>;
  deleteView: (viewId: string) => Promise<void>;
  duplicateView: (viewId: string, newTitle: string) => Promise<void>;
  activeViewContext: ISavedViewContext;
}

export function useSavedViews(options: UseSavedViewsOptions): UseSavedViewsResult {
  const { moduleKey, workspaceKey, adapter } = options;

  const [views, setViews] = useState<ISavedViewDefinition[]>([]);
  const [activeViewId, setActiveViewId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const loadViews = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);
    try {
      const loaded = await adapter.loadViews(moduleKey, workspaceKey);
      setViews(loaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [adapter, moduleKey, workspaceKey]);

  useEffect(() => { void loadViews(); }, [loadViews]);

  const activeView = useMemo(() => views.find(v => v.viewId === activeViewId), [views, activeViewId]);
  const defaultView = useMemo(() => views.find(v => v.isDefault), [views]);

  const applyView = useCallback((viewId: string) => { setActiveViewId(viewId); }, []);

  const saveCurrentView = useCallback(async (patch: Partial<ISavedViewDefinition>) => {
    if (!activeView) return;
    const updated = { ...activeView, ...patch, updatedAtIso: new Date().toISOString() };
    await adapter.saveView(updated);
    void loadViews();
  }, [activeView, adapter, loadViews]);

  const saveAsNew = useCallback(async (definition: Omit<ISavedViewDefinition, 'viewId' | 'createdAtIso' | 'updatedAtIso'>) => {
    const view = createSavedView({ ...definition });
    await adapter.saveView(view);
    void loadViews();
  }, [adapter, loadViews]);

  const setDefault = useCallback(async (viewId: string) => {
    await adapter.setDefault(viewId, moduleKey, workspaceKey);
    void loadViews();
  }, [adapter, moduleKey, workspaceKey, loadViews]);

  const clearDefault = useCallback(async () => {
    await adapter.clearDefault(moduleKey, workspaceKey);
    void loadViews();
  }, [adapter, moduleKey, workspaceKey, loadViews]);

  const deleteView = useCallback(async (viewId: string) => {
    await adapter.deleteView(viewId);
    if (activeViewId === viewId) setActiveViewId(undefined);
    void loadViews();
  }, [adapter, activeViewId, loadViews]);

  const duplicateView = useCallback(async (viewId: string, newTitle: string) => {
    const source = views.find(v => v.viewId === viewId);
    if (!source) return;
    const dup = createSavedView({ ...source, title: newTitle, isDefault: false });
    await adapter.saveView(dup);
    void loadViews();
  }, [views, adapter, loadViews]);

  const activeViewContext: ISavedViewContext = useMemo(() => ({
    activeViewId: activeView?.viewId,
    activeViewTitle: activeView?.title,
    activeFilterClauses: activeView?.filterClauses ?? [],
    activeSortBy: activeView?.sortBy ?? [],
    activeGroupBy: activeView?.groupBy ?? [],
    activePresentation: activeView?.presentation ?? {},
    moduleKey,
    workspaceKey,
  }), [activeView, moduleKey, workspaceKey]);

  return {
    views, activeView, defaultView, isLoading, error,
    applyView, saveCurrentView, saveAsNew, setDefault, clearDefault, deleteView, duplicateView,
    activeViewContext,
  };
}
