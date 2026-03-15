import type { ReactNode } from 'react';
import { HbcFormSection, HbcTextField } from '@hbc/ui-kit';
import type { StepBodyProps } from './StepBodyProps.js';

/**
 * Step 1 — Project Information fields.
 * W0-G4-T01 step body for the `project-info` wizard step.
 */
export function ProjectInfoStepBody({ request, onChange }: StepBodyProps): ReactNode {
  return (
    <HbcFormSection title="Project Information">
      <HbcTextField
        label="Project Name"
        value={request.projectName ?? ''}
        onChange={(v) => onChange({ projectName: v })}
        required
      />
      <HbcTextField
        label="Project Location"
        value={request.projectLocation ?? ''}
        onChange={(v) => onChange({ projectLocation: v })}
        required
      />
      <HbcTextField
        label="Estimated Value"
        value={request.estimatedValue != null ? String(request.estimatedValue) : ''}
        onChange={(v) => onChange({ estimatedValue: v ? Number(v) : undefined })}
        type="number"
      />
      <HbcTextField
        label="Client Name"
        value={request.clientName ?? ''}
        onChange={(v) => onChange({ clientName: v || undefined })}
      />
      <HbcTextField
        label="Start Date"
        value={request.startDate ?? ''}
        onChange={(v) => onChange({ startDate: v || undefined })}
        type="date"
      />
    </HbcFormSection>
  );
}
