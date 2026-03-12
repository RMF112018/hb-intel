export const createStrategicIntelligenceStateQueryKey = (
  projectId: string,
  visibilityContext: string
): readonly ['strategic-intelligence', string, string] => [
  'strategic-intelligence',
  projectId,
  visibilityContext,
];

export const createStrategicIntelligenceApprovalQueueQueryKey = (
  projectId: string
): readonly ['strategic-intelligence', 'approval-queue', string] => [
  'strategic-intelligence',
  'approval-queue',
  projectId,
];

export const createStrategicIntelligenceFeedQueryKey = (
  projectId: string
): readonly ['strategic-intelligence', 'feed', string] => [
  'strategic-intelligence',
  'feed',
  projectId,
];

export const createStrategicIntelligenceCanvasProjectionQueryKey = (
  projectId: string
): readonly ['strategic-intelligence', 'canvas', string] => [
  'strategic-intelligence',
  'canvas',
  projectId,
];
