/**
 * Wave 99 / Prompt 06B — Ask HBI grounded-preview panel.
 *
 * NON-ROUTED COMPONENT. Composes the Prompt 06A unified-search hook
 * seam (`useUnifiedSearchReadModel`) with the Prompt 04A presentational
 * `UnifiedProjectSearchPreview`. The panel renders project-scoped,
 * fixture-backed, preview-only "grounded" answers driven by predefined
 * sample-query buttons.
 *
 * The panel does NOT register a routed surface — it never emits
 * `data-pcc-surface-id`, `data-pcc-active-surface-panel`, or
 * `data-pcc-surface-active`. Project Home / Readiness / shell / mount
 * integration is Prompt 06C scope; live LLM/vector/search/Microsoft
 * Graph/Procore/Sage/CRM/Adobe wiring is Prompt 06D scope.
 *
 * Query input: submit-driven sample-query buttons only. Free-text
 * input is intentionally deferred per the Prompt 06B governing
 * directive. Selecting a sample query updates internal state, which
 * the 06A hook seam consumes and refetches once per trimmed query.
 *
 * Defensive grounding posture: any answer with `kind: 'grounded'` and
 * an empty `citations` array is filtered out before rendering, so no
 * answer text is ever shown without source/citation metadata. Refusal
 * answers are preserved (they intentionally carry no citations).
 *
 * Disclaimers ("HBI is not the source of truth" / "project-scoped
 * grounded preview") live on this panel — the underlying preview
 * component is purely presentational and carries no product copy.
 */

import { useState, type FC } from 'react';
import type { PccPersona, PccProjectId } from '@hbc/models/pcc';
import { PccPreviewState } from '../../../ui/PccPreviewState';
import {
  useUnifiedSearchReadModel,
  type IPccUnifiedSearchReadModelClient,
} from '../index.js';
import type { IPccUnifiedSearchViewModel } from '../unifiedLifecycleViewModel.js';
import { UnifiedProjectSearchPreview } from './UnifiedProjectSearchPreview.js';
import styles from './AskHbiGroundingPreviewPanel.module.css';

export const ASK_HBI_SAMPLE_QUERIES = [
  'What did estimating assume for this scope?',
  'Who installed this product?',
  'Which submittal approved this material?',
  'Was this warranty issue tied to a subcontractor scope?',
  'Have we done this detail before?',
] as const;

export const ASK_HBI_PANEL_TITLE = 'Ask HBI — project-scoped grounded preview';
export const ASK_HBI_PANEL_DISCLAIMER =
  'HBI is not the source of truth. Answers are grounded in this project’s fixture data and shown as a preview only.';
export const ASK_HBI_IDLE_TITLE = 'Select a sample question to see a grounded preview.';
export const ASK_HBI_IDLE_DESCRIPTION =
  'Each sample question is project-scoped and answered from this project’s fixture data only.';

export interface IAskHbiGroundingPreviewPanelProps {
  readonly client: IPccUnifiedSearchReadModelClient;
  readonly projectId: PccProjectId;
  readonly viewerPersona?: PccPersona;
  /**
   * Initial sample query to preselect on mount.
   *
   * - Omit (or pass `undefined`) to default to the first
   *   `ASK_HBI_SAMPLE_QUERIES` entry.
   * - Pass `null` to start in `'idle'` posture (no preselection); the
   *   user must click a sample button to fire the hook seam.
   */
  readonly initialQuery?: string | null;
}

function withSafeGroundingPosture(
  vm: IPccUnifiedSearchViewModel,
): IPccUnifiedSearchViewModel {
  return {
    ...vm,
    answers: vm.answers.filter(
      (a) => a.kind === 'refusal' || a.citations.length > 0,
    ),
  };
}

export const AskHbiGroundingPreviewPanel: FC<IAskHbiGroundingPreviewPanelProps> = ({
  client,
  projectId,
  viewerPersona,
  initialQuery,
}) => {
  const [selectedQuery, setSelectedQuery] = useState<string | undefined>(() =>
    initialQuery === null ? undefined : (initialQuery ?? ASK_HBI_SAMPLE_QUERIES[0]),
  );
  const state = useUnifiedSearchReadModel(
    client,
    projectId,
    viewerPersona,
    selectedQuery,
  );

  return (
    <section
      className={styles.root}
      data-pcc-ask-hbi-panel=""
      data-pcc-ask-hbi-panel-state={state.status}
    >
      <header className={styles.header}>
        <h3 className={styles.title}>{ASK_HBI_PANEL_TITLE}</h3>
        <p className={styles.disclaimer} data-pcc-ask-hbi-disclaimer="">
          {ASK_HBI_PANEL_DISCLAIMER}
        </p>
      </header>
      <ul
        className={styles.queries}
        aria-label="Sample questions"
        data-pcc-ask-hbi-sample-queries=""
      >
        {ASK_HBI_SAMPLE_QUERIES.map((q) => {
          const active = q === selectedQuery;
          return (
            <li key={q} className={styles.queryItem}>
              <button
                type="button"
                className={active ? styles.queryButtonActive : styles.queryButton}
                data-pcc-ask-hbi-sample-query={q}
                data-pcc-ask-hbi-sample-query-active={active ? 'true' : 'false'}
                aria-pressed={active}
                onClick={() => setSelectedQuery(q)}
              >
                {q}
              </button>
            </li>
          );
        })}
      </ul>
      <div className={styles.body} data-pcc-ask-hbi-panel-body="">
        {state.status === 'idle' ? (
          <PccPreviewState
            state="empty"
            title={ASK_HBI_IDLE_TITLE}
            description={ASK_HBI_IDLE_DESCRIPTION}
          />
        ) : null}
        {state.status === 'loading' ? <PccPreviewState state="loading" /> : null}
        {state.status === 'error' ? <PccPreviewState state="error" /> : null}
        {state.status === 'ready' ? (
          <UnifiedProjectSearchPreview
            viewModel={withSafeGroundingPosture(state.viewModel)}
          />
        ) : null}
      </div>
    </section>
  );
};

export default AskHbiGroundingPreviewPanel;
