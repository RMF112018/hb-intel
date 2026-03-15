/**
 * W0-G5-T05: Request detail page with completion summary and Project Hub handoff.
 * Shows state context for all states; completion summary for terminal states.
 */
import { useEffect, useCallback } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { useParams, useRouter } from '@tanstack/react-router';
import { useCurrentUser } from '@hbc/auth';
import {
  PROJECT_SETUP_STATUS_LABELS,
  getStateBadgeVariant,
  resolveProjectHubUrl,
  DEPARTMENT_DISPLAY_LABELS,
} from '@hbc/provisioning';
import type { IProjectSetupRequest, ProjectSetupRequestState } from '@hbc/models';
import { PROJECT_SETUP_DRAFT_KEY } from '@hbc/features-estimating';
import { clearDraft } from '@hbc/session-state';
import { HbcBanner, WorkspacePageShell, HbcFormSection, HbcFormLayout, useIsMobile } from '@hbc/ui-kit';
import { useMyProjectRequests, useProvisioningStatus } from '../../hooks/provisioning/index.js';

/** Requester-facing state context messages. */
const STATE_CONTEXT_TEXT: Record<ProjectSetupRequestState, string> = {
  Submitted: 'Your request has been submitted and is awaiting review by the Accounting team.',
  UnderReview: 'The Accounting team is reviewing your request. You will be notified if clarification is needed.',
  NeedsClarification: 'The reviewer has questions about your request. Please return to the setup form to provide the requested information.',
  AwaitingExternalSetup: 'Your request requires external IT or security setup before provisioning can proceed.',
  ReadyToProvision: 'Your request has been approved and is queued for site provisioning.',
  Provisioning: 'Your project site is being provisioned. This typically takes a few minutes.',
  Completed: 'Your project site has been provisioned and is ready to use.',
  Failed: 'Site provisioning encountered an error. An administrator has been notified.',
};

function isTerminalState(state: ProjectSetupRequestState): boolean {
  return state === 'Completed' || state === 'Failed';
}

function SummaryField({ label, value }: { label: string; value: string | undefined }): ReactElement {
  return (
    <div className="hbc-review-field">
      <dt className="hbc-review-field__label">{label}</dt>
      <dd className="hbc-review-field__value">{value || '—'}</dd>
    </div>
  );
}

function CompletionSummary({ request }: { request: IProjectSetupRequest }): ReactElement {
  const isMobile = useIsMobile();
  const cols = isMobile ? 1 : 2;
  const projectHubUrl = resolveProjectHubUrl(request);
  const { data: provisioningStatus } = useProvisioningStatus(
    request.projectId,
    request.state === 'Completed',
  );

  return (
    <>
      <HbcBanner variant="success">
        Your project site has been provisioned and is ready to use.
      </HbcBanner>

      <HbcFormSection title="Project Details">
        <HbcFormLayout columns={cols} gap="medium">
          <SummaryField label="Project Name" value={request.projectName} />
          <SummaryField label="Department" value={request.department ? DEPARTMENT_DISPLAY_LABELS[request.department] : undefined} />
          <SummaryField label="Type" value={request.projectType} />
          <SummaryField label="Project Lead" value={request.projectLeadId} />
          <SummaryField label="Team Members" value={request.groupMembers?.join(', ')} />
          {provisioningStatus?.completedAt && (
            <SummaryField label="Completed" value={new Date(provisioningStatus.completedAt).toLocaleString()} />
          )}
        </HbcFormLayout>
      </HbcFormSection>

      {projectHubUrl ? (
        <div className="hbc-completion__handoff">
          <p>Your project workspace is now available in Project Hub.</p>
          <button
            type="button"
            className="hbc-btn hbc-btn--primary"
            onClick={() => window.open(projectHubUrl, '_blank', 'noopener,noreferrer')}
          >
            Open Project Hub
          </button>
        </div>
      ) : (
        <p className="hbc-completion__pending">
          Project Hub link is not yet available. Check back shortly.
        </p>
      )}
    </>
  );
}

function FailureSummary({ request }: { request: IProjectSetupRequest }): ReactElement {
  const isMobile = useIsMobile();
  const cols = isMobile ? 1 : 2;
  return (
    <>
      <HbcBanner variant="error">
        Site provisioning encountered an error.
      </HbcBanner>

      <HbcFormSection title="Request Details">
        <HbcFormLayout columns={cols} gap="medium">
          <SummaryField label="Project Name" value={request.projectName} />
          <SummaryField label="Department" value={request.department ? DEPARTMENT_DISPLAY_LABELS[request.department] : undefined} />
          <SummaryField label="Type" value={request.projectType} />
          <SummaryField label="Submitted" value={request.submittedAt ? new Date(request.submittedAt).toLocaleString() : undefined} />
        </HbcFormLayout>
      </HbcFormSection>

      <HbcFormSection title="What Happens Next">
        <p>An administrator has been notified and will investigate the issue. You may be contacted for additional information.</p>
        <p>You do not need to resubmit your request.</p>
      </HbcFormSection>
    </>
  );
}

export function RequestDetailPage(): ReactNode {
  const router = useRouter();
  const { requestId } = useParams({ strict: false }) as { requestId: string };
  const currentUser = useCurrentUser();
  const { data: requests, isLoading } = useMyProjectRequests();

  const request = requests?.find((r) => r.requestId === requestId);

  // Clear draft on terminal state (AC5)
  useEffect(() => {
    if (request && isTerminalState(request.state)) {
      void clearDraft(PROJECT_SETUP_DRAFT_KEY);
    }
  }, [request?.state]);

  const handleBackToList = useCallback(() => {
    void router.navigate({ to: '/projects' });
  }, [router]);

  if (isLoading) {
    return (
      <WorkspacePageShell layout="detail" title="Loading..." isLoading>
        {null}
      </WorkspacePageShell>
    );
  }

  if (!request) {
    return (
      <WorkspacePageShell layout="detail" title="Request Not Found">
        <HbcBanner variant="warning">
          This request could not be found. It may have been removed or you may not have access.
        </HbcBanner>
        <button type="button" className="hbc-btn hbc-btn--ghost" onClick={handleBackToList}>
          Back to My Requests
        </button>
      </WorkspacePageShell>
    );
  }

  return (
    <WorkspacePageShell layout="detail" title={request.projectName || 'Project Request'}>
      {/* Core status header */}
      <div className="hbc-request-detail__header">
        <span className={`hbc-badge hbc-badge--${getStateBadgeVariant(request.state)}`}>
          {PROJECT_SETUP_STATUS_LABELS[request.state]}
        </span>
        {request.submittedAt && (
          <span className="hbc-request-detail__timestamp">
            Submitted {new Date(request.submittedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* State context — requester-friendly explanation */}
      <p className="hbc-request-detail__context">
        {STATE_CONTEXT_TEXT[request.state]}
      </p>

      {/* Terminal state content */}
      {request.state === 'Completed' && <CompletionSummary request={request} />}
      {request.state === 'Failed' && <FailureSummary request={request} />}

      {/* Navigation */}
      <div className="hbc-request-detail__nav">
        <button type="button" className="hbc-btn hbc-btn--ghost" onClick={handleBackToList}>
          Back to My Requests
        </button>
      </div>
    </WorkspacePageShell>
  );
}
