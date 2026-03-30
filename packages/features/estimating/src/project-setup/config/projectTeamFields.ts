import type { IProjectSetupRequest } from '@hbc/models';

const UPSTREAM_TEAM_FIELDS = [
  'projectExecutiveUpn',
  'projectManagerUpn',
  'leadEstimatorUpn',
  'supportingEstimatorUpns',
  'additionalTeamMemberUpns',
] as const;

export type ProjectTeamFieldId = (typeof UPSTREAM_TEAM_FIELDS)[number] | 'timberscanApproverUpn';

function trimPerson(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizePeople(values?: readonly string[]): string[] | undefined {
  if (!values?.length) return undefined;

  const normalized = Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );

  return normalized.length > 0 ? normalized : undefined;
}

export function getEligibleTimberscanApprovers(
  request: Partial<IProjectSetupRequest>,
): string[] {
  const eligible: string[] = [];
  const seen = new Set<string>();

  const addPerson = (value?: string) => {
    const person = trimPerson(value);
    if (!person || seen.has(person)) return;
    seen.add(person);
    eligible.push(person);
  };

  addPerson(request.projectExecutiveUpn);
  addPerson(request.projectManagerUpn);
  addPerson(request.leadEstimatorUpn);

  for (const person of request.supportingEstimatorUpns ?? []) {
    addPerson(person);
  }

  for (const person of request.additionalTeamMemberUpns ?? []) {
    addPerson(person);
  }

  return eligible;
}

export function normalizeProjectSetupTeamFields<T extends IProjectSetupRequest>(
  request: T,
): T;
export function normalizeProjectSetupTeamFields(
  request: Partial<IProjectSetupRequest>,
): Partial<IProjectSetupRequest>;
export function normalizeProjectSetupTeamFields<T extends Partial<IProjectSetupRequest>>(
  request: T,
): T {
  const normalized: Partial<IProjectSetupRequest> = { ...request };

  const hasNewTeamFields = UPSTREAM_TEAM_FIELDS.some((field) => {
    const value = normalized[field];
    if (Array.isArray(value)) return value.length > 0;
    return typeof value === 'string' && value.trim().length > 0;
  });

  normalized.projectExecutiveUpn = trimPerson(normalized.projectExecutiveUpn);
  normalized.projectManagerUpn = trimPerson(normalized.projectManagerUpn);
  normalized.leadEstimatorUpn = trimPerson(normalized.leadEstimatorUpn);
  normalized.supportingEstimatorUpns = normalizePeople(normalized.supportingEstimatorUpns);
  normalized.additionalTeamMemberUpns = normalizePeople(normalized.additionalTeamMemberUpns);

  if (!hasNewTeamFields) {
    normalized.projectManagerUpn = normalized.projectManagerUpn ?? trimPerson(normalized.projectLeadId);

    const legacyAdditionalMembers = normalizePeople(
      (normalized.groupMembers ?? []).filter((person) => person !== normalized.projectLeadId),
    );
    if (!normalized.additionalTeamMemberUpns && legacyAdditionalMembers) {
      normalized.additionalTeamMemberUpns = legacyAdditionalMembers;
    }
  }

  const eligibleApprovers = getEligibleTimberscanApprovers(normalized);
  const timberscanApprover = trimPerson(normalized.timberscanApproverUpn);
  normalized.timberscanApproverUpn =
    timberscanApprover && eligibleApprovers.includes(timberscanApprover)
      ? timberscanApprover
      : undefined;

  normalized.projectLeadId = normalized.projectManagerUpn;
  normalized.groupLeaders = normalized.projectExecutiveUpn
    ? [normalized.projectExecutiveUpn]
    : undefined;
  normalized.groupMembers = Array.from(
    new Set(
      [
        normalized.projectManagerUpn,
        normalized.leadEstimatorUpn,
        ...(normalized.supportingEstimatorUpns ?? []),
        ...(normalized.additionalTeamMemberUpns ?? []),
      ].filter((value): value is string => Boolean(value)),
    ),
  );
  normalized.viewerUPNs = undefined;

  return normalized as T;
}
