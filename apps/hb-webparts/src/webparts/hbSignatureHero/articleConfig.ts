/**
 * articleConfig — Map signed/raw webpart properties into the strict
 * article content contract consumed by `HbSignatureHeroArticle`.
 *
 * Property-pane fields arrive as loosely typed `Record<string, unknown>`
 * from the SPFx shell. This helper is the single place that normalizes
 * them — trims strings, parses the comma-separated label list, and
 * enforces the required-field triad (title, author, publishedDate).
 *
 * If any required field is missing or empty, the helper returns
 * `undefined`. That means the orchestrator renders nothing for article
 * mode instead of silently mutating behavior on partial configuration.
 *
 * Field name → property-pane id:
 *   articleTitle           → title            (required)
 *   articleAuthor          → author           (required)
 *   articlePublishedDate   → publishedDate    (required)
 *   articleSubheading      → subheading
 *   articlePrimaryImageUrl → primaryImage
 *   articlePublishedTime   → publishedTime
 *   articleLabels          → labels (comma- or pipe-separated)
 *   articleDestinationUrl  → destinationUrl
 *   articleAuthorUpn       → authorUpn
 *   articleAuthorPhotoUrl  → authorPhotoUrl
 */
import type { HbSignatureHeroArticleContent } from './HbSignatureHeroArticleContract.js';

function readTrimmedString(
  source: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const raw = source?.[key];
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseLabels(raw: string | undefined): readonly string[] | undefined {
  if (!raw) return undefined;
  const parts = raw
    .split(/[,|]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return parts.length > 0 ? parts : undefined;
}

/**
 * Return a fully-formed `HbSignatureHeroArticleContent` when all
 * required fields are populated; otherwise `undefined`.
 */
export function buildHeroArticleContent(
  webPartProperties: Record<string, unknown> | undefined,
): HbSignatureHeroArticleContent | undefined {
  const title = readTrimmedString(webPartProperties, 'articleTitle');
  const author = readTrimmedString(webPartProperties, 'articleAuthor');
  const publishedDate = readTrimmedString(webPartProperties, 'articlePublishedDate');

  if (!title || !author || !publishedDate) {
    return undefined;
  }

  return {
    title,
    author,
    publishedDate,
    subheading: readTrimmedString(webPartProperties, 'articleSubheading'),
    primaryImage: readTrimmedString(webPartProperties, 'articlePrimaryImageUrl'),
    publishedTime: readTrimmedString(webPartProperties, 'articlePublishedTime'),
    labels: parseLabels(readTrimmedString(webPartProperties, 'articleLabels')),
    destinationUrl: readTrimmedString(webPartProperties, 'articleDestinationUrl'),
    authorUpn: readTrimmedString(webPartProperties, 'articleAuthorUpn'),
    authorPhotoUrl: readTrimmedString(webPartProperties, 'articleAuthorPhotoUrl'),
  };
}
