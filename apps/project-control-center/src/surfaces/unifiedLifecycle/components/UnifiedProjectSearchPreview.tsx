/**
 * Unified Lifecycle preview seam — UnifiedProjectSearchPreview.
 *
 * Reusable, presentational, fixture-safe preview of unified search /
 * Ask-HBI grounded answers. Intentionally has NO query input — the
 * component receives a result view-model and renders citations for
 * grounded answers and a refusal reason for refusals. Active query
 * wiring is deferred to Prompt 05.
 *
 * Pure: no client, no hooks, no fetch, no router. Refusal rows MUST
 * NOT render any citation — asserted in tests.
 */

import { type FC } from 'react';
import { PccPreviewState } from '../../../ui/PccPreviewState';
import { PccStatusPill } from '../../../ui/PccStatusPill';
import type {
  IPccUnifiedSearchAnswerVm,
  IPccUnifiedSearchGroundedAnswerVm,
  IPccUnifiedSearchRefusalAnswerVm,
  IPccUnifiedSearchViewModel,
} from '../unifiedLifecycleViewModel.js';
import styles from './UnifiedProjectSearchPreview.module.css';

export interface IUnifiedProjectSearchPreviewProps {
  readonly viewModel: IPccUnifiedSearchViewModel;
}

export const UnifiedProjectSearchPreview: FC<IUnifiedProjectSearchPreviewProps> = ({
  viewModel,
}) => {
  if (viewModel.sourceStatus !== 'available') {
    return (
      <div data-pcc-unified-search="" className={styles.root}>
        <PccPreviewState state={viewModel.cardState} />
      </div>
    );
  }

  if (viewModel.answers.length === 0) {
    return (
      <div data-pcc-unified-search="" className={styles.root}>
        <PccPreviewState state="empty" />
      </div>
    );
  }

  return (
    <div data-pcc-unified-search="" className={styles.root}>
      <ul className={styles.answers}>
        {viewModel.answers.map((answer) => (
          <AnswerRow key={answer.answerId} answer={answer} />
        ))}
      </ul>
    </div>
  );
};

const AnswerRow: FC<{ answer: IPccUnifiedSearchAnswerVm }> = ({ answer }) => {
  if (answer.kind === 'grounded') {
    return <GroundedAnswerRow answer={answer} />;
  }
  return <RefusalAnswerRow answer={answer} />;
};

const GroundedAnswerRow: FC<{ answer: IPccUnifiedSearchGroundedAnswerVm }> = ({
  answer,
}) => (
  <li
    className={styles.row}
    data-pcc-unified-search-answer-id={answer.answerId}
    data-pcc-unified-search-answer-kind="grounded"
  >
    <div className={styles.rowHeader}>
      <PccStatusPill tone="success">Grounded</PccStatusPill>
      <span className={styles.query}>{answer.query}</span>
    </div>
    <p className={styles.response}>{answer.response}</p>
    {answer.citations.length > 0 ? (
      <ul className={styles.citations} aria-label="Citations">
        {answer.citations.map((citation) => (
          <li
            key={citation.citationId}
            className={styles.citation}
            data-pcc-unified-search-citation-id={citation.citationId}
          >
            <PccStatusPill tone="info">{citation.sourceLineage.sourceSystem}</PccStatusPill>
            <span className={styles.citationMeta}>
              {citation.recordType} · {citation.recordId}
            </span>
          </li>
        ))}
      </ul>
    ) : null}
  </li>
);

const RefusalAnswerRow: FC<{ answer: IPccUnifiedSearchRefusalAnswerVm }> = ({ answer }) => (
  <li
    className={styles.row}
    data-pcc-unified-search-answer-id={answer.answerId}
    data-pcc-unified-search-answer-kind="refusal"
  >
    <div className={styles.rowHeader}>
      <PccStatusPill tone="warning">No grounded evidence</PccStatusPill>
      <span className={styles.query}>{answer.query}</span>
    </div>
    <p className={styles.refusal}>{answer.refusalReason}</p>
  </li>
);

export default UnifiedProjectSearchPreview;
