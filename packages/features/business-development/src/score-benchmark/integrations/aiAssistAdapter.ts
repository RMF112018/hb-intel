import type { IAiAction } from '@hbc/ai-assist';
import type { IScoreGhostOverlayState } from '@hbc/score-benchmark';

export interface IHbiActionProjection {
  action: IAiAction;
  requiresCitation: true;
  requiresApproval: true;
}

export const projectInlineHbiActions = (
  overlay: IScoreGhostOverlayState
): IHbiActionProjection[] => {
  const action: IAiAction = {
    actionKey: 'score-benchmark.no-bid-rationale-draft',
    label: 'Draft HBI No-Bid Rationale',
    description: 'Generate a governed no-bid rationale draft with citation and approval requirements.',
    modelKey: 'hbi-governed-reasoning',
    buildPrompt: () => ({
      systemInstruction: 'Produce a concise no-bid rationale with explicit citation placeholders.',
      userPrompt: `Prepare rationale for recommendation: ${overlay.recommendation.state}`,
      contextData: {
        snapshotId: overlay.version.snapshotId,
        citationRequired: true,
        approvalRequired: true,
      },
      modelKey: 'hbi-governed-reasoning',
      temperature: 0,
    }),
    parseResponse: (rawResponse) => ({
      outputType: 'text',
      text: rawResponse,
      confidenceDetails: {
        confidenceScore: 0.75,
        confidenceBadge: 'medium',
        citedSources: [],
        modelDeploymentName: 'hbi-governed-reasoning',
        modelDeploymentVersion: 'v1',
      },
    }),
  };

  return [
    {
      action,
      requiresCitation: true,
      requiresApproval: true,
    },
  ];
};
