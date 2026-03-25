import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearProjectHubPortfolioState,
  getProjectHubPortfolioState,
  saveProjectHubPortfolioState,
} from './projectHubPortfolioState.js';

const storage = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
  get length() {
    return storage.size;
  },
  key: (_i: number) => null,
};

Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true });

describe('projectHubPortfolioState', () => {
  beforeEach(() => {
    storage.clear();
  });

  it('returns defaults when no state is saved', () => {
    expect(getProjectHubPortfolioState()).toEqual({
      search: '',
      statusFilter: 'all',
      sortBy: 'name',
      scrollY: 0,
    });
  });

  it('merges partial updates into the saved state', () => {
    saveProjectHubPortfolioState({ search: 'tower', sortBy: 'status' });
    saveProjectHubPortfolioState({ scrollY: 220 });

    expect(getProjectHubPortfolioState()).toEqual({
      search: 'tower',
      statusFilter: 'all',
      sortBy: 'status',
      scrollY: 220,
    });
  });

  it('clears the saved state', () => {
    saveProjectHubPortfolioState({ search: 'bridge' });
    clearProjectHubPortfolioState();

    expect(getProjectHubPortfolioState()).toEqual({
      search: '',
      statusFilter: 'all',
      sortBy: 'name',
      scrollY: 0,
    });
  });
});

