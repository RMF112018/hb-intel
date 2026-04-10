/**
 * Shared types for the People & Culture + HB Kudos comprehensive test suite.
 *
 * Extracted from the preliminary harness at
 * `scripts/testing/people-kudos-workflow/peopleKudosWorkflowHelpers.ts`.
 */

export type WorkflowStatus =
  | 'pending'
  | 'revisionRequested'
  | 'approved'
  | 'approvedScheduled'
  | 'rejected'
  | 'withdrawn'
  | 'removedUnpublished';

export type ProminenceIntent = 'standard' | 'pinned' | 'featured';
export type VisibilityMode = 'public' | 'associatedOnly' | 'internalOnly';

export type KudosEventType =
  | 'submit' | 'approve' | 'reject' | 'revisionRequested' | 'reopen'
  | 'remove' | 'restore' | 'flagAdminReview' | 'clearAdminReview'
  | 'claim' | 'reassign' | 'schedule' | 'unschedule'
  | 'feature' | 'unfeature' | 'pin' | 'unpin' | 'celebrate';

export interface HarnessConfig {
  siteUrl: string;
  lists: {
    peopleCultureKudos: string;
    kudosAuditEvents: string;
    peopleCultureAnnouncements: string;
    peopleCultureCelebrations: string;
  };
  testPrefix: string;
  cleanup: boolean;
  auditParity: boolean;
  docsDir: string;
}

export type StepStatus = 'pass' | 'fail' | 'warn' | 'skip' | 'dry';

export interface StepResult {
  step: string;
  status: StepStatus;
  detail?: string;
  evidence?: Record<string, unknown>;
}

export interface RunContext {
  config: HarnessConfig;
  runId: string;
  dryRun: boolean;
  verbose: boolean;
  getToken(): Promise<string>;
  currentUserId?: number;
  createdKudosItemIds: number[];
  createdAuditItemIds: number[];
  results: StepResult[];
}

export interface KudosDraftInput {
  kudosId: string;
  headline: string;
  excerpt: string;
  details: string;
  submittedByUserId?: number;
  publishStartIso: string;
  publishEndIso: string;
}

/**
 * Interface that every domain suite module exports. The runner calls
 * `run(ctx)` and collects the returned StepResults.
 */
export interface SuiteModule {
  name: string;
  run(ctx: RunContext): Promise<StepResult[]>;
}
