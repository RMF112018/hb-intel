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
    expect(resolveActionKey('sharepoint:pnp:priority-actions-band-seed-curated')).toBe(
      'sharepoint-control:provisioning:priority-actions-band-seed-curated',
    );
    expect(resolveActionKey('sharepoint:pnp:priority-actions-band-provision-and-seed-curated')).toBe(
      'sharepoint-control:provisioning:priority-actions-band-provision-and-seed-curated',
    );
  });

  it('declares allowed execution intents for provisioning actions', () => {
    const descriptor = getActionDescriptor('sharepoint-control:provisioning:priority-actions-band-provision-and-seed');
    expect(descriptor.executionMode).toBe('apply');
    expect(descriptor.allowedExecutionIntents).toContain('sharepoint-provision-and-seed');
  });

  it('registers curated seeding actions and intent contracts', () => {
    const seedDescriptor = getActionDescriptor('sharepoint-control:provisioning:priority-actions-band-seed-curated');
    expect(seedDescriptor.executionMode).toBe('apply');
    expect(seedDescriptor.allowedExecutionIntents).toContain('sharepoint-seed');

    const provisionSeedDescriptor = getActionDescriptor(
      'sharepoint-control:provisioning:priority-actions-band-provision-and-seed-curated',
    );
    expect(provisionSeedDescriptor.executionMode).toBe('apply');
    expect(provisionSeedDescriptor.allowedExecutionIntents).toContain('sharepoint-provision-and-seed');
  });

  it('registers the flagship action-layer cutover action and its alias', () => {
    expect(resolveActionKey('sharepoint:pnp:flagship-action-layer-cutover')).toBe(
      'sharepoint-control:provisioning:flagship-action-layer-cutover',
    );
    const descriptor = getActionDescriptor('sharepoint-control:provisioning:flagship-action-layer-cutover');
    expect(descriptor.executionMode).toBe('apply');
    expect(descriptor.allowedExecutionIntents).toContain('sharepoint-provision-and-seed');
  });

  it('registers the homepage action-layer proof action as authoritative read-only proof', () => {
    expect(resolveActionKey('sharepoint:pnp:homepage-action-layer-proof')).toBe(
      'sharepoint-control:proof:homepage-action-layer',
    );
    const descriptor = getActionDescriptor('sharepoint-control:proof:homepage-action-layer');
    expect(descriptor.executionMode).toBe('advisory');
    expect(descriptor.riskLevel).toBe('read-only');
    expect(descriptor.allowedExecutionIntents).toContain('read-only-export');
  });

  it('registers the Phase-07 wrapper cutover action and its alias', () => {
    expect(resolveActionKey('sharepoint:pnp:flagship-homepage-wrapper-cutover')).toBe(
      'sharepoint-control:provisioning:flagship-homepage-wrapper-cutover',
    );
    const descriptor = getActionDescriptor(
      'sharepoint-control:provisioning:flagship-homepage-wrapper-cutover',
    );
    expect(descriptor.executionMode).toBe('apply');
    expect(descriptor.riskLevel).toBe('low-impact');
    expect(descriptor.allowedExecutionIntents).toContain('sharepoint-provision-and-seed');
  });

  it('registers the Phase-07 wrapper-embedded proof action and its alias', () => {
    expect(resolveActionKey('sharepoint:pnp:homepage-wrapper-embedded-proof')).toBe(
      'sharepoint-control:proof:homepage-wrapper-embedded',
    );
    const descriptor = getActionDescriptor('sharepoint-control:proof:homepage-wrapper-embedded');
    expect(descriptor.executionMode).toBe('advisory');
    expect(descriptor.riskLevel).toBe('read-only');
    expect(descriptor.allowedExecutionIntents).toContain('read-only-export');
  });
});
