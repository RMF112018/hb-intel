import type {
  IScoreBenchmarkPanelContext,
  ScoreBenchmarkPanelId,
} from '../types/index.js';

const PANEL_PARAM = 'sbPanel';
const PURSUIT_PARAM = 'sbPursuitId';
const CRITERION_PARAM = 'sbCriterionId';

const isPanelId = (value: string): value is ScoreBenchmarkPanelId =>
  value === 'similar-pursuits' || value === 'explainability' || value === 'reviewer-consensus';

const cloneSearch = (search: string): URLSearchParams =>
  new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);

export const parseScoreBenchmarkPanelContext = (search: string): IScoreBenchmarkPanelContext => {
  const params = cloneSearch(search);
  const panel = params.get(PANEL_PARAM);

  if (!panel || !isPanelId(panel)) {
    return { panel: null };
  }

  const pursuitId = params.get(PURSUIT_PARAM);
  const criterionId = params.get(CRITERION_PARAM);

  return {
    panel,
    pursuitId: pursuitId ?? undefined,
    criterionId: criterionId ?? undefined,
  };
};

export const serializeScoreBenchmarkPanelContext = (
  search: string,
  context: IScoreBenchmarkPanelContext
): string => {
  const params = cloneSearch(search);

  if (!context.panel) {
    params.delete(PANEL_PARAM);
    params.delete(PURSUIT_PARAM);
    params.delete(CRITERION_PARAM);
    const serialized = params.toString();
    return serialized.length > 0 ? `?${serialized}` : '';
  }

  params.set(PANEL_PARAM, context.panel);

  if (context.pursuitId) {
    params.set(PURSUIT_PARAM, context.pursuitId);
  } else {
    params.delete(PURSUIT_PARAM);
  }

  if (context.criterionId) {
    params.set(CRITERION_PARAM, context.criterionId);
  } else {
    params.delete(CRITERION_PARAM);
  }

  return `?${params.toString()}`;
};
