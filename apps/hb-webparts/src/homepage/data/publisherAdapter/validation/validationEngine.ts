/**
 * Template-aware validation engine for the Project Spotlight publisher.
 *
 * Pure. Consumes a `PublishResolutionContext` plus the active
 * `PageShellManifest` and returns a typed `ValidationResult`. Every
 * finding carries one of the categories enumerated in architecture
 * doc 08 §"Validation error categories" so downstream surfaces
 * (authoring UI, orchestrator guardrail) can filter without string
 * matching.
 *
 * Authority: docs/architecture/plans/MASTER/spfx/publisher/
 *   architecture/08-Validation-Rules-by-Template.md
 *
 * The engine runs:
 *   1. Global rules (arch doc 08 §1–§16).
 *   2. Template-profile-specific required fields (arch doc 08 §§A,B,C)
 *      routed by `Template.RequiredFieldSetKey`.
 *   3. Conditional rules (ShowTeamViewer / ShowGallery).
 *   4. Shell-compatibility rules.
 *   5. Length-recommendation warnings.
 *   6. Page-generation / binding drift warnings.
 *
 * Unknown `RequiredFieldSetKey` values are tolerated with an
 * `invalid-template-match` *warning* so a misconfigured registry
 * doesn't silently drop author-facing validation guidance.
 */

import type { PublishResolutionContext } from '../publishResolutionContext';
import type { PublisherPostRow, PublisherTemplateRegistryRow } from '../publisherContracts';
import {
  PROJECT_SPOTLIGHT_V1_SHELL,
  type PageShellManifest,
} from '../pageGeneration/xmlShellManifest';

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

const PROJECT_SPOTLIGHT_HOST = 'sites/ProjectSpotlight';

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

function requireField(
  post: PublisherPostRow,
  key: keyof PublisherPostRow,
  label: string,
  findings: ValidationFinding[],
): void {
  if (!str(post[key] as unknown)) {
    findings.push({
      category: 'missing-required-field',
      severity: 'error',
      field: String(key),
      message: `${label} is required.`,
      actionHint: `Fill in "${label}" on the post record.`,
    });
  }
}

/* ── Template-profile required-field sets ─────────────────────────── */

interface TemplateRequiredFieldSet {
  readonly postFields: readonly (keyof PublisherPostRow)[];
  /** Extra keys that aren't fields on PublisherPostRow (checked separately). */
  readonly extraChecks?: readonly {
    readonly key: string;
    readonly predicate: (post: PublisherPostRow) => boolean;
    readonly message: string;
    readonly actionHint: string;
  }[];
}

const MONTHLY_REQUIRED: TemplateRequiredFieldSet = {
  postFields: [
    'ProjectId',
    'ProjectName',
    'ProjectStage',
    'Title',
    'Subhead',
    'SummaryExcerpt',
    'Slug',
    'BannerImageUrl',
    'BannerImageAltText',
    'BodyRichText',
  ],
};

const MILESTONE_REQUIRED: TemplateRequiredFieldSet = {
  postFields: [
    'ProjectId',
    'ProjectName',
    'Title',
    'Subhead',
    'SummaryExcerpt',
    'Slug',
    'BannerImageUrl',
    'BannerImageAltText',
    'BodyRichText',
  ],
  extraChecks: [
    {
      key: 'MilestoneLabel',
      predicate: (post) =>
        !str((post as unknown as Record<string, unknown>)['MilestoneLabel']),
      message: 'MilestoneLabel is required for milestone spotlights.',
      actionHint:
        'Add a milestone label (e.g. "Topping out", "Substantial completion").',
    },
    {
      key: 'MilestoneDateUtc',
      predicate: (post) =>
        !str((post as unknown as Record<string, unknown>)['MilestoneDateUtc']),
      message: 'MilestoneDateUtc is required for milestone spotlights.',
      actionHint: 'Pick the milestone date.',
    },
  ],
};

const PROJECT_UPDATE_REQUIRED: TemplateRequiredFieldSet = {
  postFields: [
    'ProjectId',
    'ProjectName',
    'Title',
    'Subhead',
    'SummaryExcerpt',
    'Slug',
    'BannerImageUrl',
    'BannerImageAltText',
    'BodyRichText',
  ],
};

const REQUIRED_FIELD_SETS: Readonly<Record<string, TemplateRequiredFieldSet>> = {
  'req-ps-inprogress-monthly-v1': MONTHLY_REQUIRED,
  'req-ps-inprogress-milestone-v1': MILESTONE_REQUIRED,
  'req-ps-inprogress-project-update-v1': PROJECT_UPDATE_REQUIRED,
};

function labelFor(key: keyof PublisherPostRow): string {
  return String(key);
}

/* ── Per-rule validators ──────────────────────────────────────────── */

