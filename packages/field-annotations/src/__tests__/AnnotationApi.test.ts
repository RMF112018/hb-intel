import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnnotationApi } from '../api/AnnotationApi';
import {
  ANNOTATION_API_BASE,
  resolveAnnotationConfig,
  ANNOTATION_DEFAULT_BLOCKS_BIC,
  ANNOTATION_DEFAULT_ALLOW_ASSIGNMENT,
  ANNOTATION_DEFAULT_REQUIRE_RESOLUTION_NOTE,
  ANNOTATION_DEFAULT_VISIBLE_TO_VIEWERS,
  ANNOTATION_DEFAULT_VERSION_AWARE,
} from '../constants/annotationDefaults';
import type { IRawAnnotationListItem } from '../types/IFieldAnnotation';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function createRawListItem(overrides?: Partial<IRawAnnotationListItem>): IRawAnnotationListItem {
  return {
    Id: 1,
    AnnotationId: 'ann-001',
    RecordType: 'bd-scorecard',
    RecordId: 'rec-001',
    FieldKey: 'totalBuildableArea',
    FieldLabel: 'Total Buildable Area',
    Intent: 'comment',
    Status: 'open',
    AuthorId: 'user-001',
    AuthorName: 'John Doe',
    AuthorRole: 'Estimator',
    AssignedToId: null,
    AssignedToName: null,
    AssignedToRole: null,
    Body: 'Test body',
    CreatedAt: '2026-03-09T14:00:00Z',
    CreatedAtVersion: null,
    ResolvedAt: null,
    ResolvedById: null,
    ResolvedByName: null,
    ResolvedByRole: null,
    ResolutionNote: null,
    ResolvedAtVersion: null,
    RepliesJson: '',
    ...overrides,
  };
}

function mockFetchSuccess(data: unknown) {
  vi.mocked(global.fetch).mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(''),
  } as Response);
}

function mockFetchError(status: number, text = 'Server Error') {
  vi.mocked(global.fetch).mockResolvedValueOnce({
    ok: false,
    status,
    text: () => Promise.resolve(text),
  } as Response);
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.mocked(global.fetch).mockReset();
});

