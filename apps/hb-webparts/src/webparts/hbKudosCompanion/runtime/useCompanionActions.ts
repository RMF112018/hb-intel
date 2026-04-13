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
import { submitKudosGovernanceAction } from '../../../homepage/data/kudosAdapter/index.js';
import { getKudosListHostUrl } from '../../../homepage/data/spContext.js';
import type { KudosRole } from '../../../homepage/helpers/kudosCapabilities.js';
import type { KudosEntry, KudosPatch } from '../../../homepage/webparts/kudosContracts.js';

/**
 * Row-level quick-triage action set — a strict subset of
 * `DetailActionKind` that is safe to fire directly from a queue row
 * without an extra confirmation / reason dialog.
 */
export type QuickActionKind = 'approve' | 'clearAdminReview' | 'claim';

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
  refreshData: () => void;
}

export interface UseCompanionActionsResult {
  // Selection
  selectedIds: ReadonlySet<string>;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  setSelectedIds: React.Dispatch<React.SetStateAction<ReadonlySet<string>>>;

  // Dispatch state
  dispatching: boolean;
  actionError: string | undefined;
  setActionError: React.Dispatch<React.SetStateAction<string | undefined>>;

  // Action routing
  handleDetailAction: (kind: DetailActionKind) => void;
  handleQuickAction: (kind: QuickActionKind, entry: KudosEntry) => void;

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
    async (patch: KudosPatch, entryOverride?: KudosEntry) => {
      // Phase-28 Prompt-03 quick-triage extension: row-level callers
      // pass the entry explicitly so the patch can dispatch without
      // the detail panel being open. Detail-panel callers keep using
      // `detailEntry` implicitly.
      const target = entryOverride ?? detailEntry;
      if (!target) return;
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
          headline: target.headline,
          isFirstPublish:
            patch.kind === 'approve' && target.wasEverPublished !== true,
          itemIsFlaggedForAdminReview:
            target.isFlaggedForAdminReview === true,
        });
        if (!result.ok) {
          setActionError(result.error);
          return;
        }
        setActionError(undefined);
        // Only close the detail panel when the dispatch originated
        // from it (no explicit entry override). Row-level quick
        // actions must not close a panel the operator never opened.
        if (!entryOverride) setDetailEntry(undefined);
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

  // ── Phase-28 Prompt-03 — row-level quick triage ────────────────
  // Safe, no-input governance patches that can fire directly from a
  // queue row without forcing the operator to open the detail panel.
  // Reason-carrying and structurally riskier actions (reject,
  // requestRevision, flagAdminReview, remove, schedule, feature,
  // pin, reassign) intentionally stay detail-panel-only.
  const handleQuickAction = React.useCallback(
    (kind: QuickActionKind, entry: KudosEntry) => {
      setActionError(undefined);
      switch (kind) {
        case 'approve':
          void dispatchGovernancePatch({ kind: 'approve', kudosId: entry.id }, entry);
          return;
        case 'clearAdminReview':
          void dispatchGovernancePatch(
            { kind: 'clearAdminReview', kudosId: entry.id },
            entry,
          );
          return;
        case 'claim':
          void dispatchGovernancePatch({ kind: 'claim', kudosId: entry.id }, entry);
          return;
      }
    },
    [dispatchGovernancePatch],
  );

  return {
    selectedIds,
    toggleSelect,
    clearSelection,
    setSelectedIds,
    dispatching,
    actionError,
    setActionError,
    handleDetailAction,
    handleQuickAction,
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
