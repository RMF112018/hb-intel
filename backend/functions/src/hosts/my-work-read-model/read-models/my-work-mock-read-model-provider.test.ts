import { describe, expect, it } from 'vitest';

import {
  ADOBE_SIGN_QUEUE_AVAILABLE,
  ADOBE_SIGN_QUEUE_AVAILABLE_PAGED,
  ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE,
  MY_PROJECT_LINKS_AVAILABLE,
  MY_PROJECT_LINKS_BACKEND_UNAVAILABLE,
  MY_WORK_FIXTURE_GENERATED_AT_UTC,
  MY_WORK_HOME_AVAILABLE,
  MY_WORK_HOME_BACKEND_UNAVAILABLE,
} from '@hbc/models/myWork/fixtures';

import { MyWorkMockReadModelProvider } from './my-work-mock-read-model-provider.js';
import type { MyWorkReadContext } from './my-work-read-model-provider.js';

const FIXTURE_CONTEXT: MyWorkReadContext = {
  actor: {
    displayName: 'Test Actor',
    principalName: 'test.actor@hbc.example.com',
    hbcUserId: 'hbc-user-test',
  },
  requestId: 'req-test-1',
};

describe('MyWorkMockReadModelProvider — default posture', () => {
  it('returns the AVAILABLE home envelope with the deterministic fixture timestamp', async () => {
    const provider = new MyWorkMockReadModelProvider();
    const envelope = await provider.getMyWorkHome(FIXTURE_CONTEXT);
    expect(envelope).toEqual({
      ...MY_WORK_HOME_AVAILABLE,
      generatedAtUtc: MY_WORK_FIXTURE_GENERATED_AT_UTC,
    });
  });

  it('returns the AVAILABLE queue envelope when query has no cursor', async () => {
    const provider = new MyWorkMockReadModelProvider();
    const envelope = await provider.getAdobeSignActionQueue(FIXTURE_CONTEXT, {});
    expect(envelope).toEqual({
      ...ADOBE_SIGN_QUEUE_AVAILABLE,
      generatedAtUtc: MY_WORK_FIXTURE_GENERATED_AT_UTC,
    });
  });

  it('returns the AVAILABLE queue envelope when cursor is an empty string', async () => {
    const provider = new MyWorkMockReadModelProvider();
    const envelope = await provider.getAdobeSignActionQueue(FIXTURE_CONTEXT, {
      cursor: '',
    });
    expect(envelope.sourceStatus).toBe('available');
    expect(envelope.data.pagination.hasMore).toBe(false);
  });

  it('returns the AVAILABLE project-links envelope', async () => {
    const provider = new MyWorkMockReadModelProvider();
    const envelope = await provider.getMyProjectLinks(FIXTURE_CONTEXT);
    expect(envelope).toEqual({
      ...MY_PROJECT_LINKS_AVAILABLE,
      generatedAtUtc: MY_WORK_FIXTURE_GENERATED_AT_UTC,
    });
  });
});

describe('MyWorkMockReadModelProvider — backend-unavailable posture', () => {
  it('returns the BACKEND_UNAVAILABLE home envelope', async () => {
    const provider = new MyWorkMockReadModelProvider({
      simulateBackendUnavailable: true,
    });
    const envelope = await provider.getMyWorkHome(FIXTURE_CONTEXT);
    expect(envelope).toEqual({
      ...MY_WORK_HOME_BACKEND_UNAVAILABLE,
      generatedAtUtc: MY_WORK_FIXTURE_GENERATED_AT_UTC,
    });
  });

  it('returns the BACKEND_UNAVAILABLE queue envelope regardless of cursor', async () => {
    const provider = new MyWorkMockReadModelProvider({
      simulateBackendUnavailable: true,
    });
    const without = await provider.getAdobeSignActionQueue(FIXTURE_CONTEXT, {});
    const withCursor = await provider.getAdobeSignActionQueue(FIXTURE_CONTEXT, {
      cursor: 'cursor-page-2',
    });
    expect(without).toEqual({
      ...ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE,
      generatedAtUtc: MY_WORK_FIXTURE_GENERATED_AT_UTC,
    });
    expect(withCursor).toEqual({
      ...ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE,
      generatedAtUtc: MY_WORK_FIXTURE_GENERATED_AT_UTC,
    });
  });

  it('returns the BACKEND_UNAVAILABLE project-links envelope', async () => {
    const provider = new MyWorkMockReadModelProvider({
      simulateBackendUnavailable: true,
    });
    const envelope = await provider.getMyProjectLinks(FIXTURE_CONTEXT);
    expect(envelope).toEqual({
      ...MY_PROJECT_LINKS_BACKEND_UNAVAILABLE,
      generatedAtUtc: MY_WORK_FIXTURE_GENERATED_AT_UTC,
    });
  });
});

describe('MyWorkMockReadModelProvider — paged cursor selection', () => {
  it('returns the AVAILABLE_PAGED queue envelope when a non-empty cursor is supplied', async () => {
    const provider = new MyWorkMockReadModelProvider();
    const envelope = await provider.getAdobeSignActionQueue(FIXTURE_CONTEXT, {
      cursor: 'cursor-page-2',
    });
    expect(envelope).toEqual({
      ...ADOBE_SIGN_QUEUE_AVAILABLE_PAGED,
      generatedAtUtc: MY_WORK_FIXTURE_GENERATED_AT_UTC,
    });
  });
});

describe('MyWorkMockReadModelProvider — clock override', () => {
  it('stamps the supplied now() timestamp on the top-level envelope only', async () => {
    const provider = new MyWorkMockReadModelProvider({
      now: () => '2030-01-01T00:00:00.000Z',
    });
    const home = await provider.getMyWorkHome(FIXTURE_CONTEXT);
    const queue = await provider.getAdobeSignActionQueue(FIXTURE_CONTEXT, {});
    expect(home.generatedAtUtc).toBe('2030-01-01T00:00:00.000Z');
    expect(queue.generatedAtUtc).toBe('2030-01-01T00:00:00.000Z');
    expect(queue.data.freshness.generatedAtUtc).toBe(MY_WORK_FIXTURE_GENERATED_AT_UTC);
  });
});
