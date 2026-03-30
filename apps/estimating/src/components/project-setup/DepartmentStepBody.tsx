import type { ReactNode } from 'react';
import {
  CONTRACT_TYPE_OPTIONS,
  getProjectTypeOptionsForDepartment,
  OFFICE_DIVISION_OPTIONS,
  PROJECT_STAGE_OPTIONS,
} from '@hbc/features-estimating';
import { HbcFormSection, HbcSelect } from '@hbc/ui-kit';
import type { StepBodyProps } from './StepBodyProps.js';

const DEPARTMENT_OPTIONS = [
  { value: 'commercial', label: 'Commercial' },
  { value: 'luxury-residential', label: 'Luxury Residential' },
];

/**
 * Step 2 — Department & project classification fields.
 * W0-G4-T01 step body for the `department` wizard step.
 */
export function DepartmentStepBody({ request, onChange }: StepBodyProps): ReactNode {
  const projectTypeOptions = getProjectTypeOptionsForDepartment(request.department);

  return (
    <HbcFormSection title="Department & Type">
      <HbcSelect
        label="Project Stage"
        options={[...PROJECT_STAGE_OPTIONS]}
        value={request.projectStage ?? ''}
        onChange={(v) => onChange({ projectStage: v as NonNullable<typeof request.projectStage> })}
      />
      <HbcSelect
        label="Office & Division"
        options={[...OFFICE_DIVISION_OPTIONS]}
        value={request.officeDivision ?? ''}
        onChange={(v) => onChange({ officeDivision: v || undefined })}
      />
      <HbcSelect
        label="Department"
        options={DEPARTMENT_OPTIONS}
        value={request.department ?? ''}
        onChange={(v) => {
          const nextDepartment = v as 'commercial' | 'luxury-residential';
          const nextProjectTypeOptions = getProjectTypeOptionsForDepartment(nextDepartment);
          const currentProjectTypeIsValid = nextProjectTypeOptions.some(
            (option) => option.value === request.projectType && !option.disabled,
          );

          onChange({
            department: nextDepartment,
            projectType: currentProjectTypeIsValid ? request.projectType : undefined,
          });
        }}
        required
      />
      <HbcSelect
        label="Project Type"
        options={[...projectTypeOptions]}
        value={request.projectType ?? ''}
        onChange={(v) => onChange({ projectType: v })}
        placeholder={request.department ? 'Search project types' : 'Select a department first'}
        disabled={!request.department}
        required
      />
      <HbcSelect
        label="Contract Type"
        options={[...CONTRACT_TYPE_OPTIONS]}
        value={request.contractType ?? ''}
        onChange={(v) => onChange({ contractType: v || undefined })}
      />
    </HbcFormSection>
  );
}
