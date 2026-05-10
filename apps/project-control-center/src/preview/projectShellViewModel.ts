import type { IProjectProfile, PccPrimaryTabId, PccProjectStage } from '@hbc/models/pcc';
import { getPrimaryNavigationTab, normalizePrimaryTabId } from '@hbc/models/pcc';
import { PCC_SURFACE_HERO_DESCRIPTIONS } from '../shell/surfaceHeroCopy';
import {
  PCC_SHELL_SURFACE_HEADER_METADATA,
  type IPccShellHeroHighlight,
  type IPccShellHeroMicrocopy,
  type IPccShellSurfaceCue,
  type IPccShellSurfaceHeaderMetadata,
  type IPccShellSurfaceSummaryItem,
  type PccShellHeroHighlightKind,
  type PccShellHeroHighlightTone,
  type PccShellSurfaceSummaryTone,
} from '../shell/surfaceHeaderMetadata';

export type {
  PccShellSurfaceSummaryTone,
  IPccShellSurfaceSummaryItem,
  IPccShellSurfaceCue,
  IPccShellSurfaceHeaderMetadata,
  PccShellHeroHighlightTone,
  PccShellHeroHighlightKind,
  IPccShellHeroHighlight,
  IPccShellHeroMicrocopy,
};

/**
 * Hero view-model the PCC shell renders. Profile-derived; no source-confidence,
 * no status pills, no last-updated, no project number. Wave 15A wave-b7
 * Prompt 02 — extends the seam with typed shell surface metadata
 * (`surfaceSummaryItems`, `surfaceCues`, `readOnlyCue`) sourced from
 * `PCC_SHELL_SURFACE_HEADER_METADATA`. Wave 15A wave-b9 Prompt 4B-01 — adds
 * `clientDisplay` as a global project fact after `PccProjectIntelligenceCard`
 * was removed from Project Home; the existing facts (location, estimated
 * value, scheduled completion, project stage) are already rendered globally
 * across all PCC surfaces, so client follows the same global pattern. Wave
 * 15A wave-b9 Prompt 4B-02 — adds `heroHighlights` (production-visible
 * end-user posture row) and `governanceMicrocopy` (subordinate read-only /
 * governed-workflow reminders). The legacy `surfaceSummaryItems` /
 * `surfaceCues` / `readOnlyCue` fields remain on the VM so metadata-level
 * governance assertions in tests still resolve, but the hero band no longer
 * renders them as primary visible content.
 */
export interface IPccShellHeroViewModel {
  readonly primaryTitle: 'Project Control Center';
  readonly secondaryTitle: string;
  readonly surfaceDescription: string;
  readonly projectName: string;
  readonly location: string;
  readonly clientDisplay: string;
  readonly estimatedValueDisplay: string;
  readonly scheduledCompletionDisplay: string;
  readonly projectStageLabel: string;
  readonly surfaceSummaryItems: readonly IPccShellSurfaceSummaryItem[];
  readonly surfaceCues: readonly IPccShellSurfaceCue[];
  readonly readOnlyCue: string;
  readonly heroHighlights: readonly IPccShellHeroHighlight[];
  readonly governanceMicrocopy: readonly IPccShellHeroMicrocopy[];
}

const NOT_LISTED = 'Not listed' as const;

const ESTIMATED_VALUE_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const SCHEDULED_COMPLETION_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatEstimatedValue(value: number | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return NOT_LISTED;
  }
  return ESTIMATED_VALUE_FORMATTER.format(value);
}

export function formatScheduledCompletion(isoDate: string | undefined): string {
  if (!isoDate) {
    return NOT_LISTED;
  }
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return NOT_LISTED;
  }
  return SCHEDULED_COMPLETION_FORMATTER.format(parsed);
}

const PROJECT_STAGE_LABELS: Record<PccProjectStage, string> = {
  lead: 'Lead',
  estimating: 'Estimating',
  preconstruction: 'Preconstruction',
  active_construction: 'Active Construction',
  closeout: 'Closeout',
  warranty: 'Warranty',
};

export function formatProjectStage(stage: PccProjectStage): string {
  return PROJECT_STAGE_LABELS[stage];
}

export function deriveShellHeroViewModel(
  profile: IProjectProfile,
  activePrimaryTabId: PccPrimaryTabId,
): IPccShellHeroViewModel {
  const tabId = normalizePrimaryTabId(activePrimaryTabId);
  const tab = getPrimaryNavigationTab(tabId);
  const headerMetadata = PCC_SHELL_SURFACE_HEADER_METADATA[tabId];
  return {
    primaryTitle: 'Project Control Center',
    secondaryTitle: tab.label,
    surfaceDescription: PCC_SURFACE_HERO_DESCRIPTIONS[tabId],
    projectName: profile.projectName,
    location: profile.projectLocation ?? NOT_LISTED,
    clientDisplay: profile.clientName ?? NOT_LISTED,
    estimatedValueDisplay: formatEstimatedValue(profile.estimatedValue),
    scheduledCompletionDisplay: formatScheduledCompletion(profile.scheduledCompletionDate),
    projectStageLabel: formatProjectStage(profile.projectStage),
    surfaceSummaryItems: headerMetadata.surfaceSummaryItems,
    surfaceCues: headerMetadata.surfaceCues,
    readOnlyCue: headerMetadata.readOnlyCue,
    heroHighlights: headerMetadata.heroHighlights,
    governanceMicrocopy: headerMetadata.governanceMicrocopy,
  };
}
