import { odata } from '@azure/data-tables';
import type { IProjectManagementPlan, IPMPSignature } from '@hbc/models';
import { createAppTableClient } from '../utils/table-client-factory.js';

const PLAN_TABLE = 'HBPmpPlans';
const SIGNATURE_TABLE = 'HBPmpSignatures';

export interface IPmpService {
  listPlans(projectId: string, page: number, pageSize: number): Promise<{ items: IProjectManagementPlan[]; total: number }>;
  getPlanById(id: number): Promise<IProjectManagementPlan | null>;
  createPlan(data: Omit<IProjectManagementPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<IProjectManagementPlan>;
  updatePlan(id: number, data: Partial<IProjectManagementPlan>): Promise<IProjectManagementPlan | null>;
  deletePlan(id: number): Promise<void>;
  getSignatures(pmpId: number): Promise<IPMPSignature[]>;
  createSignature(data: Omit<IPMPSignature, 'id'>): Promise<IPMPSignature>;
}

// ---------------------------------------------------------------------------
// Real (Azure Table Storage)
// ---------------------------------------------------------------------------

export class RealPmpService implements IPmpService {
  private readonly planClient = createAppTableClient(PLAN_TABLE);
  private readonly signatureClient = createAppTableClient(SIGNATURE_TABLE);

  async listPlans(projectId: string, page: number, pageSize: number): Promise<{ items: IProjectManagementPlan[]; total: number }> {
    const all = await this.listByProject(projectId);
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length };
  }

  async getPlanById(id: number): Promise<IProjectManagementPlan | null> {
    const all = await this.listAllPlans();
    return all.find((p) => p.id === id) ?? null;
  }

  async createPlan(data: Omit<IProjectManagementPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<IProjectManagementPlan> {
    const id = Date.now();
    const now = new Date().toISOString();
    const plan: IProjectManagementPlan = { id, ...data, createdAt: now, updatedAt: now };
    await this.planClient.upsertEntity(
      { partitionKey: data.projectId, rowKey: String(id), version: plan.version, status: plan.status, createdAt: plan.createdAt, updatedAt: plan.updatedAt },
      'Replace',
    );
    return plan;
  }

  async updatePlan(id: number, data: Partial<IProjectManagementPlan>): Promise<IProjectManagementPlan | null> {
    const existing = await this.getPlanById(id);
    if (!existing) return null;
    const updated: IProjectManagementPlan = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    await this.planClient.upsertEntity(
      { partitionKey: updated.projectId, rowKey: String(id), version: updated.version, status: updated.status, createdAt: updated.createdAt, updatedAt: updated.updatedAt },
      'Replace',
    );
    return updated;
  }

  async deletePlan(id: number): Promise<void> {
    const existing = await this.getPlanById(id);
    if (!existing) return;
    try { await this.planClient.deleteEntity(existing.projectId, String(id)); } catch (err: unknown) { if (!isNotFound(err)) throw err; }
  }

  async getSignatures(pmpId: number): Promise<IPMPSignature[]> {
    const entities = this.signatureClient.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${String(pmpId)}` },
    });
    const results: IPMPSignature[] = [];
    for await (const entity of entities) { results.push(this.toSignature(entity, pmpId)); }
    return results;
  }

  async createSignature(data: Omit<IPMPSignature, 'id'>): Promise<IPMPSignature> {
    const id = Date.now();
    const signature: IPMPSignature = { id, ...data };
    await this.signatureClient.upsertEntity(
      { partitionKey: String(data.pmpId), rowKey: String(id), signerName: signature.signerName, role: signature.role, signedAt: signature.signedAt, status: signature.status },
      'Replace',
    );
    return signature;
  }

  private async listByProject(projectId: string): Promise<IProjectManagementPlan[]> {
    const entities = this.planClient.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${projectId}` },
    });
    const results: IProjectManagementPlan[] = [];
    for await (const entity of entities) { results.push(this.toPlan(entity)); }
    return results;
  }

  private async listAllPlans(): Promise<IProjectManagementPlan[]> {
    const entities = this.planClient.listEntities<Record<string, unknown>>();
    const results: IProjectManagementPlan[] = [];
    for await (const entity of entities) { results.push(this.toPlan(entity)); }
    return results;
  }

  private toPlan(entity: Record<string, unknown>): IProjectManagementPlan {
    return { id: Number(entity.rowKey), projectId: entity.partitionKey as string, version: Number(entity.version), status: entity.status as string, createdAt: entity.createdAt as string, updatedAt: entity.updatedAt as string };
  }

  private toSignature(entity: Record<string, unknown>, pmpId: number): IPMPSignature {
    return { id: Number(entity.rowKey), pmpId, signerName: entity.signerName as string, role: entity.role as string, signedAt: entity.signedAt as string, status: entity.status as string };
  }
}

// ---------------------------------------------------------------------------
// Mock (in-memory)
// ---------------------------------------------------------------------------

export class MockPmpService implements IPmpService {
  private readonly plans = new Map<number, IProjectManagementPlan>([
    [1, { id: 1, projectId: 'PRJ-001', version: 1, status: 'Draft', createdAt: '2026-01-08T00:00:00Z', updatedAt: '2026-02-15T00:00:00Z' }],
  ]);
  private readonly signatures = new Map<number, IPMPSignature>([
    [1, { id: 1, pmpId: 1, signerName: 'John Smith', role: 'Project Manager', signedAt: '2026-02-15T10:00:00Z', status: 'Signed' }],
  ]);

  async listPlans(projectId: string, page: number, pageSize: number): Promise<{ items: IProjectManagementPlan[]; total: number }> {
    const all = [...this.plans.values()].filter((p) => p.projectId === projectId);
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length };
  }

  async getPlanById(id: number): Promise<IProjectManagementPlan | null> { return this.plans.get(id) ?? null; }

  async createPlan(data: Omit<IProjectManagementPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<IProjectManagementPlan> {
    const id = Date.now();
    const now = new Date().toISOString();
    const plan: IProjectManagementPlan = { id, ...data, createdAt: now, updatedAt: now };
    this.plans.set(id, plan);
    return plan;
  }

  async updatePlan(id: number, data: Partial<IProjectManagementPlan>): Promise<IProjectManagementPlan | null> {
    const existing = this.plans.get(id);
    if (!existing) return null;
    const updated: IProjectManagementPlan = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    this.plans.set(id, updated);
    return updated;
  }

  async deletePlan(id: number): Promise<void> { this.plans.delete(id); }

  async getSignatures(pmpId: number): Promise<IPMPSignature[]> {
    return [...this.signatures.values()].filter((s) => s.pmpId === pmpId);
  }

  async createSignature(data: Omit<IPMPSignature, 'id'>): Promise<IPMPSignature> {
    const id = Date.now();
    const signature: IPMPSignature = { id, ...data };
    this.signatures.set(id, signature);
    return signature;
  }
}

function isNotFound(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'statusCode' in err && (err as { statusCode: number }).statusCode === 404;
}
