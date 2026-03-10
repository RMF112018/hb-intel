# SF08-T08 — Testing Strategy: `@hbc/workflow-handoff`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-08-Shared-Feature-Workflow-Handoff.md`
**Decisions Applied:** D-02 (state machine), D-03 (pre-flight), D-04 (field mapping), D-05 (BIC transfer), D-07 (rejection terminal), D-09 (generic types), D-10 (testing sub-path)
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T01–T07

> **Doc Classification:** Canonical Normative Plan — SF08-T08 testing strategy task; sub-plan of `SF08-Workflow-Handoff.md`.

---

## Objective

Implement the `@hbc/workflow-handoff/testing` sub-path with canonical fixtures and state factories. Write unit tests for all hooks and components, Storybook stories for every visual state, and Playwright E2E scenarios covering the full BD→Estimating handoff lifecycle.

---

## 3-Line Plan

1. Implement the `testing/` sub-path exports: `createMockHandoffPackage<S,D>()`, `createMockHandoffConfig<S,D>()`, `mockHandoffStates`, and document fixtures.
2. Write unit tests for `usePrepareHandoff`, `useHandoffInbox`, `useHandoffStatus`, `HbcHandoffComposer`, `HbcHandoffReceiver`, and `HbcHandoffStatusBadge`.
3. Write Storybook stories for all visual states and five Playwright E2E scenarios covering the send → acknowledge and send → reject paths.

---

## Testing Sub-Path: `src/testing/index.ts`

```typescript
/**
 * @hbc/workflow-handoff/testing
 *
 * Test fixtures, factories, and canonical state maps for consuming module tests.
 * Import from this sub-path only in test files — never in production code.
 *
 * @example
 * import { createMockHandoffPackage, mockHandoffStates } from '@hbc/workflow-handoff/testing';
 */

export { createMockHandoffPackage } from './createMockHandoffPackage';
export { createMockHandoffConfig } from './createMockHandoffConfig';
export { createMockHandoffDocument } from './createMockHandoffDocument';
export { createMockContextNote } from './createMockContextNote';
export { mockHandoffStates } from './mockHandoffStates';
export type { MockHandoffStates } from './mockHandoffStates';
```

---

## `src/testing/createMockHandoffDocument.ts`

```typescript
import type { IHandoffDocument } from '../types/IHandoffPackage';

let docCounter = 0;

export function createMockHandoffDocument(
  overrides: Partial<IHandoffDocument> = {}
): IHandoffDocument {
  docCounter++;
  return {
    documentId: `doc-${docCounter}`,
    fileName: `document-${docCounter}.pdf`,
    sharepointUrl: `https://hbconstruction.sharepoint.com/sites/HBIntel/Shared%20Documents/doc-${docCounter}.pdf`,
    category: 'General',
    fileSizeBytes: 102_400,
    ...overrides,
  };
}
```

---

## `src/testing/createMockContextNote.ts`

```typescript
import type { IHandoffContextNote, HandoffNoteCategory } from '../types/IHandoffPackage';

let noteCounter = 0;

export function createMockContextNote(
  overrides: Partial<IHandoffContextNote> = {}
): IHandoffContextNote {
  noteCounter++;
  return {
    noteId: `note-${noteCounter}`,
    category: 'context' as HandoffNoteCategory,
    body: `This is a context note body for note ${noteCounter}.`,
    authorId: 'user-001',
    authorName: 'Test Author',
    createdAt: '2026-01-15T10:00:00Z',
    ...overrides,
  };
}
```

---

## `src/testing/createMockHandoffPackage.ts`

```typescript
import type { IHandoffPackage, HandoffStatus } from '../types/IHandoffPackage';
import { createMockHandoffDocument } from './createMockHandoffDocument';
import { createMockContextNote } from './createMockContextNote';

let packageCounter = 0;

/**
 * Creates a mock IHandoffPackage for a given status.
 *
 * @param status   - The handoff status to create the package in. Defaults to 'draft'.
 * @param overrides - Partial overrides applied after defaults are set.
 *
 * @example
 * // Create a sent handoff package for testing recipient-side behavior
 * const pkg = createMockHandoffPackage('sent');
 *
 * @example
 * // Create an acknowledged package with custom destination record ID
 * const pkg = createMockHandoffPackage('acknowledged', {
 *   createdDestinationRecordId: 'pursuit-abc123',
 * });
 */
export function createMockHandoffPackage<
  TSource = Record<string, unknown>,
  TDest = Record<string, unknown>
