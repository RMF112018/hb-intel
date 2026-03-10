import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HandoffApi } from '../api/HandoffApi';
import { HANDOFF_API_BASE } from '../constants/handoffDefaults';
import { handoffQueryKeys } from '../hooks/handoffQueryKeys';
import type { IRawHandoffListItem } from '../types/IWorkflowHandoff';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function createRawListItem(overrides?: Partial<IRawHandoffListItem>): IRawHandoffListItem {
  return {
    Id: 1,
    HandoffId: 'hoff-001',
    SourceModule: 'business-development',
    SourceRecordType: 'bd-scorecard',
    SourceRecordId: 'src-001',
    DestinationModule: 'estimating',
    DestinationRecordType: 'estimating-pursuit',
    SourceSnapshotJson: JSON.stringify({ id: 'src-001', projectName: 'Test' }),
    SourceSnapshotFileUrl: null,
    DestinationSeedDataJson: JSON.stringify({ projectName: 'Test' }),
    DocumentsJson: JSON.stringify([{ documentId: 'd1', fileName: 'f.pdf', sharepointUrl: 'https://sp/f.pdf', category: 'RFP' }]),
    ContextNotesJson: JSON.stringify([]),
    SenderUserId: 'u-sender',
    SenderDisplayName: 'Sender Name',
    SenderRole: 'BD Director',
    RecipientUserId: 'u-recipient',
    RecipientDisplayName: 'Recipient Name',
    RecipientRole: 'Estimator',
    Status: 'draft',
    SentAt: null,
    AcknowledgedAt: null,
    RejectedAt: null,
    RejectionReason: null,
    CreatedDestinationRecordId: null,
    CreatedAt: '2026-01-15T09:00:00Z',
    ...overrides,
  };
}

function mockFetchResponse(body: unknown, ok = true, status = 200) {
  vi.mocked(global.fetch).mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response);
}

beforeEach(() => {
  vi.mocked(global.fetch).mockReset();
});

// ─────────────────────────────────────────────────────────────────────────────
// HandoffApi.create
// ─────────────────────────────────────────────────────────────────────────────

