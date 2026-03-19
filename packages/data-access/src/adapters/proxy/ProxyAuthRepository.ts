/**
 * Proxy adapter for the Auth (users, roles, permissions, job title mappings) repository.
 *
 * Implements IAuthRepository using the B1 HTTP proxy contract.
 * Auth resources are top-level (not project-scoped).
 *
 * API paths (A9 route catalog):
 *   GET    /auth/me                              → current user
 *   GET    /auth/roles                           → all roles
 *   GET    /auth/roles/{id}                      → role by ID
 *   POST   /auth/roles                           → create role
 *   PATCH  /auth/roles/{id}                      → update role
 *   DELETE /auth/roles/{id}                      → delete role
 *   POST   /auth/users/{userId}/roles            → assign role
 *   DELETE /auth/users/{userId}/roles/{roleId}   → remove role
 *   GET    /auth/templates                       → all templates
 *   POST   /auth/templates                       → create template
 *   PATCH  /auth/templates/{id}                  → update template
 *   DELETE /auth/templates/{id}                  → delete template
 *   GET    /auth/job-title-mappings              → all mappings
 *   POST   /auth/job-title-mappings              → create mapping
 *   PATCH  /auth/job-title-mappings/{id}         → update mapping
 *   DELETE /auth/job-title-mappings/{id}         → delete mapping
 */

import type {
  ICurrentUser,
  IRole,
  IPermissionTemplate,
  IJobTitleMapping,
} from '@hbc/models';
import type { IAuthRepository } from '../../ports/IAuthRepository.js';
import type { ProxyHttpClient, RequestMetadata } from './ProxyHttpClient.js';
import { BaseRepository } from '../base.js';
import { NotFoundError } from '../../errors/index.js';
import { parseItemEnvelope } from './envelope.js';

export class ProxyAuthRepository extends BaseRepository<ICurrentUser> implements IAuthRepository {
  constructor(private readonly client: ProxyHttpClient) {
    super();
  }

  // ── Session ─────────────────────────────────────────────────────────────

  async getCurrentUser(): Promise<ICurrentUser> {
    const raw = await this.client.get<unknown>('/auth/me', undefined, { domain: 'auth', operation: 'getCurrentUser' });
    return parseItemEnvelope<ICurrentUser>(raw);
  }

  // ── Role definitions ─────────────────────────────────────────────────────

  async getRoles(): Promise<IRole[]> {
    const raw = await this.client.get<unknown>('/auth/roles', undefined, { domain: 'auth', operation: 'getRoles' });
    return parseItemEnvelope<IRole[]>(raw);
  }

  async getRoleById(id: string): Promise<IRole | null> {
    this.validateId(id, 'Role');
    try {
      const raw = await this.client.get<unknown>(`/auth/roles/${id}`, undefined, { domain: 'auth', operation: 'getRoleById' });
      return parseItemEnvelope<IRole>(raw);
    } catch (err) {
      if (err instanceof NotFoundError) return null;
      throw err;
    }
  }

  async createRole(role: Omit<IRole, 'id'>): Promise<IRole> {
    const raw = await this.client.post<unknown>('/auth/roles', role, { domain: 'auth', operation: 'createRole' });
    return parseItemEnvelope<IRole>(raw);
  }

  async updateRole(id: string, updates: Partial<Omit<IRole, 'id'>>): Promise<IRole> {
    this.validateId(id, 'Role');
    const raw = await this.client.patch<unknown>(`/auth/roles/${id}`, updates, { domain: 'auth', operation: 'updateRole' });
    return parseItemEnvelope<IRole>(raw);
  }

  async deleteRole(id: string): Promise<void> {
    await this.client.delete(`/auth/roles/${id}`, { domain: 'auth', operation: 'deleteRole' });
  }

  // ── Role assignment ───────────────────────────────────────────────────────

  async assignRole(userId: string, roleId: string): Promise<void> {
    this.validateId(userId, 'User');
    this.validateId(roleId, 'Role');
    await this.client.post<unknown>(`/auth/users/${userId}/roles`, { roleId }, { domain: 'auth', operation: 'assignRole' });
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    this.validateId(userId, 'User');
    this.validateId(roleId, 'Role');
    await this.client.delete(`/auth/users/${userId}/roles/${roleId}`, { domain: 'auth', operation: 'removeRole' });
  }

  // ── Permission templates ──────────────────────────────────────────────────

  async getPermissionTemplates(): Promise<IPermissionTemplate[]> {
    const raw = await this.client.get<unknown>('/auth/templates', undefined, { domain: 'auth', operation: 'getPermissionTemplates' });
    return parseItemEnvelope<IPermissionTemplate[]>(raw);
  }

  async createPermissionTemplate(
    template: Omit<IPermissionTemplate, 'id'>,
  ): Promise<IPermissionTemplate> {
    const raw = await this.client.post<unknown>('/auth/templates', template, { domain: 'auth', operation: 'createPermissionTemplate' });
    return parseItemEnvelope<IPermissionTemplate>(raw);
  }

  async updatePermissionTemplate(
    id: string,
    updates: Partial<Omit<IPermissionTemplate, 'id'>>,
  ): Promise<IPermissionTemplate> {
    this.validateId(id, 'PermissionTemplate');
    const raw = await this.client.patch<unknown>(`/auth/templates/${id}`, updates, { domain: 'auth', operation: 'updatePermissionTemplate' });
    return parseItemEnvelope<IPermissionTemplate>(raw);
  }

  async deletePermissionTemplate(id: string): Promise<void> {
    await this.client.delete(`/auth/templates/${id}`, { domain: 'auth', operation: 'deletePermissionTemplate' });
  }

  // ── Job Title mappings ────────────────────────────────────────────────────

  async getJobTitleMappings(): Promise<IJobTitleMapping[]> {
    const raw = await this.client.get<unknown>('/auth/job-title-mappings', undefined, { domain: 'auth', operation: 'getJobTitleMappings' });
    return parseItemEnvelope<IJobTitleMapping[]>(raw);
  }

  async createJobTitleMapping(
    mapping: Omit<IJobTitleMapping, 'id'>,
  ): Promise<IJobTitleMapping> {
    const raw = await this.client.post<unknown>('/auth/job-title-mappings', mapping, { domain: 'auth', operation: 'createJobTitleMapping' });
    return parseItemEnvelope<IJobTitleMapping>(raw);
  }

  async updateJobTitleMapping(
    id: string,
    updates: Partial<Omit<IJobTitleMapping, 'id'>>,
  ): Promise<IJobTitleMapping> {
    this.validateId(id, 'JobTitleMapping');
    const raw = await this.client.patch<unknown>(`/auth/job-title-mappings/${id}`, updates, { domain: 'auth', operation: 'updateJobTitleMapping' });
    return parseItemEnvelope<IJobTitleMapping>(raw);
  }

  async deleteJobTitleMapping(id: string): Promise<void> {
    await this.client.delete(`/auth/job-title-mappings/${id}`, { domain: 'auth', operation: 'deleteJobTitleMapping' });
  }
}
