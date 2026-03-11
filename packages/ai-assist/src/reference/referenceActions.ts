/**
 * @hbc/ai-assist — Reference action definitions (SF15-T07)
 *
 * Six IAiAction objects representing Phase 7 AI actions as production-ready
 * reference implementations with real buildPrompt and parseResponse logic.
 */

import type { IAiAction, IAiPromptPayload, IAiActionResult, IAiConfidenceDetails } from '../types/index.js';
import type { ComplexityTier } from '@hbc/complexity';

function buildConfidenceDetails(
  score: number,
  badge: 'high' | 'medium' | 'low',
  modelName: string,
  modelVersion: string,
): IAiConfidenceDetails {
  return {
    confidenceScore: score,
    confidenceBadge: badge,
    citedSources: [],
    modelDeploymentName: modelName,
    modelDeploymentVersion: modelVersion,
  };
}

function safeParse(rawResponse: string, outputType: 'text' | 'bullet-list' | 'structured-object', modelName: string, modelVersion: string): IAiActionResult {
  try {
    const parsed = JSON.parse(rawResponse) as Record<string, unknown>;
    const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.85;
    const badge = confidence >= 0.8 ? 'high' : confidence >= 0.5 ? 'medium' : 'low';

    if (outputType === 'text') {
      return {
        outputType: 'text',
        text: typeof parsed.text === 'string' ? parsed.text : String(parsed.text ?? ''),
        confidenceDetails: buildConfidenceDetails(confidence, badge, modelName, modelVersion),
      };
    }

    if (outputType === 'bullet-list') {
      return {
        outputType: 'bullet-list',
        items: Array.isArray(parsed.items) ? (parsed.items as string[]) : [],
        confidenceDetails: buildConfidenceDetails(confidence, badge, modelName, modelVersion),
      };
    }

    return {
      outputType: 'structured-object',
      data: typeof parsed.data === 'object' && parsed.data !== null ? (parsed.data as Record<string, unknown>) : {},
      confidenceDetails: buildConfidenceDetails(confidence, badge, modelName, modelVersion),
    };
  } catch {
    return {
      outputType,
      text: outputType === 'text' ? rawResponse : undefined,
      confidenceDetails: buildConfidenceDetails(0.3, 'low', modelName, modelVersion),
    };
  }
}

function createAction(config: {
  actionKey: string;
  label: string;
  description: string;
  outputType: 'text' | 'bullet-list' | 'structured-object';
  modelKey: string;
  recordType: string;
  basePriorityScore: number;
  minComplexity: ComplexityTier;
  allowedRoles: readonly string[];
  systemInstruction: string;
  temperature: number;
}): { recordType: string; action: IAiAction } {
  const modelName = config.modelKey === 'gpt-4o' ? 'gpt-4o-2024' : 'gpt-4o-mini-2024';
  const modelVersion = config.modelKey === 'gpt-4o' ? '2024-05-13' : '2024-07-18';
  const maxTokens = config.modelKey === 'gpt-4o' ? 4096 : 2048;

  const action: IAiAction = {
    actionKey: config.actionKey,
    label: config.label,
    description: config.description,
    modelKey: config.modelKey,
    basePriorityScore: config.basePriorityScore,
    minComplexity: config.minComplexity,
    allowedRoles: config.allowedRoles,
    buildPrompt(record: unknown): IAiPromptPayload {
      return {
        systemInstruction: config.systemInstruction,
        userPrompt: `Analyze the following record and ${config.description.toLowerCase()}:\n${JSON.stringify(record)}`,
        modelKey: config.modelKey,
        maxTokens,
        temperature: config.temperature,
      };
    },
    parseResponse(rawResponse: string): IAiActionResult {
      return safeParse(rawResponse, config.outputType, modelName, modelVersion);
    },
  };

  return { recordType: config.recordType, action };
}

const summarizeScorecard = createAction({
  actionKey: 'summarize-scorecard',
  label: 'Summarize Scorecard',
  description: 'Generate an executive summary of the scorecard',
  outputType: 'text',
  modelKey: 'gpt-4o',
  recordType: 'scorecard',
  basePriorityScore: 90,
  minComplexity: 'essential',
  allowedRoles: ['estimator', 'project-manager', 'executive', 'admin'],
  systemInstruction: 'You are an expert construction estimating assistant. Summarize the scorecard concisely.',
  temperature: 0.3,
});

const riskAssessment = createAction({
  actionKey: 'risk-assessment',
  label: 'Risk Assessment',
  description: 'Identify and assess risks for the opportunity',
  outputType: 'bullet-list',
  modelKey: 'gpt-4o',
  recordType: 'opportunity',
  basePriorityScore: 85,
  minComplexity: 'standard',
  allowedRoles: ['estimator', 'project-manager', 'executive', 'admin'],
  systemInstruction: 'You are a risk analyst for construction opportunities. Identify key risks as bullet points.',
  temperature: 0.4,
});

const draftLearningLoop = createAction({
  actionKey: 'draft-learning-loop',
  label: 'Draft Learning Loop',
  description: 'Draft a learning loop reflection for the scorecard',
  outputType: 'text',
  modelKey: 'gpt-4o-mini',
  recordType: 'scorecard',
  basePriorityScore: 70,
  minComplexity: 'standard',
  allowedRoles: ['project-manager', 'executive', 'admin'],
  systemInstruction: 'You are a project learning facilitator. Draft a learning loop reflection.',
  temperature: 0.5,
});

const constraintAnalysis = createAction({
  actionKey: 'constraint-analysis',
  label: 'Constraint Analysis',
  description: 'Analyze constraints for the opportunity',
  outputType: 'bullet-list',
  modelKey: 'gpt-4o',
  recordType: 'opportunity',
  basePriorityScore: 80,
  minComplexity: 'standard',
  allowedRoles: ['estimator', 'project-manager', 'admin'],
  systemInstruction: 'You are a constraint analyst. Identify key constraints and limitations.',
  temperature: 0.3,
});

const generateContextNotes = createAction({
  actionKey: 'generate-context-notes',
  label: 'Generate Context Notes',
  description: 'Generate context handoff notes for the record',
  outputType: 'text',
  modelKey: 'gpt-4o-mini',
  recordType: '*',
  basePriorityScore: 75,
  minComplexity: 'essential',
  allowedRoles: ['estimator', 'project-manager', 'admin'],
  systemInstruction: 'You are a project context specialist. Generate concise handoff notes.',
  temperature: 0.4,
});

const intelligenceContribution = createAction({
  actionKey: 'intelligence-contribution',
  label: 'Intelligence Contribution',
  description: 'Generate strategic intelligence contribution from the opportunity',
  outputType: 'structured-object',
  modelKey: 'gpt-4o',
  recordType: 'opportunity',
  basePriorityScore: 65,
  minComplexity: 'expert',
  allowedRoles: ['executive', 'admin'],
  systemInstruction: 'You are a strategic intelligence analyst. Generate structured market intelligence.',
  temperature: 0.2,
});

export const REFERENCE_ACTIONS: readonly IAiAction[] = [
  summarizeScorecard.action,
  riskAssessment.action,
  draftLearningLoop.action,
  constraintAnalysis.action,
  generateContextNotes.action,
  intelligenceContribution.action,
];

export const REFERENCE_ACTION_BINDINGS: readonly { recordType: string; action: IAiAction }[] = [
  summarizeScorecard,
  riskAssessment,
  draftLearningLoop,
  constraintAnalysis,
  generateContextNotes,
  intelligenceContribution,
];
