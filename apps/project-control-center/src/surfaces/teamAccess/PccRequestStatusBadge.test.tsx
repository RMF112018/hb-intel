import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import {
  TEAM_ACCESS_REQUEST_STATUSES,
  type TeamAccessRequestStatus,
} from '@hbc/models/pcc';
import { PccRequestStatusBadge, REQUEST_STATUS_TONES } from './PccRequestStatusBadge';
import { REQUEST_STATUS_LABELS } from './teamAccessAdapter';
import type { PccStatusPillTone } from '../../ui/PccStatusPill';

const EXPECTED_TONES: Readonly<Record<TeamAccessRequestStatus, PccStatusPillTone>> = {
  'draft-preview': 'neutral',
  'submitted-preview': 'info',
  'pending-review': 'warning',
  'approved-pending-execution': 'info',
  rejected: 'danger',
  'completed-manual': 'success',
};

describe('PccRequestStatusBadge — tone + label coverage', () => {
  it.each(TEAM_ACCESS_REQUEST_STATUSES)(
    'renders the canonical label and expected tone for %s',
    (status) => {
      const { container } = render(<PccRequestStatusBadge status={status} />);
      const wrapper = container.querySelector(`[data-pcc-request-status="${status}"]`);
      expect(wrapper).not.toBeNull();
      expect(wrapper?.getAttribute('data-pcc-request-status-tone')).toBe(EXPECTED_TONES[status]);
      expect(wrapper?.textContent).toContain(REQUEST_STATUS_LABELS[status]);
      expect(REQUEST_STATUS_TONES[status]).toBe(EXPECTED_TONES[status]);
    },
  );

  it('renders the em-dash canonical label for approved-pending-execution', () => {
    const { container } = render(<PccRequestStatusBadge status="approved-pending-execution" />);
    expect(container.textContent).toContain('Approved — Pending Execution');
    const wrapper = container.querySelector(
      '[data-pcc-request-status="approved-pending-execution"]',
    );
    expect(wrapper?.getAttribute('data-pcc-request-status-tone')).toBe('info');
  });

  it('honours an explicit label override while preserving the status attribute', () => {
    const { container } = render(
      <PccRequestStatusBadge status="pending-review" label="Custom label" />,
    );
    const wrapper = container.querySelector('[data-pcc-request-status="pending-review"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.textContent).toContain('Custom label');
    expect(wrapper?.getAttribute('data-pcc-request-status-tone')).toBe('warning');
  });
});

describe('PccRequestStatusBadge — color is not the only signal', () => {
  it('emits text + tone-attribute + status-attribute redundancy for every status', () => {
    for (const status of TEAM_ACCESS_REQUEST_STATUSES) {
      const { container } = render(<PccRequestStatusBadge status={status} />);
      const wrapper = container.querySelector(`[data-pcc-request-status="${status}"]`);
      expect(wrapper).not.toBeNull();
      const visibleText = wrapper?.textContent ?? '';
      expect(visibleText.length).toBeGreaterThan(0);
      expect(visibleText).toBe(REQUEST_STATUS_LABELS[status]);
      expect(wrapper?.getAttribute('data-pcc-request-status-tone')).toBe(EXPECTED_TONES[status]);
      expect(wrapper?.getAttribute('data-pcc-request-status-label')).toBe(
        REQUEST_STATUS_LABELS[status],
      );
    }
  });
});

describe('PccRequestStatusBadge — accessibility / inertness', () => {
  it('renders no anchors, no buttons, no href, no onClick on the badge wrapper', () => {
    for (const status of TEAM_ACCESS_REQUEST_STATUSES) {
      const { container } = render(<PccRequestStatusBadge status={status} />);
      const wrapper = container.querySelector(`[data-pcc-request-status="${status}"]`);
      expect(wrapper?.querySelector('a')).toBeNull();
      expect(wrapper?.querySelector('button')).toBeNull();
      expect(wrapper?.querySelector('[href]')).toBeNull();
      expect(wrapper?.getAttribute('onclick')).toBeNull();
    }
  });
});
