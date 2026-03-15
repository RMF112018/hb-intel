/**
 * W0-G5-T03: Project Setup wizard page with draft persistence and clarification-return.
 * Follows the proven SPFx pattern from apps/estimating/src/pages/NewRequestPage.tsx.
 * Uses canonical PROJECT_SETUP_WIZARD_CONFIG from @hbc/features-estimating.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter, useSearch } from '@tanstack/react-router';
import { useCurrentSession } from '@hbc/auth';
import type { ISetupFormDraft, ProjectSetupWizardMode } from '@hbc/features-estimating';
import {
  PROJECT_SETUP_WIZARD_CONFIG,
  useProjectSetupDraft,
  buildClarificationReturnState,
} from '@hbc/features-estimating';
import type { IProjectSetupRequest } from '@hbc/models';
import { createProvisioningApiClient } from '@hbc/provisioning';
import type { IStepWizardConfig } from '@hbc/step-wizard';
import { HbcStepWizard } from '@hbc/step-wizard';
import { useSessionState } from '@hbc/session-state';
import { HbcBanner, WorkspacePageShell } from '@hbc/ui-kit';
import { resolveSessionToken } from '../../utils/resolveSessionToken.js';
import { ResumeBanner } from './ResumeBanner.js';
import { ProjectInfoStep } from './steps/ProjectInfoStep.js';
import { DepartmentStep } from './steps/DepartmentStep.js';
import { TeamStep } from './steps/TeamStep.js';
import { TemplateAddOnsStep } from './steps/TemplateAddOnsStep.js';
import { ReviewSubmitStep } from './steps/ReviewSubmitStep.js';

const EMPTY_DEFAULTS: Partial<IProjectSetupRequest> = {
  projectName: '',
  projectLocation: '',
  projectType: 'GC',
  projectStage: 'Pursuit',
  groupMembers: [],
};

export function ProjectSetupPage(): ReactNode {
  const router = useRouter();
  const { mode: rawMode, requestId } = useSearch({ strict: false }) as {
    mode?: string;
    requestId?: string;
  };
  const session = useCurrentSession();
  const authToken = useMemo(() => resolveSessionToken(session), [session]);

  const mode = (rawMode ?? 'new-request') as ProjectSetupWizardMode;
  const { draft, saveDraft, clearDraft, resumeContext, isSavePending } =
    useProjectSetupDraft(mode, requestId);

  const [request, setRequest] = useState<Partial<IProjectSetupRequest>>(() => {
    if (resumeContext.decision === 'auto-continue' && draft && 'fields' in draft) {
      return (draft as ISetupFormDraft).fields;
    }
    return { ...EMPTY_DEFAULTS };
  });

  const { connectivity, queueOperation } = useSessionState();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queuedMessage, setQueuedMessage] = useState<string | null>(null);

  // Clarification-return: load existing request data when mode requires it
  useEffect(() => {
    if (mode !== 'clarification-return' || !requestId) return;
    let mounted = true;

    const client = createProvisioningApiClient(
      import.meta.env.VITE_API_BASE_URL ?? '',
      async () => authToken,
    );

    (async () => {
      const listed = await client.listRequests();
      if (!mounted) return;
      const existing = listed.find((r) => r.requestId === requestId);
      if (existing) {
        setRequest(existing);
        buildClarificationReturnState(existing.clarificationItems ?? []);
      }
    })().catch(() => {
      // Preserve fallback rendering on API failure.
    });

    return () => {
      mounted = false;
    };
  }, [mode, requestId, authToken]);

  const handleChange = useCallback(
    (updates: Partial<IProjectSetupRequest>) => {
      setRequest((prev) => {
        const next = { ...prev, ...updates };
        saveDraft({
          fields: next,
          stepStatuses: {},
          lastSavedAt: new Date().toISOString(),
        } as ISetupFormDraft);
        return next;
      });
    },
    [saveDraft],
  );

  const handleResume = useCallback(() => {
    if (draft && 'fields' in draft) {
      setRequest((draft as ISetupFormDraft).fields);
    }
  }, [draft]);

  const handleStartNew = useCallback(() => {
    clearDraft();
    setRequest({ ...EMPTY_DEFAULTS });
  }, [clearDraft]);

  const handleSubmit = useCallback(async () => {
    const submitPayload: Partial<IProjectSetupRequest> = {
      projectName: request.projectName ?? '',
      projectLocation: request.projectLocation ?? '',
      projectType: request.projectType ?? 'GC',
      projectStage: (request.projectStage as 'Pursuit' | 'Active') ?? 'Pursuit',
      groupMembers: request.groupMembers ?? [],
      department: request.department,
      projectLeadId: request.projectLeadId,
      viewerUPNs: request.viewerUPNs,
      addOns: request.addOns,
      estimatedValue: request.estimatedValue,
      clientName: request.clientName,
      startDate: request.startDate,
      contractType: request.contractType,
    };

    // W0-G5-T04: Queue operation when offline/degraded instead of calling API directly
    if (connectivity !== 'online') {
      queueOperation({
        type: 'api-mutation',
        target: 'submitRequest',
        payload: submitPayload,
        maxRetries: 5,
      });
      setQueuedMessage(
        "You're offline. Your request has been saved and will be submitted automatically when you reconnect.",
      );
      return;
    }

    setSubmitting(true);
    setError(null);
    setQueuedMessage(null);

    try {
      const client = createProvisioningApiClient(
        import.meta.env.VITE_API_BASE_URL ?? '',
        async () => authToken,
      );

      await client.submitRequest(submitPayload);

      // IR-01: Clear draft only on API success
      clearDraft();
      void router.navigate({ to: '/projects' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }, [authToken, request, clearDraft, router, connectivity, queueOperation]);

  const wizardConfig: IStepWizardConfig<IProjectSetupRequest> = useMemo(
    () => ({
      ...PROJECT_SETUP_WIZARD_CONFIG,
      onAllComplete: () => handleSubmit(),
    }),
    [handleSubmit],
  );

  function renderStepBody(stepId: string, _item: IProjectSetupRequest): ReactNode {
    switch (stepId) {
      case 'project-info':
        return <ProjectInfoStep request={request} onChange={handleChange} />;
      case 'department':
        return <DepartmentStep request={request} onChange={handleChange} />;
      case 'project-team':
        return <TeamStep request={request} onChange={handleChange} />;
      case 'template-addons':
        return <TemplateAddOnsStep request={request} onChange={handleChange} />;
      case 'review-submit':
        return (
          <ReviewSubmitStep
            request={request}
            onSubmit={handleSubmit}
            submitting={submitting}
            mode={mode}
          />
        );
      default:
        return null;
    }
  }

  // Session loading guard
  if (!session) {
    return (
      <WorkspacePageShell layout="landing" title="Loading..." isLoading>
        {null}
      </WorkspacePageShell>
    );
  }

  return (
    <WorkspacePageShell layout="landing" title="New Project Setup Request">
      <ResumeBanner
        resumeContext={resumeContext as ReturnType<typeof useProjectSetupDraft>['resumeContext'] & { existingDraft: ISetupFormDraft | null }}
        onResume={handleResume}
        onStartNew={handleStartNew}
      />

      {queuedMessage && <HbcBanner variant="info">{queuedMessage}</HbcBanner>}
      {error && <HbcBanner variant="error">{error}</HbcBanner>}

      <HbcStepWizard<IProjectSetupRequest>
        item={request as IProjectSetupRequest}
        config={wizardConfig}
        renderStep={renderStepBody}
        variant="horizontal"
      />

      {isSavePending && (
        <p aria-live="polite">Saving draft...</p>
      )}
    </WorkspacePageShell>
  );
}
