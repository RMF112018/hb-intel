/**
 * Editorial spine — vertical progress rail rendered inside the draft
 * apron. Replaces the earlier horizontal pill-strip section index
 * (`sectionIndex`) as the wave-01 structural redesign demotes
 * section navigation from canvas chrome to subordinate apron rail.
 *
 * Each entry is a hash anchor to `#section-<id>`; click handling is
 * delegated to the shared `handleSectionIndexClick` helper so focus
 * and smooth-scroll behaviour stay identical to the prior index.
 *
 * Completion dots are a visual only affordance. The draft itself,
 * the readiness controller, and validation surfaces remain the
 * authoritative gating; the spine does not block navigation.
 */
import * as React from 'react';
import { handleSectionIndexClick } from '../sectionFocus.js';
import styles from '../article-publisher.module.css';

export type SpineStatus = 'complete' | 'partial' | 'empty' | 'optional';

export interface SpineEntry {
  readonly id: string;
  readonly label: string;
  readonly status: SpineStatus;
}

export interface EditorialSpineProps {
  readonly entries: readonly SpineEntry[];
  readonly activeId?: string;
}

export function EditorialSpine({
  entries,
  activeId,
}: EditorialSpineProps): React.JSX.Element {
  const linkRefs = React.useRef<Array<HTMLAnchorElement | null>>([]);

  const focusAt = (index: number) => {
    const clamped = (index + entries.length) % entries.length;
    linkRefs.current[clamped]?.focus();
  };

  const handleListKeyDown = (
    ev: React.KeyboardEvent<HTMLOListElement>,
  ) => {
    if (!(ev.target instanceof HTMLAnchorElement)) return;
    const currentIndex = linkRefs.current.findIndex(
      (node) => node === ev.target,
    );
    if (currentIndex < 0) return;
    switch (ev.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        ev.preventDefault();
        focusAt(currentIndex + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        ev.preventDefault();
        focusAt(currentIndex - 1);
        break;
      case 'Home':
        ev.preventDefault();
        focusAt(0);
        break;
      case 'End':
        ev.preventDefault();
        focusAt(entries.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <nav
      className={styles.editorialSpine}
      aria-label="Article composition progress"
      onClick={handleSectionIndexClick}
    >
      <div className={styles.editorialSpineHeading}>Compose</div>
      <ol
        className={styles.editorialSpineList}
        onKeyDown={handleListKeyDown}
      >
        {entries.map((entry, idx) => {
          const isActive = entry.id === activeId;
          return (
            <li
              key={entry.id}
              className={
                isActive
                  ? styles.editorialSpineItemActive
                  : styles.editorialSpineItem
              }
            >
              <a
                ref={(el) => {
                  linkRefs.current[idx] = el;
                }}
                href={`#section-${entry.id}`}
                className={styles.editorialSpineLink}
                aria-current={isActive ? 'location' : undefined}
                aria-label={`${entry.label} — ${statusText(entry.status)}`}
              >
                <span
                  className={spineDotClass(entry.status)}
                  aria-hidden="true"
                />
                <span className={styles.editorialSpineIndex} aria-hidden="true">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className={styles.editorialSpineLabel}>{entry.label}</span>
                <span className={styles.editorialSpineStatus} aria-hidden="true">
                  {statusText(entry.status)}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function spineDotClass(status: SpineStatus): string {
  switch (status) {
    case 'complete':
      return styles.editorialSpineDotComplete;
    case 'partial':
      return styles.editorialSpineDotPartial;
    case 'optional':
      return styles.editorialSpineDotOptional;
    case 'empty':
    default:
      return styles.editorialSpineDotEmpty;
  }
}

function statusText(status: SpineStatus): string {
  switch (status) {
    case 'complete':
      return 'Ready';
    case 'partial':
      return 'In progress';
    case 'optional':
      return 'Optional';
    case 'empty':
    default:
      return 'Not started';
  }
}
