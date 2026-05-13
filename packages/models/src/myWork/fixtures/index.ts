/**
 * My Work — deterministic fixture matrix barrel.
 *
 * Aggregates the home and Adobe queue B04 scenario fixtures into a
 * single addressable map keyed by read-model route and scenario name.
 * Consumers (frontend client, backend mock provider, B05 UI) select
 * a scenario without hard-coding individual fixture identifiers.
 *
 * @module myWork/fixtures
 */

export * from './adobeSignActionQueueReadModels.js';
export * from './myWorkHomeReadModels.js';
export * from './myProjectLinksReadModels.js';

import {
  ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED,
  ADOBE_SIGN_QUEUE_AVAILABLE,
  ADOBE_SIGN_QUEUE_AVAILABLE_PAGED,
  ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE,
  ADOBE_SIGN_QUEUE_CONFIGURATION_REQUIRED,
  ADOBE_SIGN_QUEUE_EMPTY,
  ADOBE_SIGN_QUEUE_PARTIAL,
  ADOBE_SIGN_QUEUE_PRINCIPAL_UNRESOLVED,
  ADOBE_SIGN_QUEUE_SOURCE_UNAVAILABLE,
} from './adobeSignActionQueueReadModels.js';

import {
  MY_WORK_HOME_AUTHORIZATION_REQUIRED,
  MY_WORK_HOME_AVAILABLE,
  MY_WORK_HOME_BACKEND_UNAVAILABLE,
  MY_WORK_HOME_CONFIGURATION_REQUIRED,
  MY_WORK_HOME_EMPTY,
  MY_WORK_HOME_PARTIAL,
  MY_WORK_HOME_PRINCIPAL_UNRESOLVED,
  MY_WORK_HOME_SOURCE_UNAVAILABLE,
} from './myWorkHomeReadModels.js';
import {
  MY_PROJECT_LINKS_AVAILABLE,
  MY_PROJECT_LINKS_BACKEND_UNAVAILABLE,
  MY_PROJECT_LINKS_BOUNDED_SOURCE_PARTIAL_WARNING,
  MY_PROJECT_LINKS_MIXED_ACTION_AVAILABILITY,
  MY_PROJECT_LINKS_MORE_THAN_SIX_ITEMS,
  MY_PROJECT_LINKS_NO_ASSIGNED_PROJECTS,
  MY_PROJECT_LINKS_PARTIAL_SOURCE_READINESS,
  MY_PROJECT_LINKS_PRINCIPAL_UNRESOLVED,
  MY_PROJECT_LINKS_SOURCE_UNAVAILABLE,
} from './myProjectLinksReadModels.js';

export const MY_WORK_FIXTURES = {
  home: {
    available: MY_WORK_HOME_AVAILABLE,
    empty: MY_WORK_HOME_EMPTY,
    partial: MY_WORK_HOME_PARTIAL,
    'configuration-required': MY_WORK_HOME_CONFIGURATION_REQUIRED,
    'authorization-required': MY_WORK_HOME_AUTHORIZATION_REQUIRED,
    'principal-unresolved': MY_WORK_HOME_PRINCIPAL_UNRESOLVED,
    'source-unavailable': MY_WORK_HOME_SOURCE_UNAVAILABLE,
    'backend-unavailable': MY_WORK_HOME_BACKEND_UNAVAILABLE,
  },
  'adobe-sign-action-queue': {
    available: ADOBE_SIGN_QUEUE_AVAILABLE,
    empty: ADOBE_SIGN_QUEUE_EMPTY,
    'available-paged': ADOBE_SIGN_QUEUE_AVAILABLE_PAGED,
    partial: ADOBE_SIGN_QUEUE_PARTIAL,
    'configuration-required': ADOBE_SIGN_QUEUE_CONFIGURATION_REQUIRED,
    'authorization-required': ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED,
    'principal-unresolved': ADOBE_SIGN_QUEUE_PRINCIPAL_UNRESOLVED,
    'source-unavailable': ADOBE_SIGN_QUEUE_SOURCE_UNAVAILABLE,
    'backend-unavailable': ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE,
  },
  'project-links': {
    available: MY_PROJECT_LINKS_AVAILABLE,
    'more-than-six-items': MY_PROJECT_LINKS_MORE_THAN_SIX_ITEMS,
    'mixed-action-availability': MY_PROJECT_LINKS_MIXED_ACTION_AVAILABILITY,
    'no-assigned-projects': MY_PROJECT_LINKS_NO_ASSIGNED_PROJECTS,
    'partial-source-readiness': MY_PROJECT_LINKS_PARTIAL_SOURCE_READINESS,
    'source-unavailable': MY_PROJECT_LINKS_SOURCE_UNAVAILABLE,
    'principal-unresolved': MY_PROJECT_LINKS_PRINCIPAL_UNRESOLVED,
    'backend-unavailable': MY_PROJECT_LINKS_BACKEND_UNAVAILABLE,
    'bounded-source-partial-warning': MY_PROJECT_LINKS_BOUNDED_SOURCE_PARTIAL_WARNING,
  },
} as const;

export type MyWorkFixtureRouteKey = keyof typeof MY_WORK_FIXTURES;
export type MyWorkHomeFixtureScenarioKey = keyof (typeof MY_WORK_FIXTURES)['home'];
export type AdobeSignQueueFixtureScenarioKey =
  keyof (typeof MY_WORK_FIXTURES)['adobe-sign-action-queue'];
export type MyProjectLinksFixtureScenarioKey = keyof (typeof MY_WORK_FIXTURES)['project-links'];
