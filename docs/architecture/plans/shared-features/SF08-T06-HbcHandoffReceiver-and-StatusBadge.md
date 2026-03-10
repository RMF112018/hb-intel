# SF08-T06 — `HbcHandoffReceiver` and `HbcHandoffStatusBadge`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-08-Shared-Feature-Workflow-Handoff.md`
**Decisions Applied:** D-02 (state machine), D-05 (BIC transfer), D-07 (rejection terminal state), D-08 (complexity gating for badge)
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T01–T05

> **Doc Classification:** Canonical Normative Plan — SF08-T06 receiver and status badge task; sub-plan of `SF08-Workflow-Handoff.md`.

---

## Objective

Implement `HbcHandoffReceiver` — the recipient's full review panel — and `HbcHandoffStatusBadge` — the passive status indicator shown on the source record after a handoff is sent.

---

## 3-Line Plan

1. Implement `HbcHandoffReceiver` with source summary, documents, context notes, field-annotation markers, and acknowledge/reject CTAs.
2. Implement `HbcHandoffStatusBadge` with 5-state rendering and complexity gating (D-08).
3. Compose `@hbc/acknowledgment` inside the Receiver for the sign-off gesture.

---

## `HbcHandoffReceiver` — Props Interface

```typescript
export interface HbcHandoffReceiverProps<TSource, TDest> {
  /** The handoff package ID to display */
  handoffId: string;
  /** The handoff route configuration */
  config: IHandoffConfig<TSource, TDest>;
  /** Field annotation config for the destinationSeedData preview fields */
  annotationConfig?: IFieldAnnotationConfig;
  /** Called when the recipient successfully acknowledges */
  onAcknowledged?: (pkg: IHandoffPackage<TSource, TDest>) => void;
  /** Called when the recipient rejects */
  onRejected?: (pkg: IHandoffPackage<TSource, TDest>) => void;
}
```

---

## `src/components/HbcHandoffReceiver.tsx`

