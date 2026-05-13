import { describe, expect, it } from 'vitest';

import {
  ADOBE_SIGN_QUEUE_AVAILABLE,
  MY_PROJECT_LINKS_AVAILABLE,
  MY_WORK_HOME_AVAILABLE,
} from '@hbc/models/myWork/fixtures';

import {
  MY_WORK_READ_MODEL_ROUTE_IDS,
  MY_WORK_READ_MODEL_ROUTE_PATHS,
  type IMyWorkReadModelClient,
  type MyWorkReadModelRouteId,
} from './myWorkReadModelClient.js';

describe('My Work read-model client — route ID surface', () => {
  it('exposes the three route ids including project-links in order', () => {
    expect(MY_WORK_READ_MODEL_ROUTE_IDS).toEqual([
      'home',
      'adobe-sign-action-queue',
      'project-links',
    ]);
    expect(MY_WORK_READ_MODEL_ROUTE_IDS).toHaveLength(3);
  });

  it('re-exports the canonical B04 route paths verbatim', () => {
    expect(MY_WORK_READ_MODEL_ROUTE_PATHS).toEqual({
      home: 'my-work/me/home',
      'adobe-sign-action-queue': 'my-work/me/adobe-sign/action-queue',
      'project-links': 'my-work/me/project-links',
    });
  });

  it('exposes route ids assignable to MyWorkReadModelRouteId', () => {
    const home: MyWorkReadModelRouteId = 'home';
    const queue: MyWorkReadModelRouteId = 'adobe-sign-action-queue';
    const projectLinks: MyWorkReadModelRouteId = 'project-links';
    expect(home).toBe('home');
    expect(queue).toBe('adobe-sign-action-queue');
    expect(projectLinks).toBe('project-links');
  });
});

describe('My Work read-model client — interface conformance', () => {
  it('accepts a stub conforming to IMyWorkReadModelClient with read + OAuth-start methods', () => {
    const stub: IMyWorkReadModelClient = {
      getMyWorkHome: async () => MY_WORK_HOME_AVAILABLE,
      getAdobeSignActionQueue: async () => ADOBE_SIGN_QUEUE_AVAILABLE,
      getMyProjectLinks: async () => MY_PROJECT_LINKS_AVAILABLE,
      startAdobeSignOAuth: async () => ({
        authorizationUrl: 'https://secure.adobesign.com/public/oauth/v2?state=stub',
        stateExpiresAtUtc: '2026-05-13T12:10:00.000Z',
      }),
    };
    expect(Object.keys(stub).sort()).toEqual([
      'getAdobeSignActionQueue',
      'getMyProjectLinks',
      'getMyWorkHome',
      'startAdobeSignOAuth',
    ]);
  });
});
