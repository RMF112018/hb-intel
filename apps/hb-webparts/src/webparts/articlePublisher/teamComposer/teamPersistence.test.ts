/**
 * Workstream-d step-04 — Harden team persistence, preview, and
 * viewer contracts.
 *
 * These tests lock in that a roster produced by the redesigned
 * teammate composer round-trips correctly through:
 *   composer → in-memory draft → mapTeamMemberRowToListFields
 *             → teamViewerAdapter → compositor visibility / sort
 * without losing identity, featured state, SortOrder, or the
 * editorial role caption rendered downstream.
 */

import { describe, expect, it } from 'vitest';
import type { PersonEntry } from '@hbc/ui-kit';
import { mapTeamMemberRowToListFields } from '../../../homepage/data/publisherAdapter/publisherWriters.js';
import {
  buildTeamViewerPersonList,
  mapPublisherRowToTeamViewerPerson,
  selectVisibleTeamMembers,
} from '../../../homepage/data/publisherAdapter/teamViewerAdapter.js';
import {
  applyFeaturedInvariant,
  createTeamMemberFromPerson,
  mergeTeamMemberWithPerson,
  restampSortOrder,
} from './index.js';

function alice(): PersonEntry {
  return {
    upn: 'alice@hedrickbrothers.com',
    displayName: 'Alice Admirable',
    jobTitle: 'Project Executive',
    department: 'Operations',
  };
}
function bob(): PersonEntry {
  return {
    upn: 'bob@hedrickbrothers.com',
    displayName: 'Bob Builder',
    jobTitle: 'Superintendent',
    department: 'Field',
  };
}

describe('teammate persistence round-trip', () => {
  it('composer-produced rows map to the SharePoint field bag after principal resolution', () => {
    const base = createTeamMemberFromPerson({
      articleId: 'art-1',
      teamMemberId: 'tm-1',
      person: alice(),
      editorials: { bioCaption: 'Coastal veteran.' },
      sortOrder: 1,
    });
    // The writer resolves PersonPrincipalId before the mapper runs.
    // Simulate that step so the round-trip test mirrors production.
    const resolved = { ...base, PersonPrincipalId: 4321 };
    const fields = mapTeamMemberRowToListFields(resolved);
    expect(fields).toMatchObject({
      ArticleId: 'art-1',
      TeamMemberId: 'tm-1',
      Title: 'Project Executive',
      PersonPrincipalId: 4321,
      DisplayName: 'Alice Admirable',
      Department: 'Operations',
      BioSnippet: 'Coastal veteran.',
      SortOrder: 1,
    });
    // Role / GroupKey / ParentMemberId are null because the composer
    // does not author them; IsFeaturedMember is null because the
    // default chip is not featured.
    expect(fields.Role).toBeNull();
    expect(fields.GroupKey).toBeNull();
    expect(fields.ParentMemberId).toBeNull();
    expect(fields.IsFeaturedMember).toBeNull();
    expect(fields.ContactLink).toBeNull();
  });

  it('refuses to emit a list field bag when PersonPrincipalId is missing', () => {
    const row = createTeamMemberFromPerson({
      articleId: 'art-1',
      teamMemberId: 'tm-1',
      person: alice(),
      editorials: {},
      sortOrder: 1,
    });
    expect(() => mapTeamMemberRowToListFields(row)).toThrow(/PersonPrincipalId/);
  });

  it('preserves legacy Role / GroupKey / ParentMemberId on an edit', () => {
    const legacy = {
      ArticleId: 'art-1',
      TeamMemberId: 'tm-legacy',
      PersonPrincipal: 'legacy@hedrickbrothers.com',
      DisplayName: 'Legacy Person',
      Title: 'Old Title',
      Role: 'Owner Rep',
      GroupKey: 'leadership',
      ParentMemberId: 'tm-parent',
      ContactLink: 'https://example.com/legacy',
      SortOrder: 2,
    } as const;
    const merged = mergeTeamMemberWithPerson({
      existing: { ...legacy },
      person: alice(),
      editorials: {},
    });
    expect(merged.Role).toBe('Owner Rep');
    expect(merged.GroupKey).toBe('leadership');
    expect(merged.ParentMemberId).toBe('tm-parent');
    expect(merged.ContactLink).toBe('https://example.com/legacy');
  });
});

