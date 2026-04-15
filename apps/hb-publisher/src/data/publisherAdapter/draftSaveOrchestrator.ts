/**
 * Draft save orchestration for authoring.
 *
 * Sequences the three writes that a draft save touches:
 *   1. master `HB Articles` row (`repositories.articles.upsert`)
 *   2. team-member keyed sync (`repositories.teamMembers.replaceAllForArticle`)
 *   3. media keyed sync (`repositories.media.replaceAllForArticle`)
 *
 * Previously this sequencing lived inside the SPFx controller
 * (`useDraftLifecycle.handleSave`), which meant a partial failure
 * (e.g. master upsert succeeded, team write threw) was surfaced as a
 * generic "Couldn't save" error even though real list writes had
 * already committed to SharePoint. That left local draft state and
 * server state silently out of sync.
 *
 * This service owns that sequencing and returns a typed
 * `DraftSaveOutcome` that states exactly what persisted and at which
 * stage the pipeline failed. The controller uses the outcome to render
 * a truthful status message and to decide how to reconcile local
 * state after a partial persistence.
 *
 * Keyed-sync behavior of `publisherWriters.ts` for team members and
 * media is preserved — this seam only wraps the three existing
 * repository calls.
 */

import type {
  PublisherArticleRow,
  PublisherMediaRow,
  PublisherTeamMemberRow,
} from './publisherContracts';
import type { PublisherRepositories } from './publisherRepositories';

export type DraftSaveStage =
  | 'articleUpsert'
  | 'teamMembersWrite'
  | 'mediaWrite';

export interface DraftSavePersistenceState {
  readonly article: boolean;
  readonly teamMembers: boolean;
  readonly media: boolean;
}

export type DraftSaveOutcome =
  | {
      readonly ok: true;
      readonly article: PublisherArticleRow;
      readonly persisted: DraftSavePersistenceState;
    }
  | {
      readonly ok: false;
      readonly stage: DraftSaveStage;
      readonly message: string;
      readonly persisted: DraftSavePersistenceState;
      /**
       * Populated when the master row was already committed before the
       * failing stage. Callers should treat this as the authoritative
       * master truth and reconcile local draft state accordingly.
       */
      readonly article?: PublisherArticleRow;
      readonly cause?: unknown;
    };

export interface DraftSaveRequest {
  readonly article: PublisherArticleRow;
  readonly teamMembers: readonly PublisherTeamMemberRow[];
  readonly media: readonly PublisherMediaRow[];
}

export interface DraftSaveOrchestrator {
  save(req: DraftSaveRequest): Promise<DraftSaveOutcome>;
}

function extractMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string' && err) return err;
  try {
    return JSON.stringify(err);
  } catch {
    return 'unknown error';
  }
}

/**
 * Build a draft-save orchestrator bound to a specific set of
 * repositories. The resulting orchestrator is pure with respect to
 * the UI — it never reads controller state or calls status helpers.
 */
export function createDraftSaveOrchestrator(
  repositories: PublisherRepositories,
): DraftSaveOrchestrator {
  async function save(req: DraftSaveRequest): Promise<DraftSaveOutcome> {
    const persisted: {
      article: boolean;
      teamMembers: boolean;
      media: boolean;
    } = { article: false, teamMembers: false, media: false };

    try {
      await repositories.articles.upsert(req.article);
      persisted.article = true;
    } catch (err) {
      return {
        ok: false,
        stage: 'articleUpsert',
        message: `Master article save failed: ${extractMessage(err)}.`,
        persisted: { ...persisted },
        cause: err,
      };
    }

    try {
      await repositories.teamMembers.replaceAllForArticle(
        req.article.ArticleId,
        req.teamMembers,
      );
      persisted.teamMembers = true;
    } catch (err) {
      return {
        ok: false,
        stage: 'teamMembersWrite',
        message: `Team-member sync failed after the master article was saved: ${extractMessage(err)}.`,
        persisted: { ...persisted },
        article: req.article,
        cause: err,
      };
    }

    try {
      await repositories.media.replaceAllForArticle(
        req.article.ArticleId,
        req.media,
      );
      persisted.media = true;
    } catch (err) {
      return {
        ok: false,
        stage: 'mediaWrite',
        message: `Media sync failed after the master article and team were saved: ${extractMessage(err)}.`,
        persisted: { ...persisted },
        article: req.article,
        cause: err,
      };
    }

    return {
      ok: true,
      article: req.article,
      persisted: { ...persisted },
    };
  }

  return { save };
}
