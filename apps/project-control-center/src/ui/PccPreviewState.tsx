import type { FC, ReactNode } from 'react';
import { PccStatusPill, type PccStatusPillTone } from './PccStatusPill';
import styles from './PccPreviewState.module.css';

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
    badge: 'Reference',
    title: 'Reference view',
    description: 'This area shows reference content for the selected project.',
  },
  empty: {
    tone: 'neutral',
    badge: 'Empty',
    title: 'Nothing to show yet',
    description: 'No items match the current view.',
  },
  loading: {
    tone: 'neutral',
    badge: 'Loading',
    title: 'Loading…',
    description: 'Loading the latest information.',
  },
  error: {
    tone: 'danger',
    badge: 'Error',
    title: 'We could not load this section',
    description: 'Try again, or contact your administrator if the issue continues.',
  },
  'missing-config': {
    tone: 'warning',
    badge: 'Setup needed',
    title: 'Configuration needed',
    description:
      'This area needs configuration before it can show data. Ask your administrator to complete setup.',
  },
  'unavailable-fixture': {
    tone: 'neutral',
    badge: 'Unavailable',
    title: 'Not available for this project',
    description:
      'This area is part of the Project Control Center, but no content is available for the selected project.',
  },
  'unauthorized-persona': {
    tone: 'warning',
    badge: 'Restricted',
    title: 'Not visible to your role',
    description:
      'You do not have access to this area. Contact your administrator if you need access.',
  },
  'not-yet-implemented-operation': {
    tone: 'neutral',
    badge: 'Unavailable',
    title: 'Action not available',
    description: 'This action is not available in the current view.',
  },
};

export interface PccPreviewStateProps {
  state: PccPreviewStateKind;
  title?: string;
  description?: string;
  reason?: string;
  nextStep?: string;
  action?: ReactNode;
}

export const PccPreviewState: FC<PccPreviewStateProps> = ({
  state,
  title,
  description,
  reason,
  nextStep,
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
        {state === 'loading' ? <span className={styles.pulse} aria-hidden="true" /> : null}
      </div>
      <p className={styles.title}>{title ?? spec.title}</p>
      <p className={styles.description}>{description ?? spec.description}</p>
      {reason ? (
        <p className={styles.reason} data-pcc-preview-state-reason>
          {reason}
        </p>
      ) : null}
      {nextStep ? (
        <p className={styles.nextStep} data-pcc-preview-state-next-step>
          {nextStep}
        </p>
      ) : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
};

export default PccPreviewState;
