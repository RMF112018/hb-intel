/**
 * SharePoint Pages REST page-creation service.
 *
 * Wraps the Modern Pages API (`/_api/sitepages/pages`) for every
 * write the publisher issues against a destination site. Consumes
 * the structured `ComposedPage` produced by `pageCompositor`. The
 * service targets pages by one of two explicit paths:
 *
 *   - `createOrUpdate({ page })` (create / regenerate) — POSTs to
 *     `_api/sitepages/pages` with `FileName = page.identity.pageName`
 *     to ensure the page exists, then PATCHes `CanvasContent1`.
 *   - `createOrUpdate({ page, targetPageId })` (in-place republish)
 *     — GETs the page by `Id`, echoes its existing `FileName` /
 *     `AbsoluteUrl`, and PATCHes `CanvasContent1` on that `Id`.
 *     Filename-based rebinding is deliberately NOT attempted on
 *     this path so slug / page-name drift cannot retarget the
 *     page (policy layer forces `regenerate` when PageName
 *     actually changed — see `republishPolicy.pageNameDrift`).
 *
 * The service also owns the explicit publish lifecycle:
 *   - `publishLive({ pageId })` promotes the draft-state page
 *     returned by `createOrUpdate` to the live version.
 *   - `unpublishLive({ pageId })` reverts a live page to draft
 *     (archive / withdraw lifecycles).
 */

import type { ComposedPage } from './pageCompositor';
import { isVisibleControl } from './pageCompositor';

export interface PageCreationInput {
  readonly page: ComposedPage;
  /**
   * When set, the page-creation service targets this SharePoint
   * Pages `Id` directly and does NOT issue a create-by-filename or
   * look-up-by-filename. This is how an `inPlaceUpdate` republish
   * guarantees it writes to the already-bound destination page even
   * if the authoring slug / filename has drifted. Callers that do
   * not pass `targetPageId` retain the original create-or-match-by-
   * filename behavior used for the first publish.
   */
  readonly targetPageId?: string;
}

export interface PageCreationResult {
  readonly ok: true;
  readonly pageId: string;
  readonly pageUrl: string;
  readonly pageName: string;
  readonly wasCreated: boolean;
  readonly rawResponse?: unknown;
}

export interface PageCreationFailure {
  readonly ok: false;
  readonly reason:
    | 'ensurePageFailed'
    | 'patchCanvasFailed'
    | 'unexpectedShape'
    | 'targetPageNotFound';
  readonly message: string;
  readonly status?: number;
  readonly rawResponse?: unknown;
}

export type PageCreationOutcome = PageCreationResult | PageCreationFailure;

/**
 * Input for the explicit final modern-page publish lifecycle step.
 * Carries the resolved page id + the site URL so the service can
 * POST to `_api/sitepages/pages({pageId})/Publish` deterministically
 * without re-reading the composed page.
 */
export interface PagePublishInput {
  readonly pageId: string;
  readonly siteUrl: string;
}

export interface PagePublishResult {
  readonly ok: true;
  readonly pageId: string;
  readonly publishedAtUtc?: string;
  readonly rawResponse?: unknown;
}

export interface PagePublishFailure {
  readonly ok: false;
  readonly reason: 'publishLifecycleFailed' | 'unexpectedShape';
  readonly message: string;
  readonly status?: number;
  readonly rawResponse?: unknown;
}

export type PagePublishOutcome = PagePublishResult | PagePublishFailure;

/**
 * Input for the inverse of `publishLive` — SharePoint's
 * `_api/sitepages/pages({pageId})/SavePageAsDraft` action, which
 * reverts a live/published page back to draft so it is no longer
 * the end-user-visible version. Archive and withdraw lifecycles
 * use this to take the destination page out of public view while
 * leaving the page record (and its draft version history) intact.
 */
export interface PageUnpublishInput {
  readonly pageId: string;
  readonly siteUrl: string;
}

export interface PageUnpublishResult {
  readonly ok: true;
  readonly pageId: string;
  readonly rawResponse?: unknown;
}

export interface PageUnpublishFailure {
  readonly ok: false;
  readonly reason: 'unpublishLifecycleFailed' | 'unexpectedShape';
  readonly message: string;
  readonly status?: number;
  readonly rawResponse?: unknown;
}

export type PageUnpublishOutcome = PageUnpublishResult | PageUnpublishFailure;

