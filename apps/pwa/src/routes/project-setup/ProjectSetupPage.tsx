/**
 * W0-G5-T01: Project Setup wizard page.
 * Uses HbcStepWizard with the project setup config. On completion, submits
 * via useSubmitProjectRequest and navigates to /projects.
 */
import { useState, useCallback } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { useRouter } from '@tanstack/react-router';
import { HbcStepWizard } from '@hbc/step-wizard';
import { WorkspacePageShell } from '@hbc/ui-kit';
import type { IProjectSetupRequest } from '@hbc/models';
import { useCurrentUser } from '@hbc/auth';
import { useSubmitProjectRequest } from '../../hooks/provisioning/index.js';
import { PROJECT_SETUP_WIZARD_CONFIG } from './projectSetupWizardConfig.js';
import { ProjectDetailsStep } from './steps/ProjectDetailsStep.js';
import { ContractInfoStep } from './steps/ContractInfoStep.js';
import { TeamAssignmentStep } from './steps/TeamAssignmentStep.js';
import { AddOnsStep } from './steps/AddOnsStep.js';
import { ReviewStep } from './steps/ReviewStep.js';

function createBlankRequest(submittedBy: string): Partial<IProjectSetupRequest> {
  return {
    requestId: crypto.randomUUID(),
    projectId: crypto.randomUUID(),
    submittedBy,
    groupMembers: [],
  };
}

export function ProjectSetupPage(): ReactElement {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const submitMutation = useSubmitProjectRequest();

  const [item, setItem] = useState<Partial<IProjectSetupRequest>>(() =>
    createBlankRequest(currentUser?.email ?? ''),
  );

  const handleChange = useCallback((patch: Partial<IProjectSetupRequest>) => {
    setItem((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleSubmit = useCallback(() => {
    submitMutation.mutate(
      { ...item, submittedAt: new Date().toISOString(), state: 'Submitted' },
      {
        onSuccess: () => {
          void router.navigate({ to: '/projects' });
        },
      },
    );
  }, [item, submitMutation, router]);

  const renderStep = useCallback(
    (stepId: string, wizardItem: Partial<IProjectSetupRequest>): ReactNode => {
      switch (stepId) {
        case 'details':
          return <ProjectDetailsStep item={wizardItem} onChange={handleChange} />;
        case 'contract':
          return <ContractInfoStep item={wizardItem} onChange={handleChange} />;
        case 'team':
          return <TeamAssignmentStep item={wizardItem} onChange={handleChange} />;
        case 'addons':
          return <AddOnsStep item={wizardItem} onChange={handleChange} />;
        case 'review':
          return (
            <ReviewStep
              item={wizardItem}
              onSubmit={handleSubmit}
              isSubmitting={submitMutation.isPending}
            />
          );
        default:
          return null;
      }
    },
    [handleChange, handleSubmit, submitMutation.isPending],
  );

  return (
    <WorkspacePageShell layout="landing" title="New Project Setup">
      <HbcStepWizard
        item={item}
        config={PROJECT_SETUP_WIZARD_CONFIG}
        renderStep={renderStep}
        variant="horizontal"
      />
    </WorkspacePageShell>
  );
}
