import type { IBicOwner } from '@hbc/bic-next-move';
import type {
  IBenchmarkExplainability,
  IScoreBenchmarkStateResult,
} from '@hbc/score-benchmark';

export interface IBdBicOwnershipAction {
  criterionId: string;
  owner: IBicOwner | null;
  actionLabel: string;
  reasonCode: string | null;
}

export const projectScoreBenchmarkToBicActions = (
  state: IScoreBenchmarkStateResult,
  explainability: readonly IBenchmarkExplainability[]
): IBdBicOwnershipAction[] => {
  const reasonByCriterion = new Map(
    explainability.map((item) => [item.criterionId, item.reasonCodes[0] ?? null])
  );

  return state.bicOwnershipProjections.map((projection) => ({
    criterionId: projection.criterionId,
    owner: projection.owner,
    actionLabel: projection.owner
      ? `Coordinate next move with ${projection.owner.displayName}`
      : 'Assign owner for next move',
    reasonCode: reasonByCriterion.get(projection.criterionId) ?? null,
  }));
};
