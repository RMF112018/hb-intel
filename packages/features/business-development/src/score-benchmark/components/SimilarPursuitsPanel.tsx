export interface SimilarPursuitsPanelProps {
  similarPursuitCount: number;
  similarityBand: string;
}

export interface SimilarPursuitsPanelModel {
  panel: 'similar-pursuits';
  summary: string;
}

export const SimilarPursuitsPanel = (
  props: SimilarPursuitsPanelProps
): SimilarPursuitsPanelModel => ({
  panel: 'similar-pursuits',
  summary: `Comparable pursuits: ${props.similarPursuitCount}; similarity band: ${props.similarityBand}`,
});
