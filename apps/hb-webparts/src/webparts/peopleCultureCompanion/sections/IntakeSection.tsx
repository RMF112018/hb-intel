/**
 * Limited non-HR intake triage section for the People & Culture HR
 * operating companion. Phase-14 pc/ Prompt-05.
 *
 * Dedicated tab that lists every intake submission (any review state)
 * and exposes the full triage flow: accept-into-draft, return for
 * changes (with notes), and decline. Shows a prominent reminder that
 * submitters never publish directly — HR is always the gate, matching
 * the Decision-Lock Appendix hybrid-intake rule.
 *
 * Actions are gated via `hasPeopleCultureCapability`. Editors see the
 * queue read-only.
 */

import * as React from 'react';
import type {
  PeopleCultureIntakeReviewState,
  PeopleCultureIntakeSubmission,
  PeopleCultureRole,
} from '../../../homepage/webparts/peopleCultureSplitContracts.js';
import { hasPeopleCultureCapability } from '../../../homepage/helpers/peopleCultureSplitModel.js';
import {
  BADGE_STYLE,
  DANGER_BUTTON_STYLE,
  EMPTY_STATE_STYLE,
  INPUT_STYLE,
  LIST_BODY_STYLE,
  LIST_META_ROW_STYLE,
  LIST_ROW_STYLE,
  LIST_ROW_TEXT_STYLE,
  LIST_STYLE,
  LIST_TITLE_STYLE,
  PANEL_STYLE,
  PRIMARY_BUTTON_STYLE,
  SECONDARY_BUTTON_STYLE,
  SECTION_HINT_STYLE,
  SECTION_TITLE_STYLE,
  TOOLBAR_STYLE,
  WARNING_BADGE_STYLE,
} from '../companionStyles.js';

export interface IntakeSectionProps {
  submissions: ReadonlyArray<PeopleCultureIntakeSubmission>;
  currentUserRole: PeopleCultureRole;
  onPromote: (id: string, notes?: string) => void;
  onDecline: (id: string, notes?: string) => void;
  onReturnForChanges: (id: string, notes: string) => void;
}

const REVIEW_STATE_LABEL: Record<PeopleCultureIntakeReviewState, string> = {
  awaitingHrReview: 'Awaiting HR review',
  acceptedIntoDraft: 'Accepted into draft',
  returnedForChanges: 'Returned for changes',
  declined: 'Declined',
};

const REVIEW_STATE_ORDER: readonly PeopleCultureIntakeReviewState[] = [
  'awaitingHrReview',
  'returnedForChanges',
  'acceptedIntoDraft',
  'declined',
];

const HR_GATE_BANNER_STYLE: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: 10,
  background: 'rgba(226, 113, 37, 0.08)',
  border: '1px solid rgba(226, 113, 37, 0.25)',
  color: '#b45309',
  fontSize: '0.8125rem',
  lineHeight: 1.5,
  fontWeight: 600,
};

