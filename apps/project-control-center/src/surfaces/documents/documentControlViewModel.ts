/**
 * Wave 7 / Prompt 03B — Document Control view-model and narrow read-model
 * client interface for the Documents surface.
 *
 * The narrow consumer interface is defined here (not re-exported from
 * `src/api/`) so non-api consumers type the client prop without crossing
 * the controlled-consumption guard for `IPccReadModelClient`. TypeScript
 * structural typing lets the full client flow into a value typed as
 * `IPccDocumentsReadModelClient`.
 *
 * The adapter `buildPccDocumentControlViewModel` enforces all MPF
 * hard-no rules (no root browsing, no other-project folders) so the
 * downstream lane card stays presentational and trusts its props.
 */

import type {
  IDocumentControlSource,
  IDocumentControlUniversalHardNoRule,
  IProjectDocumentSourceHealth,
  IProjectDocumentSourceRegistryEntry,
  PccDocumentControlReadModel,
  PccDocumentControlReviewQueueItem,
  PccPersona,
  PccProjectId,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
  PccReadModelWarning,
} from '@hbc/models/pcc';

export interface IPccDocumentsReadModelClient {
  getDocumentControl(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccDocumentControlReadModel>>;
}

export type DocumentControlWave7LaneId =
  | 'project-record'
  | 'my-project-files'
  | 'external-systems';

export const WAVE7_LANE_ORDER: readonly DocumentControlWave7LaneId[] = [
  'project-record',
  'my-project-files',
  'external-systems',
];

export const WAVE7_LANE_TITLES: Readonly<Record<DocumentControlWave7LaneId, string>> = {
  'project-record': 'Project Record',
  'my-project-files': 'My Project Files',
  'external-systems': 'External Systems',
};

export const WAVE7_LANE_DESCRIPTIONS: Readonly<Record<DocumentControlWave7LaneId, string>> = {
  'project-record':
    'Formal project files in the SharePoint project-site libraries. Project Record is the formal project record; file actions are read-only in this preview.',
  'my-project-files':
    'Working files for this project in the current user’s Microsoft 365 file space. Working files are not part of the formal project record unless submitted to Project Record.',
  'external-systems':
    'Connected external systems for visibility and launch only. PCC does not mirror, sync, or write back to external systems.',
};

export const MY_PROJECT_FILES_WARNING_TEXT =
  'Files in My Project Files are working files for this project. They are not part of the formal project record unless submitted to Project Record.';

export const HB_DOCUMENT_CONTROL_CENTER_TITLE = 'HB Document Control Center';
export const LEGACY_DOCUMENT_CONTROL_CENTER_LABEL = 'Document Control Center';

export interface IPccDocumentControlLaneViewModel {
  readonly laneId: DocumentControlWave7LaneId;
  readonly title: string;
  readonly description: string;
  readonly entries: readonly IProjectDocumentSourceRegistryEntry[];
  readonly health: readonly IProjectDocumentSourceHealth[];
  readonly warningText?: string;
}

export interface IPccDocumentControlViewModel {
  readonly header: {
    readonly title: typeof HB_DOCUMENT_CONTROL_CENTER_TITLE;
    readonly legacyLabel: typeof LEGACY_DOCUMENT_CONTROL_CENTER_LABEL;
    readonly sourceStatus: PccReadModelSourceStatus;
    readonly readOnly: boolean;
  };
  readonly lanes: Readonly<Record<DocumentControlWave7LaneId, IPccDocumentControlLaneViewModel>>;
  readonly legacySources: readonly IDocumentControlSource[];
  readonly hardNoRules: readonly IDocumentControlUniversalHardNoRule[];
  readonly reviewQueueSample: readonly PccDocumentControlReviewQueueItem[];
  readonly warnings: readonly PccReadModelWarning[];
}

const MPF_ROOT_PATH = '/My Project Files';
const MPF_ROOT_PATH_TRAILING = '/My Project Files/';

function emptyLane(laneId: DocumentControlWave7LaneId): IPccDocumentControlLaneViewModel {
  return {
    laneId,
    title: WAVE7_LANE_TITLES[laneId],
    description: WAVE7_LANE_DESCRIPTIONS[laneId],
    entries: [],
    health: [],
    warningText: laneId === 'my-project-files' ? MY_PROJECT_FILES_WARNING_TEXT : undefined,
  };
}

/**
 * Adapter-owned MPF safety filtering. Drops any my-project-files entry
 * that fails any of the Wave 7 hard-no rules:
 *
 *  - sentinel root path `/My Project Files` or `/My Project Files/`
 *  - cross-project leakage (`binding.projectId` !== current project)
 *  - malformed path that does not start with `/My Project Files/`
 *
 * Per Wave 7 hard-no doctrine, also fails closed for unknown-project
 * envelopes: when `sourceStatus !== 'available'`, all MPF entries are
 * dropped regardless of binding contents.
 */
function isSafeMyProjectFilesEntry(
  entry: IProjectDocumentSourceRegistryEntry,
  envelopeProjectId: PccProjectId | undefined,
  sourceStatus: PccReadModelSourceStatus,
): boolean {
  if (sourceStatus !== 'available') return false;
  if (envelopeProjectId === undefined) return false;
  if (entry.binding.kind !== 'my-project-files') return true;
  const path = entry.binding.projectFolderPath;
  if (typeof path !== 'string' || path.length === 0) return false;
  if (path === MPF_ROOT_PATH || path === MPF_ROOT_PATH_TRAILING) return false;
  if (!path.startsWith(MPF_ROOT_PATH_TRAILING)) return false;
  if (entry.binding.projectId !== envelopeProjectId) return false;
  return true;
}

function laneFor(entry: IProjectDocumentSourceRegistryEntry): DocumentControlWave7LaneId | undefined {
  if (entry.wave7Lane === 'project-record') return 'project-record';
  if (entry.wave7Lane === 'my-project-files') return 'my-project-files';
  if (entry.wave7Lane === 'external-systems') return 'external-systems';
  return undefined;
}

export function buildPccDocumentControlViewModel(
  envelope: PccReadModelEnvelope<PccDocumentControlReadModel>,
): IPccDocumentControlViewModel {
  const sourceStatus = envelope.sourceStatus;
  const envelopeProjectId = envelope.projectId;
  const data = envelope.data;
  const registry = data.sourceRegistry ?? [];
  const health = data.sourceHealth ?? [];

  const lanes: Record<DocumentControlWave7LaneId, IPccDocumentControlLaneViewModel> = {
    'project-record': emptyLane('project-record'),
    'my-project-files': emptyLane('my-project-files'),
    'external-systems': emptyLane('external-systems'),
  };

  for (const entry of registry) {
    const laneId = laneFor(entry);
    if (!laneId) continue;
    if (laneId === 'my-project-files'
      && !isSafeMyProjectFilesEntry(entry, envelopeProjectId, sourceStatus)) {
      continue;
    }
    const current = lanes[laneId];
    lanes[laneId] = {
      ...current,
      entries: [...current.entries, entry],
    };
  }

  for (const laneId of WAVE7_LANE_ORDER) {
    const laneEntryKeys = new Set(lanes[laneId].entries.map((e) => e.sourceKey));
    const laneHealth = health.filter((h) => laneEntryKeys.has(h.sourceKey));
    lanes[laneId] = { ...lanes[laneId], health: laneHealth };
  }

  return {
    header: {
      title: HB_DOCUMENT_CONTROL_CENTER_TITLE,
      legacyLabel: LEGACY_DOCUMENT_CONTROL_CENTER_LABEL,
      sourceStatus,
      readOnly: envelope.readOnly,
    },
    lanes,
    legacySources: data.sources,
    hardNoRules: data.hardNoRules ?? [],
    reviewQueueSample: data.reviewQueueSample ?? [],
    warnings: envelope.warnings,
  };
}
