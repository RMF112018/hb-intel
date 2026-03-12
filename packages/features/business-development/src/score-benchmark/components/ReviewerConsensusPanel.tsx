export interface ReviewerConsensusPanelProps {
  consensusLabel: string;
  disagreementCount: number;
}

export interface ReviewerConsensusPanelModel {
  panel: 'reviewer-consensus';
  consensusLabel: string;
  disagreementCount: number;
}

export const ReviewerConsensusPanel = (
  props: ReviewerConsensusPanelProps
): ReviewerConsensusPanelModel => ({
  panel: 'reviewer-consensus',
  consensusLabel: props.consensusLabel,
  disagreementCount: props.disagreementCount,
});
