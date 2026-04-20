/**
 * HomepageErrorState — webpart-layer failure chrome.
 *
 * Distinct from `HomepageEmptyState` (neutral "nothing authored yet")
 * so homepage users and page authors can tell a data-fetch / runtime
 * failure apart from an authoring gap. Reuses `HbcEmptyState` for
 * title/description rendering (same typographic register as the
 * empty state) inside an error-accented container so the difference
 * reads visually — a soft red wash + red left rail — without
 * requiring the theme-scoped banner primitive.
 *
 * Kept at the webpart consumer layer: data-fetch awareness never
 * pushes down into the shared ui-kit presentation surface.
 */
import * as React from 'react';
import { AlertTriangle, HbcEmptyState } from '@hbc/ui-kit/homepage';
import { hpErrorStateContainer, hpErrorStateDetail } from '../tokens.js';

export interface HomepageErrorStateProps {
  title: string;
  description: string;
  /**
   * Optional short technical detail (e.g. error message from the data
   * hook). Rendered below the description in a subdued register so
   * operators have a breadcrumb without dominating the user-facing
   * message. Never surface raw stack traces here.
   */
  detail?: string;
}

export function HomepageErrorState({
  title,
  description,
  detail,
}: HomepageErrorStateProps): React.JSX.Element {
  return (
    <div
      data-hbc-homepage="error-state"
      role="alert"
      aria-live="assertive"
      style={hpErrorStateContainer}
    >
      <HbcEmptyState
        title={title}
        description={description}
        icon={<AlertTriangle size={28} strokeWidth={2} color="#DC2626" aria-hidden="true" />}
      />
      {detail ? <div style={hpErrorStateDetail}>{detail}</div> : null}
    </div>
  );
}
