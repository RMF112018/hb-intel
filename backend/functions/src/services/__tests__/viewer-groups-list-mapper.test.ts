import { describe, it, expect } from 'vitest';
import { toDomain } from '../viewer-groups-list-mapper.js';

function makeFullSpItem(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    Title: 'Commercial',
    DefaultViewerGroupIdsJson: '["group-id-1","group-id-2"]',
    DefaultViewerGroupNames: 'Finance Viewers, Executive Viewers',
    IsActive: 'Yes',
    LastReviewedAt: '2026-03-15T10:00:00Z',
    Notes: 'Reviewed quarterly.',
    ...overrides,
  };
}

describe('viewer-groups-list-mapper — toDomain', () => {
  it('parses a full SP item correctly', () => {
    const domain = toDomain(makeFullSpItem());

    expect(domain.department).toBe('Commercial');
    expect(domain.defaultViewerGroupIds).toEqual(['group-id-1', 'group-id-2']);
    expect(domain.defaultViewerGroupNames).toBe('Finance Viewers, Executive Viewers');
    expect(domain.isActive).toBe(true);
    expect(domain.lastReviewedAt).toBe('2026-03-15T10:00:00Z');
    expect(domain.notes).toBe('Reviewed quarterly.');
  });

  it('handles missing DefaultViewerGroupIdsJson → empty array', () => {
    const domain = toDomain(makeFullSpItem({ DefaultViewerGroupIdsJson: undefined }));
    expect(domain.defaultViewerGroupIds).toEqual([]);
  });

  it('handles empty string DefaultViewerGroupIdsJson → empty array', () => {
    const domain = toDomain(makeFullSpItem({ DefaultViewerGroupIdsJson: '' }));
    expect(domain.defaultViewerGroupIds).toEqual([]);
  });

  it('handles malformed JSON in group IDs → empty array without throwing', () => {
    const domain = toDomain(makeFullSpItem({ DefaultViewerGroupIdsJson: 'not-json' }));
    expect(domain.defaultViewerGroupIds).toEqual([]);
  });

  it('maps IsActive "Yes" → true', () => {
    const domain = toDomain(makeFullSpItem({ IsActive: 'Yes' }));
    expect(domain.isActive).toBe(true);
  });

  it('maps IsActive "No" → false', () => {
    const domain = toDomain(makeFullSpItem({ IsActive: 'No' }));
    expect(domain.isActive).toBe(false);
  });

  it('maps missing IsActive → false', () => {
    const domain = toDomain(makeFullSpItem({ IsActive: undefined }));
    expect(domain.isActive).toBe(false);
  });

  it('handles missing LastReviewedAt → undefined', () => {
    const domain = toDomain(makeFullSpItem({ LastReviewedAt: undefined }));
    expect(domain.lastReviewedAt).toBeUndefined();
  });

  it('handles empty string LastReviewedAt → undefined', () => {
    const domain = toDomain(makeFullSpItem({ LastReviewedAt: '' }));
    expect(domain.lastReviewedAt).toBeUndefined();
  });

  it('handles missing Notes → undefined', () => {
    const domain = toDomain(makeFullSpItem({ Notes: undefined }));
    expect(domain.notes).toBeUndefined();
  });

  it('handles missing Title → empty string', () => {
    const domain = toDomain(makeFullSpItem({ Title: undefined }));
    expect(domain.department).toBe('');
  });
});
