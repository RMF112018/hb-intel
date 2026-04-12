/**
 * Phase-16 — shared detail-panel public/admin boundary.
 *
 * `KudosDetailPanelContent` is rendered by both the public HbKudos
 * webpart (role='viewer') and the HR companion (role='admin'). The
 * boundary contract (Decision Lock §103-107):
 *   - viewer role MUST NOT render the audit timeline or governance
 *     metadata
 *   - admin role MUST render the audit timeline + governance metadata
 * This spec guards that contract at the shared-component level.
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { KudosDetailPanelContent } from '../shared/KudosDetailPanelContent.js';
import type { KudosEntry } from '../webparts/kudosContracts.js';

const entry: KudosEntry = {
  id: 'k-1',
  headline: 'Great work',
  excerpt: 'Nailed the estimate.',
  submittedBy: { id: 'u1', displayName: 'Sam Submitter' },
  submittedDate: '2026-04-10T10:00:00.000Z',
  approvedDate: '2026-04-10T11:00:00.000Z',
  status: 'approved',
  workflowStatus: 'approved',
  homepageEnabled: true,
  recipients: [{ id: 'r1', name: 'Ren Recipient', recipientType: 'individual' }],
  rejectionReason: undefined,
  revisionGuidance: undefined,
  adminReviewReason: 'noise-check',
  moderatorNotes: 'internal moderator note',
  removedReason: undefined,
};

const timeline = [
  {
    id: 1,
    kudosId: 'k-1',
    eventType: 'submit' as const,
    actorDisplayName: 'Sam Submitter',
    eventAt: '2026-04-10T10:00:00.000Z',
    publicNote: undefined,
    internalNote: 'routed to reviewer queue',
  },
  {
    id: 2,
    kudosId: 'k-1',
    eventType: 'approve' as const,
    actorDisplayName: 'Anna Admin',
    eventAt: '2026-04-10T11:00:00.000Z',
    publicNote: undefined,
    internalNote: undefined,
  },
];

describe('KudosDetailPanelContent — public/admin boundary', () => {
  afterEach(() => cleanup());

  it('viewer (public) role HIDES audit timeline and governance metadata', () => {
    render(<KudosDetailPanelContent entry={entry} role="viewer" timeline={timeline} />);
    expect(screen.queryByText(/audit timeline/i)).toBeNull();
    expect(screen.queryByText(/governance metadata/i)).toBeNull();
    expect(screen.queryByText(/internal moderator note/i)).toBeNull();
    expect(screen.queryByText(/routed to reviewer queue/i)).toBeNull();
    expect(screen.queryByText(/admin review reason/i)).toBeNull();
  });

  it('admin role SHOWS audit timeline and governance metadata', () => {
    render(<KudosDetailPanelContent entry={entry} role="admin" timeline={timeline} />);
    expect(screen.getAllByText(/audit timeline/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/governance metadata/i)).toBeTruthy();
    expect(screen.getByText(/internal moderator note/i)).toBeTruthy();
    expect(screen.getByText(/noise-check/i)).toBeTruthy();
  });

  it('reviewer role matches admin boundary (full timeline + metadata)', () => {
    render(<KudosDetailPanelContent entry={entry} role="reviewer" timeline={timeline} />);
    expect(screen.getAllByText(/audit timeline/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/governance metadata/i)).toBeTruthy();
  });

  it('viewer role still renders public recognition content', () => {
    render(<KudosDetailPanelContent entry={entry} role="viewer" timeline={timeline} />);
    expect(screen.getAllByText('Nailed the estimate.').length).toBeGreaterThan(0);
    // Submitter attribution is rendered on the viewer-safe submission
    // block; audit timeline is still hidden.
    expect(screen.getByText(/Sam Submitter/)).toBeTruthy();
  });
});
