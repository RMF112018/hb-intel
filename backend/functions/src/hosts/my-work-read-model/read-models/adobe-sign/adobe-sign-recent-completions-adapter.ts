import type {
  MyWorkAdobeSignRecentCompletionsItem,
  MyWorkAdobeSignRecentCompletionsPagination,
  MyWorkAdobeSignRecentCompletionsQuery,
  MyWorkAdobeSignRecentCompletionsReadModel,
  MyWorkAdobeSignRecentCompletionsSummary,
  MyWorkReadModelEnvelope,
  MyWorkReadModelSourceStatus,
  MyWorkReadModelWarning,
} from '@hbc/models/myWork';

import type { MyWorkReadContext } from '../my-work-read-model-provider.js';

import type {
  AdobeSignPrincipalResolutionResult,
  AdobeSignResolvedPrincipal,
} from './adobe-sign-principal-resolution.js';
import { toMyWorkSourceStatus } from './adobe-sign-principal-resolution.js';
import {
  ADOBE_SIGN_RECENT_COMPLETIONS_WINDOW_DAYS,
  buildAdobeSignRecentCompletionsRequest,
} from './adobe-sign-recent-completions-request.js';
import type { AdobeSignRecentCompletionsResultStage } from './adobe-sign-runtime-diagnostics.js';
import {
  evaluateAdobeSignSourceHandoff,
  type AdobeSignSourceHandoffPolicyConfig,
} from './adobe-sign-source-handoff-policy.js';
import type { IAdobeSignSearchClient } from './adobe-sign-search-client.js';
import type { IAdobeSignTokenService } from './adobe-sign-token-service.js';

export interface IAdobeSignRecentCompletionsAdapter {
  getRecentCompletions(
    context: MyWorkReadContext,
    query: MyWorkAdobeSignRecentCompletionsQuery,
  ): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>>;
}

export type AdobeSignPrincipalResolver = (
  context: MyWorkReadContext,
) => Promise<AdobeSignPrincipalResolutionResult>;

export interface AdobeSignRecentCompletionsAdapterDeps {
  readonly resolvePrincipal: AdobeSignPrincipalResolver;
  readonly tokenService: IAdobeSignTokenService;
  readonly searchClient: IAdobeSignSearchClient;
  readonly now: () => Date;
  readonly urlPolicyConfig?: AdobeSignSourceHandoffPolicyConfig;
}

function emptySummary(): MyWorkAdobeSignRecentCompletionsSummary {
  return {
    countBasis: 'returned-items',
    completedAgreementCount: 0,
    windowDays: ADOBE_SIGN_RECENT_COMPLETIONS_WINDOW_DAYS,
  };
}

function emptyReadModel(generatedAtUtc: string): MyWorkAdobeSignRecentCompletionsReadModel {
  return {
    moduleId: 'adobe-sign-recent-completions',
    summary: emptySummary(),
    items: [],
    pagination: { pageSize: 0, hasMore: false },
    freshness: { state: 'unknown', generatedAtUtc },
  };
}

function envelope(
  sourceStatus: MyWorkReadModelSourceStatus,
  warnings: readonly MyWorkReadModelWarning[],
  data: MyWorkAdobeSignRecentCompletionsReadModel,
  generatedAtUtc: string,
): MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel> {
  return {
    mode: 'backend',
    sourceStatus,
    readOnly: true,
    warnings,
    generatedAtUtc,
    data,
  };
}

function buildItemId(agreementId: string): string {
  return `adobe-sign:completed-agreement-${agreementId}`;
}

