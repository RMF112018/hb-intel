import { describe, expect, it } from 'vitest';

import {
  ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED,
  ADOBE_SIGN_QUEUE_AVAILABLE,
  ADOBE_SIGN_QUEUE_AVAILABLE_PAGED,
  ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE,
  ADOBE_SIGN_QUEUE_CONFIGURATION_REQUIRED,
  ADOBE_SIGN_QUEUE_EMPTY,
  ADOBE_SIGN_QUEUE_PARTIAL,
  MY_WORK_HOME_AUTHORIZATION_REQUIRED,
  MY_WORK_HOME_AVAILABLE,
  MY_WORK_HOME_BACKEND_UNAVAILABLE,
  MY_WORK_HOME_CONFIGURATION_REQUIRED,
  MY_WORK_HOME_EMPTY,
  MY_WORK_HOME_PARTIAL,
  MY_WORK_HOME_PRINCIPAL_UNRESOLVED,
} from '@hbc/models/myWork/fixtures';
import type { MyWorkReadModelSourceStatus } from '@hbc/models/myWork';

import {
  formatGeneratedAtUtc,
  pluralize,
  requiredActionLabel,
  selectAdobeAgreementListVm,
  selectAdobeQueueHomeVm,
  selectAdobeQueueStateVmFromHome,
  selectAdobeQueueStateVmFromQueue,
  selectAdobeQueueSummaryVm,
  selectConnectionGuidanceVm,
  selectSourceReadinessVm,
  selectWorkSummaryVm,
  sourceStatusCopy,
} from './myWorkCardViewModel.js';

describe('formatGeneratedAtUtc', () => {
  it('returns the fallback string when the timestamp is undefined', () => {
    expect(formatGeneratedAtUtc(undefined)).toBe('Pending source connection');
  });

  it('returns the fallback string when the timestamp is an invalid ISO value', () => {
    expect(formatGeneratedAtUtc('not-a-date')).toBe('Pending source connection');
  });

  it('returns a stable UTC-anchored label for valid ISO timestamps', () => {
    const formatted = formatGeneratedAtUtc('2026-05-12T12:00:00.000Z');
    // Anchor to UTC — never local. Exact wording may vary by Intl version
    // (e.g., "UTC" vs "Coordinated Universal Time" depending on host), so
    // assert structural anchoring rather than literal output.
    expect(formatted).toMatch(/UTC|Coordinated Universal Time/);
    expect(formatted).toContain('2026');
  });
});

describe('pluralize', () => {
  it('returns the singular form for n=1', () => {
    expect(pluralize(1, 'item', 'items')).toBe('item');
  });

  it('returns the plural form for n=0', () => {
    expect(pluralize(0, 'item', 'items')).toBe('items');
  });

  it('returns the plural form for n>1', () => {
    expect(pluralize(2, 'item', 'items')).toBe('items');
    expect(pluralize(99, 'item', 'items')).toBe('items');
  });
});

describe('requiredActionLabel', () => {
  it('maps each MyWorkAdobeSignRequiredAction value to a non-empty label', () => {
    expect(requiredActionLabel('signature')).toBe('Signature required');
    expect(requiredActionLabel('approval')).toBe('Approval required');
    expect(requiredActionLabel('acceptance')).toBe('Acceptance required');
    expect(requiredActionLabel('acknowledgement')).toBe('Acknowledgement required');
    expect(requiredActionLabel('form-filling')).toBe('Form filling required');
    expect(requiredActionLabel('delegation')).toBe('Delegation required');
  });
});

