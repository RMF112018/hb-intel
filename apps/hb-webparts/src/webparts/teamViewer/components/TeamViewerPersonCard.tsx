/**
 * TeamViewerPersonCard — premium person tile.
 *
 * Refined, people-centric row: photo (or initials fallback), name, and
 * a single optional title line. When a detail-open handler is provided
 * the tile is a semantic button with decisive hover/focus/press states
 * and a trailing chevron affordance. When not, it renders as a static
 * `<article>` with no interactive affordance — the disabled-drawer
 * posture stays explicit in the DOM.
 *
 * Motion respects `useHomepageReducedMotion`: when reduced motion is
 * preferred, the tile suppresses the press/hover translate.
 */
import * as React from 'react';
import {
  ArrowRight,
  motion,
  useHomepageReducedMotion,
} from '@hbc/ui-kit/homepage';
import type { TeamViewerDensity, TeamViewerPerson } from '../teamViewerContracts.js';
import { tileInlineStyle } from '../teamViewerVariants.js';

export interface TeamViewerPersonCardProps {
  person: TeamViewerPerson;
  density: TeamViewerDensity;
  featured?: boolean;
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
  standard: 52,
  expanded: 72,
};

function Avatar({ person, size }: { person: TeamViewerPerson; size: number }): React.JSX.Element {
  if (person.photoUrl) {
    return (
      <img
        src={person.photoUrl}
        alt=""
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          display: 'block',
          boxShadow: '0 0 0 2px var(--tv-surface-1, #ffffff), 0 2px 6px rgba(17,24,39,0.12)',
          flex: '0 0 auto',
        }}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background:
          'linear-gradient(135deg, var(--tv-accent-from, #1e3a8a), var(--tv-accent-to, #3b82f6))',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: Math.round(size * 0.36),
        letterSpacing: '-0.01em',
        flex: '0 0 auto',
        boxShadow: '0 0 0 2px var(--tv-surface-1, #ffffff), 0 2px 6px rgba(17,24,39,0.12)',
      }}
    >
      {initialsOf(person.displayName) || '—'}
    </div>
  );
}

export function TeamViewerPersonCard({
  person,
  density,
  featured = false,
  onOpenDetail,
}: TeamViewerPersonCardProps): React.JSX.Element {
  const reducedMotion = useHomepageReducedMotion();
  const isInteractive = typeof onOpenDetail === 'function';
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  const state: 'rest' | 'hover' | 'focus' | 'press' =
    pressed && !reducedMotion ? 'press' : focused ? 'focus' : hovered ? 'hover' : 'rest';
  const style = tileInlineStyle({ interactive: isInteractive, density, featured, state });
  if (reducedMotion) {
    style.transform = 'none';
  }

  const avatarSize = AVATAR_SIZE_PX[density];
  const body = (
    <>
      <Avatar person={person} size={avatarSize} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
        <span
          data-hbc-testid="team-viewer-person-name"
          style={{
            fontWeight: 600,
            fontSize: density === 'expanded' ? '1rem' : '0.9375rem',
            letterSpacing: '-0.005em',
            lineHeight: 1.25,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {person.displayName}
        </span>
        {person.jobTitle ? (
          <span
            data-hbc-testid="team-viewer-person-title"
            style={{
              fontSize: '0.8125rem',
              color: 'var(--tv-text-muted, #4b5563)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.35,
            }}
          >
            {person.jobTitle}
          </span>
        ) : null}
      </div>
      {isInteractive ? (
        <ArrowRight
          aria-hidden="true"
          size={18}
          style={{
            color: 'var(--tv-text-muted, #4b5563)',
            opacity: hovered || focused ? 1 : 0.6,
            transform: hovered && !reducedMotion ? 'translateX(2px)' : 'translateX(0)',
            transition: 'transform 160ms ease, opacity 140ms ease',
            flex: '0 0 auto',
          }}
        />
      ) : null}
    </>
  );

  const sharedProps = {
    'data-hbc-testid': 'team-viewer-person-card',
    'data-hbc-person-id': person.id,
    'data-hbc-density': density,
    'data-hbc-featured': featured ? 'true' : undefined,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => {
      setHovered(false);
      setPressed(false);
    },
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  } as const;

  if (isInteractive) {
    return (
      <motion.button
        type="button"
        {...sharedProps}
        onClick={() => onOpenDetail?.(person)}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') setPressed(true);
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') setPressed(false);
        }}
        style={style}
        whileTap={reducedMotion ? undefined : { scale: 0.995 }}
      >
        {body}
      </motion.button>
    );
  }

  return (
    <article {...sharedProps} style={style}>
      {body}
    </article>
  );
}
