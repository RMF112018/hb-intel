/**
 * SharePoint Pages REST page-creation service.
 *
 * Wraps the Modern Pages API (`/_api/sitepages/pages`) used to create
 * or update a client-side page on the Project Spotlight site. Consumes
 * the structured `ComposedPage` produced by `pageCompositor` and walks
 * a two-step workflow:
 *
 *   1. Ensure a page record exists with the target file name under
 *      `SitePages/` (POST to `_api/sitepages/pages` if missing).
 *   2. PATCH the page's `CanvasContent1` with the composed controls.
 *
 * Write behavior is intentionally narrow: we create-or-update by page
 * name, and we never publish from this service (publish is separate
 * behavior on the Pages API that Wave 5 orchestrates alongside page-
 * binding writes).
 *
 * Blocking unknowns carried forward into Wave 9 hosted verification:
 *   - Exact `CanvasContent1` serialization for a TeamViewer (Custom)
 *     control; the provisional payload shape here mirrors the
 *     JsonControlData structure observed in the canonical XML, which
 *     is the shape SharePoint preserves on page save.
 *   - Authoring principal / permissions on `/sites/ProjectSpotlight`
 *     (blocking unknown #4 from Wave 1).
 */

import type { ComposedPage } from './pageCompositor';
import { isVisibleControl } from './pageCompositor';

export interface PageCreationInput {
  readonly page: ComposedPage;
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
  readonly reason: 'ensurePageFailed' | 'patchCanvasFailed' | 'unexpectedShape';
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
    async createOrUpdate({ page }) {
      const siteUrl = page.identity.targetSiteUrl.replace(/\/+$/, '');
      const pageName = page.identity.pageName;
      const digest = await fetchRequestDigest(siteUrl);

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
  };
}
