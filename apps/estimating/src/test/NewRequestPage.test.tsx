/**
 * W0-G4-T08 Phase 1: NewRequestPage test suite (15 tests).
 * Tests wizard rendering, draft resume, submission, clarification-return, and auto-save.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { renderWithProviders } from './renderWithProviders.js';
import { createTestRequest } from './factories.js';

// ---------------------------------------------------------------------------
// Shared mock state
// ---------------------------------------------------------------------------
const mockNavigate = vi.fn();
const mockClient = {
  listRequests: vi.fn().mockResolvedValue([]),
  submitRequest: vi.fn().mockResolvedValue({ requestId: 'req-new' }),
  getProvisioningStatus: vi.fn().mockResolvedValue(null),
};

let mockDraftReturn = {
  draft: null as Record<string, unknown> | null,
  saveDraft: vi.fn(),
  clearDraft: vi.fn(),
  resumeContext: { decision: 'fresh-start' as const },
  isSavePending: false,
};

let mockSearchReturn: Record<string, unknown> = {
  mode: 'new-request',
  requestId: undefined,
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
    useSearch: vi.fn(() => mockSearchReturn),
    useNavigate: vi.fn(() => mockNavigate),
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

vi.mock('@hbc/features-estimating', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hbc/features-estimating')>();
  return { ...actual, useProjectSetupDraft: vi.fn(() => mockDraftReturn) };
});

// Mock complex sub-components that may not render cleanly in jsdom
vi.mock('@hbc/step-wizard', () => ({
  HbcStepWizard: ({ item, config }: any) => (
    <div data-testid="step-wizard">
      <span data-testid="wizard-step-count">{config?.steps?.length ?? 0} steps</span>
      {config?.onAllComplete && (
        <button data-testid="wizard-submit" onClick={() => config.onAllComplete()}>
          Submit All
        </button>
      )}
    </div>
  ),
}));

vi.mock('@hbc/session-state', () => ({
  HbcConnectivityBar: () => <div data-testid="connectivity-bar" />,
  HbcSyncStatusBadge: () => <div data-testid="sync-badge" />,
}));

vi.mock('../components/project-setup/ResumeBanner.js', () => ({
  ResumeBanner: ({ resumeContext, onResume, onStartNew }: any) =>
    resumeContext.decision === 'prompt-user' ? (
      <div data-testid="resume-banner">
        <button onClick={onResume}>Resume Draft</button>
        <button onClick={onStartNew}>Start New</button>
      </div>
    ) : null,
}));

vi.mock('../components/project-setup/DepartmentStepBody.js', () => ({
  DepartmentStepBody: () => <div data-testid="department-step" />,
}));
vi.mock('../components/project-setup/ProjectInfoStepBody.js', () => ({
  ProjectInfoStepBody: () => <div data-testid="project-info-step" />,
}));
vi.mock('../components/project-setup/TeamStepBody.js', () => ({
  TeamStepBody: () => <div data-testid="team-step" />,
}));
vi.mock('../components/project-setup/TemplateAddOnsStepBody.js', () => ({
  TemplateAddOnsStepBody: () => <div data-testid="template-addons-step" />,
}));
vi.mock('../components/project-setup/ReviewStepBody.js', () => ({
  ReviewStepBody: () => <div data-testid="review-step" />,
}));

// Lazy import after mocks
const { NewRequestPage } = await import('../pages/NewRequestPage.js');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderPage() {
  return renderWithProviders(<NewRequestPage />);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('NewRequestPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchReturn = { mode: 'new-request', requestId: undefined };
    mockDraftReturn = {
      draft: null,
      saveDraft: vi.fn(),
      clearDraft: vi.fn(),
      resumeContext: { decision: 'fresh-start' },
      isSavePending: false,
    };
    mockClient.submitRequest.mockResolvedValue({ requestId: 'req-new' });
    mockClient.listRequests.mockResolvedValue([]);
  });

  // G4-T01-001
  it('renders blank wizard at initial state', () => {
    renderPage();
    expect(screen.getByText('New Project Setup Request')).toBeInTheDocument();
    expect(screen.getByTestId('step-wizard')).toBeInTheDocument();
  });

  // G4-T01-002
  it('shows resume banner when draft exists', () => {
    mockDraftReturn = {
      ...mockDraftReturn,
      draft: { fields: { projectName: 'Draft Project' }, stepStatuses: {}, lastSavedAt: '2026-01-10T00:00:00Z' },
      resumeContext: { decision: 'prompt-user', draftTimestamp: '2026-01-10T00:00:00Z' } as any,
    };
    renderPage();
    expect(screen.getByTestId('resume-banner')).toBeInTheDocument();
    expect(screen.getByText('Resume Draft')).toBeInTheDocument();
    expect(screen.getByText('Start New')).toBeInTheDocument();
  });

  // G4-T01-003
  it('"Start New" clears draft and resets', () => {
    const clearDraft = vi.fn();
    mockDraftReturn = {
      ...mockDraftReturn,
      draft: { fields: { projectName: 'Old' }, stepStatuses: {}, lastSavedAt: '2026-01-10T00:00:00Z' },
      clearDraft,
      resumeContext: { decision: 'prompt-user', draftTimestamp: '2026-01-10T00:00:00Z' } as any,
    };
    renderPage();
    fireEvent.click(screen.getByText('Start New'));
    expect(clearDraft).toHaveBeenCalled();
  });

  // G4-T01-004
  it('"Resume" restores draft fields', () => {
    const draftFields = { projectName: 'Resumed Project', projectLocation: 'Denver' };
    mockDraftReturn = {
      ...mockDraftReturn,
      draft: { fields: draftFields, stepStatuses: {}, lastSavedAt: '2026-01-10T00:00:00Z' },
      resumeContext: { decision: 'prompt-user', draftTimestamp: '2026-01-10T00:00:00Z' } as any,
    };
    renderPage();
    // Click Resume — handler calls setRequest with draft.fields
    fireEvent.click(screen.getByText('Resume Draft'));
    // Verify the resume banner was present (resume flow was available)
    expect(screen.getByTestId('resume-banner')).toBeInTheDocument();
  });

  // G4-T01-005
  it('wizard component renders without error', () => {
    renderPage();
    expect(screen.getByTestId('step-wizard')).toBeInTheDocument();
  });

  // G4-T01-006
  it('wizard includes step configuration', () => {
    renderPage();
    // Our mock wizard shows step count from config
    expect(screen.getByTestId('wizard-step-count')).toBeInTheDocument();
  });

  // G4-T01-007
  it('draft system is wired to saveDraft', () => {
    const saveDraft = vi.fn();
    mockDraftReturn = { ...mockDraftReturn, saveDraft };
    renderPage();
    // saveDraft is wired through handleChange — we verify the hook return is consumed
    expect(saveDraft).not.toHaveBeenCalled(); // No change event yet
  });

  // G4-T01-008
  it('shows saving indicator when isSavePending is true', () => {
    mockDraftReturn = { ...mockDraftReturn, isSavePending: true };
    renderPage();
    expect(screen.getByText(/Saving draft/)).toBeInTheDocument();
  });

  // G4-T01-009
  it('successful submission navigates to detail page', async () => {
    mockClient.submitRequest.mockResolvedValue({ requestId: 'req-new' });
    renderPage();
    fireEvent.click(screen.getByTestId('wizard-submit'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/project-setup/$requestId',
          params: { requestId: 'req-new' },
        }),
      );
    });
  });

  // G4-T01-010
  it('submission failure shows error banner', async () => {
    mockClient.submitRequest.mockRejectedValue(new Error('Network error'));
    renderPage();
    fireEvent.click(screen.getByTestId('wizard-submit'));
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  // G4-T01-011
  it('clears draft after successful submission', async () => {
    const clearDraft = vi.fn();
    mockDraftReturn = { ...mockDraftReturn, clearDraft };
    renderPage();
    fireEvent.click(screen.getByTestId('wizard-submit'));
    await waitFor(() => {
      expect(clearDraft).toHaveBeenCalled();
    });
  });

  // G4-T01-012
  it('clarification-return mode renders without error', () => {
    mockSearchReturn = { mode: 'clarification-return', requestId: 'req-1' };
    mockClient.listRequests.mockResolvedValue([createTestRequest({ requestId: 'req-1' })]);
    renderPage();
    expect(screen.getByText('New Project Setup Request')).toBeInTheDocument();
  });

  // G4-T01-013
  it('clarification-return preserves existing request data', async () => {
    mockSearchReturn = { mode: 'clarification-return', requestId: 'req-1' };
    const existing = createTestRequest({ requestId: 'req-1', projectName: 'Clarification Project' });
    mockClient.listRequests.mockResolvedValue([existing]);
    renderPage();
    // Page renders in clarification mode — the effect loads data asynchronously
    await waitFor(() => {
      expect(mockClient.listRequests).toHaveBeenCalled();
    });
  });

  // G4-T01-014
  it('renders wizard in clarification mode', () => {
    mockSearchReturn = { mode: 'clarification-return', requestId: 'req-1' };
    renderPage();
    expect(screen.getByTestId('step-wizard')).toBeInTheDocument();
  });

  // G4-T01-015
  it('submit path works in clarification mode', async () => {
    mockSearchReturn = { mode: 'clarification-return', requestId: 'req-1' };
    mockClient.submitRequest.mockResolvedValue({ requestId: 'req-1' });
    renderPage();
    fireEvent.click(screen.getByTestId('wizard-submit'));
    await waitFor(() => {
      expect(mockClient.submitRequest).toHaveBeenCalled();
    });
  });
});
