import type { ReactNode } from 'react';
import { HbcTypography } from '@hbc/ui-kit';
import type { SafetyTriageCategory } from '../pages/reviewQueueTriage.js';

/**
 * SafetyTriageGroup — Phase-04 audit G-05 Review queue triage framing.
 *
 * Category-group section rendered on the Review page. Provides an authored
 * heading, rationale, and count for one triage category (e.g. "Duplicates
 * suspected"), with its entries rendered as children. Empty categories are
 * not rendered by the caller (bucketEntries omits them).
 *
 * Local to Safety — not promoted to @hbc/ui-kit.
 */

export interface SafetyTriageGroupProps {
  readonly category: SafetyTriageCategory;
  readonly children?: ReactNode;
}

export function SafetyTriageGroup({
  category,
  children,
}: SafetyTriageGroupProps): ReactNode {
  const count = category.entries.length;
  return (
    <section
      className="safety-triage-group"
      data-safety-ui="triage-group"
      data-category-id={category.id}
      aria-labelledby={`safety-triage-group-${category.id}`}
    >
      <header className="safety-triage-group__header">
        <HbcTypography intent="heading3" as="h3">
          <span id={`safety-triage-group-${category.id}`}>{category.title}</span>
        </HbcTypography>
        <HbcTypography intent="bodySmall">
          {count} {count === 1 ? 'entry' : 'entries'} · {category.rationale}
        </HbcTypography>
      </header>
      <div className="safety-triage-group__entries">{children}</div>
    </section>
  );
}
