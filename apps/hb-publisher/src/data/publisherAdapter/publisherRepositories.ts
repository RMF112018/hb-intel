/**
 * Typed repository interfaces + SharePoint-backed read implementation for
 * the Article Publisher.
 *
 * The master-record layer (`HB Articles`) is keyed by tenant `ArticleId`
 * and maps through `mapArticleRow`. Every child list filters and writes
 * against the tenant `ArticleId` foreign-key column, matching the
 * `HB Article*` schema on HBCentral. TemplateRegistry is a sibling
 * reference table (keyed by `TemplateKey`).
 */

import type {
  PublisherArticleRow,
  PublisherMediaRow,
  PublisherPageBindingRow,
  PublisherPromotionRuleRow,
  PublisherPublishingErrorRow,
  PublisherTeamMemberRow,
  PublisherTemplateRegistryRow,
  PublisherWorkflowHistoryRow,
} from './publisherContracts';
import type { Destination } from './publisherEnums';
import type { PublisherListDescriptor } from './publisherListDescriptors';
import { PUBLISHER_LISTS } from './publisherListDescriptors';
import {
  createReadDiagnosticsSink,
  describeArticleRowRejection,
  describeMediaRowRejection,
  describePageBindingRowRejection,
  describePromotionRuleRowRejection,
  describePublishingErrorRowRejection,
  describeTeamMemberRowRejection,
  describeTemplateRegistryRowRejection,
  describeWorkflowHistoryRowRejection,
  mapArticleRow,
  mapMediaRow,
  mapPageBindingRow,
  mapPromotionRuleRow,
  mapPublishingErrorRow,
  mapTeamMemberRow,
  mapTemplateRegistryRow,
  mapWorkflowHistoryRow,
  probeReadIdentity,
  type PublisherReadList,
  type ReadDiagnosticsSink,
} from './publisherRowMappers';
export type {
  ReadRejection,
  ReadDiagnosticsSink,
  PublisherReadList,
} from './publisherRowMappers';
import {
  createSharePointPageBindingWriter,
  type PageBindingWriter,
} from './pageBindingWriter';
import {
  createSharePointArticleWriter,
  createSharePointMediaWriter,
  createSharePointPublishingErrorsWriter,
  createSharePointTeamMembersWriter,
  createSharePointWorkflowHistoryWriter,
  type ArticleWriter,
  type MediaWriter,
  type PublishingErrorsWriter,
  type TeamMembersWriter,
  type WorkflowHistoryWriter,
} from './publisherWriters';

export class PublisherWriteNotImplementedError extends Error {
  constructor(operation: string, wave: string) {
    super(
      `Publisher write '${operation}' is not implemented yet; scheduled for ${wave}.`,
    );
    this.name = 'PublisherWriteNotImplementedError';
  }
}

/* ── Access seam ─────────────────────────────────────────────────── */

export interface PublisherListAccess {
  readList(
    descriptor: PublisherListDescriptor,
    options?: PublisherListQueryOptions,
  ): Promise<readonly Record<string, unknown>[]>;
}

export interface PublisherListQueryOptions {
  readonly select?: readonly string[];
  readonly filter?: string;
  readonly top?: number;
  readonly orderBy?: string;
  /**
   * Navigation properties to `$expand`. Required for SharePoint User
   * fields (e.g. `PersonPrincipal`) so the response carries the
   * `{ EMail, Title, Id }` payload instead of only the flattened
   * lookup id column.
   */
  readonly expand?: readonly string[];
}

