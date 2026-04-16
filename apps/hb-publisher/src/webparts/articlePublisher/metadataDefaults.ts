/**
 * Intelligent metadata defaults for the Article Publisher.
 *
 * Reduces repetitive author busywork by computing sensible defaults
 * from current article context and applying them under two rules
 * that keep editorial ownership with the author:
 *
 *   1. **Blank fill** — when a field is empty or whitespace, fill
 *      it with the computed default. Author-typed values are
 *      never overwritten.
 *   2. **Stale system-default refresh** — on project change, if a
 *      field still carries the exact system default computed from
 *      the *previous* project, refresh it to the *new* project's
 *      default. Any value that does not match the previous
 *      system default is treated as author-owned and preserved.
 *
 * Today's defaults:
 *
 *   - `TeamViewerTitle`  ← `"The Team at {ProjectName}"` (or
 *     `"The Team"` when no project is bound).
 *   - `HeroCategoryLabel` ← `ProjectName` when the field is empty.
 *   - `ProjectLocation`  ← the bound project's location as
 *     reported by the Projects list entry (same field the picker
 *     already writes). Obeys the same blank-fill + stale-refresh
 *     rules so a location that matches the previous project's
 *     value refreshes on project change, and an author-typed
 *     value is preserved across project changes and clears.
 *
 * Blank fill runs at save-time (`intelligentDefaultsForSave`).
 * Blank fill + stale refresh run on project-change in
 * `MetadataPanel` (`resolveProjectChangeDefaults`) so the resolved
 * heading, category, and location appear immediately and stay
 * coherent when the author picks a different project.
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

/** Slice of the draft that the project-change helper reads. */
export interface ProjectChangeDefaultsSlice {
  readonly TeamViewerTitle?: string;
  readonly HeroCategoryLabel?: string;
  readonly ProjectLocation?: string;
}

export interface ResolveProjectChangeDefaultsOptions {
  /** Project name bound to the draft before this change (if any). */
  readonly previousProjectName: string | undefined | null;
  /** Project name bound to the draft after this change (if any). */
  readonly nextProjectName: string | undefined | null;
  /** Project location reported by the previous project entry (if any). */
  readonly previousProjectLocation?: string | undefined | null;
  /** Project location reported by the next project entry (if any). */
  readonly nextProjectLocation?: string | undefined | null;
  /** Current values of the fields the helper may refresh. */
  readonly current: ProjectChangeDefaultsSlice;
}

export type ProjectChangeManagedField =
  | 'TeamViewerTitle'
  | 'HeroCategoryLabel'
  | 'ProjectLocation';

export interface ResolveProjectChangeDefaultsResult {
  /** Heading to persist onto the draft (always a string). */
  readonly TeamViewerTitle: string;
  /** Category label to persist; `undefined` when no project is bound. */
  readonly HeroCategoryLabel: string | undefined;
  /** Location to persist; `undefined` when no project is bound and no author value is present. */
  readonly ProjectLocation: string | undefined;
  /** Fields whose value actually changed — caller may surface for diagnostics. */
  readonly applied: readonly ProjectChangeManagedField[];
}

/**
 * Default project-location value derived from the picker entry.
 * Returns the trimmed location verbatim when present; otherwise
 * `undefined` — the field is optional on the tenant Projects list.
 */
export function defaultProjectLocation(
  projectLocation: string | undefined | null,
): string | undefined {
  return trimmedOrUndefined(projectLocation ?? undefined);
}

/**
 * Resolve the TeamViewerTitle, HeroCategoryLabel, and ProjectLocation
 * values that should land on the draft when the bound project changes.
 *
 * For each field:
 *   - if the current value is blank, fill it with the new project's
 *     default;
 *   - else if the current value exactly equals the *previous*
 *     project's system default (i.e. it was never author-edited),
 *     refresh it to the new project's default;
 *   - else preserve the current value (author has taken control).
 *
 * When the project is cleared (`nextProjectName` blank), stale
 * TeamViewerTitle collapses back to `"The Team"` and stale
 * HeroCategoryLabel / ProjectLocation collapse to `undefined`.
 * Author-authored values are preserved in every case.
 */
export function resolveProjectChangeDefaults(
  options: ResolveProjectChangeDefaultsOptions,
): ResolveProjectChangeDefaultsResult {
  const applied: ProjectChangeManagedField[] = [];

  const currentHeading = options.current.TeamViewerTitle;
  const previousHeadingDefault = defaultTeamHeading(options.previousProjectName);
  const nextHeadingDefault = defaultTeamHeading(options.nextProjectName);
  let resolvedHeading: string;
  if (isBlank(currentHeading)) {
    resolvedHeading = nextHeadingDefault;
    if (currentHeading !== nextHeadingDefault) applied.push('TeamViewerTitle');
  } else if (
    currentHeading === previousHeadingDefault &&
    currentHeading !== nextHeadingDefault
  ) {
    resolvedHeading = nextHeadingDefault;
    applied.push('TeamViewerTitle');
  } else {
    resolvedHeading = currentHeading as string;
  }

  const currentCategory = options.current.HeroCategoryLabel;
  const previousCategoryDefault = defaultHeroCategoryLabel(options.previousProjectName);
  const nextCategoryDefault = defaultHeroCategoryLabel(options.nextProjectName);
  let resolvedCategory: string | undefined;
  if (isBlank(currentCategory)) {
    resolvedCategory = nextCategoryDefault;
    if (nextCategoryDefault !== undefined && currentCategory !== nextCategoryDefault) {
      applied.push('HeroCategoryLabel');
    }
  } else if (
    previousCategoryDefault !== undefined &&
    currentCategory === previousCategoryDefault &&
    currentCategory !== nextCategoryDefault
  ) {
    resolvedCategory = nextCategoryDefault;
    applied.push('HeroCategoryLabel');
  } else {
    resolvedCategory = currentCategory;
  }

  const currentLocation = options.current.ProjectLocation;
  const previousLocationDefault = defaultProjectLocation(options.previousProjectLocation);
  const nextLocationDefault = defaultProjectLocation(options.nextProjectLocation);
  let resolvedLocation: string | undefined;
  if (isBlank(currentLocation)) {
    resolvedLocation = nextLocationDefault;
    if (nextLocationDefault !== undefined && currentLocation !== nextLocationDefault) {
      applied.push('ProjectLocation');
    }
  } else if (
    previousLocationDefault !== undefined &&
    currentLocation === previousLocationDefault &&
    currentLocation !== nextLocationDefault
  ) {
    resolvedLocation = nextLocationDefault;
    applied.push('ProjectLocation');
  } else {
    resolvedLocation = currentLocation;
  }

  return {
    TeamViewerTitle: resolvedHeading,
    HeroCategoryLabel: resolvedCategory,
    ProjectLocation: resolvedLocation,
    applied,
  };
}
