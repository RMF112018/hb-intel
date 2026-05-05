/**
 * Document Control source-state messaging.
 *
 * Lane-keyed user-safe copy table for source-health and envelope
 * source-status rendering. Lives inside the Documents surface (not in
 * `@hbc/models`) so surface-specific UI copy stays surface-local. Pure —
 * no React, no runtime side effects, no live source health checks.
 *
 * Raw enum values remain available as machine markers on the lane card;
 * this module supplies only the visible product-safe text.
 */

import type { DocumentControlSourceHealthState, PccReadModelSourceStatus } from '@hbc/models/pcc';
import type { DocumentControlWave7LaneId } from './documentControlViewModel';

export type SourceStateMessageTone = 'info' | 'warning' | 'error';

export interface ISourceStateMessage {
  readonly kind: 'health' | 'disabled' | 'envelope';
  readonly tone: SourceStateMessageTone;
  readonly label: string;
  readonly message: string;
}

type LaneCopy = Readonly<
  Record<
    DocumentControlWave7LaneId,
    { readonly tone: SourceStateMessageTone; readonly label: string; readonly message: string }
  >
>;

const HEALTH_COPY: Readonly<Record<DocumentControlSourceHealthState, LaneCopy>> = {
  healthy: {
    'project-record': { tone: 'info', label: 'Connected', message: 'This source is connected.' },
    'my-project-files': {
      tone: 'info',
      label: 'Connected',
      message: 'Your project files area is connected.',
    },
    'external-systems': { tone: 'info', label: 'Connected', message: 'This system is connected.' },
  },
  warning: {
    'project-record': { tone: 'warning', label: 'Notice', message: 'This source has a notice.' },
    'my-project-files': {
      tone: 'warning',
      label: 'Notice',
      message: 'Your project files area has a notice.',
    },
    'external-systems': { tone: 'warning', label: 'Notice', message: 'This system has a notice.' },
  },
  degraded: {
    'project-record': {
      tone: 'warning',
      label: 'Partial results',
      message: 'Some results may be missing. Showing the latest available data.',
    },
    'my-project-files': {
      tone: 'warning',
      label: 'Partial results',
      message: 'Some results may be missing. Showing the latest available data.',
    },
    'external-systems': {
      tone: 'warning',
      label: 'Partial results',
      message: 'Some results may be missing. Showing the latest available data.',
    },
  },
  unavailable: {
    'project-record': {
      tone: 'error',
      label: 'Unavailable',
      message:
        'This source is temporarily unavailable. Try again later or ask an administrator to review source health.',
    },
    'my-project-files': {
      tone: 'error',
      label: 'Unavailable',
      message:
        'Your project files area is temporarily unavailable. Try again later or ask an administrator to review source health.',
    },
    'external-systems': {
      tone: 'error',
      label: 'Unavailable',
      message:
        'This system is temporarily unavailable. Try again later or ask an administrator to review source health.',
    },
  },
  'missing-binding': {
    'project-record': {
      tone: 'warning',
      label: 'Not configured',
      message: 'This source is not configured for the current project.',
    },
    'my-project-files': {
      tone: 'warning',
      label: 'Not configured',
      message: 'Your project files area is not yet set up for this project.',
    },
    'external-systems': {
      tone: 'warning',
      label: 'Mapping required',
      message: 'Mapping required to use this system on this project.',
    },
  },
  'access-denied': {
    'project-record': {
      tone: 'warning',
      label: 'Access required',
      message:
        'You may not have access to this source. Request access or ask a PCC administrator to review the mapping.',
    },
    'my-project-files': {
      tone: 'warning',
      label: 'Access required',
      message:
        'You may not have access to your project files. Ask a PCC administrator to review access.',
    },
    'external-systems': {
      tone: 'warning',
      label: 'Access required',
      message:
        'You may not have access. Request access or ask an administrator to correct the mapping.',
    },
  },
  throttled: {
    'project-record': {
      tone: 'info',
      label: 'Temporarily limited',
      message: 'Microsoft 365 limited the request. Try again in a minute.',
    },
    'my-project-files': {
      tone: 'info',
      label: 'Temporarily limited',
      message: 'Microsoft 365 limited the request. Try again in a minute.',
    },
    'external-systems': {
      tone: 'info',
      label: 'Temporarily limited',
      message: 'This system limited the request. Try again in a minute.',
    },
  },
  'pending-initialization': {
    'project-record': {
      tone: 'info',
      label: 'Setting up',
      message: 'This source is being prepared. It is not yet available.',
    },
    'my-project-files': {
      tone: 'info',
      label: 'Setting up',
      message: 'Your project files area is being prepared. It is not yet available.',
    },
    'external-systems': {
      tone: 'info',
      label: 'Setting up',
      message: 'This system is being prepared. It is not yet available.',
    },
  },
  'folder-creation-failed': {
    'project-record': {
      tone: 'error',
      label: 'Setup needed',
      message: 'This source could not be set up. Ask a PCC administrator to review.',
    },
    'my-project-files': {
      tone: 'error',
      label: 'Setup needed',
      message: 'Your project files area could not be created. Ask a PCC administrator to review.',
    },
    'external-systems': {
      tone: 'error',
      label: 'Setup needed',
      message: 'This system could not be set up. Ask a PCC administrator to review.',
    },
  },
};

