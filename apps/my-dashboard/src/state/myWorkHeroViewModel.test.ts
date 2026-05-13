import { describe, expect, it } from 'vitest';

import {
  ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED,
  ADOBE_SIGN_QUEUE_AVAILABLE,
  ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE,
  ADOBE_SIGN_QUEUE_CONFIGURATION_REQUIRED,
  ADOBE_SIGN_QUEUE_PRINCIPAL_UNRESOLVED,
  MY_WORK_HOME_AUTHORIZATION_REQUIRED,
  MY_WORK_HOME_AVAILABLE,
  MY_WORK_HOME_BACKEND_UNAVAILABLE,
  MY_WORK_HOME_CONFIGURATION_REQUIRED,
  MY_WORK_HOME_PARTIAL,
  MY_WORK_HOME_PRINCIPAL_UNRESOLVED,
} from '@hbc/models/myWork/fixtures';
import type {
  MyWorkAdobeSignActionQueueReadModel,
  MyWorkHomeReadModel,
  MyWorkReadModelEnvelope,
} from '@hbc/models/myWork';

import type { EnvelopeState } from '../runtime/useMyWorkReadModelEnvelope.js';

import {
  selectMyWorkFocusedAdobeHeroViewModel,
  selectMyWorkHomeHeroViewModel,
} from './myWorkHeroViewModel.js';

function loading<T>(): EnvelopeState<T> {
  return { status: 'loading', envelope: undefined, error: undefined };
}
function errored<T>(): EnvelopeState<T> {
  return { status: 'error', envelope: undefined, error: new Error('boom') };
}
function ok<T>(envelope: MyWorkReadModelEnvelope<T>): EnvelopeState<T> {
  return { status: 'success', envelope, error: undefined };
}

function highlightById(vm: ReturnType<typeof selectMyWorkHomeHeroViewModel>, id: string): string {
  const h = vm.heroHighlights.find((it) => it.id === id);
  if (!h) throw new Error(`missing highlight: ${id}`);
  return h.value;
}

const HOME_DESCRIPTION =
  'Your personal command surface for work requiring attention across connected HB systems.';
const FOCUSED_DESCRIPTION =
  'Agreements in Adobe Sign that require your review, signature, approval, or other source-defined action.';

describe('selectMyWorkHomeHeroViewModel — identity copy is stable', () => {
  it('returns the home identity copy regardless of envelope state', () => {
    const candidates: EnvelopeState<MyWorkHomeReadModel>[] = [
      loading(),
      errored(),
      ok(MY_WORK_HOME_AVAILABLE),
      ok(MY_WORK_HOME_AUTHORIZATION_REQUIRED),
    ];
    for (const state of candidates) {
      const vm = selectMyWorkHomeHeroViewModel(state);
      expect(vm.primaryTitle).toBe('My Dashboard');
      expect(vm.secondaryTitle).toBe('My Work');
      expect(vm.description).toBe(HOME_DESCRIPTION);
      expect(vm.governanceMicrocopy).toHaveLength(1);
      expect(vm.governanceMicrocopy[0].id).toBe('home-read-only');
      expect(vm.heroHighlights.map((h) => h.id)).toEqual([
        'actionable-items',
        'connected-sources',
        'source-health',
        'last-refreshed',
      ]);
      // connected-sources is constant across all states.
      expect(highlightById(vm, 'connected-sources')).toBe('Adobe Sign');
    }
  });
});

