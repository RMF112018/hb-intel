/**
 * SF26-T05 — SavedViewPicker composition shell.
 *
 * Governing: SF26-T05, L-01
 */

import React, { useMemo } from 'react';
import { SavedViewPicker, type SavedViewPickerView, type SavedViewPickerPermissions } from '@hbc/ui-kit';
import type { ISavedViewScopePermissions } from '../types/index.js';
import type { ISavedViewsStorageAdapter } from '../storage/ISavedViewsStorageAdapter.js';
import { useSavedViews } from '../hooks/useSavedViews.js';

export interface SavedViewPickerShellProps {
  moduleKey: string;
  workspaceKey: string;
  adapter: ISavedViewsStorageAdapter;
  permissions: ISavedViewScopePermissions;
  onSaveCurrentView: () => void;
  onOpenSaveDialog: () => void;
}

export function SavedViewPickerShell({ moduleKey, workspaceKey, adapter, permissions, onSaveCurrentView, onOpenSaveDialog }: SavedViewPickerShellProps): React.ReactElement {
  const { views, activeView, defaultView, isLoading, applyView } = useSavedViews({ moduleKey, workspaceKey, adapter, permissions });

  const pickerViews: SavedViewPickerView[] = useMemo(
    () => views.map(v => ({ viewId: v.viewId, title: v.title, scope: v.scope, isDefault: v.isDefault ?? false })),
    [views],
  );

  const pickerPermissions: SavedViewPickerPermissions = useMemo(
    () => ({ canSavePersonal: permissions.canSavePersonal, canSaveTeam: permissions.canSaveTeam, canSaveRole: permissions.canSaveRole, canSaveSystem: permissions.canSaveSystem }),
    [permissions],
  );

  return (
    <SavedViewPicker
      views={pickerViews}
      activeViewId={activeView?.viewId}
      defaultViewId={defaultView?.viewId}
      hasUnsavedChanges={false}
      onApplyView={applyView}
      onSaveCurrentView={onSaveCurrentView}
      onOpenSaveDialog={onOpenSaveDialog}
      permissions={pickerPermissions}
      isLoading={isLoading}
    />
  );
}
