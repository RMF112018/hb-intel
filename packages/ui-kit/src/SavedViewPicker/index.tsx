/**
 * SavedViewPicker — SF26-T05
 *
 * View switcher dropdown grouped by scope with active/default markers,
 * save/save-as actions. Pure presentational.
 *
 * Governing: SF26-T05, L-02, L-06
 */

import React from 'react';

export interface SavedViewPickerView {
  viewId: string;
  title: string;
  scope: 'personal' | 'team' | 'role' | 'system';
  isDefault: boolean;
}

export interface SavedViewPickerPermissions {
  canSavePersonal: boolean;
  canSaveTeam: boolean;
  canSaveRole: boolean;
  canSaveSystem: boolean;
}

export interface SavedViewPickerProps {
  views: SavedViewPickerView[];
  activeViewId: string | undefined;
  defaultViewId: string | undefined;
  hasUnsavedChanges: boolean;
  onApplyView: (viewId: string) => void;
  onSaveCurrentView: () => void;
  onOpenSaveDialog: () => void;
  permissions: SavedViewPickerPermissions;
  isLoading?: boolean;
}

const containerStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '240px', padding: '8px 0' };
const groupLabel: React.CSSProperties = { fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, color: '#797775', padding: '4px 12px', letterSpacing: '0.5px' };
const itemStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', cursor: 'pointer', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', fontSize: '13px' };
const activeItemStyle: React.CSSProperties = { ...itemStyle, background: '#f3f9ff', fontWeight: 600 };
const defaultBadge: React.CSSProperties = { fontSize: '10px', color: '#0078d4', marginLeft: '6px' };
const actionStyle: React.CSSProperties = { padding: '6px 12px', borderTop: '1px solid #edebe9', background: 'transparent', border: 'none', color: '#0078d4', cursor: 'pointer', fontSize: '12px', fontWeight: 600, width: '100%', textAlign: 'left' };

const SCOPE_ORDER: Array<'personal' | 'team' | 'role' | 'system'> = ['personal', 'team', 'role', 'system'];
const SCOPE_LABELS: Record<string, string> = { personal: 'My Views', team: 'Team Views', role: 'Role Views', system: 'System Views' };

export function SavedViewPicker({ views, activeViewId, defaultViewId, hasUnsavedChanges, onApplyView, onSaveCurrentView, onOpenSaveDialog, isLoading = false }: SavedViewPickerProps): React.ReactElement {
  if (isLoading) return <div style={containerStyle}>Loading views...</div>;

  const grouped = SCOPE_ORDER.map(scope => ({
    scope,
    label: SCOPE_LABELS[scope],
    items: views.filter(v => v.scope === scope),
  })).filter(g => g.items.length > 0);

  return (
    <div style={containerStyle} role="listbox">
      {grouped.map(group => (
        <div key={group.scope}>
          <div style={groupLabel} role="presentation">{group.label}</div>
          {group.items.map(view => (
            <button key={view.viewId} style={view.viewId === activeViewId ? activeItemStyle : itemStyle} role="option" aria-selected={view.viewId === activeViewId} onClick={() => onApplyView(view.viewId)}>
              <span>
                {view.viewId === activeViewId && <span style={{ marginRight: '6px' }}>✓</span>}
                {view.title}
                {view.viewId === defaultViewId && <span style={defaultBadge}>★ Default</span>}
              </span>
              {group.scope === 'system' && <span style={{ fontSize: '10px', color: '#797775' }}>System</span>}
            </button>
          ))}
        </div>
      ))}
      {hasUnsavedChanges && <button style={actionStyle} onClick={onSaveCurrentView}>Save view</button>}
      <button style={{ ...actionStyle, borderTop: hasUnsavedChanges ? 'none' : '1px solid #edebe9' }} onClick={onOpenSaveDialog}>Save as new view...</button>
    </div>
  );
}