```typescript
import React, { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { HandoffApi } from '../api/HandoffApi';
import { handoffQueryKeys } from '../hooks/handoffQueryKeys';
import type {
  IHandoffConfig,
  IHandoffPackage,
  IHandoffDocument,
  IHandoffContextNote,
  IBicOwner,
} from '../types/IWorkflowHandoff';
import { noteCategoryColorClass } from '../constants/handoffDefaults';
import type { IFieldAnnotationConfig } from '@hbc/field-annotations';
// Note: HbcAnnotationMarker imported conditionally; annotation config is optional
// to allow the package to be used before @hbc/field-annotations is built.

// ─────────────────────────────────────────────────────────────────────────────
// Section: Source Record Summary
// ─────────────────────────────────────────────────────────────────────────────

function SourceSummarySection<TDest>({
  destinationSeedData,
  destinationRecordType,
  annotationConfig,
  handoffId,
}: {
  destinationSeedData: Partial<TDest>;
  destinationRecordType: string;
  annotationConfig?: IFieldAnnotationConfig;
  handoffId: string;
}) {
  const entries = Object.entries(destinationSeedData as Record<string, unknown>)
    .filter(([, v]) => v !== null && v !== undefined && v !== '');

  return (
    <section className="hbc-handoff-receiver__section" aria-labelledby="source-summary-heading">
      <h3 id="source-summary-heading" className="hbc-handoff-receiver__section-title">
        {destinationRecordType} — Key Fields
      </h3>
      <div className="hbc-handoff-receiver__field-grid">
        {entries.map(([key, value]) => (
          <div key={key} className="hbc-handoff-receiver__field-row" id={key}>
            <span className="hbc-handoff-receiver__field-key">{key}</span>
            <span className="hbc-handoff-receiver__field-value">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
            {/* HbcAnnotationMarker rendered adjacent to each field when annotationConfig provided */}
            {annotationConfig && (
              <span className="hbc-handoff-receiver__annotation-slot" data-field-key={key}>
                {/* HbcAnnotationMarker from @hbc/field-annotations composed here by consuming module */}
                {/* Example:
                <HbcAnnotationMarker
                  recordType="workflow-handoff"
                  recordId={handoffId}
                  fieldKey={key}
                  fieldLabel={key}
                  config={annotationConfig}
                  canAnnotate={true}
                />
                */}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Documents
// ─────────────────────────────────────────────────────────────────────────────

function DocumentsSection({ documents }: { documents: IHandoffDocument[] }) {
  if (documents.length === 0) {
    return (
      <section className="hbc-handoff-receiver__section hbc-handoff-receiver__section--empty">
        <h3 className="hbc-handoff-receiver__section-title">Documents</h3>
        <p className="hbc-handoff-receiver__empty-note">No documents attached to this handoff.</p>
      </section>
    );
  }

  // Group by category
  const byCategory = documents.reduce<Record<string, IHandoffDocument[]>>((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {});

  return (
    <section className="hbc-handoff-receiver__section" aria-labelledby="documents-heading">
      <h3 id="documents-heading" className="hbc-handoff-receiver__section-title">
        Documents ({documents.length})
      </h3>
      {Object.entries(byCategory).map(([category, docs]) => (
        <div key={category} className="hbc-handoff-receiver__doc-category">
          <h4 className="hbc-handoff-receiver__doc-category-label">{category}</h4>
          <ul className="hbc-handoff-receiver__doc-list">
            {docs.map((doc) => (
              <li key={doc.documentId} className="hbc-handoff-receiver__doc-item">
                <a
                  href={doc.sharepointUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hbc-handoff-receiver__doc-link"
                >
                  📎 {doc.fileName}
                </a>
                {doc.fileSizeBytes && (
                  <span className="hbc-handoff-receiver__doc-size">
                    {(doc.fileSizeBytes / 1024).toFixed(0)} KB
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Context Notes
// ─────────────────────────────────────────────────────────────────────────────

function ContextNotesSection({ notes }: { notes: IHandoffContextNote[] }) {
  if (notes.length === 0) return null;

  return (
    <section className="hbc-handoff-receiver__section" aria-labelledby="context-notes-heading">
      <h3 id="context-notes-heading" className="hbc-handoff-receiver__section-title">
        Context Notes ({notes.length})
      </h3>
      <ul className="hbc-handoff-receiver__notes-list">
        {notes.map((note) => (
          <li
            key={note.noteId}
            className={`hbc-handoff-note hbc-handoff-note--${noteCategoryColorClass[note.category]}`}
          >
            <header className="hbc-handoff-note__header">
              <span className="hbc-handoff-note__category">{note.category}</span>
              <span className="hbc-handoff-note__author">{note.author.displayName}</span>
            </header>
            <p className="hbc-handoff-note__body">{note.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reject Form (D-07: rejection reason required)
// ─────────────────────────────────────────────────────────────────────────────

function RejectForm({
  onReject,
  onCancel,
  isRejecting,
}: {
  onReject: (reason: string) => void;
  onCancel: () => void;
  isRejecting: boolean;
}) {
  const [reason, setReason] = useState('');

  return (
    <div
      className="hbc-handoff-reject-form"
      role="dialog"
      aria-label="Reject handoff"
      aria-modal="true"
    >
      <h3 className="hbc-handoff-reject-form__title">Reject Handoff Package</h3>
      <p className="hbc-handoff-reject-form__warning">
        Rejection will return BIC ownership to the sender and cannot be undone.
        The sender must create a new handoff package after addressing the issue.
      </p>

      <label className="hbc-handoff-reject-form__label">
        Rejection reason (required)
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe what needs to be addressed before the handoff can proceed…"
          rows={4}
          className="hbc-handoff-reject-form__textarea"
          aria-required="true"
        />
      </label>

      <div className="hbc-handoff-reject-form__actions">
        <button
          type="button"
          className="hbc-btn hbc-btn--danger"
          onClick={() => onReject(reason)}
          disabled={!reason.trim() || isRejecting}
        >
          {isRejecting ? 'Rejecting…' : 'Confirm Rejection'}
        </button>
        <button type="button" className="hbc-btn hbc-btn--ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HbcHandoffReceiver — main export
// ─────────────────────────────────────────────────────────────────────────────

export interface HbcHandoffReceiverProps<TSource, TDest> {
  handoffId: string;
  config: IHandoffConfig<TSource, TDest>;
  annotationConfig?: IFieldAnnotationConfig;
  onAcknowledged?: (pkg: IHandoffPackage<TSource, TDest>) => void;
  onRejected?: (pkg: IHandoffPackage<TSource, TDest>) => void;
}

export function HbcHandoffReceiver<TSource, TDest>({
  handoffId,
  config,
  annotationConfig,
  onAcknowledged,
  onRejected,
}: HbcHandoffReceiverProps<TSource, TDest>) {
  const queryClient = useQueryClient();
  const [pkg, setPkg] = useState<IHandoffPackage<TSource, TDest> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load package on mount
  useEffect(() => {
    HandoffApi.get<TSource, TDest>(handoffId)
      .then(async (loaded) => {
        setPkg(loaded);
        // Mark as received if still in 'sent' state (first view signal) (D-02)
        if (loaded.status === 'sent') {
          const received = await HandoffApi.markReceived<TSource, TDest>(handoffId);
          setPkg(received);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [handoffId]);

  const handleAcknowledge = useCallback(async () => {
    if (!pkg) return;
    setIsAcknowledging(true);
    setError(null);
    try {
      const acknowledged = await HandoffApi.acknowledge<TSource, TDest>(handoffId);
      queryClient.invalidateQueries({ queryKey: handoffQueryKeys.inbox() });
      queryClient.invalidateQueries({ queryKey: handoffQueryKeys.package(handoffId) });
      onAcknowledged?.(acknowledged);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Acknowledgment failed. Please try again.');
    } finally {
      setIsAcknowledging(false);
    }
  }, [pkg, handoffId, queryClient, onAcknowledged]);

  const handleReject = useCallback(async (reason: string) => {
    if (!pkg) return;
    setIsRejecting(true);
    setError(null);
    try {
      const rejected = await HandoffApi.reject<TSource, TDest>(handoffId, reason);
      queryClient.invalidateQueries({ queryKey: handoffQueryKeys.inbox() });
      queryClient.invalidateQueries({ queryKey: handoffQueryKeys.package(handoffId) });
      onRejected?.(rejected);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rejection failed. Please try again.');
    } finally {
      setIsRejecting(false);
      setShowRejectForm(false);
    }
  }, [pkg, handoffId, queryClient, onRejected]);

  if (isLoading) {
    return (
      <div className="hbc-handoff-receiver hbc-handoff-receiver--loading" aria-busy="true">
        <p>Loading handoff package…</p>
      </div>
    );
  }

  if (!pkg || error) {
    return (
      <div className="hbc-handoff-receiver hbc-handoff-receiver--error" role="alert">
        <p>{error ?? 'Could not load handoff package.'}</p>
      </div>
    );
  }

  const isTerminal = pkg.status === 'acknowledged' || pkg.status === 'rejected';
  const isActive = pkg.status === 'sent' || pkg.status === 'received';

  return (
    <div
      className="hbc-handoff-receiver"
      role="main"
      aria-label={`Handoff from ${pkg.sender.displayName}`}
    >
      {/* Header: route name + sender */}
      <header className="hbc-handoff-receiver__header">
        <h2 className="hbc-handoff-receiver__title">{config.routeLabel}</h2>
        <p className="hbc-handoff-receiver__from">
          From <strong>{pkg.sender.displayName}</strong> · {pkg.sender.role}
        </p>
        {pkg.sentAt && (
          <time className="hbc-handoff-receiver__sent-at" dateTime={pkg.sentAt}>
            Sent {new Date(pkg.sentAt).toLocaleDateString()}
          </time>
        )}
      </header>

      {/* Already acknowledged */}
      {pkg.status === 'acknowledged' && (
        <div className="hbc-handoff-receiver__terminal hbc-handoff-receiver__terminal--acknowledged">
          ✓ Acknowledged on {new Date(pkg.acknowledgedAt!).toLocaleDateString()}
          {pkg.createdDestinationRecordId && (
            <span> · Record created (ID: {pkg.createdDestinationRecordId})</span>
          )}
        </div>
      )}

      {/* Already rejected */}
      {pkg.status === 'rejected' && (
        <div className="hbc-handoff-receiver__terminal hbc-handoff-receiver__terminal--rejected">
          ✗ Rejected on {new Date(pkg.rejectedAt!).toLocaleDateString()}
          {pkg.rejectionReason && (
            <p className="hbc-handoff-receiver__rejection-reason">
              Reason: {pkg.rejectionReason}
            </p>
          )}
        </div>
      )}

      {/* Source record summary + field annotations */}
      <SourceSummarySection
        destinationSeedData={pkg.destinationSeedData}
        destinationRecordType={config.destinationRecordType}
        annotationConfig={annotationConfig}
        handoffId={handoffId}
      />

      {/* Documents */}
      <DocumentsSection documents={pkg.documents} />

      {/* Context notes */}
      <ContextNotesSection notes={pkg.contextNotes} />

      {/* "What happens next" */}
      {isActive && (
        <section className="hbc-handoff-receiver__section hbc-handoff-receiver__section--next-steps">
          <h3 className="hbc-handoff-receiver__section-title">What happens next</h3>
          <p>{config.acknowledgeDescription}</p>
        </section>
      )}

      {/* Error banner */}
      {error && <div className="hbc-handoff-receiver__error" role="alert">{error}</div>}

      {/* Reject form overlay */}
      {showRejectForm && (
        <div className="hbc-handoff-receiver__reject-overlay">
          <RejectForm
            onReject={handleReject}
            onCancel={() => setShowRejectForm(false)}
            isRejecting={isRejecting}
          />
        </div>
      )}

      {/* CTAs — only for active packages */}
      {isActive && !showRejectForm && (
        <footer className="hbc-handoff-receiver__ctas">
          <button
            type="button"
            className="hbc-btn hbc-btn--primary hbc-btn--lg"
            onClick={handleAcknowledge}
            disabled={isAcknowledging}
            aria-busy={isAcknowledging}
          >
            {isAcknowledging ? 'Creating record…' : `Acknowledge & Create ${config.destinationRecordType}`}
          </button>
          <button
            type="button"
            className="hbc-btn hbc-btn--ghost hbc-btn--danger-outline"
            onClick={() => setShowRejectForm(true)}
            disabled={isAcknowledging}
          >
            Reject with Reason
          </button>
        </footer>
      )}
    </div>
  );
}
```

