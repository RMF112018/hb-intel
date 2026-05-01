import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE } from '@hbc/models/pcc';
import { PccAccessRequestQueue } from './PccAccessRequestQueue';

const records = SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE.requestPreviewRecords;
const [pendingReviewRecord, approvedPendingRecord] = records;

describe('PccAccessRequestQueue — list rendering', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders one row per record with the status badge', () => {
    const { container } = render(
      <PccAccessRequestQueue records={records} branch="access-manager" />,
    );

    const queue = container.querySelector('[data-pcc-access-request-queue]');
    expect(queue).not.toBeNull();
    expect(queue?.getAttribute('data-pcc-access-request-queue')).toBe(String(records.length));

    const rows = container.querySelectorAll('[data-pcc-access-request-queue-row]');
    expect(rows).toHaveLength(records.length);

    for (const record of records) {
      const row = container.querySelector(
        `[data-pcc-access-request-queue-row="${record.requestId}"]`,
      );
      expect(row).not.toBeNull();
      expect(row?.textContent).toContain(record.requestedUserLabel);
      expect(
        row?.querySelector(`[data-pcc-request-status="${record.requestStatus}"]`),
      ).not.toBeNull();
    }
  });

  it('shows the unavailable-fixture preview state when records are empty', () => {
    const { container } = render(
      <PccAccessRequestQueue records={[]} branch="access-manager" />,
    );
    expect(
      container.querySelector('[data-pcc-access-request-queue]')?.getAttribute(
        'data-pcc-access-request-queue',
      ),
    ).toBe('0');
    expect(container.querySelector('[data-pcc-state="unavailable-fixture"]')).not.toBeNull();
  });

  it('renders no anchor with href anywhere in the queue tree', () => {
    const { container } = render(
      <PccAccessRequestQueue records={records} branch="access-manager" />,
    );
    expect(container.querySelector('a[href]')).toBeNull();
  });
});

describe('PccAccessRequestQueue — selection + branch routing', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;
  let originalFetch: typeof globalThis.fetch | undefined;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    fetchSpy = vi.fn();
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      writable: true,
      value: fetchSpy,
    });
  });

  afterEach(() => {
    cleanup();
    if (originalFetch === undefined) {
      Reflect.deleteProperty(globalThis as unknown as Record<string, unknown>, 'fetch');
    } else {
      Object.defineProperty(globalThis, 'fetch', {
        configurable: true,
        writable: true,
        value: originalFetch,
      });
    }
  });

  it('clicking "View detail" reveals the detail panel for the selected record', () => {
    const { container } = render(
      <PccAccessRequestQueue records={records} branch="access-manager" />,
    );

    expect(container.querySelector('[data-pcc-access-request-detail]')).toBeNull();

    const viewButton = container.querySelector(
      `[data-pcc-access-request-queue-action-target="${pendingReviewRecord.requestId}"]`,
    ) as HTMLButtonElement | null;
    expect(viewButton).not.toBeNull();

    fireEvent.click(viewButton as HTMLButtonElement);

    const detail = container.querySelector(
      `[data-pcc-access-request-detail="${pendingReviewRecord.requestId}"]`,
    );
    expect(detail).not.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('selecting a different record swaps the detail panel target', () => {
    const { container } = render(
      <PccAccessRequestQueue records={records} branch="access-manager" />,
    );

    const firstButton = container.querySelector(
      `[data-pcc-access-request-queue-action-target="${pendingReviewRecord.requestId}"]`,
    ) as HTMLButtonElement;
    fireEvent.click(firstButton);
    expect(
      container.querySelector(
        `[data-pcc-access-request-detail="${pendingReviewRecord.requestId}"]`,
      ),
    ).not.toBeNull();

    const secondButton = container.querySelector(
      `[data-pcc-access-request-queue-action-target="${approvedPendingRecord.requestId}"]`,
    ) as HTMLButtonElement;
    fireEvent.click(secondButton);
    expect(
      container.querySelector(
        `[data-pcc-access-request-detail="${approvedPendingRecord.requestId}"]`,
      ),
    ).not.toBeNull();
    expect(
      container.querySelector(
        `[data-pcc-access-request-detail="${pendingReviewRecord.requestId}"]`,
      ),
    ).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('access-manager branch shows the review controls in canReview=true mode', () => {
    const { container } = render(
      <PccAccessRequestQueue records={records} branch="access-manager" />,
    );
    const viewButton = container.querySelector(
      `[data-pcc-access-request-queue-action-target="${pendingReviewRecord.requestId}"]`,
    ) as HTMLButtonElement;
    fireEvent.click(viewButton);

    const reviewWrapper = container.querySelector('[data-pcc-access-review-controls]');
    expect(reviewWrapper?.getAttribute('data-pcc-access-review-controls')).toBe('preview');
    expect(container.querySelector('[data-pcc-review-action="approve"]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-review-action="reject"]')).not.toBeNull();
  });

  it.each(['has-project-access', 'needs-project-access'] as const)(
    '%s branch shows unauthorized review controls (no Approve/Reject)',
    (branch) => {
      const { container } = render(<PccAccessRequestQueue records={records} branch={branch} />);
      const viewButton = container.querySelector(
        `[data-pcc-access-request-queue-action-target="${pendingReviewRecord.requestId}"]`,
      ) as HTMLButtonElement;
      fireEvent.click(viewButton);

      const reviewWrapper = container.querySelector('[data-pcc-access-review-controls]');
      expect(reviewWrapper?.getAttribute('data-pcc-access-review-controls')).toBe(
        'unauthorized',
      );
      expect(container.querySelector('[data-pcc-state="unauthorized-persona"]')).not.toBeNull();
      expect(container.querySelector('[data-pcc-review-action="approve"]')).toBeNull();
      expect(container.querySelector('[data-pcc-review-action="reject"]')).toBeNull();
      expect(fetchSpy).not.toHaveBeenCalled();
    },
  );
});
