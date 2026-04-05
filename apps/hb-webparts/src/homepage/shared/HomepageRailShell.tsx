/**
 * HomepageRailShell — Horizontal rail layout with flex wrapping
 *
 * Provides a flex-based horizontal rail with consistent gap and responsive
 * wrapping. Used inside section shells for side-by-side zone layouts.
 */
import * as React from 'react';
import { HP_SPACE } from '../tokens.js';

export interface HomepageRailShellProps {
  label: string;
  children: React.ReactNode;
}

const railStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: HP_SPACE.xl,
  alignItems: 'stretch',
};

export function HomepageRailShell({ label, children }: HomepageRailShellProps): React.JSX.Element {
  return (
    <div aria-label={label} data-hbc-homepage="rail-shell" role="region" style={railStyle}>
      {children}
    </div>
  );
}
