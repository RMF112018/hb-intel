import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  ADOBE_SIGN_ACTION_HANDOFF_POSTURES,
  ADOBE_SIGN_ACTION_HANDOFF_REASONS,
  ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES,
  ADOBE_SIGN_STATUS_TO_REQUIRED_ACTION,
  MY_WORK_ADOBE_SIGN_REQUIRED_ACTIONS,
  type AdobeSignActionableRecipientStatus,
  type MyWorkAdobeSignActionQueueFreshness,
  type MyWorkAdobeSignActionQueueItem,
  type MyWorkAdobeSignActionQueuePagination,
  type MyWorkAdobeSignActionQueueReadModel,
  type MyWorkAdobeSignActionQueueSummary,
  type MyWorkAdobeSignRequiredAction,
  type MyWorkFreshnessState,
} from './AdobeSignActionQueue.js';

const here = dirname(fileURLToPath(import.meta.url));
const moduleSource = readFileSync(join(here, 'AdobeSignActionQueue.ts'), 'utf8');
const moduleSourceCode = moduleSource.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

describe('Adobe Sign Action Queue — actionable recipient statuses', () => {
  it('exposes exactly the six B04 actionable Adobe recipient statuses in order', () => {
    expect(ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES).toEqual([
      'WAITING_FOR_MY_SIGNATURE',
      'WAITING_FOR_MY_APPROVAL',
      'WAITING_FOR_MY_ACCEPTANCE',
      'WAITING_FOR_MY_ACKNOWLEDGEMENT',
      'WAITING_FOR_MY_FORM_FILLING',
      'WAITING_FOR_MY_DELEGATION',
    ]);
    expect(ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES).toHaveLength(6);
  });

  it('does not include non-actionable Adobe recipient statuses', () => {
    const forbidden = ['WAITING_FOR_OTHERS', 'COMPLETED', 'CANCELLED', 'EXPIRED'];
    for (const status of forbidden) {
      expect((ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES as readonly string[]).includes(status)).toBe(
        false,
      );
    }
  });
});

describe('Adobe Sign Action Queue — normalized required actions', () => {
  it('exposes exactly the six B04 normalized required actions in order', () => {
    expect(MY_WORK_ADOBE_SIGN_REQUIRED_ACTIONS).toEqual([
      'signature',
      'approval',
      'acceptance',
      'acknowledgement',
      'form-filling',
      'delegation',
    ]);
    expect(MY_WORK_ADOBE_SIGN_REQUIRED_ACTIONS).toHaveLength(6);
  });
});

describe('Adobe Sign Action Queue — handoff capability vocabulary', () => {
  it('exposes the closed action-handoff posture set in order', () => {
    expect(ADOBE_SIGN_ACTION_HANDOFF_POSTURES).toEqual([
      'resolve-on-click',
      'view-only',
      'unavailable',
    ]);
  });

  it('exposes closed action-handoff reason codes', () => {
    expect(ADOBE_SIGN_ACTION_HANDOFF_REASONS).toEqual([
      'eligible',
      'missing-agreement-id',
      'unsupported-required-action',
      'source-authorization-required',
      'source-unavailable',
      'principal-unresolved',
      'configuration-required',
    ]);
  });
});

describe('Adobe Sign Action Queue — status-to-action mapping', () => {
  it('maps each actionable Adobe status to its B04 normalized action', () => {
    expect(ADOBE_SIGN_STATUS_TO_REQUIRED_ACTION).toEqual({
      WAITING_FOR_MY_SIGNATURE: 'signature',
      WAITING_FOR_MY_APPROVAL: 'approval',
      WAITING_FOR_MY_ACCEPTANCE: 'acceptance',
      WAITING_FOR_MY_ACKNOWLEDGEMENT: 'acknowledgement',
      WAITING_FOR_MY_FORM_FILLING: 'form-filling',
      WAITING_FOR_MY_DELEGATION: 'delegation',
    });
  });

  it('covers every actionable Adobe status with no gaps', () => {
    for (const status of ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES) {
      const action: MyWorkAdobeSignRequiredAction = ADOBE_SIGN_STATUS_TO_REQUIRED_ACTION[status];
      expect((MY_WORK_ADOBE_SIGN_REQUIRED_ACTIONS as readonly string[]).includes(action)).toBe(
        true,
      );
    }
    expect(Object.keys(ADOBE_SIGN_STATUS_TO_REQUIRED_ACTION)).toHaveLength(6);
  });
});

