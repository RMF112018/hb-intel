import { useEffect, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import {
  HbcButton,
  HbcCheckbox,
  HbcModal,
  HbcStatusBadge,
  HbcTypography,
} from '@hbc/ui-kit';

export interface SafetyReplayPreviewContext {
  readonly uploadFileName?: string;
  readonly attemptNumber?: number;
  readonly projectNumber?: string;
  readonly projectNameSnapshot?: string;
  readonly terminalStatus?: string;
  readonly errorClass?: string;
  readonly errorSummary?: string;
  readonly templateVersionDetected?: string;
}

export interface SafetyReplayPreviewDialogProps {
  readonly open: boolean;
  readonly runId: string;
  readonly inspectionEventId?: string;
  readonly isPending: boolean;
  readonly context?: SafetyReplayPreviewContext;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

/**
 * SafetyReplayPreviewDialog — governed supersede preview-before-commit.
 *
 * Mirrors the upload preview-before-commit discipline: shows the user what
 * the replay-with-supersede will actually do (parent run, project context,
 * prior inspection reference, explicit consequence copy) and requires an
 * acknowledgment tick before the destructive mutation can fire. Backend
 * remains the final authority for authorization and execution.
 *
 * Preview content is built from row data the review queue already has; no
 * new backend endpoint or fetch is introduced.
 */
export function SafetyReplayPreviewDialog({
  open,
  runId,
  inspectionEventId,
  isPending,
  context,
  onCancel,
  onConfirm,
}: SafetyReplayPreviewDialogProps): ReactNode {
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (!open) setAcknowledged(false);
  }, [open]);

  const confirmDisabled = !acknowledged || isPending;

  const footer = (
    <>
      <HbcButton variant="secondary" onClick={onCancel} disabled={isPending}>
        Cancel
      </HbcButton>
      <HbcButton
        variant="danger"
        onClick={onConfirm}
        disabled={confirmDisabled}
        data-safety-ui="supersede-confirm"
      >
        {isPending ? 'Superseding…' : 'Supersede & commit'}
      </HbcButton>
    </>
  );

  const attempt = context?.attemptNumber;
  const isReplay = typeof attempt === 'number' && attempt > 1;

  return (
    <HbcModal
      open={open}
      onClose={onCancel}
      title="Supersede prior inspection?"
      size="lg"
      role="alertdialog"
      preventBackdropClose={true}
      footer={footer}
    >
      <div className="safety-replay-preview" data-safety-ui="replay-preview">
        <section
          className="safety-replay-preview__section"
          aria-label="Replay scope"
        >
          <HbcTypography intent="label" as="h4">
            Replay scope
          </HbcTypography>
          <dl className="safety-replay-preview__dl">
            <div className="safety-replay-preview__row">
              <dt>
                <HbcTypography intent="bodySmall">Parent run</HbcTypography>
              </dt>
              <dd>
                <HbcTypography intent="body">{runId}</HbcTypography>
                {isReplay && (
                  <HbcStatusBadge
                    variant="info"
                    label={`Attempt ${attempt}`}
                    size="small"
                  />
                )}
              </dd>
            </div>
            {context?.uploadFileName && (
              <div className="safety-replay-preview__row">
                <dt>
                  <HbcTypography intent="bodySmall">Retained workbook</HbcTypography>
                </dt>
                <dd>
                  <HbcTypography intent="body">{context.uploadFileName}</HbcTypography>
                </dd>
              </div>
            )}
            {(context?.projectNumber || context?.projectNameSnapshot) && (
              <div className="safety-replay-preview__row">
                <dt>
                  <HbcTypography intent="bodySmall">Project</HbcTypography>
                </dt>
                <dd>
                  <HbcTypography intent="body">
                    {context.projectNumber ?? 'unresolved'}
                  </HbcTypography>
                  {context.projectNameSnapshot && (
                    <HbcTypography intent="bodySmall">
                      {context.projectNameSnapshot}
                    </HbcTypography>
                  )}
                </dd>
              </div>
            )}
            {context?.templateVersionDetected && (
              <div className="safety-replay-preview__row">
                <dt>
                  <HbcTypography intent="bodySmall">Template version</HbcTypography>
                </dt>
                <dd>
                  <HbcTypography intent="body">
                    {context.templateVersionDetected}
                  </HbcTypography>
                </dd>
              </div>
            )}
            {context?.terminalStatus && (
              <div className="safety-replay-preview__row">
                <dt>
                  <HbcTypography intent="bodySmall">Prior terminal</HbcTypography>
                </dt>
                <dd>
                  <HbcTypography intent="body">{context.terminalStatus}</HbcTypography>
                </dd>
              </div>
            )}
            {context?.errorSummary && (
              <div className="safety-replay-preview__row">
                <dt>
                  <HbcTypography intent="bodySmall">Prior error</HbcTypography>
                </dt>
                <dd>
                  <HbcTypography intent="body">{context.errorSummary}</HbcTypography>
                </dd>
              </div>
            )}
          </dl>
        </section>

        <section
          className="safety-replay-preview__section"
          aria-label="Prior inspection"
        >
          <HbcTypography intent="label" as="h4">
            Prior inspection
          </HbcTypography>
          {inspectionEventId ? (
            <>
              <HbcTypography intent="body">
                A committed inspection exists for this project-week and will be
                replaced by the new run.
              </HbcTypography>
              <Link
                className="safety-link"
                to="/inspections/$inspectionEventId"
                params={{ inspectionEventId }}
                data-safety-ui="replay-preview-prior-link"
              >
                Open prior inspection ({inspectionEventId})
              </Link>
            </>
          ) : (
            <HbcTypography intent="bodySmall">
              No committed inspection is linked to this run. Supersede will replay
              the retained workbook and commit a new inspection record.
            </HbcTypography>
          )}
        </section>

        <section
          className="safety-replay-preview__consequence"
          data-safety-ui="replay-preview-consequence"
          aria-label="What supersede will do"
        >
          <HbcTypography intent="label" as="h4">
            What supersede will do
          </HbcTypography>
          <ul>
            <li>
              <HbcTypography intent="body">
                Replay the retained workbook through the ingestion pipeline as a
                new run.
              </HbcTypography>
            </li>
            <li>
              <HbcTypography intent="body">
                Commit a new inspection and update the project-week rollup to the
                new run.
              </HbcTypography>
            </li>
            <li>
              <HbcTypography intent="body">
                Mark the prior inspection as superseded. It stays in audit history
                but no longer counts toward the project-week rollup.
              </HbcTypography>
            </li>
            <li>
              <HbcTypography intent="body">
                This cannot be reversed from the UI. Backend is the final authority
                and will reject the supersede if the caller is not authorized or
                the retained workbook is missing.
              </HbcTypography>
            </li>
          </ul>
        </section>

        <div className="safety-replay-preview__ack">
          <HbcCheckbox
            label="I have reviewed the replay impact and confirm supersede."
            checked={acknowledged}
            onChange={(checked) => setAcknowledged(checked)}
            disabled={isPending}
          />
        </div>
      </div>
    </HbcModal>
  );
}
