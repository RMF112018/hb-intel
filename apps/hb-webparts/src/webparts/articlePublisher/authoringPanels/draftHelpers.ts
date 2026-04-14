/**
 * Shared helpers for authoring panels.
 *
 * `update` is the typed field setter every panel uses to produce the
 * next draft. `contentTypeOptionsForDraft` and `milestoneLegacyNotice`
 * keep the legacy `milestoneSpotlight` visible only when the current
 * draft is already that type (read-compatible only). `resolveTemplateKeySystemManaged`
 * resolves the system-managed template from the draft discriminators.
 */
import {
  ARTICLE_CONTENT_TYPE_OPERATIONAL_VALUES,
  resolveTemplateSystemManaged,
  type ArticleContentType,
  type PublisherArticleRow,
} from '../../../homepage/data/publisherAdapter/index.js';

export interface PanelProps {
  readonly draft: PublisherArticleRow;
  readonly onChange: (next: PublisherArticleRow) => void;
}

export function update<T extends keyof PublisherArticleRow>(
  draft: PublisherArticleRow,
  key: T,
  value: PublisherArticleRow[T],
): PublisherArticleRow {
  return { ...draft, [key]: value };
}

export function resolveTemplateKeySystemManaged(
  article: Pick<
    PublisherArticleRow,
    | 'ArticleContentType'
    | 'Destination'
    | 'SpotlightType'
    | 'ProjectStage'
    | 'ArticleSubject'
  >,
  registry: Parameters<typeof resolveTemplateSystemManaged>[1],
) {
  return resolveTemplateSystemManaged(
    {
      ArticleContentType: article.ArticleContentType,
      Destination: article.Destination,
      SpotlightType: article.SpotlightType,
      ProjectStage: article.ProjectStage,
      ArticleSubject: article.ArticleSubject,
    },
    registry,
  );
}

export function contentTypeOptionsForDraft(
  articleContentType: ArticleContentType,
): readonly ArticleContentType[] {
  return articleContentType === 'milestoneSpotlight'
    ? [...ARTICLE_CONTENT_TYPE_OPERATIONAL_VALUES, 'milestoneSpotlight']
    : ARTICLE_CONTENT_TYPE_OPERATIONAL_VALUES;
}

export function milestoneLegacyNotice(
  articleContentType: ArticleContentType,
): string | undefined {
  if (articleContentType !== 'milestoneSpotlight') {
    return undefined;
  }
  return (
    'Legacy content-type notice: `milestoneSpotlight` is read-compatible only ' +
    '(no live milestone executor). Move to an operational content type before publish.'
  );
}
