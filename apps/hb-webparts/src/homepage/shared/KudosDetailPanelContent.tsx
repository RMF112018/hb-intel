/**
 * KudosDetailPanelContent — shared role-aware detail panel content.
 *
 * Renders recognition + governance sections for both the employee-facing
 * HbKudos webpart and the HR approval companion. The consumer supplies
 * the flyout shell; this component only renders the body content.
 *
 * Role safety (Decision Lock §99-107):
 *   - `role='viewer'` → recognition content, recipient detail, high-level
 *     status only. No audit timeline, no governance metadata, no
 *     prominence/scheduling internals.
 *   - `role='reviewer'|'admin'` → full governance sections + audit timeline
 *     + internal notes.
 *
 * Phase-21 Wave 4 model-grade closure: inline style objects retired in
 * favor of classes in `governance.module.css`. Token values flow
 * through the `--hbk-gov-*` custom properties that the consuming
 * primitives already seed, so the detail panel inherits the same
 * governance chrome grammar as the companion + public surface.
 */
import * as React from 'react';
import {
  HbcAvatarStack,
  HbcStatusBadge,
} from '@hbc/ui-kit/homepage';
import {
  buildKudosRecipientSummary,
  buildWorkflowChipDescriptor,
  mapAuditEventTypeLabel,
  mapAuditEventTypeChipTone,
  type KudosEntry,
} from '../webparts/kudosContracts.js';
import type { KudosAuditTimelineEntry } from '../data/kudosGovernanceWriter.js';
import type { KudosRole } from '../helpers/kudosCapabilities.js';
import {
  KUDOS_GOV_TOKENS,
  KudosSectionHeading,
  KudosInfoRow,
  KudosAuditTimelineBlock,
} from './KudosGovernancePrimitives.js';
import governanceStyles from './governance.module.css';

export interface KudosDetailPanelContentProps {
  entry: KudosEntry;
  role: KudosRole;
  timeline?: KudosAuditTimelineEntry[];
  timelineLoading?: boolean;
}

function chipVariant(tone: string): 'success' | 'warning' | 'critical' | 'info' {
  if (tone === 'success') return 'success';
  if (tone === 'warning') return 'warning';
  if (tone === 'danger') return 'critical';
  return 'info';
}

