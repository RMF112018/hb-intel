/**
 * Authoritative binding contract for the HBCentral `Projects` list.
 *
 * Centralizes the three pieces of list reality the Publisher authoring
 * surface needs:
 *   1. The list identity (GUID when registered, otherwise title).
 *   2. The raw SharePoint row shape (`RawProjectsListItem`).
 *   3. The field-name contract (`PROJECTS_LIST_FIELDS`) — the
 *      CSV-imported list uses generic `field_N` internal names and
 *      the Publisher only consumes the subset relevant to the
 *      authoring picker (ProjectId, ProjectNumber, ProjectName,
 *      ProjectLocation).
 *
 * Authority & drift. The broader project-domain contract lives in
 * `backend/functions/src/services/projects-list-contract.ts` —
 * `PROJECTS_LIST_FIELD_MAP` there is the tenant-wide source of truth
 * for every project field. This Publisher-side file intentionally
 * mirrors the subset the picker needs instead of importing across
 * the workspace boundary; field drift on the tenant list shows up
 * here as a single centralized edit rather than scattered literals
 * across `projectsLookupSource.ts`.
 *
 * Binding posture. `@hbc/sharepoint-platform` deliberately exposes
 * only GUID binding (`buildListItemsEndpoint`) — title binding is
 * not part of the platform API. The Publisher therefore owns the
 * title-bound fallback locally, clearly scoped to the not-yet-
 * GUID-registered Projects list. Once a tenant GUID is registered
 * (set `PROJECTS_LIST_ID` below, or thread `listId` through the
 * lookup factory), the same builder automatically produces a
 * GUID-bound URL and the fallback code path is no longer reached.
 */
import {
  buildListItemsEndpoint,
  type SharePointListDescriptor,
} from '@hbc/sharepoint-platform';

/** Live SharePoint list title of the HBCentral Projects list. */
export const PROJECTS_LIST_TITLE = 'Projects';

/**
 * Live SharePoint list GUID. `undefined` until the Projects list is
 * registered for the Publisher runtime. When undefined, the lookup
 * degrades to `getbytitle(PROJECTS_LIST_TITLE)` with a truthful
 * `(title-bound)` fetch label. When defined, GUID binding via
 * `@hbc/sharepoint-platform`'s `buildListItemsEndpoint` is used
 * instead, matching the repo's stronger binding posture. Callers
 * may also supply `listId` at factory time to override this module
 * default (useful for environment-scoped registration).
 */
export const PROJECTS_LIST_ID: string | undefined = undefined;

/**
 * Field contract for the HBCentral Projects list. Keys are domain
 * names; values are the tenant-list internal field names. This is
 * the single place these internal names appear outside of the raw
 * row interface — see authority note at the top of this file.
 */
export const PROJECTS_LIST_FIELDS = {
  displayTitle: 'Title',
  projectId: 'field_1',
  projectNumber: 'field_2',
  projectName: 'field_3',
  projectLocation: 'field_4',
} as const;

/** `$select` field list used by every Projects lookup read. */
export const PROJECTS_LIST_SELECT_FIELDS: readonly string[] = [
  PROJECTS_LIST_FIELDS.displayTitle,
  PROJECTS_LIST_FIELDS.projectId,
  PROJECTS_LIST_FIELDS.projectNumber,
  PROJECTS_LIST_FIELDS.projectName,
  PROJECTS_LIST_FIELDS.projectLocation,
];

/**
 * Raw SharePoint row shape for the Projects list. Property names
 * mirror the tenant's generic CSV-import column names; use
 * `PROJECTS_LIST_FIELDS` to translate to domain names.
 */
export interface RawProjectsListItem {
  readonly Title?: string;
  readonly field_1?: string;
  readonly field_2?: string;
  readonly field_3?: string;
  readonly field_4?: string;
}

/** Which binding strategy an endpoint URL was built with. */
export type ProjectsListBindingKind = 'guid' | 'title';

export interface ProjectsListEndpointBinding {
  readonly url: string;
  readonly kind: ProjectsListBindingKind;
}

export interface BuildProjectsListItemsUrlOptions {
  readonly hostSiteUrl: string;
  /** Raw (unencoded) `$filter` expression; the builder URL-encodes. */
  readonly filter?: string;
  /** Raw `$orderby` field reference (e.g. `field_3`). */
  readonly orderBy?: string;
  /** Upper bound passed as `$top=`. */
  readonly top?: number;
  /** Override for `PROJECTS_LIST_ID`. Empty/whitespace forces title fallback. */
  readonly listId?: string;
}

/**
 * Build the REST endpoint URL for reading items from the HBCentral
 * Projects list. Prefers GUID binding when a list GUID is available
 * (module default or per-call override); falls back to title binding
 * when it is not, so the Publisher does not fail closed on an
 * unregistered GUID.
 *
 * Always attaches `$select=PROJECTS_LIST_SELECT_FIELDS` so the field
 * contract is uniform across every caller.
 */
export function buildProjectsListItemsUrl(
  options: BuildProjectsListItemsUrlOptions,
): ProjectsListEndpointBinding {
  const base = options.hostSiteUrl.replace(/\/$/, '');
  const resolvedListId = (options.listId ?? PROJECTS_LIST_ID)?.trim();
  const select = PROJECTS_LIST_SELECT_FIELDS.join(',');

  const params: string[] = [`$select=${select}`];
  if (options.filter) {
    params.push(`$filter=${encodeURIComponent(options.filter)}`);
  }
  if (options.orderBy) {
    params.push(`$orderby=${options.orderBy}`);
  }
  if (typeof options.top === 'number') {
    params.push(`$top=${options.top}`);
  }
  const qs = `?${params.join('&')}`;

  if (resolvedListId && resolvedListId.length > 0) {
    const descriptor: SharePointListDescriptor = {
      id: resolvedListId,
      title: PROJECTS_LIST_TITLE,
      urlSegment: 'Projects',
    };
    // Platform builder does not support `$orderby`; call it with no
    // query to get the canonical `lists(guid'...')/items` root, then
    // attach our composed query string with full parity to the
    // title-bound fallback.
    const root = buildListItemsEndpoint(base, descriptor);
    return { url: `${root}${qs}`, kind: 'guid' };
  }

  const encodedTitle = encodeURIComponent(PROJECTS_LIST_TITLE);
  return {
    url: `${base}/_api/web/lists/getbytitle('${encodedTitle}')/items${qs}`,
    kind: 'title',
  };
}

/**
 * Operator-facing label threaded into `fetchListItemsJson` errors so
 * a failed Projects read narrates its binding strategy honestly
 * (distinguishing a GUID-bound read failure from the weaker
 * title-bound fallback case).
 */
export function projectsListFetchLabel(
  kind: ProjectsListBindingKind,
): string {
  return kind === 'guid'
    ? `${PROJECTS_LIST_TITLE} list (guid-bound)`
    : `${PROJECTS_LIST_TITLE} list (title-bound)`;
}
