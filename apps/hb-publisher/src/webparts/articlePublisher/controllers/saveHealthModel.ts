/**
 * Phase-11 Prompt-01 — truthful first-persistence save-health model.
 *
 * The publisher shell previously gated **Save draft** on a shallow
 * boolean expression (`!!articleDraft && !busy && !unsupportedDestination`).
 * That invited operators to attempt first persistence into the
 * tenant-required `HB Articles` master list before the row was
 * plausibly valid, producing opaque server rejections and misleading
 * UX drift between what the shell advertises and what SharePoint
 * will actually accept.
 *
 * This module models save readiness as an explicit, typed state so
 * the shell can (a) gate the button truthfully, (b) tell the author
 * *what* is missing in repo-truth terms, and (c) keep later save
 * behavior honest (subsequent saves, including partial-persistence
 * recovery, are not re-gated by first-persistence checks).
 *
 * Authority: the first-persistence required-field set mirrors the
 * monthly / project-update MVP profiles in
 * `data/publisherAdapter/validation/validationEngine.ts` and the
 * tenant schema report under
 * `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`.
 *
 * Pure. No React, no I/O.
 */
import type { PublisherArticleRow } from '../../../data/publisherAdapter/index.js';
import { isRichBodyEmpty } from '../../../data/publisherAdapter/validation/validationEngine.js';

/**
 * The title assigned by `emptyArticle()` when the author creates a
 * brand-new draft. Treated as "not yet titled" by the first-persistence
 * gate so the shell never lets an operator commit a literal
 * "Untitled article" row into the master list.
 */
export const DEFAULT_NEW_DRAFT_TITLE = 'Untitled article';

export type SaveBlockFieldKey =
  | 'Title'
  | 'ProjectBinding'
  | 'Subhead'
  | 'SummaryExcerpt'
  | 'BodyRichText'
  | 'HeroPrimaryImage'
  | 'HeroPrimaryImageAltText';

export interface SaveBlockField {
  readonly field: SaveBlockFieldKey;
  readonly label: string;
  readonly message: string;
  readonly actionHint: string;
}

export type SaveHealth =
  | { readonly kind: 'noDraft' }
  | { readonly kind: 'busy' }
  | { readonly kind: 'unsupportedDestination'; readonly message: string }
  | { readonly kind: 'unsupportedContentType'; readonly message: string }
  | {
      readonly kind: 'missingFirstPersistenceFields';
      readonly missing: readonly SaveBlockField[];
    }
  | { readonly kind: 'readyFirstPersistence' }
  | { readonly kind: 'readySubsequentPersistence' };

export interface DeriveSaveHealthInputs {
  readonly articleDraft: PublisherArticleRow | undefined;
  readonly busy: boolean;
  readonly unsupportedDestinationMessage: string | undefined;
  readonly unsupportedContentTypeMessage: string | undefined;
  /**
   * Whether the master row for this draft has committed to the list
   * at least once (either loaded from the server, or successfully
   * upserted by a prior save). Subsequent saves bypass the
   * first-persistence field gate so partial-persistence recovery and
   * normal editing stay uninterrupted.
   */
  readonly isPersisted: boolean;
}

function isBlank(value: string | undefined | null): boolean {
  return typeof value !== 'string' || value.trim().length === 0;
}

/**
 * Compute the ordered list of first-persistence fields that are not
 * yet satisfied for a brand-new (never-persisted) draft. Mirrors the
 * tenant `HB Articles` MVP required-field set used by
 * `validationEngine.ts` for Project Spotlight monthly / project-update
 * templates.
 */
