/**
 * W0-G3-T06: Coaching prompt registry for project setup.
 *
 * All coaching prompts target Essential tier only (maxTier: 'essential').
 * They are hidden when the user elevates to Standard or Expert tier.
 * Surfaces render these prompts inside HbcComplexityGate with maxTier="essential".
 *
 * Traceability: docs/architecture/plans/MVP/G3/W0-G3-T06-Summary-View-Expandable-History-and-Complexity-Rules.md
 */

export interface ICoachingPrompt {
  readonly promptId: string;
  readonly context: string;
  readonly text: string;
  readonly maxTier: 'essential';
}

export const PROJECT_SETUP_COACHING_PROMPTS: readonly ICoachingPrompt[] = [
  {
    promptId: 'setup-step1-tip',
    context: 'Setup form, Step 1',
    text: 'Tip: Fill in as much information as you can — you can always update it later.',
    maxTier: 'essential',
  },
  {
    promptId: 'setup-step2-department',
    context: 'Setup form, Step 2',
    text: 'The department you select determines which document libraries and templates are created for your project.',
    maxTier: 'essential',
  },
  {
    promptId: 'setup-step3-lead',
    context: 'Setup form, Step 3',
    text: 'Your project lead will be added to the Project Leaders group and will have full control of the site.',
    maxTier: 'essential',
  },
  {
    promptId: 'status-provisioning',
    context: 'Status view, Provisioning state',
    text: "Your site is being set up. This typically takes a few minutes. You'll receive an email when it's ready.",
    maxTier: 'essential',
  },
] as const;

/** Look up a coaching prompt by ID. */
export function getCoachingPrompt(promptId: string): ICoachingPrompt | undefined {
  return PROJECT_SETUP_COACHING_PROMPTS.find((p) => p.promptId === promptId);
}
