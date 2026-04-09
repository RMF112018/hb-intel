/**
 * HbcAvatarStack — Overlapping avatar cluster with initials fallback.
 *
 * Homepage-safe primitive used by HbcPeopleCultureSurface and
 * HbcKudosComposer to render recognition recipients, celebration chips,
 * and preview clusters with consistent presentation-lane styling.
 *
 * Wave 01 follow-on: People & Culture migration to @hbc/ui-kit/homepage.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import styles from './avatar-stack.module.css';

export type HbcAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface HbcAvatarStackPerson {
  id: string;
  name: string;
  src?: string;
}

export interface HbcAvatarStackProps {
  people: HbcAvatarStackPerson[];
  /** Visual size tier. Defaults to 'md' (36px). */
  size?: HbcAvatarSize;
  /** Maximum visible avatars before overflow. Defaults to all. */
  max?: number;
  /**
   * How to render overflow when `people.length > max`.
   * - `count`  → trailing chip "+N"
   * - `inline-text` → "+N more" text label
   * - `none`   → hide overflow indicator
   * Defaults to 'count'.
   */
  overflow?: 'count' | 'inline-text' | 'none';
  /** Decorate the first avatar with a ring for hero treatment. */
  ring?: boolean;
  className?: string;
}

function initialsOf(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0]!.toUpperCase();
  return (parts[0][0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

interface AvatarProps {
  person: HbcAvatarStackPerson;
  sizeClass: string;
  ring: boolean;
}

function Avatar({ person, sizeClass, ring }: AvatarProps): React.JSX.Element {
  const [errored, setErrored] = React.useState(false);
  const showImg = person.src && !errored;

  if (showImg) {
    return (
      <img
        src={person.src}
        alt={person.name}
        decoding="async"
        className={clsx(styles.avatar, sizeClass, ring && styles.ring)}
        onError={() => setErrored(true)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={clsx(styles.avatar, styles.fallback, sizeClass, ring && styles.ring)}
    >
      {initialsOf(person.name)}
    </span>
  );
}

export function HbcAvatarStack({
  people,
  size = 'md',
  max,
  overflow = 'count',
  ring = false,
  className,
}: HbcAvatarStackProps): React.JSX.Element | null {
  if (people.length === 0) return null;

  const visible = typeof max === 'number' ? people.slice(0, max) : people;
  const overflowCount = people.length - visible.length;
  const sizeClass = styles[`size_${size}`]!;

  return (
    <div
      className={clsx(styles.stack, styles[`stack_${size}`], className)}
      data-hbc-presentation="avatar-stack"
    >
      {visible.map((person, index) => (
        <span
          key={person.id}
          className={styles.slot}
          style={{ zIndex: visible.length - index }}
        >
          <Avatar
            person={person}
            sizeClass={sizeClass}
            ring={ring && index === 0}
          />
        </span>
      ))}

      {overflowCount > 0 && overflow === 'count' ? (
        <span
          className={clsx(styles.avatar, styles.fallback, styles.overflow, sizeClass)}
          aria-label={`${overflowCount} more`}
        >
          +{overflowCount}
        </span>
      ) : null}

      {overflowCount > 0 && overflow === 'inline-text' ? (
        <span className={styles.overflowText}>+{overflowCount} more</span>
      ) : null}
    </div>
  );
}