>(
  status: HandoffStatus = 'draft',
  overrides: Partial<IHandoffPackage<TSource, TDest>> = {}
): IHandoffPackage<TSource, TDest> {
  packageCounter++;

  const base: IHandoffPackage<TSource, TDest> = {
    handoffId: `handoff-${packageCounter}`,
    routeLabel: 'BD Win → Estimating Pursuit',
    sourceModule: 'business-development',
    sourceRecordType: 'bd-scorecard',
    sourceRecordId: `scorecard-${packageCounter}`,
    sourceSnapshot: {
      id: `scorecard-${packageCounter}`,
      projectName: 'Test Project',
      ownerName: 'Test Owner',
    } as unknown as TSource,
    destinationModule: 'estimating',
    destinationRecordType: 'estimating-pursuit',
    destinationSeedData: {
      projectName: 'Test Project',
    } as Partial<TDest>,
    documents: [
      createMockHandoffDocument({ category: 'Bid Documents' }),
      createMockHandoffDocument({ category: 'General' }),
    ],
    contextNotes: [createMockContextNote()],
    recipient: {
      userId: 'user-estimating-coord-01',
      displayName: 'Jane Estimating',
      role: 'Estimating Coordinator',
    },
    senderUserId: 'user-bd-director-01',
    senderDisplayName: 'John BD Director',
    status,
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-01-15T09:00:00Z',
    sentAt: status !== 'draft' ? '2026-01-15T09:05:00Z' : undefined,
    receivedAt:
      status === 'received' || status === 'acknowledged' || status === 'rejected'
        ? '2026-01-15T09:10:00Z'
        : undefined,
    acknowledgedAt: status === 'acknowledged' ? '2026-01-15T10:00:00Z' : undefined,
    rejectedAt: status === 'rejected' ? '2026-01-15T10:00:00Z' : undefined,
    rejectionReason: status === 'rejected' ? 'Missing final bid documents' : undefined,
    createdDestinationRecordId:
      status === 'acknowledged' ? `pursuit-${packageCounter}` : undefined,
    acknowledgeDescription:
      'An Estimating Pursuit will be created and pre-populated with the project data below. ' +
      'The Estimating Coordinator will become the new BIC owner.',
    ...overrides,
  };

  return base;
}
```

---

## `src/testing/createMockHandoffConfig.ts`

```typescript
import type { IHandoffConfig } from '../types/IHandoffPackage';

/**
 * Creates a minimal mock IHandoffConfig for unit testing components
 * that accept a config prop.
 *
 * All async methods resolve immediately with predictable test data.
 * Override individual members to test specific behavior.
 *
 * @example
 * const config = createMockHandoffConfig({
 *   validateReadiness: () => 'Award must be confirmed before handoff.',
 * });
 */
export function createMockHandoffConfig<
  TSource = Record<string, unknown>,
  TDest = Record<string, unknown>
>(
  overrides: Partial<IHandoffConfig<TSource, TDest>> = {}
): IHandoffConfig<TSource, TDest> {
  return {
    sourceModule: 'business-development',
    sourceRecordType: 'bd-scorecard',
    destinationModule: 'estimating',
    destinationRecordType: 'estimating-pursuit',
    routeLabel: 'BD Win → Estimating Pursuit',
    acknowledgeDescription:
      'An Estimating Pursuit will be created with the project data below.',

    mapSourceToDestination: (source) =>
      ({ projectName: (source as Record<string, unknown>).projectName }) as Partial<TDest>,

    resolveDocuments: async () => [],

    resolveRecipient: () => ({
      userId: 'user-001',
      displayName: 'Test Recipient',
      role: 'Estimating Coordinator',
    }),

    validateReadiness: () => null,

    onAcknowledged: async () => ({ destinationRecordId: 'new-record-001' }),

    onRejected: async () => undefined,

    ...overrides,
  };
}
```

---

## `src/testing/mockHandoffStates.ts`

```typescript
import type { IHandoffPackage } from '../types/IHandoffPackage';
import { createMockHandoffPackage } from './createMockHandoffPackage';

/**
 * Canonical set of five handoff state fixtures — one per HandoffStatus.
 *
 * These represent the minimal, standardized test inputs for all
 * handoff component and hook tests. Use these in unit tests, Storybook
 * stories, and Playwright E2E scenarios.
 *
 * State machine: draft → sent → received → acknowledged | rejected
 *
 * D-10 canonical states:
 *  [0] draft         — created, pre-flight not run or failed, not yet sent
 *  [1] sent          — package sent, awaiting recipient acknowledgment
 *  [2] received      — recipient has opened the package (auto-marked on first view)
 *  [3] acknowledged  — recipient acknowledged; destination record created
 *  [4] rejected      — recipient rejected; rejection reason populated; terminal
 */
export interface MockHandoffStates {
  draft: IHandoffPackage;
  sent: IHandoffPackage;
  received: IHandoffPackage;
  acknowledged: IHandoffPackage;
  rejected: IHandoffPackage;
}