export function createAdobeSignRecentCompletionsAdapter(
  deps: AdobeSignRecentCompletionsAdapterDeps,
): IAdobeSignRecentCompletionsAdapter {
  return {
    async getRecentCompletions(context, query) {
      const trackRecentCompletionsResult = (
        sourceStatus: MyWorkReadModelSourceStatus,
        resultStage: AdobeSignRecentCompletionsResultStage,
        warnings?: readonly MyWorkReadModelWarning[],
        extras?: { readonly itemCount?: number; readonly hasMore?: boolean },
      ) => {
        context.diagnostics?.trackAdobeSignRuntimeEvent('adobeSign.read.recentCompletions.result', {
          sourceStatus,
          resultStage,
          warningCodes: warnings?.map((w) => w.code),
          windowDays: ADOBE_SIGN_RECENT_COMPLETIONS_WINDOW_DAYS,
          ...(extras?.itemCount !== undefined ? { itemCount: extras.itemCount } : {}),
          ...(extras?.hasMore !== undefined ? { hasMore: extras.hasMore } : {}),
        });
      };

      const now = deps.now();
      const generatedAtUtc = now.toISOString();

      const resolution = await deps.resolvePrincipal(context);
      if (resolution.status !== 'resolved') {
        const sourceStatus = toMyWorkSourceStatus(resolution.status);
        const warnings: readonly MyWorkReadModelWarning[] = [{ code: resolution.status }];
        trackRecentCompletionsResult(sourceStatus, 'principal-resolution', warnings);
        return envelope(sourceStatus, warnings, emptyReadModel(generatedAtUtc), generatedAtUtc);
      }

      const principal: AdobeSignResolvedPrincipal = resolution.principal;

      const token = await deps.tokenService.getAccessToken(
        principal.actor.actorKey,
        now,
        context.diagnostics,
      );
      if (token.status === 'authorization-required') {
        const result = envelope(
          'authorization-required',
          [{ code: 'authorization-required' }],
          emptyReadModel(generatedAtUtc),
          generatedAtUtc,
        );
        trackRecentCompletionsResult(result.sourceStatus, 'token-acquisition', result.warnings);
        return result;
      }
      if (token.status === 'source-unavailable') {
        const result = envelope(
          'source-unavailable',
          [{ code: 'source-unavailable' }],
          emptyReadModel(generatedAtUtc),
          generatedAtUtc,
        );
        trackRecentCompletionsResult(result.sourceStatus, 'token-acquisition', result.warnings);
        return result;
      }

      const request = buildAdobeSignRecentCompletionsRequest({
        pageSize: query.pageSize,
        cursor: query.cursor,
        now,
      });

      const searchResult = await deps.searchClient.search({
        actorKey: principal.actor.actorKey,
        accessToken: token.accessToken,
        apiAccessPoint: token.apiAccessPoint,
        request,
      });

      if (searchResult.status === 'unauthorized') {
        context.diagnostics?.trackAdobeSignRuntimeEvent('adobeSign.read.search.result', {
          status: 'unauthorized',
        });
        const result = envelope(
          'authorization-required',
          [{ code: 'authorization-required' }],
          {
            ...emptyReadModel(generatedAtUtc),
            pagination: { pageSize: request.pageSize, hasMore: false },
          },
          generatedAtUtc,
        );
        trackRecentCompletionsResult(result.sourceStatus, 'search', result.warnings);
        return result;
      }
      if (searchResult.status === 'unreachable') {
        context.diagnostics?.trackAdobeSignRuntimeEvent('adobeSign.read.search.result', {
          status: 'unreachable',
          reason: searchResult.reason,
          ...(searchResult.providerStatusCode !== undefined
            ? { providerStatusCode: searchResult.providerStatusCode }
            : {}),
          ...(searchResult.providerErrorCode
            ? { providerErrorCode: searchResult.providerErrorCode }
            : {}),
          ...(searchResult.providerResponseHasErrorField !== undefined
            ? {
                searchProviderResponseHasErrorField: searchResult.providerResponseHasErrorField,
              }
            : {}),
          ...(searchResult.providerResponseHasCodeField !== undefined
            ? {
                searchProviderResponseHasCodeField: searchResult.providerResponseHasCodeField,
              }
            : {}),
          ...(searchResult.searchRequestDiagnostics
            ? {
                searchQueryIntent: searchResult.searchRequestDiagnostics.queryIntent,
                searchEndpointHost: searchResult.searchRequestDiagnostics.endpointHost,
                searchEndpointPath: searchResult.searchRequestDiagnostics.endpointPath,
                searchMethod: searchResult.searchRequestDiagnostics.method,
                searchBodyTopLevelKeyCount:
                  searchResult.searchRequestDiagnostics.bodyTopLevelKeyCount,
                searchHasScopeField: searchResult.searchRequestDiagnostics.hasScopeField,
                searchScopeAgreementAssetsCount:
                  searchResult.searchRequestDiagnostics.scopeAgreementAssetsCount,
                searchHasAgreementAssetsCriteriaField:
                  searchResult.searchRequestDiagnostics.hasAgreementAssetsCriteriaField,
                searchAgreementAssetsCriteriaHasPageSizeField:
                  searchResult.searchRequestDiagnostics.agreementAssetsCriteriaHasPageSizeField,
                searchAgreementAssetsCriteriaHasStartIndexField:
                  searchResult.searchRequestDiagnostics.agreementAssetsCriteriaHasStartIndexField,
                searchAgreementAssetsCriteriaHasStatusField:
                  searchResult.searchRequestDiagnostics.agreementAssetsCriteriaHasStatusField,
                searchAgreementAssetsCriteriaHasRoleField:
                  searchResult.searchRequestDiagnostics.agreementAssetsCriteriaHasRoleField,
                searchAgreementAssetsCriteriaHasTypeField:
                  searchResult.searchRequestDiagnostics.agreementAssetsCriteriaHasTypeField,
                searchHasMatchingFiltersInfoField:
                  searchResult.searchRequestDiagnostics.hasMatchingFiltersInfoField,
                searchHasAgreementOriginInfoField:
                  searchResult.searchRequestDiagnostics.hasAgreementOriginInfoField,
                searchHasRecipientStatusFilterField:
                  searchResult.searchRequestDiagnostics.hasRecipientStatusFilterField,
                searchHasPageSizeField: searchResult.searchRequestDiagnostics.hasPageSizeField,
                searchHasCursorField: searchResult.searchRequestDiagnostics.hasCursorField,
                searchApprovedStatusCount:
                  searchResult.searchRequestDiagnostics.approvedStatusCount,
                searchAgreementAssetsCriteriaAgreementTypeCount:
                  searchResult.searchRequestDiagnostics.agreementAssetsCriteriaAgreementTypeCount,
                searchAgreementAssetsCriteriaSignedStatusCount:
                  searchResult.searchRequestDiagnostics.agreementAssetsCriteriaSignedStatusCount,
                searchAgreementAssetsCriteriaHasModifiedDateField:
                  searchResult.searchRequestDiagnostics.agreementAssetsCriteriaHasModifiedDateField,
                searchAgreementAssetsCriteriaModifiedDateHasRangeField:
                  searchResult.searchRequestDiagnostics
                    .agreementAssetsCriteriaModifiedDateHasRangeField,
                searchAgreementAssetsCriteriaModifiedDateRangeHasLowerBoundField:
                  searchResult.searchRequestDiagnostics
                    .agreementAssetsCriteriaModifiedDateRangeHasLowerBoundField,
                searchAgreementAssetsCriteriaModifiedDateRangeHasUpperBoundField:
                  searchResult.searchRequestDiagnostics
                    .agreementAssetsCriteriaModifiedDateRangeHasUpperBoundField,
                searchAgreementAssetsCriteriaHasSortByField:
                  searchResult.searchRequestDiagnostics.agreementAssetsCriteriaHasSortByField,
                searchAgreementAssetsCriteriaHasSortOrderField:
                  searchResult.searchRequestDiagnostics.agreementAssetsCriteriaHasSortOrderField,
              }
            : {}),
        });
        const result = envelope(
          'source-unavailable',
          [{ code: 'source-unavailable' }],
          {
            ...emptyReadModel(generatedAtUtc),
            pagination: { pageSize: request.pageSize, hasMore: false },
          },
          generatedAtUtc,
        );
        trackRecentCompletionsResult(result.sourceStatus, 'search', result.warnings);
        return result;
      }

      context.diagnostics?.trackAdobeSignRuntimeEvent('adobeSign.read.search.result', {
        status: 'ok',
        itemCount: searchResult.items.length,
        hasMore: searchResult.nextCursor !== undefined,
      });

      const items: MyWorkAdobeSignRecentCompletionsItem[] = [];
      let droppedCount = 0;
      let anyCandidateOmitted = false;
      const rejectedReasons = new Set<string>();
      for (const row of searchResult.items) {
        if (row.intent !== 'recent-completions') {
          droppedCount++;
          continue;
        }

        const policyDecision = evaluateAdobeSignSourceHandoff(
          row.sourceOpenUrlCandidate,
          deps.urlPolicyConfig,
        );
        if (policyDecision.status === 'omitted') {
          anyCandidateOmitted = true;
        } else if (policyDecision.status === 'rejected') {
          rejectedReasons.add(policyDecision.reason);
        }

        const item: MyWorkAdobeSignRecentCompletionsItem = {
          itemId: buildItemId(row.agreementId),
          sourceSystem: 'adobe-sign',
          agreementId: row.agreementId,
          agreementName: row.agreementName,
          agreementStatus: 'COMPLETED',
          ...(row.senderDisplayName !== undefined || row.senderEmail !== undefined
            ? {
                sender: {
                  ...(row.senderDisplayName !== undefined
                    ? { displayName: row.senderDisplayName }
                    : {}),
                  ...(row.senderEmail !== undefined ? { emailAddress: row.senderEmail } : {}),
                },
              }
            : {}),
          ...(row.createdAtUtc !== undefined ? { completedAtUtc: row.createdAtUtc } : {}),
          ...(row.modifiedAtUtc !== undefined ? { modifiedAtUtc: row.modifiedAtUtc } : {}),
          ...(policyDecision.status === 'allowed'
            ? { sourceOpenUrl: policyDecision.sourceOpenUrl }
            : {}),
        };
        items.push(item);
      }

      const pagination: MyWorkAdobeSignRecentCompletionsPagination = {
        pageSize: request.pageSize,
        hasMore: searchResult.nextCursor !== undefined,
        ...(searchResult.nextCursor !== undefined ? { nextCursor: searchResult.nextCursor } : {}),
      };

      const summary: MyWorkAdobeSignRecentCompletionsSummary = {
        countBasis: 'returned-items',
        completedAgreementCount: items.length,
        windowDays: ADOBE_SIGN_RECENT_COMPLETIONS_WINDOW_DAYS,
      };

      const warnings: MyWorkReadModelWarning[] = [];
      let status: MyWorkReadModelSourceStatus = 'available';
      if (droppedCount > 0) {
        status = 'partial';
        warnings.push({ code: 'partial-source-data' });
      }
      if (anyCandidateOmitted) {
        warnings.push({ code: 'source-open-url-omitted' });
      }
      if (rejectedReasons.size > 0) {
        const reasonSummary = [...rejectedReasons].sort().join(',');
        warnings.push({ code: 'source-open-url-policy-rejected', message: reasonSummary });
      }

      const readModel: MyWorkAdobeSignRecentCompletionsReadModel = {
        moduleId: 'adobe-sign-recent-completions',
        summary,
        items,
        pagination,
        freshness: { state: 'fresh', generatedAtUtc },
      };

      const result = envelope(status, warnings, readModel, generatedAtUtc);
      trackRecentCompletionsResult(result.sourceStatus, 'mapped-results', result.warnings, {
        itemCount: items.length,
        hasMore: pagination.hasMore,
      });
      return result;
    },
  };
}
