/**
 * Typed repository interfaces + SharePoint-backed read implementation for
 * the Article Publisher.
 *
 * The master-record layer (`HB Articles`) is keyed by tenant `ArticleId`
 * and maps through `mapArticleRow`. Non-master child lists still use the
 * logical `PostId` filter column pending their own tenant-realignment
 * prompts; callers pass `article.ArticleId` in the `postId` parameter.
 */

import type {
  PublisherArticleRow,
  PublisherMediaRow,
  PublisherPageBindingRow,
  PublisherPublishingErrorRow,
  PublisherTeamMemberRow,
  PublisherTemplateRegistryRow,
  PublisherWorkflowHistoryRow,
} from './publisherContracts';
import type { PublisherListDescriptor } from './publisherListDescriptors';
import { PUBLISHER_LISTS } from './publisherListDescriptors';
import {
  mapArticleRow,
  mapMediaRow,
  mapPageBindingRow,
  mapPublishingErrorRow,
  mapTeamMemberRow,
  mapTemplateRegistryRow,
  mapWorkflowHistoryRow,
} from './publisherRowMappers';
import {
  createSharePointPageBindingWriter,
  type PageBindingWriter,
} from './pageBindingWriter';
import {
  createSharePointArticleWriter,
  createSharePointMediaWriter,
  createSharePointTeamMembersWriter,
  createSharePointWorkflowHistoryWriter,
  type ArticleWriter,
  type MediaWriter,
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
      const qs = [select, filter, top, orderBy].filter(Boolean).join('&');
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
  ): Promise<readonly PublisherArticleRow[]>;
  upsert(
    row: PublisherArticleRow,
  ): Promise<{ readonly wasCreated: boolean; readonly itemId: number }>;
}

export interface TeamMembersRepository {
  listByPost(postId: string): Promise<readonly PublisherTeamMemberRow[]>;
  replaceAllForPost(
    postId: string,
    rows: readonly PublisherTeamMemberRow[],
  ): Promise<{ readonly deleted: number; readonly written: number }>;
}

