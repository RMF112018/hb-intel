/**
 * W0-G5-T03: Step 1 — Project Information (stepId: 'project-info').
 * Fields: projectName (req), projectLocation (req), estimatedValue (opt),
 *         clientName (opt), startDate (opt).
 * Aligned with canonical G4 step definition per T02 parity contract.
 */
import type { ReactElement } from 'react';
import { HbcTextField, HbcFormLayout, useIsMobile } from '@hbc/ui-kit';
import type { IProjectSetupRequest } from '@hbc/models';

interface ProjectInfoStepProps {
  request: Partial<IProjectSetupRequest>;
  onChange: (patch: Partial<IProjectSetupRequest>) => void;
}

export function ProjectInfoStep({ request, onChange }: ProjectInfoStepProps): ReactElement {
  const isMobile = useIsMobile();
  return (
    <HbcFormLayout columns={isMobile ? 1 : 2} gap="medium">
      <HbcTextField
        label="Project Name"
        value={request.projectName ?? ''}
        onChange={(v) => onChange({ projectName: v })}
        required
        placeholder="Enter project name"
      />
      <HbcTextField
        label="Project Location"
        value={request.projectLocation ?? ''}
        onChange={(v) => onChange({ projectLocation: v })}
        required
        placeholder="Enter location"
      />
      <HbcTextField
        label="Estimated Value"
        value={request.estimatedValue != null ? String(request.estimatedValue) : ''}
        onChange={(v) => onChange({ estimatedValue: v ? Number(v) : undefined })}
        type="number"
        placeholder="Optional"
      />
      <HbcTextField
        label="Client Name"
        value={request.clientName ?? ''}
        onChange={(v) => onChange({ clientName: v || undefined })}
        placeholder="Optional"
      />
      <HbcTextField
        label="Start Date"
        value={request.startDate ?? ''}
        onChange={(v) => onChange({ startDate: v || undefined })}
        type="date"
      />
    </HbcFormLayout>
  );
}
