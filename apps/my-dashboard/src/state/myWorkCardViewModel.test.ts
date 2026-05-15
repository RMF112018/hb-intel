import { describe, expect, it } from 'vitest';

import {
  MY_WORK_HOME_AUTHORIZATION_REQUIRED,
  MY_WORK_HOME_AVAILABLE,
  MY_WORK_HOME_BACKEND_UNAVAILABLE,
  MY_WORK_HOME_CONFIGURATION_REQUIRED,
  MY_WORK_HOME_EMPTY,
  MY_WORK_HOME_PARTIAL,
  MY_WORK_HOME_PRINCIPAL_UNRESOLVED,
} from '@hbc/models/myWork/fixtures';
import type {
  MyWorkAdobeSignActionQueueItem,
  MyWorkReadModelSourceStatus,
} from '@hbc/models/myWork';

import {
  formatGeneratedAtUtc,
  pluralize,
  requiredActionLabel,
  selectAdobeAgreementListVmFromItems,
  selectAdobeQueueSummaryVmFromSummary,
  selectAdobeSignActionQueueStateCopy,
  selectAdobeSignSourceStatus,
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
});

describe('selectAdobeSignSourceStatus', () => {
  it('returns undefined when the envelope is undefined', () => {
    expect(selectAdobeSignSourceStatus(undefined)).toBeUndefined();
  });

  it('returns the Adobe Sign source status from the home envelope sourceReadiness array', () => {
    expect(selectAdobeSignSourceStatus(MY_WORK_HOME_AVAILABLE)).toBe('available');
    expect(selectAdobeSignSourceStatus(MY_WORK_HOME_AUTHORIZATION_REQUIRED)).toBe(
      'authorization-required',
    );
    expect(selectAdobeSignSourceStatus(MY_WORK_HOME_CONFIGURATION_REQUIRED)).toBe(
      'configuration-required',
    );
    expect(selectAdobeSignSourceStatus(MY_WORK_HOME_PRINCIPAL_UNRESOLVED)).toBe(
      'principal-unresolved',
    );
    expect(selectAdobeSignSourceStatus(MY_WORK_HOME_BACKEND_UNAVAILABLE)).toBe(
      'backend-unavailable',
    );
    expect(selectAdobeSignSourceStatus(MY_WORK_HOME_PARTIAL)).toBe('partial');
  });
});

describe('selectAdobeQueueSummaryVmFromSummary', () => {
  it('returns nulls when summary is undefined', () => {
    const vm = selectAdobeQueueSummaryVmFromSummary(undefined);
    expect(vm.pendingAgreementsCount).toBeNull();
    expect(vm.signatureActionsCount).toBeNull();
    expect(vm.reviewActionsCount).toBeNull();
    expect(vm.lastRefreshedLabel).toBe('Pending source connection');
  });

  it('sums review-class actions for the available home projection summary', () => {
    const env = MY_WORK_HOME_AVAILABLE;
    const vm = selectAdobeQueueSummaryVmFromSummary(
      env.data.adobeSignActionQueue.summary,
      env.generatedAtUtc,
    );
    expect(vm.pendingAgreementsCount).toBe(6);
    expect(vm.signatureActionsCount).toBe(1);
    // approvalCount(1) + acceptanceCount(1) + acknowledgementCount(1) = 3
    expect(vm.reviewActionsCount).toBe(3);
    expect(vm.lastRefreshedLabel).not.toBe('Pending source connection');
  });

  it('sums review-class actions for the partial home projection summary (1+1+0)', () => {
    const env = MY_WORK_HOME_PARTIAL;
    const vm = selectAdobeQueueSummaryVmFromSummary(
      env.data.adobeSignActionQueue.summary,
      env.generatedAtUtc,
    );
    expect(vm.pendingAgreementsCount).toBe(3);
    expect(vm.signatureActionsCount).toBe(1);
    // approvalCount(1) + acceptanceCount(1) + acknowledgementCount(0) = 2
    expect(vm.reviewActionsCount).toBe(2);
  });

  it('returns all zeros for the empty home projection summary', () => {
    const env = MY_WORK_HOME_EMPTY;
    const vm = selectAdobeQueueSummaryVmFromSummary(
      env.data.adobeSignActionQueue.summary,
      env.generatedAtUtc,
    );
    expect(vm.pendingAgreementsCount).toBe(0);
    expect(vm.signatureActionsCount).toBe(0);
    expect(vm.reviewActionsCount).toBe(0);
  });
});

