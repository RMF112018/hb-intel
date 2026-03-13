export const storybookMatrix = {
  complexityModes: ['Essential', 'Standard', 'Expert'],
  wizardStates: ['resume-collapsed', 'standard-authoring', 'expert-diagnostics'],
  summaryStates: ['high-confidence', 'blocked-publication'],
  listStates: ['needs-corroboration', 'stale-superseded-conflict', 'ready-to-publish'],
  dashboardStates: ['baseline-kpis', 'repeat-pattern-reinsertion', 'expert-comparator'],
  inlineAiStates: ['citation-required', 'citation-ready'],
  disagreementStates: ['none', 'open', 'escalated'],
} as const;

export default {
  title: 'Features/BusinessDevelopment/PostBidLearning/Matrix',
};
