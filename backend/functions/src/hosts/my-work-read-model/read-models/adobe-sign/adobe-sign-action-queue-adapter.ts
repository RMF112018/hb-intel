/**
 * Adobe Sign action-queue adapter — B05 Prompt 05.
 *
 * Composes principal resolution, the access-token service, and the search
 * client into a single `IMyWorkReadModelProvider.getAdobeSignActionQueue`-
 * shaped seam. Produces a sealed `MyWorkReadModelEnvelope<...>` from the
 * already-defined B04 DTOs and translates every upstream failure mode
 * into the My Work read-model source-status vocabulary.
 *
 * Boundary guarantees:
 *
 *   - No raw Adobe response bodies, vendor error strings, or HTTP detail
 *     leak through the envelope. The search-client seam already enforces
 *     this; the adapter only consumes its closed-enum result.
 *   - Recipient statuses outside the six MVP user-action union are
 *     filtered (never emitted as queue rows) and trip a `'partial'`
 *     envelope status with an `'unsupported-source-status-filtered'`
 *     warning so SPFx surfaces can render a degradation hint without
 *     learning which statuses appeared.
 *   - Exactly one search-client call per `getActionQueue` invocation —
 *     no per-item detail fan-out. The opaque `cursor` and `nextCursor`
 *     are forwarded verbatim, preserving cursor opacity end-to-end.
 *   - Each retained row's optional `sourceOpenUrlCandidate` is evaluated
 *     against the canonical HB/PCC URL-policy doctrine
 *     (`evaluateAdobeSignSourceHandoff`). `sourceOpenUrl` is set on the
 *     emitted item only when the policy allows the candidate. Missing
 *     candidates trip a single envelope-level `'source-open-url-omitted'`
 *     warning; rejected candidates trip a single envelope-level
 *     `'source-open-url-policy-rejected'` warning whose `message`
 *     carries the sorted, comma-separated set of `UrlPolicyReasonCode`
 *     values observed.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-queue-adapter
 */

import {
  ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES,
  ADOBE_SIGN_STATUS_TO_REQUIRED_ACTION,
  type AdobeSignActionableRecipientStatus,
  type MyWorkAdobeSignActionQueueItem,
  type MyWorkAdobeSignActionQueuePagination,
  type MyWorkAdobeSignActionQueueQuery,
  type MyWorkAdobeSignActionQueueReadModel,
  type MyWorkAdobeSignActionQueueSummary,
  type MyWorkReadModelEnvelope,
  type MyWorkReadModelSourceStatus,
  type MyWorkReadModelWarning,
} from '@hbc/models/myWork';

import type { MyWorkReadContext } from '../my-work-read-model-provider.js';

import type {
  AdobeSignPrincipalResolutionResult,
  AdobeSignResolvedPrincipal,
} from './adobe-sign-principal-resolution.js';
import { toMyWorkSourceStatus } from './adobe-sign-principal-resolution.js';
import type { IAdobeSignTokenService } from './adobe-sign-token-service.js';
import type { IAdobeSignSearchClient } from './adobe-sign-search-client.js';
import { buildAdobeSignSearchRequest } from './adobe-sign-search-request.js';
import {
  evaluateAdobeSignSourceHandoff,
  type AdobeSignSourceHandoffPolicyConfig,
} from './adobe-sign-source-handoff-policy.js';
import type { AdobeSignActionQueueResultStage } from './adobe-sign-runtime-diagnostics.js';

/** Items whose `expirationAtUtc` is within this window are counted as "expiring soon". */
export const ADOBE_SIGN_EXPIRING_SOON_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

const ACTIONABLE_STATUS_SET: ReadonlySet<string> = new Set(
  ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES,
);

export interface IAdobeSignActionQueueAdapter {
  getActionQueue(
    context: MyWorkReadContext,
    query: MyWorkAdobeSignActionQueueQuery,
  ): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>>;
}

export type AdobeSignPrincipalResolver = (
  context: MyWorkReadContext,
) => Promise<AdobeSignPrincipalResolutionResult>;

export interface AdobeSignActionQueueAdapterDeps {
  readonly resolvePrincipal: AdobeSignPrincipalResolver;
  readonly tokenService: IAdobeSignTokenService;
  readonly searchClient: IAdobeSignSearchClient;
  readonly now: () => Date;
  /**
   * Optional URL-policy configuration for row-level handoff. When omitted,
   * any candidate URL that passes the canonical scheme / host / query
   * checks is allowed; when present, the host must match the configured
   * approved-domain rules.
   */
  readonly urlPolicyConfig?: AdobeSignSourceHandoffPolicyConfig;
}

