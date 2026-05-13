import { describe, expect, it } from 'vitest';

import { ADOBE_SIGN_QUEUE_AVAILABLE, MY_WORK_HOME_AVAILABLE } from '@hbc/models/myWork/fixtures';

import {
  MY_WORK_READ_MODEL_ROUTE_IDS,
  MY_WORK_READ_MODEL_ROUTE_PATHS,
  type IMyWorkReadModelClient,
  type MyWorkReadModelRouteId,
} from './myWorkReadModelClient.js';

describe('My Work read-model client — route ID surface', () => {
  it('exposes exactly the two B04 route ids in order', () => {
    expect(MY_WORK_READ_MODEL_ROUTE_IDS).toEqual(['home', 'adobe-sign-action-queue']);
    expect(MY_WORK_READ_MODEL_ROUTE_IDS).toHaveLength(2);
  });

  it('re-exports the canonical B04 route paths verbatim', () => {
    expect(MY_WORK_READ_MODEL_ROUTE_PATHS).toEqual({
      home: 'my-work/me/home',
      'adobe-sign-action-queue': 'my-work/me/adobe-sign/action-queue',
    });
  });

  it('exposes route ids assignable to MyWorkReadModelRouteId', () => {
    const home: MyWorkReadModelRouteId = 'home';
    const queue: MyWorkReadModelRouteId = 'adobe-sign-action-queue';
    expect(home).toBe('home');
    expect(queue).toBe('adobe-sign-action-queue');
  });
});

describe('My Work read-model client — interface conformance', () => {
  it('accepts a stub conforming to IMyWorkReadModelClient with exactly two methods', () => {
    const stub: IMyWorkReadModelClient = {
      getMyWorkHome: async () => MY_WORK_HOME_AVAILABLE,
      getAdobeSignActionQueue: async () => ADOBE_SIGN_QUEUE_AVAILABLE,
    };
    expect(Object.keys(stub).sort()).toEqual(['getAdobeSignActionQueue', 'getMyWorkHome']);
  });
});
