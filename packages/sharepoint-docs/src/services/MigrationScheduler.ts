import type { IDocumentMigrationConfig, IScheduledMigration } from '../types/index.js';
import {
  MIGRATION_WINDOW_START_HOUR,
  MIGRATION_WINDOW_END_HOUR,
  PRE_NOTIFICATION_LEAD_HOURS,
  RETRY_DELAY_FIRST_MINUTES,
  RETRY_DELAY_SECOND_HOURS,
  ESCALATION_FAILURE_THRESHOLD,
} from '../constants/migrationSchedule.js';
import { MigrationLogClient } from '../api/MigrationLogClient.js';
import { MigrationService } from './MigrationService.js';

/**
 * Manages migration scheduling (D-02):
 *
 * - Creates a scheduled migration entry in HBCMigrationLog
 * - Sends a pre-notification to PM(s) ~8 hours before the migration window
 * - Executes migration when the 10 PM–2 AM window opens
 * - Retries on failure with backoff: 30 min → 2 hrs → next night window
 * - After ESCALATION_FAILURE_THRESHOLD failures, escalates to Director (D-11)
 *
 * In production this is driven by an Azure Function timer trigger (cron: 0 22 * * *).
 * The trigger scans HBCMigrationLog for all jobs with status = 'pending' and
 * a scheduledWindowStart matching tonight's date, then calls execute() for each.
 */
export class MigrationScheduler {
  constructor(
    private migrationLog: MigrationLogClient,
    private migrationService: MigrationService,
    private notificationService: INotificationService
  ) {}

