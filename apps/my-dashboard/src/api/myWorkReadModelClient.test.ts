import { describe, expect, it } from 'vitest';

import {
  ADOBE_SIGN_QUEUE_AVAILABLE,
  ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE,
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
  it('exposes the four route ids including recent-completions in order', () => {
    expect(MY_WORK_READ_MODEL_ROUTE_IDS).toEqual([
      'home',
      'adobe-sign-action-queue',
      'adobe-sign-recent-completions',
      'project-links',
    ]);
    expect(MY_WORK_READ_MODEL_ROUTE_IDS).toHaveLength(4);
  });

  it('re-exports the canonical B04 route paths verbatim', () => {
    expect(MY_WORK_READ_MODEL_ROUTE_PATHS).toEqual({
      home: 'my-work/me/home',
      'adobe-sign-action-queue': 'my-work/me/adobe-sign/action-queue',
      'adobe-sign-recent-completions': 'my-work/me/adobe-sign/recent-completions',
      'project-links': 'my-work/me/project-links',
    });
  });

  it('exposes route ids assignable to MyWorkReadModelRouteId', () => {
    const home: MyWorkReadModelRouteId = 'home';
    const queue: MyWorkReadModelRouteId = 'adobe-sign-action-queue';
    const recentCompletions: MyWorkReadModelRouteId = 'adobe-sign-recent-completions';
    const projectLinks: MyWorkReadModelRouteId = 'project-links';
    expect(home).toBe('home');
    expect(queue).toBe('adobe-sign-action-queue');
    expect(recentCompletions).toBe('adobe-sign-recent-completions');
    expect(projectLinks).toBe('project-links');
  });
});

describe('My Work read-model client — interface conformance', () => {
  it('accepts a stub conforming to IMyWorkReadModelClient with read + OAuth-start methods', () => {
    const stub: IMyWorkReadModelClient = {
      getMyWorkHome: async () => MY_WORK_HOME_AVAILABLE,
      getAdobeSignActionQueue: async () => ADOBE_SIGN_QUEUE_AVAILABLE,
      getAdobeSignRecentCompletions: async () => ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE,
      getMyProjectLinks: async () => MY_PROJECT_LINKS_AVAILABLE,
      resolveAdobeSignActionLink: async () => ({ status: 'source-unavailable' }),
      startAdobeSignOAuth: async () => ({
        authorizationUrl: 'https://secure.adobesign.com/public/oauth/v2?state=stub',
        stateExpiresAtUtc: '2026-05-13T12:10:00.000Z',
      }),
    };
    expect(Object.keys(stub).sort()).toEqual([
      'getAdobeSignActionQueue',
      'getAdobeSignRecentCompletions',
      'getMyProjectLinks',
      'getMyWorkHome',
      'resolveAdobeSignActionLink',
      'startAdobeSignOAuth',
    ]);
  });

  it('accepts a stub that also implements the optional disconnectAdobeSignOAuth method', () => {
    const stub: IMyWorkReadModelClient = {
      getMyWorkHome: async () => MY_WORK_HOME_AVAILABLE,
      getAdobeSignActionQueue: async () => ADOBE_SIGN_QUEUE_AVAILABLE,
      getAdobeSignRecentCompletions: async () => ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE,
      getMyProjectLinks: async () => MY_PROJECT_LINKS_AVAILABLE,
      resolveAdobeSignActionLink: async () => ({ status: 'source-unavailable' }),
      startAdobeSignOAuth: async () => ({
        authorizationUrl: 'https://secure.adobesign.com/public/oauth/v2?state=stub',
        stateExpiresAtUtc: '2026-05-13T12:10:00.000Z',
      }),
      disconnectAdobeSignOAuth: async () => ({ status: 'disconnected' }),
    };
    expect(stub.disconnectAdobeSignOAuth).toBeDefined();
  });
});
