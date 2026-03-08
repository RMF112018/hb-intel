/**
 * Collapsible "Documents" section for embedding inside any record webpart.
 * Lazy-loads @hbc/sharepoint-docs on first panel open.
 *
 * Gap 1 fix: uses <details>/<summary> instead of missing HbcCollapsibleSection.
 * Gap 2 fix: uses simple div fallback instead of missing HbcSkeleton.
 *
 * @see docs/architecture/plans/shared-features/SF01-T07-SPFx-Integration.md §3
 * @decision D-09 — inline default with lazy loading
 */
import React, { lazy, Suspense, type FC } from 'react';
import type { IDocumentContextConfig } from '../../types/IDocumentContext.js';

const HbcDocumentAttachment = lazy(() =>
  import(/* webpackChunkName: "hbc-sharepoint-docs" */ '../../components/HbcDocumentAttachment/index.js').then(
    (m) => ({ default: m.HbcDocumentAttachment }),
  ),
);

export interface DocumentsPanelSectionProps {
  contextConfig: IDocumentContextConfig;
  /** Whether the record's workflow step allows document attachment. */
  canAttach: boolean;
  /** Complexity mode from @hbc/complexity context. */
  complexityMode?: 'essential' | 'standard' | 'expert';
}

export const DocumentsPanelSection: FC<DocumentsPanelSectionProps> = ({
  contextConfig,
  canAttach,
  complexityMode = 'standard',
}) => (
  <details className="hbc-documents-panel-section">
    <summary>Documents</summary>
    <Suspense
      fallback={
        <div className="hbc-skeleton" aria-busy="true">
          Loading documents&hellip;
        </div>
      }
    >
      <HbcDocumentAttachment
        contextConfig={contextConfig}
        disabled={!canAttach}
        complexityMode={complexityMode}
      />
    </Suspense>
  </details>
);
