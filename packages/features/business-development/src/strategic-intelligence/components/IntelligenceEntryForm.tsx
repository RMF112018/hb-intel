import React, { useMemo, useState } from 'react';
import type {
  IStrategicIntelligenceApprovalQueueItem,
  IStrategicIntelligenceEntry,
  ICommitmentRegisterItem,
  ProvenanceClass,
} from '@hbc/strategic-intelligence';
import { parseCsv } from './displayModel.js';

export interface IntelligenceEntryFormAiSuggestion {
  suggestionId: string;
  text: string;
  citations: string[];
}

export interface IntelligenceEntryFormDraft {
  type: string;
  title: string;
  body: string;
  metadata: IStrategicIntelligenceEntry['metadata'];
  supportingLinks: string[];
  relatedCommitmentIds: string[];
  aiApproved: boolean;
  aiCitationMetadata: string[];
  provenanceClass: ProvenanceClass;
}

export interface IntelligenceEntryFormProps {
  canContribute: boolean;
  actorUserId: string;
  defaultMetadata?: IStrategicIntelligenceEntry['metadata'];
  commitments: ICommitmentRegisterItem[];
  queue: IStrategicIntelligenceApprovalQueueItem[];
  onSubmit?: (draft: IntelligenceEntryFormDraft) => void;
  aiSuggestion?: IntelligenceEntryFormAiSuggestion;
}

const requiredMetadataFields: Array<keyof IStrategicIntelligenceEntry['metadata']> = [
  'client',
  'ownerOrganization',
  'projectType',
  'sector',
  'deliveryMethod',
  'geography',
  'lifecyclePhase',
  'riskCategory',
];

export const IntelligenceEntryForm = ({
  canContribute,
  actorUserId,
  defaultMetadata,
  commitments,
  queue,
  onSubmit,
  aiSuggestion,
}: IntelligenceEntryFormProps) => {
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [metadata, setMetadata] = useState<IStrategicIntelligenceEntry['metadata']>(
    defaultMetadata ?? {}
  );
  const [supportingLinksRaw, setSupportingLinksRaw] = useState('');
  const [relatedCommitmentIds, setRelatedCommitmentIds] = useState<string[]>([]);
  const [aiApproved, setAiApproved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const contributorQueueItems = useMemo(
    () => queue.filter((item) => item.submittedBy === actorUserId),
    [queue, actorUserId]
  );

  const latestContributorStatus = contributorQueueItems[0];

  if (!canContribute) {
    return (
      <section data-testid="intelligence-entry-form-unauthorized">
        <h3>Intelligence Entry Form</h3>
        <p>You do not have permission to submit strategic intelligence entries.</p>
      </section>
    );
  }

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!type.trim()) nextErrors.type = 'Type is required.';
    if (!title.trim()) nextErrors.title = 'Title is required.';
    if (!body.trim()) nextErrors.body = 'Body is required.';

    for (const field of requiredMetadataFields) {
      const value = metadata[field];
      if (typeof value !== 'string' || value.trim().length === 0) {
        nextErrors[field] = `${field} is required.`;
      }
    }

    if (aiSuggestion && !aiApproved && body.includes(aiSuggestion.text)) {
      nextErrors.aiApproval =
        'AI-assisted content requires explicit approval before submission.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return (
    <section aria-label="Intelligence entry form" data-testid="intelligence-entry-form">
      <h3>Intelligence Entry Form</h3>

      {latestContributorStatus ? (
        <section data-testid="intelligence-entry-status-strip">
          <p>Status: {latestContributorStatus.approvalStatus}</p>
          {latestContributorStatus.reviewNotes ? (
            <p>Review rationale: {latestContributorStatus.reviewNotes}</p>
          ) : null}
        </section>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!validate()) {
            return;
          }

          onSubmit?.({
            type,
            title,
            body,
            metadata,
            supportingLinks: parseCsv(supportingLinksRaw),
            relatedCommitmentIds,
            aiApproved,
            aiCitationMetadata: aiApproved ? aiSuggestion?.citations ?? [] : [],
            provenanceClass: aiApproved ? 'ai-assisted-draft' : 'meeting-summary',
          });
        }}
      >
        <label>
          Type
          <input
            value={type}
            onChange={(event) => setType(event.target.value)}
            aria-invalid={Boolean(errors.type)}
            aria-describedby={errors.type ? 'intelligence-entry-form-error-type' : undefined}
          />
        </label>
        {errors.type ? (
          <p id="intelligence-entry-form-error-type" role="alert">
            {errors.type}
          </p>
        ) : null}

        <label>
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'intelligence-entry-form-error-title' : undefined}
          />
        </label>
        {errors.title ? (
          <p id="intelligence-entry-form-error-title" role="alert">
            {errors.title}
          </p>
        ) : null}

        <label>
          Body
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            aria-invalid={Boolean(errors.body)}
            aria-describedby={errors.body ? 'intelligence-entry-form-error-body' : undefined}
          />
        </label>
        {errors.body ? (
          <p id="intelligence-entry-form-error-body" role="alert">
            {errors.body}
          </p>
        ) : null}

        <fieldset>
          <legend>Normalized metadata</legend>
          {requiredMetadataFields.map((field) => (
            <label key={field}>
              {field}
              <input
                value={metadata[field] ?? ''}
                onChange={(event) =>
                  setMetadata((current) => ({
                    ...current,
                    [field]: event.target.value,
                  }))
                }
                aria-invalid={Boolean(errors[field])}
                aria-describedby={
                  errors[field] ? `intelligence-entry-form-error-${field}` : undefined
                }
              />
              {errors[field] ? (
                <span id={`intelligence-entry-form-error-${field}`} role="alert">
                  {errors[field]}
                </span>
              ) : null}
            </label>
          ))}
        </fieldset>

        <label>
          Supporting links (comma-separated)
          <input
            value={supportingLinksRaw}
            onChange={(event) => setSupportingLinksRaw(event.target.value)}
          />
        </label>

        <label>
          Related commitments
          <select
            multiple
            aria-label="Related commitments"
            value={relatedCommitmentIds}
            onChange={(event) => {
              const next = [...event.target.selectedOptions].map((option) => option.value);
              setRelatedCommitmentIds(next);
            }}
          >
            {commitments.map((commitment) => (
              <option key={commitment.commitmentId} value={commitment.commitmentId}>
                {commitment.description}
              </option>
            ))}
          </select>
        </label>

        {aiSuggestion ? (
          <section data-testid="intelligence-entry-ai-suggestion">
            <h4>Inline AI Suggestion</h4>
            <p>{aiSuggestion.text}</p>
            <p>Citations: {aiSuggestion.citations.join(', ')}</p>
            <button
              type="button"
              onClick={() => setBody((current) => `${current}${current ? '\n\n' : ''}${aiSuggestion.text}`)}
              aria-label="Insert AI suggestion"
            >
              Insert suggestion
            </button>
            <label>
              <input
                type="checkbox"
                checked={aiApproved}
                onChange={(event) => setAiApproved(event.target.checked)}
              />
              I explicitly approve AI-assisted content for persistence.
            </label>
            {errors.aiApproval ? <p role="alert">{errors.aiApproval}</p> : null}
          </section>
        ) : null}

        <button type="submit" aria-label="Submit intelligence entry">
          Submit for approval
        </button>
      </form>
    </section>
  );
};
