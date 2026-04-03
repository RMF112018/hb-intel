import { describe, it, expect } from 'vitest';
import {
  validateUpn,
  validateObjectId,
  validateSamAccountName,
  validateDistinguishedName,
  validateADDSUserProperties,
  validateCloudUserProperties,
  validateAuthorityCompatibility,
  validateDestructiveConfirmation,
  validateBaseRequest,
  validateMemberUpnList,
  validateMemberDnList,
  getRequiredConnectors,
} from './hybrid-identity-validators.js';
import { IdentityValidationError } from './hybrid-identity-errors.js';

describe('validateUpn', () => {
  it('accepts valid UPN', () => {
    expect(() => validateUpn('jane.doe@hb.com', 'test')).not.toThrow();
  });
  it('rejects empty', () => {
    expect(() => validateUpn('', 'test')).toThrow(IdentityValidationError);
  });
  it('rejects missing domain', () => {
    expect(() => validateUpn('jane.doe', 'test')).toThrow(IdentityValidationError);
  });
});

describe('validateObjectId', () => {
  it('accepts valid UUID', () => {
    expect(() => validateObjectId('550e8400-e29b-41d4-a716-446655440000', 'test')).not.toThrow();
  });
  it('rejects non-UUID', () => {
    expect(() => validateObjectId('not-a-uuid', 'test')).toThrow(IdentityValidationError);
  });
});

describe('validateSamAccountName', () => {
  it('accepts valid sAMAccountName', () => {
    expect(() => validateSamAccountName('jane.doe', 'test')).not.toThrow();
  });
  it('rejects empty', () => {
    expect(() => validateSamAccountName('', 'test')).toThrow(IdentityValidationError);
  });
  it('rejects too long (>20 chars)', () => {
    expect(() => validateSamAccountName('a'.repeat(21), 'test')).toThrow(IdentityValidationError);
  });
  it('rejects special characters', () => {
    expect(() => validateSamAccountName('jane@doe', 'test')).toThrow(IdentityValidationError);
  });
});

describe('validateDistinguishedName', () => {
  it('accepts valid DN', () => {
    expect(() => validateDistinguishedName('CN=Jane Doe,OU=Users,DC=corp,DC=hb,DC=com', 'test')).not.toThrow();
  });
  it('rejects empty', () => {
    expect(() => validateDistinguishedName('', 'test')).toThrow(IdentityValidationError);
  });
  it('rejects invalid format', () => {
    expect(() => validateDistinguishedName('just-a-name', 'test')).toThrow(IdentityValidationError);
  });
});

describe('validateADDSUserProperties', () => {
  it('accepts allowed properties', () => {
    expect(() => validateADDSUserProperties({ displayName: 'Jane', department: 'IT' }, 'test')).not.toThrow();
  });
  it('rejects empty properties', () => {
    expect(() => validateADDSUserProperties({}, 'test')).toThrow(IdentityValidationError);
  });
  it('rejects disallowed property', () => {
    expect(() => validateADDSUserProperties({ password: 'nope' }, 'test')).toThrow(IdentityValidationError);
  });
});

describe('validateCloudUserProperties', () => {
  it('accepts allowed properties', () => {
    expect(() => validateCloudUserProperties({ displayName: 'Jane', jobTitle: 'PM' }, 'test')).not.toThrow();
  });
  it('rejects disallowed property', () => {
    expect(() => validateCloudUserProperties({ samAccountName: 'nope' }, 'test')).toThrow(IdentityValidationError);
  });
});

describe('validateAuthorityCompatibility', () => {
  it('allows AD DS action on AD DS-authoritative target', () => {
    expect(() => validateAuthorityCompatibility('user:create-adds', 'ad-ds', 'test')).not.toThrow();
  });
  it('rejects AD DS action on cloud-only target', () => {
    expect(() => validateAuthorityCompatibility('user:create-adds', 'entra', 'test')).toThrow(IdentityValidationError);
  });
  it('allows cloud action on cloud-only target', () => {
    expect(() => validateAuthorityCompatibility('user:create-cloud', 'entra', 'test')).not.toThrow();
  });
  it('rejects cloud action on AD DS-synced target', () => {
    expect(() => validateAuthorityCompatibility('user:update-cloud', 'ad-ds', 'test')).toThrow(IdentityValidationError);
  });
  it('allows read action on any authority', () => {
    expect(() => validateAuthorityCompatibility('user:search', 'ad-ds', 'test')).not.toThrow();
    expect(() => validateAuthorityCompatibility('user:search', 'entra', 'test')).not.toThrow();
  });
});

describe('validateDestructiveConfirmation', () => {
  it('passes when token is provided for destructive action', () => {
    expect(() => validateDestructiveConfirmation('user:delete-adds', 'CONFIRM-123', 'test')).not.toThrow();
  });
  it('throws when token is missing for destructive action', () => {
    expect(() => validateDestructiveConfirmation('user:delete-adds', undefined, 'test')).toThrow(IdentityValidationError);
  });
  it('allows non-destructive action without token', () => {
    expect(() => validateDestructiveConfirmation('user:search', undefined, 'test')).not.toThrow();
  });
});

describe('validateBaseRequest', () => {
  const validRequest = {
    actionId: 'user:search' as const,
    actor: { upn: 'admin@hb.com', oid: '123', displayName: 'Admin' },
    correlationId: 'corr-001',
    timestamp: new Date().toISOString(),
  };

  it('passes for valid request', () => {
    expect(() => validateBaseRequest(validRequest, 'test')).not.toThrow();
  });

  it('throws for missing actionId', () => {
    expect(() => validateBaseRequest({ ...validRequest, actionId: '' as never }, 'test')).toThrow(IdentityValidationError);
  });

  it('throws for missing actor.upn', () => {
    expect(() => validateBaseRequest({ ...validRequest, actor: { ...validRequest.actor, upn: '' } }, 'test')).toThrow(IdentityValidationError);
  });
});

describe('validateMemberUpnList', () => {
  it('passes for valid UPN list', () => {
    expect(() => validateMemberUpnList(['a@hb.com', 'b@hb.com'], 'test')).not.toThrow();
  });
  it('throws for empty list', () => {
    expect(() => validateMemberUpnList([], 'test')).toThrow(IdentityValidationError);
  });
  it('throws for invalid UPN in list', () => {
    expect(() => validateMemberUpnList(['a@hb.com', 'invalid'], 'test')).toThrow(IdentityValidationError);
  });
});

describe('validateMemberDnList', () => {
  it('passes for valid DN list', () => {
    expect(() => validateMemberDnList(['CN=A,OU=Users,DC=corp'], 'test')).not.toThrow();
  });
  it('throws for empty list', () => {
    expect(() => validateMemberDnList([], 'test')).toThrow(IdentityValidationError);
  });
});

describe('getRequiredConnectors', () => {
  it('returns ad-ds for AD DS actions', () => {
    expect(getRequiredConnectors('user:create-adds')).toEqual(['ad-ds']);
  });
  it('returns graph-identity for cloud actions', () => {
    expect(getRequiredConnectors('user:search')).toEqual(['graph-identity']);
  });
  it('returns empty for unknown action', () => {
    expect(getRequiredConnectors('unknown:action' as never)).toEqual([]);
  });
});
