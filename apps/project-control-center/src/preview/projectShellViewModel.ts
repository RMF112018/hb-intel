import type { IProjectProfile, PccMvpSurfaceId, PccProjectStage } from '@hbc/models/pcc';
import { PCC_MVP_SURFACES } from '@hbc/models/pcc';
import { PCC_SURFACE_HERO_DESCRIPTIONS } from '../shell/surfaceHeroCopy';
import {
  PCC_SHELL_SURFACE_HEADER_METADATA,
  type IPccShellSurfaceCue,
  type IPccShellSurfaceHeaderMetadata,
  type IPccShellSurfaceSummaryItem,
  type PccShellSurfaceSummaryTone,
} from '../shell/surfaceHeaderMetadata';

export type {
  PccShellSurfaceSummaryTone,
  IPccShellSurfaceSummaryItem,
  IPccShellSurfaceCue,
  IPccShellSurfaceHeaderMetadata,
};

/**
 * Hero view-model the PCC shell renders. Profile-derived; no source-confidence,
 * no client name, no status pills, no last-updated, no project number. Wave 15A
 * wave-b7 Prompt 02 — extends the seam with typed shell surface metadata
 * (`surfaceSummaryItems`, `surfaceCues`, `readOnlyCue`) sourced from
 * `PCC_SHELL_SURFACE_HEADER_METADATA`. The new fields are inert at render
 * time and carry no live counts or writeback authority.
 */
export interface IPccShellHeroViewModel {
  readonly primaryTitle: 'Project Control Center';
  readonly secondaryTitle: string;
  readonly surfaceDescription: string;
  readonly projectName: string;
  readonly location: string;
  readonly estimatedValueDisplay: string;
  readonly scheduledCompletionDisplay: string;
  readonly projectStageLabel: string;
  readonly surfaceSummaryItems: readonly IPccShellSurfaceSummaryItem[];
  readonly surfaceCues: readonly IPccShellSurfaceCue[];
  readonly readOnlyCue: string;
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
  activeSurfaceId: PccMvpSurfaceId,
): IPccShellHeroViewModel {
  const surface = PCC_MVP_SURFACES[activeSurfaceId];
  const headerMetadata = PCC_SHELL_SURFACE_HEADER_METADATA[activeSurfaceId];
  return {
    primaryTitle: 'Project Control Center',
    secondaryTitle: surface.displayName,
    surfaceDescription: PCC_SURFACE_HERO_DESCRIPTIONS[activeSurfaceId],
    projectName: profile.projectName,
    location: profile.projectLocation ?? NOT_LISTED,
    estimatedValueDisplay: formatEstimatedValue(profile.estimatedValue),
    scheduledCompletionDisplay: formatScheduledCompletion(profile.scheduledCompletionDate),
    projectStageLabel: formatProjectStage(profile.projectStage),
    surfaceSummaryItems: headerMetadata.surfaceSummaryItems,
    surfaceCues: headerMetadata.surfaceCues,
    readOnlyCue: headerMetadata.readOnlyCue,
  };
}
