/**
 * W0-G4-T08 Phase 4: Accounting complexity gate tests (3 tests).
 * Verifies standard-tier gating, expert-tier gating, and complexity dial presence.
 */
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import React from 'react';
import { renderWithProviders } from './renderWithProviders.js';
import { createTestRequest } from './factories.js';

// ---------------------------------------------------------------------------
// Shared mock state
// ---------------------------------------------------------------------------
const mockClient = {
  listRequests: vi.fn().mockResolvedValue([]),
  getProvisioningStatus: vi.fn().mockResolvedValue(null),
  submitRequest: vi.fn().mockResolvedValue({ requestId: 'req-new' }),
  advanceState: vi.fn().mockResolvedValue(undefined),
  retryProvisioning: vi.fn().mockResolvedValue(undefined),
};

// ---------------------------------------------------------------------------
// Module-level mocks
// ---------------------------------------------------------------------------
vi.mock('@hbc/provisioning', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hbc/provisioning')>();
  return { ...actual, createProvisioningApiClient: vi.fn(() => mockClient) };
});

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useParams: vi.fn(() => ({ requestId: 'req-1' })),
    useNavigate: vi.fn(() => vi.fn()),
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

vi.mock('../utils/crossAppUrls.js', () => ({
  getAdminAppUrl: vi.fn(() => 'https://admin.example.com'),
}));

// Lazy import after mocks
const { ProjectReviewDetailPage } = await import('../pages/ProjectReviewDetailPage.js');

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Accounting — complexity gate tests', () => {
  // G4-T06-004: Standard fields hidden at essential tier
  it('hides "Request Details" at essential tier and shows it at standard', () => {
    const request = createTestRequest({ requestId: 'req-1', state: 'UnderReview' });

    // Essential tier — "Request Details" should be absent
    const { unmount } = renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'essential',
      requests: [request],
    });
    expect(screen.queryByText('Request Details')).toBeNull();
    unmount();

    // Standard tier — "Request Details" should be present
    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [request],
    });
    expect(screen.getByText('Request Details')).toBeTruthy();
  });

  // G4-T06-005: Expert fields absent at standard
  it('hides audit trail panel at standard tier', () => {
    const request = createTestRequest({ requestId: 'req-1', state: 'UnderReview' });

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [request],
    });

    // HbcAuditTrailPanel should not render at standard tier
    expect(document.querySelector('[data-hbc-ui="HbcAuditTrailPanel"]')).toBeNull();
  });

  // G4-T06-007: ComplexityDial in accounting detail
  it('renders HbcComplexityDial in the detail page at standard tier', () => {
    const request = createTestRequest({ requestId: 'req-1', state: 'UnderReview' });

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [request],
    });

    expect(document.querySelector('[data-hbc-ui="HbcComplexityDial"]')).toBeTruthy();
  });
});
