import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { makeStyles } from '@griffel/react';
import { useCurrentSession } from '@hbc/auth';
import { HbcBicDetail } from '@hbc/bic-next-move';
import { HbcComplexityGate } from '@hbc/complexity';
import type { IProjectSetupRequest } from '@hbc/models';
import type { IStatusEntry } from '@hbc/ui-kit';
import {
  createProvisioningApiClient,
  useProvisioningStore,
  PROJECT_SETUP_STATUS_LABELS,
  DEPARTMENT_DISPLAY_LABELS,
  PROJECT_SETUP_BIC_CONFIG,
} from '@hbc/provisioning';
import {
  WorkspacePageShell,
  HbcStatusBadge,
  HbcButton,
  HbcBanner,
  HbcCard,
  HbcTypography,
  HbcModal,
  HbcTextArea,
  HbcConfirmDialog,
  HbcStatusTimeline,
  HbcAuditTrailPanel,
  useToast,
} from '@hbc/ui-kit';
import { resolveSessionToken } from '../utils/resolveSessionToken.js';
import { getStateBadgeVariant, getStateContextText } from '../utils/stateDisplayHelpers.js';

const useStyles = makeStyles({
  actionRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  modalFooter: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
});

/**
 * W0-G4-T03: Controller structured review detail page.
 * Supports approve, request-clarification, place-on-hold, and route-to-admin actions.
 * Traceability: docs/architecture/plans/MVP/G4/W0-G4-T03 §7.2
 */
