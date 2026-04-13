/**
 * Typed repository interfaces + SharePoint-backed read implementation for
 * the Project Spotlight publisher.
 *
 * Authority: docs/architecture/plans/MASTER/spfx/publisher/architecture/
 *
 * Scope (Prompt-03 / Wave 3):
 *   - read-oriented repository interfaces + concrete SharePoint-backed
 *     readers that use the HBCentral list-title binding pattern (matches
 *     apps/hb-webparts/src/homepage/data/heroBannerListSource.ts
 *     precedent). Prompt-02 established GUID-free list descriptors; when
 *     GUIDs become available, the access layer can be swapped without
 *     changing repository consumers.
 *   - Writers (create / update / delete) are intentionally not
 *     implemented here. Page-generation + binding writes are Wave 5
 *     scope; authoring-UI writes are Wave 6 scope. Each write method on
 *     the interfaces throws `PublisherWriteNotImplementedError` with a
 *     clear wave reference so callers surface the right follow-up.
 */

import type {
  PublisherMediaRow,
  PublisherPageBindingRow,
  PublisherPostRow,
  PublisherPublishingErrorRow,
  PublisherTeamMemberRow,
  PublisherTemplateRegistryRow,
  PublisherWorkflowHistoryRow,
} from './publisherContracts';
import type { PublisherListDescriptor } from './publisherListDescriptors';
import { PUBLISHER_LISTS } from './publisherListDescriptors';
import {
  mapMediaRow,
  mapPageBindingRow,
  mapPostRow,
  mapPublishingErrorRow,
  mapTeamMemberRow,
  mapTemplateRegistryRow,
  mapWorkflowHistoryRow,
} from './publisherRowMappers';

export class PublisherWriteNotImplementedError extends Error {
  constructor(operation: string, wave: string) {
    super(
      `Publisher write '${operation}' is not implemented in Prompt-03; scheduled for ${wave}.`,
    );
    this.name = 'PublisherWriteNotImplementedError';
  }
}

/* ── Access seam ─────────────────────────────────────────────────── */

/**
 * List-access function. Consumers can swap the default HBCentral
 * title-based fetcher for a GUID-based or mocked implementation.
 * The signature intentionally stays minimal: it takes a descriptor and
 * a SharePoint `$filter`/`$select`/`$top` spec, returns raw rows.
 */
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

export interface PostRepository {
  getByPostId(postId: string): Promise<PublisherPostRow | undefined>;
  listByWorkflowState(
    state: PublisherPostRow['WorkflowState'],
  ): Promise<readonly PublisherPostRow[]>;
  upsert(row: PublisherPostRow): Promise<never>;
}

export interface TeamMembersRepository {
  listByPost(postId: string): Promise<readonly PublisherTeamMemberRow[]>;
  replaceAllForPost(
    postId: string,
    rows: readonly PublisherTeamMemberRow[],
  ): Promise<never>;
}

export interface MediaRepository {
  listByPost(postId: string): Promise<readonly PublisherMediaRow[]>;
  replaceAllForPost(
    postId: string,
    rows: readonly PublisherMediaRow[],
  ): Promise<never>;
}

export interface TemplateRegistryRepository {
  listActive(): Promise<readonly PublisherTemplateRegistryRow[]>;
  getByKey(
    templateKey: string,
  ): Promise<PublisherTemplateRegistryRow | undefined>;
}

export interface PageBindingRepository {
  getByPostId(postId: string): Promise<PublisherPageBindingRow | undefined>;
  upsert(row: PublisherPageBindingRow): Promise<never>;
}

export interface WorkflowHistoryRepository {
  listByPost(postId: string): Promise<readonly PublisherWorkflowHistoryRow[]>;
  append(row: PublisherWorkflowHistoryRow): Promise<never>;
}

export interface PublishingErrorsRepository {
  listByPost(postId: string): Promise<readonly PublisherPublishingErrorRow[]>;
  append(row: PublisherPublishingErrorRow): Promise<never>;
}

export interface PublisherRepositories {
  readonly posts: PostRepository;
  readonly teamMembers: TeamMembersRepository;
  readonly media: MediaRepository;
  readonly templateRegistry: TemplateRegistryRepository;
  readonly pageBindings: PageBindingRepository;
  readonly workflowHistory: WorkflowHistoryRepository;
  readonly publishingErrors: PublishingErrorsRepository;
}

/* ── Factory ─────────────────────────────────────────────────────── */

export function createPublisherRepositories(
  access: PublisherListAccess = createSharePointPublisherListAccess(),
  lists: typeof PUBLISHER_LISTS = PUBLISHER_LISTS,
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
    posts: {
      async getByPostId(postId) {
        const rows = await access.readList(lists.posts, {
          filter: `PostId eq '${postId.replace(/'/g, "''")}'`,
          top: 1,
        });
        for (const raw of rows) {
          const mapped = mapPostRow(raw);
          if (mapped) return mapped;
        }
        return undefined;
      },
      async listByWorkflowState(state) {
        const rows = await access.readList(lists.posts, {
          filter: `WorkflowState eq '${state}'`,
          orderBy: 'UpdatedDateUtc desc',
        });
        return mapAll(rows, mapPostRow);
      },
      async upsert() {
        throw new PublisherWriteNotImplementedError(
          'posts.upsert',
          'Wave 5 / Prompt-05',
        );
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
      async replaceAllForPost() {
        throw new PublisherWriteNotImplementedError(
          'teamMembers.replaceAllForPost',
          'Wave 5 / Prompt-05',
        );
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
      async replaceAllForPost() {
        throw new PublisherWriteNotImplementedError(
          'media.replaceAllForPost',
          'Wave 5 / Prompt-05',
        );
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
      async upsert() {
        throw new PublisherWriteNotImplementedError(
          'pageBindings.upsert',
          'Wave 5 / Prompt-05',
        );
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
      async append() {
        throw new PublisherWriteNotImplementedError(
          'workflowHistory.append',
          'Wave 6 / Prompt-06',
        );
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
          'Wave 5 / Prompt-05',
        );
      },
    },
  };
}