describe('AnnotationApi', () => {
  describe('list', () => {
    it('fetches annotations with recordType and recordId params', async () => {
      const raw = [createRawListItem()];
      mockFetchSuccess(raw);

      const result = await AnnotationApi.list('bd-scorecard', 'rec-001');

      expect(global.fetch).toHaveBeenCalledOnce();
      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url).toContain(`${ANNOTATION_API_BASE}?`);
      expect(url).toContain('recordType=bd-scorecard');
      expect(url).toContain('recordId=rec-001');
      expect(result).toHaveLength(1);
      expect(result[0].annotationId).toBe('ann-001');
    });

    it('includes fieldKey param when provided', async () => {
      mockFetchSuccess([]);
      await AnnotationApi.list('bd-scorecard', 'rec-001', { fieldKey: 'gmp' });

      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url).toContain('fieldKey=gmp');
    });

    it('includes status param when provided', async () => {
      mockFetchSuccess([]);
      await AnnotationApi.list('bd-scorecard', 'rec-001', { status: 'open' });

      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url).toContain('status=open');
    });

    it('maps all fields from raw list item to IFieldAnnotation', async () => {
      const raw = createRawListItem({
        AssignedToId: 'assignee-001',
        AssignedToName: 'Jane',
        AssignedToRole: 'PM',
        CreatedAtVersion: 3,
        ResolvedAt: '2026-03-09T16:00:00Z',
        ResolvedById: 'resolver-001',
        ResolvedByName: 'Bob',
        ResolvedByRole: 'Director',
        ResolutionNote: 'Fixed it.',
        ResolvedAtVersion: 5,
        RepliesJson: JSON.stringify([
          { replyId: 'r1', author: { userId: 'u1', displayName: 'A', role: 'R' }, body: 'text', createdAt: '2026-03-09T15:00:00Z' },
        ]),
      });
      mockFetchSuccess([raw]);

      const result = await AnnotationApi.list('bd-scorecard', 'rec-001');
      const a = result[0];

      expect(a.assignedTo).toEqual({ userId: 'assignee-001', displayName: 'Jane', role: 'PM' });
      expect(a.createdAtVersion).toBe(3);
      expect(a.resolvedAt).toBe('2026-03-09T16:00:00Z');
      expect(a.resolvedBy).toEqual({ userId: 'resolver-001', displayName: 'Bob', role: 'Director' });
      expect(a.resolutionNote).toBe('Fixed it.');
      expect(a.resolvedAtVersion).toBe(5);
      expect(a.replies).toHaveLength(1);
      expect(a.replies[0].replyId).toBe('r1');
    });

    it('handles invalid RepliesJson gracefully', async () => {
      const raw = createRawListItem({ RepliesJson: 'not-valid-json' });
      mockFetchSuccess([raw]);

      const result = await AnnotationApi.list('bd-scorecard', 'rec-001');
      expect(result[0].replies).toEqual([]);
    });

    it('handles empty RepliesJson string', async () => {
      const raw = createRawListItem({ RepliesJson: '' });
      mockFetchSuccess([raw]);

      const result = await AnnotationApi.list('bd-scorecard', 'rec-001');
      expect(result[0].replies).toEqual([]);
    });

    it('sets assignedTo to null when partial fields present', async () => {
      const raw = createRawListItem({ AssignedToId: 'id', AssignedToName: null, AssignedToRole: null });
      mockFetchSuccess([raw]);

      const result = await AnnotationApi.list('bd-scorecard', 'rec-001');
      expect(result[0].assignedTo).toBeNull();
    });

    it('sets resolvedBy to null when partial fields present', async () => {
      const raw = createRawListItem({ ResolvedById: 'id', ResolvedByName: null, ResolvedByRole: null });
      mockFetchSuccess([raw]);

      const result = await AnnotationApi.list('bd-scorecard', 'rec-001');
      expect(result[0].resolvedBy).toBeNull();
    });

    it('coalesces null CreatedAtVersion and ResolvedAtVersion', async () => {
      const raw = createRawListItem({ CreatedAtVersion: null, ResolvedAtVersion: null });
      mockFetchSuccess([raw]);

      const result = await AnnotationApi.list('bd-scorecard', 'rec-001');
      expect(result[0].createdAtVersion).toBeNull();
      expect(result[0].resolvedAtVersion).toBeNull();
    });
  });

  describe('get', () => {
    it('fetches a single annotation by ID', async () => {
      const raw = createRawListItem({ AnnotationId: 'ann-999' });
      mockFetchSuccess(raw);

      const result = await AnnotationApi.get('ann-999');

      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url).toBe(`${ANNOTATION_API_BASE}/ann-999`);
      expect(result.annotationId).toBe('ann-999');
    });
  });

  describe('create', () => {
    it('POSTs new annotation and returns mapped result', async () => {
      const raw = createRawListItem({ AnnotationId: 'new-001' });
      mockFetchSuccess(raw);

      const result = await AnnotationApi.create({
        recordType: 'bd-scorecard',
        recordId: 'rec-001',
        fieldKey: 'gmp',
        fieldLabel: 'GMP',
        intent: 'comment',
        body: 'New annotation',
      });

      const [url, options] = vi.mocked(global.fetch).mock.calls[0];
      expect(url).toBe(`${ANNOTATION_API_BASE}`);
      expect((options as RequestInit).method).toBe('POST');
      expect(result.annotationId).toBe('new-001');
    });
  });

  describe('addReply', () => {
    it('POSTs reply and returns IAnnotationReply', async () => {
      const reply = { replyId: 'reply-001', author: { userId: 'u1', displayName: 'A', role: 'R' }, body: 'Reply text', createdAt: '2026-03-09T15:00:00Z' };
      mockFetchSuccess(reply);

      const result = await AnnotationApi.addReply({ annotationId: 'ann-001', body: 'Reply text' });

      const [url, options] = vi.mocked(global.fetch).mock.calls[0];
      expect(url).toBe(`${ANNOTATION_API_BASE}/ann-001/replies`);
      expect((options as RequestInit).method).toBe('POST');
      expect(result.replyId).toBe('reply-001');
    });
  });

  describe('resolve', () => {
    it('PATCHes resolution and returns mapped result', async () => {
      const raw = createRawListItem({ Status: 'resolved' });
      mockFetchSuccess(raw);

      const result = await AnnotationApi.resolve({
        annotationId: 'ann-001',
        resolutionNote: 'Addressed.',
        resolvedAtVersion: 2,
      });

      const [url, options] = vi.mocked(global.fetch).mock.calls[0];
      expect(url).toBe(`${ANNOTATION_API_BASE}/ann-001/resolve`);
      expect((options as RequestInit).method).toBe('PATCH');
      expect(result.status).toBe('resolved');
    });

    it('sends null for optional fields when not provided', async () => {
      const raw = createRawListItem({ Status: 'resolved' });
      mockFetchSuccess(raw);

      await AnnotationApi.resolve({ annotationId: 'ann-001' });

      const body = JSON.parse((vi.mocked(global.fetch).mock.calls[0][1] as RequestInit).body as string);
      expect(body.resolutionNote).toBeNull();
      expect(body.resolvedAtVersion).toBeNull();
    });
  });

  describe('withdraw', () => {
    it('PATCHes withdrawal and returns mapped result', async () => {
      const raw = createRawListItem({ Status: 'withdrawn' });
      mockFetchSuccess(raw);

      const result = await AnnotationApi.withdraw({ annotationId: 'ann-001' });

      const [url, options] = vi.mocked(global.fetch).mock.calls[0];
      expect(url).toBe(`${ANNOTATION_API_BASE}/ann-001/withdraw`);
      expect((options as RequestInit).method).toBe('PATCH');
      expect(result.status).toBe('withdrawn');
    });
  });

  describe('error handling', () => {
    it('throws on HTTP error with status and message', async () => {
      mockFetchError(404, 'Not found');

      await expect(AnnotationApi.get('bad-id')).rejects.toThrow('AnnotationApi error 404: Not found');
    });

    it('throws on HTTP error when text() fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.reject(new Error('text fail')),
      } as unknown as Response);

      await expect(AnnotationApi.get('bad-id')).rejects.toThrow('AnnotationApi error 500: ');
    });
  });
});

