import type { PccCardSpanOverrides } from '../../layout/footprints';

export type PccProjectHomeTailCardKey =
  | 'lifecycleTimeline'
  | 'procoreSnapshot'
  | 'askHbiGrounding'
  | 'projectMemory'
  | 'relatedRecords'
  | 'projectLens';

export const PROJECT_HOME_TAIL_CARD_TITLES: Readonly<Record<PccProjectHomeTailCardKey, string>> = {
  lifecycleTimeline: 'Lifecycle Timeline',
  procoreSnapshot: 'Procore snapshot',
  askHbiGrounding: 'Ask HBI — Grounded Project Answers',
  projectMemory: 'Project Memory',
  relatedRecords: 'Related Records',
  projectLens: 'Project Lens',
};

export const PROJECT_HOME_TAIL_CARD_KEYS_IN_ORDER: readonly PccProjectHomeTailCardKey[] = [
  'lifecycleTimeline',
  'procoreSnapshot',
  'askHbiGrounding',
  'projectMemory',
  'relatedRecords',
  'projectLens',
] as const;

const projectHomeTailSpan = (
  twelveColumnSpan: number,
  standardLaptopSpan: number,
): PccCardSpanOverrides => ({
  largeLaptop: twelveColumnSpan,
  desktop: twelveColumnSpan,
  ultrawide: twelveColumnSpan,
  standardLaptop: standardLaptopSpan,
});

export const PROJECT_HOME_TAIL_SPAN_OVERRIDES: Readonly<
  Record<PccProjectHomeTailCardKey, PccCardSpanOverrides>
> = {
  lifecycleTimeline: projectHomeTailSpan(8, 7),
  procoreSnapshot: projectHomeTailSpan(4, 3),
  askHbiGrounding: projectHomeTailSpan(8, 7),
  projectMemory: projectHomeTailSpan(4, 3),
  relatedRecords: projectHomeTailSpan(8, 7),
  projectLens: projectHomeTailSpan(4, 3),
};
