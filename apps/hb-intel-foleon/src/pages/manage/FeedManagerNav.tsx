import { clsx } from 'clsx';
import type { KeyboardEvent } from 'react';
import {
  FEED_MANAGER_NAV_ENTRIES,
  feedManagerNavButtonId,
  feedManagerNavPanelId,
  type FeedManagerWorkspaceKey,
} from './feedManagerViewModel.js';
import shell from './manageShell.module.css';

export interface FeedManagerNavProps {
  readonly selected: FeedManagerWorkspaceKey;
  readonly onSelect: (key: FeedManagerWorkspaceKey) => void;
}

export function FeedManagerNav(props: FeedManagerNavProps): React.ReactNode {
  const ordered = FEED_MANAGER_NAV_ENTRIES;

  const focusEntry = (key: FeedManagerWorkspaceKey): void => {
    const target = document.querySelector<HTMLButtonElement>(
      `[data-feed-manager-nav="${key}"]`,
    );
    target?.focus();
  };

  const onKeyDown = (
    key: FeedManagerWorkspaceKey,
    event: KeyboardEvent<HTMLButtonElement>,
  ): void => {
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
      aria-label="Foleon Feed Manager workspaces"
    >
      {ordered.map((entry) => {
        const isSelected = entry.key === props.selected;
        return (
          <button
            key={entry.key}
            type="button"
            role="tab"
            id={feedManagerNavButtonId(entry.key)}
            data-feed-manager-nav={entry.key}
            aria-selected={isSelected}
            aria-controls={feedManagerNavPanelId(entry.key)}
            tabIndex={isSelected ? 0 : -1}
            className={clsx(
              shell.primaryNavButton,
              isSelected ? shell.primaryNavButtonActive : null,
            )}
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
