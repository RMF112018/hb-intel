/**
 * Deterministic Kudos seed factories.
 *
 * These helpers produce stable shapes for stress-suite fixtures. They do
 * NOT write to SharePoint directly; the harness injects them via the
 * dev-harness Kudos tab seed hook (see 10-Harness-Architecture.md §Seeding).
 *
 * Workflow core is the 7-state union from repo truth. Overlays
 * (governance, visibility, prominence, interaction, identity) are
 * modeled as separate fields and NEVER promoted into the workflow enum.
 */
import { at, KUDOS_SCHEDULED_FUTURE_ISO } from './kudosClock';

export type KudosWorkflowState =
  | 'pending'
  | 'revisionRequested'
  | 'approved'
  | 'approvedScheduled'
  | 'rejected'
  | 'withdrawn'
  | 'removedUnpublished';

export interface SeededKudosRecipient {
  id: string;
  kind: 'individual' | 'team' | 'department' | 'project-group';
  displayName: string;
  hasPhoto?: boolean;
}

export interface SeededKudosOverlays {
  flaggedForAdminReview?: boolean;
  claimOwnerId?: string | null;
  assignedOwnerId?: string | null;
  reviewedByCurrentUser?: boolean;
  prominence?: 'standard' | 'pinned' | 'featured';
  celebrateCount?: number;
  publishAtIso?: string | null;
}

export interface SeededKudosItem {
  id: string;
  listItemId: number;
  etag: string;
  submitterId: string;
  recipients: SeededKudosRecipient[];
  state: KudosWorkflowState;
  createdIso: string;
  updatedIso: string;
  title: string;
  body: string;
  overlays: SeededKudosOverlays;
}

export interface SeededAuditEvent {
  id: string;
  kudosId: string;
  actorId: string;
  action: string;
  atIso: string;
  outcome: 'ok' | 'denied' | 'error';
  note?: string;
}

let seq = 0;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${String(seq).padStart(4, '0')}`;
}

/** Reset the monotonic id counter so each test run is deterministic. */
export function resetKudosSeedSequence(): void {
  seq = 0;
}

export function seedKudos(
  state: KudosWorkflowState,
  overrides: Partial<SeededKudosItem> = {},
): SeededKudosItem {
  const id = overrides.id ?? nextId('k');
  const createdIso = overrides.createdIso ?? at(-60);
  return {
    id,
    listItemId: Number.parseInt(id.replace(/\D/g, ''), 10) || 1,
    etag: `"1"`,
    submitterId: overrides.submitterId ?? 'user-submitter',
    recipients: overrides.recipients ?? [
      { id: 'user-recipient', kind: 'individual', displayName: 'Recipient One', hasPhoto: true },
    ],
    state,
    createdIso,
    updatedIso: overrides.updatedIso ?? createdIso,
    title: overrides.title ?? `Kudos ${id}`,
    body: overrides.body ?? 'Seeded body.',
    overlays: {
      flaggedForAdminReview: false,
      claimOwnerId: null,
      assignedOwnerId: null,
      reviewedByCurrentUser: false,
      prominence: 'standard',
      celebrateCount: 0,
      publishAtIso: state === 'approvedScheduled' ? KUDOS_SCHEDULED_FUTURE_ISO : null,
      ...overrides.overlays,
    },
  };
}

export function seedAudit(
  kudosId: string,
  action: string,
  overrides: Partial<SeededAuditEvent> = {},
): SeededAuditEvent {
  return {
    id: nextId('a'),
    kudosId,
    actorId: overrides.actorId ?? 'user-admin',
    action,
    atIso: overrides.atIso ?? at(0),
    outcome: overrides.outcome ?? 'ok',
    note: overrides.note,
  };
}

/** Canonical 7-state baseline — one item per workflow state. */
export function seedWorkflowBaseline(): SeededKudosItem[] {
  return (
    [
      'pending',
      'revisionRequested',
      'approved',
      'approvedScheduled',
      'rejected',
      'withdrawn',
      'removedUnpublished',
    ] as KudosWorkflowState[]
  ).map((s) => seedKudos(s));
}
