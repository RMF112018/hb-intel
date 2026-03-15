/**
 * W0-G5-T01: Step wizard configuration for the Project Setup request flow.
 * 5 steps derived from IProjectSetupRequest field annotations (D5).
 */
import type { IStepWizardConfig } from '@hbc/step-wizard';
import type { IProjectSetupRequest } from '@hbc/models';

export const PROJECT_SETUP_WIZARD_CONFIG: IStepWizardConfig<Partial<IProjectSetupRequest>> = {
  title: 'New Project Setup Request',
  orderMode: 'sequential',
  allowReopen: true,
  steps: [
    {
      stepId: 'details',
      label: 'Project Details',
      required: true,
      order: 1,
      validate: (item) => {
        if (!item.projectName?.trim()) return 'Project name is required.';
        if (!item.projectLocation?.trim()) return 'Project location is required.';
        if (!item.projectType?.trim()) return 'Project type is required.';
        if (!item.projectStage) return 'Project stage is required.';
        if (!item.department) return 'Department is required.';
        return null;
      },
    },
    {
      stepId: 'contract',
      label: 'Contract Info',
      required: true,
      order: 2,
      validate: (item) => {
        if (!item.contractType?.trim()) return 'Contract type is required.';
        return null;
      },
    },
    {
      stepId: 'team',
      label: 'Team Assignment',
      required: true,
      order: 3,
      validate: (item) => {
        if (!item.projectLeadId?.trim()) return 'Project lead is required.';
        if (!item.groupMembers || item.groupMembers.length === 0) return 'At least one team member is required.';
        return null;
      },
    },
    {
      stepId: 'addons',
      label: 'Add-Ons',
      required: false,
      order: 4,
    },
    {
      stepId: 'review',
      label: 'Review & Submit',
      required: false,
      order: 5,
    },
  ],
};