---

## `src/components/HbcHandoffStatusBadge.tsx`

```typescript
import React from 'react';
import { useComplexity } from '@hbc/complexity';
import type { HandoffStatus } from '../types/IWorkflowHandoff';
import {
  handoffStatusLabel,
  handoffStatusColorClass,
} from '../constants/handoffDefaults';

export interface HbcHandoffStatusBadgeProps {
  /** The handoff ID — used to find the package for the timestamp (Expert mode, D-08) */
  handoffId: string | null;
  /** Current handoff status */
  status: HandoffStatus | null;
  /** ISO 8601 of the most recent status transition — displayed in Expert mode (D-08) */
  lastUpdatedAt?: string | null;
  /** Force a complexity variant */
  forceVariant?: 'standard' | 'expert';
}

/**
 * Passive status indicator shown on the source record after a handoff is sent.
 *
 * Complexity gating (D-08):
 * - Essential: hidden (returns null)
 * - Standard: badge label only
 * - Expert: badge label + last-update timestamp
 *
 * Returns null when status is null (no handoff initiated).
 */
export function HbcHandoffStatusBadge({
  handoffId,
  status,
  lastUpdatedAt,
  forceVariant,
}: HbcHandoffStatusBadgeProps) {
  const { variant: contextVariant } = useComplexity();
  const variant = forceVariant ?? contextVariant;

  // Essential mode: hidden (D-08)
  if (variant === 'essential') return null;

  // No handoff initiated
  if (!status) return null;

  const label = handoffStatusLabel[status];
  const colorClass = handoffStatusColorClass[status];

  return (
    <div
      className={`hbc-handoff-status-badge hbc-handoff-status-badge--${colorClass}`}
      aria-label={label}
      data-handoff-id={handoffId}
      data-status={status}
    >
      <span className="hbc-handoff-status-badge__label">{label}</span>

      {/* Expert mode: last-update timestamp (D-08) */}
      {variant === 'expert' && lastUpdatedAt && (
        <time
          className="hbc-handoff-status-badge__timestamp"
          dateTime={lastUpdatedAt}
          title={new Date(lastUpdatedAt).toLocaleString()}
        >
          {new Date(lastUpdatedAt).toLocaleDateString()}
        </time>
      )}
    </div>
  );
}
```

