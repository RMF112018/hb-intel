/**
 * TeamViewerPersonCard — single-person card.
 *
 * Renders a photo (or initials fallback), name, and job title. When a
 * detail-open handler is provided the whole card becomes a semantic
 * button (keyboard-safe); when not, it renders as a static article so
 * the card has no affordance when the detail drawer is disabled.
 */
import * as React from 'react';
import type { TeamViewerDensity, TeamViewerPerson } from '../teamViewerContracts.js';

export interface TeamViewerPersonCardProps {
  person: TeamViewerPerson;
  density: TeamViewerDensity;
  onOpenDetail?: (person: TeamViewerPerson) => void;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

const AVATAR_SIZE_PX: Record<TeamViewerDensity, number> = {
  compact: 40,
  standard: 56,
  expanded: 80,
};

export function TeamViewerPersonCard({
  person,
  density,
  onOpenDetail,
}: TeamViewerPersonCardProps): React.JSX.Element {
  const avatarSize = AVATAR_SIZE_PX[density];
  const isInteractive = typeof onOpenDetail === 'function';

  const avatar = person.photoUrl ? (
    <img
      src={person.photoUrl}
      alt=""
      width={avatarSize}
      height={avatarSize}
      style={{
        width: avatarSize,
        height: avatarSize,
        borderRadius: '50%',
        objectFit: 'cover',
        display: 'block',
      }}
    />
  ) : (
    <div
      aria-hidden="true"
      style={{
        width: avatarSize,
        height: avatarSize,
        borderRadius: '50%',
        background: 'var(--hbc-surface-2, #e5e7eb)',
        color: 'var(--hbc-text-strong, #111827)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: avatarSize * 0.38,
      }}
    >
      {initialsOf(person.displayName) || '—'}
    </div>
  );

  const body = (
    <>
      {avatar}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span
          data-hbc-testid="team-viewer-person-name"
          style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {person.displayName}
        </span>
        {person.jobTitle ? (
          <span
            data-hbc-testid="team-viewer-person-title"
            style={{ fontSize: '0.875em', color: 'var(--hbc-text-muted, #4b5563)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {person.jobTitle}
          </span>
        ) : null}
      </div>
    </>
  );

  const commonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: density === 'compact' ? 8 : 12,
    borderRadius: 12,
    background: 'transparent',
    border: '1px solid transparent',
    textAlign: 'left',
    width: '100%',
  };

  if (isInteractive) {
    return (
      <button
        type="button"
        data-hbc-testid="team-viewer-person-card"
        data-hbc-person-id={person.id}
        onClick={() => onOpenDetail?.(person)}
        style={{ ...commonStyle, cursor: 'pointer' }}
      >
        {body}
      </button>
    );
  }

  return (
    <article
      data-hbc-testid="team-viewer-person-card"
      data-hbc-person-id={person.id}
      style={commonStyle}
    >
      {body}
    </article>
  );
}