describe('resolveAnnotationConfig', () => {
  it('applies all defaults when optional fields are omitted', () => {
    const resolved = resolveAnnotationConfig({ recordType: 'bd-scorecard' });
    expect(resolved.recordType).toBe('bd-scorecard');
    expect(resolved.blocksBicOnOpenAnnotations).toBe(ANNOTATION_DEFAULT_BLOCKS_BIC);
    expect(resolved.allowAssignment).toBe(ANNOTATION_DEFAULT_ALLOW_ASSIGNMENT);
    expect(resolved.requireResolutionNote).toBe(ANNOTATION_DEFAULT_REQUIRE_RESOLUTION_NOTE);
    expect(resolved.visibleToViewers).toBe(ANNOTATION_DEFAULT_VISIBLE_TO_VIEWERS);
    expect(resolved.versionAware).toBe(ANNOTATION_DEFAULT_VERSION_AWARE);
  });

  it('preserves explicit overrides', () => {
    const resolved = resolveAnnotationConfig({
      recordType: 'test',
      blocksBicOnOpenAnnotations: false,
      allowAssignment: true,
      requireResolutionNote: false,
      visibleToViewers: false,
      versionAware: true,
    });
    expect(resolved.blocksBicOnOpenAnnotations).toBe(false);
    expect(resolved.allowAssignment).toBe(true);
    expect(resolved.requireResolutionNote).toBe(false);
    expect(resolved.visibleToViewers).toBe(false);
    expect(resolved.versionAware).toBe(true);
  });

  it('handles partial overrides with mixed defaults', () => {
    const resolved = resolveAnnotationConfig({
      recordType: 'test',
      allowAssignment: true,
      versionAware: true,
    });
    expect(resolved.blocksBicOnOpenAnnotations).toBe(ANNOTATION_DEFAULT_BLOCKS_BIC);
    expect(resolved.allowAssignment).toBe(true);
    expect(resolved.requireResolutionNote).toBe(ANNOTATION_DEFAULT_REQUIRE_RESOLUTION_NOTE);
    expect(resolved.visibleToViewers).toBe(ANNOTATION_DEFAULT_VISIBLE_TO_VIEWERS);
    expect(resolved.versionAware).toBe(true);
  });
});