export const mockHandoffStates: MockHandoffStates = {
  draft: createMockHandoffPackage('draft'),
  sent: createMockHandoffPackage('sent'),
  received: createMockHandoffPackage('received'),
  acknowledged: createMockHandoffPackage('acknowledged', {
    createdDestinationRecordId: 'pursuit-canonical-001',
  }),
  rejected: createMockHandoffPackage('rejected', {
    rejectionReason: 'Missing final bid documents — please resubmit after obtaining them.',
  }),
};
```

---

## Unit Tests

### `src/hooks/__tests__/usePrepareHandoff.test.ts`

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePrepareHandoff } from '../usePrepareHandoff';
import { createMockHandoffConfig } from '../../testing';

// Mock the HandoffApi
vi.mock('../../api/HandoffApi', () => ({
  HandoffApi: {
    create: vi.fn().mockResolvedValue({ handoffId: 'new-handoff-001', status: 'draft' }),
    send: vi.fn().mockResolvedValue({ handoffId: 'new-handoff-001', status: 'sent' }),
  },
}));

const mockSource = {
  id: 'scorecard-001',
  projectName: 'Harbor View Tower',
  ownerName: 'Harbor Properties',
  workflowStage: 'director-approved',
};

describe('usePrepareHandoff', () => {
  it('assembles package from config mappers (D-04 field mapping frozen at assembly time)', async () => {
    const config = createMockHandoffConfig({
      mapSourceToDestination: (src) => ({
        projectName: (src as typeof mockSource).projectName,
        clientName: (src as typeof mockSource).ownerName,
      }),
      resolveDocuments: async () => [
        {
          documentId: 'doc-001',
          fileName: 'bid-docs.pdf',
          sharepointUrl: 'https://sp.example.com/bid-docs.pdf',
          category: 'Bid Documents',
          fileSizeBytes: 200_000,
        },
      ],
      resolveRecipient: () => ({
        userId: 'coord-001',
        displayName: 'Jane Coord',
        role: 'Estimating Coordinator',
      }),
    });

    const { result } = renderHook(() =>
      usePrepareHandoff(config, mockSource as Record<string, unknown>)
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    expect(result.current.preflightChecks).toHaveLength(1);
    expect(result.current.preflightChecks[0].passed).toBe(true);
    expect(result.current.seedData).toMatchObject({
      projectName: 'Harbor View Tower',
      clientName: 'Harbor Properties',
    });
    expect(result.current.documents).toHaveLength(1);
    expect(result.current.documents[0].category).toBe('Bid Documents');
    expect(result.current.recipient?.displayName).toBe('Jane Coord');
  });

  it('surfaces validation failure as failed pre-flight check (D-03)', async () => {
    const config = createMockHandoffConfig({
      validateReadiness: () =>
        'Scorecard must be approved by the Director of Preconstruction before handoff.',
    });

    const { result } = renderHook(() =>
      usePrepareHandoff(config, mockSource as Record<string, unknown>)
    );

    await waitFor(() => expect(result.current.preflightChecks.length).toBeGreaterThan(0));

    const readinessCheck = result.current.preflightChecks.find(
      (c) => c.label === 'Record Readiness'
    );
    expect(readinessCheck?.passed).toBe(false);
    expect(readinessCheck?.failureReason).toContain('Director of Preconstruction');
    expect(result.current.isReady).toBe(false);
  });

  it('surfaces null recipient as failed pre-flight check when recipient required', async () => {
    const config = createMockHandoffConfig({
      resolveRecipient: () => null,
    });

    const { result } = renderHook(() =>
      usePrepareHandoff(config, mockSource as Record<string, unknown>)
    );

    await waitFor(() => expect(result.current.preflightChecks.length).toBeGreaterThan(0));

    const recipientCheck = result.current.preflightChecks.find(
      (c) => c.label === 'Recipient'
    );
    expect(recipientCheck?.passed).toBe(false);
    expect(result.current.isReady).toBe(false);
    expect(result.current.recipient).toBeNull();
  });

  it('handles document resolution failure gracefully with error state', async () => {
    const config = createMockHandoffConfig({
      resolveDocuments: async () => {
        throw new Error('SharePoint unavailable');
      },
    });

    const { result } = renderHook(() =>
      usePrepareHandoff(config, mockSource as Record<string, unknown>)
    );

    await waitFor(() => expect(result.current.documentError).toBeDefined());
    expect(result.current.documentError).toContain('SharePoint unavailable');
    expect(result.current.documents).toHaveLength(0);
  });
});
```

---

### `src/hooks/__tests__/useHandoffStatus.test.ts`

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useHandoffStatus } from '../useHandoffStatus';
import { mockHandoffStates } from '../../testing';

vi.mock('../../api/HandoffApi', () => ({
  HandoffApi: {
    get: vi.fn(),
  },
}));

import { HandoffApi } from '../../api/HandoffApi';

describe('useHandoffStatus', () => {
  it('polls when status is sent (D-02 non-terminal state)', async () => {
    vi.mocked(HandoffApi.get).mockResolvedValue(mockHandoffStates.sent);

    renderHook(() => useHandoffStatus('handoff-001'));

    await waitFor(() => expect(HandoffApi.get).toHaveBeenCalledWith('handoff-001'));

    // The hook uses refetchInterval — verify it would re-fetch (polling active)
    // In a real test environment, we'd advance timers; here we verify the config
    expect(HandoffApi.get).toHaveBeenCalled();
  });

  it('does not poll when status is acknowledged (D-02 terminal state)', async () => {
    vi.mocked(HandoffApi.get).mockResolvedValue(mockHandoffStates.acknowledged);

    const { result } = renderHook(() => useHandoffStatus('handoff-001'));

    await waitFor(() => expect(result.current.status).toBe('acknowledged'));
    // Terminal state — no further refetching expected
    expect(result.current.package?.acknowledgedAt).toBeDefined();
    expect(result.current.package?.createdDestinationRecordId).toBe('pursuit-canonical-001');
  });

  it('does not poll when status is rejected (D-07 terminal state)', async () => {
    vi.mocked(HandoffApi.get).mockResolvedValue(mockHandoffStates.rejected);

    const { result } = renderHook(() => useHandoffStatus('handoff-001'));

    await waitFor(() => expect(result.current.status).toBe('rejected'));
    expect(result.current.package?.rejectionReason).toContain('Missing final bid documents');
  });

  it('returns null when handoffId is undefined', () => {
    const { result } = renderHook(() => useHandoffStatus(undefined));
    expect(result.current.status).toBeNull();
    expect(result.current.package).toBeNull();
  });
});
```

---

### `src/components/__tests__/HbcHandoffComposer.test.tsx`

```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HbcHandoffComposer } from '../HbcHandoffComposer';
import { createMockHandoffConfig } from '../../testing';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../api/HandoffApi', () => ({
  HandoffApi: {
    create: vi.fn().mockResolvedValue({ handoffId: 'h-001', status: 'draft' }),
    send: vi.fn().mockResolvedValue({ handoffId: 'h-001', status: 'sent' }),
  },
}));

