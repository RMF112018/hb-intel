import { describe, it, expect } from 'vitest';
import { MockADDirectoryService, ADDirectoryService } from './ad-directory-service.js';
import { ADDSConnectivityError, IdentityNotFoundError, IdentityConflictError } from './hybrid-identity-errors.js';

describe('MockADDirectoryService — user operations', () => {
  it('createUser returns a record with DN', async () => {
    const svc = new MockADDirectoryService();
    const record = await svc.createUser({
      samAccountName: 'jane.doe',
      userPrincipalName: 'jane.doe@corp.hb.com',
      displayName: 'Jane Doe',
      targetOu: 'OU=Users,DC=corp,DC=hb,DC=com',
    });
    expect(record.distinguishedName).toContain('Jane Doe');
    expect(record.samAccountName).toBe('jane.doe');
    expect(record.enabled).toBe(true);
  });

  it('createUser throws IdentityConflictError on duplicate', async () => {
    const svc = new MockADDirectoryService();
    await svc.createUser({
      samAccountName: 'jane.doe',
      userPrincipalName: 'jane.doe@corp.hb.com',
      displayName: 'Jane Doe',
    });
    await expect(svc.createUser({
      samAccountName: 'jane.doe',
      userPrincipalName: 'jane.doe2@corp.hb.com',
      displayName: 'Jane Doe 2',
    })).rejects.toThrow(IdentityConflictError);
  });

  it('getUser finds by sAMAccountName', async () => {
    const svc = new MockADDirectoryService();
    await svc.createUser({
      samAccountName: 'jane.doe',
      userPrincipalName: 'jane.doe@corp.hb.com',
      displayName: 'Jane Doe',
    });
    const user = await svc.getUser('jane.doe');
    expect(user).not.toBeNull();
    expect(user!.displayName).toBe('Jane Doe');
  });

  it('getUser returns null for unknown user', async () => {
    const svc = new MockADDirectoryService();
    expect(await svc.getUser('unknown')).toBeNull();
  });

  it('searchUsers finds by display name prefix', async () => {
    const svc = new MockADDirectoryService();
    await svc.createUser({ samAccountName: 'a', userPrincipalName: 'a@hb.com', displayName: 'Alice' });
    await svc.createUser({ samAccountName: 'b', userPrincipalName: 'b@hb.com', displayName: 'Bob' });
    const results = await svc.searchUsers('Ali');
    expect(results).toHaveLength(1);
    expect(results[0].displayName).toBe('Alice');
  });

  it('updateUser modifies properties', async () => {
    const svc = new MockADDirectoryService();
    const created = await svc.createUser({
      samAccountName: 'jane.doe',
      userPrincipalName: 'jane.doe@corp.hb.com',
      displayName: 'Jane Doe',
    });
    await svc.updateUser(created.distinguishedName, { department: 'Engineering' });
    const updated = await svc.getUser(created.distinguishedName);
    expect(updated!.department).toBe('Engineering');
  });

  it('updateUser throws for unknown DN', async () => {
    const svc = new MockADDirectoryService();
    await expect(svc.updateUser('CN=Unknown,DC=fake', { department: 'X' }))
      .rejects.toThrow(IdentityNotFoundError);
  });

  it('setAccountEnabled disables account', async () => {
    const svc = new MockADDirectoryService();
    const created = await svc.createUser({
      samAccountName: 'jane.doe',
      userPrincipalName: 'jane.doe@corp.hb.com',
      displayName: 'Jane Doe',
    });
    await svc.setAccountEnabled(created.distinguishedName, false);
    const user = await svc.getUser(created.distinguishedName);
    expect(user!.enabled).toBe(false);
  });

  it('deleteUser removes user', async () => {
    const svc = new MockADDirectoryService();
    const created = await svc.createUser({
      samAccountName: 'jane.doe',
      userPrincipalName: 'jane.doe@corp.hb.com',
      displayName: 'Jane Doe',
    });
    await svc.deleteUser(created.distinguishedName);
    expect(await svc.getUser(created.distinguishedName)).toBeNull();
  });

  it('deleteUser throws for unknown DN', async () => {
    const svc = new MockADDirectoryService();
    await expect(svc.deleteUser('CN=Unknown,DC=fake')).rejects.toThrow(IdentityNotFoundError);
  });
});

describe('MockADDirectoryService — group operations', () => {
  it('createGroup returns a record', async () => {
    const svc = new MockADDirectoryService();
    const group = await svc.createGroup('it-admins', 'IT Admins', 'Admin group', 'OU=Groups,DC=corp,DC=hb,DC=com');
    expect(group.samAccountName).toBe('it-admins');
    expect(group.displayName).toBe('IT Admins');
    expect(group.members).toHaveLength(0);
  });

  it('createGroup throws on duplicate', async () => {
    const svc = new MockADDirectoryService();
    await svc.createGroup('it-admins', 'IT Admins', '', 'OU=Groups,DC=corp');
    await expect(svc.createGroup('it-admins', 'IT Admins 2', '', 'OU=Groups,DC=corp'))
      .rejects.toThrow(IdentityConflictError);
  });

  it('addGroupMembers and getGroup returns members', async () => {
    const svc = new MockADDirectoryService();
    const group = await svc.createGroup('team', 'Team', '', 'OU=Groups,DC=corp');
    await svc.addGroupMembers(group.distinguishedName, ['CN=Alice,OU=Users,DC=corp', 'CN=Bob,OU=Users,DC=corp']);
    const fetched = await svc.getGroup(group.distinguishedName);
    expect(fetched!.members).toHaveLength(2);
  });

  it('removeGroupMembers removes from group', async () => {
    const svc = new MockADDirectoryService();
    const group = await svc.createGroup('team', 'Team', '', 'OU=Groups,DC=corp');
    await svc.addGroupMembers(group.distinguishedName, ['CN=Alice,OU=Users,DC=corp', 'CN=Bob,OU=Users,DC=corp']);
    await svc.removeGroupMembers(group.distinguishedName, ['CN=Alice,OU=Users,DC=corp']);
    const fetched = await svc.getGroup(group.distinguishedName);
    expect(fetched!.members).toHaveLength(1);
  });

  it('deleteGroup removes the group', async () => {
    const svc = new MockADDirectoryService();
    const group = await svc.createGroup('team', 'Team', '', 'OU=Groups,DC=corp');
    await svc.deleteGroup(group.distinguishedName);
    expect(await svc.getGroup(group.distinguishedName)).toBeNull();
  });
});

describe('MockADDirectoryService — testConnection', () => {
  it('returns true', async () => {
    const svc = new MockADDirectoryService();
    expect(await svc.testConnection()).toBe(true);
  });
});

describe('ADDirectoryService (stub real)', () => {
  it('throws ADDSConnectivityError for all operations', async () => {
    const svc = new ADDirectoryService();
    await expect(svc.getUser('test')).rejects.toThrow(ADDSConnectivityError);
    await expect(svc.searchUsers('test')).rejects.toThrow(ADDSConnectivityError);
    await expect(svc.testConnection()).rejects.toThrow(ADDSConnectivityError);
  });
});
