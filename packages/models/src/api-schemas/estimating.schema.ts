import { z } from 'zod';
import { EstimatingStatus } from '../estimating/index.js';
import type { IEstimatingTracker, IEstimatingKickoff } from '../estimating/index.js';

export const EstimatingTrackerSchema = z.object({
  id: z.number(),
  projectId: z.string(),
  bidNumber: z.string(),
  status: z.string(),
  dueDate: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const EstimatingKickoffSchema = z.object({
  id: z.number(),
  projectId: z.string(),
  kickoffDate: z.string(),
  attendees: z.array(z.string()),
  notes: z.string(),
  createdAt: z.string(),
});

type Tracker = z.infer<typeof EstimatingTrackerSchema>;
type _TrackerCheck = IEstimatingTracker extends Tracker ? (Tracker extends IEstimatingTracker ? true : never) : never;

type Kickoff = z.infer<typeof EstimatingKickoffSchema>;
type _KickoffCheck = IEstimatingKickoff extends Kickoff ? (Kickoff extends IEstimatingKickoff ? true : never) : never;
