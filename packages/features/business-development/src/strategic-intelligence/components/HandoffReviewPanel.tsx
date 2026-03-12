import type { IHandoffReviewParticipant } from '@hbc/strategic-intelligence';

export interface HandoffReviewPanelProps {
  title: string;
  participants: IHandoffReviewParticipant[];
}

export const HandoffReviewPanel = ({ title, participants }: HandoffReviewPanelProps) => (
  <section data-testid="handoff-review-panel">
    <h3>{title}</h3>
    <p>Participants: {participants.length}</p>
  </section>
);