describe('sourceStatusCopy', () => {
  const allStatuses: MyWorkReadModelSourceStatus[] = [
    'available',
    'partial',
    'configuration-required',
    'authorization-required',
    'principal-unresolved',
    'source-unavailable',
    'backend-unavailable',
  ];

  it('returns a non-empty stateLabel and guidance for every status', () => {
    for (const s of allStatuses) {
      const copy = sourceStatusCopy(s);
      expect(copy.stateLabel.length).toBeGreaterThan(0);
      expect(copy.guidance.length).toBeGreaterThan(0);
    }
  });

  it('sets ctaApplicable=true only for authorization-required', () => {
    for (const s of allStatuses) {
      expect(sourceStatusCopy(s).ctaApplicable).toBe(s === 'authorization-required');
    }
  });

  it('returns a stable "unknown" copy when the status is undefined', () => {
    const copy = sourceStatusCopy(undefined);
    expect(copy.stateLabel).toBe('Source state unknown');
    expect(copy.ctaApplicable).toBe(false);
  });

  it('renders distinct stateLabels per status (no collision)', () => {
    const labels = new Set(allStatuses.map((s) => sourceStatusCopy(s).stateLabel));
    expect(labels.size).toBe(allStatuses.length);
  });

  it('never uses the word "live" (per HB read-model copy rule)', () => {
    for (const s of allStatuses) {
      const copy = sourceStatusCopy(s);
      expect(copy.stateLabel.toLowerCase()).not.toContain('live');
      expect(copy.guidance.toLowerCase()).not.toContain('live');
    }
  });
});

describe('selectWorkSummaryVm', () => {
  it('returns null actionItemCount + pending refresh when envelope is undefined', () => {
    const vm = selectWorkSummaryVm(undefined);
    expect(vm.actionItemCount).toBeNull();
    expect(vm.lastRefreshedLabel).toBe('Pending source connection');
    expect(vm.connectedSourcesLabel).toBe('Adobe Sign');
  });

  it('returns the total action item count from an "available" home envelope', () => {
    const vm = selectWorkSummaryVm(MY_WORK_HOME_AVAILABLE);
    expect(vm.actionItemCount).toBe(6);
    expect(vm.lastRefreshedLabel).not.toBe('Pending source connection');
  });

  it('returns 0 (not null) for a truthful empty home envelope', () => {
    const vm = selectWorkSummaryVm(MY_WORK_HOME_EMPTY);
    expect(vm.actionItemCount).toBe(0);
  });

  it('returns 0 (not null) for a non-ready home envelope (authorization-required)', () => {
    const vm = selectWorkSummaryVm(MY_WORK_HOME_AUTHORIZATION_REQUIRED);
    expect(vm.actionItemCount).toBe(0);
  });
});

describe('selectSourceReadinessVm', () => {
  it('returns empty items when envelope is undefined', () => {
    expect(selectSourceReadinessVm(undefined).items).toEqual([]);
  });

  it('emits one item per source (adobe-sign) when home envelope is available', () => {
    const vm = selectSourceReadinessVm(MY_WORK_HOME_AVAILABLE);
    expect(vm.items).toHaveLength(1);
    expect(vm.items[0].sourceSystem).toBe('adobe-sign');
    expect(vm.items[0].label).toBe('Adobe Sign');
    expect(vm.items[0].sourceStatus).toBe('available');
    expect(vm.items[0].statusCopy.ctaApplicable).toBe(false);
  });

  it('marks ctaApplicable=true for authorization-required posture', () => {
    const vm = selectSourceReadinessVm(MY_WORK_HOME_AUTHORIZATION_REQUIRED);
    expect(vm.items[0].sourceStatus).toBe('authorization-required');
    expect(vm.items[0].statusCopy.ctaApplicable).toBe(true);
  });

  it('emits a partial-status item for the partial home envelope', () => {
    const vm = selectSourceReadinessVm(MY_WORK_HOME_PARTIAL);
    expect(vm.items[0].sourceStatus).toBe('partial');
    expect(vm.items[0].statusCopy.stateLabel).toBe('Partial data');
  });
});

