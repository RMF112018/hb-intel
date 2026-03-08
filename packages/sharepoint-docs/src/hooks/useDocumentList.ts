import { useQuery } from '@tanstack/react-query';
import type { IUploadedDocument, DocumentContextType } from '../types/index.js';
import { useSharePointDocsServices } from './internal/useSharePointDocsServices.js';

/**
 * Lists all documents attached to a context. Polls every 30 seconds
 * while any document has migrationStatus = 'in-progress' or 'scheduled'.
 */
export function useDocumentList(contextId: string, contextType: DocumentContextType) {
  const { registry } = useSharePointDocsServices();

  return useQuery<IUploadedDocument[], Error>({
    queryKey: ['sharepoint-docs', 'documents', contextId],
    queryFn: () => registry.listByContextId(contextId),
    refetchInterval: (query) => {
      const data = query.state.data;
      const hasPending = data?.some(d =>
        d.migrationStatus === 'in-progress' || d.migrationStatus === 'scheduled'
      );
      return hasPending ? 30_000 : false;
    },
    staleTime: 60_000,
  });
}
