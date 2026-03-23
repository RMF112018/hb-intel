/**
 * SaveViewDialog — SF26-T06. Save/save-as/rename/duplicate dialog with scope selector.
 * Governing: SF26-T06, L-02, L-03
 */
import React, { useState } from 'react';

export type SaveViewDialogMode = 'save' | 'save-as-new' | 'rename' | 'duplicate';
export type SaveViewDialogScope = 'personal' | 'team' | 'role' | 'system';

export interface SaveViewDialogPermissions { canSavePersonal: boolean; canSaveTeam: boolean; canSaveRole: boolean; canSaveSystem: boolean; }
export interface SaveViewDialogExistingView { title: string; description?: string; scope: SaveViewDialogScope; isDefault: boolean; }
export interface SaveViewDialogResult { title: string; description?: string; scope: SaveViewDialogScope; isDefault: boolean; replaceExisting: boolean; }

export interface SaveViewDialogProps {
  mode: SaveViewDialogMode;
  existingView?: SaveViewDialogExistingView;
  permissions: SaveViewDialogPermissions;
  onConfirm: (result: SaveViewDialogResult) => void;
  onCancel: () => void;
}

const dlgStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', border: '1px solid #edebe9', borderRadius: '4px', background: '#fff', minWidth: '360px' };
const labelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: '#323130' };
const inputStyle: React.CSSProperties = { padding: '6px 8px', border: '1px solid #8a8886', borderRadius: '2px', fontSize: '14px', width: '100%' };
const scopeBtn: React.CSSProperties = { padding: '4px 10px', borderRadius: '16px', border: '1px solid #edebe9', background: '#faf9f8', cursor: 'pointer', fontSize: '12px' };
const scopeBtnActive: React.CSSProperties = { ...scopeBtn, border: '2px solid #0078d4', background: '#f3f9ff' };
const warnStyle: React.CSSProperties = { fontSize: '12px', color: '#797775', fontStyle: 'italic' };
const actionsStyle: React.CSSProperties = { display: 'flex', gap: '8px', justifyContent: 'flex-end' };
const primaryBtn: React.CSSProperties = { padding: '8px 20px', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 };
const secondaryBtn: React.CSSProperties = { padding: '8px 20px', background: 'transparent', color: '#484644', border: '1px solid #8a8886', borderRadius: '4px', cursor: 'pointer' };

const MODE_TITLES: Record<SaveViewDialogMode, string> = { save: 'Save View', 'save-as-new': 'Save as New View', rename: 'Rename View', duplicate: 'Duplicate View' };
const SCOPE_LABELS: Record<string, string> = { personal: 'Personal', team: 'Team', role: 'Role', system: 'System' };
const SCOPE_WARNINGS: Record<string, string> = { team: 'This view will be visible to all members of your team.', role: 'This view will be visible to all users with this role.', system: 'This view will be visible to all users.' };

export function SaveViewDialog({ mode, existingView, permissions, onConfirm, onCancel }: SaveViewDialogProps): React.ReactElement {
  const defaultTitle = mode === 'duplicate' ? `Copy of ${existingView?.title ?? ''}` : mode === 'save-as-new' ? '' : existingView?.title ?? '';
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(existingView?.description ?? '');
  const [scope, setScope] = useState<SaveViewDialogScope>(mode === 'duplicate' ? 'personal' : existingView?.scope ?? 'personal');
  const [isDefault, setIsDefault] = useState(existingView?.isDefault ?? false);

  const permittedScopes = (['personal', 'team', 'role', 'system'] as const).filter(s => {
    if (s === 'personal') return permissions.canSavePersonal;
    if (s === 'team') return permissions.canSaveTeam;
    if (s === 'role') return permissions.canSaveRole;
    return permissions.canSaveSystem;
  });

  const canConfirm = title.trim().length > 0;
  const scopeReadOnly = mode === 'rename';

  return (
    <div style={dlgStyle}>
      <div style={{ fontSize: '16px', fontWeight: 600 }}>{MODE_TITLES[mode]}</div>
      <div><label style={labelStyle}>Title</label><input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} /></div>
      {mode !== 'rename' && <div><label style={labelStyle}>Description</label><input style={inputStyle} value={description} onChange={e => setDescription(e.target.value)} /></div>}
      {!scopeReadOnly && (
        <div>
          <label style={labelStyle}>Scope</label>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            {permittedScopes.map(s => <button key={s} style={s === scope ? scopeBtnActive : scopeBtn} onClick={() => setScope(s)}>{SCOPE_LABELS[s]}</button>)}
          </div>
          {scope !== 'personal' && SCOPE_WARNINGS[scope] && <div style={warnStyle}>{SCOPE_WARNINGS[scope]}</div>}
        </div>
      )}
      {mode !== 'rename' && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} />
          Set as default view
        </label>
      )}
      {mode === 'save' && scope !== 'personal' && <div style={warnStyle}>Saving will update this view for all members.</div>}
      <div style={actionsStyle}>
        <button style={secondaryBtn} onClick={onCancel}>Cancel</button>
        <button style={{ ...primaryBtn, opacity: canConfirm ? 1 : 0.5 }} disabled={!canConfirm} onClick={() => onConfirm({ title: title.trim(), description: description || undefined, scope, isDefault, replaceExisting: mode === 'save' })}>
          {mode === 'rename' ? 'Rename' : mode === 'duplicate' ? 'Duplicate' : 'Save'}
        </button>
      </div>
    </div>
  );
}