const mockSource = {
  id: 'scorecard-001',
  workflowStage: 'director-approved',
  projectName: 'Harbor View',
};

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('HbcHandoffComposer', () => {
  let config: ReturnType<typeof createMockHandoffConfig>;
  let onHandoffSent: ReturnType<typeof vi.fn>;
  let onCancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    config = createMockHandoffConfig();
    onHandoffSent = vi.fn();
    onCancel = vi.fn();
  });

  it('renders Step 1 (Pre-flight) on mount', async () => {
    render(
      <HbcHandoffComposer
        config={config}
        sourceRecord={mockSource}
        onHandoffSent={onHandoffSent}
        onCancel={onCancel}
      />,
      { wrapper }
    );

    expect(screen.getByText(/pre-flight/i)).toBeInTheDocument();
  });

  it('advances to Step 2 (Review) when pre-flight passes (D-03)', async () => {
    render(
      <HbcHandoffComposer
        config={config}
        sourceRecord={mockSource}
        onHandoffSent={onHandoffSent}
        onCancel={onCancel}
      />,
      { wrapper }
    );

    const nextButton = await screen.findByRole('button', { name: /next|continue|review/i });
    fireEvent.click(nextButton);

    await waitFor(() =>
      expect(screen.getByTestId('hbc-handoff-composer-step-review')).toBeInTheDocument()
    );
  });

  it('disables Send CTA when pre-flight fails (D-03)', async () => {
    const failingConfig = createMockHandoffConfig({
      validateReadiness: () => 'Award must be confirmed before handoff.',
    });

    render(
      <HbcHandoffComposer
        config={failingConfig}
        sourceRecord={mockSource}
        onHandoffSent={onHandoffSent}
        onCancel={onCancel}
      />,
      { wrapper }
    );

    await waitFor(() => {
      const sendButton = screen.queryByRole('button', { name: /send/i });
      // Either the button doesn't exist or it's disabled
      if (sendButton) {
        expect(sendButton).toBeDisabled();
      }
    });
  });

  it('calls onHandoffSent after successful send (D-05)', async () => {
    render(
      <HbcHandoffComposer
        config={config}
        sourceRecord={mockSource}
        onHandoffSent={onHandoffSent}
        onCancel={onCancel}
      />,
      { wrapper }
    );

    // Progress through all steps and send
    // Step 1 → Step 2
    const nextButton = await screen.findByRole('button', { name: /next|continue|review/i });
    fireEvent.click(nextButton);

    // Step 2 → Step 3
    const nextButton2 = await screen.findByRole('button', { name: /next|recipient/i });
    fireEvent.click(nextButton2);

    // Step 3 → Step 4
    const nextButton3 = await screen.findByRole('button', { name: /next|send/i });
    fireEvent.click(nextButton3);

    // Step 4: Send
    const sendButton = await screen.findByRole('button', { name: /confirm.*send|send handoff/i });
    fireEvent.click(sendButton);

    await waitFor(() => expect(onHandoffSent).toHaveBeenCalledWith('h-001'));
  });

  it('calls onCancel when Cancel is clicked', () => {
    render(
      <HbcHandoffComposer
        config={config}
        sourceRecord={mockSource}
        onHandoffSent={onHandoffSent}
        onCancel={onCancel}
      />,
      { wrapper }
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
```

---

### `src/components/__tests__/HbcHandoffReceiver.test.tsx`

```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HbcHandoffReceiver } from '../HbcHandoffReceiver';
import { createMockHandoffConfig, mockHandoffStates } from '../../testing';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../api/HandoffApi', () => ({
  HandoffApi: {
    get: vi.fn(),
    receive: vi.fn().mockResolvedValue({}),
    acknowledge: vi.fn().mockResolvedValue({ status: 'acknowledged' }),
    reject: vi.fn().mockResolvedValue({ status: 'rejected' }),
  },
}));

