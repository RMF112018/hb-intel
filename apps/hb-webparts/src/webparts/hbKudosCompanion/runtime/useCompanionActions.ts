/**
 * useCompanionActions — governance action planner, dispatcher, and
 * dialog state machine for the HB Kudos Approval Companion.
 *
 * Owns:
 *   - the three dialog state slots (input / datetime / assignment),
 *   - two-phase `updateContent` (headline → excerpt),
 *   - `dispatchGovernancePatch` (typed `KudosPatch` dispatch + audit),
 *   - action routing from a `DetailActionKind`,
 *   - bulk approve,
 *   - selection state + toggleSelect / clearSelection.
 *
 * The orchestration host passes this hook's result straight into the
 * detail panel, dialog primitives, and bulk-action bar without
 * duplicating dispatch code.
 */
import * as React from 'react';
import { submitKudosGovernanceAction } from '../../../homepage/data/kudosGovernanceWriter.js';
import { getKudosListHostUrl } from '../../../homepage/data/spContext.js';
import type { KudosCapabilities, KudosRole } from '../../../homepage/helpers/kudosCapabilities.js';
import type { KudosEntry, KudosPatch } from '../../../homepage/webparts/kudosContracts.js';

export type DetailActionKind =
  | 'approve'
  | 'reject'
  | 'requestRevision'
  | 'reopen'
  | 'flagAdminReview'
  | 'clearAdminReview'
  | 'schedule'
  | 'unschedule'
  | 'pin'
  | 'unpin'
  | 'feature'
  | 'unfeature'
  | 'remove'
  | 'restore'
  | 'claim'
  | 'reassign'
  | 'celebrate'
  | 'updateContent';

type DateTimeDialogKind = 'schedule' | 'feature';

export interface InputDialogState {
  kind: DetailActionKind;
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  choices?: readonly { value: string; label: string }[];
  allowEmpty?: boolean;
}

export interface DateTimeDialogState {
  kind: DateTimeDialogKind;
  title: string;
  description?: string;
  fieldLabel?: string;
  hint?: string;
  defaultIso?: string;
  confirmLabel?: string;
  allowEmpty?: boolean;
}

export interface UseCompanionActionsInput {
  detailEntry: KudosEntry | undefined;
  setDetailEntry: (entry: KudosEntry | undefined) => void;
  identityEmail: string | undefined;
  role: KudosRole;
  capabilities: KudosCapabilities;
  queue: KudosEntry[];
  refreshData: () => void;
}

export interface UseCompanionActionsResult {
  // Selection
  selectedIds: ReadonlySet<string>;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;

  // Dispatch state
  dispatching: boolean;
  actionError: string | undefined;
  setActionError: React.Dispatch<React.SetStateAction<string | undefined>>;

  // Action routing
  handleDetailAction: (kind: DetailActionKind) => void;
  handleBulkApprove: () => Promise<void>;

  // Dialog slots
  inputDialog: InputDialogState | null;
  closeInputDialog: () => void;
  handleInputDialogConfirm: (value: string) => void;

  dateTimeDialog: DateTimeDialogState | null;
  closeDateTimeDialog: () => void;
  handleDateTimeDialogConfirm: (isoUtc: string) => void;

  assignmentDialogOpen: boolean;
  closeAssignmentDialog: () => void;
  handleAssignmentDialogConfirm: (resolved: { userId: number }) => void;
}

