/**
 * Template-aware validation engine for the Article Publisher.
 *
 * Pure. Consumes a `PublishResolutionContext` (tenant `HB Articles` +
 * `HB Article Template Registry` + `HB Article Destination Pages`
 * resolved seam) plus the active `PageShellManifest` and returns a
 * typed `ValidationResult`. Every finding references real tenant
 * fields only — no pre-tenant-audit `PostId` / `PostFamily` /
 * `BannerImageUrl` / `BindingStatus` / `TargetSiteKey` aliases survive.
 *
 * Authority (tenant truth):
 *   docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md
 *
 * The engine runs:
 *   1. Global rules — tenant-required HB Articles columns + tenant
 *      Destination scoping + active-template enforcement.
 *   2. Template-profile-specific required fields routed by the tenant
 *      `Template.RequiredFieldSetKey`.
 *   3. Conditional block rules (ShowTeamViewer / ShowGallery on the
 *      tenant template).
 *   4. Shell-compatibility rules (template profile keys vs. shell).
 *   5. Length-recommendation warnings (Title / Subhead / SummaryExcerpt).
 *   6. Page-generation / binding drift warnings against the tenant
 *      `HB Article Destination Pages` row.
 *
 * Unknown `RequiredFieldSetKey` values are tolerated with an
 * `invalid-template-match` *warning* so a misconfigured registry
 * doesn't silently drop author-facing validation guidance.
 */

import type { PublishResolutionContext } from '../publishResolutionContext';
import type { PublisherArticleRow, PublisherTemplateRegistryRow } from '../publisherContracts';
import {
  PROJECT_SPOTLIGHT_V1_SHELL,
  type PageShellManifest,
} from '../pageGeneration/xmlShellManifest';
import {
  resolveDestinationSiteUrl,
  resolveDestinationSitePath,
} from '../destinationSiteUrls';

export type ValidationCategory =
  | 'missing-required-field'
  | 'invalid-template-match'
  | 'invalid-shell-compatibility'
  | 'invalid-slug'
  | 'invalid-image-accessibility'
  | 'invalid-team-configuration'
  | 'invalid-gallery-configuration'
  | 'invalid-page-binding'
  | 'page-generation-blocker';

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationFinding {
  readonly category: ValidationCategory;
  readonly severity: ValidationSeverity;
  /** Dotted path to the offending field (e.g. `media[0].AltText`). */
  readonly field?: string;
  readonly message: string;
  /** Short, action-oriented remediation hint for the UI. */
  readonly actionHint?: string;
}

export interface ValidationResult {
  readonly ok: boolean;
  readonly errors: readonly ValidationFinding[];
  readonly warnings: readonly ValidationFinding[];
  readonly summaryByCategory: Readonly<Record<ValidationCategory, number>>;
}

export interface ValidatePublishContextOptions {
  readonly shell?: PageShellManifest;
}

const TITLE_MAX = 120;
const SUBHEAD_MAX = 200;
const SUMMARY_MAX = 280;

function emptyCategoryMap(): Record<ValidationCategory, number> {
  return {
    'missing-required-field': 0,
    'invalid-template-match': 0,
    'invalid-shell-compatibility': 0,
    'invalid-slug': 0,
    'invalid-image-accessibility': 0,
    'invalid-team-configuration': 0,
    'invalid-gallery-configuration': 0,
    'invalid-page-binding': 0,
    'page-generation-blocker': 0,
  };
}

