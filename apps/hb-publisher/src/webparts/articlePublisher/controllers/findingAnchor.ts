/**
 * Pure mapping from a `ValidationFinding.field` dotted path to the
 * workspace section anchor id + human label the author should jump
 * to when fixing the issue.
 *
 * Kept in the controllers layer (not inside the shell component) so
 * the mapping is a single testable seam, and so both the readiness
 * rail and — in future — the preview trust-bridge can route from a
 * finding to the correct authoring section without duplicating the
 * heuristic.
 */

export interface FindingAnchor {
  /** DOM id of the canvas section (matches `section-<id>` in the shell). */
  readonly sectionId: string;
  /** Author-facing section label for the link text. */
  readonly label: string;
}

const IDENTITY: FindingAnchor = { sectionId: 'section-identity', label: 'Identity' };
const HERO: FindingAnchor = { sectionId: 'section-hero', label: 'Hero' };
const STORY: FindingAnchor = { sectionId: 'section-story', label: 'Story' };
const MEDIA: FindingAnchor = { sectionId: 'section-media', label: 'Media' };
const TEAM: FindingAnchor = { sectionId: 'section-team', label: 'Team' };
const PROMOTION: FindingAnchor = { sectionId: 'section-promotion', label: 'Promotion' };
const DESTINATION: FindingAnchor = {
  sectionId: 'section-destination',
  label: 'Destination binding',
};

/**
 * Return the section anchor for a validation finding's field path,
 * or undefined when the field does not map to an authoring section.
 *
 * Designed to degrade silently: unknown fields simply render without
 * a "Go to" link rather than routing the author to a wrong section.
 */
export function sectionAnchorForFindingField(
  field: string | undefined,
): FindingAnchor | undefined {
  if (!field) return undefined;
  const head = field.split(/[.[]/, 1)[0] ?? '';
  switch (head) {
    case 'Title':
    case 'Subhead':
    case 'Slug':
    case 'Destination':
    case 'ArticleContentType':
    case 'TemplateKey':
    case 'TargetSiteUrl':
    case 'ArticleId':
    case 'SummaryExcerpt':
      return IDENTITY;
    case 'HeroPrimaryImage':
    case 'HeroPrimaryImageAltText':
    case 'HeroEyebrow':
    case 'HeroCategoryLabel':
    case 'HeroTitle':
    case 'HeroSubhead':
      return HERO;
    case 'BodyRichText':
    case 'BodyIntro':
    case 'BodyClosing':
    case 'PullQuote':
    case 'CalloutText':
      return STORY;
    case 'media':
    case 'SecondaryImage':
    case 'SecondaryImageAltText':
      return MEDIA;
    case 'team':
    case 'teamMembers':
    case 'TeamViewerTitle':
      return TEAM;
    case 'IsFeatured':
    case 'IsPinned':
    case 'PromotionRule':
      return PROMOTION;
    case 'PageTemplateKey':
    case 'PageShellVersion':
    case 'RenderVersion':
      return DESTINATION;
    default:
      return undefined;
  }
}
