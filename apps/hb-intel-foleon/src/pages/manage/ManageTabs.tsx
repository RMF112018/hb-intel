import { clsx } from 'clsx';
import shell from './manageShell.module.css';

export type ManageTabKey = 'content' | 'config';

export function ManageTabs(props: {
  readonly selected: ManageTabKey;
  readonly onSelect: (tab: ManageTabKey) => void;
}): React.ReactNode {
  return (
    <div className={shell.tabs} role="tablist" aria-label="Foleon Manager sections">
      <button
        type="button"
        role="tab"
        aria-selected={props.selected === 'content'}
        className={clsx(shell.tabButton, props.selected === 'content' ? shell.tabButtonActive : null)}
        onClick={(): void => props.onSelect('content')}
      >
        Homepage Foleon Content
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={props.selected === 'config'}
        className={clsx(shell.tabButton, props.selected === 'config' ? shell.tabButtonActive : null)}
        onClick={(): void => props.onSelect('config')}
      >
        Config
      </button>
    </div>
  );
}
