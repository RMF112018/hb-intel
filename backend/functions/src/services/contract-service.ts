import { odata } from '@azure/data-tables';
import type { IContractInfo, ICommitmentApproval } from '@hbc/models';
import { createAppTableClient } from '../utils/table-client-factory.js';

const CONTRACT_TABLE = 'HBContracts';
const APPROVAL_TABLE = 'HBContractApprovals';

export interface IContractService {
  listContracts(projectId: string, page: number, pageSize: number): Promise<{ items: IContractInfo[]; total: number }>;
  getContractById(id: number): Promise<IContractInfo | null>;
  createContract(data: Omit<IContractInfo, 'id'>): Promise<IContractInfo>;
  updateContract(id: number, data: Partial<IContractInfo>): Promise<IContractInfo | null>;
  deleteContract(id: number): Promise<void>;
  getApprovals(contractId: number): Promise<ICommitmentApproval[]>;
  createApproval(data: Omit<ICommitmentApproval, 'id'>): Promise<ICommitmentApproval>;
}

// ---------------------------------------------------------------------------
// Real (Azure Table Storage)
// ---------------------------------------------------------------------------

export class RealContractService implements IContractService {
  private readonly contractClient = createAppTableClient(CONTRACT_TABLE);
  private readonly approvalClient = createAppTableClient(APPROVAL_TABLE);

  async listContracts(projectId: string, page: number, pageSize: number): Promise<{ items: IContractInfo[]; total: number }> {
    const all = await this.listByProject(projectId);
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length };
  }

  async getContractById(id: number): Promise<IContractInfo | null> {
    const all = await this.listAllContracts();
    return all.find((c) => c.id === id) ?? null;
  }

  async createContract(data: Omit<IContractInfo, 'id'>): Promise<IContractInfo> {
    const id = Date.now();
    const contract: IContractInfo = { id, ...data };
    await this.contractClient.upsertEntity(
      { partitionKey: data.projectId, rowKey: String(id), contractNumber: contract.contractNumber, vendorName: contract.vendorName, amount: contract.amount, status: contract.status, executedDate: contract.executedDate },
      'Replace',
    );
    return contract;
  }

  async updateContract(id: number, data: Partial<IContractInfo>): Promise<IContractInfo | null> {
    const existing = await this.getContractById(id);
    if (!existing) return null;
    const updated: IContractInfo = { ...existing, ...data, id };
    await this.contractClient.upsertEntity(
      { partitionKey: updated.projectId, rowKey: String(id), contractNumber: updated.contractNumber, vendorName: updated.vendorName, amount: updated.amount, status: updated.status, executedDate: updated.executedDate },
      'Replace',
    );
    return updated;
  }

  async deleteContract(id: number): Promise<void> {
    const existing = await this.getContractById(id);
    if (!existing) return;
    try { await this.contractClient.deleteEntity(existing.projectId, String(id)); } catch (err: unknown) { if (!isNotFound(err)) throw err; }
  }

  async getApprovals(contractId: number): Promise<ICommitmentApproval[]> {
    const entities = this.approvalClient.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${String(contractId)}` },
    });
    const results: ICommitmentApproval[] = [];
    for await (const entity of entities) {
      results.push(this.toApproval(entity, contractId));
    }
    return results;
  }

  async createApproval(data: Omit<ICommitmentApproval, 'id'>): Promise<ICommitmentApproval> {
    const id = Date.now();
    const approval: ICommitmentApproval = { id, ...data };
    await this.approvalClient.upsertEntity(
      { partitionKey: String(data.contractId), rowKey: String(id), approverName: approval.approverName, approvedAt: approval.approvedAt, status: approval.status, notes: approval.notes },
      'Replace',
    );
    return approval;
  }

  private async listByProject(projectId: string): Promise<IContractInfo[]> {
    const entities = this.contractClient.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${projectId}` },
    });
    const results: IContractInfo[] = [];
    for await (const entity of entities) { results.push(this.toContract(entity)); }
    return results;
  }

  private async listAllContracts(): Promise<IContractInfo[]> {
    const entities = this.contractClient.listEntities<Record<string, unknown>>();
    const results: IContractInfo[] = [];
    for await (const entity of entities) { results.push(this.toContract(entity)); }
    return results;
  }

  private toContract(entity: Record<string, unknown>): IContractInfo {
    return { id: Number(entity.rowKey), projectId: entity.partitionKey as string, contractNumber: entity.contractNumber as string, vendorName: entity.vendorName as string, amount: Number(entity.amount), status: entity.status as string, executedDate: entity.executedDate as string };
  }

  private toApproval(entity: Record<string, unknown>, contractId: number): ICommitmentApproval {
    return { id: Number(entity.rowKey), contractId, approverName: entity.approverName as string, approvedAt: entity.approvedAt as string, status: entity.status as string, notes: entity.notes as string };
  }
}

// ---------------------------------------------------------------------------
// Mock (in-memory)
// ---------------------------------------------------------------------------

export class MockContractService implements IContractService {
  private readonly contracts = new Map<number, IContractInfo>([
    [1, { id: 1, projectId: 'PRJ-001', contractNumber: 'CTR-2026-001', vendorName: 'Acme Concrete LLC', amount: 2_150_000, status: 'Executed', executedDate: '2026-01-20' }],
    [2, { id: 2, projectId: 'PRJ-001', contractNumber: 'CTR-2026-002', vendorName: 'Steel Works Inc', amount: 3_800_000, status: 'Draft', executedDate: '' }],
  ]);
  private readonly approvals = new Map<number, ICommitmentApproval>([
    [1, { id: 1, contractId: 1, approverName: 'Sarah Johnson', approvedAt: '2026-01-18T14:30:00Z', status: 'Approved', notes: 'Reviewed and approved per project budget.' }],
  ]);

  async listContracts(projectId: string, page: number, pageSize: number): Promise<{ items: IContractInfo[]; total: number }> {
    const all = [...this.contracts.values()].filter((c) => c.projectId === projectId);
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length };
  }

  async getContractById(id: number): Promise<IContractInfo | null> { return this.contracts.get(id) ?? null; }

  async createContract(data: Omit<IContractInfo, 'id'>): Promise<IContractInfo> {
    const id = Date.now();
    const contract: IContractInfo = { id, ...data };
    this.contracts.set(id, contract);
    return contract;
  }

  async updateContract(id: number, data: Partial<IContractInfo>): Promise<IContractInfo | null> {
    const existing = this.contracts.get(id);
    if (!existing) return null;
    const updated: IContractInfo = { ...existing, ...data, id };
    this.contracts.set(id, updated);
    return updated;
  }

  async deleteContract(id: number): Promise<void> { this.contracts.delete(id); }

  async getApprovals(contractId: number): Promise<ICommitmentApproval[]> {
    return [...this.approvals.values()].filter((a) => a.contractId === contractId);
  }

  async createApproval(data: Omit<ICommitmentApproval, 'id'>): Promise<ICommitmentApproval> {
    const id = Date.now();
    const approval: ICommitmentApproval = { id, ...data };
    this.approvals.set(id, approval);
    return approval;
  }
}

function isNotFound(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'statusCode' in err && (err as { statusCode: number }).statusCode === 404;
}
