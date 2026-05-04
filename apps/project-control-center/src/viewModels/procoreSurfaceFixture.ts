/**
 * Wave 13 Prompt 13E — Procore surface fixture envelopes.
 *
 * Static `PccReadModelEnvelope` values built from the canonical 13B/13C
 * sample read models. Used by surface fixture-only render paths so they
 * can render the Procore card without spinning up a fixture client.
 *
 * No fetch, no client wiring, no clock reads — `generatedAtUtc` mirrors
 * the existing fixture timestamp used by adjacent surfaces.
 */

import {
  SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL,
  SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL,
  SAMPLE_PROJECT_PROFILE,
} from '@hbc/models/pcc';
import type {
  PccProcoreProjectMappingReadModel,
  PccProcoreSyncHealthReadModel,
  PccReadModelEnvelope,
} from '@hbc/models/pcc';
import {
  buildPccProcoreSurfaceViewModel,
  type IPccProcoreSurfaceViewModel,
} from './procoreSurfaceAdapter.js';

const FIXTURE_GENERATED_AT_UTC = '2026-04-30T00:00:00.000Z';

export const FIXTURE_PROCORE_PROJECT_MAPPING_ENVELOPE: PccReadModelEnvelope<PccProcoreProjectMappingReadModel> =
  {
    projectId: SAMPLE_PROJECT_PROFILE.projectId,
    mode: 'fixture',
    sourceStatus: 'available',
    readOnly: true,
    warnings: [],
    generatedAtUtc: FIXTURE_GENERATED_AT_UTC,
    data: SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL,
  };

export const FIXTURE_PROCORE_SYNC_HEALTH_ENVELOPE: PccReadModelEnvelope<PccProcoreSyncHealthReadModel> =
  {
    projectId: SAMPLE_PROJECT_PROFILE.projectId,
    mode: 'fixture',
    sourceStatus: 'available',
    readOnly: true,
    warnings: [],
    generatedAtUtc: FIXTURE_GENERATED_AT_UTC,
    data: SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL,
  };

export const FIXTURE_PROCORE_SURFACE_VIEW_MODEL: IPccProcoreSurfaceViewModel =
  buildPccProcoreSurfaceViewModel({
    projectId: SAMPLE_PROJECT_PROFILE.projectId,
    mapping: FIXTURE_PROCORE_PROJECT_MAPPING_ENVELOPE,
    syncHealth: FIXTURE_PROCORE_SYNC_HEALTH_ENVELOPE,
  });
