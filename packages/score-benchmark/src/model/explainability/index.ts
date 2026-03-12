import type { ExplainabilityAssessment } from '../../types/index.js';

export interface ExplainabilityInput {
  reasonCodes: readonly string[];
}

export const buildExplainability = (input: ExplainabilityInput): ExplainabilityAssessment => ({
  summary:
    input.reasonCodes.length > 0
      ? `Benchmark explanation includes ${input.reasonCodes.length} reason code(s).`
      : 'Benchmark explanation has no reason codes yet.',
  reasonCodes: input.reasonCodes,
});
