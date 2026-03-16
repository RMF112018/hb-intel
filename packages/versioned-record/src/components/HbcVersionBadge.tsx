import React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import {
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_RADIUS_FULL,
  HBC_STATUS_RAMP_GREEN,
  HBC_STATUS_RAMP_RED,
  HBC_STATUS_RAMP_INFO,
  HBC_STATUS_RAMP_GRAY,
  HBC_SURFACE_LIGHT,
} from '@hbc/ui-kit/theme';
import { VERSION_TAG_LABELS, VERSION_TAG_COLORS } from '../utils/versionUtils';
import type { HbcVersionBadgeProps } from '../types';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const useStyles = makeStyles({
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_XS}px`,
    fontSize: '11px',
    fontWeight: 600,
    lineHeight: '16px',
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    borderRadius: HBC_RADIUS_FULL,
    backgroundColor: HBC_STATUS_RAMP_GRAY[90],
    color: HBC_SURFACE_LIGHT['text-primary'],
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  interactive: {
    border: 'none',
    cursor: 'pointer',
    transitionProperty: 'background',
    transitionDuration: '0.1s',
    transitionTimingFunction: 'ease',
    ':hover': {
      backgroundColor: HBC_STATUS_RAMP_GRAY[70],
    },
  },
  version: {
    fontWeight: 600,
  },
  separator: {
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  tagGreen: { color: HBC_STATUS_RAMP_GREEN[30] },
  tagRed: { color: HBC_STATUS_RAMP_RED[30] },
  tagBlue: { color: HBC_STATUS_RAMP_INFO[30] },
  tagPurple: { color: HBC_STATUS_RAMP_INFO[10] },
  tagGrey: { color: HBC_STATUS_RAMP_GRAY[30] },
});

const TAG_COLOR_MAP: Record<string, keyof ReturnType<typeof useStyles>> = {
  green: 'tagGreen',
  red: 'tagRed',
  blue: 'tagBlue',
  purple: 'tagPurple',
  grey: 'tagGrey',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Compact version chip for record headers.
 * Renders as "v3 · Approved" with a colored tag.
 * Clicking opens the version history panel (caller's responsibility via `onClick`).
 * SPFx-compatible.
 */
export function HbcVersionBadge({
  currentVersion,
  currentTag,
  onClick,
}: HbcVersionBadgeProps): React.ReactElement {
  const classes = useStyles();
  const tagLabel = currentTag ? VERSION_TAG_LABELS[currentTag] : undefined;
  const tagColor: string = currentTag ? VERSION_TAG_COLORS[currentTag] : 'grey';

  const content = (
    <>
      <span className={classes.version}>v{currentVersion}</span>
      {tagLabel && (
        <>
          <span className={classes.separator} aria-hidden="true">·</span>
          <span className={classes[TAG_COLOR_MAP[tagColor] ?? 'tagGrey']}>
            {tagLabel}
          </span>
        </>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        className={mergeClasses(classes.badge, classes.interactive)}
        onClick={onClick}
        aria-label={`Version ${currentVersion}${tagLabel ? `, ${tagLabel}` : ''}. Click to view history.`}
        type="button"
      >
        {content}
      </button>
    );
  }

  return (
    <span
      className={classes.badge}
      aria-label={`Version ${currentVersion}${tagLabel ? `, ${tagLabel}` : ''}`}
    >
      {content}
    </span>
  );
}