export function missingFirstPersistenceFields(
  draft: PublisherArticleRow,
): readonly SaveBlockField[] {
  const missing: SaveBlockField[] = [];

  if (isBlank(draft.Title) || draft.Title.trim() === DEFAULT_NEW_DRAFT_TITLE) {
    missing.push({
      field: 'Title',
      label: 'Title',
      message: 'Give the article a real title before the first save.',
      actionHint: 'Replace “Untitled article” in the Identity section.',
    });
  }

  if (isBlank(draft.ProjectId) || isBlank(draft.ProjectName)) {
    missing.push({
      field: 'ProjectBinding',
      label: 'Project',
      message: 'Bind this article to a project before the first save.',
      actionHint: 'Pick the project in the Identity section.',
    });
  }

  if (isBlank(draft.Subhead)) {
    missing.push({
      field: 'Subhead',
      label: 'Subhead',
      message: 'Subhead is required by the Project Spotlight master record.',
      actionHint: 'Write a subhead in the Hero section.',
    });
  }

  if (isBlank(draft.SummaryExcerpt)) {
    missing.push({
      field: 'SummaryExcerpt',
      label: 'Summary excerpt',
      message: 'Summary excerpt is required by the Project Spotlight master record.',
      actionHint: 'Write a rollup summary in the Hero section.',
    });
  }

  if (isRichBodyEmpty(draft.BodyRichText)) {
    missing.push({
      field: 'BodyRichText',
      label: 'Story body',
      message: 'Story body cannot be empty on a first save.',
      actionHint: 'Compose the article body in the Story section.',
    });
  }

  if (isBlank(draft.HeroPrimaryImage)) {
    missing.push({
      field: 'HeroPrimaryImage',
      label: 'Hero image',
      message: 'A hero image URL is required by the Project Spotlight master record.',
      actionHint: 'Add the hero image in the Hero section.',
    });
  } else if (isBlank(draft.HeroPrimaryImageAltText)) {
    missing.push({
      field: 'HeroPrimaryImageAltText',
      label: 'Hero alt text',
      message: 'Alt text is required whenever a hero image is set.',
      actionHint: 'Describe the hero image in the Hero section.',
    });
  }

  return missing;
}

/**
 * Priority order (first match wins):
 *   1. no draft
 *   2. busy (in-flight save/publish)
 *   3. unsupported destination (hard-block)
 *   4. unsupported content type (milestoneSpotlight legacy hard-block)
 *   5. missing first-persistence fields (only when draft has not yet persisted)
 *   6. ready for first persistence
 *   7. ready for subsequent persistence
 *
 * Busy outranks missing-fields so a save already in flight never
 * reads as "missing fields" mid-request. Unsupported-destination /
 * unsupported-content-type outrank missing-fields so the author
 * sees the real hard-block first instead of a redundant field list.
 */
export function deriveSaveHealth(inputs: DeriveSaveHealthInputs): SaveHealth {
  const {
    articleDraft,
    busy,
    unsupportedDestinationMessage,
    unsupportedContentTypeMessage,
    isPersisted,
  } = inputs;

  if (!articleDraft) return { kind: 'noDraft' };
  if (busy) return { kind: 'busy' };
  if (unsupportedDestinationMessage) {
    return { kind: 'unsupportedDestination', message: unsupportedDestinationMessage };
  }
  if (unsupportedContentTypeMessage) {
    return { kind: 'unsupportedContentType', message: unsupportedContentTypeMessage };
  }

  if (!isPersisted) {
    const missing = missingFirstPersistenceFields(articleDraft);
    if (missing.length > 0) {
      return { kind: 'missingFirstPersistenceFields', missing };
    }
    return { kind: 'readyFirstPersistence' };
  }

  return { kind: 'readySubsequentPersistence' };
}

export function isSaveReady(health: SaveHealth): boolean {
  return (
    health.kind === 'readyFirstPersistence' ||
    health.kind === 'readySubsequentPersistence'
  );
}

/**
 * Button-tooltip copy. Returns `undefined` when save is ready so the
 * button carries no misleading hover-hint.
 */
export function saveDisabledReason(health: SaveHealth): string | undefined {
  switch (health.kind) {
    case 'noDraft':
      return 'Pick a draft first.';
    case 'busy':
      return 'A save or publish run is already in flight.';
    case 'unsupportedDestination':
      return health.message;
    case 'unsupportedContentType':
      return health.message;
    case 'missingFirstPersistenceFields': {
      const n = health.missing.length;
      return `Finish ${n} required field${n === 1 ? '' : 's'} before the first save.`;
    }
    case 'readyFirstPersistence':
    case 'readySubsequentPersistence':
      return undefined;
  }
}