describe('HandoffApi.create', () => {
  it('sends POST and returns mapped package', async () => {
    const raw = createRawListItem();
    mockFetchResponse(raw);

    const result = await HandoffApi.create({
      sourceModule: 'business-development',
      sourceRecordType: 'bd-scorecard',
      sourceRecordId: 'src-001',
      destinationModule: 'estimating',
      destinationRecordType: 'estimating-pursuit',
      sourceSnapshot: { id: 'src-001' },
      destinationSeedData: {},
      documents: [],
      contextNotes: [],
      sender: { userId: 'u-sender', displayName: 'Sender', role: 'BD' },
      recipient: { userId: 'u-recipient', displayName: 'Recipient', role: 'Est' },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${HANDOFF_API_BASE}`,
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.handoffId).toBe('hoff-001');
    expect(result.sender.userId).toBe('u-sender');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HandoffApi.get
// ─────────────────────────────────────────────────────────────────────────────

describe('HandoffApi.get', () => {
  it('fetches a single package by ID', async () => {
    const raw = createRawListItem({ HandoffId: 'hoff-002' });
    mockFetchResponse(raw);

    const result = await HandoffApi.get('hoff-002');
    expect(global.fetch).toHaveBeenCalledWith(
      `${HANDOFF_API_BASE}/hoff-002`,
      expect.any(Object)
    );
    expect(result.handoffId).toBe('hoff-002');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HandoffApi.inbox
// ─────────────────────────────────────────────────────────────────────────────

describe('HandoffApi.inbox', () => {
  it('returns mapped array of packages', async () => {
    const items = [createRawListItem({ Status: 'sent' }), createRawListItem({ HandoffId: 'hoff-002', Status: 'received' })];
    mockFetchResponse(items);

    const result = await HandoffApi.inbox();
    expect(result).toHaveLength(2);
    expect(result[0].status).toBe('sent');
    expect(result[1].handoffId).toBe('hoff-002');
  });

  it('returns empty array when no items', async () => {
    mockFetchResponse([]);
    const result = await HandoffApi.inbox();
    expect(result).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HandoffApi.outbox
// ─────────────────────────────────────────────────────────────────────────────

describe('HandoffApi.outbox', () => {
  it('returns mapped array of outbound packages', async () => {
    const items = [createRawListItem()];
    mockFetchResponse(items);

    const result = await HandoffApi.outbox();
    expect(result).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HandoffApi.send
// ─────────────────────────────────────────────────────────────────────────────

describe('HandoffApi.send', () => {
  it('sends POST to /{id}/send', async () => {
    const raw = createRawListItem({ Status: 'sent', SentAt: '2026-01-15T09:05:00Z' });
    mockFetchResponse(raw);

    const result = await HandoffApi.send('hoff-001');
    expect(global.fetch).toHaveBeenCalledWith(
      `${HANDOFF_API_BASE}/hoff-001/send`,
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.status).toBe('sent');
    expect(result.sentAt).toBe('2026-01-15T09:05:00Z');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HandoffApi.markReceived
// ─────────────────────────────────────────────────────────────────────────────

describe('HandoffApi.markReceived', () => {
  it('sends POST to /{id}/receive', async () => {
    const raw = createRawListItem({ Status: 'received' });
    mockFetchResponse(raw);

    const result = await HandoffApi.markReceived('hoff-001');
    expect(global.fetch).toHaveBeenCalledWith(
      `${HANDOFF_API_BASE}/hoff-001/receive`,
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.status).toBe('received');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HandoffApi.acknowledge
// ─────────────────────────────────────────────────────────────────────────────

describe('HandoffApi.acknowledge', () => {
  it('sends POST to /{id}/acknowledge and returns package with destination record ID', async () => {
    const raw = createRawListItem({
      Status: 'acknowledged',
      AcknowledgedAt: '2026-01-15T10:00:00Z',
      CreatedDestinationRecordId: 'dest-001',
    });
    mockFetchResponse(raw);

    const result = await HandoffApi.acknowledge('hoff-001');
    expect(result.status).toBe('acknowledged');
    expect(result.createdDestinationRecordId).toBe('dest-001');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HandoffApi.reject
// ─────────────────────────────────────────────────────────────────────────────

describe('HandoffApi.reject', () => {
  it('sends POST with rejectionReason to /{id}/reject', async () => {
    const raw = createRawListItem({
      Status: 'rejected',
      RejectedAt: '2026-01-15T10:00:00Z',
      RejectionReason: 'Missing docs',
    });
    mockFetchResponse(raw);

    const result = await HandoffApi.reject('hoff-001', 'Missing docs');
    expect(global.fetch).toHaveBeenCalledWith(
      `${HANDOFF_API_BASE}/hoff-001/reject`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ rejectionReason: 'Missing docs' }),
      })
    );
    expect(result.rejectionReason).toBe('Missing docs');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HandoffApi.updateContextNotes
// ─────────────────────────────────────────────────────────────────────────────

describe('HandoffApi.updateContextNotes', () => {
  it('sends PATCH to /{id}/notes', async () => {
    const raw = createRawListItem();
    mockFetchResponse(raw);

    const notes = [{ noteId: 'n1', category: 'General' as const, body: 'Note', author: { userId: 'u1', displayName: 'N', role: 'R' }, createdAt: '2026-01-15T09:00:00Z' }];
    await HandoffApi.updateContextNotes('hoff-001', notes);

    expect(global.fetch).toHaveBeenCalledWith(
      `${HANDOFF_API_BASE}/hoff-001/notes`,
      expect.objectContaining({ method: 'PATCH' })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// apiFetch error handling
// ─────────────────────────────────────────────────────────────────────────────

describe('apiFetch error handling', () => {
  it('throws HandoffApi error with status and body text on non-ok response', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: () => Promise.resolve('Not Found'),
    } as unknown as Response);

    await expect(HandoffApi.get('bad-id')).rejects.toThrow('HandoffApi error 404: Not Found');
  });

  it('throws with empty text when response.text() rejects', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.reject(new Error('text failed')),
    } as unknown as Response);

    await expect(HandoffApi.get('err-id')).rejects.toThrow('HandoffApi error 500: ');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// mapListItem JSON parse fallbacks
// ─────────────────────────────────────────────────────────────────────────────

describe('mapListItem JSON parse fallbacks', () => {
  it('falls back to empty object when SourceSnapshotJson is invalid', async () => {
    const raw = createRawListItem({ SourceSnapshotJson: 'INVALID-JSON' });
    mockFetchResponse(raw);

    const result = await HandoffApi.get('hoff-001');
    expect(result.sourceSnapshot).toEqual({});
  });

  it('falls back to empty object when DestinationSeedDataJson is invalid', async () => {
    const raw = createRawListItem({ DestinationSeedDataJson: '{broken' });
    mockFetchResponse(raw);

    const result = await HandoffApi.get('hoff-001');
    expect(result.destinationSeedData).toEqual({});
  });

  it('falls back to empty array when DocumentsJson is invalid', async () => {
    const raw = createRawListItem({ DocumentsJson: 'not-json' });
    mockFetchResponse(raw);

    const result = await HandoffApi.get('hoff-001');
    expect(result.documents).toEqual([]);
  });

  it('falls back to empty array when ContextNotesJson is invalid', async () => {
    const raw = createRawListItem({ ContextNotesJson: '---' });
    mockFetchResponse(raw);

    const result = await HandoffApi.get('hoff-001');
    expect(result.contextNotes).toEqual([]);
  });

  it('maps sender and recipient from flat fields to IBicOwner objects', async () => {
    const raw = createRawListItem();
    mockFetchResponse(raw);

    const result = await HandoffApi.get('hoff-001');
    expect(result.sender).toEqual({
      userId: 'u-sender',
      displayName: 'Sender Name',
      role: 'BD Director',
    });
    expect(result.recipient).toEqual({
      userId: 'u-recipient',
      displayName: 'Recipient Name',
      role: 'Estimator',
    });
  });

  it('coerces null SentAt/AcknowledgedAt/RejectedAt to null', async () => {
    const raw = createRawListItem();
    mockFetchResponse(raw);

    const result = await HandoffApi.get('hoff-001');
    expect(result.sentAt).toBeNull();
    expect(result.acknowledgedAt).toBeNull();
    expect(result.rejectedAt).toBeNull();
    expect(result.rejectionReason).toBeNull();
    expect(result.createdDestinationRecordId).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// handoffQueryKeys
// ─────────────────────────────────────────────────────────────────────────────

describe('handoffQueryKeys', () => {
  it('generates correct query keys', () => {
    expect(handoffQueryKeys.inbox()).toEqual(['workflow-handoff', 'inbox']);
    expect(handoffQueryKeys.outbox()).toEqual(['workflow-handoff', 'outbox']);
    expect(handoffQueryKeys.package('h1')).toEqual(['workflow-handoff', 'package', 'h1']);
    expect(handoffQueryKeys.outboundBySource('src-1')).toEqual(['workflow-handoff', 'outbound', 'src-1']);
  });
});
