import { describe, expect, it } from 'vitest';

import type {
  MyWorkAdobeSignRecentCompletionsReadModel,
  MyWorkReadModelEnvelope,
} from '../index.js';

import {
  ADOBE_SIGN_RECENT_COMPLETIONS_AUTHORIZATION_REQUIRED,
  ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE,
  ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE_PAGED,
  ADOBE_SIGN_RECENT_COMPLETIONS_BACKEND_UNAVAILABLE,
  ADOBE_SIGN_RECENT_COMPLETIONS_CONFIGURATION_REQUIRED,
  ADOBE_SIGN_RECENT_COMPLETIONS_EMPTY,
  ADOBE_SIGN_RECENT_COMPLETIONS_PARTIAL,
  ADOBE_SIGN_RECENT_COMPLETIONS_PRINCIPAL_UNRESOLVED,
  ADOBE_SIGN_RECENT_COMPLETIONS_SOURCE_UNAVAILABLE,
  MY_WORK_FIXTURE_GENERATED_AT_UTC,
} from './adobeSignRecentCompletionsReadModels.js';

const ALL_FIXTURES: ReadonlyArray<
  readonly [string, MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>]
> = [
  ['ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE', ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE],
  ['ADOBE_SIGN_RECENT_COMPLETIONS_EMPTY', ADOBE_SIGN_RECENT_COMPLETIONS_EMPTY],
  ['ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE_PAGED', ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE_PAGED],
  ['ADOBE_SIGN_RECENT_COMPLETIONS_PARTIAL', ADOBE_SIGN_RECENT_COMPLETIONS_PARTIAL],
  [
    'ADOBE_SIGN_RECENT_COMPLETIONS_CONFIGURATION_REQUIRED',
    ADOBE_SIGN_RECENT_COMPLETIONS_CONFIGURATION_REQUIRED,
  ],
  [
    'ADOBE_SIGN_RECENT_COMPLETIONS_AUTHORIZATION_REQUIRED',
    ADOBE_SIGN_RECENT_COMPLETIONS_AUTHORIZATION_REQUIRED,
  ],
  [
    'ADOBE_SIGN_RECENT_COMPLETIONS_PRINCIPAL_UNRESOLVED',
    ADOBE_SIGN_RECENT_COMPLETIONS_PRINCIPAL_UNRESOLVED,
  ],
  [
    'ADOBE_SIGN_RECENT_COMPLETIONS_SOURCE_UNAVAILABLE',
    ADOBE_SIGN_RECENT_COMPLETIONS_SOURCE_UNAVAILABLE,
  ],
  [
    'ADOBE_SIGN_RECENT_COMPLETIONS_BACKEND_UNAVAILABLE',
    ADOBE_SIGN_RECENT_COMPLETIONS_BACKEND_UNAVAILABLE,
  ],
];

describe('Adobe Sign recent completions fixtures', () => {
  it('exports all required scenario envelopes', () => {
    expect(ALL_FIXTURES).toHaveLength(9);
  });

  it('stamps all envelopes deterministically', () => {
    expect(MY_WORK_FIXTURE_GENERATED_AT_UTC).toBe('2026-05-12T12:00:00.000Z');
    for (const [, envelope] of ALL_FIXTURES) {
      expect(envelope.mode).toBe('fixture');
      expect(envelope.readOnly).toBe(true);
      expect(envelope.generatedAtUtc).toBe(MY_WORK_FIXTURE_GENERATED_AT_UTC);
      expect(envelope.data.moduleId).toBe('adobe-sign-recent-completions');
    }
  });

  it('locks populated, empty, and paged posture', () => {
    expect(ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE.sourceStatus).toBe('available');
    expect(ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE.data.items).toHaveLength(3);
    expect(ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE.data.summary.completedAgreementCount).toBe(3);

    expect(ADOBE_SIGN_RECENT_COMPLETIONS_EMPTY.sourceStatus).toBe('available');
    expect(ADOBE_SIGN_RECENT_COMPLETIONS_EMPTY.data.items).toEqual([]);
    expect(ADOBE_SIGN_RECENT_COMPLETIONS_EMPTY.data.summary.completedAgreementCount).toBe(0);

    expect(ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE_PAGED.data.pagination).toEqual({
      pageSize: 2,
      hasMore: true,
      nextCursor: 'cursor-completed-page-2',
    });
  });

  it('uses agreementStatus and supports optional completedAtUtc alongside modifiedAtUtc', () => {
    for (const item of ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE.data.items) {
      expect(item.agreementStatus).toBe('COMPLETED');
      expect(item.modifiedAtUtc).toBeDefined();
    }
    const withCompletedAt = ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE.data.items.filter(
      (item) => item.completedAtUtc !== undefined,
    );
    const withoutCompletedAt = ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE.data.items.filter(
      (item) => item.completedAtUtc === undefined,
    );
    expect(withCompletedAt.length).toBeGreaterThan(0);
    expect(withoutCompletedAt.length).toBeGreaterThan(0);
    const withSender = ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE.data.items.filter(
      (item) => item.sender !== undefined,
    );
    const withoutSender = ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE.data.items.filter(
      (item) => item.sender === undefined,
    );
    const withUrl = ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE.data.items.filter(
      (item) => item.sourceOpenUrl !== undefined,
    );
    const withoutUrl = ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE.data.items.filter(
      (item) => item.sourceOpenUrl === undefined,
    );
    expect(withSender.length).toBeGreaterThan(0);
    expect(withoutSender.length).toBeGreaterThan(0);
    expect(withUrl.length).toBeGreaterThan(0);
    expect(withoutUrl.length).toBeGreaterThan(0);
  });

  it('locks degraded and partial state posture', () => {
    expect(ADOBE_SIGN_RECENT_COMPLETIONS_PARTIAL.sourceStatus).toBe('partial');
    expect(ADOBE_SIGN_RECENT_COMPLETIONS_PARTIAL.warnings).toEqual([
      { code: 'partial-source-data' },
    ]);

    const degraded = [
      ADOBE_SIGN_RECENT_COMPLETIONS_CONFIGURATION_REQUIRED,
      ADOBE_SIGN_RECENT_COMPLETIONS_AUTHORIZATION_REQUIRED,
      ADOBE_SIGN_RECENT_COMPLETIONS_PRINCIPAL_UNRESOLVED,
      ADOBE_SIGN_RECENT_COMPLETIONS_SOURCE_UNAVAILABLE,
      ADOBE_SIGN_RECENT_COMPLETIONS_BACKEND_UNAVAILABLE,
    ] as const;

    for (const envelope of degraded) {
      expect(envelope.data.items).toEqual([]);
      expect(envelope.data.summary.completedAgreementCount).toBe(0);
      expect(envelope.data.summary.windowDays).toBe(30);
      expect(envelope.data.freshness.state).toBe('unknown');
      expect(envelope.warnings).toHaveLength(1);
      expect(envelope.warnings[0]?.code).toBe(envelope.sourceStatus);
    }
  });
});