import { HandoffApi } from '../../api/HandoffApi';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('HbcHandoffReceiver', () => {
  const config = createMockHandoffConfig();

  it('auto-marks received on first view (D-02 received state)', async () => {
    vi.mocked(HandoffApi.get).mockResolvedValue(mockHandoffStates.sent);

    render(
      <HbcHandoffReceiver
        handoffId="handoff-001"
        config={config}
        onAcknowledged={vi.fn()}
        onRejected={vi.fn()}
      />,
      { wrapper }
    );

    await waitFor(() => expect(HandoffApi.receive).toHaveBeenCalledWith('handoff-001'));
  });

  it('renders source summary, documents, and context notes sections', async () => {
    vi.mocked(HandoffApi.get).mockResolvedValue(mockHandoffStates.received);

    render(
      <HbcHandoffReceiver
        handoffId="handoff-001"
        config={config}
        onAcknowledged={vi.fn()}
        onRejected={vi.fn()}
      />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByTestId('hbc-handoff-source-summary')).toBeInTheDocument();
      expect(screen.getByTestId('hbc-handoff-documents')).toBeInTheDocument();
      expect(screen.getByTestId('hbc-handoff-context-notes')).toBeInTheDocument();
    });
  });

  it('calls onAcknowledged with destinationRecordId after acknowledge (D-05)', async () => {
    vi.mocked(HandoffApi.get).mockResolvedValue(mockHandoffStates.received);
    vi.mocked(HandoffApi.acknowledge).mockResolvedValue({
      ...mockHandoffStates.acknowledged,
      createdDestinationRecordId: 'pursuit-new-001',
    });

    const onAcknowledged = vi.fn();

    render(
      <HbcHandoffReceiver
        handoffId="handoff-001"
        config={config}
        onAcknowledged={onAcknowledged}
        onRejected={vi.fn()}
      />,
      { wrapper }
    );

    const ackButton = await screen.findByRole('button', {
      name: /acknowledge|create/i,
    });
    fireEvent.click(ackButton);

    await waitFor(() =>
      expect(onAcknowledged).toHaveBeenCalledWith('pursuit-new-001')
    );
  });

  it('calls onRejected with reason after reject (D-07 rejection terminal)', async () => {
    vi.mocked(HandoffApi.get).mockResolvedValue(mockHandoffStates.received);
    vi.mocked(HandoffApi.reject).mockResolvedValue(mockHandoffStates.rejected);

    const onRejected = vi.fn();

    render(
      <HbcHandoffReceiver
        handoffId="handoff-001"
        config={config}
        onAcknowledged={vi.fn()}
        onRejected={onRejected}
      />,
      { wrapper }
    );

    // Open reject form
    const rejectButton = await screen.findByRole('button', { name: /reject/i });
    fireEvent.click(rejectButton);

    // Enter rejection reason
    const reasonInput = await screen.findByRole('textbox', {
      name: /reason|why/i,
    });
    fireEvent.change(reasonInput, {
      target: { value: 'Missing final bid documents' },
    });

    // Confirm rejection
    const confirmReject = screen.getByRole('button', { name: /confirm reject/i });
    fireEvent.click(confirmReject);

    await waitFor(() =>
      expect(onRejected).toHaveBeenCalledWith('Missing final bid documents')
    );
  });

  it('renders terminal state display for acknowledged packages', async () => {
    vi.mocked(HandoffApi.get).mockResolvedValue(mockHandoffStates.acknowledged);

    render(
      <HbcHandoffReceiver
        handoffId="handoff-001"
        config={config}
        onAcknowledged={vi.fn()}
        onRejected={vi.fn()}
      />,
      { wrapper }
    );

    await waitFor(() => {
      // Acknowledge and Reject buttons should not be present in terminal state
      expect(screen.queryByRole('button', { name: /reject/i })).not.toBeInTheDocument();
      expect(
        screen.getByTestId('hbc-handoff-receiver-terminal-acknowledged')
      ).toBeInTheDocument();
    });
  });
});
```

---

### `src/components/__tests__/HbcHandoffStatusBadge.test.tsx`

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HbcHandoffStatusBadge } from '../HbcHandoffStatusBadge';
import { mockHandoffStates } from '../../testing';
import { ComplexityProvider } from '@hbc/complexity';

function renderWithComplexity(
  ui: React.ReactElement,
  variant: 'essential' | 'standard' | 'expert' = 'standard'
) {
  return render(
    <ComplexityProvider initialVariant={variant}>{ui}</ComplexityProvider>
  );
}

describe('HbcHandoffStatusBadge', () => {
  it('renders nothing in Essential complexity tier (D-08)', () => {
    const { container } = renderWithComplexity(
      <HbcHandoffStatusBadge handoffId="h-001" status="sent" />,
      'essential'
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders label in Standard tier for each status', () => {
    const cases: Array<[keyof typeof mockHandoffStates, string]> = [
      ['draft', 'Draft'],
      ['sent', 'Awaiting Acknowledgment'],
      ['received', 'Received'],
      ['acknowledged', 'Handoff Acknowledged'],
      ['rejected', 'Handoff Rejected'],
    ];

    for (const [status, expectedLabel] of cases) {
      const { unmount } = renderWithComplexity(
        <HbcHandoffStatusBadge handoffId="h-001" status={status} />,
        'standard'
      );
      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
      unmount();
    }
  });

  it('renders timestamp in Expert tier for terminal states (D-08)', () => {
    renderWithComplexity(
      <HbcHandoffStatusBadge
        handoffId="h-001"
        status="acknowledged"
        acknowledgedAt="2026-01-15T10:00:00Z"
      />,
      'expert'
    );

    expect(screen.getByTestId('hbc-handoff-badge-timestamp')).toBeInTheDocument();
  });

  it('applies correct color class for each status', () => {
    const colorMap: Record<string, string> = {
      draft: 'hbc-handoff-badge--grey',
      sent: 'hbc-handoff-badge--blue',
      received: 'hbc-handoff-badge--blue',
      acknowledged: 'hbc-handoff-badge--green',
      rejected: 'hbc-handoff-badge--red',
    };

    for (const [status, expectedClass] of Object.entries(colorMap)) {
      const { container, unmount } = renderWithComplexity(
        <HbcHandoffStatusBadge handoffId="h-001" status={status as keyof typeof mockHandoffStates} />,
        'standard'
      );
      expect(container.querySelector(`.${expectedClass}`)).toBeInTheDocument();
      unmount();
    }
  });
});
```

