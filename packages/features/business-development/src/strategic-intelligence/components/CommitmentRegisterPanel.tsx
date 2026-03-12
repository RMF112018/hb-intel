import type { ICommitmentRegisterItem } from '@hbc/strategic-intelligence';

export interface CommitmentRegisterPanelProps {
  commitments: ICommitmentRegisterItem[];
}

export const CommitmentRegisterPanel = ({ commitments }: CommitmentRegisterPanelProps) => (
  <section data-testid="commitment-register-panel">
    <h3>Commitment Register</h3>
    <p>Items: {commitments.length}</p>
  </section>
);
