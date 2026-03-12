/**
 * SF18-T06 scoring threshold editor.
 *
 * @design D-SF18-T06
 */
import type { IEstimatingBidReadinessProfile } from '../../types/index.js';

export interface ScoringWeightEditorProps {
  readonly profile: IEstimatingBidReadinessProfile;
  readonly onThresholdChange: (name: 'readyMinScore' | 'nearlyReadyMinScore' | 'attentionNeededMinScore', value: number) => void;
}

export function ScoringWeightEditor({
  profile,
  onThresholdChange,
}: ScoringWeightEditorProps): JSX.Element {
  return (
    <section data-testid="scoring-weight-editor">
      <h3>Scoring Thresholds</h3>
      <label>
        Ready Minimum
        <input
          type="number"
          value={profile.thresholds.readyMinScore}
          onChange={(event) => onThresholdChange('readyMinScore', Number(event.currentTarget.value))}
        />
      </label>
      <label>
        Nearly Ready Minimum
        <input
          type="number"
          value={profile.thresholds.nearlyReadyMinScore}
          onChange={(event) => onThresholdChange('nearlyReadyMinScore', Number(event.currentTarget.value))}
        />
      </label>
      <label>
        Attention Needed Minimum
        <input
          type="number"
          value={profile.thresholds.attentionNeededMinScore}
          onChange={(event) => onThresholdChange('attentionNeededMinScore', Number(event.currentTarget.value))}
        />
      </label>
    </section>
  );
}
