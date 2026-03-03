export interface IEstimatingTracker {
  id: number;
  projectId: string;
  bidNumber: string;
  status: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface IEstimatingKickoff {
  id: number;
  projectId: string;
  kickoffDate: string;
  attendees: string[];
  notes: string;
  createdAt: string;
}
