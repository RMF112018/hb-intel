export interface IScheduleActivity {
  id: number;
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  percentComplete: number;
  isCriticalPath: boolean;
}

export interface IScheduleMetrics {
  projectId: string;
  totalActivities: number;
  completedActivities: number;
  criticalPathVariance: number;
  overallPercentComplete: number;
}
