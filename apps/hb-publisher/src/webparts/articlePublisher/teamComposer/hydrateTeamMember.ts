/**
 * Pure hydration helpers that map a directory-sourced `PersonEntry`
 * onto a `PublisherTeamMemberRow`.
 *
 * The teammate composer (workstream-d step-02) replaces hand-typed
 * PersonPrincipal / DisplayName / Title / Company / Department entry
 * with Graph-backed identity. This module owns the mapping so
 * composer UI and tests share a single deterministic rule set.
 */

import type { PersonEntry } from '@hbc/ui-kit/homepage';
import type { PublisherTeamMemberRow } from '../../../data/publisherAdapter/index.js';

export interface TeamMemberEditorials {
  /** Editorial override for the role caption shown on the card. */
  readonly roleCaption?: string;
  /** Editorial one-line tagline rendered under the name. */
  readonly bioCaption?: string;
  /** Whether this teammate is the featured pick for the section. */
  readonly featured?: boolean;
}

function trimOrUndefined(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined;
  const t = value.trim();
  return t.length > 0 ? t : undefined;
}

/**
 * Build a new `PublisherTeamMemberRow` from a directory person +
 * editorial overrides. Used when the composer is adding a teammate.
 */
export function createTeamMemberFromPerson(args: {
  readonly articleId: string;
  readonly teamMemberId: string;
  readonly person: PersonEntry;
  readonly editorials: TeamMemberEditorials;
  readonly sortOrder: number;
}): PublisherTeamMemberRow {
  const { articleId, teamMemberId, person, editorials, sortOrder } = args;
  const roleCaption = trimOrUndefined(editorials.roleCaption);
  const bioCaption = trimOrUndefined(editorials.bioCaption);
  return {
    ArticleId: articleId,
    TeamMemberId: teamMemberId,
    PersonPrincipal: person.upn,
    DisplayName: person.displayName,
    Title: roleCaption ?? trimOrUndefined(person.jobTitle) ?? '',
    Company: trimOrUndefined(undefined),
    Department: trimOrUndefined(person.department),
    BioSnippet: bioCaption,
    SortOrder: sortOrder,
    IsFeaturedMember: editorials.featured === true ? true : undefined,
  };
}

/**
 * Merge a directory person + editorial overrides into an existing
 * row, preserving fields the composer does not author in this step
 * (`Role`, `GroupKey`, `ParentMemberId`, `ContactLink`) so edits are
 * never destructive.
 */
export function mergeTeamMemberWithPerson(args: {
  readonly existing: PublisherTeamMemberRow;
  readonly person: PersonEntry;
  readonly editorials: TeamMemberEditorials;
}): PublisherTeamMemberRow {
  const { existing, person, editorials } = args;
  const roleCaption = trimOrUndefined(editorials.roleCaption);
  const bioCaption = trimOrUndefined(editorials.bioCaption);
  return {
    ...existing,
    PersonPrincipal: person.upn,
    DisplayName: person.displayName,
    Title: roleCaption ?? trimOrUndefined(person.jobTitle) ?? existing.Title,
    Department: trimOrUndefined(person.department) ?? existing.Department,
    BioSnippet: bioCaption ?? existing.BioSnippet,
    IsFeaturedMember:
      editorials.featured === true
        ? true
        : editorials.featured === false
          ? undefined
          : existing.IsFeaturedMember,
  };
}

/**
 * Reverse projection: pull the editorial-only overrides out of an
 * existing row so the composer can re-seed itself when the author
 * clicks "Edit teammate".
 */
export function editorialsFromRow(
  row: PublisherTeamMemberRow,
  person: PersonEntry | undefined,
): TeamMemberEditorials {
  const directoryTitle = trimOrUndefined(person?.jobTitle);
  const currentTitle = trimOrUndefined(row.Title);
  // If the stored Title matches the directory title, it is a pass-
  // through, not an editorial override — the composer shows it blank
  // so authors know the card will track directory changes.
  const roleCaption =
    currentTitle && currentTitle !== directoryTitle ? currentTitle : undefined;
  return {
    roleCaption,
    bioCaption: trimOrUndefined(row.BioSnippet),
    featured: row.IsFeaturedMember === true,
  };
}

/**
 * Build a `PersonEntry` from a stored row for seeding the people
 * picker in edit mode. The directory search will usually reconcile
 * against live Graph data once the composer opens, but this gives
 * the picker an immediate chip to render.
 */
export function personEntryFromRow(row: PublisherTeamMemberRow): PersonEntry {
  return {
    upn: row.PersonPrincipal,
    displayName: row.DisplayName || row.PersonPrincipal,
    jobTitle: trimOrUndefined(row.Title),
    department: trimOrUndefined(row.Department),
  };
}
