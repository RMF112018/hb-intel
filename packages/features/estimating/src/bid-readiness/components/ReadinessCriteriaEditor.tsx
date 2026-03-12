/**
 * SF18-T06 readiness criteria editor.
 *
 * @design D-SF18-T06
 */
import type { IEstimatingBidReadinessProfile } from '../../types/index.js';

export interface ReadinessCriteriaEditorProps {
  readonly profile: IEstimatingBidReadinessProfile;
  readonly onWeightChange: (criterionId: string, weight: number) => void;
  readonly onBlockerChange: (criterionId: string, isBlocker: boolean) => void;
}

export function ReadinessCriteriaEditor({
  profile,
  onWeightChange,
  onBlockerChange,
}: ReadinessCriteriaEditorProps): JSX.Element {
  return (
    <section data-testid="readiness-criteria-editor">
      <h3>Readiness Criteria</h3>
      {profile.criteria.map((criterion) => (
        <div key={criterion.criterionId} data-testid={`criteria-editor-${criterion.criterionId}`}>
          <p>{criterion.label}</p>
          <label>
            Weight
            <input
              type="number"
              value={criterion.weight}
              onChange={(event) => onWeightChange(criterion.criterionId, Number(event.currentTarget.value))}
            />
          </label>
          <label>
            Blocker
            <input
              type="checkbox"
              checked={criterion.isBlocker}
              onChange={(event) => onBlockerChange(criterion.criterionId, event.currentTarget.checked)}
            />
          </label>
        </div>
      ))}
    </section>
  );
}
