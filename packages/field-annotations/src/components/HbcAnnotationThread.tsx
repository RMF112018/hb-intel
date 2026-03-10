import React, { useState, useCallback, useEffect, type RefObject } from 'react';
import { useComplexity } from '@hbc/complexity';
import { Popover } from '@hbc/ui-kit/app-shell';
import { useFieldAnnotation } from '../hooks/useFieldAnnotation';
import { useAnnotationActions } from '../hooks/useAnnotationActions';
import type {
  IFieldAnnotation,
  IFieldAnnotationConfig,
  AnnotationIntent,
} from '../types/IFieldAnnotation';
import { intentLabel, intentColorClass } from '../constants/annotationDefaults';
import './HbcAnnotationThread.css';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface HbcAnnotationThreadProps {
  recordType: string;
  recordId: string;
  fieldKey: string;
  fieldLabel: string;
  config: Required<IFieldAnnotationConfig>;
  canAnnotate?: boolean;
  canResolve?: boolean;
  /** Ref of the marker button — used to anchor the popover (D-06) */
  anchorRef: RefObject<HTMLButtonElement | null>;
  /** Called when user dismisses the thread (Escape, click-outside, close button) */
  onClose: () => void;
  /** Optional: force a specific complexity variant (D-05) */
  forceVariant?: 'standard' | 'expert';
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: format ISO 8601 timestamp as relative time string
// ─────────────────────────────────────────────────────────────────────────────

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

      {/* Expert mode: inline reply form (D-05) */}
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
          <button
            type="button"
            className="hbc-annotation-card__action-btn"
            onClick={() => setShowReplyForm((prev) => !prev)}
          >
            Reply
          </button>

          {canResolve && !showResolveForm && (
            <button
              type="button"
              className="hbc-annotation-card__action-btn hbc-annotation-card__action-btn--resolve"
              onClick={() => setShowResolveForm(true)}
            >
              Resolve
            </button>
          )}

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
  recordType: string;
  recordId: string;
  fieldKey: string;
  fieldLabel: string;
  actions: ReturnType<typeof useAnnotationActions>;
}

function AddAnnotationForm({
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
  const { tier: contextTier } = useComplexity();
  const variant = (forceVariant ?? contextTier) as 'standard' | 'expert';

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
            {showResolved ? 'Hide' : 'Show'} resolved ({resolved.length})
          </button>
          {showResolved && (
            <div className="hbc-annotation-thread__resolved-list" role="list">
              {resolved.map((annotation) => (
                <AnnotationCard
                  key={annotation.annotationId}
                  annotation={annotation}
                  config={config}
                  canResolve={false}
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