describe('Adobe Sign Action Queue — DTO shapes', () => {
  it('accepts a fully populated queue item with required and optional fields', () => {
    const status: AdobeSignActionableRecipientStatus = 'WAITING_FOR_MY_SIGNATURE';
    const item: MyWorkAdobeSignActionQueueItem = {
      itemId: 'item-1',
      sourceSystem: 'adobe-sign',
      agreementId: 'agreement-1',
      agreementName: 'Master Services Agreement',
      requiredAction: ADOBE_SIGN_STATUS_TO_REQUIRED_ACTION[status],
      actionHandoff: { posture: 'resolve-on-click', reason: 'eligible' },
      adobeRecipientStatus: status,
      sender: {
        displayName: 'Jane Sender',
        emailAddress: 'jane@example.com',
      },
      createdAtUtc: '2026-05-13T10:00:00.000Z',
      modifiedAtUtc: '2026-05-13T10:30:00.000Z',
      expirationAtUtc: '2026-06-13T10:00:00.000Z',
      sourceOpenUrl: 'https://adobesign.example.com/agreement/1',
    };
    expect(item.sourceSystem).toBe('adobe-sign');
    expect(item.requiredAction).toBe('signature');
  });

  it('accepts a minimally populated queue item omitting optional fields', () => {
    const item: MyWorkAdobeSignActionQueueItem = {
      itemId: 'item-2',
      sourceSystem: 'adobe-sign',
      agreementId: 'agreement-2',
      agreementName: 'Subcontract Amendment',
      requiredAction: 'approval',
      actionHandoff: { posture: 'resolve-on-click', reason: 'eligible' },
      adobeRecipientStatus: 'WAITING_FOR_MY_APPROVAL',
    };
    expect(item.sender).toBeUndefined();
    expect(item.createdAtUtc).toBeUndefined();
    expect(item.modifiedAtUtc).toBeUndefined();
    expect(item.expirationAtUtc).toBeUndefined();
    expect(item.sourceOpenUrl).toBeUndefined();
  });

  it('accepts a queue summary with all eight count fields and a count basis', () => {
    const summary: MyWorkAdobeSignActionQueueSummary = {
      countBasis: 'returned-items',
      totalActionItemCount: 8,
      signatureCount: 3,
      approvalCount: 2,
      acceptanceCount: 1,
      acknowledgementCount: 1,
      formFillingCount: 0,
      delegationCount: 1,
      expiringSoonCount: 2,
    };
    expect(summary.countBasis).toBe('returned-items');
    expect(
      summary.signatureCount +
        summary.approvalCount +
        summary.acceptanceCount +
        summary.acknowledgementCount +
        summary.formFillingCount +
        summary.delegationCount,
    ).toBe(summary.totalActionItemCount);
  });

  it('accepts a provider-total summary count basis', () => {
    const summary: MyWorkAdobeSignActionQueueSummary = {
      countBasis: 'provider-total',
      totalActionItemCount: 42,
      signatureCount: 10,
      approvalCount: 10,
      acceptanceCount: 5,
      acknowledgementCount: 7,
      formFillingCount: 5,
      delegationCount: 5,
      expiringSoonCount: 4,
    };
    expect(summary.countBasis).toBe('provider-total');
  });

  it('accepts pagination with and without nextCursor', () => {
    const withCursor: MyWorkAdobeSignActionQueuePagination = {
      pageSize: 25,
      hasMore: true,
      nextCursor: 'opaque-token',
    };
    const withoutCursor: MyWorkAdobeSignActionQueuePagination = {
      pageSize: 25,
      hasMore: false,
    };
    expect(withCursor.nextCursor).toBe('opaque-token');
    expect(withoutCursor.nextCursor).toBeUndefined();
  });
});

describe('Adobe Sign Action Queue — freshness vocabulary', () => {
  it('accepts the B04 + B05.15 freshness states (fresh, aging, stale, unknown)', () => {
    const states: readonly MyWorkFreshnessState[] = ['fresh', 'aging', 'stale', 'unknown'];
    for (const state of states) {
      const freshness: MyWorkAdobeSignActionQueueFreshness = {
        state,
        generatedAtUtc: '2026-05-13T10:00:00.000Z',
      };
      expect(freshness.state).toBe(state);
    }
  });

  it('accepts an optional lastSuccessfulSourceReadAtUtc on freshness', () => {
    const freshness: MyWorkAdobeSignActionQueueFreshness = {
      state: 'stale',
      generatedAtUtc: '2026-05-13T10:00:00.000Z',
      lastSuccessfulSourceReadAtUtc: '2026-05-12T22:00:00.000Z',
    };
    expect(freshness.lastSuccessfulSourceReadAtUtc).toBe('2026-05-12T22:00:00.000Z');
  });
});

describe('Adobe Sign Action Queue — focused read model', () => {
  it('locks the moduleId to adobe-sign-action-queue', () => {
    const readModel: MyWorkAdobeSignActionQueueReadModel = {
      moduleId: 'adobe-sign-action-queue',
      summary: {
        countBasis: 'returned-items',
        totalActionItemCount: 0,
        signatureCount: 0,
        approvalCount: 0,
        acceptanceCount: 0,
        acknowledgementCount: 0,
        formFillingCount: 0,
        delegationCount: 0,
        expiringSoonCount: 0,
      },
      items: [],
      pagination: { pageSize: 25, hasMore: false },
      freshness: {
        state: 'fresh',
        generatedAtUtc: '2026-05-13T10:00:00.000Z',
      },
    };
    expect(readModel.moduleId).toBe('adobe-sign-action-queue');
  });
});

describe('Adobe Sign Action Queue — contract purity', () => {
  it('does not import runtime fetch, OAuth, or provider modules', () => {
    const forbidden = [
      'fetch(',
      'axios',
      'msal',
      '@pnp/',
      'pnpjs',
      'oauth',
      'AcquireToken',
      'getToken',
    ];
    for (const needle of forbidden) {
      expect(moduleSourceCode.toLowerCase()).not.toContain(needle.toLowerCase());
    }
  });

  it('does not import from app, backend, or feature-package surfaces', () => {
    const forbiddenPaths = [
      "from 'apps/",
      "from 'backend/",
      "from 'packages/features/",
      "from '@hbc/my-work-feed",
      "from '@hbc/sharepoint-docs",
      "from '@hbc/bic-next-move",
    ];
    for (const needle of forbiddenPaths) {
      expect(moduleSourceCode).not.toContain(needle);
    }
  });
});
