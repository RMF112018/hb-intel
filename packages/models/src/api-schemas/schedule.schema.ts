import { z } from 'zod';
import type { IScheduleActivity, IScheduleMetrics } from '../schedule/index.js';

export const ScheduleActivitySchema = z.object({
  id: z.number(),
  projectId: z.string(),
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  percentComplete: z.number(),
  isCriticalPath: z.boolean(),
});

export const ScheduleMetricsSchema = z.object({
  projectId: z.string(),
  totalActivities: z.number(),
  completedActivities: z.number(),
  criticalPathVariance: z.number(),
  overallPercentComplete: z.number(),
});

type Activity = z.infer<typeof ScheduleActivitySchema>;
type _ActivityCheck = IScheduleActivity extends Activity ? (Activity extends IScheduleActivity ? true : never) : never;

type Metrics = z.infer<typeof ScheduleMetricsSchema>;
type _MetricsCheck = IScheduleMetrics extends Metrics ? (Metrics extends IScheduleMetrics ? true : never) : never;
