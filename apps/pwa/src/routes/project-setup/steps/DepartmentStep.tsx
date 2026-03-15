/**
 * W0-G5-T03: Step 2 — Department & Type (stepId: 'department').
 * Fields: department (req), projectType (req), projectStage (opt), contractType (opt).
 * Aligned with canonical G4 step definition per T02 parity contract.
 */
import type { ReactElement } from 'react';
import { HbcSelect, HbcFormLayout, useIsMobile } from '@hbc/ui-kit';
import type { IProjectSetupRequest, ProjectDepartment } from '@hbc/models';

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

const CONTRACT_TYPE_OPTIONS = [
  { value: 'lump-sum', label: 'Lump Sum' },
  { value: 'gmp', label: 'Guaranteed Maximum Price (GMP)' },
  { value: 'cost-plus', label: 'Cost Plus' },
  { value: 'design-build', label: 'Design-Build' },
  { value: 'time-and-materials', label: 'Time & Materials' },
];

interface DepartmentStepProps {
  request: Partial<IProjectSetupRequest>;
  onChange: (patch: Partial<IProjectSetupRequest>) => void;
}

export function DepartmentStep({ request, onChange }: DepartmentStepProps): ReactElement {
  const isMobile = useIsMobile();
  return (
    <HbcFormLayout columns={isMobile ? 1 : 2} gap="medium">
      <HbcSelect
        label="Department"
        value={request.department ?? ''}
        onChange={(v) => onChange({ department: v as ProjectDepartment })}
        options={DEPARTMENT_OPTIONS}
        required
        placeholder="Select department"
      />
      <HbcSelect
        label="Project Type"
        value={request.projectType ?? ''}
        onChange={(v) => onChange({ projectType: v })}
        options={PROJECT_TYPE_OPTIONS}
        required
        placeholder="Select type"
      />
      <HbcSelect
        label="Project Stage"
        value={request.projectStage ?? ''}
        onChange={(v) => onChange({ projectStage: v as IProjectSetupRequest['projectStage'] })}
        options={PROJECT_STAGE_OPTIONS}
        placeholder="Optional"
      />
      <HbcSelect
        label="Contract Type"
        value={request.contractType ?? ''}
        onChange={(v) => onChange({ contractType: v })}
        options={CONTRACT_TYPE_OPTIONS}
        placeholder="Optional"
      />
    </HbcFormLayout>
  );
}
