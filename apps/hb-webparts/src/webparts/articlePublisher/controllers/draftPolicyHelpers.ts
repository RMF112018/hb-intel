/**
 * Pure helpers shared by `useDraftLifecycle` and by the public
 * Publisher API surface. Kept outside the shell so the controller
 * hook can import them without introducing a circular dependency;
 * the shell re-exports them for existing test imports.
 */
import {
  isDestinationSupported,
  selectPromotionPolicy,
  type Destination,
  type PromotionPolicyResult,
  type PublisherArticleRow,
  type PublisherPromotionRuleRow,
} from '../../../homepage/data/publisherAdapter/index.js';

export function nowIso(): string {
  return new Date().toISOString();
}

export interface PromotionPolicyApplyResult {
  readonly draft: PublisherArticleRow;
  readonly policy: PromotionPolicyResult;
}

export function applyPromotionPolicyToDraft(
  draft: PublisherArticleRow,
  rules: readonly PublisherPromotionRuleRow[],
  options?: { readonly enforceLockOnly?: boolean },
): PromotionPolicyApplyResult {
  const policy = selectPromotionPolicy(
    rules,
    draft.Destination,
    draft.ArticleContentType,
  );
  if (options?.enforceLockOnly && !policy.isLocked) {
    return { draft, policy };
  }
  return {
    draft: {
      ...draft,
      IsFeatured: policy.featured,
      IsPinned: policy.pinned,
    },
    policy,
  };
}

export function unsupportedDestinationNotice(
  destination: Destination,
): string | undefined {
  if (isDestinationSupported(destination)) {
    return undefined;
  }
  return (
    `Unsupported destination notice: '${destination}' is read-compatible only in this surface. ` +
    'Editing and publish actions are disabled here until that destination pipeline is implemented.'
  );
}

/**
 * Build a blank authoring draft for a brand-new article.
 *
 * `TemplateKey` starts blank in-memory and is system-resolved on save
 * from current discriminators (destination / content type / etc).
 * Persisted rows still carry a non-empty key, but ordinary authoring
 * does not treat a prior key as sticky override.
 */
export function emptyArticle(): PublisherArticleRow {
  const id = `art-${Date.now()}-${Math.floor(Math.random() * 1e6)
    .toString(36)
    .padStart(4, '0')}`;
  return {
    ArticleId: id,
    Title: 'Untitled article',
    ArticleContentType: 'monthlySpotlight',
    Destination: 'projectSpotlight',
    Slug: '',
    TemplateKey: '',
    WorkflowState: 'draft',
    Subhead: '',
    SummaryExcerpt: '',
    BodyRichText: '',
    HeroPrimaryImage: '',
    HeroPrimaryImageAltText: '',
    CreatedDateUtc: nowIso(),
    UpdatedDateUtc: nowIso(),
    TargetSiteUrl: undefined,
    IsFeatured: false,
    IsPinned: false,
  };
}