export function createSharePointPublisherListAccess(): PublisherListAccess {
  return {
    async readList(descriptor, options) {
      const select = options?.select?.length
        ? `$select=${options.select.join(',')}`
        : '';
      const filter = options?.filter
        ? `$filter=${encodeURIComponent(options.filter)}`
        : '';
      const top =
        typeof options?.top === 'number' ? `$top=${options.top}` : '';
      const orderBy = options?.orderBy
        ? `$orderby=${encodeURIComponent(options.orderBy)}`
        : '';
      const expand = options?.expand?.length
        ? `$expand=${options.expand.join(',')}`
        : '';
      const qs = [select, filter, top, orderBy, expand].filter(Boolean).join('&');
      const url =
        `${descriptor.hostSiteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(descriptor.displayName)}')/items` +
        (qs.length > 0 ? `?${qs}` : '');
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json;odata=nometadata' },
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(
          `Publisher list read failed: ${descriptor.displayName} → ${res.status} ${res.statusText}`,
        );
      }
      const body = (await res.json()) as { value?: Record<string, unknown>[] };
      return Array.isArray(body.value) ? body.value : [];
    },
  };
}

/* ── Repository interfaces ───────────────────────────────────────── */

export interface ArticleRepository {
  getByArticleId(articleId: string): Promise<PublisherArticleRow | undefined>;
  listByWorkflowState(
    state: PublisherArticleRow['WorkflowState'],
    scope?: ArticleListScope,
  ): Promise<readonly PublisherArticleRow[]>;
  upsert(
    row: PublisherArticleRow,
  ): Promise<{ readonly wasCreated: boolean; readonly itemId: number }>;
}

export interface ArticleListScope {
  readonly destinations?: readonly Destination[];
}

export interface TeamMembersRepository {
  listByArticle(articleId: string): Promise<readonly PublisherTeamMemberRow[]>;
  replaceAllForArticle(
    articleId: string,
    rows: readonly PublisherTeamMemberRow[],
  ): Promise<{ readonly deleted: number; readonly written: number }>;
}

export interface MediaRepository {
  listByArticle(articleId: string): Promise<readonly PublisherMediaRow[]>;
  replaceAllForArticle(
    articleId: string,
    rows: readonly PublisherMediaRow[],
  ): Promise<{ readonly deleted: number; readonly written: number }>;
}

export interface TemplateRegistryRepository {
  listActive(): Promise<readonly PublisherTemplateRegistryRow[]>;
  getByKey(
    templateKey: string,
  ): Promise<PublisherTemplateRegistryRow | undefined>;
}

export interface PageBindingRepository {
  getByArticleId(articleId: string): Promise<PublisherPageBindingRow | undefined>;
  /**
   * Idempotently upserts a tenant `HB Article Destination Pages` row
   * keyed by `ArticleId`. Delegates to the injected `PageBindingWriter`.
   */
  upsert(row: PublisherPageBindingRow): Promise<{
    readonly bindingId: string;
    readonly wasCreated: boolean;
    readonly itemId: number;
  }>;
}

export interface WorkflowHistoryRepository {
  listByArticle(articleId: string): Promise<readonly PublisherWorkflowHistoryRow[]>;
  append(row: PublisherWorkflowHistoryRow): Promise<{ readonly itemId: number }>;
}

/**
 * Read-only repository for tenant `HB Article Promotion Rules`.
 *
 * Returns active rules only (`IsActive eq 1`); applied at the
 * authoring surface to seed promotion defaults (FeaturedDefault,
 * PinnedDefault) on new articles and to gate manual override of
 * IsFeatured / IsPinned when ManualOverrideAllowed=false.
 */
export interface PromotionRulesRepository {
  listActive(): Promise<readonly PublisherPromotionRuleRow[]>;
}

export interface PublishingErrorsRepository {
  listByArticle(articleId: string): Promise<readonly PublisherPublishingErrorRow[]>;
  /**
   * Appends a tenant `HB Article Publishing Errors` row. Delegates to
   * the injected `PublishingErrorsWriter`.
   */
  append(row: PublisherPublishingErrorRow): Promise<{ readonly itemId: number }>;
}

/**
 * Structured read-diagnostics surface shared across every repository
 * read path. Wave-03 Prompt-03 closure: malformed SharePoint rows are
 * no longer silently dropped by the `mapAll`-style helpers — each
 * rejection is pushed here with its list of origin, a probed
 * identifier, and a deterministic reason. Callers can `drain()` after
 * each load cycle to surface rejections as operator-facing status and
 * distinguish "no rows existed" from "rows existed but were rejected".
 */
