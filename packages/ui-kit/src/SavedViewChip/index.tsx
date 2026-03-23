/**
 * SavedViewChip — SF26-T05
 *
 * Active view indicator chip with unsaved-changes dot.
 * Pure presentational.
 *
 * Governing: SF26-T05, L-06
 */

import React from 'react';

export interface SavedViewChipView {
  title: string;
  scope: string;
}

export interface SavedViewChipProps {
  activeView: SavedViewChipView | undefined;
  hasUnsavedChanges: boolean;
  onOpenPicker: () => void;
}

const chipStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '16px', border: '1px solid #edebe9', background: '#faf9f8', cursor: 'pointer', fontSize: '13px', color: '#323130' };
const dotStyle: React.CSSProperties = { width: '6px', height: '6px', borderRadius: '50%', background: '#0078d4' };

export function SavedViewChip({ activeView, hasUnsavedChanges, onOpenPicker }: SavedViewChipProps): React.ReactElement {
  return (
    <button style={chipStyle} onClick={onOpenPicker} aria-label={`Active view: ${activeView?.title ?? 'Default view'}${hasUnsavedChanges ? ' (unsaved changes)' : ''}`}>
      <span>{activeView?.title ?? 'Default view'}</span>
      {hasUnsavedChanges && <span style={dotStyle} title="Unsaved changes" />}
    </button>
  );
}