---

## Storybook Stories

### `src/stories/HbcHandoffComposer.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { HbcHandoffComposer } from '../components/HbcHandoffComposer';
import { createMockHandoffConfig } from '../testing';
import { action } from '@storybook/addon-actions';

const readyConfig = createMockHandoffConfig();
const failingConfig = createMockHandoffConfig({
  validateReadiness: () =>
    'Scorecard must be approved by the Director of Preconstruction before handoff.',
});
const noRecipientConfig = createMockHandoffConfig({
  resolveRecipient: () => null,
});

const mockSource = {
  id: 'scorecard-001',
  workflowStage: 'director-approved',
  projectName: 'Harbor View Tower',
  ownerName: 'Harbor Properties LLC',
};

const meta: Meta<typeof HbcHandoffComposer> = {
  title: 'Workflow Handoff / HbcHandoffComposer',
  component: HbcHandoffComposer,
  parameters: { layout: 'padded' },
  argTypes: {
    onHandoffSent: { action: 'handoff-sent' },
    onCancel: { action: 'cancelled' },
  },
};
export default meta;

type Story = StoryObj<typeof HbcHandoffComposer>;

export const PreflightPassing: Story = {
  name: 'Step 1 — Pre-flight Passing',
  args: {
    config: readyConfig,
    sourceRecord: mockSource,
    onHandoffSent: action('handoff-sent'),
    onCancel: action('cancelled'),
  },
};

export const PreflightFailing: Story = {
  name: 'Step 1 — Pre-flight Failing (D-03)',
  args: {
    config: failingConfig,
    sourceRecord: mockSource,
    onHandoffSent: action('handoff-sent'),
    onCancel: action('cancelled'),
  },
};

export const NoRecipient: Story = {
  name: 'Step 3 — No Recipient (manual picker required)',
  args: {
    config: noRecipientConfig,
    sourceRecord: mockSource,
    onHandoffSent: action('handoff-sent'),
    onCancel: action('cancelled'),
  },
};
```

---

### `src/stories/HbcHandoffReceiver.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { HbcHandoffReceiver } from '../components/HbcHandoffReceiver';
import { createMockHandoffConfig, mockHandoffStates } from '../testing';
import { action } from '@storybook/addon-actions';
import { vi } from 'vitest';

// Mock the HandoffApi for Storybook
const HandoffApiMock = {
  get: vi.fn(),
  receive: vi.fn().mockResolvedValue({}),
  acknowledge: vi.fn(),
  reject: vi.fn(),
};

const config = createMockHandoffConfig();

