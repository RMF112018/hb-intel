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

export type ResolutionReadSeam =
  | 'articles'
  | 'templateRegistry'
  | 'teamMembers'
  | 'media'
  | 'pageBindings';

export type BuildResolutionContextResult =
  | { readonly ok: true; readonly context: PublishResolutionContext }
  | {
      readonly ok: false;
      readonly reason: 'articleNotFound' | 'templateResolutionFailed';
      readonly message: string;
      readonly templateResolution?: Extract<
        TemplateResolutionResult,
        { ok: false }
      >;
    }
  | {
      readonly ok: false;
      readonly reason: 'repositoryReadFailed';
      readonly failedRead: ResolutionReadSeam;
      readonly message: string;
      readonly cause?: unknown;
    };

function extractMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string' && err) return err;
  try {
    return JSON.stringify(err);
  } catch {
    return 'unknown error';
  }
}

async function safeRead<T>(
  seam: ResolutionReadSeam,
  read: () => Promise<T>,
): Promise<
  | { readonly ok: true; readonly value: T }
  | Extract<BuildResolutionContextResult, { reason: 'repositoryReadFailed' }>
> {
  try {
    const value = await read();
    return { ok: true, value };
  } catch (err) {
    return {
      ok: false,
      reason: 'repositoryReadFailed',
      failedRead: seam,
      message: `Resolution read '${seam}' failed: ${extractMessage(err)}`,
      cause: err,
    };
  }
}

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
  const articleRead = await safeRead('articles', () =>
    repositories.articles.getByArticleId(articleId),
  );
  if (!articleRead.ok) return articleRead;
  const article = articleRead.value;
  if (!article) {
    return {
      ok: false,
      reason: 'articleNotFound',
      message: `No HB Articles record found for ArticleId '${articleId}'.`,
    };
  }

  const registryRead = await safeRead('templateRegistry', () =>
    repositories.templateRegistry.listActive(),
  );
  if (!registryRead.ok) return registryRead;
  const registry = registryRead.value;

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

  const [teamMembersRead, mediaRead, existingBindingRead] = await Promise.all([
    safeRead('teamMembers', () => repositories.teamMembers.listByArticle(articleId)),
    safeRead('media', () => repositories.media.listByArticle(articleId)),
    safeRead('pageBindings', () => repositories.pageBindings.getByArticleId(articleId)),
  ]);
  if (!teamMembersRead.ok) return teamMembersRead;
  if (!mediaRead.ok) return mediaRead;
  if (!existingBindingRead.ok) return existingBindingRead;

  return {
    ok: true,
    context: {
      article,
      template: resolution.entry,
      teamMembers: teamMembersRead.value,
      media: mediaRead.value,
      existingBinding: existingBindingRead.value,
      decisionTrace: resolution.trace,
    },
  };
}
