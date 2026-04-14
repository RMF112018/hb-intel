import { describe, expect, it } from 'vitest';
import type { PublisherTeamMemberRow } from '../../../data/publisherAdapter/index.js';
import {
  applyFeaturedInvariant,
  moveRow,
  restampSortOrder,
  teamMemberInitials,
} from './teamInvariants.js';

function row(
  id: string,
  over: Partial<PublisherTeamMemberRow> = {},
): PublisherTeamMemberRow {
  return {
    ArticleId: 'art-1',
    TeamMemberId: id,
    PersonPrincipal: `${id}@hedrickbrothers.com`,
    DisplayName: id,
    Title: '',
    SortOrder: 1,
    ...over,
  };
}

describe('applyFeaturedInvariant', () => {
  it('features exactly one row and clears the flag on every other row', () => {
    const rows = [
      row('a', { IsFeaturedMember: true }),
      row('b'),
      row('c', { IsFeaturedMember: true }),
    ];
    const out = applyFeaturedInvariant(rows, 'b');
    expect(out.map((r) => r.IsFeaturedMember)).toEqual([undefined, true, undefined]);
  });

  it('clears every row when featuredId is undefined', () => {
    const rows = [row('a', { IsFeaturedMember: true }), row('b')];
    const out = applyFeaturedInvariant(rows, undefined);
    expect(out.every((r) => r.IsFeaturedMember === undefined)).toBe(true);
  });

  it('is a no-op on rows that already match the invariant (reference-stable)', () => {
    const rows = [row('a', { IsFeaturedMember: true }), row('b')];
    const out = applyFeaturedInvariant(rows, 'a');
    expect(out[0]).toBe(rows[0]);
    expect(out[1]).toBe(rows[1]);
  });
});

describe('restampSortOrder', () => {
  it('rewrites SortOrder to 1-indexed stack position', () => {
    const rows = [
      row('a', { SortOrder: 99 }),
      row('b', { SortOrder: 7 }),
      row('c', { SortOrder: 2 }),
    ];
    expect(restampSortOrder(rows).map((r) => r.SortOrder)).toEqual([1, 2, 3]);
  });

  it('returns the same reference for rows already at the correct position', () => {
    const rows = [row('a', { SortOrder: 1 }), row('b', { SortOrder: 2 })];
    const out = restampSortOrder(rows);
    expect(out[0]).toBe(rows[0]);
    expect(out[1]).toBe(rows[1]);
  });
});

describe('moveRow', () => {
  const rows = [row('a'), row('b'), row('c')];

  it('moves up and re-stamps sort order', () => {
    const out = moveRow(rows, 2, -1);
    expect(out.map((r) => r.TeamMemberId)).toEqual(['a', 'c', 'b']);
    expect(out.map((r) => r.SortOrder)).toEqual([1, 2, 3]);
  });

  it('moves down and re-stamps sort order', () => {
    const out = moveRow(rows, 0, 1);
    expect(out.map((r) => r.TeamMemberId)).toEqual(['b', 'a', 'c']);
  });

  it('is a no-op when moving past either end', () => {
    expect(moveRow(rows, 0, -1).map((r) => r.TeamMemberId)).toEqual(['a', 'b', 'c']);
    expect(moveRow(rows, 2, 1).map((r) => r.TeamMemberId)).toEqual(['a', 'b', 'c']);
  });
});

describe('teamMemberInitials', () => {
  it('takes first + last initial for a two-part display name', () => {
    expect(teamMemberInitials({ DisplayName: 'Alice Admirable', PersonPrincipal: '' })).toBe('AA');
  });

  it('takes first letter of a single-word display name', () => {
    expect(teamMemberInitials({ DisplayName: 'Mononym', PersonPrincipal: '' })).toBe('M');
  });

  it('falls back to two characters of the email local-part when DisplayName is empty', () => {
    expect(teamMemberInitials({ DisplayName: '', PersonPrincipal: 'alice@hb.com' })).toBe('AL');
  });

  it('returns ? when no source data is available', () => {
    expect(teamMemberInitials({ DisplayName: '', PersonPrincipal: '' })).toBe('?');
  });
});
