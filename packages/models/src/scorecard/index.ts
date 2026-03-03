export interface IGoNoGoScorecard {
  id: number;
  projectId: string;
  version: number;
  overallScore: number;
  recommendation: string;
  createdAt: string;
  updatedAt: string;
}

export interface IScorecardVersion {
  id: number;
  scorecardId: number;
  version: number;
  snapshot: Record<string, unknown>;
  createdAt: string;
}
