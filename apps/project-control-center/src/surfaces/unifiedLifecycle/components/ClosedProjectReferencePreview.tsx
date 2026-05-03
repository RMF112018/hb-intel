/**
 * Unified Lifecycle preview seam — ClosedProjectReferencePreview.
 *
 * Reusable, presentational, fixture-safe preview of closed-project
 * knowledge references and future-pursuit references derived from the
 * cross-project knowledge view model. Card BODY content only.
 *
 * Pure: no client, no hooks, no fetch, no router. Withheld references
 * are omitted entirely. Masked references render only non-sensitive
 * fields plus a Restricted pill — never the underlying summary.
 */

import { type FC } from 'react';
import { PccPreviewState } from '../../../ui/PccPreviewState';
import { PccStatusPill, type PccStatusPillTone } from '../../../ui/PccStatusPill';
import type {
  IPccCrossProjectKnowledgeViewModel,
  IPccKnowledgeReferenceVm,
} from '../unifiedLifecycleViewModel.js';
import styles from './ClosedProjectReferencePreview.module.css';

function classificationTone(classification: string): PccStatusPillTone {
  if (classification === 'restricted' || classification === 'sensitive') return 'warning';
  if (classification === 'public') return 'success';
  return 'neutral';
}

export interface IClosedProjectReferencePreviewProps {
  readonly viewModel: IPccCrossProjectKnowledgeViewModel;
}

export const ClosedProjectReferencePreview: FC<IClosedProjectReferencePreviewProps> = ({
  viewModel,
}) => {
  if (viewModel.sourceStatus !== 'available') {
    return (
      <div data-pcc-closed-project-reference="" className={styles.root}>
        <PccPreviewState state={viewModel.cardState} />
      </div>
    );
  }

  const visibleReferences = viewModel.closedProjectReferences.references.filter(
    (r) => !r.redaction.withheld,
  );
  const visibleFuture = viewModel.closedProjectReferences.futurePursuitReferences.filter(
    (r) => !r.redaction.withheld,
  );

  if (visibleReferences.length === 0 && visibleFuture.length === 0) {
    return (
      <div data-pcc-closed-project-reference="" className={styles.root}>
        <PccPreviewState state="empty" />
      </div>
    );
  }

  return (
    <div data-pcc-closed-project-reference="" className={styles.root}>
      {visibleReferences.length > 0 ? (
        <section className={styles.section} data-pcc-closed-project-references="">
          <p className={styles.sectionTitle}>Closed-project references</p>
          <ul className={styles.references}>
            {visibleReferences.map((reference) => (
              <ReferenceRow key={reference.knowledgeId} reference={reference} />
            ))}
          </ul>
        </section>
      ) : null}
      {visibleFuture.length > 0 ? (
        <section className={styles.section} data-pcc-future-pursuit-references="">
          <p className={styles.sectionTitle}>Future pursuit references</p>
          <ul className={styles.references}>
            {visibleFuture.map((reference) => (
              <ReferenceRow key={reference.knowledgeId} reference={reference} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
};

const ReferenceRow: FC<{ reference: IPccKnowledgeReferenceVm }> = ({ reference }) => {
  const masked = reference.redaction.redacted && !reference.redaction.withheld;
  return (
    <li
      className={styles.row}
      data-pcc-cross-project-reference-id={reference.knowledgeId}
    >
      <div className={styles.rowHeader}>
        <PccStatusPill tone={classificationTone(reference.redaction.classification)}>
          {reference.redaction.classification}
        </PccStatusPill>
        <span className={styles.referenceType}>{reference.referenceType}</span>
        {masked ? <PccStatusPill tone="warning">Restricted</PccStatusPill> : null}
        <PccStatusPill tone="neutral">
          {reference.relatedCrossProjectReferences.length} cross-project
        </PccStatusPill>
      </div>
      <p className={styles.title}>
        {masked ? 'Restricted reference — title withheld.' : reference.title}
      </p>
      {!masked ? (
        <p className={styles.summary}>{reference.summary}</p>
      ) : null}
      {!masked && reference.tags.length > 0 ? (
        <ul className={styles.tagRow}>
          {reference.tags.map((tag) => (
            <li key={tag} className={styles.tag}>
              <PccStatusPill tone="info">{tag}</PccStatusPill>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
};

export default ClosedProjectReferencePreview;
