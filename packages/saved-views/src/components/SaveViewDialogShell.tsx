/**
 * SF26-T06 — SaveViewDialog composition shell.
 */
import React, { useCallback } from 'react';
import { SaveViewDialog, type SaveViewDialogMode, type SaveViewDialogResult, type SaveViewDialogPermissions, type SaveViewDialogExistingView } from '@hbc/ui-kit';
import type { ISavedViewDefinition, ISavedViewScopePermissions } from '../types/index.js';

export interface SaveViewDialogShellProps {
  mode: SaveViewDialogMode;
  existingView?: ISavedViewDefinition;
  permissions: ISavedViewScopePermissions;
  onConfirm: (result: SaveViewDialogResult) => void;
  onCancel: () => void;
}

export function SaveViewDialogShell({ mode, existingView, permissions, onConfirm, onCancel }: SaveViewDialogShellProps): React.ReactElement {
  const dlgExisting: SaveViewDialogExistingView | undefined = existingView ? { title: existingView.title, description: existingView.description, scope: existingView.scope, isDefault: existingView.isDefault ?? false } : undefined;
  const dlgPerms: SaveViewDialogPermissions = { canSavePersonal: permissions.canSavePersonal, canSaveTeam: permissions.canSaveTeam, canSaveRole: permissions.canSaveRole, canSaveSystem: permissions.canSaveSystem };
  return <SaveViewDialog mode={mode} existingView={dlgExisting} permissions={dlgPerms} onConfirm={onConfirm} onCancel={onCancel} />;
}
