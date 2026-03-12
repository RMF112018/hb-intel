export interface BenchmarkExplainabilityPanelProps {
  summary: string;
  reasonCodes: readonly string[];
}

export interface BenchmarkExplainabilityPanelModel {
  panel: 'benchmark-explainability';
  summary: string;
  reasonCodes: readonly string[];
}

export const BenchmarkExplainabilityPanel = (
  props: BenchmarkExplainabilityPanelProps
): BenchmarkExplainabilityPanelModel => ({
  panel: 'benchmark-explainability',
  summary: props.summary,
  reasonCodes: props.reasonCodes,
});
