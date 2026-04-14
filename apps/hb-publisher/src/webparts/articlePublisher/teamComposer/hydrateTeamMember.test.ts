import { describe, expect, it } from 'vitest';
import type { PersonEntry } from '@hbc/ui-kit';
import type { PublisherTeamMemberRow } from '../../../data/publisherAdapter/index.js';
import {
  createTeamMemberFromPerson,
  editorialsFromRow,
  mergeTeamMemberWithPerson,
  personEntryFromRow,
} from './hydrateTeamMember.js';

function alice(over: Partial<PersonEntry> = {}): PersonEntry {
  return {
    upn: 'alice@hedrickbrothers.com',
    displayName: 'Alice Admirable',
    givenName: 'Alice',
    surname: 'Admirable',
    jobTitle: 'Project Executive',
    department: 'Operations',
    ...over,
  };
}

describe('createTeamMemberFromPerson', () => {
  it('hydrates directory identity + directory title when no editorial override is provided', () => {
    const row = createTeamMemberFromPerson({
      articleId: 'art-1',
      teamMemberId: 'tm-new',
      person: alice(),
      editorials: {},
      sortOrder: 3,
    });
    expect(row).toMatchObject({
      ArticleId: 'art-1',
      TeamMemberId: 'tm-new',
      PersonPrincipal: 'alice@hedrickbrothers.com',
      DisplayName: 'Alice Admirable',
      Title: 'Project Executive',
      Department: 'Operations',
      SortOrder: 3,
    });
    expect(row.IsFeaturedMember).toBeUndefined();
    expect(row.BioSnippet).toBeUndefined();
  });

  it('prefers the role caption over the directory job title when supplied', () => {
    const row = createTeamMemberFromPerson({
      articleId: 'art-1',
      teamMemberId: 'tm-new',
      person: alice(),
      editorials: { roleCaption: 'Owner rep on the West Palm pull-in' },
      sortOrder: 1,
    });
    expect(row.Title).toBe('Owner rep on the West Palm pull-in');
  });

  it('records a bio caption and featured pick', () => {
    const row = createTeamMemberFromPerson({
      articleId: 'art-1',
      teamMemberId: 'tm-new',
      person: alice(),
      editorials: { bioCaption: '20 years on the coast.', featured: true },
      sortOrder: 1,
    });
    expect(row.BioSnippet).toBe('20 years on the coast.');
    expect(row.IsFeaturedMember).toBe(true);
  });

  it('treats whitespace-only editorial strings as absent', () => {
    const row = createTeamMemberFromPerson({
      articleId: 'art-1',
      teamMemberId: 'tm-new',
      person: alice({ jobTitle: undefined }),
      editorials: { roleCaption: '   ', bioCaption: '  ' },
      sortOrder: 1,
    });
    expect(row.Title).toBe('');
    expect(row.BioSnippet).toBeUndefined();
  });
});

describe('mergeTeamMemberWithPerson', () => {
  const existing: PublisherTeamMemberRow = {
    ArticleId: 'art-1',
    TeamMemberId: 'tm-keep',
    PersonPrincipal: 'bob@hedrickbrothers.com',
    DisplayName: 'Bob Old',
    Title: 'Some Old Title',
    Role: 'Owner Rep',
    GroupKey: 'leadership',
    ParentMemberId: 'tm-parent',
    ContactLink: 'https://example.com/bob',
    Department: 'Old Dept',
    BioSnippet: 'Old bio',
    SortOrder: 2,
    IsFeaturedMember: true,
  };

  it('preserves fields the composer does not author (Role, GroupKey, ParentMemberId, ContactLink)', () => {
    const merged = mergeTeamMemberWithPerson({
      existing,
      person: alice(),
      editorials: {},
    });
    expect(merged.Role).toBe('Owner Rep');
    expect(merged.GroupKey).toBe('leadership');
    expect(merged.ParentMemberId).toBe('tm-parent');
    expect(merged.ContactLink).toBe('https://example.com/bob');
    expect(merged.SortOrder).toBe(2);
    expect(merged.TeamMemberId).toBe('tm-keep');
  });

  it('overwrites identity + directory-tracked fields with the new person', () => {
    const merged = mergeTeamMemberWithPerson({
      existing,
      person: alice(),
      editorials: {},
    });
    expect(merged.PersonPrincipal).toBe('alice@hedrickbrothers.com');
    expect(merged.DisplayName).toBe('Alice Admirable');
    expect(merged.Title).toBe('Project Executive');
    expect(merged.Department).toBe('Operations');
  });

  it('clears the featured flag when editorials.featured is explicitly false', () => {
    const merged = mergeTeamMemberWithPerson({
      existing,
      person: alice(),
      editorials: { featured: false },
    });
    expect(merged.IsFeaturedMember).toBeUndefined();
  });
});

describe('editorialsFromRow', () => {
  it('hides the role caption when the stored Title matches the directory job title', () => {
    const row = createTeamMemberFromPerson({
      articleId: 'a',
      teamMemberId: 'tm-1',
      person: alice(),
      editorials: {},
      sortOrder: 1,
    });
    const editorials = editorialsFromRow(row, alice());
    expect(editorials.roleCaption).toBeUndefined();
  });

  it('exposes the role caption when it diverges from the directory job title', () => {
    const row = createTeamMemberFromPerson({
      articleId: 'a',
      teamMemberId: 'tm-1',
      person: alice(),
      editorials: { roleCaption: 'Owner rep' },
      sortOrder: 1,
    });
    const editorials = editorialsFromRow(row, alice());
    expect(editorials.roleCaption).toBe('Owner rep');
  });
});

describe('personEntryFromRow', () => {
  it('builds a renderable PersonEntry chip from a stored row', () => {
    const row: PublisherTeamMemberRow = {
      ArticleId: 'a',
      TeamMemberId: 'tm-1',
      PersonPrincipal: 'carol@hedrickbrothers.com',
      DisplayName: 'Carol Captain',
      Title: 'Superintendent',
      Department: 'Field',
    };
    expect(personEntryFromRow(row)).toEqual({
      upn: 'carol@hedrickbrothers.com',
      displayName: 'Carol Captain',
      jobTitle: 'Superintendent',
      department: 'Field',
    });
  });

  it('falls back to PersonPrincipal when DisplayName is empty', () => {
    const row: PublisherTeamMemberRow = {
      ArticleId: 'a',
      TeamMemberId: 'tm-1',
      PersonPrincipal: 'd@hedrickbrothers.com',
      DisplayName: '',
      Title: '',
    };
    expect(personEntryFromRow(row).displayName).toBe('d@hedrickbrothers.com');
  });
});