describe('selectAdobeQueueHomeVm', () => {
  it('returns nulls when envelope is undefined', () => {
    const vm = selectAdobeQueueHomeVm(undefined);
    expect(vm.pendingAgreementsCount).toBeNull();
    expect(vm.awaitingActionCount).toBeNull();
    expect(vm.lastRefreshedLabel).toBe('Pending source connection');
  });

  it('returns 6/6 for the available home envelope', () => {
    const vm = selectAdobeQueueHomeVm(MY_WORK_HOME_AVAILABLE);
    expect(vm.pendingAgreementsCount).toBe(6);
    expect(vm.awaitingActionCount).toBe(6);
  });

  it('returns 0/0 for the empty home envelope', () => {
    const vm = selectAdobeQueueHomeVm(MY_WORK_HOME_EMPTY);
    expect(vm.pendingAgreementsCount).toBe(0);
    expect(vm.awaitingActionCount).toBe(0);
  });
});

describe('selectAdobeQueueSummaryVm', () => {
  it('returns nulls when envelope is undefined', () => {
    const vm = selectAdobeQueueSummaryVm(undefined);
    expect(vm.pendingAgreementsCount).toBeNull();
    expect(vm.signatureActionsCount).toBeNull();
    expect(vm.reviewActionsCount).toBeNull();
  });

  it('sums review-class actions (approval + acceptance + acknowledgement) for an available queue', () => {
    const vm = selectAdobeQueueSummaryVm(ADOBE_SIGN_QUEUE_AVAILABLE);
    expect(vm.pendingAgreementsCount).toBe(6);
    expect(vm.signatureActionsCount).toBe(1);
    // approvalCount(1) + acceptanceCount(1) + acknowledgementCount(1) = 3
    expect(vm.reviewActionsCount).toBe(3);
  });

  it('returns all zeros for the empty queue envelope', () => {
    const vm = selectAdobeQueueSummaryVm(ADOBE_SIGN_QUEUE_EMPTY);
    expect(vm.pendingAgreementsCount).toBe(0);
    expect(vm.signatureActionsCount).toBe(0);
    expect(vm.reviewActionsCount).toBe(0);
  });
});

describe('selectAdobeAgreementListVm', () => {
  it('returns isEmpty=true and empty items when envelope is undefined', () => {
    const vm = selectAdobeAgreementListVm(undefined);
    expect(vm.items).toEqual([]);
    expect(vm.isEmpty).toBe(true);
    expect(vm.hasMore).toBe(false);
  });

  it('returns 6 items + isEmpty=false for the available queue envelope', () => {
    const vm = selectAdobeAgreementListVm(ADOBE_SIGN_QUEUE_AVAILABLE);
    expect(vm.items).toHaveLength(6);
    expect(vm.isEmpty).toBe(false);
    expect(vm.hasMore).toBe(false);
    // Spot-check item shape on the first agreement
    const first = vm.items[0];
    expect(typeof first.itemId).toBe('string');
    expect(first.agreementName.length).toBeGreaterThan(0);
    expect(first.requiredActionLabel.length).toBeGreaterThan(0);
  });

  it('reflects hasMore=true for a paged available envelope', () => {
    const vm = selectAdobeAgreementListVm(ADOBE_SIGN_QUEUE_AVAILABLE_PAGED);
    expect(vm.items.length).toBeGreaterThan(0);
    expect(vm.hasMore).toBe(true);
  });

  it('returns isEmpty=true for a truthful empty queue (sourceStatus=available, items=[])', () => {
    const vm = selectAdobeAgreementListVm(ADOBE_SIGN_QUEUE_EMPTY);
    expect(vm.items).toEqual([]);
    expect(vm.isEmpty).toBe(true);
  });

  it('returns isEmpty=true for an authorization-required (non-ready) queue', () => {
    const vm = selectAdobeAgreementListVm(ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED);
    expect(vm.items).toEqual([]);
    expect(vm.isEmpty).toBe(true);
  });
});

