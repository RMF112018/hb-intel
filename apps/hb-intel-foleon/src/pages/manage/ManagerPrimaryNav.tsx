import { clsx } from 'clsx';
import type { KeyboardEvent } from 'react';
import shell from './manageShell.module.css';

export type ManagerPrimaryNavKey =
  | 'content-operations'
  | 'lane-board'
  | 'preview'
  | 'admin-config';

export interface ManagerPrimaryNavEntry {
  readonly key: ManagerPrimaryNavKey;
  readonly label: string;
}

export const MANAGER_PRIMARY_NAV_ENTRIES: ReadonlyArray<ManagerPrimaryNavEntry> = [
  { key: 'content-operations', label: 'Content Operations' },
  { key: 'lane-board', label: 'Lane Board' },
  { key: 'preview', label: 'Preview' },
  { key: 'admin-config', label: 'Admin / Config' },
];

export function navButtonId(key: ManagerPrimaryNavKey): string {
  return `foleon-manage-nav-${key}`;
}

export function navPanelId(key: ManagerPrimaryNavKey): string {
  return `foleon-manage-panel-${key}`;
}

export function ManagerPrimaryNav(props: {
  readonly selected: ManagerPrimaryNavKey;
  readonly onSelect: (key: ManagerPrimaryNavKey) => void;
}): React.ReactNode {
  const ordered = MANAGER_PRIMARY_NAV_ENTRIES;

  const focusEntry = (key: ManagerPrimaryNavKey): void => {
    const target = document.querySelector<HTMLButtonElement>(`[data-foleon-manage-nav="${key}"]`);
    target?.focus();
  };

  const onKeyDown = (key: ManagerPrimaryNavKey, event: KeyboardEvent<HTMLButtonElement>): void => {
    const index = ordered.findIndex((entry) => entry.key === key);
    if (index < 0) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      const next = ordered[(index + 1) % ordered.length]?.key ?? key;
      props.onSelect(next);
      focusEntry(next);
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const prev = ordered[(index - 1 + ordered.length) % ordered.length]?.key ?? key;
      props.onSelect(prev);
      focusEntry(prev);
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      const first = ordered[0]?.key;
      if (first) {
        props.onSelect(first);
        focusEntry(first);
      }
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      const last = ordered[ordered.length - 1]?.key;
      if (last) {
        props.onSelect(last);
        focusEntry(last);
      }
    }
  };

  return (
    <div
      className={shell.primaryNav}
      role="tablist"
      aria-label="Foleon Manager workspaces"
    >
      {ordered.map((entry) => {
        const isSelected = entry.key === props.selected;
        return (
          <button
            key={entry.key}
            type="button"
            role="tab"
            id={navButtonId(entry.key)}
            data-foleon-manage-nav={entry.key}
            aria-selected={isSelected}
            aria-controls={navPanelId(entry.key)}
            tabIndex={isSelected ? 0 : -1}
            className={clsx(shell.primaryNavButton, isSelected ? shell.primaryNavButtonActive : null)}
            onClick={(): void => props.onSelect(entry.key)}
            onKeyDown={(event): void => onKeyDown(entry.key, event)}
          >
            {entry.label}
          </button>
        );
      })}
    </div>
  );
}
