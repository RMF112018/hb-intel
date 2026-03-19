import { z } from 'zod';
import type { IGoNoGoScorecard, IScorecardVersion } from '../scorecard/index.js';

export const GoNoGoScorecardSchema = z.object({
  id: z.number(),
  projectId: z.string(),
  version: z.number(),
  overallScore: z.number(),
  recommendation: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ScorecardVersionSchema = z.object({
  id: z.number(),
  scorecardId: z.number(),
  version: z.number(),
  snapshot: z.record(z.unknown()),
  createdAt: z.string(),
});

type Scorecard = z.infer<typeof GoNoGoScorecardSchema>;
type _ScorecardCheck = IGoNoGoScorecard extends Scorecard ? (Scorecard extends IGoNoGoScorecard ? true : never) : never;

type Version = z.infer<typeof ScorecardVersionSchema>;
type _VersionCheck = IScorecardVersion extends Version ? (Version extends IScorecardVersion ? true : never) : never;
