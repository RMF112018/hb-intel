import type { IProjectSetupRequest } from '@hbc/models';
import { PROJECT_STAGE_OPTIONS, isValidProjectStage } from './departmentTypeOptions.js';

const LOCATION_FIELDS = [
  'projectStreetAddress',
  'projectCity',
  'projectCounty',
  'projectState',
  'projectZip',
] as const;

export type ProjectLocationFieldId = (typeof LOCATION_FIELDS)[number];

export function buildProjectLocationSummary(
  request: Partial<IProjectSetupRequest>,
): string {
  return [
    request.projectStreetAddress,
    request.projectCity,
    request.projectCounty,
    request.projectState,
    request.projectZip,
  ]
    .map((value) => value?.trim() ?? '')
    .filter(Boolean)
    .join(', ');
}

export function normalizeProjectSetupRequestFields<T extends IProjectSetupRequest>(
  request: T,
): T;
export function normalizeProjectSetupRequestFields(
  request: Partial<IProjectSetupRequest>,
): Partial<IProjectSetupRequest>;
export function normalizeProjectSetupRequestFields<T extends Partial<IProjectSetupRequest>>(
  request: T,
): T {
  const hasStructuredLocation = LOCATION_FIELDS.some((field) => {
    const value = request[field];
    return typeof value === 'string' && value.trim().length > 0;
  });

  const normalized: Partial<IProjectSetupRequest> = { ...request };

  if (!hasStructuredLocation && request.projectLocation?.trim()) {
    normalized.projectStreetAddress = request.projectLocation;
  }

  if (request.projectStage && !isValidProjectStage(request.projectStage)) {
    normalized.projectStage = undefined;
  }

  if (!normalized.projectStage && !('projectStage' in request)) {
    normalized.projectStage = PROJECT_STAGE_OPTIONS[0]?.value as IProjectSetupRequest['projectStage'];
  }

  normalized.projectLocation = buildProjectLocationSummary(normalized);
  return normalized as T;
}
