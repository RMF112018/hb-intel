# SF07-T06 — `HbcAnnotationThread` and `HbcAnnotationSummary` Components

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-07-Shared-Feature-Field-Annotations.md`
**Decisions Applied:** D-05 (complexity mode), D-06 (SPFx popover constraint), D-07 (flat reply model), D-08 (assignment UI)
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T01–T05

> **Doc Classification:** Canonical Normative Plan — SF07-T06 thread and summary components task; sub-plan of `SF07-Field-Annotations.md`.

---

## Objective

Implement `HbcAnnotationThread` (the popover-anchored field-level comment thread with full CRUD) and `HbcAnnotationSummary` (the record-level open annotation panel surfaced in the detail view sidebar). Both components compose the hooks from T04 and respect SPFx constraints from D-06.

---

## 3-Line Plan

1. Implement `HbcAnnotationThread` — anchored popover with thread list, add annotation form, reply form, and resolve/withdraw actions.
2. Implement `HbcAnnotationSummary` — sidebar panel showing all open annotations grouped by field with navigation callbacks.
3. Apply SPFx constraints: Thread uses `@hbc/ui-kit/app-shell` Popover; Summary not rendered in SPFx.

---

## `HbcAnnotationThread` — Props Interface

```typescript
export interface HbcAnnotationThreadProps {
  recordType: string;
  recordId: string;
  fieldKey: string;
  fieldLabel: string;
  config: Required<IFieldAnnotationConfig>;
  canAnnotate?: boolean;
  canResolve?: boolean;
  /** Ref of the marker button — used to anchor the popover (D-06) */
  anchorRef: React.RefObject<HTMLButtonElement>;
  /** Called when user dismisses the thread (Escape, click-outside, close button) */
  onClose: () => void;
  /**
   * Optional: force a specific complexity variant (D-05).
   * Inherits from HbcAnnotationMarker when opened via marker click.
   */
  forceVariant?: 'standard' | 'expert';
}
```

---

## `src/components/HbcAnnotationThread.tsx`

```typescript
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useComplexity } from '@hbc/complexity';
import { Popover } from '@hbc/ui-kit/app-shell'; // D-06: app-shell popover primitive
import { useFieldAnnotation } from '../hooks/useFieldAnnotation';
import { useAnnotationActions } from '../hooks/useAnnotationActions';
import type {
  IFieldAnnotation,
  IFieldAnnotationConfig,
  AnnotationIntent,
} from '../types/IFieldAnnotation';
import { intentLabel, intentColorClass } from '../constants/annotationDefaults';
import type { HbcAnnotationThreadProps } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Individual annotation card within the thread
// ─────────────────────────────────────────────────────────────────────────────

interface AnnotationCardProps {
  annotation: IFieldAnnotation;
  config: Required<IFieldAnnotationConfig>;
  canResolve: boolean;
  variant: 'standard' | 'expert';
  actions: ReturnType<typeof useAnnotationActions>;
}

