import { describe, expect, it } from 'vitest';
import { getActions, resolveActionKey } from '../src/actionCatalog.js';

describe('actionCatalog', () => {
  it('exposes local-runner actions', () => {
    const actions = getActions();
    expect(actions.length).toBeGreaterThanOrEqual(7);
    expect(actions.some((action) => action.actionKey === 'sharepoint-control:extraction:list-schema')).toBe(true);
  });

  it('normalizes alias action keys', () => {
    expect(resolveActionKey('sharepoint:pnp:list-schema-export')).toBe('sharepoint-control:extraction:list-schema');
  });
});