export interface PageCreationService {
  /**
   * Idempotently creates or updates the modern page's `CanvasContent1`.
   * Does NOT make the page live — callers must explicitly invoke
   * `publishLive` to take a draft-state page out of draft.
   */
  createOrUpdate(input: PageCreationInput): Promise<PageCreationOutcome>;
  /**
   * Final modern-page publish lifecycle step — POSTs to
   * `_api/sitepages/pages({pageId})/Publish` so the page record's
   * checked-in version becomes the live published version. This is
   * the action that promotes a draft page (the state left behind by
   * `createOrUpdate` alone) to a live, end-user-visible page.
   */
  publishLive(input: PagePublishInput): Promise<PagePublishOutcome>;
  /**
   * Inverse of `publishLive` — POSTs to
   * `_api/sitepages/pages({pageId})/SavePageAsDraft` so the live
   * version is demoted back to draft. Archive and withdraw
   * lifecycles call this to take the destination page out of
   * public view while preserving the page record itself.
   */
  unpublishLive(input: PageUnpublishInput): Promise<PageUnpublishOutcome>;
}

export interface SharePointPageCreationDeps {
  /** Request-digest fetcher for write-operations. */
  readonly fetchRequestDigest: (siteUrl: string) => Promise<string>;
  /** Raw fetch implementation (injected for tests). */
  readonly fetchImpl?: typeof fetch;
}

interface SharePointPageCreateResponse {
  readonly Id?: string | number;
  readonly UniqueId?: string;
  readonly FileName?: string;
  readonly AbsoluteUrl?: string;
  readonly Url?: string;
}

/**
 * Serialize a `ComposedPage` into the JSON control payload SharePoint
 * Pages expects in `CanvasContent1`. The shape mirrors the canonical
 * Project Spotlight XML — each visible control contributes one canvas
 * entry keyed by `controlId`, while hidden controls are omitted.
 *
 * Exported so tests can assert the serialization without touching the
 * network.
 */
