import { describe, expect, it } from 'vitest';
import {
  classifySuggestion,
  filterEntries,
  getAcknowledgmentSummary,
  getCommitmentSummary,
  getComplexityFlags,
  getDisplayDate,
  getEntryTags,
  getEntryTypeOptions,
  getEntryVisibility,
  getLifecycleLabel,
  getRedactionSummary,
  getReliabilityLabel,
  getTagOptions,
  parseCsv,
} from './displayModel.js';
import {
  createLivingStrategicIntelligenceEntry,
  createSuggestedIntelligenceMatch,
} from '@hbc/strategic-intelligence';
import { createMockStrategicIntelligenceState } from '@hbc/strategic-intelligence/testing';

describe('strategic intelligence display model', () => {
  it('resolves complexity, labels, and date formatting fallbacks', () => {
    expect(getComplexityFlags('Essential')).toEqual({
      isEssential: true,
      isStandard: false,
      isExpert: false,
    });
    expect(getComplexityFlags('Standard').isStandard).toBe(true);
    expect(getComplexityFlags('Expert').isExpert).toBe(true);
    expect(getLifecycleLabel('pending-approval')).toBe('Pending Approval');
    expect(getReliabilityLabel('review-required')).toBe('Review required');
    expect(getDisplayDate(undefined)).toBe('Not set');
  });

  it('extracts tags and options deterministically', () => {
    const entryA = createLivingStrategicIntelligenceEntry({
      entryId: 'entry-a',
      type: 'risk-gap',
      metadata: {
        client: 'A',
        ownerOrganization: 'Org',
        projectType: 'Hospital',
        sector: 'Healthcare',
        geography: 'Midwest',
        lifecyclePhase: 'handoff',
        riskCategory: 'schedule',
        competitorReferences: ['CompA'],
      },
    });
    const entryB = createLivingStrategicIntelligenceEntry({
      entryId: 'entry-b',
      type: 'market-insight',
      metadata: {
        ...entryA.metadata,
        sector: 'Education',
        geography: 'Southwest',
      },
    });

    expect(getEntryTags(entryA)).toContain('risk-gap');
    const tagOptions = getTagOptions([entryA, entryB]);
    expect(tagOptions).toHaveLength(9);
    expect(tagOptions).toEqual([...tagOptions].sort((a, b) => a.localeCompare(b)));
    expect(tagOptions).toEqual(
      expect.arrayContaining([
        'CompA',
        'Education',
        'Healthcare',
        'Midwest',
        'Southwest',
        'handoff',
        'market-insight',
        'risk-gap',
        'schedule',
      ])
    );
    expect(getEntryTypeOptions([entryA, entryB])).toEqual(['market-insight', 'risk-gap']);
  });

  it('applies visibility and redaction policy branches', () => {
    const approved = createLivingStrategicIntelligenceEntry({
      entryId: 'entry-approved',
      lifecycleState: 'approved',
      sensitivity: 'public-internal',
    });
    const pending = createLivingStrategicIntelligenceEntry({
      entryId: 'entry-pending',
      lifecycleState: 'pending-approval',
      sensitivity: 'restricted-project',
    });

    const nonApproved = getEntryVisibility(pending, {
      canViewNonApproved: false,
      canViewSensitiveContent: true,
    });
    expect(nonApproved).toMatchObject({ isVisible: false, isRedacted: true, hiddenReason: 'non-approved' });
    expect(getRedactionSummary(pending, nonApproved.hiddenReason)).toContain('until approved');

    const sensitivity = getEntryVisibility(pending, {
      canViewNonApproved: true,
      canViewSensitiveContent: false,
    });
    expect(sensitivity).toMatchObject({ isVisible: true, isRedacted: true, hiddenReason: 'sensitivity' });
    expect(getRedactionSummary(pending, sensitivity.hiddenReason)).toContain('Restricted Project');

    const fullyVisible = getEntryVisibility(approved, {
      canViewNonApproved: true,
      canViewSensitiveContent: true,
    });
    expect(fullyVisible).toEqual({ isVisible: true, isRedacted: false });
    expect(getRedactionSummary(approved)).toBe('Redacted due to policy.');
  });

  it('filters entries across all feed filters and computes summaries', () => {
    const base = createMockStrategicIntelligenceState('display-model-summary');
    const approved = {
      ...base.livingEntries[0],
      entryId: 'approved-entry',
      type: 'risk-gap',
      lifecycleState: 'approved' as const,
      trust: {
        ...base.livingEntries[0].trust,
        reliabilityTier: 'high' as const,
        isStale: false,
      },
      metadata: {
        ...base.livingEntries[0].metadata,
        sector: 'Healthcare',
      },
    };
    const stalePending = {
      ...base.livingEntries[0],
      entryId: 'pending-entry',
      type: 'market-insight',
      lifecycleState: 'pending-approval' as const,
      trust: {
        ...base.livingEntries[0].trust,
        reliabilityTier: 'review-required' as const,
        isStale: true,
      },
      metadata: {
        ...base.livingEntries[0].metadata,
        sector: 'Healthcare',
      },
    };
    const entries = [approved, stalePending];

    expect(
      filterEntries(entries, {
        lifecycle: 'approved',
        entryType: 'risk-gap',
        tag: 'Healthcare',
        trustTier: 'high',
        stale: 'fresh',
      }).map((item) => item.entryId)
    ).toEqual(['approved-entry']);

    expect(
      filterEntries(entries, {
        lifecycle: 'all',
        entryType: 'all',
        tag: 'all',
        trustTier: 'all',
        stale: 'stale',
      }).map((item) => item.entryId)
    ).toEqual(['pending-entry']);

    expect(getCommitmentSummary(base.commitmentRegister).total).toBeGreaterThan(0);
    expect(getAcknowledgmentSummary(base.handoffReview).participantCount).toBeGreaterThan(0);
    expect(getAcknowledgmentSummary(null)).toEqual({
      acknowledgedCount: 0,
      participantCount: 0,
      isComplete: false,
    });
  });

  it('classifies suggestion variants and parses csv values', () => {
    const heritage = createSuggestedIntelligenceMatch({
      suggestionId: 's-heritage',
      reason: 'heritage snapshot overlap',
    });
    const living = createSuggestedIntelligenceMatch({
      suggestionId: 's-living',
      reason: 'metadata overlap',
    });

    expect(classifySuggestion(heritage)).toBe('Suggested Heritage');
    expect(classifySuggestion(living)).toBe('Suggested Intelligence');
    expect(parseCsv(' a, b ,, c ')).toEqual(['a', 'b', 'c']);
  });
});