describe('selectAdobeAgreementListVmFromItems', () => {
  it('returns isEmpty=true and empty items when items is undefined', () => {
    const vm = selectAdobeAgreementListVmFromItems(undefined);
    expect(vm.items).toEqual([]);
    expect(vm.isEmpty).toBe(true);
    expect(vm.hasMore).toBe(false);
  });

  it('returns isEmpty=true for an empty items array', () => {
    const vm = selectAdobeAgreementListVmFromItems([]);
    expect(vm.items).toEqual([]);
    expect(vm.isEmpty).toBe(true);
  });

  it('returns mapped items for an available home projection', () => {
    const env = MY_WORK_HOME_AVAILABLE;
    const vm = selectAdobeAgreementListVmFromItems(env.data.adobeSignActionQueue.previewItems);
    expect(vm.items.length).toBeGreaterThan(0);
    expect(vm.isEmpty).toBe(false);
    const first = vm.items[0];
    expect(typeof first.itemId).toBe('string');
    expect(first.agreementName.length).toBeGreaterThan(0);
    expect(first.requiredActionLabel.length).toBeGreaterThan(0);
  });

  it('maps sourceOpenUrl through from the read-model item when present', () => {
    const items: readonly MyWorkAdobeSignActionQueueItem[] = [
      {
        itemId: 'agreement-with-url',
        sourceSystem: 'adobe-sign',
        agreementId: 'agreement-1',
        agreementName: 'Test Agreement',
        requiredAction: 'signature',
        adobeRecipientStatus: 'WAITING_FOR_MY_SIGNATURE',
        sourceOpenUrl: 'https://secure.adobesign.com/public/agreement/agreement-1',
      },
    ];
    const vm = selectAdobeAgreementListVmFromItems(items);
    expect(vm.items).toHaveLength(1);
    expect(vm.items[0].sourceOpenUrl).toBe(
      'https://secure.adobesign.com/public/agreement/agreement-1',
    );
  });

  it('leaves sourceOpenUrl undefined when the read-model item omits it', () => {
    const items: readonly MyWorkAdobeSignActionQueueItem[] = [
      {
        itemId: 'agreement-no-url',
        sourceSystem: 'adobe-sign',
        agreementId: 'agreement-2',
        agreementName: 'Test Agreement 2',
        requiredAction: 'approval',
        adobeRecipientStatus: 'WAITING_FOR_MY_APPROVAL',
      },
    ];
    const vm = selectAdobeAgreementListVmFromItems(items);
    expect(vm.items).toHaveLength(1);
    expect(vm.items[0].sourceOpenUrl).toBeUndefined();
  });

  it('reflects the explicit hasMore argument', () => {
    const env = MY_WORK_HOME_AVAILABLE;
    expect(
      selectAdobeAgreementListVmFromItems(env.data.adobeSignActionQueue.previewItems, false)
        .hasMore,
    ).toBe(false);
    expect(
      selectAdobeAgreementListVmFromItems(env.data.adobeSignActionQueue.previewItems, true).hasMore,
    ).toBe(true);
  });

  it('maps senderLabel from the sender displayName when present', () => {
    const items: readonly MyWorkAdobeSignActionQueueItem[] = [
      {
        itemId: 'with-sender',
        sourceSystem: 'adobe-sign',
        agreementId: 'a',
        agreementName: 'Agreement',
        requiredAction: 'signature',
        adobeRecipientStatus: 'WAITING_FOR_MY_SIGNATURE',
        sender: { displayName: 'Alex Vendor' },
      },
    ];
    const vm = selectAdobeAgreementListVmFromItems(items);
    expect(vm.items[0].senderLabel).toBe('Alex Vendor');
  });

  it('maps expiresLabel from expirationAtUtc when present', () => {
    const items: readonly MyWorkAdobeSignActionQueueItem[] = [
      {
        itemId: 'with-expiration',
        sourceSystem: 'adobe-sign',
        agreementId: 'a',
        agreementName: 'Agreement',
        requiredAction: 'signature',
        adobeRecipientStatus: 'WAITING_FOR_MY_SIGNATURE',
        expirationAtUtc: '2026-12-31T23:59:59Z',
      },
    ];
    const vm = selectAdobeAgreementListVmFromItems(items);
    expect(vm.items[0].expiresLabel).not.toBeNull();
    expect(vm.items[0].expiresLabel).toMatch(/2026/);
  });
});

