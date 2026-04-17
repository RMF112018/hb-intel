/**
 * SharePoint page-binding writer — duplicate refusal + single-match
 * happy-path behavior.
 *
 * Wave-03 Prompt-04 closure pin: the writer's `findExistingItemId`
 * must query with `$top=2` and fail the upsert with
 * `reason: 'duplicateBindings'` when the tenant list contains more
 * than one row for the same `ArticleId`. First-match blind trust is
 * gone; binding writes against a duplicate list must surface
 * operator-visible failure rather than silently patching whichever
 * row SharePoint returns first.
 */
import { describe, expect, it, vi } from 'vitest';
import { createSharePointPageBindingWriter } from './pageBindingWriter';
import type { PublisherPageBindingRow } from './publisherContracts';

function row(over: Partial<PublisherPageBindingRow> = {}): PublisherPageBindingRow {
  return {
    BindingId: 'bnd-001',
    ArticleId: 'art-001',
    Title: 'Draft title',
    TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
    PageTemplateKey: 'ps-inprogress-monthly-v1',
    PublishStatus: 'published',
    ...over,
  } as PublisherPageBindingRow;
}

function makeFetch(responses: Array<{ ok: boolean; status?: number; body?: unknown }>) {
  let call = 0;
  return vi.fn(async (url: string | URL, _init?: RequestInit) => {
    const next = responses[call] ?? responses[responses.length - 1]!;
    call += 1;
    return {
      ok: next.ok,
      status: next.status ?? (next.ok ? 200 : 500),
      async json() {
        return next.body;
      },
    } as unknown as Response;
  });
}

describe('pageBindingWriter — duplicate detection (Wave-03 Prompt-04)', () => {
  it('refuses to upsert when the ArticleId matches more than one list row', async () => {
    const fetchImpl = makeFetch([
      // Lookup — returns two rows for the same ArticleId.
      {
        ok: true,
        body: {
          value: [
            { Id: 101, ArticleId: 'art-001' },
            { Id: 102, ArticleId: 'art-001' },
          ],
        },
      },
    ]);
    const writer = createSharePointPageBindingWriter({
      fetchImpl,
      fetchRequestDigestImpl: vi.fn(async () => 'digest-value'),
    });

    const outcome = await writer.upsert({ row: row() });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.reason).toBe('duplicateBindings');
    expect(outcome.message).toMatch(/item ids 101, 102/);
    expect(outcome.message).toMatch(/ArticleId='art-001'/);
  });

  it('issues a $top=2 probe so duplicates can always be detected', async () => {
    const fetchImpl = makeFetch([
      { ok: true, body: { value: [] } }, // lookup
      { ok: true, body: { Id: 42 } }, // create
    ]);
    const writer = createSharePointPageBindingWriter({
      fetchImpl,
      fetchRequestDigestImpl: vi.fn(async () => 'digest-value'),
    });
    await writer.upsert({ row: row() });
    const lookupCall = fetchImpl.mock.calls[0]![0] as string;
    expect(lookupCall).toContain('$top=2');
  });

  it('single-match lookup still merges in place (regression guard)', async () => {
    const fetchImpl = makeFetch([
      { ok: true, body: { value: [{ Id: 55, ArticleId: 'art-001' }] } }, // lookup
      { ok: true, body: undefined }, // merge response (no body needed)
    ]);
    const writer = createSharePointPageBindingWriter({
      fetchImpl,
      fetchRequestDigestImpl: vi.fn(async () => 'digest-value'),
    });
    const outcome = await writer.upsert({ row: row() });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.wasCreated).toBe(false);
    expect(outcome.itemId).toBe(55);
  });

  it('no-match lookup creates a fresh row (regression guard)', async () => {
    const fetchImpl = makeFetch([
      { ok: true, body: { value: [] } }, // lookup
      { ok: true, body: { Id: 99 } }, // create
    ]);
    const writer = createSharePointPageBindingWriter({
      fetchImpl,
      fetchRequestDigestImpl: vi.fn(async () => 'digest-value'),
    });
    const outcome = await writer.upsert({ row: row() });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.wasCreated).toBe(true);
    expect(outcome.itemId).toBe(99);
  });
});