describe('selectMyWorkHomeHeroViewModel — state-driven highlights', () => {
  it('renders Loading… in variable highlights while the envelope is loading', () => {
    const vm = selectMyWorkHomeHeroViewModel(loading());
    expect(highlightById(vm, 'actionable-items')).toBe('Loading…');
    expect(highlightById(vm, 'source-health')).toBe('Loading…');
    expect(highlightById(vm, 'last-refreshed')).toBe('Loading…');
  });

  it('renders Unavailable in variable highlights when the envelope errored', () => {
    const vm = selectMyWorkHomeHeroViewModel(errored());
    expect(highlightById(vm, 'actionable-items')).toBe('Unavailable');
    expect(highlightById(vm, 'source-health')).toBe('Unavailable');
    expect(highlightById(vm, 'last-refreshed')).toBe('Unavailable');
  });

  it('renders the live actionable-items count and Connected source-health on `available`', () => {
    const vm = selectMyWorkHomeHeroViewModel(ok(MY_WORK_HOME_AVAILABLE));
    expect(highlightById(vm, 'actionable-items')).toBe('6');
    expect(highlightById(vm, 'source-health')).toBe('Connected');
    expect(highlightById(vm, 'last-refreshed')).not.toBe('Pending source connection');
  });

  it('renders the live count and Partial data source-health on `partial`', () => {
    const vm = selectMyWorkHomeHeroViewModel(ok(MY_WORK_HOME_PARTIAL));
    expect(highlightById(vm, 'actionable-items')).toBe('3');
    expect(highlightById(vm, 'source-health')).toBe('Partial data');
  });

  it('renders the status-derived label on `authorization-required`', () => {
    const vm = selectMyWorkHomeHeroViewModel(ok(MY_WORK_HOME_AUTHORIZATION_REQUIRED));
    expect(highlightById(vm, 'actionable-items')).toBe('Authorization required');
    expect(highlightById(vm, 'source-health')).toBe('Authorization required');
  });

  it('renders the status-derived label on `configuration-required`', () => {
    const vm = selectMyWorkHomeHeroViewModel(ok(MY_WORK_HOME_CONFIGURATION_REQUIRED));
    expect(highlightById(vm, 'actionable-items')).toBe('Configuration required');
    expect(highlightById(vm, 'source-health')).toBe('Configuration required');
  });

  it('renders the status-derived label on `principal-unresolved`', () => {
    const vm = selectMyWorkHomeHeroViewModel(ok(MY_WORK_HOME_PRINCIPAL_UNRESOLVED));
    expect(highlightById(vm, 'source-health')).toBe('Account not resolved');
  });

  it('renders the status-derived label on `backend-unavailable`', () => {
    const vm = selectMyWorkHomeHeroViewModel(ok(MY_WORK_HOME_BACKEND_UNAVAILABLE));
    expect(highlightById(vm, 'source-health')).toBe('Service unavailable');
  });

  it('never emits the legacy "Pending source connection" copy when envelope data is present', () => {
    for (const fixture of [
      MY_WORK_HOME_AVAILABLE,
      MY_WORK_HOME_PARTIAL,
      MY_WORK_HOME_AUTHORIZATION_REQUIRED,
      MY_WORK_HOME_CONFIGURATION_REQUIRED,
      MY_WORK_HOME_PRINCIPAL_UNRESOLVED,
      MY_WORK_HOME_BACKEND_UNAVAILABLE,
    ]) {
      const vm = selectMyWorkHomeHeroViewModel(ok(fixture));
      for (const h of vm.heroHighlights) {
        expect(h.value).not.toBe('Pending source connection');
      }
    }
  });
});

describe('selectMyWorkFocusedAdobeHeroViewModel — identity copy is stable', () => {
  it('returns the focused Adobe identity copy regardless of envelope state', () => {
    const candidates: EnvelopeState<MyWorkAdobeSignActionQueueReadModel>[] = [
      loading(),
      errored(),
      ok(ADOBE_SIGN_QUEUE_AVAILABLE),
      ok(ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED),
    ];
    for (const state of candidates) {
      const vm = selectMyWorkFocusedAdobeHeroViewModel(state);
      expect(vm.primaryTitle).toBe('My Dashboard');
      expect(vm.secondaryTitle).toBe('Adobe Sign Action Queue');
      expect(vm.description).toBe(FOCUSED_DESCRIPTION);
      expect(vm.governanceMicrocopy).toHaveLength(1);
      expect(vm.governanceMicrocopy[0].id).toBe('focused-queue-visibility');
      expect(vm.heroHighlights.map((h) => h.id)).toEqual([
        'queue-state',
        'pending-items',
        'last-refreshed',
        'action-system',
      ]);
      // action-system is constant across all states.
      expect(vm.heroHighlights.find((h) => h.id === 'action-system')?.value).toBe('Adobe Sign');
    }
  });
});