function str(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

/**
 * Rich-body emptiness check for `BodyRichText`.
 *
 * The Story body editor (TipTap) serialises an empty document as
 * `<p></p>` (and a few close variants) rather than an empty string.
 * A raw `str()` check would treat those as present and let an
 * empty-body article reach publish. This helper strips the permitted
 * schema tags and entity noise, then checks whether any readable text
 * remains. A body that contains only markup / whitespace is treated
 * as empty for validation purposes.
 *
 * Kept local to the adapter (no webpart-layer dependency) and
 * intentionally conservative: it only looks at text content, not
 * attributes, so a lone allowed inline (e.g. `<a href="...">`) with
 * no visible text is still empty.
 */
export function isRichBodyEmpty(html: unknown): boolean {
  if (typeof html !== 'string') return true;
  const trimmed = html.trim();
  if (trimmed.length === 0) return true;
  const withoutTags = trimmed.replace(/<[^>]*>/g, '');
  const decoded = withoutTags
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
  return decoded.replace(/\s+/g, '').length === 0;
}

function isFieldEffectivelyEmpty(
  article: PublisherArticleRow,
  key: keyof PublisherArticleRow,
): boolean {
  if (key === 'BodyRichText') return isRichBodyEmpty(article[key]);
  return !str(article[key] as unknown);
}

function requireField(
  article: PublisherArticleRow,
  key: keyof PublisherArticleRow,
  label: string,
  findings: ValidationFinding[],
): void {
  if (isFieldEffectivelyEmpty(article, key)) {
    findings.push({
      category: 'missing-required-field',
      severity: 'error',
      field: String(key),
      message: `${label} is required.`,
      actionHint: `Fill in "${label}" on the article record.`,
    });
  }
}

/* ── Template-profile required-field sets ─────────────────────────── */

interface TemplateRequiredFieldSet {
  readonly articleFields: readonly (keyof PublisherArticleRow)[];
  /** Tenant-typed conditional checks beyond simple required-field presence. */
  readonly extraChecks?: readonly {
    readonly key: keyof PublisherArticleRow;
    readonly predicate: (article: PublisherArticleRow) => boolean;
    readonly message: string;
    readonly actionHint: string;
  }[];
}

const MONTHLY_REQUIRED: TemplateRequiredFieldSet = {
  articleFields: [
    'ProjectId',
    'ProjectName',
    'ProjectStage',
    'Title',
    'Subhead',
    'SummaryExcerpt',
    'Slug',
    'HeroPrimaryImage',
    'HeroPrimaryImageAltText',
    'BodyRichText',
  ],
};

// Milestone-article authoring is intentionally **legacy read-
// compatible only** and not an operational live flow. The prior
// `MILESTONE_REQUIRED` profile enforced
// `MilestoneLabel` / `MilestoneDateUtc` on templates keyed
// `'req-ps-inprogress-milestone-v1'`, but the authoring UI exposes
// no controls for those fields and `mapArticleRowToListFields`
// does not persist them — operators would have failed validation
// with no way to satisfy it. The profile + its mapping are
// removed so no active path demands UI-unsupported fields.
//
// Tenant alignment is preserved:
//   - `PublisherArticleRow.MilestoneLabel` / `MilestoneDateUtc`
//     remain on the contract (read-safe).
//   - `ARTICLES_MVP_FIELDS` still lists both columns.
//
// To re-enable milestone articles:
//   1. reintroduce `MILESTONE_REQUIRED` + its entry in
//      `REQUIRED_FIELD_SETS`,
//   2. add `MilestoneLabel` / `MilestoneDateUtc` writes in
//      `mapArticleRowToListFields`,
//   3. expose authoring controls (Label + Date) in
//      `ArticlePublisher.tsx`,
//   4. revive the deleted
//      "enforces milestone required fields" validation test.
//
// Legacy templates still referencing the removed key degrade
// gracefully via the existing unknown-`RequiredFieldSetKey`
// fallback (warn + run global rules only).

const PROJECT_UPDATE_REQUIRED: TemplateRequiredFieldSet = {
  articleFields: [
    'ProjectId',
    'ProjectName',
    'Title',
    'Subhead',
    'SummaryExcerpt',
    'Slug',
    'HeroPrimaryImage',
    'HeroPrimaryImageAltText',
    'BodyRichText',
  ],
};

const REQUIRED_FIELD_SETS: Readonly<Record<string, TemplateRequiredFieldSet>> = {
  'req-ps-inprogress-monthly-v1': MONTHLY_REQUIRED,
  // 'req-ps-inprogress-milestone-v1' is intentionally omitted — see
  // the milestone scope-out comment above.
  'req-ps-inprogress-project-update-v1': PROJECT_UPDATE_REQUIRED,
};

function labelFor(key: keyof PublisherArticleRow): string {
  return String(key);
}

/* ── Per-rule validators ──────────────────────────────────────────── */

function validateGlobalRules(
  context: PublishResolutionContext,
  shell: PageShellManifest,
  findings: ValidationFinding[],
): void {
  const { article } = context;

  // Rule 1
  if (!str(article.ArticleId)) {
    findings.push({
      category: 'missing-required-field',
      severity: 'error',
      field: 'ArticleId',
      message: 'ArticleId is required.',
      actionHint: 'ArticleId is assigned by the authoring surface; reload the article.',
    });
  }

  // Rule 2
  if (article.Destination !== 'projectSpotlight') {
    findings.push({
      category: 'invalid-template-match',
      severity: 'error',
      field: 'Destination',
      message: `Destination must be 'projectSpotlight' in the current sprint (found '${article.Destination}').`,
      actionHint:
        'Project Spotlight is the only destination implemented by this sprint; Company Pulse support is planned.',
    });
  }

  // Rule 3 — TargetSiteUrl is tenant-optional (P2-2). The app
  // no longer requires the author to carry a value: when blank,
  // the orchestrator derives the canonical destination URL via
  // `resolveDestinationSiteUrl` at publish time. When the author
  // DOES supply a value, it must match the canonical URL exactly
  // — an arbitrary override would silently retarget the page at
  // an unauthorized site. If the destination has no canonical
  // URL registered, fail closed.
  const canonicalSiteUrl = resolveDestinationSiteUrl(article.Destination);
  const canonicalSitePath = resolveDestinationSitePath(article.Destination);
  if (!canonicalSiteUrl || !canonicalSitePath) {
    findings.push({
      category: 'invalid-template-match',
      severity: 'error',
      field: 'TargetSiteUrl',
      message: `Destination '${article.Destination}' has no canonical site URL registered; publishing is not wired for this destination yet.`,
      actionHint: 'Pick a supported destination or register the destination site URL in destinationSiteUrls.ts.',
    });
  } else if (article.TargetSiteUrl && !article.TargetSiteUrl.includes(canonicalSitePath)) {
    // Path-based check (not full-URL equality): accepts tenant-host
    // variation (prod vs. test) while rejecting a retarget to a
    // completely unrelated site path.
    findings.push({
      category: 'invalid-template-match',
      severity: 'error',
      field: 'TargetSiteUrl',
      message: `TargetSiteUrl override '${article.TargetSiteUrl}' does not target the canonical '${article.Destination}' site path ('${canonicalSitePath}').`,
      actionHint: 'Clear TargetSiteUrl to accept the canonical destination URL, or correct the path.',
    });
  }

  // Rule 4
  if (!str(article.ArticleContentType)) {
    findings.push({
      category: 'missing-required-field',
      severity: 'error',
      field: 'ArticleContentType',
      message: 'ArticleContentType is required.',
      actionHint: 'Pick an article content type on the Metadata tab.',
    });
  }

  // Rule 5 / 6 — resolver already picked these; check they still line up.
  if (!str(article.TemplateKey)) {
    findings.push({
      category: 'missing-required-field',
      severity: 'error',
      field: 'TemplateKey',
      message: 'TemplateKey is required.',
      actionHint: 'Save the article once so the resolver can assign a template.',
    });
  } else if (!context.template.IsActive) {
    findings.push({
      category: 'invalid-template-match',
      severity: 'error',
      field: 'TemplateKey',
      message: `Template '${context.template.TemplateKey}' is not active (IsActive=false).`,
      actionHint: 'Select an active template or request the registry be updated.',
    });
  }

  // Rule 8
  if (!str(article.Title)) {
    findings.push({
      category: 'missing-required-field',
      severity: 'error',
      field: 'Title',
      message: 'Title is required.',
      actionHint: 'Give the article a title on the Metadata tab.',
    });
  }

  // Rules 9 + 10 — Subhead / Body required when the shell exposes those slots.
  const hasSubheadSlot = !!shell.controlsBySlot.subhead;
  const hasBodySlot = !!shell.controlsBySlot.body;
  if (hasSubheadSlot && !str(article.Subhead)) {
    findings.push({
      category: 'missing-required-field',
      severity: 'error',
      field: 'Subhead',
      message: 'Subhead is required for this shell.',
      actionHint: 'Fill the Subhead field on the Content tab.',
    });
  }
  if (hasBodySlot && isRichBodyEmpty(article.BodyRichText)) {
    findings.push({
      category: 'missing-required-field',
      severity: 'error',
      field: 'BodyRichText',
      message: 'Body is required for this shell.',
      actionHint: 'Write the article body on the Content tab.',
    });
  }

  // Rule 11 — Slug required; uniqueness within the destination is
  // enforced at hosted publish time (SharePoint Pages REST refuses
  // duplicate FileNames). The validation engine only enforces the
  // tenant-required presence here; uniqueness is not a client-side
  // findable invariant.
  if (!str(article.Slug)) {
    findings.push({
      category: 'invalid-slug',
      severity: 'error',
      field: 'Slug',
      message: 'Slug is required.',
      actionHint: 'Enter a URL-safe slug on the Metadata tab.',
    });
  }

  // Rule 12 — banner image required when banner slot is present.
  const hasBannerSlot = !!shell.controlsBySlot.banner;
  if (hasBannerSlot && !str(article.HeroPrimaryImage)) {
    findings.push({
      category: 'missing-required-field',
      severity: 'error',
      field: 'HeroPrimaryImage',
      message: 'HeroPrimaryImage is required for the current shell.',
      actionHint: 'Add a hero image URL on the Hero tab.',
    });
  }

  // Rule 13 — alt text when hero image exists.
  if (str(article.HeroPrimaryImage) && !str(article.HeroPrimaryImageAltText)) {
    findings.push({
      category: 'invalid-image-accessibility',
      severity: 'error',
      field: 'HeroPrimaryImageAltText',
      message: 'HeroPrimaryImageAltText is required whenever a hero image is set.',
      actionHint: 'Provide alt text describing the hero image.',
    });
  }

  // Rule 14 — every gallery image must have alt text.
  context.media.forEach((row, idx) => {
    if (row.MediaRole === 'gallery' && !str(row.AltText)) {
      findings.push({
        category: 'invalid-image-accessibility',
        severity: 'error',
        field: `media[${idx}].AltText`,
        message: `Gallery image '${row.MediaId}' is missing alt text.`,
        actionHint: 'Add alt text on the Gallery tab.',
      });
    }
  });

  // Rule 15 — unresolved generation error on the existing binding.
  if (context.existingBinding?.PublishStatus === 'error') {
    findings.push({
      category: 'page-generation-blocker',
      severity: 'warning',
      field: 'existingBinding.PublishStatus',
      message:
        'The previous publish attempt ended in error. Republish will retry.',
      actionHint: 'Review the last operation and republish to retry.',
    });
  }

  // Rule 16 — template cannot require a secondary-image slot unless shell has one.
  const hasSecondaryImageSlot = Object.prototype.hasOwnProperty.call(
    shell.controlsBySlot,
    'secondaryImage',
  );
  if (
    !hasSecondaryImageSlot &&
    context.media.some((r) => r.MediaRole === 'secondary')
  ) {
    findings.push({
      category: 'invalid-shell-compatibility',
      severity: 'warning',
      field: 'media',
      message:
        'Secondary-image media exists but the current shell has no secondary-image slot. It will not render.',
      actionHint:
        'Remove the secondary-image media row, or request a shell variant that includes that slot.',
    });
  }
}

function validateTemplateRequiredFieldSet(
  context: PublishResolutionContext,
  findings: ValidationFinding[],
): void {
  const set = REQUIRED_FIELD_SETS[context.template.RequiredFieldSetKey];
  if (!set) {
    findings.push({
      category: 'invalid-template-match',
      severity: 'warning',
      field: 'template.RequiredFieldSetKey',
      message: `Unknown RequiredFieldSetKey '${context.template.RequiredFieldSetKey}'. Running global rules only.`,
      actionHint:
        'Register a field-set entry for this template, or map it to an existing set.',
    });
    return;
  }
  for (const key of set.articleFields) {
    requireField(context.article, key, labelFor(key), findings);
  }
  for (const extra of set.extraChecks ?? []) {
    if (extra.predicate(context.article)) {
      findings.push({
        category: 'missing-required-field',
        severity: 'error',
        field: String(extra.key),
        message: extra.message,
        actionHint: extra.actionHint,
      });
    }
  }
}

function validateConditionalBlocks(
  context: PublishResolutionContext,
  findings: ValidationFinding[],
): void {
  const { article, template, teamMembers, media } = context;

  if (article.ShowTeamViewer !== false && template.ShowTeamViewer) {
    // The tenant `HB Article Team Members` schema has no
    // `IncludeInViewer` column — every authored row is visible.
    // A missing team is therefore a presence check on the child
    // list itself.
    if (teamMembers.length === 0) {
      findings.push({
        category: 'invalid-team-configuration',
        severity: 'error',
        field: 'teamMembers',
        message:
          'Team Viewer is enabled but no team members are authored on this article.',
        actionHint:
          'Add at least one team member, or turn off Show Team Viewer on the Content tab.',
      });
    }
  }

  if (template.ShowGallery) {
    const galleryImages = media.filter((r) => r.MediaRole === 'gallery');
    if (galleryImages.length === 0) {
      findings.push({
        category: 'invalid-gallery-configuration',
        severity: 'error',
        field: 'media',
        message: 'Gallery is enabled but no gallery-role media rows exist.',
        actionHint:
          'Add at least one gallery image on the Gallery tab, or turn off Show Gallery.',
      });
    }
  }
}

function validateShellCompatibility(
  template: PublisherTemplateRegistryRow,
  shell: PageShellManifest,
  findings: ValidationFinding[],
): void {
  if (template.ShowTeamViewer && !shell.controlsBySlot.team) {
    findings.push({
      category: 'invalid-shell-compatibility',
      severity: 'error',
      field: 'template.ShowTeamViewer',
      message: `Template requires the team block but shell '${shell.shellKey}' has no team slot.`,
      actionHint: 'Switch templates, or request a shell variant that exposes teamViewer.',
    });
  }
  if (template.ShowGallery && !shell.controlsBySlot.gallery) {
    findings.push({
      category: 'invalid-shell-compatibility',
      severity: 'error',
      field: 'template.ShowGallery',
      message: `Template requires the gallery block but shell '${shell.shellKey}' has no gallery slot.`,
      actionHint: 'Switch templates, or request a shell variant with a gallery zone.',
    });
  }
  if (
    template.HeroProfileKey === 'hbSignatureHero' &&
    shell.controlsBySlot.banner?.webPartType !== 'Custom'
  ) {
    findings.push({
      category: 'invalid-shell-compatibility',
      severity: 'warning',
      field: 'template.HeroProfileKey',
      message:
        'Template hero profile expects hbSignatureHero but current shell uses OOB Page Title. Banner will render with OOB treatment.',
      actionHint:
        'Swap to the approved hbSignatureHero shell variant, or change the banner renderer.',
    });
  }
}

function validateLengthHints(
  article: PublisherArticleRow,
  findings: ValidationFinding[],
): void {
  if (article.Title && article.Title.length > TITLE_MAX) {
    findings.push({
      category: 'missing-required-field',
      severity: 'warning',
      field: 'Title',
      message: `Title is ${article.Title.length} chars; recommended ≤ ${TITLE_MAX}.`,
      actionHint: 'Shorten the title for rollup / SEO fit.',
    });
  }
  if (article.Subhead && article.Subhead.length > SUBHEAD_MAX) {
    findings.push({
      category: 'missing-required-field',
      severity: 'warning',
      field: 'Subhead',
      message: `Subhead is ${article.Subhead.length} chars; recommended ≤ ${SUBHEAD_MAX}.`,
      actionHint: 'Tighten the subhead to keep banner treatment consistent.',
    });
  }
  if (article.SummaryExcerpt && article.SummaryExcerpt.length > SUMMARY_MAX) {
    findings.push({
      category: 'missing-required-field',
      severity: 'warning',
      field: 'SummaryExcerpt',
      message: `SummaryExcerpt is ${article.SummaryExcerpt.length} chars; recommended ≤ ${SUMMARY_MAX}.`,
      actionHint: 'Tighten the excerpt for rollup fit.',
    });
  }
}

function validateBindingDrift(
  context: PublishResolutionContext,
  shell: PageShellManifest,
  findings: ValidationFinding[],
): void {
  const binding = context.existingBinding;
  if (!binding) return;
  // Skip the warning when the binding has not yet recorded a shell
  // version (PageShellVersion is optional on the tenant
  // `HB Article Destination Pages` row); the next publish will
  // populate it.
  if (
    binding.PageShellVersion &&
    binding.PageShellVersion !== shell.shellVersion
  ) {
    findings.push({
      category: 'page-generation-blocker',
      severity: 'warning',
      field: 'existingBinding.PageShellVersion',
      message: `Shell version drift (${binding.PageShellVersion} → ${shell.shellVersion}); publishing will update the existing page in place (same PageId + PageUrl).`,
      actionHint:
        'Shell and render version drift always update in place. Only a PageTemplateKey change triggers regeneration (new PageId + PageUrl).',
    });
  }
}

/* ── Entry point ─────────────────────────────────────────────────── */

export function validatePublishContext(
  context: PublishResolutionContext,
  options: ValidatePublishContextOptions = {},
): ValidationResult {
  const shell = options.shell ?? PROJECT_SPOTLIGHT_V1_SHELL;
  const findings: ValidationFinding[] = [];

  validateGlobalRules(context, shell, findings);
  validateTemplateRequiredFieldSet(context, findings);
  validateConditionalBlocks(context, findings);
  validateShellCompatibility(context.template, shell, findings);
  validateLengthHints(context.article, findings);
  validateBindingDrift(context, shell, findings);

  const errors = findings.filter((f) => f.severity === 'error');
  const warnings = findings.filter((f) => f.severity === 'warning');
  const summary = emptyCategoryMap();
  for (const f of findings) summary[f.category] += 1;

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    summaryByCategory: summary,
  };
}
