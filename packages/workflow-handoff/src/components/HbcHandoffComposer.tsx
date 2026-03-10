import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePrepareHandoff } from '../hooks/usePrepareHandoff';
import { HandoffApi } from '../api/HandoffApi';
import { handoffQueryKeys } from '../hooks/handoffQueryKeys';
import type {
  IHandoffConfig,
  IHandoffPackage,
  IHandoffContextNote,
  IBicOwner,
} from '../types/IWorkflowHandoff';
import { noteCategoryColorClass } from '../constants/handoffDefaults';
import type { HandoffNoteCategory } from '../types/IWorkflowHandoff';

// ─────────────────────────────────────────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────────────────────────────────────────

type ComposerStep = 'preflight' | 'review' | 'recipient' | 'send';
const STEP_ORDER: ComposerStep[] = ['preflight', 'review', 'recipient', 'send'];
const STEP_LABELS: Record<ComposerStep, string> = {
  preflight: '1. Readiness Check',
  review: '2. Review Package',
  recipient: '3. Confirm Recipient',
  send: '4. Send',
};

function StepIndicator({ currentStep }: { currentStep: ComposerStep }) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  return (
    <nav className="hbc-handoff-composer__steps" aria-label="Handoff steps">
      {STEP_ORDER.map((step, i) => (
        <div
          key={step}
          className={[
            'hbc-handoff-composer__step',
            i < currentIndex ? 'hbc-handoff-composer__step--completed' : '',
            i === currentIndex ? 'hbc-handoff-composer__step--active' : '',
          ].join(' ')}
          aria-current={step === currentStep ? 'step' : undefined}
        >
          <span className="hbc-handoff-composer__step-number">
            {i < currentIndex ? '✓' : String(i + 1)}
          </span>
          <span className="hbc-handoff-composer__step-label">{STEP_LABELS[step]}</span>
        </div>
      ))}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Pre-flight check (D-03)
// ─────────────────────────────────────────────────────────────────────────────

function PreflightStep<TSource, TDest>({
  config,
  sourceRecord,
  currentUser,
  onPass,
}: {
  config: IHandoffConfig<TSource, TDest>;
  sourceRecord: TSource;
  currentUser: IBicOwner;
  onPass: () => void;
}) {
  const { preflight, isAssembling } = usePrepareHandoff(sourceRecord, config, currentUser, true);

  if (isAssembling) {
    return (
      <div className="hbc-handoff-step hbc-handoff-step--loading" aria-busy="true">
        <p>Checking readiness…</p>
      </div>
    );
  }

  return (
    <div className="hbc-handoff-step hbc-handoff-step--preflight">
      <h3 className="hbc-handoff-step__title">Readiness Check</h3>
      <p className="hbc-handoff-step__description">
        The following conditions must be met before this handoff can be sent.
      </p>

      <ul className="hbc-preflight-checks" aria-label="Pre-flight check results">
        {(preflight?.checks ?? []).map((check, i) => (
          <li
            key={i}
            className={`hbc-preflight-check ${check.passed ? 'hbc-preflight-check--pass' : 'hbc-preflight-check--fail'}`}
          >
            <span className="hbc-preflight-check__icon" aria-hidden="true">
              {check.passed ? '✓' : '✗'}
            </span>
            <span className="hbc-preflight-check__label">{check.label}</span>
            {check.detail && (
              <span className="hbc-preflight-check__detail">{check.detail}</span>
            )}
          </li>
        ))}
      </ul>

      <div className="hbc-handoff-step__actions">
        <button
          type="button"
          className="hbc-btn hbc-btn--primary"
          onClick={onPass}
          disabled={!preflight?.isReady}
          aria-disabled={!preflight?.isReady}
        >
          {preflight?.isReady ? 'Continue →' : 'Address issues to continue'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: Review package (D-04, D-06)
// ─────────────────────────────────────────────────────────────────────────────

function ReviewStep<TSource, TDest>({
  pkg,
  config,
  contextNotes,
  onContextNotesChange,
  onNext,
  onBack,
}: {
  pkg: NonNullable<ReturnType<typeof usePrepareHandoff<TSource, TDest>>['package']>;
  config: IHandoffConfig<TSource, TDest>;
  contextNotes: IHandoffContextNote[];
  onContextNotesChange: (notes: IHandoffContextNote[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [newNoteCategory, setNewNoteCategory] = useState<HandoffNoteCategory>('Key Decision');
  const [newNoteBody, setNewNoteBody] = useState('');

  const addNote = useCallback(() => {
    if (!newNoteBody.trim()) return;
    const note: IHandoffContextNote = {
      noteId: `note-${Date.now()}`,
      category: newNoteCategory,
      body: newNoteBody.trim(),
      author: pkg.sender,
      createdAt: new Date().toISOString(),
    };
    onContextNotesChange([...contextNotes, note]);
    setNewNoteBody('');
  }, [newNoteBody, newNoteCategory, contextNotes, onContextNotesChange, pkg.sender]);

  const removeNote = useCallback((noteId: string) => {
    onContextNotesChange(contextNotes.filter((n) => n.noteId !== noteId));
  }, [contextNotes, onContextNotesChange]);

  return (
    <div className="hbc-handoff-step hbc-handoff-step--review">
      <h3 className="hbc-handoff-step__title">Review Handoff Package</h3>
      <p className="hbc-handoff-step__description">
        Review the data and documents that will be sent to the recipient.
        Add any context notes the receiving team needs to know.
      </p>

      {/* Destination seed data preview (D-04: frozen snapshot) */}
      <section className="hbc-handoff-review__section">
        <h4 className="hbc-handoff-review__section-title">
          Data for {config.destinationRecordType}
        </h4>
        <div className="hbc-handoff-review__seed-data">
          {Object.entries(pkg.destinationSeedData as Record<string, unknown>)
            .filter(([, v]) => v !== null && v !== undefined && v !== '')
            .map(([key, value]) => (
              <div key={key} className="hbc-handoff-review__field">
                <span className="hbc-handoff-review__field-key">{key}</span>
                <span className="hbc-handoff-review__field-value">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))
          }
        </div>
      </section>

      {/* Document list (D-06) */}
      <section className="hbc-handoff-review__section">
        <h4 className="hbc-handoff-review__section-title">
          Documents ({pkg.documents.length})
        </h4>
        {pkg.documents.length === 0 ? (
          <p className="hbc-handoff-review__empty">No documents attached.</p>
        ) : (
          <ul className="hbc-handoff-review__document-list">
            {pkg.documents.map((doc) => (
              <li key={doc.documentId} className="hbc-handoff-review__document">
                <span className="hbc-handoff-review__document-category">{doc.category}</span>
                <a
                  href={doc.sharepointUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hbc-handoff-review__document-link"
                >
                  {doc.fileName}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Context notes — editable */}
      <section className="hbc-handoff-review__section">
        <h4 className="hbc-handoff-review__section-title">Context Notes</h4>
        {contextNotes.length > 0 && (
          <ul className="hbc-handoff-review__note-list">
            {contextNotes.map((note) => (
              <li
                key={note.noteId}
                className={`hbc-handoff-note hbc-handoff-note--${noteCategoryColorClass[note.category]}`}
              >
                <span className="hbc-handoff-note__category">{note.category}</span>
                <p className="hbc-handoff-note__body">{note.body}</p>
                <button
                  type="button"
                  className="hbc-handoff-note__remove"
                  onClick={() => removeNote(note.noteId)}
                  aria-label={`Remove note: ${note.body}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="hbc-handoff-note-form">
          <select
            value={newNoteCategory}
            onChange={(e) => setNewNoteCategory(e.target.value as HandoffNoteCategory)}
            className="hbc-handoff-note-form__category"
            aria-label="Note category"
          >
            <option value="Key Decision">Key Decision</option>
            <option value="Open Item">Open Item</option>
            <option value="Risk">Risk</option>
            <option value="General">General</option>
          </select>
          <textarea
            value={newNoteBody}
            onChange={(e) => setNewNoteBody(e.target.value)}
            placeholder="Add a context note for the receiving team…"
            rows={2}
            className="hbc-handoff-note-form__textarea"
            aria-label="Note text"
          />
          <button
            type="button"
            className="hbc-btn hbc-btn--secondary hbc-btn--sm"
            onClick={addNote}
            disabled={!newNoteBody.trim()}
          >
            Add Note
          </button>
        </div>
      </section>

      <div className="hbc-handoff-step__actions">
        <button type="button" className="hbc-btn hbc-btn--ghost" onClick={onBack}>← Back</button>
        <button type="button" className="hbc-btn hbc-btn--primary" onClick={onNext}>
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3: Confirm recipient (D-05)
// ─────────────────────────────────────────────────────────────────────────────

function RecipientStep({
  recipient,
  resolvedRecipientIsNull,
  onRecipientOverride: _onRecipientOverride,
  onNext,
  onBack,
}: {
  recipient: IBicOwner;
  resolvedRecipientIsNull: boolean;
  onRecipientOverride: (recipient: IBicOwner) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="hbc-handoff-step hbc-handoff-step--recipient">
      <h3 className="hbc-handoff-step__title">Confirm Recipient</h3>

      {resolvedRecipientIsNull && (
        <p className="hbc-handoff-step__warning">
          The handoff route could not automatically determine the recipient.
          Please select a recipient below.
        </p>
      )}

      <div className="hbc-handoff-recipient-card">
        <div className="hbc-handoff-recipient-card__info">
          <strong>{recipient.displayName}</strong>
          <span className="hbc-handoff-recipient-card__role">{recipient.role}</span>
        </div>
        {/* In a real implementation: recipient picker if resolvedRecipientIsNull */}
        {resolvedRecipientIsNull && (
          <p className="hbc-handoff-recipient-card__override-note">
            Use the picker to select the correct recipient for this handoff.
            {/* Recipient picker component would be inserted here */}
          </p>
        )}
      </div>

      <div className="hbc-handoff-step__actions">
        <button type="button" className="hbc-btn hbc-btn--ghost" onClick={onBack}>← Back</button>
        <button
          type="button"
          className="hbc-btn hbc-btn--primary"
          onClick={onNext}
          disabled={!recipient.userId}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4: Send confirmation (D-05)
// ─────────────────────────────────────────────────────────────────────────────

function SendStep({
  isSending,
  routeLabel,
  acknowledgeDescription,
  onSend,
  onBack,
}: {
  isSending: boolean;
  routeLabel: string;
  acknowledgeDescription: string;
  onSend: () => void;
  onBack: () => void;
}) {
  return (
    <div className="hbc-handoff-step hbc-handoff-step--send">
      <h3 className="hbc-handoff-step__title">Send Handoff Package</h3>

      <div className="hbc-handoff-send-confirm">
        <p className="hbc-handoff-send-confirm__route">{routeLabel}</p>
        <p className="hbc-handoff-send-confirm__description">{acknowledgeDescription}</p>
        <p className="hbc-handoff-send-confirm__bic-note">
          After sending, BIC ownership transfers to the recipient until they acknowledge or reject.
        </p>
      </div>

      <div className="hbc-handoff-step__actions">
        <button type="button" className="hbc-btn hbc-btn--ghost" onClick={onBack} disabled={isSending}>
          ← Back
        </button>
        <button
          type="button"
          className="hbc-btn hbc-btn--primary hbc-btn--danger-confirm"
          onClick={onSend}
          disabled={isSending}
        >
          {isSending ? 'Sending…' : 'Send Handoff Package'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HbcHandoffComposer — main export
// ─────────────────────────────────────────────────────────────────────────────

export interface HbcHandoffComposerProps<TSource, TDest> {
  sourceRecord: TSource;
  config: IHandoffConfig<TSource, TDest>;
  currentUser: IBicOwner;
  onHandoffSent?: (pkg: IHandoffPackage<TSource, TDest>) => void;
  onCancel?: () => void;
}

export function HbcHandoffComposer<TSource, TDest>({
  sourceRecord,
  config,
  currentUser,
  onHandoffSent,
  onCancel,
}: HbcHandoffComposerProps<TSource, TDest>) {
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState<ComposerStep>('preflight');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [contextNotes, setContextNotes] = useState<IHandoffContextNote[]>([]);
  const [recipientOverride, setRecipientOverride] = useState<IBicOwner | null>(null);

  const { package: preparedPackage } = usePrepareHandoff(
    sourceRecord,
    config,
    currentUser,
    true
  );

  const resolvedRecipient = recipientOverride ??
    preparedPackage?.recipient ??
    config.resolveRecipient(sourceRecord) ??
    currentUser;

  const resolvedRecipientIsNull = config.resolveRecipient(sourceRecord) === null;

  const goToStep = (step: ComposerStep) => setCurrentStep(step);

  // ── Send handler ────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    if (!preparedPackage) return;

    setIsSending(true);
    setSendError(null);

    try {
      // Step 1: Create draft package in storage
      const draft = await HandoffApi.create<TSource, TDest>({
        ...preparedPackage,
        contextNotes,
        recipient: resolvedRecipient,
      });

      // Step 2: Transmit (draft → sent); notification fired by Azure Function (D-05)
      const sent = await HandoffApi.send<TSource, TDest>(draft.handoffId);

      // Invalidate inbox/outbox queries
      queryClient.invalidateQueries({ queryKey: handoffQueryKeys.inbox() });
      queryClient.invalidateQueries({ queryKey: handoffQueryKeys.outbox() });

      onHandoffSent?.(sent);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'An error occurred while sending.');
    } finally {
      setIsSending(false);
    }
  }, [preparedPackage, contextNotes, resolvedRecipient, queryClient, onHandoffSent]);

  return (
    <div
      className="hbc-handoff-composer"
      role="dialog"
      aria-label={`Handoff Composer: ${config.routeLabel}`}
      aria-modal="true"
    >
      {/* Header */}
      <header className="hbc-handoff-composer__header">
        <h2 className="hbc-handoff-composer__title">{config.routeLabel}</h2>
        {onCancel && (
          <button
            type="button"
            className="hbc-handoff-composer__close"
            onClick={onCancel}
            aria-label="Cancel handoff"
          >
            ✕
          </button>
        )}
      </header>

      {/* Step indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Error banner */}
      {sendError && (
        <div className="hbc-handoff-composer__error" role="alert">
          {sendError}
        </div>
      )}

      {/* Step panels */}
      <div className="hbc-handoff-composer__body">
        {currentStep === 'preflight' && (
          <PreflightStep
            config={config}
            sourceRecord={sourceRecord}
            currentUser={currentUser}
            onPass={() => goToStep('review')}
          />
        )}

        {currentStep === 'review' && preparedPackage && (
          <ReviewStep
            pkg={preparedPackage}
            config={config}
            contextNotes={contextNotes}
            onContextNotesChange={setContextNotes}
            onNext={() => goToStep('recipient')}
            onBack={() => goToStep('preflight')}
          />
        )}

        {currentStep === 'recipient' && (
          <RecipientStep
            recipient={resolvedRecipient}
            resolvedRecipientIsNull={resolvedRecipientIsNull}
            onRecipientOverride={setRecipientOverride}
            onNext={() => goToStep('send')}
            onBack={() => goToStep('review')}
          />
        )}

        {currentStep === 'send' && (
          <SendStep
            isSending={isSending}
            routeLabel={config.routeLabel}
            acknowledgeDescription={config.acknowledgeDescription}
            onSend={handleSend}
            onBack={() => goToStep('recipient')}
          />
        )}
      </div>
    </div>
  );
}
