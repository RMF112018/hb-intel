/**
 * Global cross-family approvals inbox. Phase-14 pc/ Prompt-03.
 *
 * Shows every item currently in the `needsApproval` lifecycle state,
 * regardless of content family. Supports approve / reject, plus the
 * claim / reassignment behavior required by the Decision-Lock
 * Appendix — claim/reassignment applies to **approval work only**
 * and never spreads to live or scheduled items at large.
 *
 * Capability gates use `hasPeopleCultureCapability` from the split
 * model so an editor role sees the queue read-only but cannot
 * approve, reject, claim, or reassign.
 */

import * as React from 'react';
import type {
  PeopleCultureItem,
  PeopleCultureRole,
} from '../../../homepage/webparts/peopleCultureSplitContracts.js';
import { hasPeopleCultureCapability } from '../../../homepage/helpers/peopleCultureSplitModel.js';
import {
  BADGE_STYLE,
  DANGER_BUTTON_STYLE,
  EMPTY_STATE_STYLE,
  FIELD_LABEL_STYLE,
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
  SUCCESS_BADGE_STYLE,
  TOOLBAR_STYLE,
  WARNING_BADGE_STYLE,
} from '../companionStyles.js';

export interface ApprovalsSectionProps {
  items: PeopleCultureItem[];
  currentUserRole: PeopleCultureRole;
  currentUser: { id: string; displayName: string };
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onClaim: (id: string) => void;
  onReassign: (id: string, newOwnerName: string) => void;
}

function claimOwnerFromTags(tags: string[] | undefined): string | undefined {
  const tag = tags?.find((t) => t.startsWith('approval-owner:'));
  return tag?.replace(/^approval-owner:/, '');
}

export function ApprovalsSection({
  items,
  currentUserRole,
  currentUser,
  onApprove,
  onReject,
  onClaim,
  onReassign,
}: ApprovalsSectionProps): React.JSX.Element {
  const canApprove = hasPeopleCultureCapability(currentUserRole, 'canApprove');
  const canResolve = hasPeopleCultureCapability(currentUserRole, 'canResolveApprovals');
  const canClaim = hasPeopleCultureCapability(currentUserRole, 'canClaimApproval');
  const canReassign = hasPeopleCultureCapability(currentUserRole, 'canReassignApproval');

  const [reassignTarget, setReassignTarget] = React.useState<
    Record<string, string>
  >({});

  return (
    <div
      role="tabpanel"
      aria-label="Approvals inbox"
      data-hbc-companion-section="approvals"
      data-hbc-companion-role={currentUserRole}
      style={PANEL_STYLE}
    >
      <div>
        <h3 style={SECTION_TITLE_STYLE}>Approvals inbox</h3>
        <p style={SECTION_HINT_STYLE}>
          Cross-family queue of items awaiting approval. Claim assigns
          the work to you; reassign hands it off. Claim/reassignment
          only applies to approval work — live and scheduled items stay
          unassigned.
        </p>
      </div>

      {items.length === 0 ? (
        <div style={EMPTY_STATE_STYLE} role="status">
          No items are currently awaiting approval.
        </div>
      ) : (
        <ul style={LIST_STYLE} data-hbc-companion-approvals-list>
          {items.map((item) => {
            const owner = claimOwnerFromTags(item.tags);
            const isHybrid = item.approvalTrigger !== 'standard';
            const reassignValue = reassignTarget[item.id] ?? '';
            return (
              <li
                key={item.id}
                style={LIST_ROW_STYLE}
                data-hbc-companion-approval-item={item.id}
                data-hbc-companion-approval-trigger={item.approvalTrigger}
                data-hbc-companion-approval-owner={owner ?? ''}
              >
                <div style={LIST_ROW_TEXT_STYLE}>
                  <p style={LIST_TITLE_STYLE}>{item.title}</p>
                  <p style={LIST_BODY_STYLE}>{item.body}</p>
                  <div style={LIST_META_ROW_STYLE}>
                    <span style={BADGE_STYLE}>{item.family}</span>
                    {isHybrid ? (
                      <span style={WARNING_BADGE_STYLE}>
                        {item.approvalTrigger === 'homepagePinned'
                          ? 'Pinned (hybrid)'
                          : 'Enterprise-wide'}
                      </span>
                    ) : null}
                    {owner ? <span style={SUCCESS_BADGE_STYLE}>Owner: {owner}</span> : null}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    minWidth: 220,
                  }}
                >
                  <div style={TOOLBAR_STYLE}>
                    <button
                      type="button"
                      style={PRIMARY_BUTTON_STYLE}
                      onClick={() => onApprove(item.id)}
                      disabled={!canApprove}
                      data-hbc-companion-action="approve"
                      data-hbc-companion-action-target={item.id}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      style={DANGER_BUTTON_STYLE}
                      onClick={() => onReject(item.id)}
                      disabled={!canResolve}
                      data-hbc-companion-action="reject"
                      data-hbc-companion-action-target={item.id}
                    >
                      Reject
                    </button>
                  </div>
                  <div style={TOOLBAR_STYLE}>
                    <button
                      type="button"
                      style={SECONDARY_BUTTON_STYLE}
                      onClick={() => onClaim(item.id)}
                      disabled={!canClaim || owner === currentUser.displayName}
                      data-hbc-companion-action="claim"
                      data-hbc-companion-action-target={item.id}
                    >
                      {owner === currentUser.displayName ? 'Claimed' : 'Claim'}
                    </button>
                  </div>
                  {canReassign ? (
                    <div style={TOOLBAR_STYLE}>
                      <label
                        style={{ ...FIELD_LABEL_STYLE, alignSelf: 'center' }}
                        htmlFor={`reassign-${item.id}`}
                      >
                        Reassign to
                      </label>
                      <input
                        id={`reassign-${item.id}`}
                        type="text"
                        placeholder="HR owner name"
                        value={reassignValue}
                        onChange={(event) =>
                          setReassignTarget((prev) => ({
                            ...prev,
                            [item.id]: event.target.value,
                          }))
                        }
                        style={{ ...INPUT_STYLE, maxWidth: 140 }}
                        data-hbc-companion-reassign-input={item.id}
                      />
                      <button
                        type="button"
                        style={SECONDARY_BUTTON_STYLE}
                        disabled={!reassignValue.trim()}
                        onClick={() => {
                          onReassign(item.id, reassignValue.trim());
                          setReassignTarget((prev) => ({ ...prev, [item.id]: '' }));
                        }}
                        data-hbc-companion-action="reassign"
                        data-hbc-companion-action-target={item.id}
                      >
                        Reassign
                      </button>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
