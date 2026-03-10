import React from 'react';
import { VERSION_TAG_LABELS, VERSION_TAG_COLORS } from '../utils/versionUtils';
import type { HbcVersionBadgeProps } from '../types';

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
  const tagLabel = currentTag ? VERSION_TAG_LABELS[currentTag] : undefined;
  const tagColor: string = currentTag ? VERSION_TAG_COLORS[currentTag] : 'grey';

  const content = (
    <>
      <span className="hbc-version-badge__version">v{currentVersion}</span>
      {tagLabel && (
        <>
          <span className="hbc-version-badge__separator" aria-hidden="true">·</span>
          <span
            className={`hbc-version-badge__tag hbc-version-badge__tag--${tagColor}`}
          >
            {tagLabel}
          </span>
        </>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        className="hbc-version-badge hbc-version-badge--interactive"
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
      className="hbc-version-badge"
      aria-label={`Version ${currentVersion}${tagLabel ? `, ${tagLabel}` : ''}`}
    >
      {content}
    </span>
  );
}