function validateGlobalRules(
  context: PublishResolutionContext,
  shell: PageShellManifest,
  findings: ValidationFinding[],
): void {
  const { post } = context;

  // Rule 1
  if (!str(post.PostId)) {
    findings.push({
      category: 'missing-required-field',
      severity: 'error',
      field: 'PostId',
      message: 'PostId is required.',
      actionHint: 'PostId is assigned by the authoring surface; reload the post.',
    });
  }

  // Rule 2
  if (post.TargetSiteKey !== 'projectSpotlight') {
    findings.push({
      category: 'invalid-template-match',
      severity: 'error',
      field: 'TargetSiteKey',
      message: `TargetSiteKey must be 'projectSpotlight' (found '${post.TargetSiteKey}').`,
      actionHint:
        'Project Spotlight is the only approved destination for the v1 publisher.',
    });
  }

  // Rule 3
  if (!post.TargetSiteUrl || !post.TargetSiteUrl.includes(PROJECT_SPOTLIGHT_HOST)) {
    findings.push({
      category: 'invalid-template-match',
      severity: 'error',
      field: 'TargetSiteUrl',
      message: `TargetSiteUrl must point at the Project Spotlight site (found '${post.TargetSiteUrl}').`,
      actionHint: 'Restore the default Project Spotlight site URL.',
    });
  }

  // Rule 4
  if (!str(post.PostFamily)) {
    findings.push({
      category: 'missing-required-field',
      severity: 'error',
      field: 'PostFamily',
      message: 'PostFamily is required.',
      actionHint: 'Pick a post family on the Metadata tab.',
    });
  }

  // Rule 5 / 6 — resolver already picked these; check they still line up.
  if (!str(post.TemplateKey)) {
    findings.push({
      category: 'missing-required-field',
      severity: 'error',
      field: 'TemplateKey',
      message: 'TemplateKey is required.',
      actionHint: 'Save the post once so the resolver can assign a template.',
    });
  } else if (context.template.TemplateStatus !== 'active') {
    findings.push({
      category: 'invalid-template-match',
      severity: 'error',
      field: 'TemplateKey',
      message: `Template '${context.template.TemplateKey}' is not active (status=${context.template.TemplateStatus}).`,
      actionHint: 'Select an active template or request the registry be updated.',
    });
  }
  if (!str(post.PageShellKey)) {
    findings.push({
      category: 'missing-required-field',
      severity: 'error',
      field: 'PageShellKey',
      message: 'PageShellKey is required.',
      actionHint: 'Save the post once so the resolver can assign a shell.',
    });
  }

  // Rule 7
  if (!str(post.SourceTemplatePath)) {
    findings.push({
      category: 'missing-required-field',
      severity: 'error',
      field: 'SourceTemplatePath',
      message: 'SourceTemplatePath is required.',
      actionHint: 'Restore the default XML template path.',
    });
  }

  // Rule 8
  if (!str(post.Title)) {
    findings.push({
      category: 'missing-required-field',
      severity: 'error',
      field: 'Title',
      message: 'Title is required.',
      actionHint: 'Give the post a title on the Metadata tab.',
    });
  }

  // Rules 9 + 10 — Subhead / Body required when the shell exposes those slots.
  const hasSubheadSlot = !!shell.controlsBySlot.subhead;
  const hasBodySlot = !!shell.controlsBySlot.body;
  if (hasSubheadSlot && !str(post.Subhead)) {
    findings.push({
      category: 'missing-required-field',
      severity: 'error',
      field: 'Subhead',
      message: 'Subhead is required for this shell.',
      actionHint: 'Fill the Subhead field on the Content tab.',
    });
  }
  if (hasBodySlot && !str(post.BodyRichText)) {
    findings.push({
      category: 'missing-required-field',
      severity: 'error',
      field: 'BodyRichText',
      message: 'Body is required for this shell.',
      actionHint: 'Write the post body on the Content tab.',
    });
  }

  // Rule 11 — Slug required; uniqueness is a hosted concern.
  if (!str(post.Slug)) {
    findings.push({
      category: 'invalid-slug',
      severity: 'error',
      field: 'Slug',
      message: 'Slug is required.',
      actionHint: 'Enter a URL-safe slug on the Metadata tab.',
    });
  } else {
    findings.push({
      category: 'invalid-slug',
      severity: 'warning',
      field: 'Slug',
      message: 'Slug uniqueness within Project Spotlight has not been verified in this session.',
      actionHint: 'Hosted verification (Wave 9) confirms uniqueness.',
    });
  }

  // Rule 12 — banner image required when banner slot is present.
  const hasBannerSlot = !!shell.controlsBySlot.banner;
  if (hasBannerSlot && !str(post.BannerImageUrl)) {
    findings.push({
      category: 'missing-required-field',
      severity: 'error',
      field: 'BannerImageUrl',
      message: 'BannerImageUrl is required for the current shell.',
      actionHint: 'Add a banner image URL on the Banner tab.',
    });
  }

  // Rule 13 — alt text when banner image exists.
  if (str(post.BannerImageUrl) && !str(post.BannerImageAltText)) {
    findings.push({
      category: 'invalid-image-accessibility',
      severity: 'error',
      field: 'BannerImageAltText',
      message: 'BannerImageAltText is required whenever a banner image is set.',
      actionHint: 'Provide alt text describing the banner image.',
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
  if (context.existingBinding?.BindingStatus === 'error') {
    findings.push({
      category: 'page-generation-blocker',
      severity: 'warning',
      field: 'existingBinding.BindingStatus',
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
  for (const key of set.postFields) {
    requireField(context.post, key, labelFor(key), findings);
  }
  for (const extra of set.extraChecks ?? []) {
    if (extra.predicate(context.post)) {
      findings.push({
        category: 'missing-required-field',
        severity: 'error',
        field: extra.key,
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
  const { post, template, teamMembers, media } = context;

  if (post.ShowTeamViewer !== false && template.ShowTeamBlock) {
    const includedTeam = teamMembers.filter((r) => r.IncludeInViewer !== false);
    if (includedTeam.length === 0) {
      findings.push({
        category: 'invalid-team-configuration',
        severity: 'error',
        field: 'teamMembers',
        message:
          'Team Viewer is enabled but no team members are marked IncludeInViewer.',
        actionHint:
          'Add at least one team member, or turn off Show Team Viewer on the Content tab.',
      });
    }
  }

  if (post.ShowGallery !== false && template.ShowGalleryBlock) {
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
  if (template.ShowTeamBlock && !shell.controlsBySlot.team) {
    findings.push({
      category: 'invalid-shell-compatibility',
      severity: 'error',
      field: 'template.ShowTeamBlock',
      message: `Template requires the team block but shell '${shell.shellKey}' has no team slot.`,
      actionHint: 'Switch templates, or request a shell variant that exposes teamViewer.',
    });
  }
  if (template.ShowGalleryBlock && !shell.controlsBySlot.gallery) {
    findings.push({
      category: 'invalid-shell-compatibility',
      severity: 'error',
      field: 'template.ShowGalleryBlock',
      message: `Template requires the gallery block but shell '${shell.shellKey}' has no gallery slot.`,
      actionHint: 'Switch templates, or request a shell variant with a gallery zone.',
    });
  }
  if (
    template.BannerRendererKind === 'hbSignatureHero' &&
    shell.controlsBySlot.banner?.webPartType !== 'Custom'
  ) {
    findings.push({
      category: 'invalid-shell-compatibility',
      severity: 'warning',
      field: 'template.BannerRendererKind',
      message:
        'Template expects hbSignatureHero but current shell uses OOB Page Title. Banner will render with OOB treatment.',
      actionHint:
        'Swap to the approved hbSignatureHero shell variant, or change the banner renderer.',
    });
  }
}

function validateLengthHints(
  post: PublisherPostRow,
  findings: ValidationFinding[],
): void {
  if (post.Title && post.Title.length > TITLE_MAX) {
    findings.push({
      category: 'missing-required-field',
      severity: 'warning',
      field: 'Title',
      message: `Title is ${post.Title.length} chars; recommended ≤ ${TITLE_MAX}.`,
      actionHint: 'Shorten the title for rollup / SEO fit.',
    });
  }
  if (post.Subhead && post.Subhead.length > SUBHEAD_MAX) {
    findings.push({
      category: 'missing-required-field',
      severity: 'warning',
      field: 'Subhead',
      message: `Subhead is ${post.Subhead.length} chars; recommended ≤ ${SUBHEAD_MAX}.`,
      actionHint: 'Tighten the subhead to keep banner treatment consistent.',
    });
  }
  if (post.SummaryExcerpt && post.SummaryExcerpt.length > SUMMARY_MAX) {
    findings.push({
      category: 'missing-required-field',
      severity: 'warning',
      field: 'SummaryExcerpt',
      message: `SummaryExcerpt is ${post.SummaryExcerpt.length} chars; recommended ≤ ${SUMMARY_MAX}.`,
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
  if (
    binding.PageShellVersion !== shell.shellVersion &&
    context.template.ForceRegenerationOnShellChange
  ) {
    findings.push({
      category: 'page-generation-blocker',
      severity: 'warning',
      field: 'existingBinding.PageShellVersion',
      message: `Shell version drift (${binding.PageShellVersion} → ${shell.shellVersion}); template forces regeneration on shell change.`,
      actionHint:
        'Publishing will create a new page and write a fresh binding row. Expected; plan accordingly.',
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
  validateLengthHints(context.post, findings);
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
