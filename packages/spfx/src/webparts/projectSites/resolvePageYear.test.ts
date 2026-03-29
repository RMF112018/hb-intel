/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { resolvePageYear } from './resolvePageYear.js';

// ── Mock PnPjs ────────────────────────────────────────────────────────────

// The PnPjs fluent API: sp.web.lists.getByTitle('X').items.getById(id).select('Y')()
// The final () is the invocation that returns a Promise. mockSelectCall is that invocable.
const mockSelectCall = vi.fn() as any;

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

function createMockContext(pageItemId?: number): WebPartContext {
  return {
    pageContext: {
      listItem: pageItemId !== undefined ? { id: pageItemId } : undefined,
    },
  } as unknown as WebPartContext;
}

function mockPnPReturn(yearValue: unknown): void {
  mockSelectCall.mockResolvedValue({ Year: yearValue });
}

function mockPnPError(message: string): void {
  mockSelectCall.mockRejectedValue(new Error(message));
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('resolvePageYear — property pane override', () => {
  beforeEach(() => { mockSelectCall.mockReset(); });

  it('returns resolved when override is a valid year', async () => {
    const result = await resolvePageYear(createMockContext(), 2026);
    expect(result).toEqual({ kind: 'resolved', year: 2026, source: 'property-pane' });
  });

  it('rounds fractional override to nearest integer', async () => {
    const result = await resolvePageYear(createMockContext(), 2026.7);
    expect(result).toEqual({ kind: 'resolved', year: 2027, source: 'property-pane' });
  });

  it('returns invalid when override is out of range (too high)', async () => {
    const result = await resolvePageYear(createMockContext(), 99999);
    expect(result).toEqual({ kind: 'invalid', rawValue: 99999, source: 'property-pane' });
  });

  it('returns invalid when override is out of range (too low but positive)', async () => {
    const result = await resolvePageYear(createMockContext(), 3);
    expect(result).toEqual({ kind: 'invalid', rawValue: 3, source: 'property-pane' });
  });

  it('falls through to page metadata when override is 0', async () => {
    const result = await resolvePageYear(createMockContext(), 0);
    expect(result.kind).toBe('missing');
  });

  it('falls through to page metadata when override is negative', async () => {
    const result = await resolvePageYear(createMockContext(), -1);
    expect(result.kind).toBe('missing');
  });
});

describe('resolvePageYear — page metadata via PnPjs', () => {
  beforeEach(() => { mockSelectCall.mockReset(); });

  it('resolves a valid numeric Year from Site Pages item', async () => {
    mockPnPReturn(2025);
    const result = await resolvePageYear(createMockContext(42), 0);
    expect(result).toEqual({ kind: 'resolved', year: 2025, source: 'page-metadata' });
  });

  it('coerces a string year from Site Pages item', async () => {
    mockPnPReturn('2024');
    const result = await resolvePageYear(createMockContext(42), 0);
    expect(result).toEqual({ kind: 'resolved', year: 2024, source: 'page-metadata' });
  });

  it('returns invalid for out-of-range numeric year', async () => {
    mockPnPReturn(50000);
    const result = await resolvePageYear(createMockContext(42), 0);
    expect(result).toEqual({ kind: 'invalid', rawValue: 50000, source: 'page-metadata' });
  });

  it('returns invalid for non-numeric string', async () => {
    mockPnPReturn('abc');
    const result = await resolvePageYear(createMockContext(42), 0);
    expect(result).toEqual({ kind: 'invalid', rawValue: 'abc', source: 'page-metadata' });
  });

  it('returns missing when Year is null', async () => {
    mockPnPReturn(null);
    const result = await resolvePageYear(createMockContext(42), 0);
    expect(result.kind).toBe('missing');
  });

  it('returns missing when Year is undefined', async () => {
    mockPnPReturn(undefined);
    const result = await resolvePageYear(createMockContext(42), 0);
    expect(result.kind).toBe('missing');
  });

  it('returns missing when listItem is absent (no page item ID)', async () => {
    const result = await resolvePageYear(createMockContext(undefined), 0);
    expect(result.kind).toBe('missing');
  });

  it('returns missing when PnPjs call fails (graceful fallback)', async () => {
    mockPnPError('403 Forbidden');
    const result = await resolvePageYear(createMockContext(42), 0);
    expect(result.kind).toBe('missing');
  });
});

describe('resolvePageYear — priority', () => {
  beforeEach(() => { mockSelectCall.mockReset(); });

  it('property pane override takes priority over page metadata', async () => {
    mockPnPReturn(2025);
    const result = await resolvePageYear(createMockContext(42), 2026);
    expect(result).toEqual({ kind: 'resolved', year: 2026, source: 'property-pane' });
  });
});
