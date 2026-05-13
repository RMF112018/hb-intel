/**
 * Envelope-aware hero view-model selectors for the My Work shell.
 *
 * The production shell composes its hero band from these selectors so the
 * hero — the highest-salience runtime status surface — reflects the active
 * route's actual read-model envelope and source status rather than a static
 * "Pending source connection" preview. Each selector consumes an
 * `EnvelopeState<T>` and returns a complete `IMyWorkHeroViewModel`:
 * `loading`, `error`, and `success` for every `MyWorkReadModelSourceStatus`.
 *
 * Identity copy (primary/secondary title, description, governance
 * microcopy) is stable per route — the variable surface is the four
 * highlight values. Highlights re-use the closed-set status copy from
 * `sourceStatusCopy(...)` so non-ready guidance never collapses into a
 * generic "pending connection" message.
 *
 * Pure: no React, no I/O.
 *
 * @module state/myWorkHeroViewModel
 */

import {
  getMyWorkModule,
  getMyWorkPrimaryNavigationSurface,
  type MyWorkAdobeSignActionQueueReadModel,
  type MyWorkHomeReadModel,
} from '@hbc/models/myWork';

import type { EnvelopeState } from '../runtime/useMyWorkReadModelEnvelope.js';
import type {
  IMyWorkHeroHighlight,
  IMyWorkHeroMicrocopy,
  IMyWorkHeroViewModel,
} from '../shell/MyWorkHeroBand.js';

import { formatGeneratedAtUtc, sourceStatusCopy } from './myWorkCardViewModel.js';

const ADOBE_MODULE = getMyWorkModule('adobe-sign-action-queue');
const MY_WORK_HOME_SURFACE = getMyWorkPrimaryNavigationSurface('my-work-home');

const HERO_PRIMARY_TITLE = 'My Dashboard';
const HOME_GOVERNANCE: readonly IMyWorkHeroMicrocopy[] = Object.freeze([
  Object.freeze({
    id: 'home-read-only',
    text: 'Read-only work visibility · Source actions remain in their governing systems.',
  }),
]);
const FOCUSED_GOVERNANCE: readonly IMyWorkHeroMicrocopy[] = Object.freeze([
  Object.freeze({
    id: 'focused-queue-visibility',
    text: 'Queue visibility only · Agreement actions remain in Adobe Sign.',
  }),
]);

const LOADING_VALUE = 'Loading…';
const ERROR_VALUE = 'Unavailable';

function highlight(id: string, label: string, value: string): IMyWorkHeroHighlight {
  return Object.freeze({ id, label, value });
}

// ─── Home hero ────────────────────────────────────────────────────────────

export function selectMyWorkHomeHeroViewModel(
  state: EnvelopeState<MyWorkHomeReadModel>,
): IMyWorkHeroViewModel {
  const identity = {
    primaryTitle: HERO_PRIMARY_TITLE,
    secondaryTitle: 'My Work',
    description: MY_WORK_HOME_SURFACE.dashboardDescription,
    governanceMicrocopy: HOME_GOVERNANCE,
  } as const;

  if (state.status === 'loading') {
    return {
      ...identity,
      heroHighlights: Object.freeze([
        highlight('actionable-items', 'Actionable items', LOADING_VALUE),
        highlight('connected-sources', 'Connected sources', ADOBE_MODULE.sourceSystem),
        highlight('source-health', 'Source health', LOADING_VALUE),
        highlight('last-refreshed', 'Last refreshed', LOADING_VALUE),
      ]),
    };
  }
  if (state.status === 'error') {
    return {
      ...identity,
      heroHighlights: Object.freeze([
        highlight('actionable-items', 'Actionable items', ERROR_VALUE),
        highlight('connected-sources', 'Connected sources', ADOBE_MODULE.sourceSystem),
        highlight('source-health', 'Source health', ERROR_VALUE),
        highlight('last-refreshed', 'Last refreshed', ERROR_VALUE),
      ]),
    };
  }

  const env = state.envelope;
  const status = env.sourceStatus;
  const copy = sourceStatusCopy(status);
  const isReady = status === 'available' || status === 'partial';

  const actionableItemsValue = isReady
    ? String(env.data.summary.totalActionItemCount)
    : copy.stateLabel;
  const sourceHealthValue = copy.stateLabel;
  const lastRefreshedValue = formatGeneratedAtUtc(env.generatedAtUtc);

  return {
    ...identity,
    heroHighlights: Object.freeze([
      highlight('actionable-items', 'Actionable items', actionableItemsValue),
      highlight('connected-sources', 'Connected sources', ADOBE_MODULE.sourceSystem),
      highlight('source-health', 'Source health', sourceHealthValue),
      highlight('last-refreshed', 'Last refreshed', lastRefreshedValue),
    ]),
  };
}

// ─── Focused Adobe Sign hero ──────────────────────────────────────────────

export function selectMyWorkFocusedAdobeHeroViewModel(
  state: EnvelopeState<MyWorkAdobeSignActionQueueReadModel>,
): IMyWorkHeroViewModel {
  const identity = {
    primaryTitle: HERO_PRIMARY_TITLE,
    secondaryTitle: ADOBE_MODULE.label,
    description: ADOBE_MODULE.summary,
    governanceMicrocopy: FOCUSED_GOVERNANCE,
  } as const;

  if (state.status === 'loading') {
    return {
      ...identity,
      heroHighlights: Object.freeze([
        highlight('queue-state', 'Queue state', LOADING_VALUE),
        highlight('pending-items', 'Pending items', LOADING_VALUE),
        highlight('last-refreshed', 'Last refreshed', LOADING_VALUE),
        highlight('action-system', 'Action system', ADOBE_MODULE.sourceSystem),
      ]),
    };
  }
  if (state.status === 'error') {
    return {
      ...identity,
      heroHighlights: Object.freeze([
        highlight('queue-state', 'Queue state', ERROR_VALUE),
        highlight('pending-items', 'Pending items', ERROR_VALUE),
        highlight('last-refreshed', 'Last refreshed', ERROR_VALUE),
        highlight('action-system', 'Action system', ADOBE_MODULE.sourceSystem),
      ]),
    };
  }

  const env = state.envelope;
  const status = env.sourceStatus;
  const copy = sourceStatusCopy(status);
  const isReady = status === 'available' || status === 'partial';

  const queueStateValue = copy.stateLabel;
  const pendingItemsValue = isReady
    ? String(env.data.summary.totalActionItemCount)
    : copy.stateLabel;
  const lastRefreshedValue = formatGeneratedAtUtc(env.generatedAtUtc);

  return {
    ...identity,
    heroHighlights: Object.freeze([
      highlight('queue-state', 'Queue state', queueStateValue),
      highlight('pending-items', 'Pending items', pendingItemsValue),
      highlight('last-refreshed', 'Last refreshed', lastRefreshedValue),
      highlight('action-system', 'Action system', ADOBE_MODULE.sourceSystem),
    ]),
  };
}
