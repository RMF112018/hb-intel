/**
 * SavedViewScopeBadge — SF26-T06. Compact scope indicator.
 * Governing: SF26-T06, L-02
 */
import React from 'react';

export interface SavedViewScopeBadgeProps { scope: 'personal' | 'team' | 'role' | 'system'; label?: string; }

const COLORS: Record<string, { bg: string; fg: string }> = {
  personal: { bg: 'transparent', fg: 'transparent' },
  team: { bg: '#deecf9', fg: '#0078d4' },
  role: { bg: '#f0e6ff', fg: '#8764b8' },
  system: { bg: '#e1dfdd', fg: '#484644' },
};
const LABELS: Record<string, string> = { personal: '', team: 'Team', role: 'Role', system: 'System' };

export function SavedViewScopeBadge({ scope, label }: SavedViewScopeBadgeProps): React.ReactElement | null {
  if (scope === 'personal') return null;
  const c = COLORS[scope];
  return <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: '8px', fontSize: '10px', fontWeight: 600, background: c.bg, color: c.fg }}>{label ?? LABELS[scope]}</span>;
}
