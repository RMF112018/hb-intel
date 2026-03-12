import type { ICommitmentRegisterItem } from '@hbc/strategic-intelligence';
import {
  getComplexityFlags,
  type StrategicIntelligenceComplexityMode,
} from './displayModel.js';

export interface CommitmentRegisterPanelProps {
  commitments: ICommitmentRegisterItem[];
  complexity?: StrategicIntelligenceComplexityMode;
  onUpdateFulfillmentStatus?: (
    commitmentId: string,
    status: ICommitmentRegisterItem['fulfillmentStatus']
  ) => void;
}

const isAtRisk = (commitment: ICommitmentRegisterItem): boolean =>
  commitment.fulfillmentStatus !== 'fulfilled' && commitment.fulfillmentStatus !== 'not-applicable';

export const CommitmentRegisterPanel = ({
  commitments,
  complexity = 'Standard',
  onUpdateFulfillmentStatus,
}: CommitmentRegisterPanelProps) => {
  const flags = getComplexityFlags(complexity);
  const unresolvedCount = commitments.filter(isAtRisk).length;

  if (flags.isEssential) {
    return (
      <section data-testid="commitment-register-panel" aria-label="Commitment register panel">
        <h3>Commitment Register</h3>
        <p>Commitments: {commitments.length}</p>
        <p>At risk: {unresolvedCount}</p>
      </section>
    );
  }

  return (
    <section data-testid="commitment-register-panel" aria-label="Commitment register panel">
      <h3>Commitment Register</h3>
      <p>Unresolved commitments: {unresolvedCount}</p>
      <ul>
        {commitments.map((commitment) => {
          const atRisk = isAtRisk(commitment);
          return (
            <li key={commitment.commitmentId} data-testid={`commitment-${commitment.commitmentId}`}>
              <p>{commitment.description}</p>
              <p>Source: {commitment.source}</p>
              <p>Responsible role: {commitment.responsibleRole}</p>
              <p>
                Status: {commitment.fulfillmentStatus}
                {atRisk ? ' (at risk)' : ''}
              </p>
              {commitment.bicRecordId ? (
                <p data-testid={`commitment-bic-${commitment.commitmentId}`}>
                  BIC linkage: {commitment.bicRecordId}
                </p>
              ) : null}
              {flags.isExpert ? (
                <label>
                  Update status
                  <select
                    aria-label={`Update fulfillment status for ${commitment.commitmentId}`}
                    value={commitment.fulfillmentStatus}
                    onChange={(event) =>
                      onUpdateFulfillmentStatus?.(
                        commitment.commitmentId,
                        event.target.value as ICommitmentRegisterItem['fulfillmentStatus']
                      )
                    }
                  >
                    <option value="open">open</option>
                    <option value="in-progress">in-progress</option>
                    <option value="fulfilled">fulfilled</option>
                    <option value="not-applicable">not-applicable</option>
                  </select>
                </label>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
