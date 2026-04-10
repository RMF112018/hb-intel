/**
 * KudosDetailPanelContent — shared role-aware detail panel content.
 *
 * Renders recognition + governance sections for both the employee-facing
 * HbKudos webpart and the HR approval companion. The consumer supplies
 * the flyout shell; this component only renders the body content.
 *
 * Role safety:
 *   - `role='viewer'` → recognition-safe content only.
 *   - `role='reviewer'|'admin'` → full governance sections + audit timeline.
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
  KudosSectionHeading,
  KudosInfoRow,
  KudosAuditTimelineBlock,
} from './KudosGovernancePrimitives.js';

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Status chip */}
      {chip ? (
        <div>
          <HbcStatusBadge variant={chipVariant(chip.tone)} size="small" label={chip.label} />
        </div>
      ) : null}

      {/* Recognition content */}
      <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.6, color: 'rgba(26, 19, 16, 0.8)' }}>
        {entry.excerpt}
      </p>

      {entry.details && (isPublic || isGovernance) ? (
        <div>
          <KudosSectionHeading>Additional details</KudosSectionHeading>
          <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.6, color: 'rgba(26, 19, 16, 0.68)' }}>
            {entry.details}
          </p>
        </div>
      ) : null}

      {/* Recipients */}
      {summary.total > 0 ? (
        <div>
          <KudosSectionHeading>Recipients</KudosSectionHeading>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <HbcAvatarStack
              people={entry.recipients.slice(0, 6).map((r) => ({
                id: r.id,
                name: r.name,
                src: r.media?.src,
              }))}
              size="md"
              max={6}
            />
            <span style={{ fontSize: '0.8125rem', color: 'rgba(26, 19, 16, 0.68)', fontWeight: 600 }}>
              {summary.label}
            </span>
          </div>
        </div>
      ) : null}

      {/* Prominence / scheduling */}
      {(entry.isScheduled || entry.isPinned || entry.isFeatured || entry.prominenceFailureAt) ? (
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
          {isGovernance && entry.prominenceFailureAt ? (
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

      {/* Associated-only reduced view */}
      {!isPublic && !isGovernance ? (
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            background: 'rgba(34, 83, 145, 0.06)',
            border: '1px solid rgba(34, 83, 145, 0.14)',
            fontSize: '0.75rem',
            color: 'rgba(34, 83, 145, 0.82)',
            fontWeight: 600,
            lineHeight: 1.5,
          }}
        >
          This recognition is no longer on the public homepage. You can see it here because you are associated with it.
        </div>
      ) : null}

      {/* Audit timeline */}
      <div>
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
    </div>
  );
}
