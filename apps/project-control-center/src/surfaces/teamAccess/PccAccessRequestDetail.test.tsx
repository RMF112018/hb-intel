import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE } from '@hbc/models/pcc';
import { PccAccessRequestDetail } from './PccAccessRequestDetail';

const [pendingReviewRecord, approvedPendingRecord] =
  SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE.requestPreviewRecords;

describe('PccAccessRequestDetail — visible field rendering', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders all visible fields for the pending-review record', () => {
    const { container } = render(<PccAccessRequestDetail request={pendingReviewRecord} />);

    const detail = container.querySelector(
      `[data-pcc-access-request-detail="${pendingReviewRecord.requestId}"]`,
    );
    expect(detail).not.toBeNull();
    expect(container.textContent).toContain('Review decision preview');
    expect(container.textContent).toContain(pendingReviewRecord.requestedUserLabel);
    expect(container.textContent).toContain(pendingReviewRecord.requestedPersona);
    expect(container.textContent).toContain(
      pendingReviewRecord.requestedPermissionTemplateLabel,
    );
    expect(container.textContent).toContain(pendingReviewRecord.businessJustification);
    expect(container.textContent).toContain(pendingReviewRecord.requestedByLabel);
    if (pendingReviewRecord.reviewedByLabel) {
      expect(container.textContent).toContain(pendingReviewRecord.reviewedByLabel);
    }
    if (pendingReviewRecord.reviewerCommentPreview) {
      expect(container.textContent).toContain(pendingReviewRecord.reviewerCommentPreview);
    }
    expect(
      container.querySelector(
        `[data-pcc-request-status="${pendingReviewRecord.requestStatus}"]`,
      ),
    ).not.toBeNull();
  });

  it('renders all visible fields for the approved-pending-execution record (with em-dash label)', () => {
    const { container } = render(<PccAccessRequestDetail request={approvedPendingRecord} />);

    expect(
      container.querySelector(
        `[data-pcc-access-request-detail="${approvedPendingRecord.requestId}"]`,
      ),
    ).not.toBeNull();
    expect(container.textContent).toContain('Review decision preview');
    expect(container.textContent).toContain('Approved — Pending Execution');
    expect(container.textContent).toContain(approvedPendingRecord.requestedUserLabel);
    expect(container.textContent).toContain(approvedPendingRecord.requestedPersona);
    expect(container.textContent).toContain(approvedPendingRecord.businessJustification);
  });
});

describe('PccAccessRequestDetail — inertness', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders zero anchors, zero buttons, zero href attributes', () => {
    const { container } = render(<PccAccessRequestDetail request={pendingReviewRecord} />);
    const detail = container.querySelector(
      `[data-pcc-access-request-detail="${pendingReviewRecord.requestId}"]`,
    );
    expect(detail).not.toBeNull();
    expect(detail?.querySelector('a')).toBeNull();
    expect(detail?.querySelector('button')).toBeNull();
    expect(detail?.querySelector('[href]')).toBeNull();
  });

  it('does not render the panel-level no-permission-change notice (avoids duplication)', () => {
    const { container } = render(<PccAccessRequestDetail request={pendingReviewRecord} />);
    const detail = container.querySelector(
      `[data-pcc-access-request-detail="${pendingReviewRecord.requestId}"]`,
    );
    expect(detail?.querySelector('[data-pcc-no-permission-change-notice]')).toBeNull();
  });
});