const DISABLED_COPY: LaneCopy = {
  'project-record': {
    tone: 'info',
    label: 'Disabled',
    message: 'Intentionally disabled for this project.',
  },
  'my-project-files': { tone: 'info', label: 'Disabled', message: 'Not used for this project.' },
  'external-systems': { tone: 'info', label: 'Disabled', message: 'Not used for this project.' },
};

type DegradedEnvelopeStatus = Exclude<PccReadModelSourceStatus, 'available'>;

const ENVELOPE_COPY: Readonly<Record<DegradedEnvelopeStatus, LaneCopy>> = {
  'backend-unavailable': {
    'project-record': {
      tone: 'error',
      label: 'Temporarily unavailable',
      message: 'Document control is temporarily unavailable. Try again later.',
    },
    'my-project-files': {
      tone: 'error',
      label: 'Temporarily unavailable',
      message: 'Document control is temporarily unavailable. Try again later.',
    },
    'external-systems': {
      tone: 'error',
      label: 'Temporarily unavailable',
      message: 'Document control is temporarily unavailable. Try again later.',
    },
  },
  'source-unavailable': {
    'project-record': {
      tone: 'error',
      label: 'Sources unavailable',
      message: 'Document control sources are not available for this project.',
    },
    'my-project-files': {
      tone: 'error',
      label: 'Sources unavailable',
      message: 'Your project files area is not available for this project.',
    },
    'external-systems': {
      tone: 'error',
      label: 'Sources unavailable',
      message: 'External systems are not available for this project.',
    },
  },
  'missing-config': {
    'project-record': {
      tone: 'warning',
      label: 'Mapping required',
      message: 'Document control sources are not configured for this project.',
    },
    'my-project-files': {
      tone: 'warning',
      label: 'Mapping required',
      message: 'Your project files area is not configured for this project.',
    },
    'external-systems': {
      tone: 'warning',
      label: 'Mapping required',
      message: 'External systems are not configured for this project.',
    },
  },
  stale: {
    'project-record': {
      tone: 'warning',
      label: 'Partial results',
      message: 'Some results may be missing. Showing the latest available data.',
    },
    'my-project-files': {
      tone: 'warning',
      label: 'Partial results',
      message: 'Some results may be missing. Showing the latest available data.',
    },
    'external-systems': {
      tone: 'warning',
      label: 'Partial results',
      message: 'Some results may be missing. Showing the latest available data.',
    },
  },
  unauthorized: {
    'project-record': {
      tone: 'warning',
      label: 'Access required',
      message:
        'You may not have access to document control. Request access or ask a PCC administrator to review.',
    },
    'my-project-files': {
      tone: 'warning',
      label: 'Access required',
      message:
        'You may not have access to your project files. Ask a PCC administrator to review access.',
    },
    'external-systems': {
      tone: 'warning',
      label: 'Access required',
      message:
        'You may not have access to external systems. Ask a PCC administrator to review access.',
    },
  },
  forbidden: {
    'project-record': {
      tone: 'error',
      label: 'Access denied',
      message: 'You do not have access to document control on this project.',
    },
    'my-project-files': {
      tone: 'error',
      label: 'Access denied',
      message: 'You do not have access to your project files on this project.',
    },
    'external-systems': {
      tone: 'error',
      label: 'Access denied',
      message: 'You do not have access to external systems on this project.',
    },
  },
};

export function resolveEntryHealthMessage(
  laneId: DocumentControlWave7LaneId,
  healthState: DocumentControlSourceHealthState,
): ISourceStateMessage {
  const entry = HEALTH_COPY[healthState][laneId];
  return { kind: 'health', tone: entry.tone, label: entry.label, message: entry.message };
}

export function resolveDisabledMessage(laneId: DocumentControlWave7LaneId): ISourceStateMessage {
  const entry = DISABLED_COPY[laneId];
  return { kind: 'disabled', tone: entry.tone, label: entry.label, message: entry.message };
}

export function resolveLaneEnvelopeMessage(
  laneId: DocumentControlWave7LaneId,
  sourceStatus: PccReadModelSourceStatus,
): ISourceStateMessage | undefined {
  if (sourceStatus === 'available') return undefined;
  const entry = ENVELOPE_COPY[sourceStatus][laneId];
  return { kind: 'envelope', tone: entry.tone, label: entry.label, message: entry.message };
}