describe('selectMyWorkFocusedAdobeHeroViewModel — state-driven highlights', () => {
  it('renders Loading… in variable highlights while the envelope is loading', () => {
    const vm = selectMyWorkFocusedAdobeHeroViewModel(loading());
    expect(vm.heroHighlights.find((h) => h.id === 'queue-state')?.value).toBe('Loading…');
    expect(vm.heroHighlights.find((h) => h.id === 'pending-items')?.value).toBe('Loading…');
    expect(vm.heroHighlights.find((h) => h.id === 'last-refreshed')?.value).toBe('Loading…');
  });

  it('renders Unavailable when the envelope errored', () => {
    const vm = selectMyWorkFocusedAdobeHeroViewModel(errored());
    expect(vm.heroHighlights.find((h) => h.id === 'queue-state')?.value).toBe('Unavailable');
    expect(vm.heroHighlights.find((h) => h.id === 'pending-items')?.value).toBe('Unavailable');
    expect(vm.heroHighlights.find((h) => h.id === 'last-refreshed')?.value).toBe('Unavailable');
  });

  it('renders Connected and the live pending count on `available`', () => {
    const vm = selectMyWorkFocusedAdobeHeroViewModel(ok(ADOBE_SIGN_QUEUE_AVAILABLE));
    const queueState = vm.heroHighlights.find((h) => h.id === 'queue-state')!.value;
    const pendingItems = vm.heroHighlights.find((h) => h.id === 'pending-items')!.value;
    const lastRefreshed = vm.heroHighlights.find((h) => h.id === 'last-refreshed')!.value;
    expect(queueState).toBe('Connected');
    expect(pendingItems).toBe(String(ADOBE_SIGN_QUEUE_AVAILABLE.data.summary.totalActionItemCount));
    expect(lastRefreshed).not.toBe('Pending source connection');
  });

  it('renders Authorization required on `authorization-required`', () => {
    const vm = selectMyWorkFocusedAdobeHeroViewModel(ok(ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED));
    expect(vm.heroHighlights.find((h) => h.id === 'queue-state')?.value).toBe(
      'Authorization required',
    );
    expect(vm.heroHighlights.find((h) => h.id === 'pending-items')?.value).toBe(
      'Authorization required',
    );
  });

  it('renders Configuration required on `configuration-required`', () => {
    const vm = selectMyWorkFocusedAdobeHeroViewModel(ok(ADOBE_SIGN_QUEUE_CONFIGURATION_REQUIRED));
    expect(vm.heroHighlights.find((h) => h.id === 'queue-state')?.value).toBe(
      'Configuration required',
    );
  });

  it('renders Service unavailable on `backend-unavailable`', () => {
    const vm = selectMyWorkFocusedAdobeHeroViewModel(ok(ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE));
    expect(vm.heroHighlights.find((h) => h.id === 'queue-state')?.value).toBe(
      'Service unavailable',
    );
  });

  it('renders Account not resolved on `principal-unresolved`', () => {
    const vm = selectMyWorkFocusedAdobeHeroViewModel(ok(ADOBE_SIGN_QUEUE_PRINCIPAL_UNRESOLVED));
    expect(vm.heroHighlights.find((h) => h.id === 'queue-state')?.value).toBe(
      'Account not resolved',
    );
  });

  it('never emits the legacy "Pending source connection" copy when envelope data is present', () => {
    for (const fixture of [
      ADOBE_SIGN_QUEUE_AVAILABLE,
      ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED,
      ADOBE_SIGN_QUEUE_CONFIGURATION_REQUIRED,
      ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE,
      ADOBE_SIGN_QUEUE_PRINCIPAL_UNRESOLVED,
    ]) {
      const vm = selectMyWorkFocusedAdobeHeroViewModel(ok(fixture));
      for (const h of vm.heroHighlights) {
        expect(h.value).not.toBe('Pending source connection');
      }
    }
  });
});
