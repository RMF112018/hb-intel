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
  PublisherMediaRow,
  PublisherPageBindingRow,
  PublisherPostRow,
  PublisherTeamMemberRow,
  PublisherTemplateRegistryRow,
} from './publisherContracts';
import type { PublisherRepositories } from './publisherRepositories';
import {
  resolveTemplate,
  type TemplateResolutionResult,
  type TemplateResolutionTrace,
} from './templateResolver';

export interface PublishResolutionContext {
  readonly post: PublisherPostRow;
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
        | 'postNotFound'
        | 'templateResolutionFailed';
      readonly message: string;
      readonly templateResolution?: Extract<
        TemplateResolutionResult,
        { ok: false }
      >;
    };

/**
 * Build the shared resolution context for a given post. Fetches the post,
 * loads its team members + media, loads any existing binding, then runs
 * the deterministic template resolver. All reads go through the injected
 * repositories so this function stays testable.
 */
export async function buildPublishResolutionContext(
  repositories: PublisherRepositories,
  postId: string,
): Promise<BuildResolutionContextResult> {
  const post = await repositories.posts.getByPostId(postId);
  if (!post) {
    return {
      ok: false,
      reason: 'postNotFound',
      message: `No publisher post found for PostId '${postId}'.`,
    };
  }

  const registry = await repositories.templateRegistry.listActive();
  const resolution = resolveTemplate(
    {
      TemplateKey: post.TemplateKey,
      PostFamily: post.PostFamily,
      SpotlightType: post.SpotlightType,
      ProjectStage: post.ProjectStage,
      ArticleSubject: post.ArticleSubject,
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
    repositories.teamMembers.listByPost(postId),
    repositories.media.listByPost(postId),
    repositories.pageBindings.getByPostId(postId),
  ]);

  return {
    ok: true,
    context: {
      post,
      template: resolution.entry,
      teamMembers,
      media,
      existingBinding,
      decisionTrace: resolution.trace,
    },
  };
}
