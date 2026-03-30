import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCurrentSession } from '@hbc/auth';
import type {
  ISetupFormDraft,
  ProjectSetupWizardMode,
} from '@hbc/features-estimating';
import {
  PROJECT_SETUP_WIZARD_CONFIG,
  buildClarificationReturnState,
  useProjectSetupDraft,
} from '@hbc/features-estimating';
import type { IProjectSetupRequest } from '@hbc/models';
import { HbcConnectivityBar, HbcSyncStatusBadge } from '@hbc/session-state';
import type { IStepWizardConfig } from '@hbc/step-wizard';
import { HbcStepWizard } from '@hbc/step-wizard';
import { HbcBanner, WorkspacePageShell } from '@hbc/ui-kit';
import { DepartmentStepBody } from '../components/project-setup/DepartmentStepBody.js';
import { useProjectSetupBackend } from '../project-setup/backend/ProjectSetupBackendContext.js';
import { ProjectInfoStepBody } from '../components/project-setup/ProjectInfoStepBody.js';
import { ResumeBanner } from '../components/project-setup/ResumeBanner.js';
import { ReviewStepBody } from '../components/project-setup/ReviewStepBody.js';
import { TeamStepBody } from '../components/project-setup/TeamStepBody.js';
import { TemplateAddOnsStepBody } from '../components/project-setup/TemplateAddOnsStepBody.js';

const EMPTY_DEFAULTS: Partial<IProjectSetupRequest> = {
  projectName: '',
  projectLocation: '',
  projectType: 'GC',
  projectStage: 'Pursuit',
  groupMembers: [],
};

/**
 * W0-G4-T01 Guided multi-step project setup request form.
 * Replaces the flat D-PH6-10 form with a 5-step wizard consuming
 * PROJECT_SETUP_WIZARD_CONFIG from @hbc/features-estimating.
 */
export function NewRequestPage(): ReactNode {
  const navigate = useNavigate();
  const { mode, requestId } = useSearch({ from: '/project-setup/new' }) as {
    mode: 'new-request' | 'clarification-return';
    requestId: string | undefined;
  };
  const session = useCurrentSession();
  const { client } = useProjectSetupBackend();

  const wizardMode = mode as ProjectSetupWizardMode;
  const { draft, saveDraft, clearDraft, resumeContext, isSavePending } =
    useProjectSetupDraft(wizardMode, requestId);

  const [request, setRequest] = useState<Partial<IProjectSetupRequest>>(() => {
    if (resumeContext.decision === 'auto-continue' && draft && 'fields' in draft) {
      return (draft as ISetupFormDraft).fields;
    }
    return { ...EMPTY_DEFAULTS };
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clarification-return: load existing request data when mode requires it
  useEffect(() => {
    if (mode !== 'clarification-return' || !requestId) return;
    let mounted = true;

    (async () => {
      const listed = await client.listRequests();
      if (!mounted) return;
      const existing = listed.find((r) => r.requestId === requestId);
      if (existing) {
        setRequest(existing);
        // Resolve flagged steps (scaffolded — gracefully handles empty clarificationItems)
        buildClarificationReturnState(existing.clarificationItems ?? []);
      }
    })().catch(() => {
      // Preserve fallback rendering on API failure.
    });

    return () => {
      mounted = false;
    };
  }, [client, mode, requestId]);

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
    setSubmitting(true);
    setError(null);

    try {
      const opexManagerUpn = (import.meta.env.VITE_OPEX_MANAGER_UPN as string) ?? '';
      const members = Array.from(
        new Set([...(request.groupMembers ?? []), opexManagerUpn].filter(Boolean)),
      );

      const result = await client.submitRequest({
        projectName: request.projectName ?? '',
        projectLocation: request.projectLocation ?? '',
        projectType: request.projectType ?? 'GC',
        projectStage: (request.projectStage as 'Pursuit' | 'Active') ?? 'Pursuit',
        groupMembers: members,
        department: request.department,
        projectLeadId: request.projectLeadId,
        viewerUPNs: request.viewerUPNs,
        addOns: request.addOns,
        estimatedValue: request.estimatedValue,
        clientName: request.clientName,
        startDate: request.startDate,
        contractType: request.contractType,
      });

      clearDraft();
      navigate({ to: '/project-setup/$requestId', params: { requestId: result.requestId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }, [client, request, clearDraft, navigate]);

  const wizardConfig: IStepWizardConfig<IProjectSetupRequest> = useMemo(
    () => ({
      ...PROJECT_SETUP_WIZARD_CONFIG,
      onAllComplete: () => handleSubmit(),
    }),
    [handleSubmit],
  );

  function renderStepBody(stepId: string, _item: IProjectSetupRequest): ReactNode {
    const stepProps = { request, onChange: handleChange, mode: wizardMode };

    switch (stepId) {
      case 'project-info':
        return <ProjectInfoStepBody {...stepProps} />;
      case 'department':
        return <DepartmentStepBody {...stepProps} />;
      case 'project-team':
        return <TeamStepBody {...stepProps} />;
      case 'template-addons':
        return <TemplateAddOnsStepBody {...stepProps} />;
      case 'review-submit':
        return (
          <ReviewStepBody
            {...stepProps}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        );
      default:
        return null;
    }
  }

  // W0-G4-T07: Session loading guard (after all hooks)
  if (!session) {
    return (
      <WorkspacePageShell layout="form" title="Loading..." isLoading>
        {null}
      </WorkspacePageShell>
    );
  }

  return (
    <WorkspacePageShell
      layout="form"
      title="New Project Setup Request"
    >
      <ResumeBanner
        resumeContext={resumeContext as ReturnType<typeof useProjectSetupDraft>['resumeContext'] & { existingDraft: ISetupFormDraft | null }}
        onResume={handleResume}
        onStartNew={handleStartNew}
      />

      <HbcConnectivityBar />

      <HbcSyncStatusBadge />

      {error && <HbcBanner variant="error">{error}</HbcBanner>}

      <HbcStepWizard<IProjectSetupRequest>
        item={request as IProjectSetupRequest}
        config={wizardConfig}
        renderStep={renderStepBody}
        variant="vertical"
      />

      {isSavePending && (
        <p aria-live="polite">Saving draft…</p>
      )}
    </WorkspacePageShell>
  );
}
