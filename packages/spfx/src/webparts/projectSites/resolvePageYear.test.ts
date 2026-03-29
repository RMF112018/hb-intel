/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { resolvePageYear } from './resolvePageYear.js';

// ── Mock PnPjs ────────────────────────────────────────────────────────────

const mockSelectCall = vi.fn() as any;
const mockFilterSelectTopCall = vi.fn() as any;

vi.mock('@pnp/sp', () => ({
  spfi: () => ({
    using: () => ({
      web: {
        lists: {
          getByTitle: () => ({
            items: {
              getById: (_id: number) => ({
                select: () => mockSelectCall,
              }),
              filter: () => ({
                select: () => ({
                  top: () => mockFilterSelectTopCall,
                }),
              }),
            },
          }),
        },
      },
    }),
  }),
  SPFx: () => ({}),
}));
vi.mock('@pnp/sp/webs', () => ({}));
vi.mock('@pnp/sp/lists', () => ({}));
vi.mock('@pnp/sp/items', () => ({}));

// ── Mock context factory ──────────────────────────────────────────────────

interface MockContextOpts {
  listItemId?: number;
  legacyPageItemId?: number;
}

function createMockContext(opts?: MockContextOpts): WebPartContext {
  const listItem = opts?.listItemId !== undefined ? { id: opts.listItemId } : undefined;
  const legacyPageContext = opts?.legacyPageItemId !== undefined
    ? { pageItemId: opts.legacyPageItemId }
    : undefined;
  return {
    pageContext: {
      listItem,
      legacyPageContext,
    },
  } as unknown as WebPartContext;
}

function mockPnPItemReturn(yearValue: unknown): void {
  mockSelectCall.mockResolvedValue({ Year: yearValue });
}

function mockPnPFilterReturn(yearValue: unknown): void {
  mockFilterSelectTopCall.mockResolvedValue([{ Year: yearValue }]);
}

function mockPnPFilterEmpty(): void {
  mockFilterSelectTopCall.mockResolvedValue([]);
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('resolvePageYear — property pane override', () => {
  beforeEach(() => { mockSelectCall.mockReset(); mockFilterSelectTopCall.mockReset(); });

  it('returns resolved when override is a valid year', async () => {
    const result = await resolvePageYear(createMockContext(), 2026);
    expect(result).toEqual({ kind: 'resolved', year: 2026, source: 'property-pane' });
  });

  it('rounds fractional override to nearest integer', async () => {
    const result = await resolvePageYear(createMockContext(), 2026.7);
    expect(result).toEqual({ kind: 'resolved', year: 2027, source: 'property-pane' });
  });

  it('returns invalid when override is out of range', async () => {
    const result = await resolvePageYear(createMockContext(), 99999);
    expect(result).toEqual({ kind: 'invalid', rawValue: 99999, source: 'property-pane' });
  });

  it('falls through when override is 0', async () => {
    // No page identity → missing
    const result = await resolvePageYear(createMockContext(), 0);
    expect(result.kind).toBe('missing');
  });
});

describe('resolvePageYear — strategy A: listItem.id', () => {
  beforeEach(() => { mockSelectCall.mockReset(); mockFilterSelectTopCall.mockReset(); });

  it('resolves Year via listItem.id when available', async () => {
    mockPnPItemReturn(2025);
    const result = await resolvePageYear(createMockContext({ listItemId: 42 }), 0);
    expect(result).toEqual({ kind: 'resolved', year: 2025, source: 'page-metadata' });
  });

  it('returns invalid for out-of-range year', async () => {
    mockPnPItemReturn(50000);
    const result = await resolvePageYear(createMockContext({ listItemId: 42 }), 0);
    expect(result).toEqual({ kind: 'invalid', rawValue: 50000, source: 'page-metadata' });
  });

  it('returns missing when Year is null', async () => {
    mockPnPItemReturn(null);
    const result = await resolvePageYear(createMockContext({ listItemId: 42 }), 0);
    expect(result.kind).toBe('missing');
  });
});

describe('resolvePageYear — strategy B: legacyPageContext.pageItemId', () => {
  beforeEach(() => { mockSelectCall.mockReset(); mockFilterSelectTopCall.mockReset(); });

  it('falls through to legacyPageContext when listItem is absent', async () => {
    mockPnPItemReturn(2025);
    // No listItemId, but legacyPageItemId = 99
    const result = await resolvePageYear(createMockContext({ legacyPageItemId: 99 }), 0);
    expect(result).toEqual({ kind: 'resolved', year: 2025, source: 'page-metadata' });
  });
});

describe('resolvePageYear — strategy C: page filename from URL', () => {
  beforeEach(() => {
    mockSelectCall.mockReset();
    mockFilterSelectTopCall.mockReset();
  });

  it('falls through to filename query when no item ID available', async () => {
    // Mock window.location.pathname
    Object.defineProperty(window, 'location', {
      value: { pathname: '/sites/HBCentral/SitePages/2025-Projects.aspx' },
      writable: true,
    });
    mockPnPFilterReturn(2025);

    // No listItemId, no legacyPageItemId → falls to filename query
    const result = await resolvePageYear(createMockContext(), 0);
    expect(result).toEqual({ kind: 'resolved', year: 2025, source: 'page-metadata' });
  });

  it('returns missing when filename query returns empty', async () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/sites/HBCentral/SitePages/Unknown.aspx' },
      writable: true,
    });
    mockPnPFilterEmpty();

    const result = await resolvePageYear(createMockContext(), 0);
    expect(result.kind).toBe('missing');
  });
});

describe('resolvePageYear — error handling', () => {
  beforeEach(() => { mockSelectCall.mockReset(); mockFilterSelectTopCall.mockReset(); });

  it('returns missing when PnPjs call fails (graceful fallback)', async () => {
    mockSelectCall.mockRejectedValue(new Error('403 Forbidden'));
    const result = await resolvePageYear(createMockContext({ listItemId: 42 }), 0);
    expect(result.kind).toBe('missing');
  });
});

describe('resolvePageYear — priority', () => {
  beforeEach(() => { mockSelectCall.mockReset(); mockFilterSelectTopCall.mockReset(); });

  it('property pane override takes priority over page metadata', async () => {
    mockPnPItemReturn(2025);
    const result = await resolvePageYear(createMockContext({ listItemId: 42 }), 2026);
    expect(result).toEqual({ kind: 'resolved', year: 2026, source: 'property-pane' });
  });
});
