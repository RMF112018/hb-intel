/**
 * PublishReadinessDiagnostics — operator-facing diagnostic content
 * for the readiness rail. Workstream-f step-03.
 *
 * Surfaces the "what will happen on publish" decision in plain
 * English and a collapsible Technical details disclosure containing
 * drift versioning (PageShellVersion / RenderVersion /
 * PageTemplateKey) and machine-readable validation finding codes.
 *
 * The readiness summary, blocking-issues list, warnings list, and
 * actions all remain where they are in the readiness rail today.
 * This component fills the gap between "summary sentence" and
 * "publish button": the actionable narrative about what will happen
 * and, when the operator asks, the raw numbers behind it.
 */

import * as React from 'react';
import type { PreviewOutcome } from '../../../homepage/data/publisherAdapter/preview/previewBuilder.js';
import type { PublisherPageBindingRow } from '../../../homepage/data/publisherAdapter/index.js';
import { EditorialChip } from '../sharedChrome/index.js';
import styles from './publishReadiness.module.css';

export interface PublishReadinessDiagnosticsProps {
  readonly outcome: PreviewOutcome | undefined;
  readonly binding: PublisherPageBindingRow | undefined;
}

export function PublishReadinessDiagnostics({
  outcome,
  binding,
}: PublishReadinessDiagnosticsProps): React.JSX.Element | null {
  if (!outcome || !outcome.ok) return null;

  const decisionMessage = describeDecision(outcome, binding);
  const driftLines = describeDrift(outcome, binding);
  const hasDrift = driftLines.length > 0;
  const findings = [...outcome.validation.errors, ...outcome.validation.warnings];
  const hasFindings = findings.length > 0;

  return (
    <>
      <section
        className={styles.block}
        aria-label="What will happen on publish"
      >
        <p className={styles.heading}>What happens on publish</p>
        <p className={styles.decisionSentence}>{decisionMessage.sentence}</p>
        {decisionMessage.detail && (
          <p className={styles.decisionDetail}>{decisionMessage.detail}</p>
        )}
      </section>

      {(hasDrift || hasFindings) && (
        <section className={styles.block} aria-label="Technical details">
          <details className={styles.details}>
            <summary className={styles.summary}>Technical details</summary>
            <div className={styles.detailsBody}>
              {hasDrift && (
                <div className={styles.detailsGroup}>
                  <p className={styles.detailsHeading}>Version drift</p>
                  <ul className={styles.driftList}>
                    {driftLines.map((line, i) => (
                      <li key={i} className={styles.driftItem}>
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {hasFindings && (
                <div className={styles.detailsGroup}>
                  <p className={styles.detailsHeading}>Validation findings</p>
                  <ul className={styles.findingList}>
                    {findings.map((f, i) => (
                      <li key={i} className={styles.findingItem}>
                        <EditorialChip
                          size="sm"
                          variant={f.severity === 'error' ? 'danger' : 'warn'}
                        >
                          {f.severity}
                        </EditorialChip>
                        <span className={styles.findingCategory}>{f.category}</span>
                        {f.field && <code className={styles.findingField}>{f.field}</code>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </details>
        </section>
      )}
    </>
  );
}

function describeDecision(
  outcome: Extract<PreviewOutcome, { ok: true }>,
  binding: PublisherPageBindingRow | undefined,
): { sentence: string; detail?: string } {
  const { decision, drift } = outcome;
  switch (decision.action) {
    case 'create':
      return {
        sentence:
          'A new destination page will be created and linked to this article.',
        detail: binding
          ? undefined
          : decision.reason
            ? `Reason: ${decision.reason}.`
            : undefined,
      };
    case 'regenerate':
      return {
        sentence:
          'The destination page will be regenerated — a new PageId and page URL will replace the current binding.',
        detail: decision.regenerationCause
          ? `Cause: ${decision.regenerationCause}.`
          : 'Cause: template key changed.',
      };
    case 'inPlaceUpdate':
      if (drift.shellVersionDrift || drift.templateVersionDrift) {
        return {
          sentence:
            'The existing destination page will be updated in place. PageId and page URL are preserved.',
          detail: drift.shellVersionDrift
            ? 'Shell version drift detected — the page shell will be refreshed.'
            : 'Template version drift detected — the render will be refreshed.',
        };
      }
      return {
        sentence:
          'The existing destination page will be updated in place. PageId and page URL are preserved.',
      };
    case 'noOp':
      return {
        sentence:
          'Nothing will change on the destination page — the current binding already matches.',
      };
    case 'blocked':
      return {
        sentence:
          'Publish is blocked by validation issues. Resolve the blocking issues above and try again.',
      };
    default:
      return { sentence: `Publish action: ${String(decision.action)}.` };
  }
}

function describeDrift(
  outcome: Extract<PreviewOutcome, { ok: true }>,
  binding: PublisherPageBindingRow | undefined,
): readonly string[] {
  const lines: string[] = [];
  const { drift, composedPage } = outcome;
  if (!binding) return lines;
  if (drift.templateKeyDrift) {
    lines.push(
      `PageTemplateKey: ${binding.PageTemplateKey ?? '—'} → ${composedPage.identity.templateKey}`,
    );
  }
  if (drift.shellVersionDrift) {
    lines.push(
      `PageShellVersion: ${binding.PageShellVersion ?? '—'} → ${composedPage.identity.shellVersion}`,
    );
  }
  if (drift.templateVersionDrift) {
    lines.push(
      `RenderVersion: ${binding.RenderVersion ?? '—'} → ${composedPage.identity.templateVersion}`,
    );
  }
  return lines;
}

/** Pure helpers exported for test coverage. */
export const __testables = { describeDecision, describeDrift };
