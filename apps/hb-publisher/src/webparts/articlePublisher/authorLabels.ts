/**
 * Author-facing label governance for the Article Publisher.
 *
 * Every enum-like value surfaced anywhere in the author-facing
 * Publisher experience is mapped here to a single, governed,
 * friendly label. No other module in the Publisher surface is
 * permitted to render a raw enum token to an author.
 *
 * Workstream B, step-01: centralises the ad-hoc label maps that
 * grew inside `ArticlePublisher.tsx` during Workstream A into a
 * single authoritative module with compile-time exhaustiveness
 * guarantees (every enum value carries a label via
 * `Record<EnumType, string>`).
 *
 * Runtime behaviour is unchanged: underlying enum values still
 * flow into the adapter; only the display layer is governed here.
 */

import type {
  ArticleContentType,
  ArticleSubject,
  Destination,
  HeroThemeVariant,
  MediaRole,
  ProjectStage,
  SpotlightType,
  TeamViewerGroupingMode,
  TeamViewerMode,
  TeamViewerSortMode,
  WorkflowState,
} from '../../data/publisherAdapter/publisherEnums.js';

/** Generic camelCase → Title Case fallback, used for diagnostics only. */
export function friendlyEnumLabel(value: string): string {
  const spaced = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();
  return spaced.length === 0
    ? value
    : spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/* ── Article content type ────────────────────────────────── */

const ARTICLE_CONTENT_TYPE_LABELS: Record<ArticleContentType, string> = {
  newsUpdate: 'News Update',
  monthlySpotlight: 'Monthly Spotlight',
  milestoneSpotlight: 'Milestone (legacy)',
  projectUpdate: 'Project Update',
  announcement: 'Announcement',
};

export function articleContentTypeLabel(value: ArticleContentType): string {
  return ARTICLE_CONTENT_TYPE_LABELS[value];
}

/* ── Destination ─────────────────────────────────────────── */

const DESTINATION_LABELS: Record<Destination, string> = {
  projectSpotlight: 'Project Spotlight',
  companyPulse: 'Company Pulse',
};

export function destinationLabel(value: Destination): string {
  return DESTINATION_LABELS[value];
}

/* ── Spotlight type ──────────────────────────────────────── */

const SPOTLIGHT_TYPE_LABELS: Record<SpotlightType, string> = {
  monthly: 'Monthly',
  milestone: 'Milestone',
  other: 'Other',
};

export function spotlightTypeLabel(value: SpotlightType): string {
  return SPOTLIGHT_TYPE_LABELS[value];
}

/* ── Project stage ───────────────────────────────────────── */

const PROJECT_STAGE_LABELS: Record<ProjectStage, string> = {
  precon: 'Pre-construction',
  active: 'Under construction',
  closeout: 'Closeout',
  completed: 'Completed',
};

export function projectStageLabel(value: ProjectStage): string {
  return PROJECT_STAGE_LABELS[value];
}

/* ── Article subject ─────────────────────────────────────── */

const ARTICLE_SUBJECT_LABELS: Record<ArticleSubject, string> = {
  general: 'General',
  people: 'People',
  project: 'Project',
  operations: 'Operations',
  safety: 'Safety',
};

export function articleSubjectLabel(value: ArticleSubject): string {
  return ARTICLE_SUBJECT_LABELS[value];
}

/* ── Hero theme variant ──────────────────────────────────── */

const HERO_THEME_VARIANT_LABELS: Record<HeroThemeVariant, string> = {
  default: 'Default',
  light: 'Light',
  dark: 'Dark',
};

export function heroThemeVariantLabel(value: HeroThemeVariant): string {
  return HERO_THEME_VARIANT_LABELS[value];
}

/* ── Media role ──────────────────────────────────────────── */

const MEDIA_ROLE_LABELS: Record<MediaRole, string> = {
  hero: 'Hero (primary)',
  secondary: 'Secondary',
  gallery: 'Gallery',
  supporting: 'Supporting',
};

export function mediaRoleLabel(value: MediaRole): string {
  return MEDIA_ROLE_LABELS[value];
}

/* ── Team viewer enums ───────────────────────────────────── */

const TEAM_VIEWER_MODE_LABELS: Record<TeamViewerMode, string> = {
  compact: 'Compact',
  grouped: 'Grouped',
  orgChart: 'Org chart',
  summaryExpand: 'Summary with expand',
};

export function teamViewerModeLabel(value: TeamViewerMode): string {
  return TEAM_VIEWER_MODE_LABELS[value];
}

const TEAM_VIEWER_GROUPING_MODE_LABELS: Record<TeamViewerGroupingMode, string> = {
  none: 'No grouping',
  discipline: 'By discipline',
  company: 'By company',
  hierarchy: 'By hierarchy',
};

export function teamViewerGroupingModeLabel(
  value: TeamViewerGroupingMode,
): string {
  return TEAM_VIEWER_GROUPING_MODE_LABELS[value];
}

const TEAM_VIEWER_SORT_MODE_LABELS: Record<TeamViewerSortMode, string> = {
  manual: 'Manual order',
  role: 'By role',
  hierarchy: 'By hierarchy',
};

export function teamViewerSortModeLabel(value: TeamViewerSortMode): string {
  return TEAM_VIEWER_SORT_MODE_LABELS[value];
}

/* ── Workflow state (author-facing outcome phrasing) ─────── */

const WORKFLOW_OUTCOME_LABELS: Record<WorkflowState, string> = {
  draft: 'Draft',
  review: 'Awaiting review',
  approved: 'Approved',
  scheduled: 'Scheduled (legacy)',
  published: 'Published',
  archived: 'Archived',
  withdrawn: 'Withdrawn',
};

export function workflowOutcomeLabel(value: WorkflowState): string {
  return WORKFLOW_OUTCOME_LABELS[value];
}

/**
 * Draft-rail group headings. Uses the same `WorkflowState` keys so
 * compile-time exhaustiveness guarantees every operational state
 * carries a rail label.
 */
const DRAFT_GROUP_LABELS: Record<WorkflowState, string> = {
  draft: 'Drafts',
  review: 'In review',
  approved: 'Approved',
  scheduled: 'Scheduled (legacy)',
  published: 'Recently published',
  archived: 'Archived',
  withdrawn: 'Withdrawn',
};

export function draftGroupLabel(value: WorkflowState): string {
  return DRAFT_GROUP_LABELS[value];
}

const DRAFT_GROUP_EMPTY_COPY: Record<WorkflowState, string> = {
  draft: 'No drafts yet. Start a new Project Spotlight to see it here.',
  review: 'No articles are awaiting review.',
  approved: 'No approved articles waiting to publish.',
  scheduled: 'No scheduled articles.',
  published: 'Published articles will appear here as you ship them.',
  archived: 'No archived articles.',
  withdrawn: 'No withdrawn articles.',
};

export function draftGroupEmptyCopy(value: WorkflowState): string {
  return DRAFT_GROUP_EMPTY_COPY[value];
}

/**
 * Author-facing action label for a workflow transition. Authors
 * never see `→ <enum>` tokens; they see the outcome they are
 * initiating ("Send for review", "Mark approved"). The underlying
 * `workflowStateMachine.canTransition` authorisation is unchanged.
 */
export function transitionActionLabel(to: WorkflowState): string {
  switch (to) {
    case 'draft':
      return 'Return to draft';
    case 'review':
      return 'Send for review';
    case 'approved':
      return 'Mark approved';
    case 'scheduled':
      return 'Mark scheduled (legacy)';
    case 'published':
      return 'Mark published';
    case 'archived':
      return 'Archive';
    case 'withdrawn':
      return 'Withdraw';
  }
}
