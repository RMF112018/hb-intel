import { describe, expect, it } from 'vitest';

import type {
  MyWorkAdobeSignRecentCompletionsItem,
  MyWorkAdobeSignRecentCompletionsReadModel,
  MyWorkAdobeSignRecentCompletionsSummary,
} from './AdobeSignRecentCompletions.js';

describe('AdobeSignRecentCompletions contract', () => {
  it('locks moduleId and summary window literals', () => {
    const summary: MyWorkAdobeSignRecentCompletionsSummary = {
      countBasis: 'returned-items',
      completedAgreementCount: 2,
      windowDays: 30,
    };

    const model: MyWorkAdobeSignRecentCompletionsReadModel = {
      moduleId: 'adobe-sign-recent-completions',
      summary,
      items: [],
      pagination: { pageSize: 25, hasMore: false },
      freshness: { state: 'fresh', generatedAtUtc: '2026-05-12T12:00:00.000Z' },
    };

    expect(model.moduleId).toBe('adobe-sign-recent-completions');
    expect(model.summary.windowDays).toBe(30);
  });

  it('locks completionState literal and optional fields posture', () => {
    const item: MyWorkAdobeSignRecentCompletionsItem = {
      itemId: 'adobe-sign:completed-1',
      sourceSystem: 'adobe-sign',
      agreementId: 'completed-1',
      agreementName: 'Completed agreement',
      completionState: 'completed',
      modifiedAtUtc: '2026-05-11T18:00:00.000Z',
      sourceOpenUrl: 'https://adobesign.example.com/agreements/completed-1',
    };

    expect(item.completionState).toBe('completed');
    expect(item.modifiedAtUtc).toBe('2026-05-11T18:00:00.000Z');
    expect(item.sourceOpenUrl).toContain('adobesign');
    expect('sender' in item).toBe(false);
    expect('completedAtUtc' in (item as Record<string, unknown>)).toBe(false);
    expect('requiredAction' in (item as Record<string, unknown>)).toBe(false);
    expect('adobeRecipientStatus' in (item as Record<string, unknown>)).toBe(false);
  });
});