export interface PublisherRepositories {
  readonly articles: ArticleRepository;
  readonly teamMembers: TeamMembersRepository;
  readonly media: MediaRepository;
  readonly templateRegistry: TemplateRegistryRepository;
  readonly pageBindings: PageBindingRepository;
  readonly workflowHistory: WorkflowHistoryRepository;
  readonly publishingErrors: PublishingErrorsRepository;
  readonly promotionRules: PromotionRulesRepository;
  readonly readDiagnostics: ReadDiagnosticsSink;
}

/* ── Factory ─────────────────────────────────────────────────────── */

export interface PublisherRepositoryWriters {
  readonly articles: ArticleWriter;
  readonly teamMembers: TeamMembersWriter;
  readonly media: MediaWriter;
  readonly pageBindings: PageBindingWriter;
  readonly workflowHistory: WorkflowHistoryWriter;
  readonly publishingErrors: PublishingErrorsWriter;
}

export function createPublisherRepositories(
  access: PublisherListAccess = createSharePointPublisherListAccess(),
  lists: typeof PUBLISHER_LISTS = PUBLISHER_LISTS,
  writers: PublisherRepositoryWriters = {
    articles: createSharePointArticleWriter({ descriptor: lists.articles }),
    teamMembers: createSharePointTeamMembersWriter({ descriptor: lists.teamMembers }),
    media: createSharePointMediaWriter({ descriptor: lists.media }),
    pageBindings: createSharePointPageBindingWriter({ descriptor: lists.pageBindings }),
    workflowHistory: createSharePointWorkflowHistoryWriter({ descriptor: lists.workflowHistory }),
    publishingErrors: createSharePointPublishingErrorsWriter({ descriptor: lists.publishingErrors }),
  },
  readDiagnostics: ReadDiagnosticsSink = createReadDiagnosticsSink(),
): PublisherRepositories {
  // Wave-03 Prompt-03: `mapAll` now pushes a structured rejection
  // entry into the diagnostics sink for every row the mapper
  // refuses. The surviving rows are returned unchanged so callers
  // that do not care about rejections (writers, straightforward
  // projections) keep working; callers that need to distinguish
  // "no rows existed" from "rows existed but were rejected" drain
  // the sink after the load cycle.
  function mapAll<R>(
    list: PublisherReadList,
    rows: readonly Record<string, unknown>[],
    mapper: (raw: Record<string, unknown>) => R | undefined,
    describe: (raw: Record<string, unknown>) => string,
  ): readonly R[] {
    const out: R[] = [];
    for (const raw of rows) {
      const mapped = mapper(raw);
      if (mapped) {
        out.push(mapped);
        continue;
      }
      const identity = probeReadIdentity(raw);
      readDiagnostics.push({
        list,
        reason: describe(raw),
        rawItemId: identity.rawItemId,
        articleId: identity.articleId,
      });
    }
    return out;
  }

  return {
    readDiagnostics,
    articles: {
      async getByArticleId(articleId) {
        // Wave-03 Prompt-04: request up to 2 rows so duplicate
        // ArticleId values in the master list are detected rather
        // than silently collapsing to whichever row SharePoint
        // happened to return first.
        const rows = await access.readList(lists.articles, {
          filter: `ArticleId eq '${articleId.replace(/'/g, "''")}'`,
          top: 2,
        });
        if (rows.length > 1) {
          const ids = rows
            .map((r) => probeReadIdentity(r).rawItemId)
            .filter((id): id is number => typeof id === 'number');
          readDiagnostics.push({
            list: 'articles',
            reason:
              `Duplicate master rows for ArticleId='${articleId}' ` +
              `(${rows.length} matches${ids.length > 0 ? `, item ids ${ids.join(', ')}` : ''}). ` +
              'Refusing to pick one — repair the list before continuing.',
            articleId,
          });
          return undefined;
        }
        // Primary-identity read: if SharePoint returned rows but none
        // mapped, emit a diagnostic so callers can distinguish a
        // genuine "no such article" from a "malformed article row".
        for (const raw of rows) {
          const mapped = mapArticleRow(raw);
          if (mapped) return mapped;
          const identity = probeReadIdentity(raw);
          readDiagnostics.push({
            list: 'articles',
            reason: describeArticleRowRejection(raw),
            rawItemId: identity.rawItemId,
            articleId: identity.articleId ?? articleId,
          });
        }
        return undefined;
      },
      async listByWorkflowState(state, scope) {
        const destinationFilter =
          scope?.destinations && scope.destinations.length > 0
            ? ` and (${scope.destinations
                .map((destination) => `Destination eq '${destination.replace(/'/g, "''")}'`)
                .join(' or ')})`
            : '';
        const rows = await access.readList(lists.articles, {
          filter: `WorkflowState eq '${state}'${destinationFilter}`,
          orderBy: 'UpdatedDateUtc desc',
        });
        return mapAll('articles', rows, mapArticleRow, describeArticleRowRejection);
      },
      async upsert(row) {
        return writers.articles.upsert(row);
      },
    },

    teamMembers: {
      async listByArticle(articleId) {
        // `PersonPrincipal` is a SharePoint User field. This read is
        // the single producer of team-member rows in the app; it
        // MUST `$expand=PersonPrincipal` + `$select` the expanded
        // sub-properties, because `mapTeamMemberRow` requires the
        // expanded `{ EMail, Title, Id }` shape and rejects any row
        // that arrives with a flat or missing principal (P0-1 +
        // P2-4). Dropping `$expand` here would not "degrade
        // gracefully" — rows would be dropped by the mapper and
        // the edit/preview flow would silently lose the team
        // member.
        const rows = await access.readList(lists.teamMembers, {
          filter: `ArticleId eq '${articleId.replace(/'/g, "''")}'`,
          orderBy: 'SortOrder asc',
          select: [
            'Id',
            'ArticleId',
            'TeamMemberId',
            'Title',
            'DisplayName',
            'Role',
            'Company',
            'Department',
            'GroupKey',
            'ParentMemberId',
            'IsFeaturedMember',
            'SortOrder',
            'BioSnippet',
            'ContactLink',
            'PersonPrincipalId',
            'PersonPrincipal/EMail',
            'PersonPrincipal/Title',
            'PersonPrincipal/Id',
          ],
          expand: ['PersonPrincipal'],
        });
        return mapAll('teamMembers', rows, mapTeamMemberRow, describeTeamMemberRowRejection);
      },
      async replaceAllForArticle(articleId, rows) {
        return writers.teamMembers.replaceAllForArticle(articleId, rows);
      },
    },

    media: {
      async listByArticle(articleId) {
        const rows = await access.readList(lists.media, {
          filter: `ArticleId eq '${articleId.replace(/'/g, "''")}'`,
          orderBy: 'SortOrder asc',
        });
        return mapAll('media', rows, mapMediaRow, describeMediaRowRejection);
      },
      async replaceAllForArticle(articleId, rows) {
        return writers.media.replaceAllForArticle(articleId, rows);
      },
    },

    templateRegistry: {
      async listActive() {
        const rows = await access.readList(lists.templateRegistry, {
          filter: 'IsActive eq 1',
        });
        return mapAll(
          'templateRegistry',
          rows,
          mapTemplateRegistryRow,
          describeTemplateRegistryRowRejection,
        );
      },
      async getByKey(templateKey) {
        // Wave-03 Prompt-04: detect duplicate TemplateKey rows rather
        // than silently binding to the first match. Active templates
        // are control-plane authority — a duplicate must be repaired,
        // not hidden.
        const rows = await access.readList(lists.templateRegistry, {
          filter: `TemplateKey eq '${templateKey.replace(/'/g, "''")}'`,
          top: 2,
        });
        if (rows.length > 1) {
          const ids = rows
            .map((r) => probeReadIdentity(r).rawItemId)
            .filter((id): id is number => typeof id === 'number');
          readDiagnostics.push({
            list: 'templateRegistry',
            reason:
              `Duplicate template registry rows for TemplateKey='${templateKey}' ` +
              `(${rows.length} matches${ids.length > 0 ? `, item ids ${ids.join(', ')}` : ''}). ` +
              'Refusing to pick one — repair the list before continuing.',
          });
          return undefined;
        }
        for (const raw of rows) {
          const mapped = mapTemplateRegistryRow(raw);
          if (mapped) return mapped;
          const identity = probeReadIdentity(raw);
          readDiagnostics.push({
            list: 'templateRegistry',
            reason: describeTemplateRegistryRowRejection(raw),
            rawItemId: identity.rawItemId,
          });
        }
        return undefined;
      },
    },

    pageBindings: {
      async getByArticleId(articleId) {
        // Wave-03 Prompt-04: the binding list is modelled as
        // one-row-per-ArticleId. Detect duplicates instead of picking
        // the first match — a duplicate is a control-plane defect that
        // must surface to the operator rather than silently publishing
        // against an arbitrary row.
        const rows = await access.readList(lists.pageBindings, {
          filter: `ArticleId eq '${articleId.replace(/'/g, "''")}'`,
          top: 2,
        });
        if (rows.length > 1) {
          const ids = rows
            .map((r) => probeReadIdentity(r).rawItemId)
            .filter((id): id is number => typeof id === 'number');
          readDiagnostics.push({
            list: 'pageBindings',
            reason:
              `Duplicate binding rows for ArticleId='${articleId}' ` +
              `(${rows.length} matches${ids.length > 0 ? `, item ids ${ids.join(', ')}` : ''}). ` +
              'Refusing to pick one — repair the list before republishing.',
            articleId,
          });
          return undefined;
        }
        // Primary-identity read: if a binding exists but does not map,
        // emit a diagnostic so the control-plane defect is not hidden
        // behind a silent "no binding" result.
        for (const raw of rows) {
          const mapped = mapPageBindingRow(raw);
          if (mapped) return mapped;
          const identity = probeReadIdentity(raw);
          readDiagnostics.push({
            list: 'pageBindings',
            reason: describePageBindingRowRejection(raw),
            rawItemId: identity.rawItemId,
            articleId: identity.articleId ?? articleId,
          });
        }
        return undefined;
      },
      async upsert(row) {
        const outcome = await writers.pageBindings.upsert({ row });
        if (!outcome.ok) {
          throw new Error(
            `pageBindings.upsert failed (${outcome.reason}): ${outcome.message}`,
          );
        }
        return {
          bindingId: outcome.bindingId,
          wasCreated: outcome.wasCreated,
          itemId: outcome.itemId,
        };
      },
    },

    workflowHistory: {
      async listByArticle(articleId) {
        const rows = await access.readList(lists.workflowHistory, {
          filter: `ArticleId eq '${articleId.replace(/'/g, "''")}'`,
          orderBy: 'ActionDateUtc desc',
        });
        return mapAll(
          'workflowHistory',
          rows,
          mapWorkflowHistoryRow,
          describeWorkflowHistoryRowRejection,
        );
      },
      async append(row) {
        return writers.workflowHistory.append(row);
      },
    },

    publishingErrors: {
      async listByArticle(articleId) {
        const rows = await access.readList(lists.publishingErrors, {
          filter: `ArticleId eq '${articleId.replace(/'/g, "''")}'`,
          orderBy: 'LastAttemptDateUtc desc',
        });
        return mapAll(
          'publishingErrors',
          rows,
          mapPublishingErrorRow,
          describePublishingErrorRowRejection,
        );
      },
      async append(row) {
        return writers.publishingErrors.append(row);
      },
    },

    promotionRules: {
      async listActive() {
        const rows = await access.readList(lists.promotionRules, {
          filter: 'IsActive eq 1',
        });
        return mapAll(
          'promotionRules',
          rows,
          mapPromotionRuleRow,
          describePromotionRuleRowRejection,
        );
      },
    },
  };
}