  /**
   * Called by the provisioning saga when a project site is created.
   * Schedules document migration for the next available 10 PM–2 AM window.
   */
  async schedule(config: IDocumentMigrationConfig): Promise<IScheduledMigration> {
    const jobId = crypto.randomUUID();
    const windowStart = this.getNextWindowStart();
    const windowEnd = this.getWindowEnd(windowStart);

    const scheduled: IScheduledMigration = {
      jobId,
      sourceContextId: config.sourceContextId,
      destinationProjectId: config.destinationProjectId,
      destinationSiteUrl: config.destinationSiteUrl,
      destinationLibraryPath: config.destinationLibraryPath
        ?? this.getDefaultLibraryPath(config.sourceContextType),
      notifyUserUpns: config.notifyUserUpns,
      directorUpn: config.directorUpn,
      scheduledWindowStart: windowStart.toISOString(),
      scheduledWindowEnd: windowEnd.toISOString(),
      preNotificationSentAt: null,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    await this.migrationLog.createScheduledJob(scheduled);

    // Schedule pre-notification (sent during business hours, ~8 hrs before window)
    const preNotifyAt = new Date(windowStart.getTime() - PRE_NOTIFICATION_LEAD_HOURS * 60 * 60 * 1000);
    await this.schedulePreNotification(scheduled, preNotifyAt);

    return scheduled;
  }

  /**
   * Triggers migration immediately (user clicked "Migrate Now").
   * Updates the scheduled job status to 'overridden-immediate'.
   */
  async triggerImmediate(jobId: string): Promise<void> {
    const job = await this.migrationLog.getScheduledJob(jobId);
    if (!job) throw new Error(`Job not found: ${jobId}`);

    await this.migrationLog.updateJobStatus(jobId, 'overridden-immediate');
    await this.migrationService.execute(job);
  }

  /**
   * Pauses a scheduled migration (user clicked "Pause").
   * The job will not run during the scheduled window.
   */
  async pause(jobId: string): Promise<void> {
    await this.migrationLog.updateJobStatus(jobId, 'paused');
  }

  /**
   * Called by the Azure Function timer at 10 PM each night.
   * Processes all pending migration jobs scheduled for tonight's window.
   * Handles retry logic and escalation (D-11).
   */
  async processNightlyWindow(): Promise<void> {
    const pendingJobs = await this.migrationLog.getPendingJobsForTonight();

    for (const job of pendingJobs) {
      try {
        await this.migrationLog.updateJobStatus(job.jobId, 'in-progress');
        const result = await this.migrationService.execute(job);

        if (result.failedCount === 0 && result.conflictCount === 0) {
          await this.migrationLog.updateJobStatus(job.jobId, 'completed');
          await this.sendCompletionNotification(job, result);
        } else if (result.failedCount > 0) {
          await this.handleRetry(job, result);
        } else {
          // Only conflicts — not a failure, just needs human attention
          await this.migrationLog.updateJobStatus(job.jobId, 'completed');
          await this.sendConflictNotification(job, result);
        }
      } catch (error) {
        await this.handleRetry(job, null);
      }
    }
  }

  /**
   * Handles retry logic with backoff and escalation (D-11).
   *
   * Attempt 1 failure → retry in 30 minutes
   * Attempt 2 failure → retry in 2 hours
   * Attempt 3+ failure → escalate to Director, surface manual retry button
   */
  private async handleRetry(job: IScheduledMigration, result: unknown): Promise<void> {
    const attemptCount = await this.migrationLog.getAttemptCount(job.jobId);

    if (attemptCount < ESCALATION_FAILURE_THRESHOLD) {
      const delayMs = attemptCount === 1
        ? RETRY_DELAY_FIRST_MINUTES * 60 * 1000
        : RETRY_DELAY_SECOND_HOURS * 60 * 60 * 1000;

      // Send warning notification to PM(s) after first failure
      if (attemptCount === 1) {
        await this.notificationService.sendWarning({
          recipientUpns: job.notifyUserUpns,
          subject: `Migration taking longer than expected — ${job.sourceContextId}`,
          body: `Document migration is retrying automatically. We'll notify you when it completes.`,
          jobId: job.jobId,
        });
      }

      // Schedule retry (in real implementation: queue Azure Function message with delay)
      await this.migrationLog.scheduleRetry(job.jobId, new Date(Date.now() + delayMs));

    } else {
      // ESCALATION_FAILURE_THRESHOLD failures reached — escalate (D-11)
      await this.migrationLog.setEscalated(job.jobId);
      await this.notificationService.sendEscalation({
        recipientUpn: job.directorUpn,
        subject: `Migration requires attention — ${job.sourceContextId}`,
        body: `Document migration for ${job.sourceContextId} has failed ${attemptCount} times over 48 hours. Manual intervention required.`,
        manualRetryUrl: `${process.env.VITE_PWA_BASE_URL}/migration/retry/${job.jobId}`,
        jobId: job.jobId,
      });
    }
  }

  private async schedulePreNotification(job: IScheduledMigration, sendAt: Date): Promise<void> {
    // In production: queue an Azure Function message with a scheduled delivery time
    // For simplicity in the plan, this is a conceptual representation
    await this.notificationService.schedulePreMigrationNotice({
      recipientUpns: job.notifyUserUpns,
      sendAt: sendAt.toISOString(),
      scheduledWindowStart: job.scheduledWindowStart,
      jobId: job.jobId,
      sourceContextId: job.sourceContextId,
      manualTriggerUrl: `${process.env.VITE_PWA_BASE_URL}/migration/trigger/${job.jobId}`,
      pauseUrl: `${process.env.VITE_PWA_BASE_URL}/migration/pause/${job.jobId}`,
    });
  }

  /**
   * Calculates the next 10 PM window start in local time.
   * If current time is past 10 PM but before 2 AM, return tonight's 10 PM (past — trigger immediately).
   * If current time is past 2 AM, return tomorrow's 10 PM.
   */
  private getNextWindowStart(): Date {
    const now = new Date();
    const windowStart = new Date(now);
    windowStart.setHours(MIGRATION_WINDOW_START_HOUR, 0, 0, 0);

    if (now.getHours() >= MIGRATION_WINDOW_END_HOUR && now < windowStart) {
      // We're between 2 AM and 10 PM — tonight's window is still upcoming
      return windowStart;
    }
    // Past 10 PM or before 2 AM — move to next day's window
    windowStart.setDate(windowStart.getDate() + 1);
    return windowStart;
  }

  private getWindowEnd(windowStart: Date): Date {
    const end = new Date(windowStart);
    end.setDate(end.getDate() + (MIGRATION_WINDOW_END_HOUR < MIGRATION_WINDOW_START_HOUR ? 1 : 0));
    end.setHours(MIGRATION_WINDOW_END_HOUR, 0, 0, 0);
    return end;
  }

  private getDefaultLibraryPath(contextType: string): string {
    return contextType === 'bd-lead' ? 'Shared Documents/BD Heritage' : 'Shared Documents/Estimating';
  }

  private async sendCompletionNotification(job: IScheduledMigration, result: unknown): Promise<void> {
    await this.notificationService.sendMigrationComplete({
      recipientUpns: job.notifyUserUpns,
      jobId: job.jobId,
      result,
    });
  }

  private async sendConflictNotification(job: IScheduledMigration, result: unknown): Promise<void> {
    await this.notificationService.sendConflictAlert({
      recipientUpns: job.notifyUserUpns,
      jobId: job.jobId,
      result,
      resolveUrl: `${process.env.VITE_PWA_BASE_URL}/migration/conflicts/${job.jobId}`,
    });
  }
}

/** Notification service interface — implemented by @hbc/notification-intelligence (SF-10). */
interface INotificationService {
  schedulePreMigrationNotice(params: {
    recipientUpns: string[];
    sendAt: string;
    scheduledWindowStart: string;
    jobId: string;
    sourceContextId: string;
    manualTriggerUrl: string;
    pauseUrl: string;
  }): Promise<void>;

  sendWarning(params: {
    recipientUpns: string[];
    subject: string;
    body: string;
    jobId: string;
  }): Promise<void>;

  sendEscalation(params: {
    recipientUpn: string;
    subject: string;
    body: string;
    manualRetryUrl: string;
    jobId: string;
  }): Promise<void>;

  sendMigrationComplete(params: {
    recipientUpns: string[];
    jobId: string;
    result: unknown;
  }): Promise<void>;

  sendConflictAlert(params: {
    recipientUpns: string[];
    jobId: string;
    result: unknown;
    resolveUrl: string;
  }): Promise<void>;
}
