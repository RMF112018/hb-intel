/**
 * HbcMarkupToolbar — Drawing tool selection toolbar
 * PH4.13 §13.6 | Blueprint §1d
 *
 * Horizontal toolbar following HbcCommandBar visual pattern (48px height, icon buttons).
 * Active tool gets orange highlight.
 */
import * as React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { HBC_ACCENT_ORANGE, HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import type { MarkupShapeType } from './types.js';

type ActiveTool = MarkupShapeType | 'select';

interface HbcMarkupToolbarProps {
  activeTool: ActiveTool;
  onToolChange: (tool: ActiveTool) => void;
  className?: string;
}

interface ToolDef {
  id: ActiveTool;
  label: string;
  icon: string; // Unicode/emoji icon
}

const TOOLS: ToolDef[] = [
  { id: 'select', label: 'Select', icon: '\u25BA' }, // ►
  { id: 'freehand', label: 'Freehand', icon: '\u270E' }, // ✎
  { id: 'cloud', label: 'Cloud', icon: '\u2601' }, // ☁
  { id: 'rectangle', label: 'Rectangle', icon: '\u25A1' }, // □
  { id: 'ellipse', label: 'Ellipse', icon: '\u25CB' }, // ○
  { id: 'line', label: 'Line', icon: '\u2215' }, // ∕
  { id: 'arrow', label: 'Arrow', icon: '\u2192' }, // →
  { id: 'text', label: 'Text', icon: 'T' },
  { id: 'measurement', label: 'Measure', icon: '\u21D4' }, // ⇔
  { id: 'pin', label: 'Pin', icon: '\uD83D\uDCCD' }, // 📍
];

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    height: '48px',
    paddingLeft: '8px',
    paddingRight: '8px',
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    borderBottom: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    overflowX: 'auto',
  },
  toolButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '1rem',
    color: HBC_SURFACE_LIGHT['text-primary'],
    transitionProperty: 'background-color, color',
    transitionDuration: '150ms',
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
  toolButtonActive: {
    backgroundColor: `${HBC_ACCENT_ORANGE}20`,
    color: HBC_ACCENT_ORANGE,
    ':hover': {
      backgroundColor: `${HBC_ACCENT_ORANGE}30`,
    },
  },
});

export function HbcMarkupToolbar({
  activeTool,
  onToolChange,
  className,
}: HbcMarkupToolbarProps): React.JSX.Element {
  const styles = useStyles();

  return (
    <div className={mergeClasses(styles.root, className)} role="toolbar" aria-label="Markup tools">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          type="button"
          className={mergeClasses(
            styles.toolButton,
            activeTool === tool.id ? styles.toolButtonActive : undefined,
          )}
          onClick={() => onToolChange(tool.id)}
          title={tool.label}
          aria-pressed={activeTool === tool.id}
          aria-label={tool.label}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
}