describe('selectAdobeSignActionQueueStateCopy', () => {
  it('returns the locked authorization-required copy + visible CTA when hasOnConnect=true', () => {
    const copy = selectAdobeSignActionQueueStateCopy('authorization-required', true);
    expect(copy.badge).toBe('Connect required');
    expect(copy.body).toBe(
      'Connect Adobe Sign to load agreements that need your review, signature, approval, or other action.',
    );
    expect(copy.ctaLabel).toBe('Connect Adobe Sign');
    expect(copy.ctaVisible).toBe(true);
  });

  it('suppresses the CTA when hasOnConnect=false even for authorization-required', () => {
    const copy = selectAdobeSignActionQueueStateCopy('authorization-required', false);
    expect(copy.ctaVisible).toBe(false);
  });

  it('returns the locked configuration-required copy with no CTA', () => {
    const copy = selectAdobeSignActionQueueStateCopy('configuration-required', true);
    expect(copy.badge).toBe('Configuration required');
    expect(copy.body).toBe('Adobe Sign must be configured before your action queue can load.');
    expect(copy.ctaVisible).toBe(false);
  });

  it('returns the locked principal-unresolved copy + secondary administrator line', () => {
    const copy = selectAdobeSignActionQueueStateCopy('principal-unresolved', false);
    expect(copy.badge).toBe('Account needs attention');
    expect(copy.body).toBe(
      'Your HB account could not be matched to an Adobe Sign user for this queue.',
    );
    expect(copy.secondaryBody).toBe('Contact an administrator if this persists.');
    expect(copy.ctaVisible).toBe(false);
  });

  it('returns the locked source-unavailable copy', () => {
    const copy = selectAdobeSignActionQueueStateCopy('source-unavailable', false);
    expect(copy.badge).toBe('Temporarily unavailable');
    expect(copy.body).toContain('Adobe Sign is temporarily unavailable');
    expect(copy.ctaVisible).toBe(false);
  });

  it('returns the locked backend-unavailable copy', () => {
    const copy = selectAdobeSignActionQueueStateCopy('backend-unavailable', false);
    expect(copy.badge).toBe('Temporarily unavailable');
    expect(copy.body).toContain('The My Dashboard service is not responding');
    expect(copy.ctaVisible).toBe(false);
  });

  it('returns the locked partial-data copy', () => {
    const copy = selectAdobeSignActionQueueStateCopy('partial', false);
    expect(copy.badge).toBe('Partial data');
    expect(copy.body).toContain('Some queue details may be incomplete');
    expect(copy.ctaVisible).toBe(false);
  });

  it('returns the locked available copy (Ready badge, empty body)', () => {
    const copy = selectAdobeSignActionQueueStateCopy('available', false);
    expect(copy.badge).toBe('Ready');
    expect(copy.body).toBe('');
    expect(copy.ctaVisible).toBe(false);
  });

  it('falls back to the backend-unavailable copy for an unknown / missing status', () => {
    const copy = selectAdobeSignActionQueueStateCopy(undefined, false);
    expect(copy.badge).toBe('Temporarily unavailable');
    expect(copy.body).toContain('The My Dashboard service is not responding');
  });

  it('never uses the word "live" (HB read-model copy rule)', () => {
    const all: MyWorkReadModelSourceStatus[] = [
      'available',
      'partial',
      'configuration-required',
      'authorization-required',
      'principal-unresolved',
      'source-unavailable',
      'backend-unavailable',
    ];
    for (const s of all) {
      const copy = selectAdobeSignActionQueueStateCopy(s, false);
      expect(copy.badge.toLowerCase()).not.toContain('live');
      expect(copy.body.toLowerCase()).not.toContain('live');
      if (copy.secondaryBody) {
        expect(copy.secondaryBody.toLowerCase()).not.toContain('live');
      }
    }
  });
});
