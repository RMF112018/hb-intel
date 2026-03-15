import { myWorkKeys } from '../hooks/queryKeys.js';
import { MY_WORK_QUERY_KEY_PREFIX } from '../constants/index.js';
import type { IMyWorkQuery } from '../types/index.js';

describe('myWorkKeys', () => {
  const userId = 'user-001';
  const query: IMyWorkQuery = { projectId: 'proj-001' };

  it('all() returns prefix + userId tuple', () => {
    expect(myWorkKeys.all(userId)).toEqual([MY_WORK_QUERY_KEY_PREFIX, userId]);
  });

  it('feed() includes "feed" segment and query', () => {
    const key = myWorkKeys.feed(userId, query);
    expect(key).toEqual([MY_WORK_QUERY_KEY_PREFIX, userId, 'feed', query]);
  });

  it('counts() includes "counts" segment and query', () => {
    const key = myWorkKeys.counts(userId, query);
    expect(key).toEqual([MY_WORK_QUERY_KEY_PREFIX, userId, 'counts', query]);
  });

  it('panel() includes "panel" segment and query', () => {
    const key = myWorkKeys.panel(userId, query);
    expect(key).toEqual([MY_WORK_QUERY_KEY_PREFIX, userId, 'panel', query]);
  });

  it('reasoning() includes "reasoning" segment and itemId', () => {
    const key = myWorkKeys.reasoning(userId, 'item-42');
    expect(key).toEqual([MY_WORK_QUERY_KEY_PREFIX, userId, 'reasoning', 'item-42']);
  });

  it('team() includes "team" segment, ownerScope, and query', () => {
    const key = myWorkKeys.team(userId, 'my-team', query);
    expect(key).toEqual([MY_WORK_QUERY_KEY_PREFIX, userId, 'team', 'my-team', query]);
  });

  it('offline() includes "offline" segment', () => {
    const key = myWorkKeys.offline(userId);
    expect(key).toEqual([MY_WORK_QUERY_KEY_PREFIX, userId, 'offline']);
  });

  it('all keys start with the common prefix', () => {
    const keys = [
      myWorkKeys.all(userId),
      myWorkKeys.feed(userId, query),
      myWorkKeys.counts(userId, query),
      myWorkKeys.panel(userId, query),
      myWorkKeys.reasoning(userId, 'item-1'),
      myWorkKeys.team(userId, 'my-team', query),
      myWorkKeys.offline(userId),
    ];
    for (const key of keys) {
      expect(key[0]).toBe(MY_WORK_QUERY_KEY_PREFIX);
      expect(key[1]).toBe(userId);
    }
  });
});
