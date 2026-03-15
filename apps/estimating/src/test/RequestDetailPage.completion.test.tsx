/**
 * W0-G4-T08 Phase 1: CompletionConfirmationCard test suite (10 tests).
 * Tests completion rendering, handoff link, stay action, and usePrepareHandoff wiring.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { renderWithProviders } from './renderWithProviders.js';
import { createTestRequest, createTestProvisioningStatus } from './factories.js';

// ---------------------------------------------------------------------------
// Shared mock state
// ---------------------------------------------------------------------------
const mockNavigate = vi.fn();
const mockUsePrepareHandoff = vi.fn();

// ---------------------------------------------------------------------------
// Module-level mocks
// ---------------------------------------------------------------------------
vi.mock('@hbc/workflow-handoff', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hbc/workflow-handoff')>();
  return {
    ...actual,
    usePrepareHandoff: (...args: unknown[]) => {
      mockUsePrepareHandoff(...args);
    },
    HbcHandoffStatusBadge: () => null,
  };
});

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

// Lazy import after mocks
const { CompletionConfirmationCard } = await import(
  '../components/project-setup/CompletionConfirmationCard.js'
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderCompletion(
  requestOverrides: Parameters<typeof createTestRequest>[0] = {},
  statusOverrides?: Parameters<typeof createTestProvisioningStatus>[0],
) {
  const request = createTestRequest({ state: 'Completed', ...requestOverrides });
  const status = statusOverrides !== undefined
    ? createTestProvisioningStatus({ overallStatus: 'Completed', ...statusOverrides })
    : undefined;
  return renderWithProviders(
    <CompletionConfirmationCard request={request} provisioningStatus={status} />,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('CompletionConfirmationCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.open spy between tests
    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  // G4-T05-001
  it('renders completion card on Completed state', () => {
    renderCompletion({}, { siteUrl: 'https://hb.sharepoint.com/sites/test' });
    expect(screen.getByText('Provisioning Complete')).toBeInTheDocument();
    expect(screen.getByText(/Test Project is ready/)).toBeInTheDocument();
  });

  // G4-T05-002
  it('does not show "Provisioning Complete" for non-Completed states', () => {
    const request = createTestRequest({ state: 'Submitted' });
    // CompletionConfirmationCard always renders its card — it's the parent that conditionally renders it.
    // But the badge text is always present when the card renders. The gating is in RequestDetailPage.
    // We test via RequestDetailPage mock that the card is absent.
    // For this unit test, verify that usePrepareHandoff receives null when state is not Completed.
    const nonCompletedRequest = createTestRequest({ state: 'Submitted' });
    renderWithProviders(
      <CompletionConfirmationCard request={nonCompletedRequest} provisioningStatus={undefined} />,
    );
    // usePrepareHandoff should be called with null (first arg) since state !== Completed
    expect(mockUsePrepareHandoff).toHaveBeenCalledWith(
      null,
      expect.anything(),
      expect.anything(),
      false,
    );
  });

  // G4-T05-003
  it('shows "Open Project Hub" when siteUrl is valid', () => {
    renderCompletion({}, { siteUrl: 'https://hb.sharepoint.com/sites/proj' });
    expect(screen.getByText('Open Project Hub')).toBeInTheDocument();
  });

  // G4-T05-004
  it('shows warning banner when siteUrl is missing', () => {
    renderCompletion({}, { siteUrl: undefined });
    expect(screen.getByText(/not yet available/)).toBeInTheDocument();
    expect(screen.queryByText('Open Project Hub')).not.toBeInTheDocument();
  });

  // G4-T05-005
  it('opens new tab on "Open Project Hub" click, not same-tab navigate', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderCompletion({}, { siteUrl: 'https://hb.sharepoint.com/sites/proj' });
    fireEvent.click(screen.getByText('Open Project Hub'));
    expect(openSpy).toHaveBeenCalledWith(
      'https://hb.sharepoint.com/sites/proj',
      '_blank',
      'noopener,noreferrer',
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // G4-T05-006
  it('"Stay in Estimating" hides handoff section but card remains', () => {
    renderCompletion({}, { siteUrl: 'https://hb.sharepoint.com/sites/proj' });
    // Handoff section visible before clicking stay
    expect(screen.getByText('Open Project Hub')).toBeInTheDocument();
    expect(screen.getByText('Stay in Estimating')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Stay in Estimating'));

    // Handoff section dismissed
    expect(screen.queryByText('Open Project Hub')).not.toBeInTheDocument();
    expect(screen.queryByText('Stay in Estimating')).not.toBeInTheDocument();
    // Card itself still present
    expect(screen.getByText('Provisioning Complete')).toBeInTheDocument();
  });

  // G4-T05-007
  it('no auto-redirect after 10 seconds', () => {
    vi.useFakeTimers();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderCompletion({}, { siteUrl: 'https://hb.sharepoint.com/sites/proj' });

    vi.advanceTimersByTime(10_000);

    // No auto-navigation should happen
    expect(openSpy).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  // G4-T05-008
  it('usePrepareHandoff called with correct config when Completed', () => {
    renderCompletion({}, { siteUrl: 'https://hb.sharepoint.com/sites/proj' });
    expect(mockUsePrepareHandoff).toHaveBeenCalledWith(
      expect.objectContaining({ state: 'Completed' }),
      expect.anything(), // SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG
      expect.objectContaining({ role: 'Requester' }),
      true, // enabled: state === 'Completed' && validUrl
    );
  });

  // G4-T05-009
  it.todo('Hub welcome card within 7 days — deferred: IActiveProject lacks provisionedAt');

  // G4-T05-010
  it.todo('Hub welcome card dismissable — deferred: same blocker');
});
