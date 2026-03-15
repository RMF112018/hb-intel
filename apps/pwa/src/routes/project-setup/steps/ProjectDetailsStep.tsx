/**
 * W0-G5-T01: Step 1 — Project Details.
 * Fields: projectName, projectLocation, projectType, projectStage, department,
 *         estimatedValue, clientName, startDate.
 */
import type { ReactElement } from 'react';
import { HbcTextField, HbcSelect, HbcFormLayout } from '@hbc/ui-kit';
import type { IProjectSetupRequest, ProjectDepartment } from '@hbc/models';

const PROJECT_TYPE_OPTIONS = [
  { value: 'new-construction', label: 'New Construction' },
  { value: 'renovation', label: 'Renovation' },
  { value: 'tenant-improvement', label: 'Tenant Improvement' },
  { value: 'infrastructure', label: 'Infrastructure' },
];

const PROJECT_STAGE_OPTIONS = [
  { value: 'Pursuit', label: 'Pursuit' },
  { value: 'Active', label: 'Active' },
];

const DEPARTMENT_OPTIONS = [
  { value: 'commercial', label: 'Commercial' },
  { value: 'luxury-residential', label: 'Luxury Residential' },
];

interface ProjectDetailsStepProps {
  item: Partial<IProjectSetupRequest>;
  onChange: (patch: Partial<IProjectSetupRequest>) => void;
}

export function ProjectDetailsStep({ item, onChange }: ProjectDetailsStepProps): ReactElement {
  return (
    <HbcFormLayout columns={2} gap="medium">
      <HbcTextField
        label="Project Name"
        value={item.projectName ?? ''}
        onChange={(v) => onChange({ projectName: v })}
        required
        placeholder="Enter project name"
      />
      <HbcTextField
        label="Project Location"
        value={item.projectLocation ?? ''}
        onChange={(v) => onChange({ projectLocation: v })}
        required
        placeholder="Enter location"
      />
      <HbcSelect
        label="Project Type"
        value={item.projectType ?? ''}
        onChange={(v) => onChange({ projectType: v })}
        options={PROJECT_TYPE_OPTIONS}
        required
        placeholder="Select type"
      />
      <HbcSelect
        label="Project Stage"
        value={item.projectStage ?? ''}
        onChange={(v) => onChange({ projectStage: v as IProjectSetupRequest['projectStage'] })}
        options={PROJECT_STAGE_OPTIONS}
        required
        placeholder="Select stage"
      />
      <HbcSelect
        label="Department"
        value={item.department ?? ''}
        onChange={(v) => onChange({ department: v as ProjectDepartment })}
        options={DEPARTMENT_OPTIONS}
        required
        placeholder="Select department"
      />
      <HbcTextField
        label="Estimated Value"
        value={item.estimatedValue != null ? String(item.estimatedValue) : ''}
        onChange={(v) => onChange({ estimatedValue: v ? Number(v) : undefined })}
        type="number"
        placeholder="Optional"
      />
      <HbcTextField
        label="Client Name"
        value={item.clientName ?? ''}
        onChange={(v) => onChange({ clientName: v || undefined })}
        placeholder="Optional"
      />
      <HbcTextField
        label="Start Date"
        value={item.startDate ?? ''}
        onChange={(v) => onChange({ startDate: v || undefined })}
        type="date"
      />
    </HbcFormLayout>
  );
}
