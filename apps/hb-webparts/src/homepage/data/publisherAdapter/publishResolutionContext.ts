/**
 * Shared preview/publish resolution context.
 *
 * A single deterministic shape that both preview and publish pipelines
 * consume. Building it is the service-layer responsibility: resolve the
 * template, load child records, load any existing binding, and expose a
 * decision trace for governance + debugging.
 *
 * Operating-charter rule 8: preview and publish must use the same
 * resolution pipeline. Building both surfaces on this context enforces
 * that constraint.
 */

import type {
  PublisherArticleRow,
  PublisherMediaRow,
  PublisherPageBindingRow,
  PublisherTeamMemberRow,
  PublisherTemplateRegistryRow,
} from './publisherContracts';
import type { PublisherRepositories } from './publisherRepositories';
import {
  resolveTemplateSystemManaged,
  type TemplateResolutionResult,
  type TemplateResolutionTrace,
} from './templateResolver';

export interface PublishResolutionContext {
  readonly article: PublisherArticleRow;
  readonly template: PublisherTemplateRegistryRow;
  readonly teamMembers: readonly PublisherTeamMemberRow[];
  readonly media: readonly PublisherMediaRow[];
  readonly existingBinding: PublisherPageBindingRow | undefined;
  readonly decisionTrace: TemplateResolutionTrace;
}

export type BuildResolutionContextResult =
  | { readonly ok: true; readonly context: PublishResolutionContext }
  | {
      readonly ok: false;
      readonly reason:
        | 'articleNotFound'
        | 'templateResolutionFailed';
      readonly message: string;
      readonly templateResolution?: Extract<
        TemplateResolutionResult,
        { ok: false }
      >;
    };

/**
 * Build the shared resolution context for a given article. Fetches the
 * article, loads its team members + media, loads any existing binding,
 * then runs the deterministic template resolver. All reads go through
 * the injected repositories so this function stays testable.
 */
export async function buildPublishResolutionContext(
  repositories: PublisherRepositories,
  articleId: string,
): Promise<BuildResolutionContextResult> {
  const article = await repositories.articles.getByArticleId(articleId);
  if (!article) {
    return {
      ok: false,
      reason: 'articleNotFound',
      message: `No HB Articles record found for ArticleId '${articleId}'.`,
    };
  }

  const registry = await repositories.templateRegistry.listActive();
  const resolution = resolveTemplateSystemManaged(
    {
      ArticleContentType: article.ArticleContentType,
      Destination: article.Destination,
      SpotlightType: article.SpotlightType,
      ProjectStage: article.ProjectStage,
      ArticleSubject: article.ArticleSubject,
    },
    registry,
  );

  if (!resolution.ok) {
    return {
      ok: false,
      reason: 'templateResolutionFailed',
      message: resolution.message,
      templateResolution: resolution,
    };
  }

  const [teamMembers, media, existingBinding] = await Promise.all([
    repositories.teamMembers.listByArticle(articleId),
    repositories.media.listByArticle(articleId),
    repositories.pageBindings.getByArticleId(articleId),
  ]);

  return {
    ok: true,
    context: {
      article,
      template: resolution.entry,
      teamMembers,
      media,
      existingBinding,
      decisionTrace: resolution.trace,
    },
  };
}
