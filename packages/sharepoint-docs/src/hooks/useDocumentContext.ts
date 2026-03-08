import { useQuery } from '@tanstack/react-query';
import type { IDocumentContextConfig, IResolvedDocumentContext } from '../types/index.js';
import { useSharePointDocsServices } from './internal/useSharePointDocsServices.js';

/**
 * Resolves or creates the SharePoint folder for a document context.
 * Returns the resolved context (with folderUrl and folderName) once ready.
 *
 * Usage in a BD Scorecard form:
 *   const { data: context, isLoading } = useDocumentContext({
 *     contextId: scorecard.id,
 *     contextType: 'bd-lead',
 *     contextLabel: `BD Lead: ${scorecard.projectName}`,
 *     siteUrl: null,           // pre-provisioning
 *     ownerUpn: currentUser.upn,
 *     ownerLastName: currentUser.lastName,
 *   });
 */
export function useDocumentContext(config: IDocumentContextConfig) {
  const { folderManager } = useSharePointDocsServices();

  return useQuery<IResolvedDocumentContext, Error>({
    queryKey: ['sharepoint-docs', 'context', config.contextId],
    queryFn: () => folderManager.resolveOrCreate(config),
    staleTime: 10 * 60 * 1000,  // Context folders don't change often — 10 min stale
    retry: 2,
  });
}
