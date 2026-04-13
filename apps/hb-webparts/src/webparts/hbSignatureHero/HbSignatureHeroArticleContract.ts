/**
 * HbSignatureHero — Article-mode content contract.
 *
 * Explicit shape for non-HBCentral article rendering. Kept deliberately
 * separate from the homepage adapter so the two modes never share a
 * single optional-prop matrix.
 *
 * Optional fields degrade gracefully in `HbSignatureHeroArticle`:
 *   - missing `primaryImage` → surface uses its gradient background only
 *   - missing `subheading`   → no sub line rendered
 *   - missing `publishedTime`→ date renders alone
 *   - missing `labels`       → no eyebrow
 *   - missing `destinationUrl` → title renders as static text (no link)
 *
 * Wiring of this contract to a real article data source lives in the
 * runtime/property-pane integration step; this file is data-shape only.
 */

export interface HbSignatureHeroArticleContent {
  /** Required: title of the article. */
  title: string;
  /** Required: byline/author display name. */
  author: string;
  /**
   * Required: ISO-8601 date string (e.g. `'2026-04-13'`) or a
   * pre-formatted display string. The adapter renders the value as
   * provided — upstream is responsible for locale formatting when a
   * raw ISO string is not desired.
   */
  publishedDate: string;
  /** Optional full-bleed hero image URL. */
  primaryImage?: string;
  /** Optional deck/standfirst sentence beneath the title. */
  subheading?: string;
  /** Optional time-of-day suffix (e.g. `'09:15 AM'`). */
  publishedTime?: string;
  /** Optional categorical tags (topic, program, channel). */
  labels?: readonly string[];
  /** Optional canonical URL for the article; wraps the title when present. */
  destinationUrl?: string;
  /**
   * Optional author UPN/email used to resolve a Graph photo through
   * the shared `PersonPhotoFn` seam. Ignored when `authorPhotoUrl`
   * is present.
   */
  authorUpn?: string;
  /**
   * Optional explicit author avatar URL. When provided, it is used
   * as-is and no Graph lookup is attempted.
   */
  authorPhotoUrl?: string;
}
