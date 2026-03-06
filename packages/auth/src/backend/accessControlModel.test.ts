import { describe, expect, it } from 'vitest';
import {
  createAccessControlAuditEvent,
  createBaseRoleDefinition,
  getChangedBaseRoleReferences,
  resolveRenewalState,
} from './accessControlModel.js';

describe('accessControlModel', () => {
  it('creates normalized base role definitions with sorted grants', () => {
    const role = createBaseRoleDefinition({
      id: ' role-admin ',
      name: ' Administrator ',
      grants: ['project:edit', 'project:view', 'project:edit'],
      version: 3,
      updatedBy: 'ops-admin',
    });

    expect(role.id).toBe('role-admin');
    expect(role.name).toBe('Administrator');
    expect(role.grants).toEqual(['project:edit', 'project:view']);
  });

  it('computes changed role references by version', () => {
    const previous = [
      createBaseRoleDefinition({
        id: 'member',
        name: 'Member',
        grants: ['project:view'],
        version: 1,
        updatedBy: 'ops',
      }),
    ];
    const next = [
      createBaseRoleDefinition({
        id: 'member',
        name: 'Member',
        grants: ['project:view', 'project:edit'],
        version: 2,
        updatedBy: 'ops',
      }),
    ];

    const diffs = getChangedBaseRoleReferences({ previous, next });
    expect(diffs).toEqual([{ roleId: 'member', previousVersion: 1, nextVersion: 2 }]);
  });

  it('resolves renewal state to expired when expiration has passed', () => {
    const renewalState = resolveRenewalState(
      {
        expiresAt: '2026-03-01T00:00:00.000Z',
      },
      new Date('2026-03-06T00:00:00.000Z'),
    );

    expect(renewalState).toBe('expired');
  });

  it('creates typed audit event records with event id', () => {
    const event = createAccessControlAuditEvent({
      eventType: 'override-approved',
      actorId: 'approver-1',
      subjectUserId: 'user-1',
      overrideId: 'override-1',
    });

    expect(event.id).toContain('ace-override-approved-');
    expect(event.actorId).toBe('approver-1');
  });
});
