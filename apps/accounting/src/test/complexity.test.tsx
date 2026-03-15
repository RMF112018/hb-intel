/**
 * W0-G4-T08 Phase 4: Accounting complexity gate tests (3 tests).
 * Verifies standard-tier gating, expert-tier gating, and complexity dial presence.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

// Lazy imports after mocks
const { ProjectReviewDetailPage } = await import('../pages/ProjectReviewDetailPage.js');
const { createProvisioningApiClient } = await import('@hbc/provisioning');
const { useParams, useNavigate } = await import('@tanstack/react-router');
const crossAppUrls = await import('../utils/crossAppUrls.js');

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Accounting — complexity gate tests', () => {
  beforeEach(() => {
    // Restore mock implementations after vi.resetAllMocks() from setup.ts
    mockClient.listRequests.mockResolvedValue([]);
    mockClient.getProvisioningStatus.mockResolvedValue(null);
    mockClient.advanceState.mockResolvedValue(undefined);
    vi.mocked(createProvisioningApiClient).mockReturnValue(mockClient as any);
    vi.mocked(useParams).mockReturnValue({ requestId: 'req-1' } as any);
    vi.mocked(useNavigate).mockReturnValue(vi.fn() as any);
    vi.mocked(crossAppUrls.getAdminAppUrl).mockReturnValue('https://admin.example.com');
  });

  // G4-T06-004: Standard fields hidden at essential tier
  it('hides "Request Details" at essential tier and shows it at standard', () => {
    const request = createTestRequest({ requestId: 'req-1', state: 'UnderReview' });
    mockClient.listRequests.mockResolvedValue([request]);

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
    mockClient.listRequests.mockResolvedValue([request]);

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
    mockClient.listRequests.mockResolvedValue([request]);

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [request],
    });

    // HbcComplexityDial renders a group with aria-label="Complexity level"
    expect(screen.getByRole('group', { name: 'Complexity level' })).toBeTruthy();
  });
});
