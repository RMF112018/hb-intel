/**
 * P3-E8-T06 JHA, pre-task, toolbox prompt constants.
 */

import type { PromptClosureType } from './enums.js';
import type { IToolboxWorkQueueTrigger } from './types.js';

// -- Enum Arrays ------------------------------------------------------------

export const PROMPT_CLOSURE_TYPES = [
  'STANDARD', 'HIGH_RISK', 'CRITICAL',
] as const satisfies ReadonlyArray<PromptClosureType>;

// -- Schedule Integration (§6) -----------------------------------------------

export const SCHEDULE_LOOKAHEAD_DAYS = 14;

// -- Prompt Closure Thresholds (§4.3, §5.5) ---------------------------------

export const HIGH_RISK_PROMPT_CLOSURE_DAYS = 7;
export const GOVERNED_TALK_DRAFT_ESCALATION_DAYS = 3;

// -- Work Queue Triggers (§5.5) ---------------------------------------------

export const TOOLBOX_WORK_QUEUE_TRIGGERS: ReadonlyArray<IToolboxWorkQueueTrigger> = [
  {
    trigger: 'Current week has no toolbox talk record',
    workQueueItem: 'Conduct weekly toolbox talk',
    priority: 'MEDIUM',
    assignee: 'Safety Manager',
  },
  {
    trigger: 'Issued high-risk prompt not closed within 7 days',
    workQueueItem: 'Complete toolbox prompt closure',
    priority: 'HIGH',
    assignee: 'Safety Manager',
  },
  {
    trigger: 'Governed high-risk talk in DRAFT > 3 days',
    workQueueItem: 'Complete toolbox talk record',
    priority: 'MEDIUM',
    assignee: 'Safety Manager',
  },
];

// -- Label Maps -------------------------------------------------------------

export const PROMPT_CLOSURE_TYPE_LABELS: Readonly<Record<PromptClosureType, string>> = {
  STANDARD: 'Standard — weekly talk completion only',
  HIGH_RISK: 'High Risk — named attendees + proof element required',
  CRITICAL: 'Critical — all high-risk requirements + Safety Manager verification',
};
