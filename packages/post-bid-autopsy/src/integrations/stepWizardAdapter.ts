import type { IAutopsyRecordSnapshot } from '../types/index.js';
import { createAutopsyWizardSections } from './helpers.js';

export interface IAutopsyWizardModel {
  readonly autopsyId: string | null;
}

export interface IAutopsyStepWizardStep {
  readonly stepId: string;
  readonly label: string;
  readonly required: boolean;
  readonly order: number;
  readonly validate: (item: IAutopsyWizardModel) => string | null;
}

export interface IAutopsyStepWizardConfig {
  readonly title: string;
  readonly orderMode: 'sequential';
  readonly allowReopen: boolean;
  readonly steps: readonly IAutopsyStepWizardStep[];
  readonly draftKey: (item: IAutopsyWizardModel) => string;
}

export const createAutopsyStepWizardConfig = (
  record?: IAutopsyRecordSnapshot | null
): IAutopsyStepWizardConfig => {
  const sections = createAutopsyWizardSections(record);

  return {
    title: 'Post-bid autopsy',
    orderMode: 'sequential',
    allowReopen: true,
    steps: sections.map((section) => ({
      stepId: section.stepId,
      label: section.label,
      required: section.required,
      order: section.order,
      validate: () => (section.ready ? null : `${section.label} is not ready.`),
    })),
    draftKey: (item) => `post-bid-autopsy-wizard:${item.autopsyId ?? 'draft'}`,
  };
};
