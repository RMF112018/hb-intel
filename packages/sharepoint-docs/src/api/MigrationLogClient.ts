import type { IScheduledMigration } from '../types/index.js';
import { MIGLOG } from '../constants/registryColumns.js';

export class MigrationLogClient {
  constructor(
    private listEndpoint: string,
    private getAuthHeader: () => Promise<Record<string, string>>
  ) {}

  async createScheduledJob(job: IScheduledMigration): Promise<void> {
    const headers = await this.getAuthHeader();
    await fetch(`${this.listEndpoint}/items`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        [MIGLOG.JOB_ID]: job.jobId,
        [MIGLOG.RECORD_ID]: job.sourceContextId,
        [MIGLOG.DOCUMENT_ID]: 'JOB_LEVEL',
        [MIGLOG.CHECKPOINT]: 'pending',
        [MIGLOG.ATTEMPT_NUMBER]: 0,
        [MIGLOG.ATTEMPTED_AT]: job.createdAt,
        [MIGLOG.SCHEDULED_WINDOW]: `${job.scheduledWindowStart}–${job.scheduledWindowEnd}`,
        [MIGLOG.NOTIFIED_PM]: false,
        [MIGLOG.ESCALATED]: false,
      }),
    });
  }

  /** Returns document IDs from pendingDocumentIds that still have checkpoint = 'pending'. */
  async filterPending(jobId: string, documentIds: string[]): Promise<string[]> {
    const headers = await this.getAuthHeader();
    const filter = `${MIGLOG.JOB_ID} eq '${jobId}' and ${MIGLOG.CHECKPOINT} eq 'completed'`;
    const res = await fetch(
      `${this.listEndpoint}/items?$filter=${encodeURIComponent(filter)}&$select=${MIGLOG.DOCUMENT_ID}`,
      { headers }
    );
    const data = await res.json();
    const completedIds = new Set<string>(
      (data.value as Record<string, string>[]).map(item => item[MIGLOG.DOCUMENT_ID])
    );
    return documentIds.filter(id => !completedIds.has(id));
  }

  async setCheckpoint(
    jobId: string,
    documentId: string,
    checkpoint: string,
    errorMessage?: string
  ): Promise<void> {
    const headers = await this.getAuthHeader();
    await fetch(`${this.listEndpoint}/items`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        [MIGLOG.JOB_ID]: jobId,
        [MIGLOG.DOCUMENT_ID]: documentId,
        [MIGLOG.CHECKPOINT]: checkpoint,
        [MIGLOG.ATTEMPT_NUMBER]: 1,
        [MIGLOG.ATTEMPTED_AT]: new Date().toISOString(),
        [MIGLOG.ERROR_MESSAGE]: errorMessage ?? '',
        [MIGLOG.NOTIFIED_PM]: false,
        [MIGLOG.ESCALATED]: false,
      }),
    });
  }

  async updateJobStatus(jobId: string, status: string): Promise<void> {
    // Updates the JOB_LEVEL row status
    const headers = await this.getAuthHeader();
    const filter = `${MIGLOG.JOB_ID} eq '${jobId}' and ${MIGLOG.DOCUMENT_ID} eq 'JOB_LEVEL'`;
    const res = await fetch(
      `${this.listEndpoint}/items?$filter=${encodeURIComponent(filter)}&$select=id&$top=1`,
      { headers }
    );
    const data = await res.json();
    if (!data.value?.length) return;
    const itemId = data.value[0].id;
    await fetch(`${this.listEndpoint}/items(${itemId})`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json', 'If-Match': '*' },
      body: JSON.stringify({ [MIGLOG.CHECKPOINT]: status }),
    });
  }

  async getPendingJobsForTonight(): Promise<IScheduledMigration[]> {
    const headers = await this.getAuthHeader();
    const filter = `${MIGLOG.CHECKPOINT} eq 'pending' and ${MIGLOG.DOCUMENT_ID} eq 'JOB_LEVEL'`;
    const res = await fetch(
      `${this.listEndpoint}/items?$filter=${encodeURIComponent(filter)}`,
      { headers }
    );
    const data = await res.json();
    return (data.value as Record<string, unknown>[]).map(item => this.mapToScheduledMigration(item));
  }

  async getAttemptCount(jobId: string): Promise<number> {
    const headers = await this.getAuthHeader();
    const filter = `${MIGLOG.JOB_ID} eq '${jobId}' and ${MIGLOG.CHECKPOINT} eq 'failed'`;
    const res = await fetch(
      `${this.listEndpoint}/items?$filter=${encodeURIComponent(filter)}&$select=id`,
      { headers }
    );
    const data = await res.json();
    return data.value?.length ?? 0;
  }

  async setEscalated(jobId: string): Promise<void> {
    await this.updateJobField(jobId, MIGLOG.ESCALATED, true);
  }

  async scheduleRetry(jobId: string, retryAt: Date): Promise<void> {
    // In production: write a delayed message to Azure Storage Queue
    // Represented here as a log entry for planning purposes
    await this.updateJobField(jobId, MIGLOG.CHECKPOINT, `retry-scheduled-${retryAt.toISOString()}`);
  }

  async flagConflictWatchdogScheduled(jobId: string): Promise<void> {
    await this.updateJobField(jobId, MIGLOG.CHECKPOINT, 'conflict-watchdog-scheduled');
  }

  async getJobByContextId(contextId: string): Promise<IScheduledMigration | null> {
    const headers = await this.getAuthHeader();
    const filter = `${MIGLOG.RECORD_ID} eq '${contextId}' and ${MIGLOG.DOCUMENT_ID} eq 'JOB_LEVEL'`;
    const res = await fetch(
      `${this.listEndpoint}/items?$filter=${encodeURIComponent(filter)}&$top=1&$orderby=${MIGLOG.ATTEMPTED_AT} desc`,
      { headers }
    );
    const data = await res.json();
    if (!data.value?.length) return null;
    return this.mapToScheduledMigration(data.value[0]);
  }

  async getScheduledJob(jobId: string): Promise<IScheduledMigration | null> {
    const headers = await this.getAuthHeader();
    const filter = `${MIGLOG.JOB_ID} eq '${jobId}' and ${MIGLOG.DOCUMENT_ID} eq 'JOB_LEVEL'`;
    const res = await fetch(
      `${this.listEndpoint}/items?$filter=${encodeURIComponent(filter)}&$top=1`,
      { headers }
    );
    const data = await res.json();
    if (!data.value?.length) return null;
    return this.mapToScheduledMigration(data.value[0]);
  }

  private async updateJobField(jobId: string, field: string, value: unknown): Promise<void> {
    const headers = await this.getAuthHeader();
    const filter = `${MIGLOG.JOB_ID} eq '${jobId}' and ${MIGLOG.DOCUMENT_ID} eq 'JOB_LEVEL'`;
    const res = await fetch(
      `${this.listEndpoint}/items?$filter=${encodeURIComponent(filter)}&$select=id&$top=1`,
      { headers }
    );
    const data = await res.json();
    if (!data.value?.length) return;
    await fetch(`${this.listEndpoint}/items(${data.value[0].id})`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json', 'If-Match': '*' },
      body: JSON.stringify({ [field]: value }),
    });
  }

  private mapToScheduledMigration(item: Record<string, unknown>): IScheduledMigration {
    // Simplified mapping — real implementation reads all fields from the list item
    return item as unknown as IScheduledMigration;
  }
}