describe('teammate preview / Team Viewer contract', () => {
  it('renders the composer-written Title as jobTitle when no legacy Role is set', () => {
    const row = createTeamMemberFromPerson({
      articleId: 'art-1',
      teamMemberId: 'tm-1',
      person: alice(),
      editorials: { roleCaption: 'Owner rep on the West Palm pull-in' },
      sortOrder: 1,
    });
    const person = mapPublisherRowToTeamViewerPerson(row);
    expect(person.jobTitle).toBe('Owner rep on the West Palm pull-in');
    expect(person.projectRole).toBe('Owner rep on the West Palm pull-in');
    expect(person.department).toBe('Operations');
    expect(person.displayName).toBe('Alice Admirable');
  });

  it('still prefers the legacy Role column over Title when Role is populated', () => {
    const row = createTeamMemberFromPerson({
      articleId: 'art-1',
      teamMemberId: 'tm-1',
      person: alice(),
      editorials: {},
      sortOrder: 1,
    });
    const legacy = { ...row, Role: 'Owner Rep' };
    expect(mapPublisherRowToTeamViewerPerson(legacy).jobTitle).toBe('Owner Rep');
  });

  it('ignores whitespace-only Role when falling back to Title', () => {
    const row = createTeamMemberFromPerson({
      articleId: 'art-1',
      teamMemberId: 'tm-1',
      person: alice(),
      editorials: {},
      sortOrder: 1,
    });
    const whitespaced = { ...row, Role: '   ' };
    expect(mapPublisherRowToTeamViewerPerson(whitespaced).jobTitle).toBe(
      'Project Executive',
    );
  });

  it('renders the chip-stack order as the Team Viewer render order', () => {
    const composerStack = restampSortOrder([
      createTeamMemberFromPerson({
        articleId: 'art-1',
        teamMemberId: 'tm-a',
        person: alice(),
        editorials: {},
        sortOrder: 99,
      }),
      createTeamMemberFromPerson({
        articleId: 'art-1',
        teamMemberId: 'tm-b',
        person: bob(),
        editorials: {},
        sortOrder: 4,
      }),
    ]);
    // restampSortOrder makes chip-stack position the source of truth.
    expect(composerStack.map((r) => r.SortOrder)).toEqual([1, 2]);
    const viewer = buildTeamViewerPersonList(composerStack);
    expect(viewer.map((p) => p.id)).toEqual(['tm-a', 'tm-b']);
  });

  it('applies the mutually-exclusive featured invariant before persistence', () => {
    const roster = restampSortOrder([
      createTeamMemberFromPerson({
        articleId: 'art-1',
        teamMemberId: 'tm-a',
        person: alice(),
        editorials: { featured: true },
        sortOrder: 1,
      }),
      createTeamMemberFromPerson({
        articleId: 'art-1',
        teamMemberId: 'tm-b',
        person: bob(),
        editorials: { featured: true },
        sortOrder: 2,
      }),
    ]);
    // Both rows were authored "featured" in sequence; the panel then
    // enforces the invariant before save.
    const enforced = applyFeaturedInvariant(roster, 'tm-b');
    expect(enforced.find((r) => r.TeamMemberId === 'tm-a')?.IsFeaturedMember).toBeUndefined();
    expect(enforced.find((r) => r.TeamMemberId === 'tm-b')?.IsFeaturedMember).toBe(true);
  });

  it('selectVisibleTeamMembers sort is stable across equal SortOrder values', () => {
    const rows = [
      { ...createTeamMemberFromPerson({ articleId: 'a', teamMemberId: 'tm-b', person: bob(), editorials: {}, sortOrder: 1 }) },
      { ...createTeamMemberFromPerson({ articleId: 'a', teamMemberId: 'tm-a', person: alice(), editorials: {}, sortOrder: 1 }) },
    ];
    const sorted = selectVisibleTeamMembers(rows);
    // Tiebreaker is DisplayName ascending; Alice precedes Bob.
    expect(sorted.map((r) => r.DisplayName)).toEqual(['Alice Admirable', 'Bob Builder']);
  });
});