export function serializeCanvasContent(page: ComposedPage): string {
  const entries = page.controls
    .filter(isVisibleControl)
    .map((c) => {
      switch (c.slot) {
        case 'banner': {
          return {
            controlType: 3,
            id: c.controlId,
            position: {
              layoutIndex: 1,
              zoneIndex: c.sectionOrder,
              sectionIndex: c.column,
              controlIndex: c.orderInSection,
            },
            webPartId: c.controlId,
            webPartData: {
              dataVersion: '1.6',
              properties: {
                title: c.title,
                imageSourceType: 2,
                imageSource: c.imageUrl,
                altText: c.imageAltText,
                layoutType: c.layoutType,
                textAlignment: 'Left',
                showTopicHeader: false,
                showPublishDate: c.showPublishDate,
                topicHeader: c.eyebrow ?? '',
                enableGradientEffect: c.showBackgroundGradient,
                authors: [],
              },
              serverProcessedContent: {
                htmlStrings: {},
                searchablePlainTexts: { title: c.title },
                imageSources: { imageSource: c.imageUrl },
                links: {},
              },
            },
          };
        }
        case 'subhead':
        case 'body': {
          return {
            controlType: 4,
            id: c.controlId,
            position: {
              layoutIndex: 1,
              zoneIndex: c.sectionOrder,
              sectionIndex: c.column,
              controlIndex: c.orderInSection,
            },
            innerHTML: c.text,
            editorType: 'CKEditor',
          };
        }
        case 'team': {
          return {
            controlType: 3,
            id: c.controlId,
            position: {
              layoutIndex: 1,
              zoneIndex: c.sectionOrder,
              sectionIndex: c.column,
              controlIndex: c.orderInSection,
            },
            webPartId: c.controlId,
            webPartData: {
              dataVersion: '1.0',
              properties: c.properties,
              serverProcessedContent: {
                htmlStrings: {},
                searchablePlainTexts: { heading: c.properties.heading },
                imageSources: {},
                links: {},
              },
            },
          };
        }
        case 'gallery': {
          return {
            controlType: 3,
            id: c.controlId,
            position: {
              layoutIndex: 1,
              zoneIndex: c.sectionOrder,
              sectionIndex: c.column,
              controlIndex: c.orderInSection,
            },
            webPartId: c.controlId,
            webPartData: {
              dataVersion: '1.12',
              properties: {
                layout: c.layoutProfile === 'carousel' ? 2 : 4,
                gridSettings: {
                  imageSize: 2,
                  imageCropping: 1,
                  imageAspectRatio: 1,
                  lightbox: false,
                },
                imageSourceType: 1,
                maxImagesCount: c.maxImagesCount,
                images: c.images.map((img, idx) => ({
                  order: idx,
                  imageUrl: img.imageUrl,
                  altText: img.altText,
                  title: img.caption ?? '',
                })),
              },
              serverProcessedContent: {
                htmlStrings: {},
                searchablePlainTexts: {},
                imageSources: Object.fromEntries(
                  c.images.map((img, idx) => [`image${idx}`, img.imageUrl]),
                ),
                links: {},
              },
            },
          };
        }
      }
      return undefined;
    })
    .filter((e) => e !== undefined);
  return JSON.stringify(entries);
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

export function createSharePointPageCreationService(
  deps: SharePointPageCreationDeps,
): PageCreationService {
  const { fetchRequestDigest, fetchImpl = fetch } = deps;

  return {
    async createOrUpdate({ page, targetPageId }) {
      const siteUrl = page.identity.targetSiteUrl.replace(/\/+$/, '');
      const pageName = page.identity.pageName;
      const digest = await fetchRequestDigest(siteUrl);

      // In-place republish path — target the bound page by `Id`
      // directly. We deliberately skip the filename-based ensure so
      // slug/page-name drift CANNOT silently mutate an unrelated
      // page that happens to share the new filename. The policy
      // layer is responsible for forcing regeneration when page-name
      // drift is detected.
      if (typeof targetPageId === 'string' && targetPageId.length > 0) {
        const lookupByIdUrl = `${siteUrl}/_api/sitepages/pages(${targetPageId})`;
        const lookupRes = await fetchImpl(lookupByIdUrl, {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json;odata=nometadata' },
        });
        if (!lookupRes.ok) {
          return {
            ok: false,
            reason:
              lookupRes.status === 404 ? 'targetPageNotFound' : 'ensurePageFailed',
            message:
              lookupRes.status === 404
                ? `Bound PageId '${targetPageId}' not found on ${siteUrl} — binding row references a page that no longer exists.`
                : `Bound-page lookup failed (status ${lookupRes.status}).`,
            status: lookupRes.status,
            rawResponse: await parseJsonSafe(lookupRes),
          };
        }
        const record = (await parseJsonSafe(lookupRes)) as
          | SharePointPageCreateResponse
          | undefined;
        if (!record || record.Id === undefined) {
          return {
            ok: false,
            reason: 'unexpectedShape',
            message: `Bound-page lookup returned no Id for '${targetPageId}'.`,
            rawResponse: record,
          };
        }
        const resolvedPageName = record.FileName ?? pageName;
        const resolvedPageUrl =
          record.AbsoluteUrl ??
          record.Url ??
          `${siteUrl}/SitePages/${resolvedPageName}`;

        // PATCH the bound page by id. Title + canvas are the only
        // in-place mutations we perform — the file name / URL are
        // preserved exactly so the bound PageId continues to point
        // at the same end-user-visible page.
        const canvas = serializeCanvasContent(page);
        const patchUrl = `${siteUrl}/_api/sitepages/pages(${targetPageId})`;
        const patchRes = await fetchImpl(patchUrl, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            Accept: 'application/json;odata=nometadata',
            'Content-Type': 'application/json;odata=nometadata',
            'X-RequestDigest': digest,
            'If-Match': '*',
            'X-HTTP-Method': 'MERGE',
          },
          body: JSON.stringify({
            Title: page.identity.pageTitle,
            CanvasContent1: canvas,
          }),
        });
        if (!patchRes.ok) {
          return {
            ok: false,
            reason: 'patchCanvasFailed',
            message: `CanvasContent1 patch failed (status ${patchRes.status}).`,
            status: patchRes.status,
            rawResponse: await parseJsonSafe(patchRes),
          };
        }
        return {
          ok: true,
          pageId: targetPageId,
          pageUrl: resolvedPageUrl,
          pageName: resolvedPageName,
          wasCreated: false,
          rawResponse: await parseJsonSafe(patchRes),
        };
      }

      // Step 1 — ensure the page exists (create if missing).
      const ensureUrl = `${siteUrl}/_api/sitepages/pages`;
      const ensureBody = {
        PageLayoutType: 'Article',
        Title: page.identity.pageTitle,
        FileName: pageName,
      };
      const ensureRes = await fetchImpl(ensureUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata',
          'X-RequestDigest': digest,
          'If-Match': '*',
        },
        body: JSON.stringify(ensureBody),
      });

      let wasCreated = ensureRes.ok;
      let ensurePayload: SharePointPageCreateResponse | undefined;

      if (!ensureRes.ok) {
        // SharePoint returns 409/500 when the page already exists under the
        // same filename. Fall back to a GET-by-filename to confirm.
        if (ensureRes.status !== 409 && ensureRes.status !== 500) {
          return {
            ok: false,
            reason: 'ensurePageFailed',
            message: `Page create failed (status ${ensureRes.status}).`,
            status: ensureRes.status,
            rawResponse: await parseJsonSafe(ensureRes),
          };
        }
        wasCreated = false;
      } else {
        ensurePayload = (await parseJsonSafe(ensureRes)) as
          | SharePointPageCreateResponse
          | undefined;
      }

      // Step 2 — look up the page by FileName so we have a stable id + URL.
      const lookupFilter = encodeURIComponent(`FileName eq '${pageName}'`);
      const lookupUrl = `${siteUrl}/_api/sitepages/pages?$filter=${lookupFilter}&$top=1`;
      const lookupRes = await fetchImpl(lookupUrl, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json;odata=nometadata' },
      });
      if (!lookupRes.ok) {
        return {
          ok: false,
          reason: 'ensurePageFailed',
          message: `Page lookup failed (status ${lookupRes.status}).`,
          status: lookupRes.status,
          rawResponse: await parseJsonSafe(lookupRes),
        };
      }
      const lookupBody = (await parseJsonSafe(lookupRes)) as
        | { value?: SharePointPageCreateResponse[] }
        | undefined;
      const record = lookupBody?.value?.[0] ?? ensurePayload;
      if (!record || record.Id === undefined) {
        return {
          ok: false,
          reason: 'unexpectedShape',
          message: `Unable to resolve Pages record for FileName '${pageName}'.`,
          rawResponse: lookupBody,
        };
      }

      const pageId = String(record.Id);
      const pageUrl =
        record.AbsoluteUrl ??
        record.Url ??
        `${siteUrl}/SitePages/${pageName}`;

      // Step 3 — PATCH canvas content.
      const canvas = serializeCanvasContent(page);
      const patchUrl = `${siteUrl}/_api/sitepages/pages(${pageId})`;
      const patchRes = await fetchImpl(patchUrl, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata',
          'X-RequestDigest': digest,
          'If-Match': '*',
          'X-HTTP-Method': 'MERGE',
        },
        body: JSON.stringify({
          Title: page.identity.pageTitle,
          CanvasContent1: canvas,
        }),
      });

      if (!patchRes.ok) {
        return {
          ok: false,
          reason: 'patchCanvasFailed',
          message: `CanvasContent1 patch failed (status ${patchRes.status}).`,
          status: patchRes.status,
          rawResponse: await parseJsonSafe(patchRes),
        };
      }

      return {
        ok: true,
        pageId,
        pageUrl,
        pageName,
        wasCreated,
        rawResponse: await parseJsonSafe(patchRes),
      };
    },

    async publishLive({ pageId, siteUrl }) {
      const trimmedSite = siteUrl.replace(/\/+$/, '');
      let digest: string;
      try {
        digest = await fetchRequestDigest(trimmedSite);
      } catch (err) {
        return {
          ok: false,
          reason: 'publishLifecycleFailed',
          message:
            err instanceof Error
              ? `Request-digest fetch failed before Publish: ${err.message}`
              : 'Request-digest fetch failed before Publish.',
        };
      }

      const publishUrl = `${trimmedSite}/_api/sitepages/pages(${pageId})/Publish`;
      const res = await fetchImpl(publishUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata',
          'X-RequestDigest': digest,
        },
      });
      if (!res.ok) {
        return {
          ok: false,
          reason: 'publishLifecycleFailed',
          message: `Page Publish lifecycle failed (status ${res.status}).`,
          status: res.status,
          rawResponse: await parseJsonSafe(res),
        };
      }
      const payload = (await parseJsonSafe(res)) as
        | { Modified?: string }
        | undefined;
      return {
        ok: true,
        pageId,
        publishedAtUtc: payload?.Modified,
        rawResponse: payload,
      };
    },

    async unpublishLive({ pageId, siteUrl }) {
      const trimmedSite = siteUrl.replace(/\/+$/, '');
      let digest: string;
      try {
        digest = await fetchRequestDigest(trimmedSite);
      } catch (err) {
        return {
          ok: false,
          reason: 'unpublishLifecycleFailed',
          message:
            err instanceof Error
              ? `Request-digest fetch failed before SavePageAsDraft: ${err.message}`
              : 'Request-digest fetch failed before SavePageAsDraft.',
        };
      }

      const unpublishUrl = `${trimmedSite}/_api/sitepages/pages(${pageId})/SavePageAsDraft`;
      const res = await fetchImpl(unpublishUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata',
          'X-RequestDigest': digest,
        },
      });
      if (!res.ok) {
        return {
          ok: false,
          reason: 'unpublishLifecycleFailed',
          message: `Page SavePageAsDraft lifecycle failed (status ${res.status}).`,
          status: res.status,
          rawResponse: await parseJsonSafe(res),
        };
      }
      return {
        ok: true,
        pageId,
        rawResponse: await parseJsonSafe(res),
      };
    },
  };
}