function emptySummary(): MyWorkAdobeSignActionQueueSummary {
  return {
    countBasis: 'returned-items',
    totalActionItemCount: 0,
    signatureCount: 0,
    approvalCount: 0,
    acceptanceCount: 0,
    acknowledgementCount: 0,
    formFillingCount: 0,
    delegationCount: 0,
    expiringSoonCount: 0,
  };
}

function emptyReadModel(generatedAtUtc: string): MyWorkAdobeSignActionQueueReadModel {
  return {
    moduleId: 'adobe-sign-action-queue',
    summary: emptySummary(),
    items: [],
    pagination: { pageSize: 0, hasMore: false },
    freshness: { state: 'unknown', generatedAtUtc },
  };
}

function envelope(
  sourceStatus: MyWorkReadModelSourceStatus,
  warnings: readonly MyWorkReadModelWarning[],
  data: MyWorkAdobeSignActionQueueReadModel,
  generatedAtUtc: string,
): MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel> {
  return {
    mode: 'backend',
    sourceStatus,
    readOnly: true,
    warnings,
    generatedAtUtc,
    data,
  };
}

function isActionableStatus(candidate: string): candidate is AdobeSignActionableRecipientStatus {
  return ACTIONABLE_STATUS_SET.has(candidate);
}

function buildItemId(agreementId: string): string {
  return `adobe-sign:agreement-${agreementId}`;
}

function isExpiringSoon(expirationAtUtc: string | undefined, nowMs: number): boolean {
  if (!expirationAtUtc) return false;
  const expiresMs = Date.parse(expirationAtUtc);
  if (!Number.isFinite(expiresMs)) return false;
  const deltaMs = expiresMs - nowMs;
  return deltaMs >= 0 && deltaMs <= ADOBE_SIGN_EXPIRING_SOON_THRESHOLD_MS;
}

function summarize(
  items: readonly MyWorkAdobeSignActionQueueItem[],
  nowMs: number,
): MyWorkAdobeSignActionQueueSummary {
  const summary = emptySummary() as {
    -readonly [K in keyof MyWorkAdobeSignActionQueueSummary]: MyWorkAdobeSignActionQueueSummary[K];
  };
  summary.totalActionItemCount = items.length;
  for (const item of items) {
    switch (item.requiredAction) {
      case 'signature':
        summary.signatureCount++;
        break;
      case 'approval':
        summary.approvalCount++;
        break;
      case 'acceptance':
        summary.acceptanceCount++;
        break;
      case 'acknowledgement':
        summary.acknowledgementCount++;
        break;
      case 'form-filling':
        summary.formFillingCount++;
        break;
      case 'delegation':
        summary.delegationCount++;
        break;
    }
    if (isExpiringSoon(item.expirationAtUtc, nowMs)) {
      summary.expiringSoonCount++;
    }
  }
  return summary;
}

