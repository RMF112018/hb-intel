import type {
  IBenchmarkFilterContext,
  IScoreBenchmarkReviewerContext,
} from '../types/index.js';

export const createScoreBenchmarkStateQueryKey = (
  entityId: string,
  filterContext: IBenchmarkFilterContext,
  reviewerContext: IScoreBenchmarkReviewerContext
): readonly ['score-benchmark', string, IBenchmarkFilterContext, IScoreBenchmarkReviewerContext] =>
  ['score-benchmark', entityId, filterContext, reviewerContext];

export const createScoreBenchmarkFiltersQueryKey = (
  entityId: string
): readonly ['score-benchmark', 'filters', string] => ['score-benchmark', 'filters', entityId];
