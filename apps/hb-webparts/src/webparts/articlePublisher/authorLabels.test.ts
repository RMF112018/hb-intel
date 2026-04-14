import { describe, expect, it } from 'vitest';
import {
  ARTICLE_CONTENT_TYPE_VALUES,
  ARTICLE_SUBJECT_VALUES,
  DESTINATION_VALUES,
  HERO_THEME_VARIANT_VALUES,
  MEDIA_ROLE_VALUES,
  PROJECT_STAGE_VALUES,
  SPOTLIGHT_TYPE_VALUES,
  TEAM_VIEWER_GROUPING_MODE_VALUES,
  TEAM_VIEWER_MODE_VALUES,
  TEAM_VIEWER_SORT_MODE_VALUES,
  WORKFLOW_STATE_VALUES,
} from '../../homepage/data/publisherAdapter/publisherEnums.js';
import {
  articleContentTypeLabel,
  articleSubjectLabel,
  destinationLabel,
  draftGroupEmptyCopy,
  draftGroupLabel,
  friendlyEnumLabel,
  heroThemeVariantLabel,
  mediaRoleLabel,
  projectStageLabel,
  spotlightTypeLabel,
  teamViewerGroupingModeLabel,
  teamViewerModeLabel,
  teamViewerSortModeLabel,
  transitionActionLabel,
  workflowOutcomeLabel,
} from './authorLabels';

/**
 * Governance contract: every enum value surfaced in the author-facing
 * Publisher experience must route through a governed label function
 * that returns a non-empty, non-raw string.
 *
 * "Non-raw" here means the label is not identical to the underlying
 * enum token — e.g. `monthlySpotlight` must not render as
 * `monthlySpotlight`. Specific-case expectations below assert the
 * author-friendly form.
 */

type LabelCheck<T extends string> = {
  readonly name: string;
  readonly values: readonly T[];
  readonly label: (value: T) => string;
};

const ENUM_LABEL_CHECKS: readonly LabelCheck<string>[] = [
  { name: 'ArticleContentType', values: ARTICLE_CONTENT_TYPE_VALUES, label: articleContentTypeLabel as (v: string) => string },
  { name: 'ArticleSubject', values: ARTICLE_SUBJECT_VALUES, label: articleSubjectLabel as (v: string) => string },
  { name: 'Destination', values: DESTINATION_VALUES, label: destinationLabel as (v: string) => string },
  { name: 'HeroThemeVariant', values: HERO_THEME_VARIANT_VALUES, label: heroThemeVariantLabel as (v: string) => string },
  { name: 'MediaRole', values: MEDIA_ROLE_VALUES, label: mediaRoleLabel as (v: string) => string },
  { name: 'ProjectStage', values: PROJECT_STAGE_VALUES, label: projectStageLabel as (v: string) => string },
  { name: 'SpotlightType', values: SPOTLIGHT_TYPE_VALUES, label: spotlightTypeLabel as (v: string) => string },
  { name: 'TeamViewerGroupingMode', values: TEAM_VIEWER_GROUPING_MODE_VALUES, label: teamViewerGroupingModeLabel as (v: string) => string },
  { name: 'TeamViewerMode', values: TEAM_VIEWER_MODE_VALUES, label: teamViewerModeLabel as (v: string) => string },
  { name: 'TeamViewerSortMode', values: TEAM_VIEWER_SORT_MODE_VALUES, label: teamViewerSortModeLabel as (v: string) => string },
  { name: 'WorkflowState (outcome)', values: WORKFLOW_STATE_VALUES, label: workflowOutcomeLabel as (v: string) => string },
  { name: 'WorkflowState (draft-group heading)', values: WORKFLOW_STATE_VALUES, label: draftGroupLabel as (v: string) => string },
  { name: 'WorkflowState (draft-group empty copy)', values: WORKFLOW_STATE_VALUES, label: draftGroupEmptyCopy as (v: string) => string },
  { name: 'WorkflowState (transition action)', values: WORKFLOW_STATE_VALUES, label: transitionActionLabel as (v: string) => string },
];

describe('author-facing label governance', () => {
  for (const check of ENUM_LABEL_CHECKS) {
    describe(check.name, () => {
      it('returns a governed, non-raw label for every enum value', () => {
        for (const value of check.values) {
          const label = check.label(value);
          expect(label, `${check.name} value "${value}" must have a label`).toBeTruthy();
          expect(label.trim().length, `${check.name} value "${value}" label must be non-empty`).toBeGreaterThan(0);
          expect(
            label,
            `${check.name} value "${value}" must not render as its raw enum token`,
          ).not.toBe(value);
        }
      });
    });
  }

  describe('specific author-facing phrasings', () => {
    it('renders ArticleContentType as friendly label', () => {
      expect(articleContentTypeLabel('monthlySpotlight')).toBe('Monthly Spotlight');
      expect(articleContentTypeLabel('newsUpdate')).toBe('News Update');
      expect(articleContentTypeLabel('milestoneSpotlight')).toContain('legacy');
    });

    it('renders Destination with editorial product name', () => {
      expect(destinationLabel('projectSpotlight')).toBe('Project Spotlight');
      expect(destinationLabel('companyPulse')).toBe('Company Pulse');
    });

    it('renders MediaRole with author-facing qualifier on hero', () => {
      expect(mediaRoleLabel('hero')).toContain('primary');
      expect(mediaRoleLabel('gallery')).toBe('Gallery');
    });

    it('renders WorkflowState transitions as outcomes not enum tokens', () => {
      expect(transitionActionLabel('review')).toBe('Send for review');
      expect(transitionActionLabel('approved')).toBe('Mark approved');
      expect(transitionActionLabel('draft')).toBe('Return to draft');
      expect(transitionActionLabel('withdrawn')).toBe('Withdraw');
      expect(transitionActionLabel('archived')).toBe('Archive');
      for (const v of WORKFLOW_STATE_VALUES) {
        expect(transitionActionLabel(v).length).toBeGreaterThan(0);
        expect(transitionActionLabel(v)).not.toMatch(/^→/);
      }
    });

    it('renders Workflow outcome labels with editorial framing', () => {
      expect(workflowOutcomeLabel('review')).toBe('Awaiting review');
      expect(workflowOutcomeLabel('scheduled')).toContain('legacy');
    });

    it('renders TeamViewerMode without raw camelCase tokens', () => {
      expect(teamViewerModeLabel('orgChart')).toBe('Org chart');
      expect(teamViewerModeLabel('summaryExpand')).toContain('Summary');
    });
  });

  describe('friendlyEnumLabel', () => {
    it('converts camelCase to title case', () => {
      expect(friendlyEnumLabel('monthlySpotlight')).toBe('Monthly Spotlight');
      expect(friendlyEnumLabel('orgChart')).toBe('Org Chart');
    });

    it('preserves single-word values with capitalisation', () => {
      expect(friendlyEnumLabel('draft')).toBe('Draft');
      expect(friendlyEnumLabel('active')).toBe('Active');
    });
  });
});