export function useCompanionActions({
  detailEntry,
  setDetailEntry,
  identityEmail,
  role,
  capabilities,
  queue,
  refreshData,
}: UseCompanionActionsInput): UseCompanionActionsResult {
  const [selectedIds, setSelectedIds] = React.useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [dispatching, setDispatching] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | undefined>();
  const [inputDialog, setInputDialog] = React.useState<InputDialogState | null>(
    null,
  );
  const [pendingUpdateHeadline, setPendingUpdateHeadline] = React.useState<
    string | undefined
  >();
  const [dateTimeDialog, setDateTimeDialog] =
    React.useState<DateTimeDialogState | null>(null);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = React.useState(false);

  const toggleSelect = React.useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = React.useCallback(
    () => setSelectedIds(new Set()),
    [],
  );

  const dispatchGovernancePatch = React.useCallback(
    async (patch: KudosPatch) => {
      if (!detailEntry) return;
      const listHostUrl = getKudosListHostUrl();
      if (!listHostUrl) {
        setActionError('SharePoint site context is not available.');
        return;
      }
      setDispatching(true);
      try {
        const result = await submitKudosGovernanceAction(listHostUrl, patch, {
          actorEmail: identityEmail,
          callerRole: role,
          headline: detailEntry.headline,
          isFirstPublish:
            patch.kind === 'approve' && detailEntry.wasEverPublished !== true,
          itemIsFlaggedForAdminReview:
            detailEntry.isFlaggedForAdminReview === true,
        });
        if (!result.ok) {
          setActionError(result.error);
          return;
        }
        setActionError(undefined);
        setDetailEntry(undefined);
        refreshData();
      } finally {
        setDispatching(false);
      }
    },
    [detailEntry, identityEmail, role, refreshData, setDetailEntry],
  );

  const handleDetailAction = React.useCallback(
    (kind: DetailActionKind) => {
      if (!detailEntry) return;
      setActionError(undefined);

      // No-input governance patches — dispatch immediately.
      switch (kind) {
        case 'approve':
          void dispatchGovernancePatch({ kind: 'approve', kudosId: detailEntry.id });
          return;
        case 'clearAdminReview':
          void dispatchGovernancePatch({ kind: 'clearAdminReview', kudosId: detailEntry.id });
          return;
        case 'unschedule':
          void dispatchGovernancePatch({ kind: 'unschedule', kudosId: detailEntry.id });
          return;
        case 'unpin':
          void dispatchGovernancePatch({ kind: 'unpin', kudosId: detailEntry.id });
          return;
        case 'unfeature':
          void dispatchGovernancePatch({ kind: 'unfeature', kudosId: detailEntry.id });
          return;
        case 'restore':
          void dispatchGovernancePatch({ kind: 'restore', kudosId: detailEntry.id });
          return;
        case 'claim':
          void dispatchGovernancePatch({ kind: 'claim', kudosId: detailEntry.id });
          return;
        case 'celebrate': {
          const currentCount = detailEntry.celebrateCount ?? 0;
          void dispatchGovernancePatch({
            kind: 'celebrate',
            kudosId: detailEntry.id,
            nextCount: currentCount + 1,
          });
          return;
        }
        default:
          break;
      }

      // Task-specific dialogs — structured controls for scheduling
      // and reassignment.
      if (kind === 'schedule') {
        setDateTimeDialog({
          kind: 'schedule',
          title: 'Scheduled publish',
          description:
            'Pick the date and time when this item should go live. The picker uses your local timezone; the value is stored in UTC.',
          fieldLabel: 'Publish at',
          hint: 'Minute precision is enough — the queue reveals items once this moment passes.',
          confirmLabel: 'Schedule',
        });
        return;
      }
      if (kind === 'feature') {
        setDateTimeDialog({
          kind: 'feature',
          title: 'Featured expiry',
          description:
            'Choose when featured status should expire. Leave empty to keep the default expiry window.',
          fieldLabel: 'Expires at',
          confirmLabel: 'Feature',
          allowEmpty: true,
        });
        return;
      }
      if (kind === 'reassign') {
        setAssignmentDialogOpen(true);
        return;
      }

      // Generic text/select dialog routing for the remaining actions.
      const dialogMap: Record<string, Omit<InputDialogState, 'kind'>> = {
        reject: {
          title: 'Rejection reason',
          description: 'Provide a submitter-facing reason for the rejection.',
          placeholder: 'Enter rejection reason…',
        },
        requestRevision: {
          title: 'Revision guidance',
          description: 'Provide guidance so the submitter knows what to change.',
          placeholder: 'Enter revision guidance…',
        },
        flagAdminReview: {
          title: 'Admin review reason',
          description: 'Why does this item need admin review?',
          placeholder: 'Enter reason…',
        },
        pin: {
          title: 'Pin order',
          description: 'Select the pin slot (1 is highest).',
          choices: [
            { value: '1', label: '1 — Top' },
            { value: '2', label: '2 — Middle' },
            { value: '3', label: '3 — Bottom' },
          ],
        },
        remove: {
          title: 'Removal reason',
          description: 'Provide a reason for removing this item from public view.',
          placeholder: 'Enter removal reason…',
        },
        reopen: {
          title: 'Reopen to status',
          description: 'Choose which status the item should return to.',
          choices: [
            { value: 'pending', label: 'Pending review' },
            { value: 'revisionRequested', label: 'Revision requested' },
          ],
        },
        updateContent: {
          title: 'Edit headline',
          description: 'Update the recognition headline.',
          placeholder: 'Enter updated headline…',
          defaultValue: detailEntry.headline ?? '',
          confirmLabel: 'Next: excerpt',
        },
      };

      const cfg = dialogMap[kind];
      if (cfg) setInputDialog({ kind, ...cfg });
    },
    [detailEntry, dispatchGovernancePatch],
  );

  const handleDateTimeDialogConfirm = React.useCallback(
    (isoUtc: string) => {
      if (!detailEntry || !dateTimeDialog) return;
      const kind = dateTimeDialog.kind;
      setDateTimeDialog(null);
      if (kind === 'schedule') {
        void dispatchGovernancePatch({
          kind: 'schedule',
          kudosId: detailEntry.id,
          scheduledPublishAtIso: isoUtc,
        });
      } else if (kind === 'feature') {
        void dispatchGovernancePatch({
          kind: 'feature',
          kudosId: detailEntry.id,
          featuredExpiresAtIso: isoUtc || undefined,
        });
      }
    },
    [detailEntry, dateTimeDialog, dispatchGovernancePatch],
  );

  const handleAssignmentDialogConfirm = React.useCallback(
    (resolved: { userId: number }) => {
      if (!detailEntry) return;
      setAssignmentDialogOpen(false);
      void dispatchGovernancePatch({
        kind: 'reassign',
        kudosId: detailEntry.id,
        assignedUserId: resolved.userId,
      });
    },
    [detailEntry, dispatchGovernancePatch],
  );

  const handleInputDialogConfirm = React.useCallback(
    (value: string) => {
      if (!detailEntry || !inputDialog) return;
      const kind = inputDialog.kind;

      // Two-phase updateContent: headline → excerpt.
      if (kind === 'updateContent' && pendingUpdateHeadline === undefined) {
        setPendingUpdateHeadline(value);
        setInputDialog({
          kind: 'updateContent',
          title: 'Edit excerpt',
          description: 'Update the recognition excerpt.',
          placeholder: 'Enter updated excerpt…',
          defaultValue: detailEntry.excerpt ?? '',
          confirmLabel: 'Save changes',
        });
        return;
      }

      setInputDialog(null);

      let patch: KudosPatch;
      switch (kind) {
        case 'reject':
          patch = { kind: 'reject', kudosId: detailEntry.id, rejectionReason: value.trim() };
          break;
        case 'requestRevision':
          patch = { kind: 'requestRevision', kudosId: detailEntry.id, revisionGuidance: value.trim() };
          break;
        case 'flagAdminReview':
          patch = { kind: 'flagAdminReview', kudosId: detailEntry.id, adminReviewReason: value.trim() };
          break;
        case 'pin': {
          const pinOrder = Number(value);
          patch = {
            kind: 'pin',
            kudosId: detailEntry.id,
            pinOrder: Number.isFinite(pinOrder) ? pinOrder : undefined,
          };
          break;
        }
        case 'remove':
          patch = { kind: 'remove', kudosId: detailEntry.id, removedReason: value.trim() };
          break;
        case 'reopen': {
          const targetStatus = value.startsWith('revision')
            ? ('revisionRequested' as const)
            : ('pending' as const);
          patch = { kind: 'reopen', kudosId: detailEntry.id, targetStatus };
          break;
        }
        case 'updateContent': {
          const patchFields: { headline?: string; excerpt?: string } = {};
          const hl = (pendingUpdateHeadline ?? '').trim();
          if (hl && hl !== (detailEntry.headline ?? '')) patchFields.headline = hl;
          const ex = value.trim();
          if (ex && ex !== (detailEntry.excerpt ?? '')) patchFields.excerpt = ex;
          setPendingUpdateHeadline(undefined);
          if (Object.keys(patchFields).length === 0) return;
          patch = { kind: 'updateContent', kudosId: detailEntry.id, ...patchFields };
          break;
        }
        default:
          return;
      }
      void dispatchGovernancePatch(patch);
    },
    [detailEntry, inputDialog, pendingUpdateHeadline, dispatchGovernancePatch],
  );

  const handleBulkApprove = React.useCallback(async () => {
    if (!capabilities.canBulkApprove) return;
    if (selectedIds.size === 0) return;
    const listHostUrl = getKudosListHostUrl();
    if (!listHostUrl) {
      setActionError('SharePoint site context is not available.');
      return;
    }
    setActionError(undefined);
    setDispatching(true);
    let failures = 0;
    try {
      for (const id of selectedIds) {
        const entry = queue.find((e) => e.id === id);
        if (!entry) continue;
        if (
          entry.workflowStatus &&
          entry.workflowStatus !== 'pending' &&
          entry.workflowStatus !== 'revisionRequested'
        ) {
          continue;
        }
        const result = await submitKudosGovernanceAction(
          listHostUrl,
          { kind: 'approve', kudosId: entry.id },
          {
            actorEmail: identityEmail,
            callerRole: role,
            headline: entry.headline,
            isFirstPublish: entry.wasEverPublished !== true,
          },
        );
        if (!result.ok) failures += 1;
      }
      if (failures > 0) {
        setActionError(`${failures} of ${selectedIds.size} bulk approvals failed.`);
      }
      clearSelection();
    } finally {
      setDispatching(false);
    }
  }, [capabilities.canBulkApprove, clearSelection, identityEmail, queue, role, selectedIds]);

  const closeInputDialog = React.useCallback(() => {
    setInputDialog(null);
    setPendingUpdateHeadline(undefined);
  }, []);

  const closeDateTimeDialog = React.useCallback(() => {
    setDateTimeDialog(null);
  }, []);

  const closeAssignmentDialog = React.useCallback(() => {
    setAssignmentDialogOpen(false);
  }, []);

  return {
    selectedIds,
    toggleSelect,
    clearSelection,
    dispatching,
    actionError,
    setActionError,
    handleDetailAction,
    handleBulkApprove,
    inputDialog,
    closeInputDialog,
    handleInputDialogConfirm,
    dateTimeDialog,
    closeDateTimeDialog,
    handleDateTimeDialogConfirm,
    assignmentDialogOpen,
    closeAssignmentDialog,
    handleAssignmentDialogConfirm,
  };
}
