import type { ReactNode } from 'react';
import { HbcFormSection, HbcSelect, HbcTextField } from '@hbc/ui-kit';
import type { StepBodyProps } from './StepBodyProps.js';

const DEPARTMENT_OPTIONS = [
  { value: 'commercial', label: 'Commercial' },
  { value: 'luxury-residential', label: 'Luxury Residential' },
];

const PROJECT_TYPE_OPTIONS = [
  { value: 'GC', label: 'GC' },
  { value: 'CM', label: 'CM' },
  { value: 'Design-Build', label: 'Design-Build' },
  { value: 'Other', label: 'Other' },
];

const PROJECT_STAGE_OPTIONS = [
  { value: 'Pursuit', label: 'Pursuit' },
  { value: 'Active', label: 'Active' },
];

/**
 * Step 2 — Department & project classification fields.
 * W0-G4-T01 step body for the `department` wizard step.
 */
export function DepartmentStepBody({ request, onChange }: StepBodyProps): ReactNode {
  return (
    <HbcFormSection title="Department & Classification">
      <HbcSelect
        label="Department"
        options={DEPARTMENT_OPTIONS}
        value={request.department ?? ''}
        onChange={(v) => onChange({ department: v as 'commercial' | 'luxury-residential' })}
        required
      />
      <HbcSelect
        label="Project Type"
        options={PROJECT_TYPE_OPTIONS}
        value={request.projectType ?? ''}
        onChange={(v) => onChange({ projectType: v })}
        required
      />
      <HbcSelect
        label="Project Stage"
        options={PROJECT_STAGE_OPTIONS}
        value={request.projectStage ?? ''}
        onChange={(v) => onChange({ projectStage: v as 'Pursuit' | 'Active' })}
      />
      <HbcTextField
        label="Contract Type"
        value={request.contractType ?? ''}
        onChange={(v) => onChange({ contractType: v || undefined })}
      />
    </HbcFormSection>
  );
}
