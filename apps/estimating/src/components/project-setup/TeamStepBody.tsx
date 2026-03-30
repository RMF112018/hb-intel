import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { getSpfxContext } from '@hbc/auth/spfx';
import { createSpfxGraphTokenProvider } from '@hbc/auth/spfx';
import { getEligibleTimberscanApprovers } from '@hbc/features-estimating';
import {
  HbcFormSection,
  HbcPeoplePicker,
  HbcSelect,
  HbcTypography,
  useGraphPeopleSearch,
  createStaticPeopleSearch,
} from '@hbc/ui-kit';
import type { PersonEntry } from '@hbc/ui-kit';
import { useProjectSetupBackend } from '../../project-setup/backend/ProjectSetupBackendContext.js';
import type { StepBodyProps } from './StepBodyProps.js';

// ── Mock people for UI-review mode ───────────────────────────────────────

const MOCK_PEOPLE: PersonEntry[] = [
  { upn: 'john.smith@hb.com', displayName: 'John Smith', jobTitle: 'Project Executive', department: 'Commercial' },
  { upn: 'jane.doe@hb.com', displayName: 'Jane Doe', jobTitle: 'Project Manager', department: 'Commercial' },
  { upn: 'mike.johnson@hb.com', displayName: 'Mike Johnson', jobTitle: 'Lead Estimator', department: 'Estimating' },
  { upn: 'sarah.williams@hb.com', displayName: 'Sarah Williams', jobTitle: 'Estimator', department: 'Estimating' },
  { upn: 'robert.brown@hb.com', displayName: 'Robert Brown', jobTitle: 'Superintendent', department: 'Field Operations' },
  { upn: 'emily.davis@hb.com', displayName: 'Emily Davis', jobTitle: 'Project Engineer', department: 'Engineering' },
  { upn: 'david.wilson@hb.com', displayName: 'David Wilson', jobTitle: 'Safety Manager', department: 'Safety' },
  { upn: 'lisa.martinez@hb.com', displayName: 'Lisa Martinez', jobTitle: 'Accounting Manager', department: 'Accounting' },
];

const mockSearchPeople = createStaticPeopleSearch(MOCK_PEOPLE);

// ── Helpers ───────────────────────────────────────────────────────────────

/** Convert a single UPN string to a PersonEntry[] for single-select value prop. */
function upnToValue(upn: string | undefined): PersonEntry[] {
  return upn ? [{ upn, displayName: upn }] : [];
}

/** Convert PersonEntry[] from onChange to a single UPN string. */
function valueToUpn(people: PersonEntry[]): string | undefined {
  return people[0]?.upn ?? undefined;
}

/** Convert string[] UPNs to PersonEntry[] for multi-select value prop. */
function upnsToValue(upns: string[] | undefined): PersonEntry[] {
  return (upns ?? []).map((upn) => ({ upn, displayName: upn }));
}

/** Convert PersonEntry[] from onChange to UPN string[]. */
function valueToUpns(people: PersonEntry[]): string[] {
  return people.map((p) => p.upn);
}

// ── Component ─────────────────────────────────────────────────────────────

/**
 * Step 3 — Project team assignment fields.
 * Uses HbcPeoplePicker with Graph live lookup in production mode,
 * or mock static search in UI-review mode.
 */
export function TeamStepBody({ request, onChange }: StepBodyProps): ReactNode {
  const { isUiReview } = useProjectSetupBackend();

  // Graph token provider — only available in SPFx production context
  const getGraphToken = useMemo(() => {
    if (isUiReview) return undefined;
    const ctx = getSpfxContext();
    return createSpfxGraphTokenProvider(ctx);
  }, [isUiReview]);

  const graphSearchPeople = useGraphPeopleSearch(getGraphToken);
  const searchPeople = isUiReview ? mockSearchPeople : graphSearchPeople;

  const timberscanApproverOptions = getEligibleTimberscanApprovers(request).map((upn) => ({
    value: upn,
    label: upn,
  }));

  return (
    <HbcFormSection title="Project Team">
      <HbcPeoplePicker
        label="Project Executive"
        value={upnToValue(request.projectExecutiveUpn)}
        onChange={(people) => onChange({ projectExecutiveUpn: valueToUpn(people) })}
        searchPeople={searchPeople}
        mode="single"
        required
      />
      <HbcPeoplePicker
        label="Project Manager"
        value={upnToValue(request.projectManagerUpn)}
        onChange={(people) => onChange({ projectManagerUpn: valueToUpn(people) })}
        searchPeople={searchPeople}
        mode="single"
      />
      <HbcPeoplePicker
        label="Lead Estimator"
        value={upnToValue(request.leadEstimatorUpn)}
        onChange={(people) => onChange({ leadEstimatorUpn: valueToUpn(people) })}
        searchPeople={searchPeople}
        mode="single"
        required
      />
      <HbcPeoplePicker
        label="Supporting Estimators"
        value={upnsToValue(request.supportingEstimatorUpns)}
        onChange={(people) => onChange({ supportingEstimatorUpns: valueToUpns(people) })}
        searchPeople={searchPeople}
        mode="multi"
      />
      <HbcPeoplePicker
        label="Additional Team Members"
        value={upnsToValue(request.additionalTeamMemberUpns)}
        onChange={(people) => onChange({ additionalTeamMemberUpns: valueToUpns(people) })}
        searchPeople={searchPeople}
        mode="multi"
      />
      <HbcSelect
        label="Timberscan Approver"
        options={timberscanApproverOptions}
        value={request.timberscanApproverUpn ?? ''}
        onChange={(value) => onChange({ timberscanApproverUpn: value || undefined })}
        placeholder={
          timberscanApproverOptions.length > 0
            ? 'Select an eligible approver'
            : 'Add project team members first'
        }
        disabled={timberscanApproverOptions.length === 0}
        required
      />
      {timberscanApproverOptions.length === 0 && (
        <HbcTypography intent="body">
          Timberscan Approver options appear after at least one upstream team member is added.
        </HbcTypography>
      )}
    </HbcFormSection>
  );
}