export interface MediaRepository {
  listByPost(postId: string): Promise<readonly PublisherMediaRow[]>;
  replaceAllForPost(
    postId: string,
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
  getByPostId(postId: string): Promise<PublisherPageBindingRow | undefined>;
  /**
   * Idempotently upserts a tenant `HB Article Destination Pages` row
   * keyed by the logical post/article id. Delegates to the injected
   * `PageBindingWriter`.
   */
  upsert(row: PublisherPageBindingRow): Promise<{
    readonly bindingId: string;
    readonly wasCreated: boolean;
    readonly itemId: number;
  }>;
}

export interface WorkflowHistoryRepository {
  listByPost(postId: string): Promise<readonly PublisherWorkflowHistoryRow[]>;
  append(row: PublisherWorkflowHistoryRow): Promise<{ readonly itemId: number }>;
}

export interface PublishingErrorsRepository {
  listByPost(postId: string): Promise<readonly PublisherPublishingErrorRow[]>;
  append(row: PublisherPublishingErrorRow): Promise<never>;
}

export interface PublisherRepositories {
  readonly articles: ArticleRepository;
  readonly teamMembers: TeamMembersRepository;
  readonly media: MediaRepository;
  readonly templateRegistry: TemplateRegistryRepository;
  readonly pageBindings: PageBindingRepository;
  readonly workflowHistory: WorkflowHistoryRepository;
  readonly publishingErrors: PublishingErrorsRepository;
}

/* ── Factory ─────────────────────────────────────────────────────── */

export interface PublisherRepositoryWriters {
  readonly articles: ArticleWriter;
  readonly teamMembers: TeamMembersWriter;
  readonly media: MediaWriter;
  readonly pageBindings: PageBindingWriter;
  readonly workflowHistory: WorkflowHistoryWriter;
}

export function createPublisherRepositories(
  access: PublisherListAccess = createSharePointPublisherListAccess(),
  lists: typeof PUBLISHER_LISTS = PUBLISHER_LISTS,
  writers: PublisherRepositoryWriters = {
    articles: createSharePointArticleWriter({ descriptor: lists.posts }),
    teamMembers: createSharePointTeamMembersWriter({ descriptor: lists.teamMembers }),
    media: createSharePointMediaWriter({ descriptor: lists.media }),
    pageBindings: createSharePointPageBindingWriter({ descriptor: lists.pageBindings }),
    workflowHistory: createSharePointWorkflowHistoryWriter({ descriptor: lists.workflowHistory }),
  },
): PublisherRepositories {
  function mapAll<R>(
    rows: readonly Record<string, unknown>[],
    mapper: (raw: Record<string, unknown>) => R | undefined,
  ): readonly R[] {
    const out: R[] = [];
    for (const raw of rows) {
      const mapped = mapper(raw);
      if (mapped) out.push(mapped);
    }
    return out;
  }

  return {
    articles: {
      async getByArticleId(articleId) {
        const rows = await access.readList(lists.posts, {
          filter: `ArticleId eq '${articleId.replace(/'/g, "''")}'`,
          top: 1,
        });
        for (const raw of rows) {
          const mapped = mapArticleRow(raw);
          if (mapped) return mapped;
        }
        return undefined;
      },
      async listByWorkflowState(state) {
        const rows = await access.readList(lists.posts, {
          filter: `WorkflowState eq '${state}'`,
          orderBy: 'UpdatedDateUtc desc',
        });
        return mapAll(rows, mapArticleRow);
      },
      async upsert(row) {
        return writers.articles.upsert(row);
      },
    },

    teamMembers: {
      async listByPost(postId) {
        const rows = await access.readList(lists.teamMembers, {
          filter: `PostId eq '${postId.replace(/'/g, "''")}'`,
          orderBy: 'SortOrder asc',
        });
        return mapAll(rows, mapTeamMemberRow);
      },
      async replaceAllForPost(postId, rows) {
        return writers.teamMembers.replaceAllForPost(postId, rows);
      },
    },

    media: {
      async listByPost(postId) {
        const rows = await access.readList(lists.media, {
          filter: `PostId eq '${postId.replace(/'/g, "''")}'`,
          orderBy: 'SortOrder asc',
        });
        return mapAll(rows, mapMediaRow);
      },
      async replaceAllForPost(postId, rows) {
        return writers.media.replaceAllForPost(postId, rows);
      },
    },

    templateRegistry: {
      async listActive() {
        const rows = await access.readList(lists.templateRegistry, {
          filter: "TemplateStatus eq 'active'",
        });
        return mapAll(rows, mapTemplateRegistryRow);
      },
      async getByKey(templateKey) {
        const rows = await access.readList(lists.templateRegistry, {
          filter: `TemplateKey eq '${templateKey.replace(/'/g, "''")}'`,
          top: 1,
        });
        for (const raw of rows) {
          const mapped = mapTemplateRegistryRow(raw);
          if (mapped) return mapped;
        }
        return undefined;
      },
    },

    pageBindings: {
      async getByPostId(postId) {
        const rows = await access.readList(lists.pageBindings, {
          filter: `PostId eq '${postId.replace(/'/g, "''")}'`,
          top: 1,
        });
        for (const raw of rows) {
          const mapped = mapPageBindingRow(raw);
          if (mapped) return mapped;
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
      async listByPost(postId) {
        const rows = await access.readList(lists.workflowHistory, {
          filter: `PostId eq '${postId.replace(/'/g, "''")}'`,
          orderBy: 'ActionDateUtc desc',
        });
        return mapAll(rows, mapWorkflowHistoryRow);
      },
      async append(row) {
        return writers.workflowHistory.append(row);
      },
    },

    publishingErrors: {
      async listByPost(postId) {
        const rows = await access.readList(lists.publishingErrors, {
          filter: `PostId eq '${postId.replace(/'/g, "''")}'`,
          orderBy: 'OccurredDateUtc desc',
        });
        return mapAll(rows, mapPublishingErrorRow);
      },
      async append() {
        throw new PublisherWriteNotImplementedError(
          'publishingErrors.append',
          'a later Phase-02 prompt',
        );
      },
    },
  };
}
