import type { FC, ReactNode } from 'react';
import { PccStatusPill, type PccStatusPillTone } from './PccStatusPill';
import styles from './PccPreviewState.module.css';

/**
 * Wave 2 / Prompt 03 — full W2-ODR-009 state catalog.
 *
 * Every PCC surface region renders one of these eight states. Prompt 03
 * established the reusable visual contract; Prompt 08 expanded the catalog
 * with the deferred-operation preview state.
 */
export const PCC_PREVIEW_STATES = [
  'preview',
  'empty',
  'loading',
  'error',
  'missing-config',
  'unavailable-fixture',
  'unauthorized-persona',
  'not-yet-implemented-operation',
] as const;

export type PccPreviewStateKind = (typeof PCC_PREVIEW_STATES)[number];

interface PccPreviewStateSpec {
  tone: PccStatusPillTone;
  badge: string;
  title: string;
  description: string;
}

export const PCC_PREVIEW_STATE_SPECS: Record<PccPreviewStateKind, PccPreviewStateSpec> = {
  preview: {
    tone: 'info',
    badge: 'Preview',
    title: 'Fixture-driven preview',
    description: 'This region is wired to read-model fixtures. No live data is fetched.',
  },
  empty: {
    tone: 'neutral',
    badge: 'Empty',
    title: 'Nothing to show yet',
    description: 'No records match the current scope.',
  },
  loading: {
    tone: 'neutral',
    badge: 'Loading',
    title: 'Loading…',
    description: 'Reading the latest read-model.',
  },
  error: {
    tone: 'danger',
    badge: 'Error',
    title: 'Something went wrong',
    description: 'The read-model failed to load. Try again or report the issue.',
  },
  'missing-config': {
    tone: 'warning',
    badge: 'Missing config',
    title: 'Configuration missing',
    description: 'A required configuration value is not set for this project.',
  },
  'unavailable-fixture': {
    tone: 'neutral',
    badge: 'Unavailable',
    title: 'Preview content not available',
    description:
      'This surface is included in the Project Control Center shell, but no fixture content is available for the selected preview context.',
  },
  'unauthorized-persona': {
    tone: 'warning',
    badge: 'Restricted',
    title: 'Not visible to your role',
    description: 'Your persona does not have access to this region.',
  },
  'not-yet-implemented-operation': {
    tone: 'neutral',
    badge: 'Deferred',
    title: 'Operation not yet implemented',
    description: 'This action is intentionally disabled in Wave 2 preview mode.',
  },
};

export interface PccPreviewStateProps {
  state: PccPreviewStateKind;
  title?: string;
  description?: string;
  action?: ReactNode;
}

export const PccPreviewState: FC<PccPreviewStateProps> = ({
  state,
  title,
  description,
  action,
}) => {
  const spec = PCC_PREVIEW_STATE_SPECS[state];
  return (
    <div
      className={styles.root}
      data-pcc-state={state}
      data-pcc-state-tone={spec.tone}
      role={state === 'error' ? 'alert' : undefined}
      aria-busy={state === 'loading' ? true : undefined}
    >
      <div className={styles.header}>
        <PccStatusPill tone={spec.tone} filled={state === 'error'}>
          {spec.badge}
        </PccStatusPill>
        {state === 'loading' ? (
          <span className={styles.pulse} aria-hidden="true" />
        ) : null}
      </div>
      <p className={styles.title}>{title ?? spec.title}</p>
      <p className={styles.description}>{description ?? spec.description}</p>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
};

export default PccPreviewState;
