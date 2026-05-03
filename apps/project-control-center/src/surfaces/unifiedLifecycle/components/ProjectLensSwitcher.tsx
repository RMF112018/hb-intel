/**
 * Unified Lifecycle preview seam — ProjectLensSwitcher.
 *
 * PREVIEW-ONLY SELECTOR. Renders the available lenses with the
 * default lens visually pressed; every lens button is disabled and
 * marked `data-pcc-action-state="preview-disabled"`. The component
 * intentionally does not own state, has no router, no workspace
 * switching, and never triggers a route change. Lenses filter shared
 * project truth — they are not separate workspaces.
 *
 * Pure: no client, no hooks, no fetch, no useState/useEffect.
 */

import { type FC } from 'react';
import { PccPreviewState } from '../../../ui/PccPreviewState';
import { PccStatusPill } from '../../../ui/PccStatusPill';
import type {
  IPccLensOptionVm,
  IPccProjectLensesViewModel,
} from '../unifiedLifecycleViewModel.js';
import styles from './ProjectLensSwitcher.module.css';

export interface IProjectLensSwitcherProps {
  readonly viewModel: IPccProjectLensesViewModel;
}

export const ProjectLensSwitcher: FC<IProjectLensSwitcherProps> = ({ viewModel }) => {
  if (viewModel.sourceStatus !== 'available') {
    return (
      <div data-pcc-project-lens-switcher="" className={styles.root}>
        <PccPreviewState state={viewModel.cardState} />
      </div>
    );
  }

  if (viewModel.lenses.length === 0) {
    return (
      <div data-pcc-project-lens-switcher="" className={styles.root}>
        <PccPreviewState state="empty" />
      </div>
    );
  }

  return (
    <div data-pcc-project-lens-switcher="" className={styles.root}>
      <ul className={styles.lensRow} aria-label="Project lenses">
        {viewModel.lenses.map((lens) => (
          <LensButton
            key={lens.lensId}
            lens={lens}
            active={lens.lensId === viewModel.defaultLensId}
          />
        ))}
      </ul>
      <p className={styles.caption}>
        Lenses filter shared project truth. They are not separate workspaces and do not
        change route or navigation.
      </p>
    </div>
  );
};

const LensButton: FC<{ lens: IPccLensOptionVm; active: boolean }> = ({ lens, active }) => {
  const includedTotal =
    lens.includedMemoryIds.length +
    lens.includedEventIds.length +
    lens.includedTraceEdgeIds.length;
  return (
    <li className={styles.lensItem}>
      <button
        type="button"
        disabled
        aria-pressed={active}
        data-pcc-lens-id={lens.lensId}
        data-pcc-action-state="preview-disabled"
        className={`${styles.lensButton} ${active ? styles.lensButtonActive : ''}`}
      >
        <span className={styles.lensType}>{lens.lensType}</span>
        <span className={styles.lensMeta}>
          <span>{lens.visibilityMode}</span>
          <span> · </span>
          <span>{lens.role}</span>
        </span>
        <PccStatusPill tone="neutral">{includedTotal} records</PccStatusPill>
      </button>
    </li>
  );
};

export default ProjectLensSwitcher;
