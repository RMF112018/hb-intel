import { clsx } from 'clsx';
import type { KeyboardEvent } from 'react';
import shell from './manageShell.module.css';

export type ManageTabKey = 'content' | 'config';

export function ManageTabs(props: {
  readonly selected: ManageTabKey;
  readonly onSelect: (tab: ManageTabKey) => void;
}): React.ReactNode {
  const orderedTabs: ReadonlyArray<ManageTabKey> = ['content', 'config'];
  const focusTab = (tab: ManageTabKey): void => {
    const target = document.querySelector<HTMLButtonElement>(`[data-foleon-manage-tab="${tab}"]`);
    target?.focus();
  };
  const onTabKeyDown = (tab: ManageTabKey, event: KeyboardEvent<HTMLButtonElement>): void => {
    const index = orderedTabs.indexOf(tab);
    if (index < 0) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      const next = orderedTabs[(index + 1) % orderedTabs.length] ?? tab;
      props.onSelect(next);
      focusTab(next);
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const prev = orderedTabs[(index - 1 + orderedTabs.length) % orderedTabs.length] ?? tab;
      props.onSelect(prev);
      focusTab(prev);
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      props.onSelect('content');
      focusTab('content');
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      props.onSelect('config');
      focusTab('config');
    }
  };

  return (
    <div className={shell.tabs} role="tablist" aria-label="Foleon Manager sections">
      <button
        type="button"
        role="tab"
        id="foleon-manage-tab-content"
        data-foleon-manage-tab="content"
        aria-selected={props.selected === 'content'}
        aria-controls="foleon-manage-panel-content"
        className={clsx(shell.tabButton, props.selected === 'content' ? shell.tabButtonActive : null)}
        onClick={(): void => props.onSelect('content')}
        onKeyDown={(event): void => onTabKeyDown('content', event)}
      >
        Homepage Foleon Content
      </button>
      <button
        type="button"
        role="tab"
        id="foleon-manage-tab-config"
        data-foleon-manage-tab="config"
        aria-selected={props.selected === 'config'}
        aria-controls="foleon-manage-panel-config"
        className={clsx(shell.tabButton, props.selected === 'config' ? shell.tabButtonActive : null)}
        onClick={(): void => props.onSelect('config')}
        onKeyDown={(event): void => onTabKeyDown('config', event)}
      >
        Config
      </button>
    </div>
  );
}
