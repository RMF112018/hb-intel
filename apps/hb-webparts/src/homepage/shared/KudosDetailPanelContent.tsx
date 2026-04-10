/**
 * KudosDetailPanelContent — shared role-aware detail panel content.
 *
 * Phase-14 kudos/ Prompt-04. Renders the recognition + governance
 * sections of the detail panel for both the employee-facing HbKudos
 * webpart and the HR approval companion. The consumer supplies the
 * flyout shell (typically `HbcKudosComposerFlyout`); this component
 * only renders the body content.
 *
 * Role safety:
 *   - `role='viewer'` renders recognition-safe content only.
 *   - `role='reviewer'|'admin'` additionally renders governance
 *     sections: rejection reason, revision guidance, admin-review
 *     metadata, moderator notes, prominence failure, removal reason,
 *     scheduling metadata, and the full audit timeline.
 *   - internalNote on audit events is suppressed for viewer.
 *
 * Visual grammar: composes existing shared primitives from
 * `@hbc/ui-kit/homepage`. No imports from `@hbc/ui-kit` bare,
 * `/primitives`, `/app-shell`, or `/fluent`.
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

function SectionHeading({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div
      style={{
        fontSize: '0.6875rem',
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'rgba(26, 19, 16, 0.55)',
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }): React.JSX.Element | null {
  if (!value?.trim()) return null;
  return (
    <div style={{ fontSize: '0.8125rem', lineHeight: 1.55, color: 'rgba(26, 19, 16, 0.72)', marginBottom: 6 }}>
      <span style={{ fontWeight: 700, color: 'rgba(26, 19, 16, 0.62)' }}>{label}:</span> {value}
    </div>
  );
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Status chip */}
      {chip ? (
        <div>
          <HbcStatusBadge
            variant={chipVariant(chip.tone)}
            size="small"
            label={chip.label}
          />
        </div>
      ) : null}

      {/* Recognition content */}
      <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.6, color: 'rgba(26, 19, 16, 0.8)' }}>
        {entry.excerpt}
      </p>

      {entry.details && (isPublic || isGovernance) ? (
        <div>
          <SectionHeading>Additional details</SectionHeading>
          <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.6, color: 'rgba(26, 19, 16, 0.68)' }}>
            {entry.details}
          </p>
        </div>
      ) : null}

      {/* Recipients */}
      {summary.total > 0 ? (
        <div>
          <SectionHeading>Recipients</SectionHeading>
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

      {/* Prominence / scheduling (governance + employee can see basic flags) */}
      {(entry.isScheduled || entry.isPinned || entry.isFeatured || entry.prominenceFailureAt) ? (
        <div>
          <SectionHeading>Prominence &amp; scheduling</SectionHeading>
          {entry.isScheduled && entry.scheduledPublishAt ? (
            <InfoRow
              label="Scheduled for"
              value={new Date(entry.scheduledPublishAt).toLocaleString()}
            />
          ) : null}
          {entry.isPinned ? (
            <InfoRow label="Pinned" value={`Order ${entry.pinOrder ?? '—'}`} />
          ) : null}
          {entry.isFeatured ? (
            <InfoRow
              label="Featured"
              value={entry.featuredExpiresAt
                ? `Expires ${new Date(entry.featuredExpiresAt).toLocaleDateString()}`
                : 'Active'}
            />
          ) : null}
          {isGovernance && entry.prominenceFailureAt ? (
            <>
              <InfoRow label="Prominence failure" value={new Date(entry.prominenceFailureAt).toLocaleString()} />
              <InfoRow label="Failure reason" value={entry.prominenceFailureReason} />
            </>
          ) : null}
        </div>
      ) : null}

      {/* Governance-only sections */}
      {isGovernance ? (
        <>
          {entry.rejectionReason || entry.revisionGuidance || entry.moderatorNotes || entry.adminReviewReason || entry.removedReason ? (
            <div>
              <SectionHeading>Governance metadata</SectionHeading>
              <InfoRow label="Rejection reason" value={entry.rejectionReason} />
              <InfoRow label="Revision guidance" value={entry.revisionGuidance} />
              <InfoRow label="Admin review reason" value={entry.adminReviewReason} />
              <InfoRow label="Removal reason" value={entry.removedReason} />
              <InfoRow label="Moderator notes" value={entry.moderatorNotes} />
            </div>
          ) : null}
        </>
      ) : null}

      {/* Associated-only reduced view */}
      {!isPublic && !isGovernance ? (
        <div
          style={{
            padding: '12px 14px',
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
        <SectionHeading>Audit timeline</SectionHeading>
        {timelineLoading ? (
          <div style={{ fontSize: '0.75rem', color: 'rgba(26, 19, 16, 0.5)' }}>Loading timeline…</div>
        ) : timeline && timeline.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {timeline.map((evt) => {
              const tone = mapAuditEventTypeChipTone(evt.eventType);
              return (
                <div
                  key={evt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: '0.75rem',
                    lineHeight: 1.5,
                    paddingBottom: 8,
                    borderBottom: '1px solid rgba(229, 126, 70, 0.10)',
                  }}
                >
                  <HbcStatusBadge
                    variant={chipVariant(tone)}
                    size="small"
                    label={mapAuditEventTypeLabel(evt.eventType)}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'rgba(26, 19, 16, 0.62)', fontWeight: 600 }}>
                      {evt.actorDisplayName ?? 'System'} · {new Date(evt.eventAt).toLocaleString()}
                    </div>
                    {evt.publicNote ? (
                      <div style={{ color: 'rgba(26, 19, 16, 0.58)', marginTop: 2 }}>{evt.publicNote}</div>
                    ) : null}
                    {isGovernance && evt.internalNote ? (
                      <div style={{ color: 'rgba(196, 49, 75, 0.72)', marginTop: 2, fontStyle: 'italic' }}>
                        Internal: {evt.internalNote}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: '0.75rem', color: 'rgba(26, 19, 16, 0.5)' }}>
            {mapAuditEventTypeLabel('submit')} · {new Date(entry.submittedDate).toLocaleString()}
            {entry.approvedDate ? (
              <>
                <br />
                {mapAuditEventTypeLabel('approve')} · {new Date(entry.approvedDate).toLocaleString()}
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