export function ProjectReviewDetailPage(): ReactNode {
  const { requestId } = useParams({ strict: false }) as { requestId: string };
  const navigate = useNavigate();
  const session = useCurrentSession();
  const { toast } = useToast();
  const { requests, setRequests } = useProvisioningStore();

  const authToken = useMemo(() => resolveSessionToken(session), [session]);
  const client = useMemo(
    () => createProvisioningApiClient(import.meta.env.VITE_FUNCTION_APP_URL, async () => authToken),
    [authToken],
  );

  // ── Local UI state ──────────────────────────────────────────────────────
  const styles = useStyles();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [holdOpen, setHoldOpen] = useState(false);
  const [clarifyOpen, setClarifyOpen] = useState(false);
  const [clarificationNote, setClarificationNote] = useState('');

  // ── Data loading ────────────────────────────────────────────────────────
  useEffect(() => {
    client
      .listRequests()
      .then((listed: IProjectSetupRequest[]) => setRequests(listed))
      .catch(() => {});
  }, [client, setRequests]);

  const request = requests.find((r) => r.requestId === requestId);

  // ── Action handlers ─────────────────────────────────────────────────────
  const performAction = useCallback(
    async (
      newState: IProjectSetupRequest['state'],
      extras?: { clarificationNote?: string },
      successMessage?: string,
    ) => {
      setActionError(null);
      setActionLoading(true);
      try {
        await client.advanceState(requestId, newState, extras);
        const listed = await client.listRequests();
        setRequests(listed);
        toast.success(successMessage ?? 'Action completed.');
        navigate({ to: '/project-review' });
      } catch {
        setActionError('Action failed. Please try again or contact an administrator.');
      } finally {
        setActionLoading(false);
      }
    },
    [client, requestId, setRequests, toast, navigate],
  );

  const handleApprove = useCallback(() => {
    setApproveOpen(false);
    performAction('ReadyToProvision', undefined, 'Request approved.');
  }, [performAction]);

  const handleHold = useCallback(() => {
    setHoldOpen(false);
    performAction('AwaitingExternalSetup', undefined, 'Request placed on hold.');
  }, [performAction]);

  const handleClarify = useCallback(() => {
    if (!clarificationNote.trim()) return;
    setClarifyOpen(false);
    performAction('NeedsClarification', { clarificationNote: clarificationNote.trim() }, 'Clarification requested.');
    setClarificationNote('');
  }, [performAction, clarificationNote]);

  // ── Timeline entries ────────────────────────────────────────────────────
  const timelineEntries = useMemo((): IStatusEntry[] => {
    if (!request) return [];
    const entries: IStatusEntry[] = [];

    entries.push({ status: 'Submitted', timestamp: request.submittedAt, actor: request.submittedBy });

    if (request.clarificationRequestedAt) {
      entries.push({ status: 'Clarification Requested', timestamp: request.clarificationRequestedAt });
    }

    if (request.clarificationItems) {
      for (const item of request.clarificationItems) {
        entries.push({ status: `Clarification: ${item.fieldId}`, timestamp: item.raisedAt, actor: item.raisedBy });
      }
    }

    if (request.completedAt) {
      entries.push({ status: 'Completed', timestamp: request.completedAt, actor: request.completedBy });
    }

    return entries;
  }, [request]);

  // ── Not found ───────────────────────────────────────────────────────────
  if (!request) {
    return (
      <WorkspacePageShell layout="detail" title="Request Not Found">
        <p>Request not found.</p>
        <Link to="/project-review">← Back to Queue</Link>
      </WorkspacePageShell>
    );
  }

  const isUnderReview = request.state === 'UnderReview';
  const isFailed = request.state === 'Failed';

  return (
    <WorkspacePageShell layout="detail" title={`${request.projectName} — Review`}>
      {/* ── Back navigation ──────────────────────────────────────────── */}
      <Link to="/project-review">← Back to Queue</Link>

      {/* ── Error banner ─────────────────────────────────────────────── */}
      {actionError && <HbcBanner variant="error">{actionError}</HbcBanner>}

      {/* ── Core Summary ─────────────────────────────────────────────── */}
      <HbcTypography intent="heading2">{request.projectName}</HbcTypography>

      <HbcStatusBadge
        variant={getStateBadgeVariant(request.state)}
        label={PROJECT_SETUP_STATUS_LABELS[request.state] ?? request.state}
      />

      <p>{getStateContextText(request.state)}</p>

      <HbcComplexityGate minTier="standard">
        <HbcBicDetail item={request} config={PROJECT_SETUP_BIC_CONFIG} showChain />
      </HbcComplexityGate>

      <p><strong>Project Type:</strong> {request.projectType}</p>
      <p><strong>Stage:</strong> {request.projectStage}</p>
      {request.department && (
        <p><strong>Department:</strong> {DEPARTMENT_DISPLAY_LABELS[request.department] ?? request.department}</p>
      )}
      <p><strong>Submitted By:</strong> {request.submittedBy}</p>
      <p><strong>Submitted:</strong> {new Date(request.submittedAt).toLocaleDateString()}</p>

      {/* ── Request Detail ───────────────────────────────────────────── */}
      <HbcCard>
        <HbcTypography intent="heading3">Request Details</HbcTypography>

        {request.groupMembers.length > 0 && (
          <p><strong>Team Members:</strong> {request.groupMembers.join(', ')}</p>
        )}
        {request.groupLeaders && request.groupLeaders.length > 0 && (
          <p><strong>Group Leaders:</strong> {request.groupLeaders.join(', ')}</p>
        )}
        {request.projectLeadId && (
          <p><strong>Project Lead:</strong> {request.projectLeadId}</p>
        )}
        {request.contractType && (
          <p><strong>Contract Type:</strong> {request.contractType}</p>
        )}
        {request.estimatedValue != null && (
          <p><strong>Estimated Value:</strong> ${request.estimatedValue.toLocaleString()}</p>
        )}
        {request.clientName && (
          <p><strong>Client Name:</strong> {request.clientName}</p>
        )}
        {request.startDate && (
          <p><strong>Start Date:</strong> {new Date(request.startDate).toLocaleDateString()}</p>
        )}
        {request.addOns && request.addOns.length > 0 && (
          <p><strong>Add-ons:</strong> {request.addOns.join(', ')}</p>
        )}
        {request.clarificationItems && request.clarificationItems.length > 0 && (
          <>
            <HbcTypography intent="heading4">Clarification Items</HbcTypography>
            <ul>
              {request.clarificationItems.map((item) => (
                <li key={item.clarificationId}>
                  <strong>{item.fieldId}:</strong> {item.message}
                  {item.status === 'responded' && ' (Responded)'}
                  {item.responseNote && <em> — {item.responseNote}</em>}
                </li>
              ))}
            </ul>
          </>
        )}
      </HbcCard>

      {/* ── Standard-gated operational detail ─────────────────────────── */}
      <HbcComplexityGate minTier="standard">
        <HbcCard>
          <HbcTypography intent="heading3">Operational Detail</HbcTypography>
          <p><strong>Request ID:</strong> {request.requestId}</p>
          {request.completedAt && (
            <p><strong>Last Updated:</strong> {new Date(request.completedAt).toLocaleString()}</p>
          )}
        </HbcCard>
      </HbcComplexityGate>

      {/* ── History — Standard-gated timeline ─────────────────────────── */}
      <HbcComplexityGate minTier="standard">
        <HbcStatusTimeline statuses={timelineEntries} />
      </HbcComplexityGate>

      {/* ── Expert-gated audit trail ──────────────────────────────────── */}
      <HbcComplexityGate minTier="expert">
        <HbcAuditTrailPanel itemId={request.requestId} />
      </HbcComplexityGate>

      {/* ── Action Panel ─────────────────────────────────────────────── */}
      {isUnderReview && (
        <HbcCard>
          <HbcTypography intent="heading3">Actions</HbcTypography>
          <div className={styles.actionRow}>
            <HbcButton variant="primary" onClick={() => setApproveOpen(true)} disabled={actionLoading}>
              Approve Request
            </HbcButton>
            <HbcButton variant="secondary" onClick={() => setClarifyOpen(true)} disabled={actionLoading}>
              Request Clarification
            </HbcButton>
            <HbcButton variant="secondary" onClick={() => setHoldOpen(true)} disabled={actionLoading}>
              Place on Hold
            </HbcButton>
          </div>
        </HbcCard>
      )}

      {isFailed && (
        <HbcCard>
          <HbcTypography intent="heading3">Actions</HbcTypography>
          <a href="/admin/provisioning-failures">
            <HbcButton variant="secondary">Send to Admin</HbcButton>
          </a>
        </HbcCard>
      )}

      {/* ── Approve Confirmation ─────────────────────────────────────── */}
      <HbcConfirmDialog
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        onConfirm={handleApprove}
        title="Approve Request"
        description="Approve this project setup request? It will be queued for provisioning."
        confirmLabel="Approve"
        variant="warning"
        loading={actionLoading}
      />

      {/* ── Hold Confirmation ────────────────────────────────────────── */}
      <HbcConfirmDialog
        open={holdOpen}
        onClose={() => setHoldOpen(false)}
        onConfirm={handleHold}
        title="Place on Hold"
        description="Hold this request? It will be placed in Awaiting External Setup."
        confirmLabel="Place on Hold"
        variant="warning"
        loading={actionLoading}
      />

      {/* ── Clarification Modal ──────────────────────────────────────── */}
      <HbcModal
        open={clarifyOpen}
        onClose={() => setClarifyOpen(false)}
        title="Request Clarification"
        footer={
          <div className={styles.modalFooter}>
            <HbcButton variant="secondary" onClick={() => setClarifyOpen(false)}>Cancel</HbcButton>
            <HbcButton
              variant="primary"
              onClick={handleClarify}
              disabled={!clarificationNote.trim() || actionLoading}
            >
              Submit
            </HbcButton>
          </div>
        }
      >
        <HbcTextArea
          label="Clarification Note"
          value={clarificationNote}
          onChange={setClarificationNote}
          placeholder="Describe what information is needed from the requester..."
        />
      </HbcModal>
    </WorkspacePageShell>
  );
}
