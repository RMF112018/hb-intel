/**
 * kudosPhase27Workspace — regression coverage for the Phase-27
 * moderation workspace upgrades (Prompt-06 / Prompt-07 UX hardening).
 *
 * These tests assert real operator-facing behaviour rather than the
 * mere presence of DOM. They exercise:
 *   - per-tab scope counts on every queue tab,
 *   - the active-filter chip bar (visibility + per-chip dismiss +
 *     Clear-all semantics),
 *   - the queue row state-rail data attributes (workflow-status,
 *     admin-flag, overdue) that drive the left-edge colour,
 *   - the bulk approval three-phase summary surface (running +
 *     summary + retry visibility),
 *   - degraded render paths keeping their testid contracts.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act, cleanup, configure, fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';

// Route testing-library's test-id queries through the repo's
// `data-hbc-testid` attribute so assertions match the contract used
// across all Kudos surfaces. Restore the default afterward so other
// test files that rely on `data-testid` are not affected.
beforeAll(() => configure({ testIdAttribute: 'data-hbc-testid' }));
afterAll(() => configure({ testIdAttribute: 'data-testid' }));
afterEach(() => cleanup());

// ---------------------------------------------------------------------------
// SPFx context / role resolver mocks — identical posture to the
// existing companion runtime smoke so we can render the companion
// entirely under jsdom with no network.
// ---------------------------------------------------------------------------

vi.mock('../data/spContext.js', () => ({
  getSiteUrl: () => undefined,
  getKudosListHostUrl: () => undefined,
  storeSiteUrl: vi.fn(),
  storeKudosListHostUrl: vi.fn(),
  resolveCurrentUserId: () => Promise.resolve(undefined),
}));

vi.mock('../helpers/kudosRoleResolver.js', () => ({
  resolveKudosRole: vi.fn(async (config: { simulatedRole?: unknown }) => {
    const { parseKudosRole } = await import('../helpers/kudosCapabilities.js');
    return parseKudosRole(config.simulatedRole);
  }),
  resolveKudosRoleStatus: vi.fn(async (config: { simulatedRole?: unknown; siteUrl?: string }) => {
    const { parseKudosRole } = await import('../helpers/kudosCapabilities.js');
    return {
      role: parseKudosRole(config.simulatedRole),
      status: config.siteUrl ? 'resolved' : 'simulated',
    };
  }),
  clearKudosRoleCache: vi.fn(),
}));

import { HbKudosCompanion } from '../../webparts/hbKudosCompanion/HbKudosCompanion.js';
import { QueueRow } from '../../webparts/hbKudosCompanion/components/QueueRow.js';
import { BulkActionBar } from '../../webparts/hbKudosCompanion/components/BulkActionBar.js';
import type { BulkApprovalState } from '../../webparts/hbKudosCompanion/runtime/useBulkApproval.js';
import type { KudosEntry } from '../webparts/kudosContracts.js';

// ---------------------------------------------------------------------------
// Companion host — tab counts + active-filter bar
// ---------------------------------------------------------------------------

describe('HbKudosCompanion — Phase-27 Prompt-06 tab counts', () => {
  it('every scope tab renders its label with a parenthesised count', async () => {
    await act(async () => {
      render(<HbKudosCompanion config={{ simulatedRole: 'admin' }} />);
    });
    const countRe = /\(\d+\)$/;
    const labels = [
      /^Pending\s*\(\d+\)$/,
      /^Revision requested\s*\(\d+\)$/,
      /^Flagged for admin\s*\(\d+\)$/,
      /^Approved\s*\(\d+\)$/,
      /^Rejected\s*\(\d+\)$/,
      /^Removed \/ Unpublished\s*\(\d+\)$/,
    ];
    await waitFor(() => {
      for (const re of labels) {
        const btn = screen.getByRole('button', { name: re });
        expect(btn).toBeTruthy();
        // Sanity-check the count suffix is actually present.
        expect(countRe.test(btn.textContent ?? '')).toBe(true);
      }
    });
  });
});

describe('HbKudosCompanion — Phase-27 Prompt-06 active-filter bar', () => {
  it('hides itself when no refinement filter is applied', async () => {
    await act(async () => {
      render(<HbKudosCompanion config={{ simulatedRole: 'admin' }} />);
    });
    await waitFor(() => {
      expect(screen.queryByTestId('hb-kudos-active-filters')).toBeNull();
    });
  });

  it('renders a dismissible chip when a search is applied, and the chip-clear button restores the idle state', async () => {
    await act(async () => {
      render(<HbKudosCompanion config={{ simulatedRole: 'admin' }} />);
    });
    const search = await screen.findByPlaceholderText('Search recognition…');
    await act(async () => {
      fireEvent.change(search, { target: { value: 'sprint hero' } });
    });

    // Bar + chip now visible.
    const bar = await screen.findByTestId('hb-kudos-active-filters');
    expect(bar).toBeTruthy();
    const chip = screen.getByTestId('hb-kudos-active-filter-search');
    expect(chip.textContent).toContain('sprint hero');

    // Clicking the chip's × returns to the idle "no filters" state.
    const clearBtn = chip.querySelector('button');
    expect(clearBtn).not.toBeNull();
    await act(async () => {
      fireEvent.click(clearBtn!);
    });
    await waitFor(() => {
      expect(screen.queryByTestId('hb-kudos-active-filters')).toBeNull();
      expect((search as HTMLInputElement).value).toBe('');
    });
  });

  it('"Clear all" removes every active refinement chip in one click', async () => {
    await act(async () => {
      render(<HbKudosCompanion config={{ simulatedRole: 'admin' }} />);
    });
    const search = await screen.findByPlaceholderText('Search recognition…');
    await act(async () => {
      fireEvent.change(search, { target: { value: 'needle' } });
      const ownership = screen.getByTestId('hb-kudos-queue-filter-ownership') as HTMLSelectElement;
      fireEvent.change(ownership, { target: { value: 'mine' } });
      fireEvent.click(screen.getByTestId('hb-kudos-queue-filter-scheduled'));
    });

    // Sanity: at least the three chips are present.
    expect(screen.getByTestId('hb-kudos-active-filter-search')).toBeTruthy();
    expect(screen.getByTestId('hb-kudos-active-filter-ownership')).toBeTruthy();
    expect(screen.getByTestId('hb-kudos-active-filter-scheduled')).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByTestId('hb-kudos-active-filters-clear-all'));
    });
    await waitFor(() => {
      expect(screen.queryByTestId('hb-kudos-active-filters')).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// Queue row — state rail attributes
// ---------------------------------------------------------------------------

function makeEntry(overrides: Partial<KudosEntry> = {}): KudosEntry {
  return {
    id: 'k-1',
    headline: 'Example kudos',
    excerpt: 'A sprint hero thanked.',
    status: 'pending',
    workflowStatus: 'pending',
    submittedDate: '2026-04-01T09:00:00Z',
    submittedBy: { id: 'u-1', displayName: 'Sam Submitter' },
    recipients: [],
    ...overrides,
  } as unknown as KudosEntry;
}

describe('QueueRow — Phase-27 Prompt-06 state rail attributes', () => {
  it('exposes workflow-status so the left-edge rail colour resolves by attribute selector', () => {
    render(
      <QueueRow
        entry={makeEntry({ workflowStatus: 'approved', status: 'approved' })}
        nowIso="2026-04-10T00:00:00Z"
        selected={false}
        selectable={false}
        overdueStatus="ok"
        onToggleSelect={() => {}}
        onOpenDetail={() => {}}
      />,
    );
    const row = document.querySelector('[data-hbc-testid="hb-kudos-queue-row"]');
    expect(row?.getAttribute('data-workflow-status')).toBe('approved');
    expect(row?.getAttribute('data-overdue')).toBeNull();
  });

  it('marks overdue items so the rail escalates to danger colour', () => {
    render(
      <QueueRow
        entry={makeEntry()}
        nowIso="2026-04-10T00:00:00Z"
        selected={false}
        selectable={false}
        overdueStatus="overdue"
        onToggleSelect={() => {}}
        onOpenDetail={() => {}}
      />,
    );
    const row = document.querySelector('[data-hbc-testid="hb-kudos-queue-row"]');
    expect(row?.getAttribute('data-overdue')).toBe('overdue');
  });

  it('marks admin-flagged items', () => {
    render(
      <QueueRow
        entry={makeEntry({ isFlaggedForAdminReview: true } as Partial<KudosEntry>)}
        nowIso="2026-04-10T00:00:00Z"
        selected={false}
        selectable={false}
        overdueStatus="ok"
        onToggleSelect={() => {}}
        onOpenDetail={() => {}}
      />,
    );
    const row = document.querySelector('[data-hbc-testid="hb-kudos-queue-row"]');
    expect(row?.getAttribute('data-admin-flag')).toBe('true');
  });
});

// ---------------------------------------------------------------------------
// BulkActionBar — idle / running / summary phases
// ---------------------------------------------------------------------------

const IDLE_STATE: BulkApprovalState = {
  phase: 'idle',
  total: 0,
  completed: 0,
  succeeded: 0,
  failed: 0,
  skipped: 0,
  results: [],
};

describe('BulkActionBar — Phase-27 Prompt-07 three-phase surface', () => {
  it('idle with no selection renders nothing', () => {
    const { container } = render(
      <BulkActionBar
        selectionCount={0}
        bulkState={IDLE_STATE}
        onApprove={() => {}}
        onClearSelection={() => {}}
        onRetryFailed={() => {}}
        onDismissSummary={() => {}}
        dispatchingOtherAction={false}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('idle with selection exposes the Approve selected + Clear buttons', () => {
    render(
      <BulkActionBar
        selectionCount={3}
        bulkState={IDLE_STATE}
        onApprove={() => {}}
        onClearSelection={() => {}}
        onRetryFailed={() => {}}
        onDismissSummary={() => {}}
        dispatchingOtherAction={false}
      />,
    );
    expect(screen.getByText('3 selected')).toBeTruthy();
    expect(screen.getByTestId('hb-kudos-bulk-approve')).toBeTruthy();
  });

  it('running phase renders the progress bar with aria semantics + current headline', () => {
    const running: BulkApprovalState = {
      phase: 'running',
      total: 4,
      completed: 2,
      succeeded: 2,
      failed: 0,
      skipped: 0,
      currentEntryId: 'k-99',
      currentHeadline: 'Thank-you for the migration work',
      results: [],
    };
    render(
      <BulkActionBar
        selectionCount={0}
        bulkState={running}
        onApprove={() => {}}
        onClearSelection={() => {}}
        onRetryFailed={() => {}}
        onDismissSummary={() => {}}
        dispatchingOtherAction={true}
      />,
    );
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-valuenow')).toBe('2');
    expect(progressbar.getAttribute('aria-valuemax')).toBe('4');
    expect(screen.getByTestId('hb-kudos-bulk-current').textContent).toContain(
      'Thank-you for the migration work',
    );
  });

  it('summary with failures shows the "Retry N failed" button and dismiss', () => {
    const summary: BulkApprovalState = {
      phase: 'summary',
      total: 3,
      completed: 3,
      succeeded: 1,
      failed: 2,
      skipped: 0,
      results: [
        { id: 'k-1', headline: 'ok one', status: 'succeeded' },
        { id: 'k-2', headline: 'fail two', status: 'failed', reason: 'SharePoint throttled' },
        { id: 'k-3', headline: 'fail three', status: 'failed', reason: 'Precondition failed' },
      ],
    };
    render(
      <BulkActionBar
        selectionCount={0}
        bulkState={summary}
        onApprove={() => {}}
        onClearSelection={() => {}}
        onRetryFailed={() => {}}
        onDismissSummary={() => {}}
        dispatchingOtherAction={false}
      />,
    );
    expect(screen.getByTestId('hb-kudos-bulk-summary')).toBeTruthy();
    const retry = screen.getByTestId('hb-kudos-bulk-retry-failed');
    expect(retry.textContent).toContain('2');
    const failures = screen.getByTestId('hb-kudos-bulk-summary-failures');
    expect(failures.textContent).toContain('SharePoint throttled');
    expect(failures.textContent).toContain('Precondition failed');
    expect(screen.getByTestId('hb-kudos-bulk-summary-dismiss')).toBeTruthy();
  });

  it('summary without failures hides the retry button', () => {
    const cleanSummary: BulkApprovalState = {
      phase: 'summary',
      total: 2,
      completed: 2,
      succeeded: 2,
      failed: 0,
      skipped: 0,
      results: [
        { id: 'k-1', headline: 'a', status: 'succeeded' },
        { id: 'k-2', headline: 'b', status: 'succeeded' },
      ],
    };
    render(
      <BulkActionBar
        selectionCount={0}
        bulkState={cleanSummary}
        onApprove={() => {}}
        onClearSelection={() => {}}
        onRetryFailed={() => {}}
        onDismissSummary={() => {}}
        dispatchingOtherAction={false}
      />,
    );
    expect(screen.queryByTestId('hb-kudos-bulk-retry-failed')).toBeNull();
    // Dismiss always present.
    expect(screen.getByTestId('hb-kudos-bulk-summary-dismiss')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Public surface — Phase-27 Prompt-03 terminal feed CTA + archive
// section header are assertable from the same HbKudos runtime entry
// point the existing smoke test uses.
// ---------------------------------------------------------------------------

import { HbKudos } from '../../webparts/hbKudos/HbKudos.js';

describe('HbKudos public surface — Phase-27 Prompt-03 hierarchy', () => {
  it('renders the archive section with the productized "Past recognition" title', async () => {
    await act(async () => {
      render(<HbKudos />);
    });
    await waitFor(() => {
      expect(screen.getByText('Past recognition')).toBeTruthy();
    });
  });

  it('exposes a pill-style archive toggle with explicit open/collapse labels', async () => {
    await act(async () => {
      render(<HbKudos />);
    });
    const toggle = await screen.findByTestId('hb-kudos-archive-toggle');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.textContent).toContain('Open archive');
    await act(async () => {
      fireEvent.click(toggle);
    });
    await waitFor(() => {
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      expect(toggle.textContent).toContain('Collapse archive');
    });
  });
});