describe('selectAdobeQueueStateVmFromHome / FromQueue', () => {
  it('prefers the home envelope sourceReadiness status over the fallback', () => {
    const vm = selectAdobeQueueStateVmFromHome(
      MY_WORK_HOME_BACKEND_UNAVAILABLE,
      'configuration-required',
    );
    expect(vm.sourceStatus).toBe('backend-unavailable');
    expect(vm.stateLabel).toBe('Service unavailable');
  });

  it('falls back to the provided status when no home envelope is supplied', () => {
    const vm = selectAdobeQueueStateVmFromHome(undefined, 'configuration-required');
    expect(vm.sourceStatus).toBe('configuration-required');
    expect(vm.stateLabel).toBe('Configuration required');
  });

  it('uses the queue envelope sourceStatus directly when available', () => {
    const vm = selectAdobeQueueStateVmFromQueue(
      ADOBE_SIGN_QUEUE_CONFIGURATION_REQUIRED,
      'available',
    );
    expect(vm.sourceStatus).toBe('configuration-required');
    expect(vm.stateLabel).toBe('Configuration required');
  });

  it('falls back to the provided status when no queue envelope is supplied', () => {
    const vm = selectAdobeQueueStateVmFromQueue(undefined, 'authorization-required');
    expect(vm.sourceStatus).toBe('authorization-required');
    expect(vm.stateLabel).toBe('Authorization required');
  });

  it('returns the partial label for a partial queue envelope', () => {
    const vm = selectAdobeQueueStateVmFromQueue(ADOBE_SIGN_QUEUE_PARTIAL, undefined);
    expect(vm.sourceStatus).toBe('partial');
    expect(vm.stateLabel).toBe('Partial data');
  });
});

describe('selectConnectionGuidanceVm', () => {
  it('returns ctaVisible=true only for authorization-required', () => {
    expect(selectConnectionGuidanceVm('authorization-required').ctaVisible).toBe(true);
    expect(selectConnectionGuidanceVm('configuration-required').ctaVisible).toBe(false);
    expect(selectConnectionGuidanceVm('principal-unresolved').ctaVisible).toBe(false);
    expect(selectConnectionGuidanceVm('backend-unavailable').ctaVisible).toBe(false);
    expect(selectConnectionGuidanceVm('source-unavailable').ctaVisible).toBe(false);
    expect(selectConnectionGuidanceVm('partial').ctaVisible).toBe(false);
    expect(selectConnectionGuidanceVm('available').ctaVisible).toBe(false);
  });

  it('returns the matching headline for configuration-required', () => {
    const vm = selectConnectionGuidanceVm('configuration-required');
    expect(vm.headline).toBe('Configuration required');
    expect(vm.guidance).toContain('administrator');
  });

  it('returns the matching headline for principal-unresolved', () => {
    const vm = selectConnectionGuidanceVm('principal-unresolved');
    expect(vm.headline).toBe('Account not resolved');
  });

  it('returns a stable unknown headline when status is undefined', () => {
    const vm = selectConnectionGuidanceVm(undefined);
    expect(vm.headline).toBe('Source state unknown');
    expect(vm.ctaVisible).toBe(false);
  });
});

// Anchor preventing accidental regressions for partial-data path with fixtures
// reused by the surface tests.
describe('integration sanity (fixture coverage)', () => {
  it('preserves source-readiness ctaApplicable across all home non-ready fixtures', () => {
    const cases: Array<[typeof MY_WORK_HOME_CONFIGURATION_REQUIRED, boolean]> = [
      [MY_WORK_HOME_CONFIGURATION_REQUIRED, false],
      [MY_WORK_HOME_AUTHORIZATION_REQUIRED, true],
      [MY_WORK_HOME_PRINCIPAL_UNRESOLVED, false],
      [MY_WORK_HOME_BACKEND_UNAVAILABLE, false],
    ];
    for (const [env, expectedCta] of cases) {
      const vm = selectSourceReadinessVm(env);
      expect(vm.items[0].statusCopy.ctaApplicable).toBe(expectedCta);
    }
  });
});
