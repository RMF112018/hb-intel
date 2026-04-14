/**
 * Intelligent metadata defaults for the Article Publisher.
 *
 * Workstream B, step-04: removes repetitive author busywork by
 * computing sensible defaults from current article context and
 * applying them only when the relevant field is empty or whitespace.
 * Author-typed values are never overwritten.
 *
 * Today's defaults:
 *
 *   - `TeamViewerTitle`  ← `"The Team at {ProjectName}"` (or `"The Team"`
 *     when no project is bound).
 *   - `HeroCategoryLabel` ← `ProjectName` when the field is empty.
 *
 * Defaults are applied at save-time. The Team section's heading
 * input also surfaces the resolved default as an HTML `placeholder`
 * so authors can see what will be filled if they leave it blank.
 */

export interface IntelligentDefaultsArticleSlice {
  readonly Title: string;
  readonly ProjectName?: string;
  readonly TeamViewerTitle?: string;
  readonly HeroCategoryLabel?: string;
}

function isBlank(value: string | undefined | null): boolean {
  return value === undefined || value === null || value.trim().length === 0;
}

function trimmedOrUndefined(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

/**
 * Compute the default Team Viewer heading from the bound project.
 * Returns `"The Team at {projectName}"` when a project is set and
 * `"The Team"` otherwise. The author can still override by typing
 * their own heading.
 */
export function defaultTeamHeading(projectName: string | undefined | null): string {
  const trimmed = trimmedOrUndefined(projectName ?? undefined);
  return trimmed ? `The Team at ${trimmed}` : 'The Team';
}

/**
 * Compute the default hero category label from the bound project.
 * Returns the project name verbatim when set; otherwise `undefined`
 * (no default — leave the field blank).
 */
export function defaultHeroCategoryLabel(
  projectName: string | undefined | null,
): string | undefined {
  return trimmedOrUndefined(projectName ?? undefined);
}

export interface IntelligentDefaultsResult<T extends IntelligentDefaultsArticleSlice> {
  readonly draft: T;
  readonly applied: readonly ('TeamViewerTitle' | 'HeroCategoryLabel')[];
}

/**
 * Apply all intelligent metadata defaults to an article draft. Only
 * empty/whitespace fields are filled. Returns the (possibly updated)
 * draft and the list of fields that were filled, which the caller
 * may use for diagnostics or status messaging.
 */
export function intelligentDefaultsForSave<T extends IntelligentDefaultsArticleSlice>(
  draft: T,
): IntelligentDefaultsResult<T> {
  const applied: ('TeamViewerTitle' | 'HeroCategoryLabel')[] = [];
  let next: T = draft;

  if (isBlank(draft.TeamViewerTitle)) {
    next = { ...next, TeamViewerTitle: defaultTeamHeading(draft.ProjectName) };
    applied.push('TeamViewerTitle');
  }

  if (isBlank(draft.HeroCategoryLabel)) {
    const heroDefault = defaultHeroCategoryLabel(draft.ProjectName);
    if (heroDefault !== undefined) {
      next = { ...next, HeroCategoryLabel: heroDefault };
      applied.push('HeroCategoryLabel');
    }
  }

  return { draft: next, applied };
}
