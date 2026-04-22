/**
 * Pure state derivation for the Reporting Period Dashboard.
 *
 * Phase-3 root-cause remediation (Periods tab "Failed to load reporting
 * periods." lie): this helper replaces the old boolean-OR collapse that
 * merged every failure into one message. It preserves the real failing seam
 * so the UI can tell the truth and retry the correct scope.
 *
 * State variants — named by *what actually failed*, not what the UI does
 * with them:
 *
 *   loading                    — either parent query still pending
 *   fatal-periods              — reporting-periods parent failed; nothing useful to render
 *   fatal-both                 — both parent and dependent failed
 *   subordinate-project-weeks  — periods loaded, project-week dependent failed
 *   empty                      — both loaded, selected period simply has no project weeks
 *   ready                      — both loaded, project weeks present
 *
 * Keeping this a pure function lets us cover every branch in unit tests
 * without mounting the full page tree.
 */

export interface QueryLike<TError = unknown> {
  readonly isPending: boolean;
  readonly isError: boolean;
  readonly error?: TError | null;
  readonly data?: unknown;
}

export type PeriodsDashboardState =
  | { readonly variant: 'loading' }
  | {
      readonly variant: 'fatal-periods';
      readonly message: string;
      readonly detail?: string;
    }
  | {
      readonly variant: 'fatal-both';
      readonly message: string;
      readonly periodsDetail?: string;
      readonly projectWeeksDetail?: string;
    }
  | {
      readonly variant: 'subordinate-project-weeks';
      readonly message: string;
      readonly detail?: string;
    }
  | { readonly variant: 'empty' }
  | { readonly variant: 'ready'; readonly projectWeekCount: number };

function errorDetail(err: unknown): string | undefined {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string' && err) return err;
  return undefined;
}

export function derivePeriodsDashboardState(
  periodsQuery: QueryLike,
  projectWeeksQuery: QueryLike,
  projectWeekCount: number,
): PeriodsDashboardState {
  if (periodsQuery.isPending || projectWeeksQuery.isPending) {
    return { variant: 'loading' };
  }

  const periodsFailed = periodsQuery.isError;
  const projectWeeksFailed = projectWeeksQuery.isError;

  if (periodsFailed && projectWeeksFailed) {
    return {
      variant: 'fatal-both',
      message:
        'Reporting periods and project-week records both failed to load. Retry both to recover.',
      periodsDetail: errorDetail(periodsQuery.error),
      projectWeeksDetail: errorDetail(projectWeeksQuery.error),
    };
  }

  if (periodsFailed) {
    return {
      variant: 'fatal-periods',
      message: 'Reporting periods failed to load. The dashboard cannot render without them.',
      detail: errorDetail(periodsQuery.error),
    };
  }

  if (projectWeeksFailed) {
    return {
      variant: 'subordinate-project-weeks',
      message:
        'Project-week records failed to load for the selected reporting period. The period list above is fresh; only the dashboard body could not be fetched.',
      detail: errorDetail(projectWeeksQuery.error),
    };
  }

  if (projectWeekCount === 0) {
    return { variant: 'empty' };
  }

  return { variant: 'ready', projectWeekCount };
}
