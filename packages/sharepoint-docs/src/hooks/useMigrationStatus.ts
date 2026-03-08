import { useQuery } from '@tanstack/react-query';
import type { IScheduledMigration } from '../types/index.js';
import { useSharePointDocsServices } from './internal/useSharePointDocsServices.js';

/** Polls the migration log for the current status of a scheduled migration job. */
export function useMigrationStatus(sourceContextId: string) {
  const { migrationLog } = useSharePointDocsServices();

  return useQuery<IScheduledMigration | null, Error>({
    queryKey: ['sharepoint-docs', 'migration-status', sourceContextId],
    queryFn: () => migrationLog.getJobByContextId(sourceContextId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      if (data.status === 'in-progress') return 10_000;  // poll every 10s while running
      if (data.status === 'pending') return 60_000;       // check every minute while pending
      return false;                                        // done — stop polling
    },
  });
}
