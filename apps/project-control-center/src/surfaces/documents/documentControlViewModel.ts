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

import { DOCUMENT_CONTROL_ROLE_CODES, DOCUMENT_CONTROL_ROLE_VOCABULARY } from '@hbc/models/pcc';
import type {
  DocumentControlReviewState,
  DocumentControlReviewType,
  DocumentControlRoleCode,
  IDocumentControlActionCode,
  IDocumentControlRoleVocabularyEntry,
  IDocumentControlSource,
  IDocumentControlUniversalHardNoRule,
  IProjectDocumentSourceHealth,
  IProjectDocumentSourceRegistryEntry,
  PccDocumentControlReadModel,
  PccDocumentControlReviewQueueItem,
  PccDocumentControlRoleActionAvailability,
  PccPersona,
  PccProjectId,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
  PccReadModelWarning,
} from '@hbc/models/pcc';
import { resolveLaneEnvelopeMessage, type ISourceStateMessage } from './sourceStateMessaging';

export interface IPccDocumentsReadModelClient {
  getDocumentControl(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccDocumentControlReadModel>>;
}

export type DocumentControlWave7LaneId = 'project-record' | 'my-project-files' | 'external-systems';

export const WAVE7_LANE_ORDER: readonly DocumentControlWave7LaneId[] = [
  'project-record',
  'my-project-files',
  'external-systems',
];

export const WAVE7_LANE_TITLES: Readonly<Record<DocumentControlWave7LaneId, string>> = {
  'project-record': 'Project Record',
  'my-project-files': 'My Project Files',
  'external-systems': 'External Platforms',
};

export const WAVE7_LANE_DESCRIPTIONS: Readonly<Record<DocumentControlWave7LaneId, string>> = {
  'project-record':
    'Formal project files in the SharePoint project-site libraries. Project Record is the formal project record; document actions are managed in SharePoint.',
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
  /**
   * Envelope-level degraded cue. Set when `envelope.sourceStatus !== 'available'`.
   * Carries lane-aware product-safe copy so the lane card renders a stable
   * `data-pcc-doc-lane-degraded="<laneId>"` element instead of only an empty
   * fallback. Undefined when the envelope is `available`.
   */
  readonly degraded?: ISourceStateMessage;
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
  readonly reviewTypes: readonly DocumentControlReviewType[];
  readonly reviewStates: readonly DocumentControlReviewState[];
  readonly warnings: readonly PccReadModelWarning[];
  readonly actionCatalog: readonly IDocumentControlActionCode[];
  readonly roleActionAvailability: readonly PccDocumentControlRoleActionAvailability[];
  readonly roleVocabulary: Readonly<
    Record<DocumentControlRoleCode, IDocumentControlRoleVocabularyEntry>
  >;
  readonly roleCodes: readonly DocumentControlRoleCode[];
}

/**
 * Presentation-layer legend for availability codes. UI copy, not data —
 * lives here so cards never invent labels for code values.
 */
export const DOCUMENT_CONTROL_AVAILABILITY_LEGEND: ReadonlyArray<{
  readonly code: 'Y' | 'A' | 'O' | 'R' | 'C' | 'S' | 'D' | 'N' | 'HARD-NO';
  readonly label: string;
}> = [
  { code: 'Y', label: 'Allowed by default if project/source access exists' },
  { code: 'A', label: 'Assigned only' },
  { code: 'O', label: 'Own / current-user only' },
  { code: 'R', label: 'Request only' },
  { code: 'C', label: 'Configurable' },
  { code: 'S', label: 'Support / admin repair only' },
  { code: 'D', label: 'Deferred' },
  { code: 'N', label: 'Not allowed' },
  { code: 'HARD-NO', label: 'Forbidden by architecture' },
];

/**
 * Deterministic fixture-safe allow value. The Wave 7 fixture/read-model
 * publishes exactly one legitimate MPF folder path; any other rendered
 * path would be a leak. Sourced as a constant — NOT derived from the
 * registry being filtered — so a tampered registry (sentinel root,
 * wrong-folder, cross-project, or duplicate same-projectId entries)
 * cannot become its own canonical anchor.
 *
 * Future read-models that publish per-project allowed paths via a
 * trusted out-of-band envelope field can replace this constant with an
 * out-of-band derivation.
 */
const ALLOWED_MY_PROJECT_FILES_PATH = '/My Project Files/26-000-00-Stadium Enclave';

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
 * unless every Wave 7 hard-no rule passes:
 *
 *  - envelope must be `available` (fail closed for degraded envelopes)
 *  - envelope must have a defined `projectId`
 *  - binding `projectId` must match the envelope `projectId` (no cross-project leak)
 *  - binding `projectFolderPath` must equal `ALLOWED_MY_PROJECT_FILES_PATH`
 *    exactly. Strict equality covers sentinel root paths, wrong-folder
 *    same-projectId tampers, and any malformed input in one check.
 *
 * Non-MPF entries pass through unchanged.
 */
function isSafeMyProjectFilesEntry(
  entry: IProjectDocumentSourceRegistryEntry,
  envelopeProjectId: PccProjectId | undefined,
  sourceStatus: PccReadModelSourceStatus,
): boolean {
  if (sourceStatus !== 'available') return false;
  if (envelopeProjectId === undefined) return false;
  if (entry.binding.kind !== 'my-project-files') return true;
  if (entry.binding.projectId !== envelopeProjectId) return false;
  if (entry.binding.projectFolderPath !== ALLOWED_MY_PROJECT_FILES_PATH) return false;
  return true;
}

function laneFor(
  entry: IProjectDocumentSourceRegistryEntry,
): DocumentControlWave7LaneId | undefined {
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
    if (
      laneId === 'my-project-files' &&
      !isSafeMyProjectFilesEntry(entry, envelopeProjectId, sourceStatus)
    ) {
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
    const degraded = resolveLaneEnvelopeMessage(laneId, sourceStatus);
    lanes[laneId] = {
      ...lanes[laneId],
      health: laneHealth,
      ...(degraded ? { degraded } : {}),
    };
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
    reviewTypes: data.reviewTypes ?? [],
    reviewStates: data.reviewStates ?? [],
    warnings: envelope.warnings,
    actionCatalog: data.actionCatalog ?? [],
    roleActionAvailability: data.roleActionAvailability ?? [],
    roleVocabulary: DOCUMENT_CONTROL_ROLE_VOCABULARY,
    roleCodes: DOCUMENT_CONTROL_ROLE_CODES,
  };
}