function AnnotationCard({ annotation, config, canResolve, variant, actions }: AnnotationCardProps) {
  const [replyBody, setReplyBody] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);

  const colorClass = intentColorClass[annotation.intent] ?? 'blue';
  const isOpen = annotation.status === 'open';

  const handleReply = useCallback(async () => {
    if (!replyBody.trim()) return;
    await actions.addReply({ annotationId: annotation.annotationId, body: replyBody });
    setReplyBody('');
    setShowReplyForm(false);
  }, [replyBody, annotation.annotationId, actions]);

  const handleResolve = useCallback(async () => {
    const needsNote =
      config.requireResolutionNote &&
      annotation.intent !== 'comment';
    if (needsNote && !resolutionNote.trim()) return;

    await actions.resolveAnnotation({
      annotationId: annotation.annotationId,
      resolutionNote: resolutionNote.trim() || null,
    });
    setResolutionNote('');
    setShowResolveForm(false);
  }, [annotation, config, resolutionNote, actions]);

  const handleWithdraw = useCallback(async () => {
    await actions.withdrawAnnotation({ annotationId: annotation.annotationId });
  }, [annotation.annotationId, actions]);

  return (
    <article
      className={`hbc-annotation-card hbc-annotation-card--${colorClass}`}
      aria-label={`${intentLabel[annotation.intent]} by ${annotation.author.displayName}`}
      data-status={annotation.status}
    >
      {/* Intent badge + author line */}
      <header className="hbc-annotation-card__header">
        <span className={`hbc-annotation-badge hbc-annotation-badge--${colorClass}`}>
          {intentLabel[annotation.intent]}
        </span>
        <span className="hbc-annotation-card__author">
          {annotation.author.displayName}
          <span className="hbc-annotation-card__role"> · {annotation.author.role}</span>
        </span>
        <time
          className="hbc-annotation-card__timestamp"
          dateTime={annotation.createdAt}
          title={new Date(annotation.createdAt).toLocaleString()}
        >
          {formatRelativeTime(annotation.createdAt)}
        </time>
      </header>

      {/* Body */}
      <p className="hbc-annotation-card__body">{annotation.body}</p>

      {/* Assignee line (when set) */}
      {annotation.assignedTo && isOpen && (
        <p className="hbc-annotation-card__assignee">
          → Assigned to{' '}
          <strong>{annotation.assignedTo.displayName}</strong>
        </p>
      )}

      {/* Replies (D-07: flat list, sorted ascending) */}
      {annotation.replies.length > 0 && (
        <ul className="hbc-annotation-replies" aria-label="Replies">
          {annotation.replies.map((reply) => (
            <li key={reply.replyId} className="hbc-annotation-reply">
              <span className="hbc-annotation-reply__author">{reply.author.displayName}</span>
              <p className="hbc-annotation-reply__body">{reply.body}</p>
              <time className="hbc-annotation-reply__time" dateTime={reply.createdAt}>
                {formatRelativeTime(reply.createdAt)}
              </time>
            </li>
          ))}
        </ul>
      )}

      {/* Expert mode: inline reply form (D-05 — Expert shows full thread inline) */}
      {variant === 'expert' && isOpen && showReplyForm && (
        <div className="hbc-annotation-reply-form">
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Add a reply..."
            aria-label="Reply text"
            rows={2}
            className="hbc-annotation-reply-form__textarea"
          />
          <div className="hbc-annotation-reply-form__actions">
            <button
              type="button"
              onClick={handleReply}
              disabled={!replyBody.trim() || actions.isReplying}
              className="hbc-btn hbc-btn--primary hbc-btn--sm"
            >
              {actions.isReplying ? 'Sending…' : 'Reply'}
            </button>
            <button
              type="button"
              onClick={() => setShowReplyForm(false)}
              className="hbc-btn hbc-btn--ghost hbc-btn--sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action row — only for open annotations */}
      {isOpen && (
        <div className="hbc-annotation-card__actions">
          {/* Reply CTA — Standard: opens new thread row; Expert: toggles inline form */}
          <button
            type="button"
            className="hbc-annotation-card__action-btn"
            onClick={() => setShowReplyForm((prev) => !prev)}
          >
            Reply
          </button>

          {/* Resolve CTA — only if canResolve */}
          {canResolve && !showResolveForm && (
            <button
              type="button"
              className="hbc-annotation-card__action-btn hbc-annotation-card__action-btn--resolve"
              onClick={() => setShowResolveForm(true)}
            >
              Resolve
            </button>
          )}

          {/* Withdraw CTA — typically for the author */}
          <button
            type="button"
            className="hbc-annotation-card__action-btn hbc-annotation-card__action-btn--withdraw"
            onClick={handleWithdraw}
            disabled={actions.isWithdrawing}
          >
            Withdraw
          </button>
        </div>
      )}

      {/* Resolve form */}
      {showResolveForm && (
        <div className="hbc-annotation-resolve-form" role="form" aria-label="Resolve annotation">
          {(config.requireResolutionNote && annotation.intent !== 'comment') && (
            <label className="hbc-annotation-resolve-form__label">
              Resolution note (required)
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Describe how this was addressed…"
                rows={3}
                className="hbc-annotation-resolve-form__textarea"
                aria-required="true"
              />
            </label>
          )}
          <div className="hbc-annotation-resolve-form__actions">
            <button
              type="button"
              onClick={handleResolve}
              disabled={
                actions.isResolving ||
                (config.requireResolutionNote &&
                  annotation.intent !== 'comment' &&
                  !resolutionNote.trim())
              }
              className="hbc-btn hbc-btn--primary hbc-btn--sm"
            >
              {actions.isResolving ? 'Resolving…' : 'Mark Resolved'}
            </button>
            <button
              type="button"
              onClick={() => setShowResolveForm(false)}
              className="hbc-btn hbc-btn--ghost hbc-btn--sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Resolved annotation summary */}
      {annotation.status === 'resolved' && annotation.resolutionNote && (
        <div className="hbc-annotation-card__resolution">
          <strong>Resolution: </strong>{annotation.resolutionNote}
          {annotation.resolvedBy && (
            <span> — {annotation.resolvedBy.displayName}</span>
          )}
        </div>
      )}
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Add Annotation Form
// ─────────────────────────────────────────────────────────────────────────────

interface AddAnnotationFormProps {
  config: Required<IFieldAnnotationConfig>;
  recordType: string;
  recordId: string;
  fieldKey: string;
  fieldLabel: string;
  actions: ReturnType<typeof useAnnotationActions>;
}

function AddAnnotationForm({
  config,
  recordType,
  recordId,
  fieldKey,
  fieldLabel,
  actions,
}: AddAnnotationFormProps) {
  const [intent, setIntent] = useState<AnnotationIntent>('comment');
  const [body, setBody] = useState('');

  const handleSubmit = useCallback(async () => {
    if (!body.trim()) return;
    await actions.createAnnotation({
      recordType,
      recordId,
      fieldKey,
      fieldLabel,
      intent,
      body: body.trim(),
    });
    setBody('');
    setIntent('comment');
  }, [intent, body, recordType, recordId, fieldKey, fieldLabel, actions]);

  return (
    <div className="hbc-annotation-add-form" role="form" aria-label="Add annotation">
      <div className="hbc-annotation-add-form__intent">
        <label htmlFor="annotation-intent" className="hbc-annotation-add-form__intent-label">
          Type
        </label>
        <select
          id="annotation-intent"
          value={intent}
          onChange={(e) => setIntent(e.target.value as AnnotationIntent)}
          className="hbc-annotation-add-form__intent-select"
        >
          <option value="comment">Comment</option>
          <option value="clarification-request">Clarification Request</option>
          <option value="flag-for-revision">Flag for Revision</option>
        </select>
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={
          intent === 'clarification-request'
            ? 'What needs clarification?'
            : intent === 'flag-for-revision'
            ? 'What needs to be revised?'
            : 'Add a comment…'
        }
        rows={3}
        className="hbc-annotation-add-form__textarea"
        aria-label="Annotation text"
      />

      <div className="hbc-annotation-add-form__actions">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!body.trim() || actions.isCreating}
          className="hbc-btn hbc-btn--primary hbc-btn--sm"
        >
          {actions.isCreating ? 'Adding…' : 'Add'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HbcAnnotationThread — main export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Utility: format ISO 8601 timestamp as relative time string.
 * In production this should use a proper i18n-aware library.
 */
function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function HbcAnnotationThread({
  recordType,
  recordId,
  fieldKey,
  fieldLabel,
  config,
  canAnnotate = false,
  canResolve = false,
  anchorRef,
  onClose,
  forceVariant,
}: HbcAnnotationThreadProps) {
  const { variant: contextVariant } = useComplexity();
  const variant = (forceVariant ?? contextVariant) as 'standard' | 'expert';

  const { annotations } = useFieldAnnotation(recordType, recordId, fieldKey);
  const actions = useAnnotationActions(recordType, recordId);

  const [showResolved, setShowResolved] = useState(false);

  const open = annotations.filter((a) => a.status === 'open');
  const resolved = annotations.filter((a) => a.status === 'resolved' || a.status === 'withdrawn');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    // D-06: Popover from @hbc/ui-kit/app-shell — compatible with SPFx bundle budget
    <Popover
      anchorRef={anchorRef}
      onDismiss={onClose}
      placement="right-start"
      className="hbc-annotation-thread"
      aria-label={`Annotations for ${fieldLabel}`}
      role="dialog"
    >
      {/* Thread header */}
      <header className="hbc-annotation-thread__header">
        <h2 className="hbc-annotation-thread__title">
          {fieldLabel}
        </h2>
        {open.length > 0 && (
          <span className="hbc-annotation-thread__open-count">
            {open.length} open
          </span>
        )}
        <button
          type="button"
          className="hbc-annotation-thread__close"
          onClick={onClose}
          aria-label="Close annotation thread"
        >
          ✕
        </button>
      </header>

      {/* Open annotation cards */}
      <div className="hbc-annotation-thread__open-list" role="list">
        {open.length === 0 && !canAnnotate && (
          <p className="hbc-annotation-thread__empty">No open annotations.</p>
        )}
        {open.map((annotation) => (
          <AnnotationCard
            key={annotation.annotationId}
            annotation={annotation}
            config={config}
            canResolve={canResolve}
            variant={variant}
            actions={actions}
          />
        ))}
      </div>

      {/* Resolved annotations — collapsed by default */}
      {resolved.length > 0 && (
        <div className="hbc-annotation-thread__resolved-section">
          <button
            type="button"
            className="hbc-annotation-thread__resolved-toggle"
            onClick={() => setShowResolved((prev) => !prev)}
            aria-expanded={showResolved}
          >
            {showResolved ? 'Hide' : `Show`} resolved ({resolved.length})
          </button>
          {showResolved && (
            <div className="hbc-annotation-thread__resolved-list" role="list">
              {resolved.map((annotation) => (
                <AnnotationCard
                  key={annotation.annotationId}
                  annotation={annotation}
                  config={config}
                  canResolve={false} /* Cannot re-resolve resolved annotations */
                  variant={variant}
                  actions={actions}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add annotation CTA — only when canAnnotate */}
      {canAnnotate && (
        <div className="hbc-annotation-thread__add-section">
          <h3 className="hbc-annotation-thread__add-label">Add annotation</h3>
          <AddAnnotationForm
            config={config}
            recordType={recordType}
            recordId={recordId}
            fieldKey={fieldKey}
            fieldLabel={fieldLabel}
            actions={actions}
          />
        </div>
      )}
    </Popover>
  );
}
```

---

## `HbcAnnotationSummary` — Props Interface

```typescript
export interface HbcAnnotationSummaryProps {
  recordType: string;
  recordId: string;
  config: IFieldAnnotationConfig;
  /**
   * Called when user clicks a summary item to scroll the form to that field (D-09).
   * The host form is responsible for implementing the scroll behavior.
   */
  onFieldFocus?: (fieldKey: string) => void;
  forceVariant?: 'standard' | 'expert';
}
```

---

## `src/components/HbcAnnotationSummary.tsx`

```typescript
import React from 'react';
import { useComplexity } from '@hbc/complexity';
import { useFieldAnnotations } from '../hooks/useFieldAnnotations';
import type { IFieldAnnotation, IFieldAnnotationConfig } from '../types/IFieldAnnotation';
import { intentLabel, intentColorClass, resolveAnnotationConfig } from '../constants/annotationDefaults';

export interface HbcAnnotationSummaryProps {
  recordType: string;
  recordId: string;
  config: IFieldAnnotationConfig;
  onFieldFocus?: (fieldKey: string) => void;
  forceVariant?: 'standard' | 'expert';
}

export function HbcAnnotationSummary({
  recordType,
  recordId,
  config,
  onFieldFocus,
  forceVariant,
}: HbcAnnotationSummaryProps) {
  const { variant: contextVariant } = useComplexity();
  const variant = forceVariant ?? contextVariant;

  // D-05: Essential hides summary; D-06: Not rendered in SPFx (consumer responsibility)
  if (variant === 'essential') return null;

  const resolvedConfig = resolveAnnotationConfig(config);
  const { annotations, counts, isLoading } = useFieldAnnotations(recordType, recordId);

  const openAnnotations = annotations.filter((a) => a.status === 'open');

  // Group open annotations by fieldKey
  const byField = openAnnotations.reduce<Record<string, IFieldAnnotation[]>>((acc, a) => {
    if (!acc[a.fieldKey]) acc[a.fieldKey] = [];
    acc[a.fieldKey].push(a);
    return acc;
  }, {});

  const fieldKeys = Object.keys(byField);
  const isExpanded = variant === 'expert';

  if (isLoading) {
    return (
      <aside className="hbc-annotation-summary hbc-annotation-summary--loading" aria-busy="true">
        <span className="hbc-annotation-summary__loading-text">Loading annotations…</span>
      </aside>
    );
  }

  if (counts.totalOpen === 0) {
    return (
      <aside className="hbc-annotation-summary hbc-annotation-summary--empty">
        <span className="hbc-annotation-summary__empty-text">
          No open annotations
        </span>
        {counts.totalResolved > 0 && (
          <span className="hbc-annotation-summary__resolved-count">
            {counts.totalResolved} resolved
          </span>
        )}
      </aside>
    );
  }

  return (
    <aside
      className={`hbc-annotation-summary ${isExpanded ? 'hbc-annotation-summary--expanded' : ''}`}
      aria-label="Open annotations"
    >
      {/* Summary header with counts */}
      <header className="hbc-annotation-summary__header">
        <h3 className="hbc-annotation-summary__title">
          {counts.totalOpen} open annotation{counts.totalOpen !== 1 ? 's' : ''}
        </h3>
        <div className="hbc-annotation-summary__breakdown">
          {counts.openClarificationRequests > 0 && (
            <span className="hbc-annotation-summary__breakdown-item hbc-annotation-summary__breakdown-item--red">
              {counts.openClarificationRequests} clarification{counts.openClarificationRequests !== 1 ? 's' : ''}
            </span>
          )}
          {counts.openRevisionFlags > 0 && (
            <span className="hbc-annotation-summary__breakdown-item hbc-annotation-summary__breakdown-item--amber">
              {counts.openRevisionFlags} revision flag{counts.openRevisionFlags !== 1 ? 's' : ''}
            </span>
          )}
          {counts.openComments > 0 && (
            <span className="hbc-annotation-summary__breakdown-item hbc-annotation-summary__breakdown-item--blue">
              {counts.openComments} comment{counts.openComments !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </header>

      {/* Per-field breakdown (D-05: Standard shows count only; Expert shows full breakdown) */}
      {isExpanded && fieldKeys.length > 0 && (
        <ul className="hbc-annotation-summary__field-list" aria-label="Annotations by field">
          {fieldKeys.map((fieldKey) => {
            const fieldAnnotations = byField[fieldKey];
            const topAnnotation = fieldAnnotations[0];

            return (
              <li
                key={fieldKey}
                className="hbc-annotation-summary__field-item"
              >
                <button
                  type="button"
                  className="hbc-annotation-summary__field-btn"
                  onClick={() => onFieldFocus?.(fieldKey)}
                  aria-label={`Go to ${topAnnotation.fieldLabel} — ${fieldAnnotations.length} open annotation${fieldAnnotations.length !== 1 ? 's' : ''}`}
                >
                  <span className="hbc-annotation-summary__field-label">
                    {topAnnotation.fieldLabel}
                  </span>
                  <span className="hbc-annotation-summary__field-count">
                    {fieldAnnotations.length}
                  </span>
                </button>

                {/* Intent badges for annotations on this field */}
                <ul className="hbc-annotation-summary__annotation-list">
                  {fieldAnnotations.map((annotation) => (
                    <li
                      key={annotation.annotationId}
                      className="hbc-annotation-summary__annotation-row"
                    >
                      <span
                        className={`hbc-annotation-badge hbc-annotation-badge--${intentColorClass[annotation.intent]}`}
                      >
                        {intentLabel[annotation.intent]}
                      </span>
                      <span className="hbc-annotation-summary__annotation-author">
                        {annotation.author.displayName}
                      </span>
                      <span className="hbc-annotation-summary__annotation-excerpt">
                        {annotation.body.length > 60
                          ? `${annotation.body.slice(0, 60)}…`
                          : annotation.body}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}

      {/* Standard mode: show field count only (D-05) */}
      {!isExpanded && fieldKeys.length > 0 && (
        <p className="hbc-annotation-summary__field-count-summary">
          Across {fieldKeys.length} field{fieldKeys.length !== 1 ? 's' : ''}
        </p>
      )}
    </aside>
  );
}
```

---

## Complexity Rendering Summary (D-05)

### `HbcAnnotationThread`

| Feature | Standard | Expert |
|---|---|---|
| Open annotation list | ✓ | ✓ |
| Resolved annotations (collapsed toggle) | ✓ | ✓ (expanded by default) |
| Reply form | Button → opens new card row | Inline textarea in card |
| Resolve form | ✓ | ✓ with required note enforcement |
| Add annotation CTA | ✓ intent selector + textarea | ✓ intent selector + textarea |

### `HbcAnnotationSummary`

| Feature | Standard | Expert |
|---|---|---|
| Open count header | ✓ | ✓ |
| Count breakdown (clarifications / flags / comments) | ✓ | ✓ |
| Per-field grouping with navigate-to button | Count only | Full list with excerpts |
| Per-field intent badge + author | No | ✓ |

---

## SPFx Compliance (D-06)

`HbcAnnotationThread` imports `Popover` from `@hbc/ui-kit/app-shell`, which is explicitly safe for SPFx bundle budgets. This must **not** be changed to import from full `@hbc/ui-kit`. If the `app-shell` popover primitive does not exist at implementation time, create it as a minimal positioning wrapper using `position: fixed` and `getBoundingClientRect()` before proceeding.

`HbcAnnotationSummary` must not be rendered in SPFx webpart contexts. The consuming module is responsible for suppressing the summary component in SPFx surfaces (typically via a `isSPFx` context flag from `@hbc/shell`).

---

## Verification Commands

```bash
# Type-check with zero errors
pnpm --filter @hbc/field-annotations check-types

# Build
pnpm --filter @hbc/field-annotations build

# Run component tests (written in T08)
pnpm --filter @hbc/field-annotations test -- --grep "HbcAnnotationThread|HbcAnnotationSummary"

# Visual verification: open Storybook
pnpm --filter @hbc/dev-harness storybook
# Navigate to: Annotations / HbcAnnotationThread and Annotations / HbcAnnotationSummary
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF07-T06 completed: 2026-03-10
- Created HbcAnchoredPopover in @hbc/ui-kit (lightweight, SPFx-safe, no Griffel)
- Exported as Popover/PopoverProps from @hbc/ui-kit/app-shell
- Implemented HbcAnnotationThread with full CRUD (cards, replies, resolve, withdraw, add)
- Implemented HbcAnnotationSummary with D-05 complexity rendering (standard vs expert)
- Applied corrections: tier not variant from useComplexity, inline props, hooks before early return, RefObject<T | null>
- All gates pass: check-types, build, lint (zero warnings)
Next: SF07-T07 (Platform Wiring)
-->
