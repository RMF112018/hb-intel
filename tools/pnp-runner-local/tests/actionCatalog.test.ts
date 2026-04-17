import { describe, expect, it } from 'vitest';
import { getActionDescriptor, getActions, resolveActionKey } from '../src/actionCatalog.js';

describe('actionCatalog', () => {
  it('exposes local-runner actions', () => {
    const actions = getActions();
    expect(actions.length).toBeGreaterThanOrEqual(11);
    expect(actions.some((action) => action.actionKey === 'sharepoint-control:extraction:list-schema')).toBe(true);
    expect(actions.some((action) => action.actionKey === 'sharepoint-control:provisioning:priority-actions-band-lists')).toBe(true);
  });

  it('normalizes alias action keys', () => {
    expect(resolveActionKey('sharepoint:pnp:list-schema-export')).toBe('sharepoint-control:extraction:list-schema');
    expect(resolveActionKey('sharepoint:pnp:priority-actions-band-provision-and-seed')).toBe(
      'sharepoint-control:provisioning:priority-actions-band-provision-and-seed',
    );
  });

  it('declares allowed execution intents for provisioning actions', () => {
    const descriptor = getActionDescriptor('sharepoint-control:provisioning:priority-actions-band-provision-and-seed');
    expect(descriptor.executionMode).toBe('apply');
    expect(descriptor.allowedExecutionIntents).toContain('sharepoint-provision-and-seed');
  });

  it('registers the flagship action-layer cutover action and its alias', () => {
    expect(resolveActionKey('sharepoint:pnp:flagship-action-layer-cutover')).toBe(
      'sharepoint-control:provisioning:flagship-action-layer-cutover',
    );
    const descriptor = getActionDescriptor('sharepoint-control:provisioning:flagship-action-layer-cutover');
    expect(descriptor.executionMode).toBe('apply');
    expect(descriptor.allowedExecutionIntents).toContain('sharepoint-provision-and-seed');
  });
});