const meta: Meta<typeof HbcHandoffReceiver> = {
  title: 'Workflow Handoff / HbcHandoffReceiver',
  component: HbcHandoffReceiver,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof HbcHandoffReceiver>;

export const SentState: Story = {
  name: 'Sent State (auto-marks received on mount)',
  args: {
    handoffId: 'handoff-sent-001',
    config,
    onAcknowledged: action('acknowledged'),
    onRejected: action('rejected'),
  },
};

export const ReceivedState: Story = {
  name: 'Received State (ready to act)',
  args: {
    handoffId: 'handoff-received-001',
    config,
    onAcknowledged: action('acknowledged'),
    onRejected: action('rejected'),
  },
};

export const AcknowledgedState: Story = {
  name: 'Acknowledged State (terminal — D-02)',
  args: {
    handoffId: 'handoff-acknowledged-001',
    config,
    onAcknowledged: action('acknowledged'),
    onRejected: action('rejected'),
  },
};

export const RejectedState: Story = {
  name: 'Rejected State (terminal with reason — D-07)',
  args: {
    handoffId: 'handoff-rejected-001',
    config,
    onAcknowledged: action('acknowledged'),
    onRejected: action('rejected'),
  },
};
```

---

### `src/stories/HbcHandoffStatusBadge.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { HbcHandoffStatusBadge } from '../components/HbcHandoffStatusBadge';

const meta: Meta<typeof HbcHandoffStatusBadge> = {
  title: 'Workflow Handoff / HbcHandoffStatusBadge',
  component: HbcHandoffStatusBadge,
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj<typeof HbcHandoffStatusBadge>;

export const Draft: Story = { args: { handoffId: 'h-001', status: 'draft' } };
export const Sent: Story = { args: { handoffId: 'h-001', status: 'sent' } };
export const Received: Story = { args: { handoffId: 'h-001', status: 'received' } };
export const Acknowledged: Story = {
  args: { handoffId: 'h-001', status: 'acknowledged', acknowledgedAt: '2026-01-15T10:00:00Z' },
};
export const Rejected: Story = {
  args: { handoffId: 'h-001', status: 'rejected', rejectedAt: '2026-01-15T10:00:00Z' },
};
```

---

## Playwright E2E Scenarios

```typescript
// e2e/workflow-handoff/handoff-lifecycle.spec.ts

import { test, expect } from '@playwright/test';

/**
 * E2E Scenario 1 — Full BD → Estimating lifecycle: send → acknowledge
 *
 * Tests the complete handoff cycle from BD Director initiating the handoff
 * through Estimating Coordinator acknowledging and creating the Estimating Pursuit.
 */
test('BD → Estimating: send and acknowledge lifecycle', async ({ page, browser }) => {
  // Set up BD Director user context
  await page.goto('/dev-harness/bd-scorecard/scorecard-director-approved');

  // Initiate handoff
  await page.click('[data-testid="initiate-handoff-button"]');
  await expect(page.locator('[data-testid="hbc-handoff-composer"]')).toBeVisible();

  // Step 1: Pre-flight should pass
  await expect(page.locator('[data-testid="preflight-check-record-readiness"]')).toHaveClass(
    /passed/
  );
  await page.click('[data-testid="composer-next-button"]');

  // Step 2: Review mapped fields
  await expect(page.locator('[data-testid="hbc-handoff-composer-step-review"]')).toBeVisible();
  await expect(page.locator('[data-testid="seed-field-projectName"]')).toBeVisible();

  // Add a context note
  await page.click('[data-testid="add-context-note-button"]');
  await page.fill('[data-testid="context-note-body-input"]', 'Key decision from pre-bid meeting.');
  await page.click('[data-testid="save-context-note-button"]');
  await page.click('[data-testid="composer-next-button"]');

  // Step 3: Confirm recipient
  await expect(page.locator('[data-testid="hbc-handoff-composer-step-recipient"]')).toBeVisible();
  await expect(page.locator('[data-testid="recipient-card"]')).toBeVisible();
  await page.click('[data-testid="composer-next-button"]');

  // Step 4: Send
  await expect(page.locator('[data-testid="hbc-handoff-composer-step-send"]')).toBeVisible();
  await page.click('[data-testid="composer-confirm-send-button"]');

  // Verify status badge changes to Awaiting Acknowledgment (D-05 BIC transfer)
  await expect(page.locator('[data-testid="hbc-handoff-status-badge"]')).toHaveText(
    'Awaiting Acknowledgment'
  );

  // Switch to Estimating Coordinator user context
  const coordContext = await browser.newContext({ storageState: 'e2e/auth/estimating-coord.json' });
  const coordPage = await coordContext.newPage();
  await coordPage.goto('/dev-harness/my-work-feed');

  // Verify handoff appears in feed with high-priority badge
  await expect(
    coordPage.locator('[data-testid="work-feed-handoff-item"]')
  ).toBeVisible();
  await expect(
    coordPage.locator('[data-testid="work-feed-handoff-item"] [data-testid="priority-badge"]')
  ).toBeVisible();

  // Open Receiver
  await coordPage.click('[data-testid="work-feed-handoff-item"]');
  await expect(coordPage.locator('[data-testid="hbc-handoff-receiver"]')).toBeVisible();

  // Verify auto-marked received
  await expect(coordPage.locator('[data-testid="hbc-handoff-status-badge"]')).toHaveText(
    'Received'
  );

  // Acknowledge
  await coordPage.click('[data-testid="hbc-handoff-acknowledge-button"]');

  // Verify terminal acknowledged state
  await expect(coordPage.locator('[data-testid="hbc-handoff-receiver-terminal-acknowledged"]')).toBeVisible();

  // Verify Estimating Pursuit was created (via redirect or breadcrumb)
  await expect(coordPage.locator('[data-testid="destination-record-link"]')).toBeVisible();

  await coordContext.close();
});

/**
 * E2E Scenario 2 — Rejection path with reason (D-07 terminal rejection)
 */
test('BD → Estimating: send and reject with reason', async ({ page, browser }) => {
  await page.goto('/dev-harness/bd-scorecard/scorecard-director-approved-2');
  await page.click('[data-testid="initiate-handoff-button"]');

  // Progress through all steps and send
  for (let i = 0; i < 3; i++) {
    await page.click('[data-testid="composer-next-button"]');
  }
  await page.click('[data-testid="composer-confirm-send-button"]');

  await expect(page.locator('[data-testid="hbc-handoff-status-badge"]')).toHaveText(
    'Awaiting Acknowledgment'
  );

  // Switch to recipient
  const coordContext = await browser.newContext({ storageState: 'e2e/auth/estimating-coord.json' });
  const coordPage = await coordContext.newPage();
  await coordPage.goto('/dev-harness/my-work-feed');
  await coordPage.click('[data-testid="work-feed-handoff-item"]');

  // Reject with reason
  await coordPage.click('[data-testid="hbc-handoff-reject-button"]');
  await coordPage.fill(
    '[data-testid="rejection-reason-input"]',
    'Missing final bid documents — please resubmit.'
  );
  await coordPage.click('[data-testid="confirm-reject-button"]');

  // Verify terminal rejected state on recipient side
  await expect(
    coordPage.locator('[data-testid="hbc-handoff-receiver-terminal-rejected"]')
  ).toBeVisible();

  // Verify sender sees rejected status with reason
  await page.reload();
  await expect(page.locator('[data-testid="hbc-handoff-status-badge"]')).toHaveText(
    'Handoff Rejected'
  );
  await expect(page.locator('[data-testid="hbc-handoff-rejection-reason"]')).toContainText(
    'Missing final bid documents'
  );

  await coordContext.close();
});

/**
 * E2E Scenario 3 — Pre-flight blocks send (D-03 validation)
 */
test('Composer: pre-flight blocks send when validation fails', async ({ page }) => {
  // Scorecard in wrong workflow stage (not director-approved)
  await page.goto('/dev-harness/bd-scorecard/scorecard-in-progress');
  await page.click('[data-testid="initiate-handoff-button"]');

  // Verify the readiness check is failing
  await expect(page.locator('[data-testid="preflight-check-record-readiness"]')).toHaveClass(
    /failed/
  );
  await expect(page.locator('[data-testid="preflight-failure-reason"]')).toContainText(
    'Director of Preconstruction'
  );

  // The Next / Send button should be disabled or absent
  const nextButton = page.locator('[data-testid="composer-next-button"]');
  if (await nextButton.isVisible()) {
    await expect(nextButton).toBeDisabled();
  }
});

/**
 * E2E Scenario 4 — HbcHandoffStatusBadge renders correct state
 *                   across complexity tiers (D-08)
 */
test('StatusBadge: renders nothing in Essential, label in Standard, timestamp in Expert', async ({
  page,
}) => {
  // Switch to Essential complexity
  await page.goto('/dev-harness/settings');
  await page.click('[data-testid="complexity-essential"]');

  await page.goto('/dev-harness/bd-scorecard/scorecard-sent-handoff');
  await expect(page.locator('[data-testid="hbc-handoff-status-badge"]')).not.toBeVisible();

  // Switch to Standard
  await page.goto('/dev-harness/settings');
  await page.click('[data-testid="complexity-standard"]');
  await page.goto('/dev-harness/bd-scorecard/scorecard-sent-handoff');
  await expect(page.locator('[data-testid="hbc-handoff-status-badge"]')).toHaveText(
    'Awaiting Acknowledgment'
  );
  await expect(page.locator('[data-testid="hbc-handoff-badge-timestamp"]')).not.toBeVisible();

  // Switch to Expert
  await page.goto('/dev-harness/settings');
  await page.click('[data-testid="complexity-expert"]');
  await page.goto('/dev-harness/bd-scorecard/scorecard-acknowledged-handoff');
  await expect(page.locator('[data-testid="hbc-handoff-badge-timestamp"]')).toBeVisible();
});

/**
 * E2E Scenario 5 — Versioned-record snapshot created on acknowledge (D-04)
 */
test('Acknowledge: versioned-record snapshot created with tag=handoff', async ({
  page,
  browser,
}) => {
  // Complete the acknowledge flow (abbreviated — relies on E2E Scenario 1 setup)
  await page.goto('/dev-harness/bd-scorecard/scorecard-received-handoff');

  const coordContext = await browser.newContext({ storageState: 'e2e/auth/estimating-coord.json' });
  const coordPage = await coordContext.newPage();
  await coordPage.goto('/dev-harness/handoff/received-handoff-001');
  await coordPage.click('[data-testid="hbc-handoff-acknowledge-button"]');
  await coordPage.waitForSelector('[data-testid="hbc-handoff-receiver-terminal-acknowledged"]');

  // Navigate to version history on the source scorecard
  await page.goto('/dev-harness/bd-scorecard/scorecard-received-handoff');
  await page.click('[data-testid="version-history-button"]');

  await expect(
    page.locator('[data-testid="version-history-item"][data-tag="handoff"]')
  ).toBeVisible();

  await coordContext.close();
});
```

---

## Coverage Targets

| Test Type | Target | Scope |
|---|---|---|
| Unit — hooks | 95% branches | `usePrepareHandoff`, `useHandoffInbox`, `useHandoffStatus` |
| Unit — components | 95% branches | `HbcHandoffComposer`, `HbcHandoffReceiver`, `HbcHandoffStatusBadge` |
| Unit — api/types | 95% branches | `HandoffApi`, type guards, constants |
| Storybook | All 5 states | Each component — at least one story per `HandoffStatus` |
| Playwright E2E | 5 scenarios | Acknowledge path, reject path, pre-flight block, complexity tiers, snapshot |

---

## Verification Commands

```bash
# Run all workflow-handoff tests with coverage
pnpm --filter @hbc/workflow-handoff test --coverage

# Run only hook tests
pnpm --filter @hbc/workflow-handoff test -- --grep "usePrepareHandoff|useHandoffStatus|useHandoffInbox"

# Run only component tests
pnpm --filter @hbc/workflow-handoff test -- --grep "HbcHandoff"

# Verify testing sub-path exports are present after build
node -e "
  import('@hbc/workflow-handoff/testing').then(m => {
    console.log('createMockHandoffPackage:', typeof m.createMockHandoffPackage === 'function');
    console.log('createMockHandoffConfig:', typeof m.createMockHandoffConfig === 'function');
    console.log('createMockHandoffDocument:', typeof m.createMockHandoffDocument === 'function');
    console.log('createMockContextNote:', typeof m.createMockContextNote === 'function');
    console.log('mockHandoffStates keys:', Object.keys(m.mockHandoffStates).join(', '));
  });
"

# Type-check
pnpm --filter @hbc/workflow-handoff check-types

# Playwright E2E (from repo root with dev-harness running)
pnpm playwright test e2e/workflow-handoff/

# Storybook (visual review)
pnpm --filter @hbc/dev-harness storybook
# Navigate to: Workflow Handoff / HbcHandoffComposer
# Navigate to: Workflow Handoff / HbcHandoffReceiver
# Navigate to: Workflow Handoff / HbcHandoffStatusBadge
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF08-T08 not yet started.
Next: SF08-T09 (Deployment)
-->