export function KudosDetailPanelContent({
  entry,
  role,
  timeline,
  timelineLoading,
}: KudosDetailPanelContentProps): React.JSX.Element {
  const summary = buildKudosRecipientSummary(entry.recipients);
  const chip = entry.workflowStatus ? buildWorkflowChipDescriptor(entry.workflowStatus) : undefined;
  const isGovernance = role === 'admin' || role === 'reviewer';
  const isPublic = entry.workflowStatus === 'approved' && entry.homepageEnabled === true;

  const timelineFallback = entry.approvedDate
    ? `${mapAuditEventTypeLabel('submit')} · ${new Date(entry.submittedDate).toLocaleString()}\n${mapAuditEventTypeLabel('approve')} · ${new Date(entry.approvedDate).toLocaleString()}`
    : `${mapAuditEventTypeLabel('submit')} · ${new Date(entry.submittedDate).toLocaleString()}`;

  // Seed governance custom-property vars so our module classes resolve
  // to the governed presentation-lane tokens inside the flyout shell.
  const detailVars = {
    '--hbk-gov-text-secondary': KUDOS_GOV_TOKENS.textSecondary,
    '--hbk-gov-blue-06': KUDOS_GOV_TOKENS.blueSubtle06,
    '--hbk-gov-blue-14': KUDOS_GOV_TOKENS.blueSubtle14,
    '--hbk-gov-blue-ink': KUDOS_GOV_TOKENS.blueText82,
    '--hbk-gov-danger-08': KUDOS_GOV_TOKENS.dangerSubtle08,
    '--hbk-gov-danger-22': KUDOS_GOV_TOKENS.dangerSubtle22,
    '--hbk-gov-danger': KUDOS_GOV_TOKENS.dangerRed,
  } as React.CSSProperties;

  return (
    <div className={governanceStyles.detailStack} style={detailVars}>
      {/* Status chip */}
      {chip ? (
        <div>
          <HbcStatusBadge variant={chipVariant(chip.tone)} size="small" label={chip.label} />
        </div>
      ) : null}

      {/* Recognition content */}
      <p className={governanceStyles.detailProse}>{entry.excerpt}</p>

      {entry.details && (isPublic || isGovernance) ? (
        <div>
          <KudosSectionHeading>Additional details</KudosSectionHeading>
          <p className={governanceStyles.detailSmallProse}>{entry.details}</p>
        </div>
      ) : null}

      {/* Recipients */}
      {summary.total > 0 ? (
        <div>
          <KudosSectionHeading>Recipients</KudosSectionHeading>
          <div className={governanceStyles.detailRow}>
            <HbcAvatarStack
              people={entry.recipients.slice(0, 6).map((r) => ({
                id: r.id,
                name: r.name,
                src: r.media?.src,
              }))}
              size="md"
              max={6}
            />
            <span className={governanceStyles.detailRowLabel}>{summary.label}</span>
          </div>
        </div>
      ) : null}

      {/* Prominence / scheduling — governance only */}
      {isGovernance && (entry.isScheduled || entry.isPinned || entry.isFeatured || entry.prominenceFailureAt) ? (
        <div>
          <KudosSectionHeading>Prominence &amp; scheduling</KudosSectionHeading>
          {entry.isScheduled && entry.scheduledPublishAt ? (
            <KudosInfoRow label="Scheduled for" value={new Date(entry.scheduledPublishAt).toLocaleString()} />
          ) : null}
          {entry.isPinned ? (
            <KudosInfoRow label="Pinned" value={`Order ${entry.pinOrder ?? '—'}`} />
          ) : null}
          {entry.isFeatured ? (
            <KudosInfoRow
              label="Featured"
              value={entry.featuredExpiresAt ? `Expires ${new Date(entry.featuredExpiresAt).toLocaleDateString()}` : 'Active'}
            />
          ) : null}
          {entry.prominenceFailureAt ? (
            <>
              <KudosInfoRow label="Prominence failure" value={new Date(entry.prominenceFailureAt).toLocaleString()} />
              <KudosInfoRow label="Failure reason" value={entry.prominenceFailureReason} />
            </>
          ) : null}
        </div>
      ) : null}

      {/* Governance-only sections */}
      {isGovernance ? (
        <>
          {entry.rejectionReason || entry.revisionGuidance || entry.moderatorNotes || entry.adminReviewReason || entry.removedReason ? (
            <div>
              <KudosSectionHeading>Governance metadata</KudosSectionHeading>
              <KudosInfoRow label="Rejection reason" value={entry.rejectionReason} />
              <KudosInfoRow label="Revision guidance" value={entry.revisionGuidance} />
              <KudosInfoRow label="Admin review reason" value={entry.adminReviewReason} />
              <KudosInfoRow label="Removal reason" value={entry.removedReason} />
              <KudosInfoRow label="Moderator notes" value={entry.moderatorNotes} />
            </div>
          ) : null}
        </>
      ) : null}

      {/* Associated-only reduced view — Decision Lock §103-107 */}
      {!isPublic && !isGovernance ? (
        <div className={governanceStyles.detailReducedView}>
          This recognition is no longer on the public homepage. You can see it here because you are associated with it.
        </div>
      ) : null}

      {/* Viewer-safe submission info — shown instead of the full audit
          timeline for non-governance roles. Shows only the submission date
          without exposing internal workflow progression. */}
      {!isGovernance ? (
        <div>
          <KudosSectionHeading>Submission</KudosSectionHeading>
          <KudosInfoRow label="Submitted" value={new Date(entry.submittedDate).toLocaleDateString()} />
          <KudosInfoRow label="Submitted by" value={entry.submittedBy.displayName} />
        </div>
      ) : null}

      {/* Audit timeline — governance roles only. Non-governance viewers
          must not see internal workflow history per Decision Lock §103-107. */}
      {isGovernance ? (
        <div data-hbc-testid="hb-kudos-audit-timeline">
          <KudosSectionHeading>Audit timeline</KudosSectionHeading>
          <KudosAuditTimelineBlock
            events={timeline ?? []}
            showInternalNotes={isGovernance}
            loading={timelineLoading}
            fallbackText={timelineFallback}
            mapLabel={(t) => mapAuditEventTypeLabel(t as Parameters<typeof mapAuditEventTypeLabel>[0])}
            mapTone={(t) => mapAuditEventTypeChipTone(t as Parameters<typeof mapAuditEventTypeChipTone>[0])}
          />
        </div>
      ) : null}
    </div>
  );
}
