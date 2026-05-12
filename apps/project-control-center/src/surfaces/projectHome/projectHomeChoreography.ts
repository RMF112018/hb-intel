/**
 * Project Home choreography data — established in Phase 06 Prompt 02 and
 * re-centered in Phase 08 Prompt 09.
 *
 * Defines the canonical Project Home nine-card operational spine, the
 * per-card span override matrix consumed by `PccDashboardCard`'s
 * `spanOverrides` prop, and the gateway-action mapping that wires each
 * card to a `PccModuleId` via `shell.selectModule`.
 *
 * Phase 08 Prompt 09 re-centered the first fold around Priority Actions →
 * Project Readiness → Document Control Center, with Site Health Summary
 * repositioned into the second row alongside the analytics pair. The
 * operational-only filtered spine order is now:
 *   Priority Actions → Project Readiness → Document Control Center →
 *   Site Health Summary → Approvals & Checkpoints →
 *   Missing Configurations → External Platforms → Team Snapshot →
 *   Recent Activity.
 *
 * Project-Home-scoped data only. No layout primitive lives here.
 */

import type { PccModuleId } from '@hbc/models/pcc';
import type { PccCardSpanOverrides } from '../../layout/footprints';

// TODO(post-mvp): Implement stage/lifecycle-aware Project Home context using
// the PCC Product Architecture and User Journey Blueprint as the governing
// reference. Project Home should adjust card priority, analytics emphasis,
// gateway recommendations, and command context based on project stage,
// lifecycle signals, role/persona, and source-backed project readiness.
// This must remain read-model driven until a future command-model contract
// authorizes workflow execution or source-system writeback.

export type PccProjectHomeOperationalCardKey =
  | 'priorityActions'
  | 'siteHealthSummary'
  | 'documentControl'
  | 'projectReadiness'
  | 'approvalsCheckpoints'
  | 'missingConfigurations'
  | 'externalPlatforms'
  | 'teamSnapshot'
  | 'recentActivity';

export const PROJECT_HOME_OPERATIONAL_CARD_KEYS: readonly PccProjectHomeOperationalCardKey[] = [
  'priorityActions',
  'projectReadiness',
  'documentControl',
  'siteHealthSummary',
  'approvalsCheckpoints',
  'missingConfigurations',
  'externalPlatforms',
  'teamSnapshot',
  'recentActivity',
] as const;

export const PROJECT_HOME_OPERATIONAL_CARD_TITLES: Readonly<
  Record<PccProjectHomeOperationalCardKey, string>
> = {
  priorityActions: 'Priority Actions',
  siteHealthSummary: 'Site Health Summary',
  documentControl: 'Document Control Center',
  projectReadiness: 'Project Readiness',
  approvalsCheckpoints: 'Approvals & Checkpoints',
  missingConfigurations: 'Missing Configurations',
  externalPlatforms: 'External Platforms',
  teamSnapshot: 'Team Snapshot',
  recentActivity: 'Recent Activity',
};

const projectHomeSpan = (
  twelveColumnSpan: number,
  standardLaptopSpan: number,
): PccCardSpanOverrides => ({
  largeLaptop: twelveColumnSpan,
  desktop: twelveColumnSpan,
  ultrawide: twelveColumnSpan,
  standardLaptop: standardLaptopSpan,
});

export const PROJECT_HOME_OPERATIONAL_SPAN_OVERRIDES: Readonly<
  Record<PccProjectHomeOperationalCardKey, PccCardSpanOverrides>
> = {
  priorityActions: projectHomeSpan(5, 4),
  siteHealthSummary: projectHomeSpan(4, 4),
  documentControl: projectHomeSpan(4, 3),
  projectReadiness: projectHomeSpan(3, 3),
  approvalsCheckpoints: projectHomeSpan(4, 3),
  missingConfigurations: projectHomeSpan(4, 3),
  externalPlatforms: projectHomeSpan(4, 3),
  teamSnapshot: projectHomeSpan(3, 3),
  recentActivity: projectHomeSpan(5, 4),
};

export interface PccProjectHomeOperationalGateway {
  readonly key: PccProjectHomeOperationalCardKey;
  readonly label: string;
  readonly moduleId?: PccModuleId;
  readonly disabledReason?: string;
}

// TODO(post-mvp): Retarget Project Readiness to a dedicated readiness module
// if the Phase 05 navigation registry adds one. The MVP gateway opens
// Startup Center because no `project-readiness` module id currently exists.

export const PROJECT_HOME_OPERATIONAL_GATEWAYS: Readonly<
  Record<PccProjectHomeOperationalCardKey, PccProjectHomeOperationalGateway>
> = {
  priorityActions: {
    key: 'priorityActions',
    label: 'Open Action Center',
    moduleId: 'action-center',
  },
  siteHealthSummary: {
    key: 'siteHealthSummary',
    label: 'Open Site Health',
    moduleId: 'site-health',
  },
  documentControl: {
    key: 'documentControl',
    label: 'Open Document Control',
    moduleId: 'document-control-center',
  },
  projectReadiness: {
    key: 'projectReadiness',
    label: 'Open Startup Center',
    moduleId: 'startup-center',
  },
  approvalsCheckpoints: {
    key: 'approvalsCheckpoints',
    label: 'Open Approvals',
    moduleId: 'approvals-checkpoints',
  },
  missingConfigurations: {
    key: 'missingConfigurations',
    label: 'Open Settings',
    moduleId: 'control-center-settings',
  },
  externalPlatforms: {
    key: 'externalPlatforms',
    label: 'Open External Platforms',
    moduleId: 'external-platforms',
  },
  teamSnapshot: {
    key: 'teamSnapshot',
    label: 'Open Team & Access',
    moduleId: 'team-access',
  },
  recentActivity: {
    key: 'recentActivity',
    label: 'View Activity Context',
    disabledReason: 'Activity context is preview-only in this release.',
  },
};
