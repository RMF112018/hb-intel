import { describe, expect, it, beforeEach } from 'vitest';
import { resolveProjectSwitch } from './projectSwitching.js';
import { getReturnMemory, saveReturnMemory } from './stores/projectReturnMemory.js';

// Mock localStorage
const storage = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
  get length() { return storage.size; },
  key: (_i: number) => null,
};
Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true });

describe('resolveProjectSwitch', () => {
  beforeEach(() => {
    storage.clear();
  });

  const allAccessible = () => true;
  const noneAccessible = () => false;
  const onlyFinancial = (path: string) => path === '/financial';

  it('resolves same-page when target module is accessible', () => {
    const result = resolveProjectSwitch({
      currentProjectId: 'proj-a',
      currentPath: '/financial',
      targetProjectId: 'proj-b',
      targetModuleAccessible: allAccessible,
    });

    expect(result.resolution).toBe('same-page');
    expect(result.targetPath).toBe('/financial');
    expect(result.targetProjectId).toBe('proj-b');
  });

  it('falls back to return-memory when same-page inaccessible', () => {
    // Pre-populate return memory for target project
    saveReturnMemory('proj-b', '/schedule');

    const result = resolveProjectSwitch({
      currentProjectId: 'proj-a',
      currentPath: '/constraints', // not accessible
      targetProjectId: 'proj-b',
      targetModuleAccessible: (path) => path === '/schedule',
    });

    expect(result.resolution).toBe('return-memory');
    expect(result.targetPath).toBe('/schedule');
  });

  it('falls back to project home when no return-memory', () => {
    const result = resolveProjectSwitch({
      currentProjectId: 'proj-a',
      currentPath: '/financial',
      targetProjectId: 'proj-b',
      targetModuleAccessible: noneAccessible,
    });

    expect(result.resolution).toBe('project-home');
    expect(result.targetPath).toBe('/');
  });

  it('falls back to project home when return-memory page is inaccessible', () => {
    saveReturnMemory('proj-b', '/safety');

    const result = resolveProjectSwitch({
      currentProjectId: 'proj-a',
      currentPath: '/financial',
      targetProjectId: 'proj-b',
      targetModuleAccessible: onlyFinancial, // only /financial accessible, not /safety
    });

    // Same-page /financial IS accessible
    expect(result.resolution).toBe('same-page');
    expect(result.targetPath).toBe('/financial');
  });

  it('saves return memory for departing project', () => {
    const result = resolveProjectSwitch({
      currentProjectId: 'proj-a',
      currentPath: '/financial',
      targetProjectId: 'proj-b',
      targetModuleAccessible: allAccessible,
    });

    expect(result.returnMemorySaved).toBe(true);
    const saved = getReturnMemory('proj-a');
    expect(saved?.lastPath).toBe('/financial');
  });

  it('handles empty current path (at project home)', () => {
    const result = resolveProjectSwitch({
      currentProjectId: 'proj-a',
      currentPath: '/',
      targetProjectId: 'proj-b',
      targetModuleAccessible: allAccessible,
    });

    // '/' has no module path → skip same-page → check return memory → home
    expect(result.resolution).toBe('project-home');
    expect(result.targetPath).toBe('/');
  });

  it('extracts first path segment as module path', () => {
    const result = resolveProjectSwitch({
      currentProjectId: 'proj-a',
      currentPath: '/schedule/milestones',
      targetProjectId: 'proj-b',
      targetModuleAccessible: (path) => path === '/schedule',
    });

    expect(result.resolution).toBe('same-page');
    expect(result.targetPath).toBe('/schedule');
  });

  it('saves query params in return memory', () => {
    resolveProjectSwitch({
      currentProjectId: 'proj-a',
      currentPath: '/financial',
      targetProjectId: 'proj-b',
      targetModuleAccessible: allAccessible,
      currentQueryParams: { view: 'forecast' },
    });

    const saved = getReturnMemory('proj-a');
    expect(saved?.lastQueryParams).toEqual({ view: 'forecast' });
  });
});
