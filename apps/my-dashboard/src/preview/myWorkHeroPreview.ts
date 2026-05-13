/**
 * Visual / test fixtures for the My Work hero band.
 *
 * **Preview-only.** Do not import these constants from production
 * composition. The shell now derives its hero view-model from the active
 * route's read-model envelope via `selectMyWorkHomeHeroViewModel` /
 * `selectMyWorkFocusedAdobeHeroViewModel` (see
 * `state/myWorkHeroViewModel.ts`). These frozen constants remain only as
 * stable inputs for `MyWorkHeroBand` unit-render tests and ad-hoc visual
 * review contexts.
 *
 * @module preview/myWorkHeroPreview
 */

import { getMyWorkModule, getMyWorkPrimaryNavigationSurface } from '@hbc/models/myWork';
import type { IMyWorkHeroViewModel } from '../shell/MyWorkHeroBand.js';

/**
 * Visible product copy used as a stable placeholder in preview/test renders.
 * Reads as a real source-connection state to users; never `TODO`, `mock`,
 * or `placeholder`. Production rendering never emits this string for any
 * envelope state — `state/myWorkHeroViewModel.ts` uses status-derived copy
 * (`Loading…`, `Unavailable`, `Authorization required`, etc.) instead.
 */
const PENDING_VALUE = 'Pending source connection';

const ADOBE_MODULE = getMyWorkModule('adobe-sign-action-queue');
const MY_WORK_HOME_SURFACE = getMyWorkPrimaryNavigationSurface('my-work-home');

export const MY_WORK_HOME_HERO_PREVIEW_VIEW_MODEL: IMyWorkHeroViewModel = Object.freeze({
  primaryTitle: 'My Dashboard',
  secondaryTitle: 'My Work',
  description: MY_WORK_HOME_SURFACE.dashboardDescription,
  heroHighlights: Object.freeze([
    { id: 'actionable-items', label: 'Actionable items', value: PENDING_VALUE },
    {
      id: 'connected-sources',
      label: 'Connected sources',
      value: ADOBE_MODULE.sourceSystem,
    },
    { id: 'source-health', label: 'Source health', value: PENDING_VALUE },
    { id: 'last-refreshed', label: 'Last refreshed', value: PENDING_VALUE },
  ]),
  governanceMicrocopy: Object.freeze([
    {
      id: 'home-read-only',
      text: 'Read-only work visibility · Source actions remain in their governing systems.',
    },
  ]),
});

export const MY_WORK_FOCUSED_ADOBE_HERO_PREVIEW_VIEW_MODEL: IMyWorkHeroViewModel = Object.freeze({
  primaryTitle: 'My Dashboard',
  secondaryTitle: ADOBE_MODULE.label,
  description: ADOBE_MODULE.summary,
  heroHighlights: Object.freeze([
    { id: 'queue-state', label: 'Queue state', value: PENDING_VALUE },
    { id: 'pending-items', label: 'Pending items', value: PENDING_VALUE },
    { id: 'last-refreshed', label: 'Last refreshed', value: PENDING_VALUE },
    {
      id: 'action-system',
      label: 'Action system',
      value: ADOBE_MODULE.sourceSystem,
    },
  ]),
  governanceMicrocopy: Object.freeze([
    {
      id: 'focused-queue-visibility',
      text: 'Queue visibility only · Agreement actions remain in Adobe Sign.',
    },
  ]),
});