export function IntakeSection({
  submissions,
  currentUserRole,
  onPromote,
  onDecline,
  onReturnForChanges,
}: IntakeSectionProps): React.JSX.Element {
  const canTriage = hasPeopleCultureCapability(currentUserRole, 'canResolveApprovals');

  const [notesByItem, setNotesByItem] = React.useState<Record<string, string>>({});

  const grouped = React.useMemo(() => {
    const buckets: Record<PeopleCultureIntakeReviewState, PeopleCultureIntakeSubmission[]> = {
      awaitingHrReview: [],
      returnedForChanges: [],
      acceptedIntoDraft: [],
      declined: [],
    };
    for (const submission of submissions) {
      buckets[submission.reviewState].push(submission);
    }
    return buckets;
  }, [submissions]);

  const renderRow = (submission: PeopleCultureIntakeSubmission): React.JSX.Element => {
    const isPending = submission.reviewState === 'awaitingHrReview';
    const notes = notesByItem[submission.id] ?? '';
    return (
      <li
        key={submission.id}
        style={LIST_ROW_STYLE}
        data-hbc-companion-intake-id={submission.id}
        data-hbc-companion-intake-state={submission.reviewState}
        data-hbc-companion-intake-submitter-role={submission.submitterRole}
      >
        <div style={LIST_ROW_TEXT_STYLE}>
          <p style={LIST_TITLE_STYLE}>{submission.title}</p>
          <p style={LIST_BODY_STYLE}>{submission.body}</p>
          <div style={LIST_META_ROW_STYLE}>
            <span style={BADGE_STYLE}>{submission.submitterRole}</span>
            <span style={BADGE_STYLE}>{submission.suggestedFamily}</span>
            <span style={BADGE_STYLE}>{REVIEW_STATE_LABEL[submission.reviewState]}</span>
            <span style={BADGE_STYLE}>
              {submission.submittedBy.displayName}
            </span>
            {submission.reviewNotes ? (
              <span style={WARNING_BADGE_STYLE}>Notes: {submission.reviewNotes}</span>
            ) : null}
          </div>
        </div>
        {isPending && canTriage ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 260 }}>
            <input
              type="text"
              placeholder="Review notes (optional)"
              value={notes}
              onChange={(event) =>
                setNotesByItem((prev) => ({ ...prev, [submission.id]: event.target.value }))
              }
              style={INPUT_STYLE}
              data-hbc-companion-intake-notes-input={submission.id}
            />
            <div style={TOOLBAR_STYLE}>
              <button
                type="button"
                style={PRIMARY_BUTTON_STYLE}
                onClick={() => {
                  onPromote(submission.id, notes.trim() || undefined);
                  setNotesByItem((prev) => ({ ...prev, [submission.id]: '' }));
                }}
                data-hbc-companion-action="intake-promote"
                data-hbc-companion-action-target={submission.id}
              >
                Accept into draft
              </button>
              <button
                type="button"
                style={SECONDARY_BUTTON_STYLE}
                disabled={!notes.trim()}
                onClick={() => {
                  onReturnForChanges(submission.id, notes.trim());
                  setNotesByItem((prev) => ({ ...prev, [submission.id]: '' }));
                }}
                data-hbc-companion-action="intake-return"
                data-hbc-companion-action-target={submission.id}
              >
                Return for changes
              </button>
              <button
                type="button"
                style={DANGER_BUTTON_STYLE}
                onClick={() => {
                  onDecline(submission.id, notes.trim() || undefined);
                  setNotesByItem((prev) => ({ ...prev, [submission.id]: '' }));
                }}
                data-hbc-companion-action="intake-decline"
                data-hbc-companion-action-target={submission.id}
              >
                Decline
              </button>
            </div>
          </div>
        ) : null}
      </li>
    );
  };

  return (
    <div
      role="tabpanel"
      aria-label="Limited intake triage"
      data-hbc-companion-section="intake"
      style={PANEL_STYLE}
    >
      <div>
        <h3 style={SECTION_TITLE_STYLE}>Limited non-HR intake</h3>
        <p style={SECTION_HINT_STYLE}>
          Designated managers, leaders, and business partners can submit
          People & Culture request items. HR reviews, edits, and decides
          whether to publish.
        </p>
      </div>

      <div
        style={HR_GATE_BANNER_STYLE}
        role="note"
        data-hbc-companion-intake-banner="hr-gate"
      >
        Submitters never publish directly. HR is always the gate.
      </div>

      {REVIEW_STATE_ORDER.map((state) => {
        const bucket = grouped[state];
        if (bucket.length === 0) return null;
        return (
          <div
            key={state}
            data-hbc-companion-intake-bucket={state}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <h4
              style={{
                ...SECTION_TITLE_STYLE,
                fontSize: '0.9375rem',
                marginTop: 4,
              }}
            >
              {REVIEW_STATE_LABEL[state]} ({bucket.length})
            </h4>
            <ul style={LIST_STYLE}>{bucket.map(renderRow)}</ul>
          </div>
        );
      })}

      {submissions.length === 0 ? (
        <div style={EMPTY_STATE_STYLE} role="status">
          No intake submissions yet.
        </div>
      ) : null}
    </div>
  );
}