export function createAdobeSignActionQueueAdapter(
  deps: AdobeSignActionQueueAdapterDeps,
): IAdobeSignActionQueueAdapter {
  return {
    async getActionQueue(context, query) {
      const trackActionQueueResult = (
        sourceStatus: MyWorkReadModelSourceStatus,
        resultStage: AdobeSignActionQueueResultStage,
        warnings?: readonly MyWorkReadModelWarning[],
      ) => {
        context.diagnostics?.trackAdobeSignRuntimeEvent('adobeSign.read.actionQueue.result', {
          sourceStatus,
          resultStage,
          warningCodes: warnings?.map((w) => w.code),
        });
      };

      const now = deps.now();
      const generatedAtUtc = now.toISOString();

      // ---------------------------------------------------------------
      // 1. Principal resolution
      // ---------------------------------------------------------------
      const resolution = await deps.resolvePrincipal(context);
      if (resolution.status !== 'resolved') {
        // Non-resolved principal statuses are 1:1 with My Work warning codes by name.
        const sourceStatus = toMyWorkSourceStatus(resolution.status);
        const warnings: readonly MyWorkReadModelWarning[] = [{ code: resolution.status }];
        trackActionQueueResult(sourceStatus, 'principal-resolution', warnings);
        return envelope(sourceStatus, warnings, emptyReadModel(generatedAtUtc), generatedAtUtc);
      }

      const principal: AdobeSignResolvedPrincipal = resolution.principal;

      // ---------------------------------------------------------------
      // 2. Access-token acquisition
      // ---------------------------------------------------------------
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
        trackActionQueueResult(result.sourceStatus, 'token-acquisition', result.warnings);
        return result;
      }
      if (token.status === 'source-unavailable') {
        const result = envelope(
          'source-unavailable',
          [{ code: 'source-unavailable' }],
          emptyReadModel(generatedAtUtc),
          generatedAtUtc,
        );
        trackActionQueueResult(result.sourceStatus, 'token-acquisition', result.warnings);
        return result;
      }

      // ---------------------------------------------------------------
      // 3. Bounded search request
      // ---------------------------------------------------------------
      const request = buildAdobeSignSearchRequest({
        pageSize: query.pageSize,
        cursor: query.cursor,
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
        trackActionQueueResult(result.sourceStatus, 'search', result.warnings);
        return result;
      }
      if (searchResult.status === 'unreachable') {
        context.diagnostics?.trackAdobeSignRuntimeEvent('adobeSign.read.search.result', {
          status: 'unreachable',
          reason: searchResult.reason,
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
        trackActionQueueResult(result.sourceStatus, 'search', result.warnings);
        return result;
      }
      context.diagnostics?.trackAdobeSignRuntimeEvent('adobeSign.read.search.result', {
        status: 'ok',
        itemCount: searchResult.items.length,
        hasMore: searchResult.nextCursor !== undefined,
      });

      // ---------------------------------------------------------------
      // 4. Map provider results → B04 queue items
      // ---------------------------------------------------------------
      const items: MyWorkAdobeSignActionQueueItem[] = [];
      let droppedCount = 0;
      let anyCandidateOmitted = false;
      const rejectedReasons = new Set<string>();
      for (const row of searchResult.items) {
        if (!isActionableStatus(row.recipientStatus)) {
          droppedCount++;
          continue;
        }
        const requiredAction = ADOBE_SIGN_STATUS_TO_REQUIRED_ACTION[row.recipientStatus];

        const policyDecision = evaluateAdobeSignSourceHandoff(
          row.sourceOpenUrlCandidate,
          deps.urlPolicyConfig,
        );
        if (policyDecision.status === 'omitted') {
          anyCandidateOmitted = true;
        } else if (policyDecision.status === 'rejected') {
          rejectedReasons.add(policyDecision.reason);
        }

        const item: MyWorkAdobeSignActionQueueItem = {
          itemId: buildItemId(row.agreementId),
          sourceSystem: 'adobe-sign',
          agreementId: row.agreementId,
          agreementName: row.agreementName,
          requiredAction,
          adobeRecipientStatus: row.recipientStatus,
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
          ...(row.createdAtUtc !== undefined ? { createdAtUtc: row.createdAtUtc } : {}),
          ...(row.modifiedAtUtc !== undefined ? { modifiedAtUtc: row.modifiedAtUtc } : {}),
          ...(row.expirationAtUtc !== undefined ? { expirationAtUtc: row.expirationAtUtc } : {}),
          ...(policyDecision.status === 'allowed'
            ? { sourceOpenUrl: policyDecision.sourceOpenUrl }
            : {}),
        };
        items.push(item);
      }

      const pagination: MyWorkAdobeSignActionQueuePagination = {
        pageSize: request.pageSize,
        hasMore: searchResult.nextCursor !== undefined,
        ...(searchResult.nextCursor !== undefined ? { nextCursor: searchResult.nextCursor } : {}),
      };

      const summary = summarize(items, now.getTime());

      const warnings: MyWorkReadModelWarning[] = [];
      let status: MyWorkReadModelSourceStatus = 'available';
      if (droppedCount > 0) {
        status = 'partial';
        warnings.push({ code: 'partial-source-data' });
        warnings.push({ code: 'unsupported-source-status-filtered' });
      }
      if (anyCandidateOmitted) {
        warnings.push({ code: 'source-open-url-omitted' });
      }
      if (rejectedReasons.size > 0) {
        const reasonSummary = [...rejectedReasons].sort().join(',');
        warnings.push({ code: 'source-open-url-policy-rejected', message: reasonSummary });
      }

      const readModel: MyWorkAdobeSignActionQueueReadModel = {
        moduleId: 'adobe-sign-action-queue',
        summary,
        items,
        pagination,
        freshness: { state: 'fresh', generatedAtUtc },
      };

      const result = envelope(status, warnings, readModel, generatedAtUtc);
      trackActionQueueResult(result.sourceStatus, 'mapped-results', result.warnings);
      return result;
    },
  };
}