---

## Status Badge Visual Reference (D-08)

| Status | Color Class | Label | Essential | Standard | Expert |
|---|---|---|---|---|---|
| `null` | — | — | Hidden | Hidden | Hidden |
| `draft` | grey | Handoff Draft | Hidden | ✓ | ✓ + timestamp |
| `sent` | blue | Awaiting Acknowledgment | Hidden | ✓ | ✓ + timestamp |
| `received` | blue | Viewed by Recipient | Hidden | ✓ | ✓ + timestamp |
| `acknowledged` | green | Handoff Acknowledged | Hidden | ✓ | ✓ + timestamp |
| `rejected` | red | Handoff Rejected — Revision Required | Hidden | ✓ | ✓ + timestamp |

---

## Verification Commands

```bash
pnpm --filter @hbc/workflow-handoff check-types
pnpm --filter @hbc/workflow-handoff build
pnpm --filter @hbc/workflow-handoff test -- --grep "HbcHandoffReceiver|HbcHandoffStatusBadge"

# Storybook
pnpm --filter @hbc/dev-harness storybook
# Navigate to: Workflow Handoff / HbcHandoffReceiver and Workflow Handoff / HbcHandoffStatusBadge
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF08-T06 not yet started.
Next: SF08-T07 (Reference Implementations)
-->
