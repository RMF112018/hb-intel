import type { IProjectSetupRequest } from '@hbc/models';
import type { ProjectSetupWizardMode } from '@hbc/features-estimating';

export interface StepBodyProps {
  request: Partial<IProjectSetupRequest>;
  onChange: (updates: Partial<IProjectSetupRequest>) => void;
  mode: ProjectSetupWizardMode;
}
